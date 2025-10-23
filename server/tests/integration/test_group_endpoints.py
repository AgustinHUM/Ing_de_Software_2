"""
Tests de integración para endpoints de grupos
"""
import pytest
import json
from unittest.mock import patch, MagicMock


@pytest.mark.integration
class TestGroupEndpoints:
    """Tests para endpoints de grupos"""
    
    def test_create_group_endpoint_no_token(self, client):
        """Test crear grupo sin token"""
        data = {"group_name": "Test Group"}
        response = client.post('/groups',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 401
        response_data = response.get_json()
        assert "No se recibió token" in response_data["Error"]
    
    def test_create_group_endpoint_no_data(self, client):
        """Test crear grupo sin datos"""
        headers = {'Authorization': 'Bearer valid-token'}
        response = client.post('/groups',
                             data=json.dumps({}),
                             content_type='application/json',
                             headers=headers)
        
        # Debería fallar por datos faltantes
        assert response.status_code in [400, 500]
    
    def test_create_group_endpoint_invalid_token(self, client):
        """Test crear grupo con token inválido"""
        data = {"group_name": "Test Group"}
        headers = {'Authorization': 'Bearer invalid-token'}
        response = client.post('/groups',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        # Debería fallar por token inválido
        assert response.status_code in [401, 400]
    
    def test_join_group_endpoint_no_token(self, client):
        """Test unirse a grupo sin token"""
        data = {"group_join_id": 12345}
        response = client.post('/groups/join',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 401
        response_data = response.get_json()
        assert "No se recibió token" in response_data["Error"]
    
    def test_join_group_endpoint_no_data(self, client):
        """Test unirse a grupo sin datos"""
        headers = {'Authorization': 'Bearer valid-token'}
        response = client.post('/groups/join',
                             data=json.dumps({}),
                             content_type='application/json',
                             headers=headers)
        
        # Debería fallar por datos faltantes
        assert response.status_code in [400, 500]
    
    def test_join_group_endpoint_invalid_token(self, client):
        """Test unirse a grupo con token inválido"""
        data = {"group_join_id": 12345}
        headers = {'Authorization': 'Bearer invalid-token'}
        response = client.post('/groups/join',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        # Debería fallar por token inválido
        assert response.status_code in [401, 400]
    
    def test_get_user_groups_endpoint_no_token(self, client):
        """Test obtener grupos del usuario sin token"""
        response = client.get('/groups')
        
        assert response.status_code == 401
        response_data = response.get_json()
        assert "No se recibió token" in response_data["Error"]
    
    def test_get_user_groups_endpoint_invalid_token(self, client):
        """Test obtener grupos del usuario con token inválido"""
        headers = {'Authorization': 'Bearer invalid-token'}
        response = client.get('/groups', headers=headers)
        
        # Debería fallar por token inválido
        assert response.status_code in [401, 400]
    
    def test_get_group_users_endpoint_no_group_id(self, client):
        """Test obtener usuarios de grupo sin group_id"""
        response = client.get('/groups/users')
        
        assert response.status_code == 400
        response_data = response.get_json()
        assert "Falta group_id" in response_data["Error"]
    
    def test_get_group_users_endpoint_invalid_group_id(self, client):
        """Test obtener usuarios de grupo con group_id inválido"""
        response = client.get('/groups/users?group_id=invalid')
        
        # Debería fallar por group_id inválido
        assert response.status_code in [400, 500]
    
    def test_get_group_users_endpoint_nonexistent_group(self, client):
        """Test obtener usuarios de grupo inexistente"""
        response = client.get('/groups/users?group_id=99999')
        
        assert response.status_code == 404
        response_data = response.get_json()
        assert "No se encuentra el grupo" in response_data["Error"]
