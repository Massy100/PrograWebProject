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
    full_name = serializers.SerializerMethodField()
    balance_available = serializers.SerializerMethodField()
    balance_blocked = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'full_name',
            'user_type',
            'user_type_display',
            'phone',
            'status',
            'verified',
            'is_active',
            'date_joined',
            'created_at',
            'balance_available',
            'balance_blocked'
        ]

    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name if full_name else obj.username

    def get_balance_available(self, obj):
        if hasattr(obj, 'client_profile'):
            return obj.client_profile.balance_available
        return 0

    def get_balance_blocked(self, obj):
        if hasattr(obj, 'client_profile'):
            return obj.client_profile.balance_blocked
        return 0

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
            'referred_code',
            'used_referred_code',
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