from django.utils import timezone
from ..models import Stock, StockPrice
import time

def auto_update_stock_prices():
    """
    Automatic function to update stock prices every 5 minutes
    This function must be serializable (no complex objects in closure)
    """
    print(f"Starting automatic stock update - {timezone.now()}")
    
    # Import inside function to avoid serialization issues
    from .alpha_vantage_service import AlphaVantageService
    
    # Get all active stocks
    stocks = Stock.objects.filter(is_active=True)
    symbols = [stock.symbol for stock in stocks]
    
    if not symbols:
        print("No active stocks found")
        return 0
    
    service = AlphaVantageService()
    updated_count = 0
    
    for symbol in symbols:
        try:
            # Get real-time data from Alpha Vantage
            stock_data = service.get_stock_quote(symbol)
            
            if stock_data and 'error' not in stock_data:
                # Find stock in database
                stock = Stock.objects.get(symbol=symbol)
                
                # Update stock information
                stock.last_price = stock_data.get('price')
                stock.variation = stock_data.get('change_percent')
                stock.updated_at = timezone.now()
                stock.save()
                
                # Save to price history
                StockPrice.objects.create(
                    stock=stock,
                    price=stock_data.get('price')
                )
                
                updated_count += 1
                print(f"Updated {symbol}: ${stock_data.get('price')}")
            
            # Wait between API calls to respect rate limits
            time.sleep(12)
            
        except Stock.DoesNotExist:
            print(f"Stock {symbol} not found in database")
        except Exception as e:
            print(f"Error updating {symbol}: {e}")
    
    print(f"Update completed: {updated_count}/{len(symbols)} stocks updated")
    return updated_count