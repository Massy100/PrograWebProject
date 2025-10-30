from users.models import User
from django.utils import timezone

class DtoService:
  def Auth0AdminPayload(self, data: dict) -> dict:
    return {
            "email": data["email"],
            "user_metadata": {},
            "blocked": False,
            "email_verified": False,
            "app_metadata": {},
            "given_name": data.get("full_name"),
            "family_name": data.get("full_name"),
            "name": data.get("full_name"),
            "nickname": data.get("username"),
            "connection": "Username-Password-Authentication",  
            "password": data["password"],
            "verify_email": False,
    }
  
  def SaveFullDBUser(self, data: dict, passwd: str, auth0_id: str) -> dict:
        User.objects.create(
            username=data["username"],
            email=data["email"],
            full_name=data.get("full_name", ""),
            phone=data.get("phone", ""),
            user_type='admin',
            password=passwd,
            auth0_id=auth0_id,
            verified=True,
            is_staff=True,
            is_completed=True,
            is_superuser=True
        )

  def UserDefaults(self, data: dict, auth0_id: str) -> dict:
        return {
            'email': data.get("email"), 
            'full_name': data.get("name"), 
            'created_at': data.get("created_at"),
            'modified_at': data.get("updated_at"),
            'last_login': timezone.now(),
            'username': data.get("nickname"),
            'auth0_id': auth0_id,
            'user_type': "client"
        }
