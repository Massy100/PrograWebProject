from datetime import timezone
from django.http import JsonResponse
from rest_framework.decorators import action
from rest_framework import viewsets

from ..models import AdminPermissionsRequest
from ..serializers import AdminPermissionsRequestSerialzer
from ..permissions import client_required, admin_required
from ..mixins import ClientRequiredMixin, AdminRequiredMixin
from .permit_grantor import PermitGrantor

class AdminPermsReqViewSet(viewsets.ModelViewSet):
  queryset = AdminPermissionsRequest.objects.all()
  serializer_class = AdminPermissionsRequestSerialzer

  @admin_required
  @action(detail=False, methods=['get'], url_path='pending')
  def list_pending(self, request):
    queryset = AdminPermissionsRequest.objects.filter(status=AdminPermissionsRequest.STATUS_PENDING).order_by('-issued_at')
    serializer = self.get_serializer(queryset, many=True)
    return JsonResponse(serializer.data, safe=False)

  @admin_required
  @action(detail=False, methods=['get'], url_path='approved')
  def list_approved(self, request):
    queryset = AdminPermissionsRequest.objects.filter(status=AdminPermissionsRequest.STATUS_APPROVED).order_by('-issued_at')
    serializer = self.get_serializer(queryset, many=True)
    return JsonResponse(serializer.data, safe=False)

  @admin_required
  @action(detail=False, methods=['get'], url_path='rejected')
  def list_rejected(self, request):
    queryset = AdminPermissionsRequest.objects.filter(status=AdminPermissionsRequest.STATUS_REJECTED).order_by('-issued_at')
    serializer = self.get_serializer(queryset, many=True)
    return JsonResponse(serializer.data, safe=False)

  @admin_required
  @action(detail=True, methods=['post'], url_path='approve')
  def approve(self, request):
    admin_request = self.get_object()
    admin_request.status = AdminPermissionsRequest.STATUS_APPROVED
    admin_request.reviewer = request.user
    admin_request.reviewed_at = timezone.now()
    admin_request.save()

    # otorgar permisos de admin al usuario
    user = admin_request.user
    PermitGrantor(user)

    return JsonResponse({'status': 'approved'})
  
  @admin_required
  @action(detail=True, methods=['post'])
  def reject(self, request):
    admin_request = self.get_object()
    admin_request.status = AdminPermissionsRequest.STATUS_REJECTED
    admin_request.reviewer = request.user
    admin_request.reviewed_at = timezone.now()
    admin_request.save()
    return JsonResponse({'status': 'rejected'})
  
  @client_required
  @action(detail=False, methods=['post'])
  def request_admin(self, request):
    user = request.user
    if AdminPermissionsRequest.objects.filter(user=user, status=AdminPermissionsRequest.STATUS_PENDING).exists():
      return JsonResponse({'error': 'Client already has a pending request'}, status=400)
    
    admin_request = AdminPermissionsRequest.objects.create(user=user)
    serializer = self.get_serializer(admin_request)
    return JsonResponse(serializer.data, status=201)
