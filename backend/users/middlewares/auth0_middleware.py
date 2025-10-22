import json
from jose import jwt
from urllib.request import urlopen
from django.http import JsonResponse
from django.conf import settings

def auth0_middleware(get_response):
    def middleware(request):
        auth = request.headers.get('Authorization', None)
        if not auth:
            return get_response(request)  # permite acceso libre a endpoints publicos

        token = auth.split("Bearer ")[-1]
        try:
            jwks_url = f"https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json"
            jwks = json.loads(urlopen(jwks_url).read())

            unverified_header = jwt.get_unverified_header(token)
            rsa_key = {}
            for key in jwks['keys']:
                if key['kid'] == unverified_header['kid']:
                    rsa_key = {
                        'kty': key['kty'],
                        'kid': key['kid'],
                        'use': key['use'],
                        'n': key['n'],
                        'e': key['e']
                    }
            if rsa_key:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=settings.AUTH0_ALGORITHMS,
                    audience=settings.AUTH0_API_IDENTIFIER,
                    issuer=f"https://{settings.AUTH0_DOMAIN}/"
                )
                request.auth0_payload = payload
        except Exception as e:
            return JsonResponse({'error': 'Invalid token', 'details': str(e)}, status=401)

        return get_response(request)
    return middleware
