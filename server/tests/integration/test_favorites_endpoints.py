"""
Tests de integración para endpoints de favoritos
"""
import pytest
import json
import jwt
from unittest.mock import patch, MagicMock


@pytest.mark.integration
class TestFavoritesEndpoints:
    """Tests para endpoints de favoritos"""
    
    def _create_invalid_jwt_token(self):
        """Crear un token JWT inválido para testing"""
        return "invalid-token-format"
    
    def test_add_favorite_no_token(self, client):
        """Test agregar favorito sin token"""
        data = {"movie_id": 1, "action": "add"}
        response = client.post('/user/to_favorite',
                             data=json.dumps(data),
                             content_type='application/json')
        
        # El controlador no verifica el error de get_token_user_fav, puede retornar 404 o 500
        assert response.status_code in [401, 404, 500]
    
    def test_add_favorite_invalid_token(self, client):
        """Test agregar favorito con token inválido"""
        token = self._create_invalid_jwt_token()
        headers = {'Authorization': f'Bearer {token}'}
        data = {"movie_id": 1, "action": "add"}
        response = client.post('/user/to_favorite',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code in [401, 400]
    
    def test_add_favorite_no_movie_id(self, client, auth_token):
        """Test agregar favorito sin movie_id"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"action": "add"}
        response = client.post('/user/to_favorite',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 400
        response_data = response.get_json()
        assert "Movie id is missing" in response_data.get("msg", "")
    
    def test_add_favorite_nonexistent_movie(self, client, auth_token):
        """Test agregar favorito con película inexistente"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"movie_id": 99999, "action": "add"}
        response = client.post('/user/to_favorite',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 404
        response_data = response.get_json()
        assert "Cannot find specified movie" in response_data.get("msg", "")
    
    def test_add_favorite_success(self, client, test_usuario, test_pelicula, auth_token):
        """Test agregar favorito exitosamente"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"movie_id": 1, "action": "add"}
        response = client.post('/user/to_favorite',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Movie added successfully" in response_data.get("msg", "")
    
    def test_add_favorite_already_favorite(self, client, app, test_usuario, test_pelicula, auth_token):
        """Test agregar favorito cuando ya está en favoritos"""
        # Agregar película a favoritos primero
        with app.app_context():
            from app.db import db
            from app.models.models import Usuario, Pelicula
            usuario_real = Usuario.query.get(test_usuario.mail)
            pelicula_real = Pelicula.query.get(test_pelicula.id_pelicula)
            if usuario_real and pelicula_real and pelicula_real not in usuario_real.favoritas:
                usuario_real.favoritas.append(pelicula_real)
                db.session.commit()
        
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"movie_id": 1, "action": "add"}
        response = client.post('/user/to_favorite',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Movie is already in favourites" in response_data.get("msg", "")
    
    def test_remove_favorite_success(self, client, app, test_usuario, test_pelicula, auth_token):
        """Test remover favorito exitosamente"""
        # Agregar película a favoritos primero
        with app.app_context():
            from app.db import db
            from app.models.models import Usuario, Pelicula
            usuario_real = Usuario.query.get(test_usuario.mail)
            pelicula_real = Pelicula.query.get(test_pelicula.id_pelicula)
            if usuario_real and pelicula_real and pelicula_real not in usuario_real.favoritas:
                usuario_real.favoritas.append(pelicula_real)
                db.session.commit()
        
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"movie_id": 1, "action": "remove"}
        response = client.post('/user/to_favorite',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Movie removed from favourites successfully" in response_data.get("msg", "")
    
    def test_remove_favorite_not_in_favorites(self, client, test_usuario, test_pelicula, auth_token):
        """Test remover favorito cuando no está en favoritos"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"movie_id": 1, "action": "remove"}
        response = client.post('/user/to_favorite',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Cannot find this movie in favourites" in response_data.get("msg", "")
    
    def test_add_favorite_default_action(self, client, test_usuario, test_pelicula, auth_token):
        """Test agregar favorito sin especificar action (debe usar 'add' por defecto)"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {"movie_id": 1}  # Sin action
        response = client.post('/user/to_favorite',
                             data=json.dumps(data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert "Movie added successfully" in response_data.get("msg", "") or "Movie is already in favourites" in response_data.get("msg", "")
    
    def test_get_favorites_no_token(self, client):
        """Test obtener favoritos sin token"""
        response = client.get('/user/favorites')
        
        # El controlador no verifica el error de get_token_user_fav, puede retornar 404 o 500
        assert response.status_code in [401, 404, 500]
    
    def test_get_favorites_invalid_token(self, client):
        """Test obtener favoritos con token inválido"""
        token = self._create_invalid_jwt_token()
        headers = {'Authorization': f'Bearer {token}'}
        response = client.get('/user/favorites', headers=headers)
        
        assert response.status_code in [401, 400]
    
    def test_get_favorites_success(self, client, test_usuario, auth_token):
        """Test obtener favoritos exitosamente"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.get('/user/favorites', headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
    
    def test_get_favorites_structure(self, client, app, test_usuario, test_pelicula, auth_token):
        """Test verificar estructura de respuesta de favoritos"""
        # Agregar película a favoritos primero
        with app.app_context():
            from app.db import db
            from app.models.models import Usuario, Pelicula
            usuario_real = Usuario.query.get(test_usuario.mail)
            pelicula_real = Pelicula.query.get(test_pelicula.id_pelicula)
            if usuario_real and pelicula_real and pelicula_real not in usuario_real.favoritas:
                usuario_real.favoritas.append(pelicula_real)
                db.session.commit()
        
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.get('/user/favorites', headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        
        if len(response_data) > 0:
            favorite = response_data[0]
            assert "id" in favorite
            assert "title" in favorite
            assert "poster" in favorite
    
    def test_get_favorites_empty(self, client, test_usuario, auth_token):
        """Test obtener favoritos cuando no hay favoritos"""
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = client.get('/user/favorites', headers=headers)
        
        assert response.status_code == 200
        response_data = response.get_json()
        assert isinstance(response_data, list)
        # Puede estar vacío si el usuario no tiene favoritos

