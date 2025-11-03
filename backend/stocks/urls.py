from django.urls import path

from .views.stock_views import *
from .views.category_views import *

urlpatterns = [
  
    # STOCKS ENDPOINTS
    path('', list_all_stocks, name='list_all_stocks'),
    path('active/', list_active_stocks, name='list_active_stocks'),
    path('by-name/', stock_detail_by_name, name='stock_detail_by_name'), # Query param: ?name=XYZ
    path('by-category/', stocks_by_category, name='stocks_by_category'), # Query param: ?category=CategoryName
    path('by-price-range/', stocks_by_price_range, name='stocks_by_price_range'), # Query params: ?min=10&max=100
    path('by-portfolio/', stocks_by_portfolio, name='stocks_by_portfolio'),

    # CATEGORIES ENDPOINTS

    path('categories/', list_active_categories, name='list_active_categories'),
    path('categories/detail/', category_detail_by_name, name='category_detail_by_name'), # Query param: ?name=CategoryName
    path('categories/save/', create_new_category, name='create_category'), # POST with JSON body {"name": "NewCategory"}
    path('categories/delete/', delete_category_by_id, name='delete_category_by_id'), # Query param: ?id=1


    path('<str:symbol>/', stock_detail, name='stock_detail'),
    path('<str:symbol>/history/', stock_price_history, name='stock_price_history'),
]
