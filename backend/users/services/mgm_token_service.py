import requests
from django.conf import settings

class ManagementService:
  def get_management_token(self):
      url = f"https://{settings.AUTH0_DOMAIN}/oauth/token"
      payload = {
          "client_id": settings.AUTH0_MANAGEMENT_CLIENT_ID,
          "client_secret": settings.AUTH0_CLIENT_SECRET,
          "audience": settings.AUTH0_AUDIENCE,
          "grant_type": "client_credentials"
      }
      res = requests.post(url, json=payload)
      res.raise_for_status()
      return res.json()["access_token"]
