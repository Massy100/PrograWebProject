# users/urls.py
from django.urls import path
from rest_framework.routers import SimpleRouter
from .views import (
    UserViewSet,
    client_portfolio,
    TransactionHistoryView, 
    user_management,
    StockManagementView
)

from .auth_views.admin_request_views import AdminPermsReqViewSet

router = SimpleRouter()
router.register(r'', UserViewSet, basename='user')
router.register(r'/admin-requests', AdminPermsReqViewSet, basename='admin-requests')

"""
administrator/admin-requests/pending/  -> Listar solicitudes pendientes
administrator/admin-requests/approved/ -> Listar solicitudes aprobadas
administrator/admin-requests/rejected/ -> Listar solicitudes rechazadas
administrator/admin-requests/{id}/approve/ -> Aprobar solicitud
administrator/admin-requests/{id}/reject/ -> Rechazar solicitud
client/admin-requests/ -> Crear nueva solicitud
"""

permission_urls = [
    path('client/portfolio/', client_portfolio, name='client-portfolio'),
    path('client/transactions/', TransactionHistoryView.as_view(), name='transaction-history'),
    path('administrator/users/', user_management, name='user-management'),
    path('administrator/stocks/', StockManagementView.as_view(), name='stock-management'),


]

urlpatterns = router.urls + permission_urls