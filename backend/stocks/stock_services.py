from .models import Stock, StockPrice, Category

# GET
# Data filtering functions

def get_all_active_stocks(is_active=True):
    return Stock.objects.filter(is_active=is_active)

def get_stock_by_symbol(symbol):
    try:
        return Stock.objects.get(symbol=symbol)
    except Stock.DoesNotExist:
        return None

def get_stock_by_name(name):
    try:
        return Stock.objects.get(name=name)
    except Stock.DoesNotExist:
        return None

# By Category
def get_stocks_by_category(category_name):
    return Stock.objects.filter(category__name=category_name)

# By Price Range
def get_stocks_by_price_range(min_price, max_price):
    return Stock.objects.filter(last_price__gte=min_price, last_price__lte=max_price)
