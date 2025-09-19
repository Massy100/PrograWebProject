from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Investment
from .services import PortfolioService

@receiver(post_save, sender=Investment)
def update_portfolio_on_investment_change(sender, instance, **kwargs):
    if instance.is_active:
        PortfolioService.update_portfolio_values(instance.portfolio)

@receiver(post_delete, sender=Investment)
def update_portfolio_on_investment_delete(sender, instance, **kwargs):
    PortfolioService.update_portfolio_values(instance.portfolio)