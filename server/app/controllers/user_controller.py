from flask import request, redirect, jsonify
from sqlalchemy.orm import joinedload
from ..models.models import *
from ..config import Config
from ..db import db
import random
import jwt


def create_group():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        nombre_grupo_nuevo = info.get("group_name")

        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"Error": "No se recibió token"}), 401

        payload = jwt.decode(token, options={"verify_signature": False})
        mail_usuario = payload.get("email")

        if not mail_usuario:
            return jsonify({"Error": "No se pudo obtener email del token"}), 401
        
        usuario_creador = Usuario.query.filter_by(mail=mail_usuario).first()

        if not usuario_creador:
            return jsonify({"Error": "No se encuentra al usuario creador el grupo"})
        
        id_nuevo_grupo = generate_id()
        nuevo_grupo = Grupo(id_grupo=id_nuevo_grupo, nombre_grupo=nombre_grupo_nuevo)
        nuevo_grupo.usuarios.append(usuario_creador)

        db.session.add(nuevo_grupo)
        db.session.commit()

        codigo_union = id_nuevo_grupo*7 + 13
        codigo_grupo = {"group_join_id": codigo_union}

        return jsonify(codigo_grupo), 200


def add_user_to_group():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        codigo_union = info.get("group_join_id")
        id_grupo = (codigo_union - 13) // 7

        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"Error": "No se recibió token"}), 401

        payload = jwt.decode(token, options={"verify_signature": False})
        mail_usuario = payload.get("email")

        if not mail_usuario:
            return jsonify({"Error": "No se pudo obtener email del token"}), 401
        
        usuario_agregado = Usuario.query.filter_by(mail=mail_usuario).first()

        if not usuario_agregado:
            return jsonify({"Error": "No se encuentra al usuario"})
        
        grupo = Grupo.query.filter_by(id_grupo=id_grupo).first()

        if not grupo:
            return jsonify({"Error": "No se encuentra el grupo"}), 404
        
        grupo.usuarios.append(usuario_agregado)
        db.session.commit()

        return jsonify({"message": "el usuario se agregó con éxito"}), 200


def generate_id():
    while True:
        id_random = random.randint(10000, 99999)

        if not Grupo.query.get(id_random):
            return id_random

def get_user_groups():
    if request.method == "GET":
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"Error": "No se recibió token"}), 401

        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            mail_usuario = payload.get("email")
        except jwt.DecodeError:
            return jsonify({"Error": "Token inválido"}), 401

        if not mail_usuario:
            return jsonify({"Error": "No se pudo obtener email del token"}), 401

        usuario = Usuario.query.filter_by(mail=mail_usuario).first()

        if not usuario:
            return jsonify({"Error": "No se encuentra al usuario"}), 404

        lista_grupos = [
            {"id": grupo.id_grupo, "name": grupo.nombre_grupo, "members": len(grupo.usuarios)}
            for grupo in usuario.grupos
        ]

        return jsonify(lista_grupos), 200

def show_user_info():
        if request.method == "GET":

            token = request.headers.get("Authorization", "").replace("Bearer ", "")
            if not token:
                print("No se recibió token")
                return jsonify({"Error": "No se recibió token"}), 401

            payload = jwt.decode(token, options={"verify_signature": False})
            mail_usuario = payload.get("email")

            if not mail_usuario:
                return jsonify({"Error": "No se pudo obtener email del token"}), 401
            
            usuario = Usuario.query.options(
                joinedload("plataformas")
            ).filter_by(mail=mail_usuario).first()

            if not usuario:
                print(f"Usuario con mail \"{mail_usuario}\" no encontrado")
                return jsonify({"error": f"Usuario con mail \"{mail_usuario}\" no encontrado"})
            
            pais = usuario.pais
            lista_plataformas = [{"id": p.id_plataforma,
                                  "nombre": p.nombre_plataforma,
                                  "logo": p.url_logo} for p in usuario.plataformas]
            
            res = {"email": usuario.mail,
                   "nombre": usuario.nombre_cuenta,
                   "id_pais": pais.id_pais,
                   "flag": pais.url_bandera,
                   "plataformas": lista_plataformas,  
                   }
            
            return jsonify(res), 200
        
