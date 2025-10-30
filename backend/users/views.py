from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets, filters, renderers
from django_filters.rest_framework import DjangoFilterBackend

from django.contrib.auth.hashers import make_password
import threading

from .models import User, AdminPermissionsRequest
from .serializers import UserListSerializer, UserDetailSerializer
from .services.mgm_token_service import ManagementService
from .services.dto_service import DtoService
import os

try:
    from .services.email_service import EmailService
except ImportError:
    class EmailService:
        @staticmethod
        def send_welcome_email(user_email, username):
            print(f"Would send welcome email to {user_email} for user {username}")
            return True

class EmailThread(threading.Thread):
    """
    Thread for sending emails asynchronously to avoid blocking the response
    """
    def __init__(self, user_email, username):
        self.user_email = user_email
        self.username = username
        threading.Thread.__init__(self)

    def run(self):
        try:
            EmailService.send_welcome_email(self.user_email, self.username)
        except Exception as e:
            print(f"Error sending welcome email: {str(e)}")

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related('admin_profile', 'client_profile')      
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user_type', 'status', 'verified', 'is_active']
    search_fields = ['username', 'email', 'full_name']
    ordering_fields = ['created_at', 'created_at', 'username']
    ordering = ['-created_at']
    renderer_classes = [renderers.JSONRenderer]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        elif self.action == 'retrieve':
            return UserDetailSerializer
        return UserListSerializer

    def list(self, request, *args, **kwargs):
        self.queryset = self.queryset.filter(verified=True, is_active=True)
        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=['PATCH'])
    def deactivate(self, request, pk=None):
        """
        Endpoint para desactivar un usuario
        """
        try:
            user = self.get_object()
            
            service = ManagementService()
            service.auth0_user_lock(user.auth0_id, deactivate=True)
            
            user.is_active = False
            user.save()
            
            return Response(
                {'message': 'Usuario desactivado correctamente', 'user_id': user.id},
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return Response(
                {'message': 'Usuario no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error en deactivate: {str(e)}")
            return Response(
                {'message': 'Error interno del servidor'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['PATCH'])
    def activate(self, request, pk=None):
        """
        Endpoint para activar un usuario
        """
        try:
            user = self.get_object()
            
            service = ManagementService()
            service.auth0_user_lock(user.auth0_id, deactivate=False)
            
            user.is_active = True
            user.save()
            
            return Response(
                {'message': 'Usuario activado correctamente', 'user_id': user.id},
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return Response(
                {'message': 'Usuario no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error en activate: {str(e)}")
            return Response(
                {'message': 'Error interno del servidor'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['POST'], url_path="sync")
    def sync_user(self, request):
        payload = getattr(request, 'auth0_payload', None)
        if not payload:
            return Response({'error': 'Invalid or missing token'}, status=401)
        
        dto_service = DtoService()

        req = request.data
        auth0_id = req.get("sub")

        defaults = dto_service.UserDefaults(req, auth0_id)

        user, created = User.objects.get_or_create(
            auth0_id=auth0_id,
            defaults=defaults
        )

        serializer = UserDetailSerializer(user)   
        service = ManagementService()

        if not created:
            roles = service.auth0_get_roles(auth0_id).json()
            user_type = roles[0]['name']
            user.user_type = user_type
            user.save()
        else:
            service.auth0_assign_role(
                auth0_id, 
                os.getenv("AUTH0_CLIENT_ROLE_ID")
            )

        return Response({
            'created': created,
            'user': serializer.data
        })
    
    @action(detail=False, methods=['POST'], url_path='create-admin')
    def create_admin(self, request):
        service = ManagementService()
        dto_service = DtoService()

        data = request.data
        payload = dto_service.Auth0AdminPayload(data)

        auth0_user = service.auth0_create_user(payload)

        service.auth0_assign_role(
            auth0_user['user_id'], 
            os.getenv("AUTH0_ADMIN_ROLE_ID")
        )

        passwd = make_password(data["password"])
        auth0_id = auth0_user['user_id']

        dto_service.SaveFullDBUser(data, passwd, auth0_id)

        return Response({"message": "Admin created successfully", "auth0_id": auth0_user["user_id"]})
    
    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        instance = self.get_object()

        AdminPermissionsRequest.objects.create(
            user=instance            
        )

        return response
    