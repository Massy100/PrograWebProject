from django.contrib.auth import authenticate, login
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets, filters, renderers
from django_filters.rest_framework import DjangoFilterBackend
from django.http import JsonResponse
from django.views import View
from django.utils import timezone
from django.contrib.auth.hashers import make_password
import threading
import requests
from django.conf import settings

from .models import User, AdminPermissionsRequest
from .serializers import UserListSerializer, UserDetailSerializer
from .permissions import IsAdminRole, IsClientRole
from .services.mgm_token_service import ManagementService

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
    ordering_fields = ['created_at', 'date_joined', 'username']
    ordering = ['-created_at']
    renderer_classes = [renderers.JSONRenderer]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        elif self.action == 'retrieve':
            return UserDetailSerializer
        return UserListSerializer
    
    def get_permissions(self):
        permission_classes = []
        if self.action == 'retrieve':
            permission_classes = [IsAdminRole, IsClientRole]
        elif self.action == 'destroy':
            permission_classes = [IsAdminRole]
        return [permission() for permission in permission_classes]

    def list(self, request, *args, **kwargs):
        self.queryset = self.queryset.filter(verified=True, is_active=True)
        return super().list(request, *args, **kwargs)


    @action(detail=True, methods=['PATCH'],  
            permission_classes=[IsAdminRole])
    def deactivate(self, request, pk=None):
        """
        Endpoint para desactivar un usuario
        """
        try:
            user = self.get_object()
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
    
    @action(detail=False, methods=['POST'], url_path="sync")
    def sync_user(self, request):
        payload = getattr(request, 'auth0_payload', None)
        if not payload:
            return Response({'error': 'Invalid or missing token'}, status=401)
        

        req = request.data
        print(req)
        email = req.get("email")
        fullname = req.get("name")
        created_date = req.get("created_at")
        updated_date = req.get("updated_at")
        username = req.get("nickname")
        auth0_id = req.get("sub")
        last_login = timezone.now()
        service = ManagementService()
        roles = service.auth0_get_roles(auth0_id)
        user_type = roles[0]['name']
        print(roles)

        user, created = User.objects.get_or_create(
            auth0_id=auth0_id,
            defaults={'email': email, 
                      'full_name': fullname, 
                      'created_at': created_date,
                      'modified_at': updated_date,
                      'last_login': last_login,
                      'username': username,
                      'auth0_id': auth0_id,
                      'user_type': user_type
                      }
        )

        serializer = UserDetailSerializer(user)     

        if not created and user.user_type != user_type:
            user.user_type = user_type
            user.save()

        return Response({
            'created': created,
            'user': serializer.data
        })
    
    @action(detail=False, methods=['POST'], url_path='create-admin')
    def create_admin(self, request):
        current_user = request.user
        service = ManagementService()

        data = request.data
        token = service.get_management_token()

        print(data)
        url = f"https://{settings.AUTH0_DOMAIN}/api/v2/users"
        payload = {
            "email": data["email"],
            "phone_number": data.get("phone", ""),
            "user_metadata": {},
            "blocked": False,
            "email_verified": False,
            "phone_verified": False,
            "app_metadata": {},
            "given_name": data.get("full_name"),
            "family_name": data.get("full_name"),
            "name": data.get("full_name"),
            "nickname": data.get("username"),
            "picture": "https://example.com/avatar.png",
            "connection": "Username-Password-Authentication",  
            "password": data["password"],
            "verify_email": False,
            "username": data["username"]
        }

        headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
        
        res = requests.post(url, json=payload, headers=headers)
        res.raise_for_status()
        auth0_user = res.json()

        service.auth0_assign_role(
            auth0_user['user_id'], 
            settings.AUTH0_ADMIN_ROLE_ID
        )

        User.objects.create(
            username=data.get["username"],
            email=data["email"],
            full_name=data.get("full_name", ""),
            phone=data.get("phone", ""),
            user_type='admin',
            password=make_password(data["password"]),
            auth0_id=auth0_user['user_id'],
            verified=True,
            is_staff=True,
            is_completed=True
        )

        return Response({"message": "Admin created successfully", "auth0_id": auth0_user["user_id"]})
    
    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        instance = self.get_object()

        AdminPermissionsRequest.objects.create(
            user=instance            
        )

        return response
    