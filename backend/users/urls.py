from django.urls import path

from .views.user_auth_views import *

urlpatterns = [
  path('logged-user/', get_loggedin_user_profile, name='get_loggedin_user_profile'), # Query param: ?user_id=1
]