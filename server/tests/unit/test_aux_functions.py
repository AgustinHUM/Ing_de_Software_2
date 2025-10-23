"""
Tests unitarios para funciones auxiliares
"""
import pytest
import hmac
import hashlib
import base64
from unittest.mock import patch
from app.functions.aux_functions import get_secret_hash, generate_id


@pytest.mark.unit
class TestAuxFunctions:
    """Tests para funciones auxiliares"""
    
    def test_get_secret_hash_basic(self):
        """Test generación básica de secret hash"""
        username = "test@example.com"
        client_id = "test-client-id"
        client_secret = "test-client-secret"
        
        result = get_secret_hash(username, client_id, client_secret)
        
        # Verificar que es un string
        assert isinstance(result, str)
        assert len(result) > 0
        
        # Verificar que es base64 válido
        try:
            base64.b64decode(result)
        except Exception:
            pytest.fail("El resultado no es base64 válido")
    
    def test_get_secret_hash_consistency(self):
        """Test que la función es consistente (mismo input = mismo output)"""
        username = "test@example.com"
        client_id = "test-client-id"
        client_secret = "test-client-secret"
        
        result1 = get_secret_hash(username, client_id, client_secret)
        result2 = get_secret_hash(username, client_id, client_secret)
        
        assert result1 == result2
    
    def test_get_secret_hash_different_inputs(self):
        """Test que diferentes inputs producen diferentes outputs"""
        client_id = "test-client-id"
        client_secret = "test-client-secret"
        
        result1 = get_secret_hash("user1@example.com", client_id, client_secret)
        result2 = get_secret_hash("user2@example.com", client_id, client_secret)
        
        assert result1 != result2
    
    def test_get_secret_hash_manual_verification(self):
        """Test verificación manual del algoritmo HMAC"""
        username = "test@example.com"
        client_id = "test-client-id"
        client_secret = "test-client-secret"
        
        result = get_secret_hash(username, client_id, client_secret)
        
        # Calcular manualmente
        msg = username + client_id
        expected_dig = hmac.new(
            client_secret.encode('utf-8'),
            msg.encode('utf-8'),
            hashlib.sha256
        ).digest()
        expected_result = base64.b64encode(expected_dig).decode()
        
        assert result == expected_result
    
    def test_generate_id_type(self, app):
        """Test que generate_id retorna un entero"""
        with app.app_context():
            # Mock de la query para evitar dependencia de base de datos
            with patch('app.functions.aux_functions.Grupo.query.get', return_value=None):
                result = generate_id()
                
                assert isinstance(result, int)
    
    def test_generate_id_range(self, app):
        """Test que generate_id retorna un número en el rango correcto"""
        with app.app_context():
            with patch('app.functions.aux_functions.Grupo.query.get', return_value=None):
                result = generate_id()
                
                assert 10000 <= result <= 99999
    
    def test_generate_id_uniqueness(self, app):
        """Test que generate_id maneja colisiones correctamente"""
        with app.app_context():
            # Simular que el primer ID ya existe
            call_count = 0
            def mock_get(id_val):
                nonlocal call_count
                call_count += 1
                if call_count == 1:
                    return "exists"  # Simular que existe
                return None  # Simular que no existe
            
            with patch('app.functions.aux_functions.Grupo.query.get', side_effect=mock_get):
                result = generate_id()
                
                assert isinstance(result, int)
                assert 10000 <= result <= 99999
                assert call_count == 2  # Debería haber intentado dos veces
