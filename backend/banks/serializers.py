from rest_framework import serializers
from .models import Bank, FundsTransfer

class BankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank
        fields = '__all__'

class FundsTransferSerializer(serializers.ModelSerializer):
    bank = BankSerializer(read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = FundsTransfer
        fields = ['id', 'reference_code', 'user', 'user_name', 'bank', 'amount', 'transfer_date']
        