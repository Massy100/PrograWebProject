from rest_framework import serializers
from stocks.serializers import StockSerializer
from .models import Portfolio, Investment

class InvestmentSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    current_value = serializers.SerializerMethodField()
    gain_loss = serializers.SerializerMethodField()
    gain_loss_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Investment
        fields = [
            'id', 'stock', 'quantity', 'purchase_price', 'purchased_at',
            'average_price', 'total_invested', 'current_value', 'gain_loss',
            'gain_loss_percentage', 'is_active'
        ]

    def get_current_value(self, obj):
        return obj.quantity * obj.stock.current_price

    def get_gain_loss(self, obj):
        current_value = obj.quantity * obj.stock.current_price
        invested = obj.quantity * obj.purchase_price
        return current_value - invested

    def get_gain_loss_percentage(self, obj):
        invested = obj.quantity * obj.purchase_price
        if invested == 0:
            return 0
        gain_loss = self.get_gain_loss(obj)
        return (gain_loss / invested) * 100

class PortfolioSerializer(serializers.ModelSerializer):
    investments = InvestmentSerializer(many=True, read_only=True)
    total_gain_loss = serializers.SerializerMethodField()
    total_gain_loss_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Portfolio
        fields = [
            'id', 'name', 'client', 'created_at', 'average_price',
            'total_inversion', 'current_value', 'is_active',
            'investments', 'total_gain_loss', 'total_gain_loss_percentage'
        ]

    def get_total_gain_loss(self, obj):
        return obj.current_value - obj.total_inversion

    def get_total_gain_loss_percentage(self, obj):
        if obj.total_inversion == 0:
            return 0
        return ((obj.current_value - obj.total_inversion) / obj.total_inversion) * 100

class PortfolioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = ['name', 'client']