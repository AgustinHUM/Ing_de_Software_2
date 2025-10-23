from flask import request, redirect, jsonify
from ..functions.aux_functions import *
from ..models.models import *
from ..config import Config
from ..db import db

"""
+------------------------------------ FAVOURITES ------------------------------------+
"""

def add_remove_favorite_movie():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        id_pelicula = info.get("movie_id")
        if not id_pelicula:
            return jsonify({"msg": "Movie id is missing"}), 400

        pelicula = Pelicula.query.filter_by(id_pelicula=id_pelicula).first()
        if not pelicula:
            return jsonify({"msg": "Cannot find specified movie"}), 404

        usuario = get_token_user(request, "User not found")

        accion = info.get("action", "add").lower()

        if accion == "remove":
            if pelicula not in usuario.favoritas:
                return jsonify({"msg": "Cannot find this movie in favourites"}), 200

            usuario.favoritas.remove(pelicula)
            db.session.commit()
            return jsonify({"msg": "Movie removed from favourites successfully"}), 200

        else:  # acción por defecto es "add"
            if pelicula in usuario.favoritas:
                return jsonify({"msg": "Movie is already in favourites"}), 200

            usuario.favoritas.append(pelicula)
            db.session.commit()

            return jsonify({"msg": "Movie added successfully"}), 200
        

def show_favorites():
    if request.method == "GET":

        usuario = get_token_user(request, "User not found")

        favoritas = usuario.favoritas or []
        lista = [{"id": peli.id_pelicula, 
                  "title": peli.titulo, 
                  "poster": peli.url_poster} for peli in favoritas]
        
        return jsonify(lista), 200


"""
+------------------------------------- RATED -----------------------------------------+
"""
def rate_movie():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        usuario = get_token_user(request, "User not found")
        mail_usuario = usuario.mail

        movie_id = int(info.get("movie_id")) if info.get("movie_id") else None
        rating = int(info.get("rating")) if info.get("rating") else None

        if not movie_id or rating is None:
            return jsonify({"msg": "movieId y rating son requeridos"}), 400

        pelicula = Pelicula.query.filter_by(id_pelicula=movie_id).first()
        if not pelicula:
            return jsonify({"msg": "Película no encontrada"}), 404

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

        return jsonify({"msg": "Score saved"}), 200


def get_user_rating():
    if request.method == "GET":

        usuario = get_token_user(request, "User not found")
        mail_usuario = usuario.mail

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
        

"""
+-------------------------------------- SEEN -----------------------------------------+
"""

def get_seen_movies():
    if request.method == "GET":

        usuario = get_token_user(request, "User not found")

        mail_usuario = usuario.mail

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