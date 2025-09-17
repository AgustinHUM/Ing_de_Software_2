from flask import request, redirect, jsonify
from ..models.models import *
from ..config import Config
from ..db import db

def request_movie_info():
    if request.method == "GET":

        peliculas = Pelicula.query.with_entities(Pelicula.id_pelicula, Pelicula.titulo).all()

        lista_peliculas = [ {"movie_id": val[0], "movie_name": val[1]} for val in peliculas]

        return jsonify(lista_peliculas)
""""
devuelve algo así
    [
        {"id_pelicula": 1, "nombre_pelicula": "nombre1"},
        {"id_pelicula": 2, "name_pelicula": "nombre2"},
    ]
necesito que me devuelvan el id cuando se elije la peli
"""


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
                          "movie_genres": generos}         #es una lista
        
        #El front recibe algo tal cual como lo de arriba
        
        return jsonify(pelicula_select), 200
        
