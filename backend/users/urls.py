from django.urls import path
from .views import UserViewSet
from rest_framework.routers import SimpleRouter
from .views import (
    client_portfolio,
    TransactionHistoryView,
    user_management,
    StockManagementView
)

router = SimpleRouter()
router.register(r'', UserViewSet, basename='user')

permission_urls = [
    # URLS DE PRUEBA DE ROLES Y PERMISOS (para testing)
    path('client/portfolio/', client_portfolio, name='client-portfolio'),
    path('client/transactions/', TransactionHistoryView.as_view(), name='transaction-history'),
    path('administrator/users/', user_management, name='user-management'),
    path('administrator/stocks/', StockManagementView.as_view(), name='stock-management'),
]

urlpatterns = router.urls + permission_urls