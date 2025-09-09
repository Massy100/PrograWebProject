from django.db import models
from users.models import User

class Referral(models.Model):
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referred = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_received')
    code_used = models.CharField(max_length=100)
    bonus_amount = models.DecimalField(max_digits=10, decimal_places=2, default=5.00)
    created_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)