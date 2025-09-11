from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt

from .category_services import *
from .serializers import *

# Create your views here.
@api_view(['GET'])
def list_active_categories(request):
    categories = get_all_active_categories()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def category_detail_by_name(request):
    name = request.query_params.get('name', None)
    category = get_category_by_name(name)
    if category:
        serializer = CategorySerializer(category)
        return Response(serializer.data)
    return Response({"error": "Category not found"}, status=404)

@api_view(['POST'])
def create_new_category(request):
    name = request.data.get('name', None)
    if name:
        category = create_category(name, True)
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=201)
    return Response({"error": "Name is required"}, status=400)

@api_view(['DELETE'])
def delete_category_by_id(request):
    idx = request.query_params.get('id', None)
    success = delete_category(idx)
    if success:
        return Response({"message": "Category deleted"}, status=200)
    return Response({"error": "Category not found"}, status=404)
