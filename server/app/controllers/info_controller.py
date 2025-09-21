from flask import request, redirect, jsonify
from ..models.models import *
from ..config import Config
from ..db import db
from sqlalchemy import func, or_

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
                             "director":"Director no implementado",
                             "rating":peli.score,
                             "description":peli.trama,
                             "ageRating":peli.clasificacion_edad
                             } for peli in peliculas]

        return jsonify(lista_peliculas)



def selected_movie_info():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        id_peli = info.get("movie_id")

        peli_check = Pelicula.query.filter_by(id_pelicula = id_peli).first()

        if not peli_check:
            return jsonify({"Error": "La pelicula no existe"}), 401
        
        #Aun no paso el poster porque no sabemos que hacer con eso aún
        generos = [genero.nombre_genero for genero in peli_check.generos]

        plataformas = [plat.nombre_plataforma for plat in peli_check.plataformas]


        pelicula_select = {"movie_id": peli_check.id_pelicula, 
                          "movie_name": peli_check.titulo,
                          "movie_description": peli_check.trama,
                          "movie_length": peli_check.duracion,
                          "movie_release": peli_check.anio_lanzamiento,
                          "movie_classification": peli_check.clasificacion_edad,
                          "movie_score": peli_check.score,
                          "movie_platforms": plataformas,  #es una lista
                          "movie_genres": generos,         #es una lista
                          "movie_poster_url": peli_check.url_poster}         
        
        #El front recibe algo tal cual como lo de arriba
        
        return jsonify(pelicula_select), 200
        
