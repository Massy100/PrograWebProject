from django.urls import path
from rest_framework.routers import SimpleRouter
from .views import BankViewSet, FundsTransferViewSet

router = SimpleRouter()
router.register(r'banks', BankViewSet, basename='bank')
router.register(r'fundstransfers', FundsTransferViewSet, basename='fundstransfer')

urlpatterns = router.urls
