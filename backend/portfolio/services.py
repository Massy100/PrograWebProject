from django.db.models import Sum, F, ExpressionWrapper, DecimalField
from .models import PortfolioValueUpdates
from collections import defaultdict

class PortfolioService:
    @staticmethod
    def update_portfolio_values(portfolio):
        """Recalcula los valores del portafolio según las inversiones activas"""
        investments = portfolio.investment_set.filter(is_active=True)

        if not investments.exists():
            portfolio.total_inversion = 0
            portfolio.current_value = 0
            portfolio.average_price = 0
            portfolio.save()
            return

        total_data = investments.aggregate(
            total_invested=Sum(
                ExpressionWrapper(
                    F('quantity') * F('purchase_price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),
            total_current=Sum(
                ExpressionWrapper(
                    F('quantity') * F('stock__last_price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),
        )

        portfolio.total_inversion = total_data['total_invested'] or 0
        portfolio.current_value = total_data['total_current'] or 0

        total_quantity = investments.aggregate(total=Sum('quantity'))['total'] or 0
        if total_quantity > 0:
            portfolio.average_price = portfolio.total_inversion / total_quantity
        else:
            portfolio.average_price = 0

        portfolio.save()
        PortfolioValueUpdates.objects.create(
            portfolio=portfolio,
            value=portfolio.current_value
        )

    @staticmethod
    def format_portfolio_values(data):
        """Formatea los valores agrupados por portafolio y mes"""
        grouped = defaultdict(lambda: {"portfolio_name": "", "values": []})
        for entry in data:
            pid = entry["portfolio_id"]
            grouped[pid]["portfolio_name"] = entry["portfolio__name"]
            grouped[pid]["values"].append({
                "month": entry["month"].strftime("%Y-%m"),
                "total_value": float(entry["total_value"]),
            })
        return [{"portfolio_id": pid, **info} for pid, info in grouped.items()]
