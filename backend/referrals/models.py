# referrals/models.py
from django.db import models
from users.models import User
from django.utils import timezone
from datetime import timedelta
import random

class ReferralCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referral_codes')
    code = models.CharField(max_length=5, unique=True)  # Códigos numéricos de 5 dígitos
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=30)
        if not self.code:
            # Generar código numérico de 5 dígitos
            while True:
                new_code = str(random.randint(10000, 99999))
                if not ReferralCode.objects.filter(code=new_code).exists():
                    self.code = new_code
                    break
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.code} - {self.user.username}"

class Referral(models.Model):
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referred = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_received')
    code_used = models.CharField(max_length=100)
    bonus_amount = models.DecimalField(max_digits=10, decimal_places=2, default=5.00)
    created_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.referrer.username} -> {self.referred.username} ({self.code_used})"