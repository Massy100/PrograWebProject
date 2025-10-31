from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import Stock, StockPrice
from rest_framework import status
from ..services.stock_services import *
from ..serializers import *
from django.utils import timezone
from rest_framework import status
import json
from portfolio.models import Investment 


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
    from ..services.alpha_vantage_service import AlphaVantageService
    service = AlphaVantageService()
    approved_stocks = []
    errors = []

    try:
        stocks_data = request.data.get('stocks', [])

        for stock_data in stocks_data:
            symbol = stock_data.get('symbol', '').upper()
            name = stock_data.get('name', symbol)

            if not symbol:
                errors.append({'error': 'Symbol is required', 'data': stock_data})
                continue

            stock, created = Stock.objects.get_or_create(
                symbol=symbol,
                defaults={'name': name, 'is_active': True}
            )

            api_data = service.get_stock_quote(symbol)
            print(f"DEBUG AlphaVantage ({symbol}):", api_data) 

            price = float(api_data.get('price', 0) or 0)
            change_percent = float(api_data.get('change_percent', 0) or 0)

            stock.name = name
            stock.last_price = price
            stock.variation = change_percent
            stock.updated_at = timezone.now()
            stock.is_active = True
            stock.save()

            StockPrice.objects.create(
                stock=stock,
                price=price
            )

            approved_stocks.append({
                'symbol': stock.symbol,
                'name': stock.name,
                'price': float(price),
                'variation': float(change_percent),
                'status': 'created' if created else 'updated'
            })

        return Response({
            'approved_stocks': approved_stocks,
            'errors': errors,
            'total_approved': len(approved_stocks),
            'total_errors': len(errors)
        }, status=201)

    except Exception as e:
        print("ERROR approve_stocks:", e)
        return Response({'error': str(e)}, status=400)


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


@api_view(['GET'])
def get_inactive_stocks(request):
    """Obtener las acciones desactivadas (is_active=False)."""
    try:
        stocks = Stock.objects.filter(is_active=False)
        serializer = StockSerializer(stocks, many=True)
        return Response({
            "data": serializer.data,
            "count": len(serializer.data),
            "last_updated": timezone.now().isoformat(),
            "source": "database"
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def refresh_stocks_prices(request):
    from ..services.alpha_vantage_service import AlphaVantageService
    service = AlphaVantageService()
    updated_stocks = []

    try:
        stocks = Stock.objects.filter(is_active=True)

        for stock in stocks:
            data = service.get_stock_quote(stock.symbol)

            if not data or "error" in data:
                continue

            stock.last_price = data.get("price")
            stock.variation = data.get("change_percent")
            stock.updated_at = timezone.now()
            stock.save(update_fields=["last_price", "variation", "updated_at"])
            StockPrice.objects.create(
                stock=stock,
                price=data.get("price"),
            )

            updated_stocks.append({
                "symbol": stock.symbol,
                "last_price": stock.last_price,
                "variation": stock.variation,
                "updated_at": stock.updated_at,
            })

        return Response({
            "message": f"{len(updated_stocks)} stocks updated successfully",
            "updated_stocks": updated_stocks
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def stock_detail(request, symbol):
    """
    Obtener el detalle de un stock específico por su símbolo (e.g. /api/stocks/AMZN/)
    """
    try:
        stock = Stock.objects.filter(symbol__iexact=symbol).select_related('category').first()
        if not stock:
            return Response({"error": "Stock not found"}, status=status.HTTP_404_NOT_FOUND)

        data = {
            "id": stock.id,
            "symbol": stock.symbol,
            "name": stock.name,
            "last_price": float(stock.last_price) if stock.last_price else 0,
            "variation": float(stock.variation) if stock.variation else 0,
            "updated_at": stock.updated_at,
            "created_at": stock.created_at,
            "is_active": stock.is_active,
            "category": {
                "id": stock.category.id if stock.category else None,
                "name": stock.category.name if stock.category else None
            } if stock.category else None
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def stock_price_history(request, symbol):
    """
    Obtener el historial de precios de un stock (últimos 30 registros)
    e.g. /api/stocks/AMZN/history/
    """
    try:
        stock = Stock.objects.filter(symbol__iexact=symbol).first()
        if not stock:
            return Response({"error": "Stock not found"}, status=status.HTTP_404_NOT_FOUND)

        prices = StockPrice.objects.filter(stock=stock).order_by('-recorded_at')[:30]

        data = [
            {
                "price": float(p.price),
                "recorded_at": p.recorded_at,
            }
            for p in prices
        ]

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def stock_price_history(request, symbol):
    """
    Devuelve el historial de precios de una acción específica,
    ordenado por fecha (más antiguo primero).
    """
    try:
        stock = Stock.objects.get(symbol=symbol.upper())
        prices = StockPrice.objects.filter(stock=stock).order_by("recorded_at")

        if not prices.exists():
            # Si no hay historial, simulamos datos temporales
            from random import uniform
            from datetime import timedelta
            from django.utils import timezone

            base_price = float(stock.last_price or 100)
            simulated = []
            for i in range(30):
                simulated.append({
                    "price": round(base_price + uniform(-5, 5), 2),
                    "recorded_at": (timezone.now() - timedelta(days=29 - i)).isoformat(),
                })
            return Response(simulated)

        history = [
            {"price": float(p.price), "recorded_at": p.recorded_at.isoformat()}
            for p in prices
        ]
        return Response(history)

    except Stock.DoesNotExist:
        return Response(
            {"error": f"Stock with symbol '{symbol}' not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def list_all_stocks(request):
    """
    Devuelve todos los stocks registrados (activos e inactivos).
    Endpoint: /api/stocks/
    """
    try:
        stocks = Stock.objects.all().select_related('category').order_by('symbol')

        data = [
            {
                "id": s.id,
                "symbol": s.symbol,
                "name": s.name,
                "category": s.category.name if s.category else None,
                "last_price": float(s.last_price) if s.last_price else 0,
                "variation": float(s.variation) if s.variation else 0,
                "is_active": s.is_active,
                "updated_at": s.updated_at,
            }
            for s in stocks
        ]

        return Response({
            "count": len(data),
            "stocks": data,
            "source": "database"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def stocks_by_portfolio(request):
    """
    Devuelve las acciones que pertenecen a un portafolio específico.
    Parámetro: ?portfolio_id=#
    """
    portfolio_id = request.query_params.get("portfolio_id")

    if not portfolio_id:
        return Response({"error": "Missing portfolio_id parameter"}, status=status.HTTP_400_BAD_REQUEST)

    investments = (
        Investment.objects.filter(portfolio_id=portfolio_id, is_active=True)
        .select_related("stock")
        .order_by("stock__symbol")
    )

    if not investments.exists():
        return Response({"message": "No investments found for this portfolio."}, status=status.HTTP_200_OK)

    data = []
    for inv in investments:
        stock = inv.stock
        data.append({
            "investment_id": inv.id,
            "stock_id": stock.id,
            "symbol": stock.symbol,
            "name": stock.name,
            "quantity": float(inv.quantity),
            "average_price": float(inv.average_price or 0),
            "total_invested": float(inv.total_invested or 0),
            "last_price": float(stock.last_price or 0),
            "variation": float(stock.variation or 0),
            # 🔹 Calculamos el valor actual dinámicamente:
            "current_value": float(inv.quantity * (stock.last_price or 0)),
            "updated_at": stock.updated_at,
        })

    return Response({
        "count": len(data),
        "portfolio_id": portfolio_id,
        "stocks": data,
    }, status=status.HTTP_200_OK)
