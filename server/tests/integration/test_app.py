"""
Tests de integración básicos para verificar que la app Flask funciona
"""
import pytest


@pytest.mark.integration
def test_app_creation(client):
    """Test que la aplicación Flask se crea correctamente"""
    assert client is not None


@pytest.mark.integration
def test_app_config(app):
    """Test que la configuración de testing está activa"""
    assert app.config['TESTING'] is True
    assert app.config['WTF_CSRF_ENABLED'] is False


@pytest.mark.integration
def test_app_context(app):
    """Test que el contexto de la aplicación funciona"""
    with app.app_context():
        assert app is not None
