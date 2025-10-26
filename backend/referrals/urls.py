from django.urls import path
from . import views

urlpatterns = [
    path('validate-referral/', views.ValidateReferralCodeView.as_view(), name='validate-referral'),
    path('process-referral/', views.ProcessReferralView.as_view(), name='process-referral'),
]