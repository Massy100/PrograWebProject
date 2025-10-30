# users/urls.py
from django.urls import path
from rest_framework.routers import SimpleRouter
from .views import (
    UserViewSet
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

urlpatterns = router.urls 