from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..services.stock_services import *
from ..serializers import *
from django.utils import timezone
from rest_framework import status
import json

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

@api_view(['POST'])
def approve_stocks(request):
    try:
        stocks_data = request.data.get('stocks', [])
        approved_stocks = []
        errors = []
        
        for stock_data in stocks_data:
            symbol = stock_data.get('symbol', '').upper()
            name = stock_data.get('name', symbol)
            
            if not symbol:
                errors.append({'error': 'Symbol is required', 'data': stock_data})
                continue
            
            try:
                stock, created = Stock.objects.get_or_create(
                    symbol=symbol,
                    defaults={
                        'name': name,
                        'is_active': True
                    }
                )
                
                if created:
                    approved_stocks.append({
                        'symbol': stock.symbol,
                        'name': stock.name,
                        'status': 'created'
                    })
                else:
                    if not stock.is_active:
                        stock.is_active = True
                        stock.save()
                    
                    approved_stocks.append({
                        'symbol': stock.symbol,
                        'name': stock.name,
                        'status': 'reactivated' if not stock.is_active else 'already_exists'
                    })
                    
            except Exception as e:
                errors.append({
                    'symbol': symbol,
                    'error': str(e)
                })
        
        return Response({
            'approved_stocks': approved_stocks,
            'errors': errors,
            'total_approved': len(approved_stocks),
            'total_errors': len(errors)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_approved_stocks(request):
    try:
        stocks = Stock.objects.filter(is_active=True)
        
        av_service = AlphaVantageService()
        stocks_with_real_data = []
        
        for stock in stocks:
            try:
                real_data = av_service.get_stock_quote(stock.symbol)
                
                if 'error' not in real_data:
                    stock.last_price = real_data['price']
                    stock.variation = real_data['change_percent']
                    stock.updated_at = timezone.now()
                    stock.save()
                    
                    change_pct = real_data['change_percent']
                    if change_pct > 5:
                        recommendation = 'STRONG BUY'
                    elif change_pct > 2:
                        recommendation = 'BUY'
                    elif change_pct < -5:
                        recommendation = 'STRONG SELL'
                    elif change_pct < -2:
                        recommendation = 'SELL'
                    else:
                        recommendation = 'HOLD'
                    
                    stocks_with_real_data.append({
                        'id': stock.id,
                        'symbol': stock.symbol,
                        'name': stock.name,
                        'last_price': float(real_data['price']),
                        'variation': float(real_data['change_percent']),
                        'currentPrice': float(real_data['price']),
                        'changePct': float(real_data['change_percent']),
                        'recommendation': recommendation,
                        'updated_at': stock.updated_at,
                        'is_active': stock.is_active
                    })
                else:
                    stocks_with_real_data.append({
                        'id': stock.id,
                        'symbol': stock.symbol,
                        'name': stock.name,
                        'last_price': float(stock.last_price) if stock.last_price else 0,
                        'variation': float(stock.variation) if stock.variation else 0,
                        'currentPrice': float(stock.last_price) if stock.last_price else 0,
                        'changePct': float(stock.variation) if stock.variation else 0,
                        'recommendation': 'HOLD',
                        'updated_at': stock.updated_at,
                        'is_active': stock.is_active,
                        'error': real_data.get('error', 'No real-time data')
                    })
                    
            except Exception as e:
                stocks_with_real_data.append({
                    'id': stock.id,
                    'symbol': stock.symbol,
                    'name': stock.name,
                    'last_price': float(stock.last_price) if stock.last_price else 0,
                    'variation': float(stock.variation) if stock.variation else 0,
                    'currentPrice': float(stock.last_price) if stock.last_price else 0,
                    'changePct': float(stock.variation) if stock.variation else 0,
                    'recommendation': 'HOLD',
                    'updated_at': stock.updated_at,
                    'is_active': stock.is_active,
                    'error': str(e)
                })
        
        return Response({
            'data': stocks_with_real_data,
            'count': len(stocks_with_real_data),
            'last_updated': timezone.now().isoformat(),
            'source': 'database_with_alpha_vantage'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def toggle_stock_status(request, stock_id):
    try:
        stock = Stock.objects.get(id=stock_id)
        stock.is_active = not stock.is_active
        stock.save()
        
        return Response({
            'symbol': stock.symbol,
            'name': stock.name,
            'is_active': stock.is_active,
            'message': f"Stock {'activated' if stock.is_active else 'deactivated'}"
        })
        
    except Stock.DoesNotExist:
        return Response({'error': 'Stock not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def remove_stocks(request):
    try:
        symbols = request.data.get('symbols', [])
        removed_stocks = []
        
        for symbol in symbols:
            try:
                stock = Stock.objects.get(symbol=symbol)
                stock.is_active = False
                stock.save()
                removed_stocks.append(stock.symbol)
            except Stock.DoesNotExist:
                continue
        
        return Response({
            'removed_stocks': removed_stocks,
            'message': f'{len(removed_stocks)} stocks removed from system'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
