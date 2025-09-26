from rest_framework import serializers
from .models import User, AdminProfile, ClientProfile, AdminPermissionsRequest

class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = ['balance_available', 'balance_blocked']

class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = ['access_level']

class UserListSerializer(serializers.ModelSerializer):
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'user_type',
            'user_type_display',
            'phone',
            'status',
            'verified',
            'is_active',
            'date_joined',
            'created_at'
        ]

class UserDetailSerializer(serializers.ModelSerializer):
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    admin_profile = AdminProfileSerializer(read_only=True)
    client_profile = ClientProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'user_type',
            'user_type_display',
            'phone',
            'status',
            'verified',
            'is_active',
            'last_ip',
            'referred_code',
            'used_referred_code',
            'date_joined',
            'last_login',
            'created_at',
            'modified_at',
            'admin_profile',
            'client_profile'
        ]

class BasicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email')

class AdminPermissionsRequestSerialzer(serializers.ModelSerializer):
    user = BasicUserSerializer(read_only=True)
    reviewer = BasicUserSerializer(read_only=True)

    class Meta:
        model = AdminPermissionsRequest
        fields = '__all__'