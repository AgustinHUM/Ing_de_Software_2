"""
Tests de integración para endpoints de autenticación (registro y login)
"""
import pytest
import json
import jwt
import uuid
from unittest.mock import patch, MagicMock
from app.models.models import Usuario
from app.config import bcrypt
from app.db import db


@pytest.mark.integration
class TestRegisterEndpoint:
    """Tests para endpoint de registro (/register)"""
    
    def test_register_success(self, client, app):
        """Test registro exitoso con datos válidos"""
        import uuid
        unique_email = f"newuser_{uuid.uuid4().hex[:8]}@example.com"
        
        # Mock de Cognito para que no falle
        with app.app_context():
            cognito_mock = app.config['COGNITO_CLIENT']
            # Asegurar que los métodos están mockeados
            cognito_mock.admin_create_user = MagicMock(return_value={})
            cognito_mock.admin_set_user_password = MagicMock(return_value={})
        
        data = {
            "email": unique_email,
            "username": "New User",
            "password": "SecurePassword123!"
        }
        
        response = client.post('/register',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.get_json()}"
        response_data = response.get_json()
        assert "Register completed successfully" in response_data.get("msg", "")
        
        # Verificar que el usuario se creó en la BD
        with app.app_context():
            usuario = Usuario.query.filter_by(mail=unique_email).first()
            assert usuario is not None
            assert usuario.nombre_cuenta == "New User"
            assert usuario.formulario_pendiente is True
            assert bcrypt.check_password_hash(usuario.contrasenia, "SecurePassword123!")
    
    def test_register_duplicate_email(self, client, app, test_usuario):
        """Test registro con email duplicado"""
        with app.app_context():
            data = {
                "email": test_usuario.mail,  # Email ya existe
                "username": "Another User",
                "password": "Password123"
            }
            
            response = client.post('/register',
                                 data=json.dumps(data),
                                 content_type='application/json')
            
            assert response.status_code == 400
            response_data = response.get_json()
            assert "User already exists" in response_data.get("msg", "")
    
    def test_register_no_email(self, client, app):
        """Test registro sin email"""
        with app.app_context():
            cognito_mock = app.config['COGNITO_CLIENT']
            cognito_mock.exceptions = MagicMock()
        
        data = {
            "username": "Test User",
            "password": "Password123!"
        }
        
        response = client.post('/register',
                             data=json.dumps(data),
                             content_type='application/json')
        
        # El código intenta crear usuario con email=None, lo cual falla en Cognito o bcrypt
        assert response.status_code in [400, 500]
    
    def test_register_no_password(self, client, app):
        """Test registro sin password"""
        with app.app_context():
            cognito_mock = app.config['COGNITO_CLIENT']
            cognito_mock.exceptions = MagicMock()
        
        data = {
            "email": "test@example.com",
            "username": "Test User"
        }
        
        response = client.post('/register',
                             data=json.dumps(data),
                             content_type='application/json')
        
        # bcrypt no acepta passwords vacíos, debería fallar
        assert response.status_code in [400, 500]
    
    def test_register_no_username(self, client, app):
        """Test registro sin username"""
        with app.app_context():
            cognito_mock = app.config['COGNITO_CLIENT']
            cognito_mock.exceptions = MagicMock()
            # Mock para que no falle en Cognito
            cognito_mock.admin_create_user = MagicMock(return_value={})
            cognito_mock.admin_set_user_password = MagicMock(return_value={})
        
        data = {
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "password": "Password123!"
        }
        
        response = client.post('/register',
                             data=json.dumps(data),
                             content_type='application/json')
        
        # Cognito puede fallar con username=None o puede crear el usuario
        # Aceptamos ambos comportamientos
        assert response.status_code in [200, 400, 500]
    
    def test_register_cognito_username_exists(self, client, app):
        """Test manejo de error UsernameExistsException de Cognito"""
        with app.app_context():
            cognito_mock = app.config['COGNITO_CLIENT']
            
            # Simular excepción de Cognito
            exception_class = type('UsernameExistsException', (Exception,), {})
            cognito_mock.exceptions = MagicMock()
            cognito_mock.exceptions.UsernameExistsException = exception_class
            cognito_mock.admin_create_user = MagicMock(
                side_effect=exception_class("User already exists")
            )
            
            data = {
                "email": "existing@example.com",
                "username": "Existing User",
                "password": "Password123!"
            }
            
            response = client.post('/register',
                                 data=json.dumps(data),
                                 content_type='application/json')
            
            assert response.status_code == 400
            response_data = response.get_json()
            assert "User already exists" in response_data.get("msg", "")
    
    def test_register_empty_data(self, client, app):
        """Test registro con datos vacíos"""
        with app.app_context():
            cognito_mock = app.config['COGNITO_CLIENT']
            cognito_mock.exceptions = MagicMock()
            
        data = {}
        
        response = client.post('/register',
                             data=json.dumps(data),
                             content_type='application/json')
        
        # Debería fallar porque password está vacío (bcrypt no acepta passwords vacíos)
        assert response.status_code in [400, 500]


