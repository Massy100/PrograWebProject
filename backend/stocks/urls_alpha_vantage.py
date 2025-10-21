from django.urls import path
from .views import alpha_vantage_views

urlpatterns = [
    path('stocks/real-data/', alpha_vantage_views.get_real_stocks_data, name='real_stocks_data'),
    path('stocks/<str:symbol>/', alpha_vantage_views.get_stock_real_time_detail, name='stock_real_time_detail'),
    path('search/', alpha_vantage_views.search_stocks, name='search_stocks'),
    path('sync-stock/', alpha_vantage_views.sync_stock_with_real_data, name='sync_stock'),
    path('test/', alpha_vantage_views.test_alpha_vantage_connection, name='test_alpha_vantage'),
]