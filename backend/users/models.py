from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPE_CLIENT = 'client'
    USER_TYPE_ADMIN = 'admin'
    
    USER_TYPES = (
        (USER_TYPE_CLIENT, 'Client'),
        (USER_TYPE_ADMIN, 'Administrator'),
    )
    
    phone = models.CharField(max_length=20, blank=True, null=True)
    status = models.BooleanField(default=True)
    verified = models.BooleanField(default=False)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default=USER_TYPE_CLIENT)
    last_ip = models.GenericIPAddressField(blank=True, null=True)
    referred_code = models.CharField(max_length=100, blank=True, null=True)
    used_referred_code = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.username
    
    def is_client(self):
        return self.user_type == self.USER_TYPE_CLIENT
    
    def is_admin(self):
        return self.user_type == self.USER_TYPE_ADMIN
    
    def get_profile(self):
        if self.is_client():
            return getattr(self, 'client_profile', None)
        elif self.is_admin():
            return getattr(self, 'admin_profile', None)
        return None

class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    access_level = models.CharField(max_length=50)
    
    def __str__(self):
        return f"Admin Profile: {self.user.username}"

class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    balance_available = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_blocked = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    def __str__(self):
        return f"Client Profile: {self.user.username}"