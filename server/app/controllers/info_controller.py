from flask import request, redirect, jsonify
from ..models.models import *
from ..config import Config
from ..db import db
from sqlalchemy import func, or_, desc
from sqlalchemy.orm import joinedload
import jwt

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
        
        generos = [genero.nombre_genero for genero in peli_check.generos]

        plataformas = [plat.nombre_plataforma for plat in peli_check.plataformas]


        pelicula_select = {"movie_id": peli_check.id_pelicula, 
                          "movie_name": peli_check.titulo,
                          "movie_description": peli_check.trama,
                          "movie_length": peli_check.duracion,
                          "movie_release": peli_check.anio_lanzamiento,
                          "movie_classification": peli_check.clasificacion_edad,
                          "movie_score_critica": peli_check.score_critica,
                          "movie_platforms": plataformas,  #es una lista
                          "movie_genres": generos,         #es una lista
                          "movie_poster_url": peli_check.url_poster,
                          "movie_score_usuarios": peli_check.score_usuarios,
                          "movie_director": peli_check.directores,
                          "movie_popularidad": peli_check.popularidad_percentil}         
        
        #El front recibe algo tal cual como lo de arriba
        
        return jsonify(pelicula_select), 200

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


#Esta funcion va en /user_controller     
def show_form():
    if request.method == "GET":
        
        paises = Pais.query.all()
        
        lista_paises = [{"id": pais.id_pais,
                         "name": pais.nombre_pais,
                         'flag': pais.url_bandera} for pais in paises]

        plataformas = Plataforma.query.all()

        lista_plataformas = [{"id": plataforma.id_plataforma,
                            "name": plataforma.nombre_plataforma,
                            "logo": plataforma.url_logo} for plataforma in plataformas]
        
        generos = Genero.query.all()
        lista_genero = [{"id": genero.id_genero,
                        "name": genero.nombre_genero} for genero in generos]
        
        
        res = {"countries": lista_paises, "platforms": lista_plataformas, "genres": lista_genero}
        return jsonify(res), 200


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
            joinedload("generos_fav"),
            joinedload("plataformas")
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
            "id_pelicula": p.id_pelicula,
            "titulo": p.titulo,
            "poster": p.url_poster} for p in peliculas]
        
        return jsonify(res), 200