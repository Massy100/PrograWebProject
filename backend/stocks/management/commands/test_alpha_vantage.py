from django.core.management.base import BaseCommand
from your_app.services.alpha_vantage_service import AlphaVantageService

class Command(BaseCommand):
    help = 'Test Alpha Vantage API connection'

    def add_arguments(self, parser):
        parser.add_argument('--symbol', type=str, default='AAPL', help='Stock symbol to test')
        parser.add_argument('--days', type=int, default=5, help='Days of historical data')

    def handle(self, *args, **options):
        symbol = options['symbol']
        days = options['days']
        
        service = AlphaVantageService()
        
        self.stdout.write(f"=== Testing Alpha Vantage API ===")
        self.stdout.write(f"Symbol: {symbol}")
        self.stdout.write(f"API Key: {service.api_key[:10]}...\n")
        
        # Test real-time quote
        self.stdout.write("1. Testing real-time quote...")
        quote = service.get_stock_quote(symbol)
        if 'error' in quote:
            self.stdout.write(self.style.ERROR(f"❌ Error: {quote['error']}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"✅ Success: {quote}"))
        
        # Test historical data
        self.stdout.write("\n2. Testing historical data...")
        historical = service.get_historical_data(symbol, days=days)
        if historical:
            self.stdout.write(self.style.SUCCESS(f"✅ Success: {len(historical)} days of data"))
            self.stdout.write(f"   Sample: {historical[:3]}...")
        else:
            self.stdout.write(self.style.ERROR("❌ No historical data"))
        
        # Test search
        self.stdout.write("\n3. Testing stock search...")
        search = service.get_stock_search(symbol)
        if search:
            self.stdout.write(self.style.SUCCESS(f"✅ Success: {len(search)} results"))
            for item in search[:2]:
                self.stdout.write(f"   - {item['1. symbol']}: {item['2. name']}")
        else:
            self.stdout.write(self.style.ERROR("❌ No search results"))