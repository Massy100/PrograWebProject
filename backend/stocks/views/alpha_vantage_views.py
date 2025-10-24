from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..services.stock_services import *
from ..serializers import *
from django.utils import timezone
from ..services.alpha_vantage_service import AlphaVantageService

@api_view(['GET'])
def get_real_stocks_data(request):
    """Get real stock data from database (fast)"""
    symbols_param = request.query_params.get('symbols', '')
    
    if symbols_param:
        symbols = symbols_param.split(',')
        stocks = Stock.objects.filter(symbol__in=symbols, is_active=True)
    else:
        # Default stocks - now from database
        stocks = Stock.objects.filter(is_active=True)
    
    # Use the serializer with data from database
    serializer = StockSerializer(stocks, many=True)
    
    # Add timestamp to show data freshness
    response_data = {
        'data': serializer.data,
        'last_updated': timezone.now().isoformat(),
        'source': 'database'
    }
    
    return Response(response_data)

@api_view(['GET'])
def get_stock_real_time_detail(request, symbol):
    """Get real-time data for specific stock from database"""
    try:
        stock = Stock.objects.get(symbol=symbol, is_active=True)
        serializer = StockSerializer(stock)
        
        response_data = {
            'symbol': stock.symbol,
            'price': stock.last_price,
            'change_percent': stock.variation,
            'last_updated': stock.updated_at.isoformat() if stock.updated_at else None,
            'source': 'database'
        }
        
        return Response(response_data)
        
    except Stock.DoesNotExist:
        # Fallback to API if stock not in database
        from ..services.alpha_vantage_service import AlphaVantageService
        service = AlphaVantageService()
        api_data = service.get_stock_quote(symbol)
        
        if 'error' in api_data:
            return Response({"error": api_data['error']}, status=400)
        
        api_data['source'] = 'api'
        return Response(api_data)

@api_view(['GET'])
def search_stocks(request):
    """Buscar stocks usando Alpha Vantage"""
    keywords = request.query_params.get('q', '')
    
    if not keywords:
        return Response({"error": "Query parameter 'q' is required"}, status=400)
    
    search_results = search_stocks_by_keyword(keywords)
    return Response(search_results)

@api_view(['POST'])
def sync_stock_with_real_data(request):
    """Sincronizar un stock de la BD con datos reales de Alpha Vantage"""
    symbol = request.data.get('symbol')
    
    if not symbol:
        return Response({"error": "Symbol is required"}, status=400)
    
    stock = get_stock_with_real_data(symbol)
    
    if stock:
        serializer = StockSerializer(stock)
        return Response(serializer.data)
    else:
        return Response({"error": "Stock not found in database"}, status=404)
    
@api_view(['GET'])
def test_alpha_vantage_connection(request):
    """Endpoint para probar la conexión con Alpha Vantage"""
    from ..services.alpha_vantage_service import AlphaVantageService
    
    symbol = request.query_params.get('symbol', 'AAPL')
    service = AlphaVantageService()
    
    results = {
        'api_key_configurated': bool(service.api_key),
        'api_key_preview': service.api_key[:10] + '...' if service.api_key else None,
        'test_symbol': symbol,
        'tests': {}
    }
    
    # Test 1: Real-time quote
    quote = service.get_stock_quote(symbol)
    results['tests']['real_time_quote'] = {
        'success': 'error' not in quote,
        'data': quote if 'error' not in quote else {'error': quote['error']},
        'timestamp': timezone.now().isoformat()
    }
    
    # Test 2: Historical data
    historical = service.get_historical_data(symbol, days=5)
    results['tests']['historical_data'] = {
        'success': bool(historical),
        'data_count': len(historical),
        'sample_data': historical[:3] if historical else [],
        'timestamp': timezone.now().isoformat()
    }
    
    # Test 3: Search
    search = service.get_stock_search(symbol)
    results['tests']['stock_search'] = {
        'success': bool(search),
        'results_count': len(search),
        'sample_results': search[:2] if search else [],
        'timestamp': timezone.now().isoformat()
    }
    
    return Response(results)