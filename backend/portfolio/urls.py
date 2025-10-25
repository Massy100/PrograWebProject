from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PortfolioViewSet, InvestmentViewSet

router = DefaultRouter()
router.register(r'portfolios', PortfolioViewSet, basename='portfolio')
router.register(r'investments', InvestmentViewSet, basename='investment')

urlpatterns = [
    path('', include(router.urls)),
]