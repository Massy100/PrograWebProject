from django.urls import path
from .views import *

urlpatterns = [
    path('active/', list_active_stocks, name='list_active_stocks'),
    path('detail/', stock_detail_by_name, name='stock_detail_by_name'), # Query param: ?name=XYZ
    path('category/', stocks_by_category, name='stocks_by_category'), # Query param: ?category=CategoryName
    path('price-range/', stocks_by_price_range, name='stocks_by_price_range'), # Query params: ?min=10&max=100
]
