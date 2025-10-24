from django.core.management.base import BaseCommand
from stocks.services.auto_update_service import auto_update_stock_prices

class Command(BaseCommand):
    help = 'Manually update all stock prices immediately'
    
    def handle(self, *args, **options):
        self.stdout.write('Starting manual stock price update...')
        
        updated_count = auto_update_stock_prices()
        
        if updated_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated {updated_count} stocks')
            )
        else:
            self.stdout.write(
                self.style.WARNING('No stocks were updated')
            )