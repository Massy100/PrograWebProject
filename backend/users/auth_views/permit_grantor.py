from ..models import ClientProfile


class PermitGrantor:
    def __init__(self, user):
        # Lógica para otorgar permisos
        user.user_type = user.USER_TYPE_CLIENT
        user.verified = True
        user.save()

        # Crear perfil de administrador si no existe
        if not hasattr(user, 'client_profile'):
            ClientProfile.objects.create(
                user=user,
                balance_available=0,
                balance_blocked=0
            )
