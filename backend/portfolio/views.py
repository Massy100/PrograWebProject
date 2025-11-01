from django.shortcuts import render
from .models import Portfolio, Investment, PortfolioValueUpdates
from .services import PortfolioService
from .serializers import PortfolioCreateSerializer, PortfolioSerializer, InvestmentSerializer, PortfolioUpdatesSerializer
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from django.db import models


# Create your views here.

class PortfolioViewSet(viewsets.ModelViewSet):
  queryset = Portfolio.objects.all()
  filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
  filterset_fields = ['client_id']
  ordering_fields = ['name', 'created_at']
  order = ['name']
  http_method_names = ['get', 'post']

  def get_serializer_class(self):
    if self.action == "create":
      return PortfolioCreateSerializer
    return PortfolioSerializer
  
  def perform_create(self, serializer):
     portfolio = serializer.save()
     PortfolioValueUpdates.objects.create(
        portfolio=portfolio,
        value=0
     )

class InvestmentViewSet(viewsets.ModelViewSet):
  queryset = Investment.objects.all()
  serializer_class = InvestmentSerializer
  filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
  filterset_fields = ['portfolio', 'stock', 'purchased_at']
  ordering_fields = ['average_price']
  order = ['-average_price']
  http_method_names = ['get', 'post']


class PortfolioValueUpdatesViewSet(viewsets.ModelViewSet):
  queryset = PortfolioValueUpdates.objects.all()
  serializer_class = PortfolioUpdatesSerializer

  http_method_names = ['get', 'post']

  @action(detail=False, methods=['get'], url_path='year-summary')
  def yearly_value_summary(self, request):
      client_id = request.query_params.get("client_id")
      if not client_id:
          return Response({"error": "Missing client_id"}, status=400)

      current_year = timezone.localdate().year
      res = (
          PortfolioValueUpdates.objects
          .filter(portfolio__client_id=client_id, update_date__year=current_year)
          .annotate(month=TruncMonth('update_date'))
          .values('portfolio_id', 'portfolio__name', 'month')
          .annotate(total_value=models.Sum('value'))
          .order_by('portfolio_id', 'month')
      )
      raw = PortfolioService.format_portfolio_values(res)
      return Response(raw)
  
  @action(detail=False, methods=['get'], url_path='date-range-value')
  def date_range_value(self, request):
      client_id = request.query_params.get("client_id")
      start_date = request.query_params.get("start_date")
      end_date = request.query_params.get("end_date")

      if not client_id or not start_date or not end_date:
          return Response({"error": "Missing parameters"}, status=400)

      res = (
          PortfolioValueUpdates.objects
          .filter(
              portfolio__client_id=client_id,
              update_date__date__gte=start_date,
              update_date__date__lte=end_date
          )
          .annotate(month=TruncMonth('update_date'))
          .values('portfolio_id', 'portfolio__name', 'month')
          .annotate(total_value=models.Sum('value'))
          .order_by('portfolio_id', 'month')
      )
      raw = PortfolioService.format_portfolio_values(res)
      return Response(raw)
  
  @action(detail=False, methods=['get'], url_path='gain')
  def portfolio_gain(self, request):
      portfolio_id = request.query_params.get("portfolio_id")
      start_date = request.query_params.get("start_date")
      end_date = request.query_params.get("end_date")

      if not portfolio_id or not start_date or not end_date:
          return Response({"error": "Missing parameters"}, status=400)

      gain_data = PortfolioService.get_portfolio_gain(portfolio_id, start_date, end_date)
      print(gain_data)
      return Response(gain_data)

