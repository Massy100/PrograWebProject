from rest_framework.permissions import BasePermission
from rest_framework import status
from rest_framework.response import Response
import os

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        token = getattr(request, 'auth', {}) or {}
        api_id = os.getenv("AUTH0_API_IDENTIFIER")
        roles = token.get(f"{api_id}/roles", [])
        return 'admin' in roles

class IsClientRole(BasePermission):
    def has_permission(self, request, view):
        token = getattr(request, 'auth', {}) or {}
        api_id = os.getenv("AUTH0_API_IDENTIFIER")
        roles = token.get(f"{api_id}/roles", [])
        return 'client' in roles
