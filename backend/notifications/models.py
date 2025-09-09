from django.db import models
from users.models import User
from reports.models import Report

class EmailNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=50)
    receiver = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    sent = models.BooleanField(default=False)
    report = models.ForeignKey(Report, on_delete=models.CASCADE, blank=True, null=True)
    is_active = models.BooleanField(default=True)