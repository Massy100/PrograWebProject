from django.db import models
from users.models import ClientProfile

class Report(models.Model):
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE)
    report_type = models.CharField(max_length=50, blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    file_url = models.URLField(max_length=200, blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)