from flask import request, jsonify
from sqlalchemy.orm import joinedload
from ..functions.aux_functions import *
from ..models.models import *
from ..db import db
import jwt


"""
+---------------------------------- USER INFO ----------------------------------+
"""

def show_user_info():
        if request.method == "GET":

            usuario = get_token_full_user(request)
            
            pais = usuario.pais
            lista_plataformas = [{"id": p.id_plataforma,
                                  "name": p.nombre_plataforma,
                                  "image": p.url_logo} for p in usuario.plataformas]
            print(usuario.mail, usuario.nombre_cuenta, pais.id_pais)
            res = {"email": usuario.mail,
                   "name": usuario.nombre_cuenta,
                   "country": pais.id_pais,
                   "flag": pais.url_bandera,
                   "platforms": lista_plataformas,
                   "genres": usuario.generos_fav,
                   "icon": usuario.id_icono,  
                   "genres": [g.nombre_genero for g in usuario.generos_fav],
                   }
            
            return jsonify(res), 200
        

def update_user_info():
    # Deberia ser un UPDATE
    if request.method != "POST":   
        return jsonify({"msg": "Method not allowed"}), 405

    usuario = get_token_user_join(request)

    data = request.get_json() if request.is_json else request.form

    if "name" in data:
        usuario.nombre_cuenta = data["name"]

    if "country" in data:
        usuario.id_pais = data["country"]

    if "platforms" in data:
        plataformas = Plataforma.query.filter(Plataforma.id_plataforma.in_(data["plataformas"])).all()
        usuario.plataformas = plataformas

    if "genres" in data:
        generos = Plataforma.query.filter(Genero.id_genero.in_(data["genres"])).all()
        usuario.generos_fav = generos
    
    if "icon" in data:
        usuario.id_icono = data["icon"]
    
    if "genres" in data:
        usuario.generos_fav.clear()
        for genre_name in data["genres"]:
            genre = Genero.query.filter_by(nombre_genero=genre_name).first()
            if genre:
                usuario.generos_fav.append(genre)

    db.session.commit()

    return jsonify({"msg": "Information saved successfully"}), 200



"""
+------------------------------------ FORM ------------------------------------+
"""

def show_form():
    if request.method == "GET":
       
        paises = Pais.query.all()
        plataformas = Plataforma.query.all()
        generos = Genero.query.all()

        lista_paises = [{"id": p.id_pais, "name": p.nombre_pais, "flag": p.url_bandera} for p in paises]
        lista_plataformas = [{"id": p.id_plataforma, "name": p.nombre_plataforma, "logo": p.url_logo} for p in plataformas]
        lista_genero = [{"id": g.id_genero, "name": g.nombre_genero} for g in generos]

        return jsonify({"countries": lista_paises, "platforms": lista_plataformas, "genres": lista_genero}), 200
    

def save_user_form():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        usuario = get_token_user(request, "User not found")

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

        return jsonify({"msg": "Information saved successfully"}), 200