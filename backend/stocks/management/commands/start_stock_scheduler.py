from django.core.management.base import BaseCommand
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from django_apscheduler.jobstores import DjangoJobStore
from stocks.services.scheduled_tasks import update_all_stock_prices  
import time

class Command(BaseCommand):
    help = 'Starts the scheduler for automatic stock price updates'
    
    def handle(self, *args, **options):
        scheduler = BackgroundScheduler()
        scheduler.add_jobstore(DjangoJobStore(), "default")
        
        # Use the serializable function
        scheduler.add_job(
            update_all_stock_prices, 
            trigger=IntervalTrigger(minutes=5),
            id="stock_price_update",
            max_instances=1,
            replace_existing=True,
        )
        
        try:
            scheduler.start()
            self.stdout.write(
                self.style.SUCCESS('Stock price scheduler started successfully!')
            )
            self.stdout.write('Stocks will update automatically every 5 minutes')
            
            # Keep running
            while True:
                time.sleep(1)
                
        except (KeyboardInterrupt, SystemExit):
            self.stdout.write('\nStopping scheduler...')
            scheduler.shutdown()
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Scheduler error: {e}')
            )
            scheduler.shutdown()