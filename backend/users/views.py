from rest_framework import viewsets, filters, renderers
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.http import JsonResponse
from django.views import View

from .models import User
from .serializers import UserListSerializer, UserDetailSerializer
from .permissions import client_required, admin_required
from .mixins import ClientRequiredMixin, AdminRequiredMixin

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