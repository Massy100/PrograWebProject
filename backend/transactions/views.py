from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum
from django.db import transaction

from .models import Transaction, TransactionDetail

from .serializers import TransactionSerializer, FullTransactionSerializer

from users.models import ClientProfile
from stocks.models import Stock
from portfolio.models import Portfolio, Investment

# Create your views here.

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FullTransactionSerializer
        return TransactionSerializer
    
    @transaction.atomic
    @action(detail=False, methods=['post'], url_path='buy')
    def buy(self, request):
        data = request.data
        client_id = data.get('client_id')
        total_amount = data.get('total_amount')
        details = data.get('details', [])

        try:
            client = ClientProfile.objects.get(id=client_id)
        except ClientProfile.DoesNotExist:
            return Response({"error": "Client not found."}, status=404)

        if client.balance_available < total_amount:
            return Response({"error": "Insufficient balance."}, status=400)

        transaction_obj = Transaction.objects.create(
            code='TXN' + str(Transaction.objects.count() + 1).zfill(6),
            client=client,
            transaction_type='buy',
            total_amount=total_amount,
        )

        for item in details:
            stock_id = item.get('stock_id')
            quantity = item.get('quantity')
            unit_price = item.get('unit_price')
            portfolio_id = item.get('portfolio_id')

            try:
                stock = Stock.objects.get(id=stock_id)
                portfolio = Portfolio.objects.get(id=portfolio_id)
            except (Stock.DoesNotExist, Portfolio.DoesNotExist):
                transaction.set_rollback(True)
                return Response({"error": "Stock or Portfolio not found."}, status=404)
            
            TransactionDetail.objects.create(
                transaction=transaction_obj,
                stock=stock,
                quantity=quantity,
                unit_price=unit_price,
            )

            investment, created = Investment.objects.get_or_create(
                portfolio=portfolio,
                stock=stock,
                defaults={'quantity': 0, 'average_price': 0}
            )

            total_qty = investment.quantity + quantity
            investment.average_price = (
                (investment.average_price * investment.quantity) + (unit_price * quantity)
            ) / total_qty

            investment.quantity = total_qty
            investment.save()

        client.balance_available -= total_amount

    
    @action(detail=False, methods=['get'], url_path='bought')
    def bought(self, request):
        qs = self.get_queryset().filter(transaction_type='buy')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='sold')
    def sold(self, request):
        qs = self.get_queryset().filter(transaction_type='sell')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        qs = self.get_queryset()

        start_date = request.query_params.get('start-date')
        end_date = request.query_params.get('end-date')

        if start_date and end_date:
            qs = qs.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)
        
        transactions_count = qs.count()
        buy_count = qs.filter(transaction_type='buy').count()
        sell_count = qs.filter(transaction_type='sell').count()
        invested_total = qs.filter(transaction_type='buy').aggregate(total=Sum('total_amount'))['total'] or 0
        earned_total = qs.filter(transaction_type='sell').aggregate(total=Sum('total_amount'))['total'] or 0

        transactions = TransactionSerializer(qs, many=True)

        return Response({
            "transactions_count": transactions_count,
            "buy_count": buy_count,
            "sell_count": sell_count,
            "invested_total": invested_total,
            "earned_total": earned_total,
            "transactions": transactions.data
        })



