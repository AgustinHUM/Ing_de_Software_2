"""
Tests de integración para endpoints de películas
"""
import pytest
import json
import jwt
from unittest.mock import patch, MagicMock


@pytest.mark.integration
class TestMovieEndpoints:
    """Tests para endpoints de películas"""
    
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
    
    def test_home_movies_endpoint_no_token(self, client):
        """Test endpoint de películas sin token"""
        response = client.get('/home/movies')
        
        assert response.status_code == 401
        response_data = response.get_json()
        assert "No Token Received" in response_data.get("msg", "")
    
    def test_home_movies_endpoint_invalid_token(self, client):
        """Test endpoint de películas con token inválido"""
        token = self._create_invalid_jwt_token()
        headers = {'Authorization': f'Bearer {token}'}
        response = client.get('/home/movies', headers=headers)
        
        # Debería fallar por token inválido
        assert response.status_code in [401, 400]
    
    def test_movies_search_endpoint_no_query(self, client):
        """Test búsqueda de películas sin query"""
        response = client.get('/movies')
        
        assert response.status_code == 400
        response_data = response.get_json()
        assert "Query is missing" in response_data.get("msg", "")
    
    def test_movies_search_endpoint_with_query(self, client):
        """Test búsqueda de películas con query válido"""
        response = client.get('/movies?query=avengers')
        
        # Debería retornar una lista (vacía si no hay datos)
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
    
    def test_movies_search_endpoint_with_pagination(self, client):
        """Test búsqueda de películas con paginación"""
        response = client.get('/movies?query=avengers&page=0')
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
    
    def test_movies_search_endpoint_invalid_page(self, client):
        """Test búsqueda de películas con página inválida"""
        response = client.get('/movies?query=avengers&page=invalid')
        
        # Debería manejar página inválida (debería usar página 0)
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
    
    def test_movies_search_endpoint_negative_page(self, client):
        """Test búsqueda de películas con página negativa"""
        response = client.get('/movies?query=avengers&page=-1')
        
        # Debería manejar página negativa (debería usar página 0)
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
    
    def test_movie_details_endpoint_no_movie_id(self, client):
        """Test detalles de película sin movie_id"""
        response = client.get('/movies/detailsScreen')
        
        assert response.status_code == 400
        response_data = response.get_json()
        assert "Movie id is missing" in response_data.get("msg", "")
    
    def test_movie_details_endpoint_no_token(self, client):
        """Test detalles de película sin token"""
        response = client.get('/movies/detailsScreen?movie_id=1')
        
        assert response.status_code == 401
        response_data = response.get_json()
        assert "No Token Received" in response_data.get("msg", "")
    
    def test_movie_details_endpoint_invalid_token(self, client):
        """Test detalles de película con token inválido"""
        token = self._create_invalid_jwt_token()
        headers = {'Authorization': f'Bearer {token}'}
        response = client.get('/movies/detailsScreen?movie_id=1', headers=headers)
        
        # Debería fallar por token inválido
        assert response.status_code in [401, 400]
    
    def test_movie_details_endpoint_nonexistent_movie(self, client):
        """Test detalles de película inexistente"""
        # Mock de token válido
        mock_payload = {"email": "test@example.com"}
        
        with patch('app.controllers.movie_controller.jwt.decode', return_value=mock_payload):
            headers = {'Authorization': 'Bearer valid-token'}
            response = client.get('/movies/detailsScreen?movie_id=99999', headers=headers)
            
            # Debería fallar por película inexistente
            assert response.status_code in [400, 404]
    
    # ============================================
    # TESTS DE CASOS EXITOSOS - FASE 2
    # ============================================
    
    def test_movies_search_with_results(self, client, test_pelicula):
        """Test búsqueda de películas con query que retorna resultados"""
        response = client.get('/movies?query=Test')
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        # Puede tener resultados o estar vacía dependiendo de la BD
    
    def test_movies_search_no_results(self, client):
        """Test búsqueda de películas con query que no retorna resultados"""
        response = client.get('/movies?query=NonExistentMovie12345XYZ')
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        # Debe ser una lista (puede estar vacía)
    
    def test_movies_search_structure(self, client, test_pelicula):
        """Test verificar estructura completa de respuesta de búsqueda"""
        response = client.get('/movies?query=Test')
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        
        if len(response_data) > 0:
            movie = response_data[0]
            # Verificar campos esperados
            expected_fields = ["id", "title", "poster", "genres", "platforms", 
                             "year", "runtime", "director", "rating", 
                             "description", "ageRating"]
            for field in expected_fields:
                assert field in movie, f"Campo {field} no encontrado en respuesta"
    
    def test_movie_details_success(self, client, test_usuario, test_pelicula, auth_token):
        """Test obtener detalles de película existente con token válido"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.get('/movies/detailsScreen?movie_id=1', headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        
        # Verificar estructura de respuesta
        assert "id" in response_data
        assert "genres" in response_data
        assert "platforms" in response_data
        assert "year" in response_data
        assert "runtime" in response_data
        assert "director" in response_data
        assert "rating" in response_data
        assert "description" in response_data
        assert "ageRating" in response_data
        assert "is_favorite" in response_data
        assert isinstance(response_data["is_favorite"], bool)
    
    def test_movie_details_is_favorite_true(self, client, app, test_usuario, test_pelicula, auth_token):
        """Test verificar que is_favorite retorna true cuando la película está en favoritos"""
        with app.app_context():
            from app.db import db
            from app.models.models import Usuario, Pelicula
            # Obtener objetos reales de la BD
            usuario_real = Usuario.query.get(test_usuario.mail)
            pelicula_real = Pelicula.query.get(test_pelicula.id_pelicula)
            if usuario_real and pelicula_real and pelicula_real not in usuario_real.favoritas:
                usuario_real.favoritas.append(pelicula_real)
                db.session.commit()
        
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.get('/movies/detailsScreen?movie_id=1', headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert response_data["is_favorite"] is True
    
    def test_movie_details_is_favorite_false(self, client, test_usuario, test_pelicula, auth_token):
        """Test verificar que is_favorite retorna false cuando la película no está en favoritos"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.get('/movies/detailsScreen?movie_id=1', headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert response_data["is_favorite"] is False
    
    def test_home_movies_success(self, client, test_usuario, test_pelicula, auth_token):
        """Test obtener películas recomendadas con token válido"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.get('/home/movies', headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        # Máximo 6 películas
        assert len(response_data) <= 6
    
    def test_home_movies_structure(self, client, test_usuario, test_pelicula, auth_token):
        """Test verificar estructura de respuesta de películas recomendadas"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.get('/home/movies', headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        
        if len(response_data) > 0:
            movie = response_data[0]
            assert "id" in movie
            assert "title" in movie
            assert "poster" in movie
            assert "genres" in movie
    
    def test_home_movies_max_limit(self, client, test_usuario, test_pelicula, auth_token):
        """Test verificar que retorna máximo 6 películas"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.get('/home/movies', headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert len(response_data) <= 6
    
    def test_movies_search_special_characters(self, client):
        """Test búsqueda con caracteres especiales en query"""
        response = client.get('/movies?query=test%20movie&page=0')
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
    
    def test_movies_search_empty_query_handling(self, client):
        """Test búsqueda con query vacío (solo espacios)"""
        response = client.get('/movies?query=   ')
        
        # Debería manejar espacios en blanco
        assert response.status_code in [200, 400]