from flask import request, redirect, jsonify
from ..functions.aux_functions import *
from sqlalchemy.orm import joinedload
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

        usuario = get_token_user_fav(request)

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

        usuario = get_token_user_fav(request)

        lista = [{"id": peli.id_pelicula, 
                  "title": peli.titulo, 
                  "poster": peli.url_poster} for peli in usuario.favoritas]
        
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

        movie_id = int(info.get("movie_id")) if info.get("movie_id") else None
        rating = int(info.get("rating")) if info.get("rating") else None
        
        if not movie_id or rating is None:
            return jsonify({"msg": "movieId y rating son requeridos"}), 400

        pelicula = Pelicula.query.filter_by(id_pelicula=movie_id).first()
        if not pelicula:
            return jsonify({"msg": "Película no encontrada"}), 404

        user_movie = UsuarioVioPeli.query.filter_by(
            mail_usuario=usuario.mail,
            id_pelicula=movie_id
        ).first()

        if user_movie:
            user_movie.rating = rating
        else:
            db.session.add(UsuarioVioPeli(mail_usuario=usuario.mail, id_pelicula=movie_id, rating=rating))


        db.session.commit()

        return jsonify({"msg": "Score saved"}), 200


def get_user_rating():
    if request.method == "GET":

        usuario = get_token_user(request, "User not found")

        movie_id = request.args.get("movie_id", type=int)
        
        user_movie = UsuarioVioPeli.query.filter_by(
            mail_usuario=usuario.mail,
            id_pelicula=movie_id
        ).first()
            
        return jsonify({"rating": user_movie.rating if user_movie else None}), 200
        

"""
+-------------------------------------- SEEN -----------------------------------------+
"""

def get_seen_movies():
    if request.method == "GET":

        usuario = get_token_user(request, "User not found")

        peliculas_vistas = db.session.query(UsuarioVioPeli, Pelicula).join(
            Pelicula, UsuarioVioPeli.id_pelicula == Pelicula.id_pelicula
        ).filter(UsuarioVioPeli.mail_usuario == usuario.mail).all()
        
        if not peliculas_vistas:
            return jsonify({"msg": "Could not fetch seen movies"}), 200

        return jsonify([{
            "id": user_movie.id_pelicula,
            "title": pelicula.titulo,
            "rating": user_movie.rating,
            "poster": pelicula.url_poster,
        } for user_movie, pelicula in peliculas_vistas]), 200
    

"""
+-------------------------------------- RECOMMENDATION -----------------------------------------+
"""
def recommend_movies(mails):
        if not mails:
            return None

        for mail in mails:
            calc_vector_usuario(mail)
            db.session.commit()


        db.session.commit()

        recs = recomendar_grupo(mails)

        pelis_ids = [r.movie_id for r in recs]
        peliculas = (
            db.session.query(Pelicula)
            .filter(Pelicula.id_pelicula.in_(pelis_ids))
            .all()
        )

        peliculas_map = {p.id_pelicula: p for p in peliculas}
        peliculas_ordenadas = [peliculas_map[id] for id in pelis_ids]

        res = [{
            "id": p.id_pelicula,
            "title": p.titulo,
            "poster": p.url_poster,
            "description": p.trama,
            "year": p.anio_lanzamiento,
            "rating": p.score_critica,
            "genres": [g.nombre_genero for g in p.generos],
            "runtime": p.duracion,
        } for p in peliculas_ordenadas]
        print("Recommended movies:", res)
        return res