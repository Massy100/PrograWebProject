from rest_framework import serializers
from .models import *


class TransactionDetailSerializer(serializers.ModelSerializer):
    stock = serializers.CharField(source='stock.name', read_only=True)

    class Meta:
        model = TransactionDetail
        fields = ['stock_name', 'quantity', 'unit_price']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['code', 'transaction_type', 'total_amount', 'created_at', 'is_active']

class FullTransactionSerializer(serializers.ModelSerializer):
    details = TransactionDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Transaction
        fields = ['code', 'transaction_type', 'total_amount', 'created_at', 'is_active', 'details']
