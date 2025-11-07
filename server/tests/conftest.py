import os
import pytest
from flask import Flask
from unittest.mock import MagicMock, patch
import sys
import jwt
from app.config import bcrypt

# Mockear pusher ANTES de importar create_app
mock_pusher = MagicMock()
mock_pusher_instance = MagicMock()
mock_pusher.Pusher = MagicMock(return_value=mock_pusher_instance)
sys.modules['pusher'] = mock_pusher

from app import create_app, db
from app.models.models import (
    Usuario, Pais, Plataforma, Genero, Pelicula, 
    Grupo, PeliculaCompleta, PeliculaPlataformaPais
)


@pytest.fixture(scope='function')
def app():
    """Aplicación Flask para testing"""
    # Configurar variables de entorno para testing ANTES de crear la app
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    # Importar Config y sobrescribir antes de crear app
    from app.config import Config
    original_uri = Config.SQLALCHEMY_DATABASE_URI
    Config.SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    app = create_app()
    
    # Sobrescribir configuración para testing
    app.config.update({
        'TESTING': True,
        'WTF_CSRF_ENABLED': False,
        'SECRET_KEY': 'test-secret-key',
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',  # SQLite en memoria
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'COGNITO_USER_POOL_ID': 'test-pool-id',
        'COGNITO_CLIENT_ID': 'test-client-id',
        'COGNITO_REGION': 'us-east-1',
        'COGNITO_CLIENT_SECRET': 'test-client-secret'
    })
    
    # Mock de servicios externos
    with app.app_context():
        # Inicializar bcrypt
        bcrypt.init_app(app)
        
        # Mock de Cognito con excepciones
        cognito_mock = MagicMock()
        cognito_mock.exceptions = MagicMock()
        cognito_mock.exceptions.UsernameExistsException = type('UsernameExistsException', (Exception,), {})
        cognito_mock.exceptions.NotAuthorizedException = type('NotAuthorizedException', (Exception,), {})
        app.config['COGNITO_CLIENT'] = cognito_mock
        
        # Crear tablas en la base de datos de prueba
        db.create_all()
    
    # Restaurar URI original después
    try:
        yield app
    finally:
        with app.app_context():
            db.session.remove()
            try:
                db.drop_all()
            except Exception:
                # Ignorar errores de teardown en SQLite
                pass
        Config.SQLALCHEMY_DATABASE_URI = original_uri


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


# ============================================
# FIXTURES COMPARTIDOS - FASE 1
# ============================================

@pytest.fixture
def test_pais(app):
    """Crear un país de prueba"""
    with app.app_context():
        # Verificar si ya existe
        pais = Pais.query.filter_by(id_pais=1).first()
        if not pais:
            pais = Pais(
                id_pais=1,
                nombre_pais="Argentina",
                codigo_pais="AR",
                url_bandera="https://flagcdn.com/ar.svg"
            )
            db.session.add(pais)
            db.session.commit()
        # Capturar el ID antes de salir del contexto
        pais_id = pais.id_pais
        # Expungir para evitar problemas de sesión
        db.session.expunge(pais)
        # Crear un objeto simple con el ID
        simple_pais = type('SimplePais', (), {'id_pais': pais_id})()
        return simple_pais


@pytest.fixture
def test_genero(app):
    """Crear un género de prueba"""
    with app.app_context():
        # Verificar si ya existe
        genero = Genero.query.filter_by(id_genero=1).first()
        if not genero:
            genero = Genero(
                id_genero=1,
                nombre_genero="Acción"
            )
            db.session.add(genero)
            db.session.commit()
        genero_id = genero.id_genero
        db.session.expunge(genero)
        simple_genero = type('SimpleGenero', (), {'id_genero': genero_id})()
        return simple_genero


@pytest.fixture
def test_plataforma(app):
    """Crear una plataforma de prueba"""
    with app.app_context():
        # Verificar si ya existe
        plataforma = Plataforma.query.filter_by(id_plataforma=1).first()
        if not plataforma:
            plataforma = Plataforma(
                id_plataforma=1,
                nombre_plataforma="Netflix",
                url_logo="https://netflix.com/logo.png"
            )
            db.session.add(plataforma)
            db.session.commit()
        plataforma_id = plataforma.id_plataforma
        db.session.expunge(plataforma)
        simple_plataforma = type('SimplePlataforma', (), {'id_plataforma': plataforma_id})()
        return simple_plataforma


