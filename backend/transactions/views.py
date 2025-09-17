from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum

from .models import Transaction
from .serializers import TransactionSerializer, FullTransactionSerializer

# Create your views here.

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FullTransactionSerializer
        return TransactionSerializer
    
    @action(detail=False, methods=['get'], utl_path='summary')
    def summary(self, request):
        qs = self.get_queryset()

        start_date = request.query_params.get('start-date')
        end_date = request.query_params.get('end-date')

        if not start_date or not end_date:
            return Response({"error": "start-date and end-date are required."}, status=400)
        
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



