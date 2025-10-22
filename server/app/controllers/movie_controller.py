from flask import request, redirect, jsonify
from ..models.models import *
from ..config import Config
from ..db import db
from sqlalchemy import func, or_, desc
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import exists
import jwt


def show_home_movies():
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
            joinedload(Usuario.generos_fav),
            joinedload(Usuario.plataformas)
        ).filter_by(mail=mail_usuario).first()

        if not usuario:
            print(f"Usuario con mail \"{mail_usuario}\" no encontrado")
            return jsonify({"error": f"Usuario con mail \"{mail_usuario}\" no encontrado"}), 404
       
        id_generos = [g.id_genero for g in usuario.generos_fav]
        id_plataformas = [p.id_plataforma for p in usuario.plataformas]
        id_pais = usuario.id_pais

        #Capaz que funciona horrible
        peliculas = (
            Pelicula.query
            .options(
                joinedload(Pelicula.generos),
                joinedload(Pelicula.plataformas_paises)
            )
            .join(Pelicula.generos)
            .join(Pelicula.plataformas_paises)
            .filter(Genero.id_genero.in_(id_generos))
            .filter(PeliculaPlataformaPais.id_plataforma.in_(id_plataformas))
            .filter(PeliculaPlataformaPais.id_pais == id_pais)
            .order_by(desc(Pelicula.score_critica))
            .distinct()
            .limit(6)
            .all()
        )

        res = [{
            "id": p.id_pelicula,
            "title": p.titulo,
            "poster": p.url_poster,
            "genres":[g.nombre_genero for g in p.generos]} for p in peliculas]
       
        return jsonify(res), 200


def request_movie_info():
    if request.method == "GET":
        if (not request.args) or (not request.args.get("query")):
            return jsonify({"error": "no se recibió query"}), 400
       
        nombre_peli = request.args.get("query")

        # paginación: tamaño fijo 20, asume página 0 si no se recibió o es inválida
        page_arg = request.args.get("page")
        try:
            page = int(page_arg) if page_arg is not None else 0
            if page < 0:
                page = 0
        except (ValueError, TypeError):
            page = 0

        # usa GIN para buscar usando un vector de texto para encontrar similitudes
        peliculas = (
            db.session.query(PeliculaCompleta)
            .filter(
                or_(
                    # usando GIN
                    func.to_tsvector('english', PeliculaCompleta.titulo).op('@@')(
                        func.plainto_tsquery('english', nombre_peli)
                    ),
                    # usando con trigram (ILIKE)
                    PeliculaCompleta.titulo.ilike(f"%{nombre_peli}%")
                )
            )
            .order_by(PeliculaCompleta.titulo)
            .limit(21)
            .offset(page * 20)
            .all()
        )

        lista_peliculas = [ {"id": peli.id_pelicula,
                             "title": peli.titulo,
                             "poster": peli.url_poster,
                             "genres": peli.generos,
                             "platforms": peli.plataformas,
                             "year": peli.anio_lanzamiento,
                             "runtime":peli.duracion,
                             "director":peli.directores,
                             "rating":peli.score_critica,
                             "description":peli.trama,
                             "ageRating":peli.clasificacion_edad
                             } for peli in peliculas]

        return jsonify(lista_peliculas)
         

def movie_details_screen_info():
    if request.method == "GET":
        if (not request.args) or (not request.args.get("movieId")):
            return jsonify({"error": "no se recibió movieId"}), 400
       
        id_peli = request.args.get("movieId")


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
       
        peli = PeliculaCompleta.query.filter_by(id_pelicula = id_peli).first()

        if not peli:
            return jsonify({"Error": "La pelicula no existe"}), 401
       
        is_fav = db.session.query(pelis_favoritas).filter_by(
            mail_usuario=usuario.mail,
            id_pelicula=id_peli
        ).first() is not None
    
        pelicula_select = {
            "id": peli.id_pelicula,
            "genres": peli.generos,
            "platforms": peli.plataformas,
            "year": peli.anio_lanzamiento,
            "runtime": peli.duracion,
            "director": peli.directores,
            "rating": peli.score_critica,
            "description": peli.trama,
            "ageRating": peli.clasificacion_edad,
            "is_favorite": is_fav
        }
        
        return jsonify(pelicula_select), 200