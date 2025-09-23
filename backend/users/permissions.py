from functools import wraps
from django.http import JsonResponse

def client_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if not hasattr(request.user, 'is_client') or not request.user.is_client():
            return JsonResponse({'error': 'Client access required'}, status=403)
        
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def admin_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if not hasattr(request.user, 'is_admin') or not request.user.is_admin():
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        return view_func(request, *args, **kwargs)
    return _wrapped_view