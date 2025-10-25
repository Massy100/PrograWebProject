# services/transaction_service.py
from decimal import Decimal
from django.db import transaction
from rest_framework import status
from ..models import Transaction, TransactionDetail
from ..serializers import TransactionSerializer
from users.models import ClientProfile
from stocks.models import Stock
from portfolio.models import Portfolio, Investment
from portfolio.services import PortfolioService


class TransactionService:

    def __init__(self, data):
        self.client_id = data.get('client_id')
        self.total_amount = Decimal(data.get('total_amount', 0))
        self.details = data.get('details', [])

    def process_buy(self):
        try:
            client = ClientProfile.objects.get(id=self.client_id)
        except ClientProfile.DoesNotExist:
            return {"data": {"error": "Client not found."}, "status": status.HTTP_404_NOT_FOUND}

        if client.balance_available < Decimal(self.total_amount):
            return {"data": {"error": "Insufficient balance."}, "status": status.HTTP_400_BAD_REQUEST}

        transaction_obj = Transaction.objects.create(
            code='TXN' + str(Transaction.objects.count() + 1).zfill(6),
            client=client,
            transaction_type='buy',
            total_amount=self.total_amount,
        )

        for item in self.details:
            try:
                stock = Stock.objects.get(id=item['stock_id'])
                portfolio = Portfolio.objects.get(id=item['portfolio_id'])
            except (Stock.DoesNotExist, Portfolio.DoesNotExist):
                transaction.set_rollback(True)
                return {"data": {"error": "Stock or Portfolio not found."}, "status": status.HTTP_404_NOT_FOUND}

            quantity = Decimal(item['quantity'])
            unit_price = Decimal(item['unit_price'])

            TransactionDetail.objects.create(
                transaction=transaction_obj,
                stock=stock,
                quantity=quantity,
                unit_price=unit_price,
            )

            investment, _ = Investment.objects.get_or_create(
                portfolio=portfolio,
                stock=stock,
                defaults={'quantity': 0, 'average_price': 0, 'total_invested': 0, 'purchase_price': 0}
            )

            total_qty = investment.quantity + quantity

            investment.average_price = (
                (investment.average_price * investment.quantity) + (unit_price * quantity)
            ) / total_qty

            investment.quantity = total_qty
            investment.total_invested = investment.quantity * investment.average_price
            investment.purchase_price = unit_price
            investment.current_value = (
                stock.last_price * investment.quantity if stock.last_price else 0
            )

            investment.save()
            updater = PortfolioService()
            updater.update_portfolio_values(portfolio=portfolio)

        client.balance_available -= Decimal(self.total_amount)
        client.save()

        serializer = TransactionSerializer(transaction_obj)
        return {"data": serializer.data, "status": status.HTTP_201_CREATED}

    def process_sell(self):
        try:
            client = ClientProfile.objects.get(id=self.client_id)
        except ClientProfile.DoesNotExist:
            return {"data": {"error": "Client not found."}, "status": status.HTTP_404_NOT_FOUND}

        transaction_obj = Transaction.objects.create(
            code='TXN' + str(Transaction.objects.count() + 1).zfill(6),
            client=client,
            transaction_type='sell',
            total_amount=self.total_amount,
        )

        for item in self.details:
            try:
                stock = Stock.objects.get(id=item['stock_id'])
                portfolio = Portfolio.objects.get(id=item['portfolio_id'])
                investment = Investment.objects.get(portfolio=portfolio, stock=stock)
            except (Stock.DoesNotExist, Portfolio.DoesNotExist, Investment.DoesNotExist):
                transaction.set_rollback(True)
                return {"data": {"error": "Stock, Portfolio or Investment not found."}, "status": status.HTTP_404_NOT_FOUND}

            quantity = Decimal(item['quantity'])
            unit_price = Decimal(item['unit_price'])

            if investment.quantity < quantity:
                transaction.set_rollback(True)
                return {"data": {"error": f"Not enough shares of {stock.symbol} to sell."}, "status": status.HTTP_400_BAD_REQUEST}

            TransactionDetail.objects.create(
                transaction=transaction_obj,
                stock=stock,
                quantity=quantity,
                unit_price=unit_price,
            )

            investment.quantity -= quantity
            investment.total_invested = investment.quantity * investment.average_price
            investment.current_value = stock.last_price * investment.quantity if stock.last_price else 0

            if investment.quantity == 0:
                investment.is_active = False

            investment.save()
            updater = PortfolioService()
            updater.update_portfolio_values(portfolio=portfolio)

        client.balance_available += Decimal(self.total_amount)
        client.save()

        serializer = TransactionSerializer(transaction_obj)
        return {"data": serializer.data, "status": status.HTTP_201_CREATED}
