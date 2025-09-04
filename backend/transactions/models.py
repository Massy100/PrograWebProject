from django.db import models
from users.models import ClientProfile
from stocks.models import Stock

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('buy', 'Compra'),
        ('sell', 'Venta'),
    )
    
    code = models.CharField(max_length=10, blank=True, null=True)
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

class TransactionDetail(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)