@pytest.fixture
def test_pelicula(app, test_genero, test_plataforma, test_pais):
    """Crear una película de prueba"""
    with app.app_context():
        # Obtener objetos reales de la BD usando los IDs
        genero_id = test_genero.id_genero
        plataforma_id = test_plataforma.id_plataforma
        pais_id = test_pais.id_pais
        
        genero_real = Genero.query.get(genero_id)
        plataforma_real = Plataforma.query.get(plataforma_id)
        pais_real = Pais.query.get(pais_id)
        
        # Verificar si la película ya existe
        pelicula = Pelicula.query.filter_by(id_pelicula=1).first()
        if not pelicula:
            pelicula = Pelicula(
                id_pelicula=1,
                titulo="Test Movie",
                trama="Una película de prueba",
                anio_lanzamiento=2023,
                duracion=120,
                clasificacion_edad="PG-13",
                url_poster="https://example.com/poster.jpg",
                score_critica=8.5,
                directores="Test Director"
            )
            db.session.add(pelicula)
            db.session.flush()  # Para obtener el ID
        
        # Agregar género si no está ya asociado
        if genero_real not in pelicula.generos:
            pelicula.generos.append(genero_real)
        
        # Verificar si la relación película-plataforma-país ya existe
        pelicula_plataforma_pais = PeliculaPlataformaPais.query.filter_by(
            id_pelicula=1,
            id_plataforma=plataforma_id,
            id_pais=pais_id
        ).first()
        if not pelicula_plataforma_pais:
            pelicula_plataforma_pais = PeliculaPlataformaPais(
                id_pelicula=1,
                id_plataforma=plataforma_id,
                id_pais=pais_id
            )
            db.session.add(pelicula_plataforma_pais)
        
        # Verificar si PeliculaCompleta ya existe
        pelicula_completa = PeliculaCompleta.query.filter_by(id_pelicula=1).first()
        if not pelicula_completa:
            pelicula_completa = PeliculaCompleta(
                id_pelicula=1,
                titulo="Test Movie",
                trama="Una película de prueba",
                anio_lanzamiento=2023,
                duracion=120,
                clasificacion_edad="PG-13",
                url_poster="https://example.com/poster.jpg",
                score_critica=8.5,
                directores="Test Director",
                generos="Acción",
                plataformas="Netflix"
            )
            db.session.add(pelicula_completa)
        
        db.session.commit()
        db.session.expunge(pelicula)
        simple_pelicula = type('SimplePelicula', (), {'id_pelicula': 1})()
        return simple_pelicula


@pytest.fixture
def test_usuario(app, test_pais, test_genero, test_plataforma):
    """Crear un usuario completo de prueba con país, géneros y plataformas"""
    with app.app_context():
        # Verificar si ya existe
        usuario = Usuario.query.filter_by(mail="test@example.com").first()
        if usuario:
            return usuario
        
        # Crear hash de contraseña
        password_hash = bcrypt.generate_password_hash("testpassword123").decode("utf-8")
        
        # Obtener IDs de los fixtures (ahora son objetos simples)
        pais_id = test_pais.id_pais
        genero_id = test_genero.id_genero
        plataforma_id = test_plataforma.id_plataforma
        
        # Obtener objetos frescos de la BD
        pais_obj = Pais.query.get(pais_id)
        genero_obj = Genero.query.get(genero_id)
        plataforma_obj = Plataforma.query.get(plataforma_id)
        
        usuario = Usuario(
            mail="test@example.com",
            nombre_cuenta="Test User",
            contrasenia=password_hash,
            id_pais=pais_id,
            id_icono=0,
            formulario_pendiente=False
        )
        if genero_obj:
            usuario.generos_fav.append(genero_obj)
        if plataforma_obj:
            usuario.plataformas.append(plataforma_obj)
        
        db.session.add(usuario)
        db.session.commit()
        # Guardar email y nombre antes de expungir
        usuario_email = usuario.mail
        usuario_nombre = usuario.nombre_cuenta
        db.session.expunge(usuario)
        # Retornar objeto simple con email y nombre
        simple_usuario = type('SimpleUsuario', (), {
            'mail': usuario_email,
            'nombre_cuenta': usuario_nombre
        })()
        return simple_usuario


@pytest.fixture
def test_usuario_sin_formulario(app, test_pais):
    """Crear un usuario sin completar formulario"""
    with app.app_context():
        # Verificar si ya existe
        usuario = Usuario.query.filter_by(mail="newuser@example.com").first()
        if usuario:
            return usuario
        
        password_hash = bcrypt.generate_password_hash("testpassword123").decode("utf-8")
        
        # Obtener ID del fixture
        pais_id = test_pais.id_pais
        
        usuario = Usuario(
            mail="newuser@example.com",
            nombre_cuenta="New User",
            contrasenia=password_hash,
            id_pais=pais_id,
            id_icono=0,
            formulario_pendiente=True
        )
        
        db.session.add(usuario)
        db.session.commit()
        # Guardar email y nombre antes de expungir
        usuario_email = usuario.mail
        usuario_nombre = usuario.nombre_cuenta
        db.session.expunge(usuario)
        # Retornar objeto simple con email y nombre
        simple_usuario = type('SimpleUsuario', (), {
            'mail': usuario_email,
            'nombre_cuenta': usuario_nombre
        })()
        return simple_usuario


@pytest.fixture
def test_grupo(app, test_usuario):
    """Crear un grupo de prueba con un usuario"""
    with app.app_context():
        # Obtener usuario real de la BD usando el email
        usuario_real = Usuario.query.filter_by(mail=test_usuario.mail).first()
        
        # Verificar si el grupo ya existe
        grupo = Grupo.query.filter_by(id_grupo=12345).first()
        if not grupo:
            grupo = Grupo(
                id_grupo=12345,
                nombre_grupo="Test Group"
            )
            db.session.add(grupo)
            db.session.flush()
        
        # Agregar usuario si no está ya en el grupo
        if usuario_real and usuario_real not in grupo.usuarios:
            grupo.usuarios.append(usuario_real)
        
        db.session.commit()
        db.session.expunge(grupo)
        simple_grupo = type('SimpleGrupo', (), {'id_grupo': 12345})()
        return simple_grupo


@pytest.fixture
def auth_token(test_usuario):
    """Generar un token JWT válido para el usuario de prueba"""
    # test_usuario ahora es un objeto simple, así que podemos acceder directamente
    email = test_usuario.mail
    nombre = test_usuario.nombre_cuenta
    
    payload = {
        'sub': 'test-user-id',
        'email': email,
        'cognito:username': nombre
    }
    return jwt.encode(payload, 'test-secret', algorithm='HS256')


@pytest.fixture
def auth_headers_with_token(auth_token):
    """Headers de autenticación con token válido"""
    return {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
