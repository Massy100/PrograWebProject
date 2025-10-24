from django.utils import timezone
from ..models import Stock, StockPrice
import time

def update_all_stock_prices():
    """
    Simple task function that can be serialized for scheduling
    """
    try:
        # Import inside function
        from .alpha_vantage_service import AlphaVantageService
        
        print(f"📈 Starting scheduled stock update - {timezone.now()}")
        
        stocks = Stock.objects.filter(is_active=True)
        if not stocks.exists():
            print("⚠️ No stocks to update")
            return 0
        
        service = AlphaVantageService()
        updated = 0
        
        for stock in stocks:
            try:
                data = service.get_stock_quote(stock.symbol)
                
                if data and 'error' not in data:
                    stock.last_price = data.get('price', stock.last_price)
                    stock.variation = data.get('change_percent', stock.variation)
                    stock.updated_at = timezone.now()
                    stock.save()
                    
                    StockPrice.objects.create(stock=stock, price=data.get('price'))
                    updated += 1
                    print(f"✅ {stock.symbol}: ${data.get('price')}")
                
                time.sleep(12)  # Rate limiting
                
            except Exception as e:
                print(f"❌ Failed {stock.symbol}: {e}")
                continue
        
        print(f"🎉 Updated {updated}/{len(stocks)} stocks")
        return updated
        
    except Exception as e:
        print(f"💥 Scheduled task failed: {e}")
        return 0