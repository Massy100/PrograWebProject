from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CLIENT = 'client'
    USER_TYPE_ADMIN = 'admin'
    
    USER_TYPES = (
        (USER_TYPE_CLIENT, 'Client'),
        (USER_TYPE_ADMIN, 'Administrator'),
    )
    
    auth0_id = models.CharField(max_length=100, default="pending_migration")
    username = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    status = models.BooleanField(default=True)
    verified = models.BooleanField(default=False)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default=USER_TYPE_CLIENT)
    last_ip = models.GenericIPAddressField(blank=True, null=True)
    referred_code = models.CharField(max_length=100, blank=True, null=True)
    used_referred_code = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.username
    
    def is_client(self):
        return self.user_type == self.USER_TYPE_CLIENT
    
    def is_admin(self):
        return self.user_type == self.USER_TYPE_ADMIN
    
    def get_profile(self):
        if self.is_client():
            return getattr(self, 'client_profile', None)
        elif self.is_admin():
            return getattr(self, 'admin_profile', None)
        return None

class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    access_level = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Admin Profile: {self.user.username}"

class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    balance_available = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_blocked = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Client Profile: {self.user.username}"
    
class AdminPermissionsRequest(models.Model):

    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    
    STATUS_CHOICES = (
        (STATUS_PENDING, 'Pending'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='to_admin_request')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review', null=True)
    reviewed_at = models.DateTimeField(null=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review posted by: {self.user.username}"


