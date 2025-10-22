from flask import request, jsonify
from sqlalchemy.orm import joinedload
from ..models.models import *
from ..db import db
import jwt

def _get_user_from_token():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return None, jsonify({"Error": "No se recibió token"}), 401

    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        mail_usuario = payload.get("email")
    except Exception:
        return None, jsonify({"Error": "Token inválido"}), 401

    if not mail_usuario:
        return None, jsonify({"Error": "No se pudo obtener email del token"}), 401

    usuario = Usuario.query.options(
        joinedload(Usuario.favoritas)
    ).filter_by(mail=mail_usuario).first()

    if not usuario:
        return None, jsonify({"Error": f"Usuario con mail \"{mail_usuario}\" no encontrado"}), 404

    return usuario, None, None


"""
+------------------------------------ FAVOURITES ------------------------------------+
"""

def add_remove_favorite_movie():
    if request.method != "POST":
        return jsonify({"Error": "Método no permitido"}), 405

    info = request.get_json() if request.is_json else request.form
    id_pelicula = info.get("movie_id")
    if not id_pelicula:
        return jsonify({"Error": "Falta movie_id"}), 400

    pelicula = Pelicula.query.filter_by(id_pelicula=id_pelicula).first()
    if not pelicula:
        return jsonify({"Error": "No se encuentra la película"}), 404

    usuario, err_resp, status = _get_user_from_token()
    if err_resp:
        return err_resp, status

    accion = info.get("action", "add").lower()
    if accion == "remove":
        if pelicula in usuario.favoritas:
            usuario.favoritas.remove(pelicula)
            db.session.commit()
            return jsonify({"msg": "Película removida de favoritas con éxito"}), 200
        else:
            return jsonify({"msg": "La película no está en favoritas"}), 200
    else:  # add
        if pelicula not in usuario.favoritas:
            usuario.favoritas.append(pelicula)
            db.session.commit()
            return jsonify({"msg": "Película agregada a favoritas con éxito"}), 200
        else:
            return jsonify({"msg": "La película ya está en favoritas"}), 200


def show_favorites():
    if request.method != "GET":
        return jsonify({"Error": "Método no permitido"}), 405

    usuario, err_resp, status = _get_user_from_token()
    if err_resp:
        return err_resp, status

    lista = [{"id": peli.id_pelicula,
              "title": peli.titulo,
              "poster": peli.url_poster} for peli in usuario.favoritas]

    return jsonify(lista), 200


"""
+------------------------------------- RATED -----------------------------------------+
"""

def rate_movie():
    if request.method != "POST":
        return jsonify({"Error": "Método no permitido"}), 405

    info = request.get_json() if request.is_json else request.form
    usuario, err_resp, status = _get_user_from_token()
    if err_resp:
        return err_resp, status

    movie_id = info.get("movie_id")
    rating = info.get("rating")

    if movie_id is None or rating is None:
        return jsonify({"error": "movie_id y rating son requeridos"}), 400

    movie_id = int(movie_id)
    rating = int(rating)

    pelicula = Pelicula.query.filter_by(id_pelicula=movie_id).first()
    if not pelicula:
        return jsonify({"error": "Película no encontrada"}), 404

    user_movie = UsuarioVioPeli.query.filter_by(mail_usuario=usuario.mail, id_pelicula=movie_id).first()
    if user_movie:
        user_movie.rating = rating
    else:
        db.session.add(UsuarioVioPeli(mail_usuario=usuario.mail, id_pelicula=movie_id, rating=rating))

    db.session.commit()
    return jsonify({"message": "Calificación guardada con éxito"}), 200


def get_user_rating():
    if request.method != "GET":
        return jsonify({"Error": "Método no permitido"}), 405

    usuario, err_resp, status = _get_user_from_token()
    if err_resp:
        return err_resp, status

    movie_id = request.args.get("movie_id", type=int)
    if not movie_id:
        return jsonify({"error": "Falta movie_id"}), 400

    user_movie = UsuarioVioPeli.query.filter_by(mail_usuario=usuario.mail, id_pelicula=movie_id).first()
    return jsonify({"rating": user_movie.rating if user_movie else None}), 200


"""
+-------------------------------------- SEEN -----------------------------------------+
"""

def get_seen_movies():
    if request.method != "GET":
        return jsonify({"Error": "Método no permitido"}), 405

    usuario, err_resp, status = _get_user_from_token()
    if err_resp:
        return err_resp, status

    peliculas_vistas = db.session.query(UsuarioVioPeli, Pelicula) \
        .join(Pelicula, UsuarioVioPeli.id_pelicula == Pelicula.id_pelicula) \
        .filter(UsuarioVioPeli.mail_usuario == usuario.mail) \
        .all()

    lista = [{
        "id": user_movie.id_pelicula,
        "title": pelicula.titulo,
        "rating": user_movie.rating,
        "poster": pelicula.url_poster
    } for user_movie, pelicula in peliculas_vistas]

    return jsonify(lista), 200