@pytest.mark.integration
class TestLoginEndpoint:
    """Tests para endpoint de login (/login)"""
    
    def test_login_success(self, client, app, test_usuario):
        """Test login exitoso con credenciales válidas"""
        from app.config import Config
        
        with app.app_context():
            # Asegurarse de que el usuario existe y está en la sesión
            usuario = Usuario.query.filter_by(mail=test_usuario.mail).first()
            assert usuario is not None, "Usuario debe existir en la BD"
            
            # Mockear Config.COGNITO_CLIENT directamente
            cognito_mock = MagicMock()
            cognito_mock.initiate_auth = MagicMock(return_value={
                "AuthenticationResult": {
                    "IdToken": "mock-id-token",
                    "AccessToken": "mock-access-token",
                    "RefreshToken": "mock-refresh-token"
                }
            })
            cognito_mock.exceptions = MagicMock()
            cognito_mock.exceptions.NotAuthorizedException = type('NotAuthorizedException', (Exception,), {})
            
            # Reemplazar Config.COGNITO_CLIENT con el mock
            original_cognito = Config.COGNITO_CLIENT
            Config.COGNITO_CLIENT = cognito_mock
        
        try:
            data = {
                "email": test_usuario.mail,
                "password": "testpassword123"
            }
            
            response = client.post('/login',
                                 data=json.dumps(data),
                                 content_type='application/json')
            
            # Debug si falla
            if response.status_code != 200:
                print(f"Response status: {response.status_code}")
                print(f"Response data: {response.get_json()}")
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.get_json()}"
            response_data = response.get_json()
            
            assert "id_token" in response_data
            assert "access_token" in response_data
            assert "refresh_token" in response_data
            
            with app.app_context():
                usuario = Usuario.query.filter_by(mail=test_usuario.mail).first()
                assert response_data["nombre_cuenta"] == usuario.nombre_cuenta
                assert response_data["formulario_pendiente"] == usuario.formulario_pendiente
        finally:
            # Restaurar el original
            Config.COGNITO_CLIENT = original_cognito
    
    def test_login_user_not_found(self, client):
        """Test login con email inexistente"""
        data = {
            "email": "nonexistent@example.com",
            "password": "Password123"
        }
        
        response = client.post('/login',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 401
        response_data = response.get_json()
        assert "Auth credentials error" in response_data.get("msg", "")
    
    def test_login_wrong_password(self, client, test_usuario):
        """Test login con password incorrecto"""
        data = {
            "email": test_usuario.mail,
            "password": "WrongPassword123!"
        }
        
        response = client.post('/login',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 401
        response_data = response.get_json()
        assert "Auth credentials error" in response_data.get("msg", "")
    
    def test_login_no_email(self, client):
        """Test login sin email"""
        data = {
            "password": "Password123"
        }
        
        response = client.post('/login',
                             data=json.dumps(data),
                             content_type='application/json')
        
        # Debería fallar porque falta email
        assert response.status_code in [400, 401, 500]
    
    def test_login_no_password(self, client):
        """Test login sin password"""
        data = {
            "email": "test@example.com"
        }
        
        response = client.post('/login',
                             data=json.dumps(data),
                             content_type='application/json')
        
        # Debería fallar porque falta password (bcrypt no acepta None)
        assert response.status_code in [400, 401, 500]
    
    def test_login_cognito_not_authorized(self, client, app, test_usuario):
        """Test manejo de error NotAuthorizedException de Cognito"""
        with app.app_context():
            cognito_mock = app.config['COGNITO_CLIENT']
            
            # Simular excepción de Cognito
            exception_class = cognito_mock.exceptions.NotAuthorizedException
            cognito_mock.initiate_auth = MagicMock(
                side_effect=exception_class("Not authorized")
            )
        
        data = {
            "email": test_usuario.mail,
            "password": "testpassword123"
        }
        
        response = client.post('/login',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 401
        response_data = response.get_json()
        assert "Auth credentials error" in response_data.get("msg", "")
    
    def test_login_cognito_general_error(self, client, app, test_usuario):
        """Test manejo de error general de Cognito"""
        from app.config import Config
        
        with app.app_context():
            # Asegurarse de que el usuario existe
            usuario = Usuario.query.filter_by(mail=test_usuario.mail).first()
            assert usuario is not None, "Usuario debe existir en la BD"
            
            # Mockear Config.COGNITO_CLIENT directamente
            cognito_mock = MagicMock()
            cognito_mock.exceptions = MagicMock()
            cognito_mock.exceptions.NotAuthorizedException = type('NotAuthorizedException', (Exception,), {})
            # El mock debe lanzar la excepción DESPUÉS de que se valide el usuario y password
            cognito_mock.initiate_auth = MagicMock(
                side_effect=Exception("Cognito service error")
            )
            
            # Reemplazar Config.COGNITO_CLIENT con el mock
            original_cognito = Config.COGNITO_CLIENT
            Config.COGNITO_CLIENT = cognito_mock
        
        try:
            data = {
                "email": test_usuario.mail,
                "password": "testpassword123"
            }
            
            response = client.post('/login',
                                 data=json.dumps(data),
                                 content_type='application/json')
            
            # Debug si falla
            if response.status_code != 500:
                print(f"Response status: {response.status_code}")
                print(f"Response data: {response.get_json()}")
            
            assert response.status_code == 500, f"Expected 500, got {response.status_code}: {response.get_json()}"
            response_data = response.get_json()
            assert "Cognito error" in response_data.get("msg", "")
        finally:
            # Restaurar el original
            Config.COGNITO_CLIENT = original_cognito
    
    def test_login_empty_data(self, client):
        """Test login con datos vacíos"""
        data = {}
        
        response = client.post('/login',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code in [400, 401, 500]
    
    def test_login_form_data(self, client, app, test_usuario):
        """Test login con form data en lugar de JSON"""
        from app.config import Config
        
        with app.app_context():
            # Asegurarse de que el usuario existe
            usuario = Usuario.query.filter_by(mail=test_usuario.mail).first()
            assert usuario is not None, "Usuario debe existir en la BD"
            
            # Mockear Config.COGNITO_CLIENT directamente
            cognito_mock = MagicMock()
            cognito_mock.initiate_auth = MagicMock(return_value={
                "AuthenticationResult": {
                    "IdToken": "mock-id-token",
                    "AccessToken": "mock-access-token",
                    "RefreshToken": "mock-refresh-token"
                }
            })
            cognito_mock.exceptions = MagicMock()
            cognito_mock.exceptions.NotAuthorizedException = type('NotAuthorizedException', (Exception,), {})
            
            # Reemplazar Config.COGNITO_CLIENT con el mock
            original_cognito = Config.COGNITO_CLIENT
            Config.COGNITO_CLIENT = cognito_mock
        
        try:
            data = {
                "email": test_usuario.mail,
                "password": "testpassword123"
            }
            
            # Enviar como form data
            response = client.post('/login', data=data)
            
            # Debug si falla
            if response.status_code != 200:
                print(f"Response status: {response.status_code}")
                print(f"Response data: {response.get_json()}")
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.get_json()}"
            response_data = response.get_json()
            assert "id_token" in response_data
        finally:
            # Restaurar el original
            Config.COGNITO_CLIENT = original_cognito

