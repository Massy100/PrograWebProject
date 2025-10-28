from django.db.models import Sum, F, ExpressionWrapper, DecimalField
from .models import PortfolioValueUpdates
from collections import defaultdict

class PortfolioService:
    @staticmethod
    def update_portfolio_values(portfolio):
        investments = portfolio.investment_set.filter(is_active=True)
        
        if not investments.exists():
            portfolio.total_inversion = 0
            portfolio.current_value = 0
            portfolio.average_price = 0
            portfolio.save()
            return
        
        total_data = investments.aggregate(
            total_invested=Sum(F('quantity') * F('purchase_price')),
            total_current=Sum(F('quantity') * F('stock__current_price'))
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

    def format_portfolio_values(data):
        grouped = defaultdict(lambda: {"portfolio_name": "", "values": []})
        for entry in data:
            pid = entry["portfolio_id"]
            grouped[pid]["portfolio_name"] = entry["portfolio__name"]
            grouped[pid]["values"].append({
                "month": entry["month"].strftime("%Y-%m"),
                "total_value": float(entry["total_value"]),
            })
        return [{"portfolio_id": pid, **info} for pid, info in grouped.items()]  
