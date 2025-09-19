from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Portfolio, Investment
from .serializers import (
    PortfolioSerializer, PortfolioCreateSerializer,
    InvestmentSerializer
)
from .services import PortfolioService
from users.models import ClientProfile

class PortfolioViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] 
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            try:
                client_profile = ClientProfile.objects.get(user=self.request.user)
                return Portfolio.objects.filter(client=client_profile, is_active=True)
            except ClientProfile.DoesNotExist:
                return Portfolio.objects.none()
        else:
            return Portfolio.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PortfolioCreateSerializer
        return PortfolioSerializer
    
    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            raise serializers.ValidationError("You have to be logged in to create a portfolio")
        
        try:
            client_profile = ClientProfile.objects.get(user=self.request.user)
            serializer.save(client=client_profile)
        except ClientProfile.DoesNotExist:
            raise serializers.ValidationError("Profile not found")
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        portfolio = self.get_object()
        
        if self.request.user.is_authenticated:
            try:
                client_profile = ClientProfile.objects.get(user=self.request.user)
                if portfolio.client != client_profile:
                    return Response(
                        {"error": "You do not have permission to view this portfolio"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except ClientProfile.DoesNotExist:
                return Response(
                    {"error": "Profile not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        summary = PortfolioService.get_portfolio_summary(portfolio)
        return Response(summary)
    
    @action(detail=True, methods=['get'])
    def investments(self, request, pk=None):
        portfolio = self.get_object()
        
        if self.request.user.is_authenticated:
            try:
                client_profile = ClientProfile.objects.get(user=self.request.user)
                if portfolio.client != client_profile:
                    return Response(
                        {"error": "You do not have permission to view this portfolio's investments"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except ClientProfile.DoesNotExist:
                return Response(
                    {"error": "Profile not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        investments = portfolio.investment_set.filter(is_active=True).select_related('stock')
        serializer = InvestmentSerializer(investments, many=True)
        return Response(serializer.data)

class InvestmentViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentSerializer
    permission_classes = [AllowAny] 
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            try:
                client_profile = ClientProfile.objects.get(user=self.request.user)
                return Investment.objects.filter(
                    portfolio__client=client_profile,
                    is_active=True
                ).select_related('stock', 'portfolio')
            except ClientProfile.DoesNotExist:
                return Investment.objects.none()
        else:
            return Investment.objects.filter(is_active=True).select_related('stock', 'portfolio')
    
    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            raise serializers.ValidationError("You must be logged in to add investments")
        
        try:
            portfolio = serializer.validated_data['portfolio']
            client_profile = ClientProfile.objects.get(user=self.request.user)
            if portfolio.client != client_profile:
                raise serializers.ValidationError("You do not have permission to add investments to this portfolio")
            
            investment = serializer.save()
            PortfolioService.update_portfolio_values(investment.portfolio)
        except ClientProfile.DoesNotExist:
            raise serializers.ValidationError("Profile not found")
    
    def perform_update(self, serializer):
        if not self.request.user.is_authenticated:
            raise serializers.ValidationError("You must be logged in to update investments")
        
        try:
            investment = serializer.save()
            PortfolioService.update_portfolio_values(investment.portfolio)
        except ClientProfile.DoesNotExist:
            raise serializers.ValidationError("Profile not found")
    
    def perform_destroy(self, instance):

        if not self.request.user.is_authenticated:
            raise serializers.ValidationError("You must be logged in to delete investments")
        
        instance.is_active = False
        instance.save()
        PortfolioService.update_portfolio_values(instance.portfolio)
    
    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        investment = self.get_object()
        
        if self.request.user.is_authenticated:
            try:
                client_profile = ClientProfile.objects.get(user=self.request.user)
                if investment.portfolio.client != client_profile:
                    return Response(
                        {"error": "You do not have permission to view this investment"},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except ClientProfile.DoesNotExist:
                return Response(
                    {"error": "Profile not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        serializer = self.get_serializer(investment)
        return Response(serializer.data)

def portfolio_api_info(request):
    return JsonResponse({
        "message": "API de Portafolio - Modo Desarrollo",
        "endpoints": {
            "portfolios": "/portfolio/portfolios/",
            "investments": "/portfolio/investments/",
            "admin": "/admin/"
        },
        "note": "En modo desarrollo, se muestran todos los datos. En producción, cambie permission_classes a [IsAuthenticated]"
    })