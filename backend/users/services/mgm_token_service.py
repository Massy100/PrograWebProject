import requests
from django.conf import settings
import os

class ManagementService:
  def get_management_token(self):
      url = f"https://{settings.AUTH0_DOMAIN}/oauth/token"
      payload = {
          "client_id": os.getenv("AUTH0_MANAGEMENT_CLIENT_ID"),
          "client_secret": os.getenv("AUTH0_CLIENT_SECRET"),
          "audience": os.getenv("AUTH0_AUDIENCE"),
          "grant_type": "client_credentials"
      }
      res = requests.post(url, json=payload)
      res.raise_for_status()
      return res.json()["access_token"]

  def auth0_get_roles(self, user_id):
    token = self.get_management_token()
    url = f"https://{settings.AUTH0_DOMAIN}/api/v2/users/{user_id}/roles"
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(url, headers=headers, timeout=10)
    r.raise_for_status()
    return r.json()
  
  def auth0_assign_role(self, user_id, role_id):
    token = self.get_management_token()
    url = f"https://{settings.AUTH0_DOMAIN}/api/v2/users/{user_id}/roles"
    payload = {
      "roles": [role_id]
    }
    headers = {
      "Content-Type": "application/json",
      "Authorization": f"Bearer {token}"
    }
    r = requests.post(url, json=payload, headers=headers, timeout=10)
    r.raise_for_status()
    return r
