from django.urls import path
from .views import alpha_vantage_views
from .views import stock_views  

urlpatterns = [
    # --- Alpha Vantage ---
    path('stocks/real-data/', alpha_vantage_views.get_real_stocks_data, name='real_stocks_data'),
    path('search/', alpha_vantage_views.search_stocks, name='search_stocks'),
    path('sync-stock/', alpha_vantage_views.sync_stock_with_real_data, name='sync_stock'),
    path('test/', alpha_vantage_views.test_alpha_vantage_connection, name='test_alpha_vantage'),

    # --- Stocks locales ---
    path('stocks/approved/', stock_views.get_approved_stocks, name='get_approved_stocks'),
    path('stocks/approve/', stock_views.approve_stocks, name='approve_stocks'),
    path('stocks/inactive/', stock_views.get_inactive_stocks, name='get_inactive_stocks'),
    path('stocks/<int:stock_id>/toggle/', stock_views.toggle_stock_status, name='toggle_stock_status'),
    path('stocks/remove/', stock_views.remove_stocks, name='remove_stocks'),

    path('stocks/refresh/', stock_views.refresh_stocks_prices, name='refresh_stocks_prices'),

    # Mantén esta al final
    path('stocks/<str:symbol>/', alpha_vantage_views.get_stock_real_time_detail, name='stock_real_time_detail'),
]
