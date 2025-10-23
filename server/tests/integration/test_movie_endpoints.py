"""
Tests de integración para endpoints de películas
"""
import pytest
import json
from unittest.mock import patch, MagicMock


@pytest.mark.integration
class TestMovieEndpoints:
    """Tests para endpoints de películas"""
    
    def test_home_movies_endpoint_no_token(self, client):
        """Test endpoint de películas sin token"""
        response = client.get('/home/movies')
        
        assert response.status_code == 401
        response_data = response.get_json()
        assert "No se recibió token" in response_data["Error"]
    
    def test_home_movies_endpoint_invalid_token(self, client):
        """Test endpoint de películas con token inválido"""
        headers = {'Authorization': 'Bearer invalid-token'}
        response = client.get('/home/movies', headers=headers)
        
        # Debería fallar por token inválido
        assert response.status_code in [401, 400]
    
    def test_movies_search_endpoint_no_query(self, client):
        """Test búsqueda de películas sin query"""
        response = client.get('/movies')
        
        assert response.status_code == 400
        response_data = response.get_json()
        assert "no se recibió query" in response_data["error"]
    
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
        """Test detalles de película sin movieId"""
        response = client.get('/movies/detailsScreen')
        
        assert response.status_code == 400
        response_data = response.get_json()
        assert "no se recibió movieId" in response_data["error"]
    
    def test_movie_details_endpoint_no_token(self, client):
        """Test detalles de película sin token"""
        response = client.get('/movies/detailsScreen?movieId=1')
        
        assert response.status_code == 401
        response_data = response.get_json()
        assert "No se recibió token" in response_data["Error"]
    
    def test_movie_details_endpoint_invalid_token(self, client):
        """Test detalles de película con token inválido"""
        headers = {'Authorization': 'Bearer invalid-token'}
        response = client.get('/movies/detailsScreen?movieId=1', headers=headers)
        
        # Debería fallar por token inválido
        assert response.status_code in [401, 400]
    
    def test_movie_details_endpoint_nonexistent_movie(self, client):
        """Test detalles de película inexistente"""
        # Mock de token válido
        mock_payload = {"email": "test@example.com"}
        
        with patch('app.controllers.movie_controller.jwt.decode', return_value=mock_payload):
            headers = {'Authorization': 'Bearer valid-token'}
            response = client.get('/movies/detailsScreen?movieId=99999', headers=headers)
            
            # Debería fallar por película inexistente
            assert response.status_code in [401, 404]
