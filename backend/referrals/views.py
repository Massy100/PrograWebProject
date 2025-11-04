# referrals/views.py - Versión corregida para Auth0
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from .models import ReferralCode, Referral
from users.models import User
import json
from django.utils import timezone
import jwt
from django.conf import settings

def get_user_from_token(request):
    """Extraer el usuario del token JWT de Auth0"""
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
            
        token = auth_header.split(' ')[1]
        
        # Decodificar el token JWT (sin verificar para desarrollo)
        # En producción deberías verificar la firma
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        # En Auth0, el email suele estar en el token
        user_email = decoded.get('email')
        if user_email:
            try:
                return User.objects.get(email=user_email)
            except User.DoesNotExist:
                return None
                
    except Exception as e:
        print(f"Error getting user from token: {e}")
        return None
    
    return None

@method_decorator(csrf_exempt, name='dispatch')
class ValidateReferralCodeView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            referral_code = data.get('referral_code')
            
            print(f"Validating referral code: {referral_code}")
            
            if not referral_code:
                return JsonResponse({
                    'valid': False,
                    'message': 'Referral code is required'
                }, status=400)
            
            # Validar que sea numérico y de 5 dígitos
            if not referral_code.isdigit() or len(referral_code) != 5:
                return JsonResponse({
                    'valid': False,
                    'message': 'Referral code must be 5 digits'
                }, status=400)
            
            try:
                referral_code_obj = ReferralCode.objects.get(
                    code=referral_code,
                    is_active=True
                )
                
                print(f"Found code: {referral_code_obj.code} for user: {referral_code_obj.user.username}")
                
                # Validar si el código ha expirado
                if referral_code_obj.is_expired():
                    return JsonResponse({
                        'valid': False,
                        'message': 'This referral code has expired'
                    }, status=400)
                
                # Obtener usuario del token para validar que no use su propio código
                current_user = get_user_from_token(request)
                if current_user and current_user.id == referral_code_obj.user.id:
                    return JsonResponse({
                        'valid': False,
                        'message': 'You cannot use your own referral code'
                    }, status=400)
                
                return JsonResponse({
                    'valid': True,
                    'message': 'Valid referral code',
                    'referrer_name': f"{referral_code_obj.user.full_name or referral_code_obj.user.username}"
                })
                
            except ReferralCode.DoesNotExist:
                print("❌ Code not found")
                return JsonResponse({
                    'valid': False,
                    'message': 'Invalid referral code'
                }, status=404)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'valid': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return JsonResponse({
                'valid': False,
                'message': f'Error validating referral code: {str(e)}'
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ProcessReferralView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            referral_code = data.get('referral_code')
            
            print(f"Processing referral: {referral_code}")
            
            if not referral_code:
                return JsonResponse({
                    'success': False,
                    'message': 'Referral code is required'
                }, status=400)
            
            # Obtener usuario actual del token
            referred_user = get_user_from_token(request)
            if not referred_user:
                return JsonResponse({
                    'success': False,
                    'message': 'User not found'
                }, status=404)
            
            try:
                # Validar el código de referido
                referral_code_obj = ReferralCode.objects.get(
                    code=referral_code,
                    is_active=True
                )
                
                if referral_code_obj.is_expired():
                    return JsonResponse({
                        'success': False,
                        'message': 'This referral code has expired'
                    }, status=400)
                
                # Verificar si ya existe un referral para este usuario con este código
                existing_referral = Referral.objects.filter(
                    referred=referred_user,
                    code_used=referral_code
                ).exists()
                
                if existing_referral:
                    return JsonResponse({
                        'success': False,
                        'message': 'This referral code has already been used'
                    }, status=400)
                
                # Crear el referral
                referral = Referral.objects.create(
                    referrer=referral_code_obj.user,
                    referred=referred_user,
                    code_used=referral_code,
                    bonus_amount=5.00,
                    processed=True,
                    is_active=True
                )
                
                print(f"Referral created: {referral.id}")
                
                return JsonResponse({
                    'success': True,
                    'message': 'Referral processed successfully',
                    'referral_id': referral.id
                })
                
            except ReferralCode.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid referral code'
                }, status=404)
                
        except Exception as e:
            print(f"Error processing referral: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': f'Error processing referral: {str(e)}'
            }, status=500)