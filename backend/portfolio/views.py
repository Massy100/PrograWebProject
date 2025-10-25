from django.shortcuts import render
from .models import Portfolio, Investment
from serializers import PortfolioCreateSerializer, PortfolioSerializer, InvestmentSerializer
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend


# Create your views here.

class PortfolioViewSet(viewsets.ModelViewSet):
  queryset = Portfolio.objects.all
  filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
  filterset_fields = ['client']
  ordering_fields = ['name', 'created_at']
  order = ['name']

  def get_serializer_class(self):
    if self.action == "create":
      return PortfolioCreateSerializer
    return PortfolioSerializer

