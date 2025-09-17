from rest_framework.routers import DefaultRouter

from .views import TransactionViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = router.urls

"""
created urls:
/api/transactions/ 
/api/transactions/{pk}/ 
/api/transactions/summary/ params: start-date, end-date
/api/transactions/bought/
/api/transactions/sold/
"""