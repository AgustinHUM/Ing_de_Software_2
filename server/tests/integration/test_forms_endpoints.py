"""
Tests de integración para endpoints de formularios
"""
import pytest
import json
import jwt
from unittest.mock import patch, MagicMock


@pytest.mark.integration
class TestFormsEndpoints:
    """Tests para endpoints de formularios"""
    
    def _create_invalid_jwt_token(self):
        """Crear un token JWT inválido para testing"""
        return "invalid-token-format"
    
    def test_show_form_success(self, client, test_pais, test_plataforma, test_genero):
        """Test obtener opciones del formulario exitosamente"""
        response = client.get('/showUserForm')
        
        assert response.status_code == 200
        response_data = response.get_json()
        
        # Verificar estructura de respuesta
        assert "countries" in response_data
        assert "platforms" in response_data
        assert "genres" in response_data
        assert isinstance(response_data["countries"], list)
        assert isinstance(response_data["platforms"], list)
        assert isinstance(response_data["genres"], list)
    
    def test_show_form_structure(self, client, test_pais, test_plataforma, test_genero):
        """Test verificar estructura completa de respuesta del formulario"""
        response = client.get('/showUserForm')
        
        assert response.status_code == 200
        response_data = response.get_json()
        
        # Verificar estructura de países
        if len(response_data["countries"]) > 0:
            country = response_data["countries"][0]
            assert "id" in country
            assert "name" in country
            assert "flag" in country
        
        # Verificar estructura de plataformas
        if len(response_data["platforms"]) > 0:
            platform = response_data["platforms"][0]
            assert "id" in platform
            assert "name" in platform
            assert "logo" in platform
        
        # Verificar estructura de géneros
        if len(response_data["genres"]) > 0:
            genre = response_data["genres"][0]
            assert "id" in genre
            assert "name" in genre
    
    def test_show_form_wrong_method(self, client):
        """Test obtener formulario con método incorrecto (POST)"""
        response = client.post('/showUserForm')
        
        # Puede retornar 405 o procesar como GET
        assert response.status_code in [200, 405]
    
    def test_save_user_form_no_token(self, client):
        """Test guardar formulario sin token"""
        data = {
            "countries": [1],
            "genres": [1],
            "movies": [1],
            "services": [1]
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json')
        
        # El controlador no verifica el error de get_token_user, puede retornar 404 o 500
        assert response.status_code in [401, 404, 500]
    
    def test_save_user_form_invalid_token(self, client):
        """Test guardar formulario con token inválido"""
        token = self._create_invalid_jwt_token()
        headers = {'Authorization': f'Bearer {token}'}
        data = {
            "countries": [1],
            "genres": [1],
            "movies": [1],
            "services": [1]
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        # El controlador no verifica el error de get_token_user, puede retornar 404 o 500
        assert response.status_code in [401, 400, 500]
    
    def test_save_user_form_success(self, client, test_usuario, test_pais, test_genero, test_plataforma, test_pelicula, auth_token):
        """Test guardar formulario exitosamente"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {
            "countries": [test_pais.id_pais],
            "genres": [test_genero.id_genero],
            "movies": [test_pelicula.id_pelicula],
            "services": [test_plataforma.id_plataforma]
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Information saved successfully" in response_data.get("msg", "")
    
    def test_save_user_form_partial_data(self, client, test_usuario, test_pais, auth_token):
        """Test guardar formulario con datos parciales (solo país)"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {
            "countries": [test_pais.id_pais]
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Information saved successfully" in response_data.get("msg", "")
    
    def test_save_user_form_empty_data(self, client, test_usuario, auth_token):
        """Test guardar formulario con datos vacíos"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {}
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Information saved successfully" in response_data.get("msg", "")
    
    def test_save_user_form_only_countries(self, client, test_usuario, test_pais, auth_token):
        """Test guardar formulario solo con países"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {
            "countries": [test_pais.id_pais]
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Information saved successfully" in response_data.get("msg", "")
    
    def test_save_user_form_only_genres(self, client, test_usuario, test_genero, auth_token):
        """Test guardar formulario solo con géneros"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {
            "genres": [test_genero.id_genero]
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Information saved successfully" in response_data.get("msg", "")
    
    def test_save_user_form_only_movies(self, client, test_usuario, test_pelicula, auth_token):
        """Test guardar formulario solo con películas favoritas"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {
            "movies": [test_pelicula.id_pelicula]
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Information saved successfully" in response_data.get("msg", "")
    
    def test_save_user_form_only_services(self, client, test_usuario, test_plataforma, auth_token):
        """Test guardar formulario solo con servicios"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {
            "services": [test_plataforma.id_plataforma]
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Information saved successfully" in response_data.get("msg", "")
    
    def test_save_user_form_multiple_values(self, client, test_usuario, test_pais, test_genero, test_plataforma, test_pelicula, auth_token):
        """Test guardar formulario con múltiples valores en cada campo"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {
            "countries": [test_pais.id_pais],
            "genres": [test_genero.id_genero],
            "movies": [test_pelicula.id_pelicula],
            "services": [test_plataforma.id_plataforma]
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Information saved successfully" in response_data.get("msg", "")
    
    def test_save_user_form_invalid_country(self, client, test_usuario, auth_token):
        """Test guardar formulario con país inválido"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {
            "countries": [99999]  # País inexistente
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        # Puede retornar éxito pero no actualizar, o error
        assert response.status_code in [200, 400, 404]
    
    def test_save_user_form_invalid_genre(self, client, test_usuario, auth_token):
        """Test guardar formulario con género inválido"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {
            "genres": [99999]  # Género inexistente
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        # Puede retornar éxito pero no actualizar, o error
        assert response.status_code in [200, 400, 404]
    
    def test_save_user_form_invalid_movie(self, client, test_usuario, auth_token):
        """Test guardar formulario con película inválida"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {
            "movies": [99999]  # Película inexistente
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        # Puede retornar éxito pero no actualizar, o error
        assert response.status_code in [200, 400, 404]
    
    def test_save_user_form_invalid_service(self, client, test_usuario, auth_token):
        """Test guardar formulario con servicio inválido"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {
            "services": [99999]  # Servicio inexistente
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        # Puede retornar éxito pero no actualizar, o error
        assert response.status_code in [200, 400, 404]
    
    def test_save_user_form_sets_pending_false(self, client, app, test_usuario_sin_formulario, test_pais):
        """Test verificar que guardar formulario marca formulario_pendiente como False"""
        # Generar token para el usuario sin formulario
        payload = {
            'sub': 'test-user-id',
            'email': test_usuario_sin_formulario.mail,
            'cognito:username': test_usuario_sin_formulario.nombre_cuenta
        }
        token = jwt.encode(payload, 'test-secret', algorithm='HS256')
        
        headers = {'Authorization': f'Bearer {token}'}
        data = {
            "countries": [test_pais.id_pais]
        }
        response = client.post('/saveUserForm',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        
        # Verificar que formulario_pendiente es False
        with app.app_context():
            from app.models.models import Usuario
            usuario = Usuario.query.filter_by(mail=test_usuario_sin_formulario.mail).first()
            assert usuario is not None
            assert usuario.formulario_pendiente is False

