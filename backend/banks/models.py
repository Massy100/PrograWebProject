from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from users.models import User

# Create your models here.

class Bank(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    established_date = models.DateField()

    def __str__(self):
        return self.name
    
class FundsTransfer(models.Model):
    reference_code = models.CharField(max_length=50, unique=True, default='undefined')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    bank = models.ForeignKey(Bank, related_name='bank', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    transfer_date = models.DateTimeField(auto_now_add=True)

    @receiver(post_save, sender='banks.FundsTransfer')
    def update_user_balance(sender, instance, created, **kwargs):
        if created:
            user = instance.user
            if hasattr(user, 'client_profile'):
                user.client_profile.balance_available += instance.amount
                user.client_profile.save()

    def __str__(self):
        return f'Transfer of {self.amount} from {self.bank} to {self.user} on {self.transfer_date}'