from rest_framework import serializers
from .models import Transaction, TransactionDetail
from users.models import ClientProfile

class TransactionDetailSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    stock_name = serializers.CharField(source='stock.name', read_only=True)

    class Meta:
        model = TransactionDetail
        fields = ['id', 'stock_symbol', 'stock_name', 'quantity', 'unit_price']


class TransactionSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    stock_symbol = serializers.SerializerMethodField()
    quantity = serializers.SerializerMethodField()
    unit_price = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id',
            'code',
            'transaction_type',
            'total_amount',
            'created_at',
            'is_active',
            'client_name',
            'stock_symbol',
            'quantity',
            'unit_price',
        ]

    def get_client_name(self, obj):
        try:
            return obj.client.user.full_name or obj.client.user.username
        except AttributeError:
            return "Unknown"

    def get_stock_symbol(self, obj):
        detail = TransactionDetail.objects.filter(transaction=obj).first()
        return detail.stock.symbol if detail and detail.stock else "—"

    def get_quantity(self, obj):
        detail = TransactionDetail.objects.filter(transaction=obj).first()
        return detail.quantity if detail else None

    def get_unit_price(self, obj):
        detail = TransactionDetail.objects.filter(transaction=obj).first()
        return detail.unit_price if detail else None


class FullTransactionSerializer(serializers.ModelSerializer):
    details = TransactionDetailSerializer(many=True, read_only=True, source='transactiondetail_set')
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id',
            'code',
            'transaction_type',
            'total_amount',
            'created_at',
            'is_active',
            'client_name',
            'details',
        ]

    def get_client_name(self, obj):
        try:
            return obj.client.user.full_name or obj.client.user.username
        except AttributeError:
            return "Unknown"
