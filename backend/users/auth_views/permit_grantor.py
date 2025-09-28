from ..models import User, AdminProfile


class PermitGrantor:
    def __init__(self, user):
        # Lógica para otorgar permisos
        user.user_type = user.USER_TYPE_ADMIN
        user.save()

        # Crear perfil de administrador si no existe
        if not hasattr(user, 'admin_profile'):
            AdminProfile.objects.create(user=user, access_level='standard')
