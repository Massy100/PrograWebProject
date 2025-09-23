from django.http import JsonResponse

class ClientRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if not hasattr(request.user, 'is_client') or not request.user.is_client():
            return JsonResponse({'error': 'Client access required'}, status=403)
        
        return super().dispatch(request, *args, **kwargs)

class AdminRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if not hasattr(request.user, 'is_admin') or not request.user.is_admin():
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        return super().dispatch(request, *args, **kwargs)