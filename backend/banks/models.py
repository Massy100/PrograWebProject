from django.db import models

# Create your models here.

class Bank(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    established_date = models.DateField()

    def __str__(self):
        return self.name
    
class FundsTransfer(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    bank = models.ForeignKey(Bank, related_name='bank', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    transfer_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Transfer of {self.amount} from {self.bank} to {self.user} on {self.transfer_date}'