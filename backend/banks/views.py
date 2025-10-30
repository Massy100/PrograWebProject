from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets, filters, renderers
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.http import JsonResponse
from django.views import View

from .models import Bank, FundsTransfer
from .serializers import BankSerializer, FundsTransferSerializer
from users.mixins import ClientRequiredMixin, AdminRequiredMixin

# Create your views here.

class BankViewSet(viewsets.ModelViewSet):
    queryset = Bank.objects.all()
    serializer_class = BankSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'established_date']
    search_fields = ['name', 'address']
    ordering_fields = ['name', 'established_date']
    ordering = ['name']

class FundsTransferViewSet(viewsets.ModelViewSet):
    """
      - GET    /fundstransfers/           
      - POST   /fundstransfers/           
      - GET    /fundstransfers/{id}/      
      - PUT    /fundstransfers/{id}/      
      - PATCH  /fundstransfers/{id}/      
      - DELETE /fundstransfers/{id}/      
    """
    queryset = FundsTransfer.objects.all()
    serializer_class = FundsTransferSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user', 'bank', 'amount', 'transfer_date']
    search_fields = ['user__username', 'bank__name']
    ordering_fields = ['amount', 'transfer_date']
    ordering = ['-transfer_date']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.user_type == 'client':
            return FundsTransfer.objects.filter(user=user)
        return FundsTransfer.objects.none()
