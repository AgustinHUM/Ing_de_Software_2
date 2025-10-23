import os
import pytest
from flask import Flask
from app import create_app, db
from unittest.mock import MagicMock


@pytest.fixture(scope='function')
def app():
    """Aplicación Flask para testing"""
    # Configurar variables de entorno para testing
    os.environ['FLASK_ENV'] = 'testing'
    
    app = create_app()
    
    # Sobrescribir configuración para testing
    app.config.update({
        'TESTING': True,
        'WTF_CSRF_ENABLED': False,
        'SECRET_KEY': 'test-secret-key'
    })
    
    # Mock de servicios externos
    with app.app_context():
        # Mock de Cognito
        app.config['COGNITO_CLIENT'] = MagicMock()
        yield app


@pytest.fixture
def client(app):
    """Cliente de prueba para hacer requests"""
    return app.test_client()


@pytest.fixture
def auth_headers():
    """Headers de autenticación mockeados"""
    return {
        'Authorization': 'Bearer mock-jwt-token',
        'Content-Type': 'application/json'
    }


# Factory Boy configuration básica
import factory
from factory.alchemy import SQLAlchemyModelFactory


class BaseFactory(SQLAlchemyModelFactory):
    class Meta:
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "commit"


# Factories para cuando tengamos base de datos de prueba
class UsuarioFactory(BaseFactory):
    class Meta:
        model = None  # Se configurará cuando tengamos la base de datos
    
    mail = factory.Sequence(lambda n: f"test{n}@example.com")
    nombre_cuenta = factory.Faker('name')
    contrasenia = factory.LazyFunction(lambda: "hashed_password_123")
    formulario_pendiente = False


@pytest.fixture
def usuario_factory():
    """Factory para crear usuarios de prueba"""
    return UsuarioFactory
