from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..services.stock_services import *
from ..serializers import *
from django.utils import timezone
from ..services.alpha_vantage_service import AlphaVantageService

@api_view(['GET'])
def get_real_stocks_data(request):
    """Obtener datos reales de Alpha Vantage para múltiples stocks"""
    symbols_param = request.query_params.get('symbols', '')
    
    if symbols_param:
        symbols = symbols_param.split(',')
    else:
        # Stocks por defecto basados en tu frontend
        symbols = ['NIO', 'BP', 'PEN', 'MPWR']
    
    stocks_data = get_multiple_stocks_real_data(symbols)
    return Response(stocks_data)

@api_view(['GET'])
def get_stock_real_time_detail(request, symbol):
    """Obtener datos en tiempo real de un stock específico"""
    stock_data = get_real_time_stock_data(symbol)
    
    if 'error' in stock_data:
        return Response({"error": stock_data['error']}, status=400)
    
    return Response(stock_data)

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