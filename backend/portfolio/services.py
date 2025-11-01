from django.db.models import Sum, F, ExpressionWrapper, DecimalField
from .models import PortfolioValueUpdates, Portfolio
from collections import defaultdict
from datetime import datetime
from django.utils.timezone import make_aware

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
            total_current=Sum(F('quantity') * F('stock__last_price'))
        )
        
        portfolio.total_inversion = total_data['total_invested'] or 0
        portfolio.current_value = total_data['total_current'] or 0
        
        total_quantity = investments.aggregate(total=Sum('quantity'))['total'] or 0
        if total_quantity > 0:
            portfolio.average_price = portfolio.total_inversion / total_quantity
        else:
            portfolio.average_price = 0
            
        portfolio.save()


    def get_portfolio_gain(portfolio_id, start_date, end_date):

        s_date = make_aware(datetime.strptime(start_date, "%Y-%m-%d"));
        e_date = make_aware(datetime.strptime(end_date, "%Y-%m-%d"));

        qs = PortfolioValueUpdates.objects.filter(
            portfolio_id=portfolio_id,
            update_date__range=(s_date, e_date)
        )

        portfolio = Portfolio.objects.filter(id=portfolio_id).first()

        first = qs.order_by('update_date').first()
        last = qs.order_by('-update_date').first()

        if not first or not last:
            return {"gain": 0, "gain_percent": 0}

        gain = last.value - first.value
        gain_percent = (gain / first.value * 100) if first.value != 0 else 0

        return {
            "portfolio_id": portfolio_id,
            "initial_value": float(first.value),
            "final_value": float(last.value),
            "balance": float(portfolio.current_value) if portfolio else 0,
            "total_invested": float(portfolio.total_inversion) if portfolio else 0,
            "gain": float(gain),
            "gain_percent": round(float(gain_percent), 2),
            "start": first.update_date,
            "end": last.update_date
        }

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
    