"""
Tests de integración para endpoints de grupos
"""
import pytest
import json
import jwt
from unittest.mock import patch, MagicMock


@pytest.mark.integration
class TestGroupEndpoints:
    """Tests para endpoints de grupos"""
    
    def _create_valid_jwt_token(self):
        """Crear un token JWT válido para testing"""
        payload = {
            'sub': 'test-user-id',
            'email': 'test@example.com',
            'cognito:username': 'testuser'
        }
        return jwt.encode(payload, 'test-secret', algorithm='HS256')
    
    def _create_invalid_jwt_token(self):
        """Crear un token JWT inválido para testing"""
        return "invalid-token-format"
    
    def test_create_group_endpoint_no_token(self, client):
        """Test crear grupo sin token"""
        data = {"group_name": "Test Group"}
        response = client.post('/groups',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 401
        response_data = response.get_json()
        assert "No Token Received" in response_data.get("msg", "")
    
    def test_create_group_endpoint_no_data(self, client):
        """Test crear grupo sin datos"""
        token = self._create_valid_jwt_token()
        headers = {'Authorization': f'Bearer {token}'}
        response = client.post('/groups',
                             data=json.dumps({}),
                             content_type='application/json',
                             headers=headers)
        
        # Debería fallar por datos faltantes
        assert response.status_code in [400, 500]
    
    def test_create_group_endpoint_invalid_token(self, client):
        """Test crear grupo con token inválido"""
        data = {"group_name": "Test Group"}
        token = self._create_invalid_jwt_token()
        headers = {'Authorization': f'Bearer {token}'}
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
        assert "No Token Received" in response_data.get("msg", "")
    
    def test_join_group_endpoint_no_data(self, client):
        """Test unirse a grupo sin datos"""
        token = self._create_valid_jwt_token()
        headers = {'Authorization': f'Bearer {token}'}
        response = client.post('/groups/join',
                             data=json.dumps({}),
                             content_type='application/json',
                             headers=headers)
        
        # Debería fallar por datos faltantes
        assert response.status_code in [400, 500]
    
    def test_join_group_endpoint_invalid_token(self, client):
        """Test unirse a grupo con token inválido"""
        data = {"group_join_id": 12345}
        token = self._create_invalid_jwt_token()
        headers = {'Authorization': f'Bearer {token}'}
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
        assert "No Token Received" in response_data.get("msg", "")
    
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
        assert "Group id is missing" in response_data.get("msg", "")
    
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
        assert "No se encuentra el grupo" in response_data.get("Error", "") or "No se encuentra el grupo" in response_data.get("msg", "")
    
    # ============================================
    # TESTS DE CASOS EXITOSOS - FASE 2
    # ============================================
    
    def test_create_group_success(self, client, test_usuario, auth_token):
        """Test crear grupo exitosamente"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"group_name": "Mi Grupo de Prueba"}
        response = client.post('/groups',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "group_join_id" in response_data
        assert isinstance(response_data["group_join_id"], int)
    
    def test_create_group_response_structure(self, client, test_usuario, auth_token):
        """Test verificar estructura de respuesta al crear grupo"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"group_name": "Grupo Test Estructura"}
        response = client.post('/groups',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "group_join_id" in response_data
        # El código de unión debe ser calculable: id_grupo * 7 + 13
        group_join_id = response_data["group_join_id"]
        assert (group_join_id - 13) % 7 == 0
    
    def test_get_user_groups_success(self, client, test_usuario, test_grupo, auth_token):
        """Test obtener grupos del usuario exitosamente"""
        # Agregar usuario al grupo
        with client.application.app_context():
            from app.db import db
            from app.models.models import Grupo, Usuario
            # Obtener objetos reales de la BD
            grupo_real = Grupo.query.get(test_grupo.id_grupo)
            usuario_real = Usuario.query.get(test_usuario.mail)
            if grupo_real and usuario_real and usuario_real not in grupo_real.usuarios:
                grupo_real.usuarios.append(usuario_real)
                db.session.commit()
        
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.get('/groups', headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        assert len(response_data) > 0
        
        # Verificar estructura de cada grupo
        grupo = response_data[0]
        assert "id" in grupo
        assert "name" in grupo
        assert "members" in grupo
        assert isinstance(grupo["members"], int)
    
    def test_get_user_groups_empty(self, client, test_usuario, auth_token):
        """Test obtener grupos cuando el usuario no tiene grupos"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.get('/groups', headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        # Puede estar vacío si el usuario no tiene grupos
    
    def test_get_user_groups_structure(self, client, test_usuario, test_grupo, auth_token):
        """Test verificar estructura completa de respuesta de grupos"""
        # Agregar usuario al grupo
        with client.application.app_context():
            from app.db import db
            from app.models.models import Grupo, Usuario
            # Obtener objetos reales de la BD
            grupo_real = Grupo.query.get(test_grupo.id_grupo)
            usuario_real = Usuario.query.get(test_usuario.mail)
            if grupo_real and usuario_real and usuario_real not in grupo_real.usuarios:
                grupo_real.usuarios.append(usuario_real)
                db.session.commit()
        
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.get('/groups', headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        
        if len(response_data) > 0:
            grupo = response_data[0]
            required_fields = ["id", "name", "members"]
            for field in required_fields:
                assert field in grupo, f"Campo {field} no encontrado en respuesta"
    
    def test_join_group_success(self, client, test_usuario, test_grupo, auth_token):
        """Test unirse a grupo exitosamente"""
        # Calcular código de unión: id_grupo * 7 + 13
        codigo_union = test_grupo.id_grupo * 7 + 13
        
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"group_join_id": codigo_union}
        response = client.post('/groups/join',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "id" in response_data
        assert "name" in response_data
        assert "members" in response_data
        assert response_data["id"] == test_grupo.id_grupo
        assert response_data["members"] >= 1
    
    def test_join_group_already_member(self, client, test_usuario, test_grupo, auth_token):
        """Test unirse a grupo cuando ya es miembro (no debería dar error)"""
        # Agregar usuario al grupo primero
        with client.application.app_context():
            from app.db import db
            from app.models.models import Grupo, Usuario
            # Obtener objetos reales de la BD
            grupo_real = Grupo.query.get(test_grupo.id_grupo)
            usuario_real = Usuario.query.get(test_usuario.mail)
            if grupo_real and usuario_real and usuario_real not in grupo_real.usuarios:
                grupo_real.usuarios.append(usuario_real)
                db.session.commit()
        
        # Intentar unirse de nuevo
        codigo_union = test_grupo.id_grupo * 7 + 13
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"group_join_id": codigo_union}
        response = client.post('/groups/join',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        # Debería retornar éxito (no duplica, pero no da error)
        assert response.status_code == 200
        response_data = response.get_json()
        assert "id" in response_data
    
    def test_join_group_response_structure(self, client, test_usuario, test_grupo, auth_token):
        """Test verificar estructura de respuesta al unirse a grupo"""
        codigo_union = test_grupo.id_grupo * 7 + 13
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"group_join_id": codigo_union}
        response = client.post('/groups/join',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        required_fields = ["id", "name", "members"]
        for field in required_fields:
            assert field in response_data, f"Campo {field} no encontrado en respuesta"
    
    def test_get_group_users_success(self, client, test_usuario, test_grupo):
        """Test obtener usuarios de grupo exitosamente"""
        # Agregar usuario al grupo
        with client.application.app_context():
            from app.db import db
            from app.models.models import Grupo, Usuario
            # Obtener objetos reales de la BD
            grupo_real = Grupo.query.get(test_grupo.id_grupo)
            usuario_real = Usuario.query.get(test_usuario.mail)
            if grupo_real and usuario_real and usuario_real not in grupo_real.usuarios:
                grupo_real.usuarios.append(usuario_real)
                db.session.commit()
        
        response = client.get(f'/groups/users?group_id={test_grupo.id_grupo}')
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        assert len(response_data) > 0
        
        # Verificar estructura de cada usuario
        usuario = response_data[0]
        assert "email" in usuario
        assert "username" in usuario
    
    def test_get_group_users_structure(self, client, test_usuario, test_grupo):
        """Test verificar estructura completa de respuesta de usuarios de grupo"""
        # Agregar usuario al grupo
        with client.application.app_context():
            from app.db import db
            from app.models.models import Grupo, Usuario
            # Obtener objetos reales de la BD
            grupo_real = Grupo.query.get(test_grupo.id_grupo)
            usuario_real = Usuario.query.get(test_usuario.mail)
            if grupo_real and usuario_real and usuario_real not in grupo_real.usuarios:
                grupo_real.usuarios.append(usuario_real)
                db.session.commit()
        
        response = client.get(f'/groups/users?group_id={test_grupo.id_grupo}')
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        
        if len(response_data) > 0:
            usuario = response_data[0]
            required_fields = ["email", "username"]
            for field in required_fields:
                assert field in usuario, f"Campo {field} no encontrado en respuesta"
    
    def test_get_group_users_empty_group(self, client, test_grupo):
        """Test obtener usuarios de grupo vacío"""
        response = client.get(f'/groups/users?group_id={test_grupo.id_grupo}')
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        # Puede estar vacío si el grupo no tiene usuarios
    
    def test_leave_group_endpoint_no_token(self, client):
        """Test dejar grupo sin token"""
        data = {"group_join_id": 12345}
        response = client.post('/groups/leave',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 401
        response_data = response.get_json()
        assert "No Token Received" in response_data.get("msg", "")
    
    def test_leave_group_endpoint_no_data(self, client, auth_token):
        """Test dejar grupo sin datos"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.post('/groups/leave',
                             data=json.dumps({}),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 400
        response_data = response.get_json()
        assert "group_join_id missing" in response_data.get("msg", "")
    
    def test_leave_group_endpoint_invalid_token(self, client):
        """Test dejar grupo con token inválido"""
        data = {"group_join_id": 12345}
        token = self._create_invalid_jwt_token()
        headers = {'Authorization': f'Bearer {token}'}
        response = client.post('/groups/leave',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code in [401, 400]
    
    def test_leave_group_success(self, client, test_usuario, test_grupo, auth_token):
        """Test dejar grupo exitosamente"""
        # Agregar usuario al grupo primero
        with client.application.app_context():
            from app.db import db
            from app.models.models import Grupo, Usuario
            # Obtener objetos reales de la BD
            grupo_real = Grupo.query.get(test_grupo.id_grupo)
            usuario_real = Usuario.query.get(test_usuario.mail)
            if grupo_real and usuario_real and usuario_real not in grupo_real.usuarios:
                grupo_real.usuarios.append(usuario_real)
                db.session.commit()
        
        # Calcular código de unión
        codigo_union = test_grupo.id_grupo * 7 + 13
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"group_join_id": codigo_union}
        response = client.post('/groups/leave',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "id" in response_data
        assert "name" in response_data
        assert "members" in response_data
        assert response_data["id"] == test_grupo.id_grupo
    
    def test_leave_group_not_member(self, client, test_usuario, test_grupo, auth_token):
        """Test dejar grupo cuando no es miembro"""
        # No agregar usuario al grupo
        codigo_union = test_grupo.id_grupo * 7 + 13
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"group_join_id": codigo_union}
        response = client.post('/groups/leave',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 400
        response_data = response.get_json()
        assert "User is not a member of this group" in response_data.get("msg", "")
    
    def test_leave_group_invalid_code(self, client, auth_token):
        """Test dejar grupo con código de unión inválido"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"group_join_id": "invalid"}
        response = client.post('/groups/leave',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 400
        response_data = response.get_json()
        assert "Invalid group_join_id" in response_data.get("msg", "")
    
    def test_leave_group_response_structure(self, client, test_usuario, test_grupo, auth_token):
        """Test verificar estructura de respuesta al dejar grupo"""
        # Agregar usuario al grupo primero
        with client.application.app_context():
            from app.db import db
            from app.models.models import Grupo, Usuario
            # Obtener objetos reales de la BD
            grupo_real = Grupo.query.get(test_grupo.id_grupo)
            usuario_real = Usuario.query.get(test_usuario.mail)
            if grupo_real and usuario_real and usuario_real not in grupo_real.usuarios:
                grupo_real.usuarios.append(usuario_real)
                db.session.commit()
        
        codigo_union = test_grupo.id_grupo * 7 + 13
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"group_join_id": codigo_union}
        response = client.post('/groups/leave',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        required_fields = ["id", "name", "members"]
        for field in required_fields:
            assert field in response_data, f"Campo {field} no encontrado en respuesta"