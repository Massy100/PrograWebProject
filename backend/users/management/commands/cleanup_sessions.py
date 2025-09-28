from django.core.management.base import BaseCommand
from django.contrib.sessions.models import Session
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Cleanup expired sessions older than 7 days'

    def handle(self, *args, **options):
        expired = Session.objects.filter(
            expire_date__lt=timezone.now() - timedelta(days=7)
        )
        count = expired.count()
        expired.delete()
        
        self.stdout.write(
            self.style.SUCCESS(f'{count} expired sessions deleted.')
        )