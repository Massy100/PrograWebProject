from datetime import timezone
from django.http import JsonResponse
from rest_framework.decorators import action
from rest_framework import viewsets
import threading

from ..models import AdminPermissionsRequest
from ..serializers import AdminPermissionsRequestSerialzer
from ..mixins import ClientRequiredMixin, AdminRequiredMixin

# Importar el servicio de email
try:
    from users.services.email_service import EmailService
except ImportError:
    class EmailService:
        @staticmethod
        def send_account_approved_email(user_email, username):
            print(f"Would send account approved email to {user_email} for user {username}")
            return True

class EmailThread(threading.Thread):
    """
    Thread for sending emails asynchronously
    """
    def __init__(self, user_email, username):
        self.user_email = user_email
        self.username = username
        threading.Thread.__init__(self)

    def run(self):
        try:
            EmailService.send_account_approved_email(self.user_email, self.username)
        except Exception as e:
            print(f"Error sending account approved email: {str(e)}")

class AdminPermsReqViewSet(viewsets.ModelViewSet):
    queryset = AdminPermissionsRequest.objects.all()
    serializer_class = AdminPermissionsRequestSerialzer

    @action(detail=False, methods=['get'], url_path='pending')
    def list_pending(self, request):
        queryset = AdminPermissionsRequest.objects.filter(status=AdminPermissionsRequest.STATUS_PENDING).order_by('-issued_at')
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)

    @action(detail=False, methods=['get'], url_path='approved')
    def list_approved(self, request):
        queryset = AdminPermissionsRequest.objects.filter(status=AdminPermissionsRequest.STATUS_APPROVED).order_by('-issued_at')
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)

    @action(detail=False, methods=['get'], url_path='rejected')
    def list_rejected(self, request):
        queryset = AdminPermissionsRequest.objects.filter(status=AdminPermissionsRequest.STATUS_REJECTED).order_by('-issued_at')
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        try:
            admin_request = self.get_object()
            admin_request.status = AdminPermissionsRequest.STATUS_APPROVED
            admin_request.reviewer = request.user
            admin_request.reviewed_at = timezone.now()
            admin_request.save()

            # Enviar email de aprobación de forma asíncrona
            try:
                EmailThread(
                    user_email=admin_request.user.email,
                    username=admin_request.user.username
                ).start()
                print(f"🔄 Proceso de email iniciado para: {admin_request.user.email}")
            except Exception as e:
                print(f"⚠️ No se pudo iniciar el hilo de email: {str(e)}")
                # No fallar la aprobación si el email falla

            return JsonResponse({
                'status': 'approved',
                'message': 'Solicitud aprobada exitosamente',
                'user_id': admin_request.user.id,
                'user_email': admin_request.user.email,
                'username': admin_request.user.username
            })
            
        except Exception as e:
            print(f"Error in approve action: {str(e)}")
            return JsonResponse({
                'error': 'Internal server error'
            }, status=500)
  
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        admin_request = self.get_object()
        admin_request.status = AdminPermissionsRequest.STATUS_REJECTED
        admin_request.reviewer = request.user
        admin_request.reviewed_at = timezone.now()
        admin_request.save()
        return JsonResponse({'status': 'rejected'})
  
    @action(detail=False, methods=['post'])
    def request_admin(self, request):
        user = request.user
        if AdminPermissionsRequest.objects.filter(user=user, status=AdminPermissionsRequest.STATUS_PENDING).exists():
            return JsonResponse({'error': 'Client already has a pending request'}, status=400)
        
        admin_request = AdminPermissionsRequest.objects.create(user=user)
        serializer = self.get_serializer(admin_request)
        return JsonResponse(serializer.data, status=201)
      
    @action(detail=False, methods=['post'], url_path='test-email')
    def test_email(self, request):
        """
        Endpoint temporal para probar el envío de emails
        """
        try:
            # Datos de prueba - cambia por tu email real
            test_email = "tu_email@dominio.com"  # ← CAMBIA ESTO
            test_username = "Usuario de Prueba"
            
            print(f"🧪 Probando envío de email a: {test_email}")
            
            # Enviar email de prueba
            EmailThread(
                user_email=test_email,
                username=test_username
            ).start()
            
            return JsonResponse({
                'status': 'success',
                'message': f'Email de prueba enviado a {test_email}',
                'test_email': test_email
            })
            
        except Exception as e:
            print(f"❌ Error en test email: {str(e)}")
            return JsonResponse({
                'error': f'Error enviando email de prueba: {str(e)}'
            }, status=500)