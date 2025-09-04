from django.db import models
from users.models import ClientProfile
from stocks.models import Stock

class Portfolio(models.Model):
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default='my_portfolio')
    created_at = models.DateTimeField(auto_now_add=True)
    average_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_inversion = models.DecimalField(max_digits=10, decimal_places=2)
    current_value = models.DecimalField(max_digits=10, decimal_places=2)

class Investment(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    purchased_at = models.DateTimeField(auto_now_add=True)