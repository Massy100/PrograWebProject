from rest_framework.response import Response
from rest_framework.decorators import api_view
from .stock_services import *
from .serializers import *

# Create your views here.

@api_view(['GET'])
def list_active_stocks(request):
    stocks = get_all_active_stocks()
    serializer = StockSerializer(stocks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def stock_detail_by_name(request):
    name = request.query_params.get('name', None)
    stock = get_stock_by_name(name)
    if stock:
        serializer = StockSerializer(stock)
        return Response(serializer.data)
    return Response({"error": "Stock not found"}, status=404)

@api_view(['GET'])
def stocks_by_category(request):
    category_name = request.query_params.get('category', None)
    stocks = get_stocks_by_category(category_name)
    serializer = StockSerializer(stocks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def stocks_by_price_range(request):
    min_price = request.query_params.get('min', 0)
    max_price = request.query_params.get('max', 1000000)
    stocks = get_stocks_by_price_range(min_price, max_price)
    serializer = StockSerializer(stocks, many=True)
    return Response(serializer.data)
