from flask import request, redirect, jsonify
from ..models.models import *
from ..functions.aux_functions import *
from ..db import db
from sqlalchemy import func, or_, desc


def show_home_movies():
    if request.method == "GET":

        usuario = get_token_full_user(request)
       
        id_generos = [g.id_genero for g in usuario.generos_fav]
        id_plataformas = [p.id_plataforma for p in usuario.plataformas]
        id_pais = usuario.id_pais

        #Capaz que funciona horrible
        peliculas = (
            Pelicula.query
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
            return jsonify({"msg": "Query is missing"}), 400
       
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

        if (not request.args) or (not request.args.get("movie_id")):
            return jsonify({"msg": "Movie id is missing"}), 400
       
        id_peli = request.args.get("movieId")

        usuario = get_token_user(request, "Cannot find user")
       
        peli = PeliculaCompleta.query.filter_by(id_pelicula = id_peli).first()

        if not peli:
            return jsonify({"msg": "Movie does not exists in the database"}), 400
       
        pelicula_select = { "id": peli.id_pelicula,
                            "genres": peli.generos,
                            "platforms": peli.plataformas,
                            "year": peli.anio_lanzamiento,
                            "runtime":peli.duracion,
                            "director":peli.directores,
                            "rating":peli.score_critica,
                            "description":peli.trama,
                            "ageRating":peli.clasificacion_edad,
                            "is_favorite": peli.id_pelicula in list(map(lambda x: x.id_pelicula,usuario.favoritas))
                          }  
        
        return jsonify(pelicula_select), 200