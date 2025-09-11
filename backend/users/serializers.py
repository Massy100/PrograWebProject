from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'status', 'verified', 
                  'user_type', 'last_ip', 'referred_code', 'used_referred_code', 
                  'created_at', 'modified_at', 'is_active']

class AdminProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = AdminProfile
        fields = ['id', 'user', 'access_level']

class ClientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ClientProfile
        fields = ['id', 'user', 'balance_available', 'balance_blocked']
        