def update_user_info():
    if request.method != "POST":
        return jsonify({"error": "Método no permitido"}), 405

    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"Error": "No se recibió token"}), 401
    payload = jwt.decode(token, options={"verify_signature": False})
    mail_usuario = payload.get("email")
    if not mail_usuario:
        return jsonify({"Error": "No se pudo obtener email del token"}), 401

    usuario = Usuario.query.options(
        joinedload("plataformas")
        ).filter_by(mail=mail_usuario).first()
    if not usuario:
        return jsonify({"error": f"Usuario con mail \"{mail_usuario}\" no encontrado"}), 404

    data = request.get_json() if request.is_json else request.form

    if "nombre" in data:
        usuario.nombre_cuenta = data["nombre"]

    if "id_pais" in data:
        usuario.id_pais = data["id_pais"]

    if "plataformas" in data:
        usuario.plataformas.clear()
        for plat_id in data["plataformas"]:
            plat = Plataforma.query.get(plat_id)
            if plat:
                usuario.plataformas.append(plat)

    db.session.commit()


    return jsonify({"message": "Los parametros se actualizaron con exito"}), 200
        

def get_group_users():
    if request.method == "GET":
        # 1) leer ?group_id=... de la URL
        group_id = request.args.get("group_id", type=int)
        if not group_id:
            return jsonify({"Error": "Falta group_id"}), 400

        # 2) buscar UNA fila, no un Query
        grupo = Grupo.query.filter_by(id_grupo=group_id).first()
        if grupo is None:
            return jsonify({"Error": "No se encuentra el grupo"}), 404

        # 3) devolver la lista (vacía si no hay)
        usuarios = grupo.usuarios or []
        lista = [{"email": u.mail, "username": u.nombre_cuenta} for u in usuarios]
        return jsonify(lista), 200


def save_user_form():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            print("No se recibió token")
            return jsonify({"Error": "No se recibió token"}), 401

        payload = jwt.decode(token, options={"verify_signature": False})
        mail_usuario = payload.get("email")

        if not mail_usuario:
            return jsonify({"Error": "No se pudo obtener email del token"}), 401
        
        usuario = Usuario.query.filter_by(mail=mail_usuario).first()
        if not usuario:
            print(f"Usuario con mail \"{mail_usuario}\" no encontrado")
            return jsonify({"error": f"Usuario con mail \"{mail_usuario}\" no encontrado"}), 404

        countries = info.get("countries", [])
        if countries:
            pais = Pais.query.filter_by(id_pais=int(countries[0])).first()  
            if pais:
                usuario.pais = pais

        genres = info.get("genres", [])
        usuario.generos_fav = [
            Genero.query.filter_by(id_genero=int(g)).first()
            for g in genres if Genero.query.filter_by(id_genero=int(g)).first()
        ]

        movies = info.get("movies", [])
        usuario.favoritas = [
            Pelicula.query.filter_by(id_pelicula=int(m)).first()
            for m in movies if Pelicula.query.filter_by(id_pelicula=int(m)).first()
        ]

        services = info.get("services", [])
        usuario.plataformas = [
            Plataforma.query.filter_by(id_plataforma=int(s)).first()
            for s in services if Plataforma.query.filter_by(id_plataforma=int(s)).first()
        ]

        usuario.formulario_pendiente = False

        db.session.commit()

        return jsonify({"msg": "Formulario guardado con éxito"}), 200


def add_remove_favorite_movie():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        id_pelicula = info.get("movie_id")
        if not id_pelicula:
            return jsonify({"Error": "Falta movie_id"}), 400

        pelicula = Pelicula.query.filter_by(id_pelicula=id_pelicula).first()
        if not pelicula:
            return jsonify({"Error": "No se encuentra la película"}), 404

        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            print("No se recibió token")
            return jsonify({"Error": "No se recibió token"}), 401

        payload = jwt.decode(token, options={"verify_signature": False})
        mail_usuario = payload.get("email")

        if not mail_usuario:
            return jsonify({"Error": "No se pudo obtener email del token"}), 401
        
        usuario = Usuario.query.filter_by(mail=mail_usuario).first()
        if not usuario:
            print(f"Usuario con mail \"{mail_usuario}\" no encontrado")
            return jsonify({"error": f"Usuario con mail \"{mail_usuario}\" no encontrado"}), 404

        accion = info.get("action", "add").lower()
        if accion == "remove":
            if pelicula not in usuario.favoritas:
                return jsonify({"msg": "La película no está en favoritas"}), 200

            usuario.favoritas.remove(pelicula)
            db.session.commit()
            return jsonify({"msg": "Película removida de favoritas con éxito"}), 200

        else:  # acción por defecto es "add"
            if pelicula in usuario.favoritas:
                return jsonify({"msg": "La película ya está en favoritas"}), 200

            usuario.favoritas.append(pelicula)
            db.session.commit()

            return jsonify({"msg": "Película agregada a favoritas con éxito"}), 200
        

