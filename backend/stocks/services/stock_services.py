from ..models import *
from .alpha_vantage_service import AlphaVantageService

# GET
# Data filtering functions

def get_all_active_stocks(is_active=True):
    return (
            Stock.objects
            .filter(is_active=is_active)
        )

def get_stock_by_name(name):
    try:
        return (
            Stock.objects
            .get(name=name)
        ) 
    except Stock.DoesNotExist:
        return None

# By Category
def get_stocks_by_category(category_name):
    return (
        Stock.objects
        .filter(category__name=category_name, is_active=True)
    )

# By Price Range
def get_stocks_by_price_range(min_price, max_price):
    return (
        Stock.objects
        .filter(last_price__gte=min_price, last_price__lte=max_price)
    )

# NUEVAS FUNCIONES PARA ALPHA VANTAGE
def get_real_time_stock_data(symbol):
    """Obtener datos en tiempo real de Alpha Vantage"""
    av_service = AlphaVantageService()
    return av_service.get_stock_quote(symbol)

def get_stock_with_real_data(symbol):
    """Obtener datos combinados: BD + Alpha Vantage"""
    try:
        stock = Stock.objects.get(symbol=symbol)
        real_data = get_real_time_stock_data(symbol)
        
        # Actualizar el stock con datos reales si están disponibles
        if 'error' not in real_data:
            stock.last_price = real_data['price']
            stock.variation = real_data['change_percent']
            stock.updated_at = timezone.now()
            stock.save()
        
        return stock
    except Stock.DoesNotExist:
        return None

def get_multiple_stocks_real_data(symbols):
    """Obtener datos reales para múltiples stocks"""
    av_service = AlphaVantageService()
    results = []
    
    for symbol in symbols:
        # Datos en tiempo real
        real_time_data = av_service.get_stock_quote(symbol)
        
        # Datos históricos (últimos 30 días)
        historical_data = av_service.get_historical_data(symbol, days=30)
        
        # Buscar el stock en la base de datos para obtener nombre y categoría
        try:
            db_stock = Stock.objects.get(symbol=symbol)
            name = db_stock.name
            category_name = db_stock.category.name if db_stock.category else "Unknown"
        except Stock.DoesNotExist:
            name = symbol
            category_name = "Unknown"
        
        # Determinar recomendación basada en el cambio porcentual
        if 'error' not in real_time_data:
            change_pct = real_time_data['change_percent']
            if change_pct > 5:
                recommendation = 'STRONG BUY'
            elif change_pct > 2:
                recommendation = 'BUY'
            elif change_pct > -2:
                recommendation = 'HOLD'
            elif change_pct > -5:
                recommendation = 'SELL'
            else:
                recommendation = 'STRONG SELL'
            
            # Calcular precio objetivo (simulado - en un caso real usarías análisis más complejo)
            target_price = real_time_data['price'] * (1 + change_pct/100 * 2)
            
            results.append({
                'symbol': symbol,
                'name': name,
                'currentPrice': real_time_data['price'],
                'changePct': real_time_data['change_percent'],
                'last30d': historical_data,
                'targetPrice': round(target_price, 2),
                'recommendation': recommendation,
                'category': category_name
            })
    
    return results

def search_stocks_by_keyword(keywords):
    """Buscar stocks usando Alpha Vantage"""
    av_service = AlphaVantageService()
    search_results = av_service.get_stock_search(keywords)
    
    formatted_results = []
    for result in search_results:
        formatted_results.append({
            'symbol': result['1. symbol'],
            'name': result['2. name'],
            'type': result['3. type'],
            'region': result['4. region']
        })
    
    return formatted_results