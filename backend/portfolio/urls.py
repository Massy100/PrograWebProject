from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PortfolioViewSet, InvestmentViewSet, PortfolioValueUpdatesViewSet

router = DefaultRouter()
router.register(r'portfolios', PortfolioViewSet, basename='portfolio')
router.register(r'investments', InvestmentViewSet, basename='investment')
router.register(r'value', PortfolioValueUpdatesViewSet, basename='value') # parametros: ?client_id=2/

urlpatterns = [
    path('', include(router.urls)),
]