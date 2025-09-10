from rest_framework import serializers
from .models import *

class StockPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockPrice
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class StockSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Stock
        fields = ['id', 'symbol', 
               'name', 'last_price', 
               'variation', 'updated_at', 
               'created_at', 'category']
