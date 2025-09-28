from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..services.user_auth_services import *
from ..serializers import *

# Create your views here.

# GET
# User profile by role 
"""
ESTE ENDPOINT SE EJECUTA LUEGO DE HACER LOGIN
"""

@api_view(['GET'])

def get_loggedin_user_profile(request):
    user_id = request.query_params.get('user_id', None)
    user = get_user_by_id(user_id)

    if user:
        serializer = UserWithProfileSerializer(user)
        return Response(serializer.data)
    return Response({"error": "User not found"}, status=404)
