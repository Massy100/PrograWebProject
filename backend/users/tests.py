from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from .models import ClientProfile, AdminProfile

User = get_user_model()

class PermissionTests(TestCase):
    def setUp(self):
        self.client = Client()
        
        self.admin_user = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            password='testpass123',
            user_type='admin',
            verified=True
        )
        
        self.client_user = User.objects.create_user(
            username='client_test',
            email='client@test.com',
            password='testpass123',
            user_type='client',
            verified=True
        )
        
        AdminProfile.objects.create(user=self.admin_user, access_level='full')
        ClientProfile.objects.create(user=self.client_user, balance_available=1000.00)
    
    def test_client_portfolio_access(self):
        """Client can access their portfolio"""
        self.client.login(username='client_test', password='testpass123')
        response = self.client.get('/client/portfolio/')
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, encoding='utf8'), 
                            {'message': 'Client portfolio'})
    
    def test_client_portfolio_denied_to_admin(self):
        """Admin CANNOT access client portfolio"""
        self.client.login(username='admin_test', password='testpass123')
        response = self.client.get('/client/portfolio/')
        self.assertEqual(response.status_code, 403)
        self.assertIn('error', response.json())
    
    def test_admin_user_management_access(self):
        """Admin can access user management"""
        self.client.login(username='admin_test', password='testpass123')
        response = self.client.get('/administrator/users/')
        
        if response.status_code == 302:
            print(f"REDIRECCIÓN DETECTADA: {response.url}")
            print(f"Usuario autenticado: {self.client._credentials}")
        
        self.assertEqual(response.status_code, 200)
    
    def test_admin_user_management_denied_to_client(self):
        """Client CANNOT access user management"""
        self.client.login(username='client_test', password='testpass123')
        response = self.client.get('/administrator/users/')
        self.assertEqual(response.status_code, 403)
        self.assertIn('error', response.json())
    
    def test_unauthenticated_access_denied(self):
        """Unauthenticated user receives 401 error"""
        response = self.client.get('/client/portfolio/')
        self.assertEqual(response.status_code, 401)
        self.assertIn('error', response.json())
    
    def test_stock_management_class_based_view(self):
        """Admin can access stock management"""
        self.client.login(username='admin_test', password='testpass123')
        response = self.client.post('/administrator/stocks/')
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(str(response.content, encoding='utf8'), 
                            {'message': 'Action added/modified'})
        
    def test_login_functionality(self):
        """Check that the login is working correctly"""
        login_success = self.client.login(username='admin_test', password='testpass123')
        self.assertTrue(login_success)
        print(f"Admin login success: {login_success}")
        
        self.client.logout()
        login_success = self.client.login(username='client_test', password='testpass123')
        self.assertTrue(login_success)
        print(f"Client login success: {login_success}")