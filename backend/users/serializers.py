from rest_framework import serializers
from .models import *

class AdminProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdminProfile
        fields = ['id', 'access_level']

class ClientProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = ClientProfile
        fields = ['id', 'balance_available', 'balance_blocked']

class UserWithProfileSerializer(serializers.ModelSerializer):
    admin_profile = AdminProfileSerializer(read_only=True)
    client_profile = ClientProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'status', 'verified', 
                  'user_type', 'last_ip', 'referred_code', 'used_referred_code', 
                  'created_at', 'modified_at', 'is_active', 
                  'admin_profile', 'client_profile']
