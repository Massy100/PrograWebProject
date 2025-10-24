from django.core.cache import cache
from .alpha_vantage_service import AlphaVantageService

def get_cached_stock_data(symbol, cache_minutes=5):
    """
    Get stock data from cache or API
    Returns cached data if available, otherwise calls API
    """
    cache_key = f"stock_{symbol}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return cached_data
    
    # If not in cache, get from API
    service = AlphaVantageService()
    real_data = service.get_stock_quote(symbol)
    
    if 'error' not in real_data:
        # Cache for specified minutes
        cache.set(cache_key, real_data, 60 * cache_minutes)
    
    return real_data

def clear_stock_cache(symbol=None):
    """
    Clear cache for specific stock or all stocks
    """
    if symbol:
        cache_key = f"stock_{symbol}"
        cache.delete(cache_key)
    else:
        # Simple approach - in production you might want more sophisticated cache clearing
        print("Cache clearing would be implemented here")