def show_favorites():
    if request.method == "GET":
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            print("No se recibió token")
            return jsonify({"Error": "No se recibió token"}), 401

        payload = jwt.decode(token, options={"verify_signature": False})
        mail_usuario = payload.get("email")

        if not mail_usuario:
            return jsonify({"Error": "No se pudo obtener email del token"}), 401
        
        usuario = Usuario.query.filter_by(mail=mail_usuario).first()
        if not usuario:
            print(f"Usuario con mail \"{mail_usuario}\" no encontrado")
            return jsonify({"error": f"Usuario con mail \"{mail_usuario}\" no encontrado"}), 404

        favoritas = usuario.favoritas or []
        lista = [{"id": peli.id_pelicula, 
                  "title": peli.titulo, 
                  "poster": peli.url_poster} for peli in favoritas]
        
        return jsonify(lista), 200

        
def rate_movie():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            print("No se recibió token")
            return jsonify({"Error": "No se recibió token"}), 401

        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            mail_usuario = payload.get("email") if payload else None
        except jwt.DecodeError as e:
            print(f"Error decodificando token: {e}")
            return jsonify({"Error": "Token inválido"}), 401
        except Exception as e:
            print(f"Error inesperado con token: {e}")
            return jsonify({"Error": "Error procesando token"}), 401

        if not mail_usuario:
            return jsonify({"Error": "No se pudo obtener email del token"}), 401
        
        usuario = Usuario.query.filter_by(mail=mail_usuario).first()
        if not usuario:
            print(f"Usuario con mail \"{mail_usuario}\" no encontrado")
            return jsonify({"error": f"Usuario con mail \"{mail_usuario}\" no encontrado"}), 404

        movie_id = int(info.get("movie_id")) if info.get("movie_id") else None
        rating = int(info.get("rating")) if info.get("rating") else None

        if not movie_id or rating is None:
            return jsonify({"error": "movie_id y rating son requeridos"}), 400

        pelicula = Pelicula.query.filter_by(id_pelicula=movie_id).first()
        if not pelicula:
            return jsonify({"error": "Película no encontrada"}), 404

        user_movie = UsuarioVioPeli.query.filter_by(
            mail_usuario=mail_usuario,
            id_pelicula=movie_id
        ).first()

        if user_movie:
            user_movie.rating = rating
        else:
            nueva_relacion = UsuarioVioPeli(
                mail_usuario=mail_usuario,
                id_pelicula=movie_id,
                rating=rating
            )
            db.session.add(nueva_relacion)

        db.session.commit()

        return jsonify({"message": "Calificación guardada con éxito"}), 200

def get_seen_movies():
    if request.method == "GET":
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            print("No se recibió token")
            return jsonify({"Error": "No se recibió token"}), 401

        payload = jwt.decode(token, options={"verify_signature": False})
        mail_usuario = payload.get("email")

        if not mail_usuario:
            return jsonify({"Error": "No se pudo obtener email del token"}), 401

        usuario = Usuario.query.filter_by(mail=mail_usuario).first()
        if not usuario:
            print(f"Usuario con mail \"{mail_usuario}\" no encontrado")
            return jsonify({"error": f"Usuario con mail \"{mail_usuario}\" no encontrado"}), 404

        peliculas_vistas = db.session.query(UsuarioVioPeli, Pelicula).join(
            Pelicula, UsuarioVioPeli.id_pelicula == Pelicula.id_pelicula
        ).filter(UsuarioVioPeli.mail_usuario == mail_usuario).all()
        
        if not peliculas_vistas:
            return jsonify([]), 200

        return jsonify([{
            "id": user_movie.id_pelicula,
            "title": pelicula.titulo,
            "rating": user_movie.rating,
            "poster": pelicula.url_poster,
        } for user_movie, pelicula in peliculas_vistas]), 200

def get_user_rating():
    if request.method == "GET":
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            print("No se recibió token")
            return jsonify({"Error": "No se recibió token"}), 401

        payload = jwt.decode(token, options={"verify_signature": False})
        mail_usuario = payload.get("email")

        if not mail_usuario:
            return jsonify({"Error": "No se pudo obtener email del token"}), 401
        
        usuario = Usuario.query.filter_by(mail=mail_usuario).first()
        if not usuario:
            print(f"Usuario con mail \"{mail_usuario}\" no encontrado")
            return jsonify({"error": f"Usuario con mail \"{mail_usuario}\" no encontrado"}), 404

        movie_id = request.args.get("movie_id", type=int)
        
        user_movie = UsuarioVioPeli.query.filter_by(
            mail_usuario=mail_usuario,
            id_pelicula=movie_id
        ).first()
            
        if user_movie:
            return jsonify({
                "rating": user_movie.rating
            }), 200
        else:
            return jsonify({"rating": None}), 200