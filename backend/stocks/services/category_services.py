from ..models import *


# GET

def get_all_active_categories(is_active=True):
    return (
        Category.objects
        .filter(is_active=is_active)
    )

def get_category_by_name(name):
    try:
        return (
            Category.objects
            .get(name=name)
        ) 
    except Category.DoesNotExist:
        return None

# POST

def create_category(name, is_active=True):
    category = Category.objects.create(name=name, is_active=is_active)
    return category


# DELETE

def delete_category(id):
    try:
        category = Category.objects.get(id=id)
        category.delete()
        return True
    except Category.DoesNotExist:
        return False
