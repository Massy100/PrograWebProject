from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPES = (
        ('client', 'Cliente'),
        ('admin', 'Administrador'),
    )
    
    phone = models.CharField(max_length=20, blank=True, null=True)
    status = models.BooleanField(default=True)
    verified = models.BooleanField(default=False)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='client')
    last_ip = models.GenericIPAddressField(blank=True, null=True)
    referred_code = models.CharField(max_length=100, blank=True, null=True)
    used_referred_code = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    access_level = models.CharField(max_length=50)

class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance_available = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_blocked = models.DecimalField(max_digits=12, decimal_places=2, default=0)