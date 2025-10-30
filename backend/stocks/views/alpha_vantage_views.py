from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..services.stock_services import *
from ..serializers import *
from django.utils import timezone
from ..services.alpha_vantage_service import AlphaVantageService

@api_view(['GET'])
def get_real_stocks_data(request):
    """Get real-time stock data directly from Alpha Vantage API"""
    symbols_param = request.query_params.get('symbols', '')
    
    # Definir símbolos por defecto si no se proporcionan
    if symbols_param:
        symbols = [s.strip().upper() for s in symbols_param.split(',')]
    else:
        # Stocks por defecto - ahora desde la API
        symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']
    
    service = AlphaVantageService()
    real_time_data = []
    errors = []
    
    # Obtener datos en tiempo real para cada símbolo
    for symbol in symbols:
        api_data = service.get_stock_quote(symbol)
        
        if 'error' in api_data:
            errors.append({
                'symbol': symbol,
                'error': api_data['error']
            })
        else:
            real_time_data.append({
                'symbol': api_data['symbol'],
                'price': api_data['price'],
                'change': api_data.get('change', 0),
                'change_percent': api_data.get('change_percent', 0),
                'volume': api_data.get('volume', 0),
                'last_updated': api_data.get('last_updated', timezone.now().isoformat())
            })
    
    response_data = {
        'data': real_time_data,
        'last_updated': timezone.now().isoformat(),
        'source': 'alpha_vantage_api',
        'symbols_requested': symbols,
        'errors': errors if errors else None
    }
    
    return Response(response_data)

@api_view(['GET'])
def get_stock_real_time_detail(request, symbol):
    """Get real-time data for specific stock directly from Alpha Vantage API"""
    service = AlphaVantageService()
    api_data = service.get_stock_quote(symbol.upper())
    
    if 'error' in api_data:
        return Response({"error": api_data['error']}, status=400)
    
    # Enriquecer los datos con información adicional
    response_data = {
        'symbol': api_data['symbol'],
        'price': api_data['price'],
        'change': api_data.get('change', 0),
        'change_percent': api_data.get('change_percent', 0),
        'volume': api_data.get('volume', 0),
        'last_updated': api_data.get('last_updated', timezone.now().isoformat()),
        'source': 'alpha_vantage_api',
        'timestamp': timezone.now().isoformat()
    }
    
    return Response(response_data)

@api_view(['GET'])
def search_stocks(request):
    """Buscar stocks usando Alpha Vantage"""
    keywords = request.query_params.get('q', '')
    
    if not keywords:
        return Response({"error": "Query parameter 'q' is required"}, status=400)
    
    service = AlphaVantageService()
    search_results = service.get_stock_search(keywords)
    
    return Response({
        'query': keywords,
        'results': search_results,
        'count': len(search_results),
        'source': 'alpha_vantage_api',
        'timestamp': timezone.now().isoformat()
    })

@api_view(['GET'])
def get_stock_historical_data(request, symbol):
    """Obtener datos históricos de un stock desde Alpha Vantage"""
    days = request.query_params.get('days', 30)
    
    try:
        days = int(days)
        if days <= 0 or days > 1000:
            return Response({"error": "Days must be between 1 and 1000"}, status=400)
    except ValueError:
        return Response({"error": "Days must be a valid number"}, status=400)
    
    service = AlphaVantageService()
    historical_data = service.get_historical_data(symbol.upper(), days=days)
    
    return Response({
        'symbol': symbol.upper(),
        'historical_data': historical_data,
        'days': days,
        'data_points': len(historical_data),
        'source': 'alpha_vantage_api',
        'timestamp': timezone.now().isoformat()
    })

@api_view(['GET'])
def get_multiple_stocks_batch(request):
    """Obtener datos de múltiples stocks en un solo request (con manejo de rate limiting)"""
    symbols_param = request.query_params.get('symbols', '')
    
    if not symbols_param:
        return Response({"error": "Query parameter 'symbols' is required"}, status=400)
    
    symbols = [s.strip().upper() for s in symbols_param.split(',')]
    
    # Limitar a 5 símbolos por request para evitar rate limiting
    if len(symbols) > 5:
        return Response({"error": "Maximum 5 symbols per request allowed"}, status=400)
    
    service = AlphaVantageService()
    results = []
    errors = []
    
    for symbol in symbols:
        api_data = service.get_stock_quote(symbol)
        
        if 'error' in api_data:
            errors.append({
                'symbol': symbol,
                'error': api_data['error']
            })
        else:
            results.append(api_data)
        
        # Pequeña pausa entre requests para ser amable con la API
        time.sleep(1)
    
    return Response({
        'results': results,
        'errors': errors,
        'total_requested': len(symbols),
        'successful': len(results),
        'failed': len(errors),
        'source': 'alpha_vantage_api',
        'timestamp': timezone.now().isoformat()
    })

@api_view(['POST'])
def sync_stock_with_real_data(request):
    """Sincronizar un stock con datos reales de Alpha Vantage (opcional para guardar en BD)"""
    symbol = request.data.get('symbol', '').upper()
    
    if not symbol:
        return Response({"error": "Symbol is required"}, status=400)
    
    service = AlphaVantageService()
    api_data = service.get_stock_quote(symbol)
    
    if 'error' in api_data:
        return Response({"error": api_data['error']}, status=400)
    
    # Opcional: Guardar en base de datos si lo deseas
    save_to_db = request.data.get('save_to_db', False)
    
    if save_to_db:
        try:
            # Aquí puedes agregar lógica para guardar en BD si lo necesitas
            stock, created = Stock.objects.get_or_create(
                symbol=api_data['symbol'],
                defaults={
                    'name': api_data['symbol'],
                    'last_price': api_data['price'],
                    'variation': api_data.get('change_percent', 0),
                    'is_active': True
                }
            )
            
            if not created:
                stock.last_price = api_data['price']
                stock.variation = api_data.get('change_percent', 0)
                stock.save()
            
            api_data['saved_to_database'] = True
            api_data['database_id'] = stock.id
            
        except Exception as e:
            api_data['save_error'] = str(e)
    
    api_data['source'] = 'alpha_vantage_api'
    return Response(api_data)

@api_view(['GET'])
def test_alpha_vantage_connection(request):
    """Endpoint para probar la conexión con Alpha Vantage"""
    symbol = request.query_params.get('symbol', 'AAPL')
    service = AlphaVantageService()
    
    results = {
        'api_key_configured': bool(service.api_key),
        'api_key_preview': service.api_key[:8] + '...' if service.api_key else None,
        'test_symbol': symbol,
        'tests': {},
        'timestamp': timezone.now().isoformat()
    }
    
    # Test 1: Real-time quote
    quote = service.get_stock_quote(symbol)
    results['tests']['real_time_quote'] = {
        'success': 'error' not in quote,
        'data': quote if 'error' not in quote else {'error': quote['error']}
    }
    
    # Test 2: Historical data
    historical = service.get_historical_data(symbol, days=5)
    results['tests']['historical_data'] = {
        'success': bool(historical),
        'data_count': len(historical),
        'sample_data': historical[:3] if historical else []
    }
    
    # Test 3: Search
    search = service.get_stock_search(symbol)
    results['tests']['stock_search'] = {
        'success': bool(search),
        'results_count': len(search),
        'sample_results': search[:2] if search else []
    }
    
    return Response(results)