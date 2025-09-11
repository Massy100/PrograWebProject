from ..models import User

# GET 

# Get user type/roles

def get_user_profile_byrole(user_id):
  try:
      user = User.objects.get(id=user_id)
      if user.user_type == 'admin':
          return user.admin_profile
      elif user.user_type == 'client':
          return user.client_profile
      else:
          return None
  except User.DoesNotExist:
      return None
  except (
        AttributeError, 
        User.admin_profile.RelatedObjectDoesNotExist, 
        User.client_profile.RelatedObjectDoesNotExist
      ):
      return None
