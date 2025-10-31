from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum
from django.db import transaction

from .models import Transaction

from .serializers import TransactionSerializer, FullTransactionSerializer

from .services.transaction_service import TransactionService

# Create your views here.

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    http_method_names = ['get', 'post']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FullTransactionSerializer
        return TransactionSerializer

    @transaction.atomic
    @action(detail=False, methods=['post'], url_path='buy')
    def buy(self, request):
        service = TransactionService(request.data)
        result = service.process_buy()
        return Response(result['data'], status=result['status'])

    @transaction.atomic
    @action(detail=False, methods=['post'], url_path='sell')
    def sell(self, request):
        service = TransactionService(request.data)
        result = service.process_sell()
        return Response(result['data'], status=result['status'])

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



