from django.contrib.auth import authenticate, login
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets, filters, renderers
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.http import JsonResponse
from django.views import View
import threading

from .models import User
from .serializers import UserListSerializer, UserDetailSerializer
from .permissions import client_required, admin_required
from .mixins import ClientRequiredMixin, AdminRequiredMixin

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
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'date_joined', 'username']
    ordering = ['-created_at']
    permission_classes = [AllowAny]
    renderer_classes = [renderers.JSONRenderer]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        elif self.action == 'retrieve':
            return UserDetailSerializer
        return UserListSerializer
    
    @action(detail=False, methods=['POST'], permission_classes=[AllowAny])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'message': 'Email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                return Response(
                    {'message': 'Dseactivated account. Contact administrator.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            authenticated_user = authenticate(
                username=user.username, 
                password=password
            )
            
            if authenticated_user is not None:
                login(request, authenticated_user)
                
                redirect_path = '/dashboard'
                if user.is_admin():
                    redirect_path = '/admin-dashboard'
                
                return Response({
                    'message': 'Login successful',
                    'redirect_to': redirect_path,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'user_type': user.user_type,
                        'verified': user.verified,
                        'first_name': user.first_name,
                        'last_name': user.last_name
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'message': 'Invalid password'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
        except User.DoesNotExist:
            return Response(
                {'message': 'Does not exist a user with this email'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error en login: {str(e)}")
            return Response(
                {'message': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['POST'])
    def logout(self, request):
        from django.contrib.auth import logout
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['GET'])
    def check_auth(self, request):
        if request.user.is_authenticated:
            return Response({
                'authenticated': True,
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'user_type': request.user.user_type,
                    'verified': request.user.verified,
                }
            })
        else:
            return Response({'authenticated': False})
        
    @action(detail=False, methods=['GET'], permission_classes=[AllowAny])
    def session_status(self, request):
        session_info = {
            'has_session': bool(request.session.session_key),
            'session_key': request.session.session_key,
            'authenticated': request.user.is_authenticated,
            'user': None,
        }
        
        if request.user.is_authenticated:
            session_info['user'] = {
                'username': request.user.username,
                'user_type': request.user.user_type,
            }
        
        return Response(session_info)

    @action(detail=False, methods=['POST'], permission_classes=[AllowAny])
    def reset_session(self, request):
        old_session_key = request.session.session_key
        user_was_authenticated = request.user.is_authenticated
        
        request.session.flush()
        request.session.cycle_key()
        
        return Response({
            'message': 'Sesion reset successful',
            'old_session': old_session_key,
            'new_session': request.session.session_key,
            'was_authenticated': user_was_authenticated,
        })
        
    @action(detail=False, methods=['POST'], permission_classes=[AllowAny])
    def register(self, request):
        print("=== REGISTER ENDPOINT HIT ===")
        print("Request method:", request.method)
        print("Request path:", request.path)
        print("Request content type:", request.content_type)
        print("Request headers:", dict(request.headers))
        print("Request data:", request.data)
        print("User authenticated:", request.user.is_authenticated)
        print("CSRF processing done:", getattr(request, 'csrf_processing_done', 'Not set'))
        print("REGISTER ENDPOINT CALLED")
        print("Request data:", request.data)
        
        request.csrf_processing_done = True
        
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        phone = request.data.get('phone', '')
        referred_code = request.data.get('referred_code', '')
        
        if not username or not email or not password:
            return Response(
                {'message': 'Username, email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            if User.objects.filter(username=username).exists():
                return Response(
                    {'message': 'Username is already taken'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if User.objects.filter(email=email).exists():
                return Response(
                    {'message': 'Email is already registered'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                phone=phone,
                referred_code=referred_code,
                user_type=User.USER_TYPE_CLIENT,  
                is_active=True,
                verified=False  
            )
            
            from users.models import ClientProfile
            ClientProfile.objects.create(user=user)
            
            print(f"User registered: {user.username} ({user.email})")
            
            # Send welcome email asynchronously
            try:
                EmailThread(user.email, user.username).start()
                print(f"Welcome email process started for {user.email}")
            except Exception as e:
                print(f"Failed to start email thread: {str(e)}")
                # Don't fail the registration if email fails
            
            from django.contrib.auth import login
            login(request, user)
            
            return Response({
                'message': 'Register successful. Welcome email sent!',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'user_type': user.user_type,
                    'verified': user.verified
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Register error: {str(e)}")
            return Response(
                {'message': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    @action(detail=False, methods=['GET'], permission_classes=[AllowAny])
    def csrf(self, request):
        from django.middleware.csrf import get_token
        csrf_token = get_token(request)
        
        response = Response({'csrfToken': csrf_token})
        response.set_cookie(
            'csrftoken', 
            csrf_token, 
            max_age=3600, 
            httponly=False,  
            samesite='Lax'
        )
        
        return response

@client_required
def client_portfolio(request):
    print(f"VISTA client_portfolio - User: {request.user}, Type: {getattr(request.user, 'user_type', 'None')}")
    return JsonResponse({'message': 'Client portfolio'})

class TransactionHistoryView(ClientRequiredMixin, View):
    def get(self, request):
        print(f"VISTA TransactionHistoryView - User: {request.user}, Type: {getattr(request.user, 'user_type', 'None')}")
        return JsonResponse({'message': 'Transaction history'})

@admin_required
def user_management(request):
    print(f"VISTA user_management - User: {request.user}, Type: {getattr(request.user, 'user_type', 'None')}")
    return JsonResponse({'message': 'User management'})

class StockManagementView(AdminRequiredMixin, View):
    def post(self, request):
        print(f"VISTA StockManagementView - User: {request.user}, Type: {getattr(request.user, 'user_type', 'None')}")
        return JsonResponse({'message': 'Action added/modified'})