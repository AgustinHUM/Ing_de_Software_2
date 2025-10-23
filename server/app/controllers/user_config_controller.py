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
            
            res = {"email": usuario.mail,
                   "name": usuario.nombre_cuenta,
                   "country": pais.id_pais,
                   "flag": pais.url_bandera,
                   "platforms": lista_plataformas,
                   "genres": usuario.generos_fav,
                   "icon": usuario.id_icono,  
                   }
            
            return jsonify(res), 200
        

def update_user_info():
    # Deberia ser un UPDATE
    if request.method != "POST":   
        return jsonify({"msg": "Método no permitido"}), 405

    usuario = get_token_full_user(request)

    data = request.get_json() if request.is_json else request.form

    if "name" in data:
        usuario.nombre_cuenta = data["name"]

    if "country" in data:
        usuario.id_pais = data["country"]

    if "platforms" in data:
        usuario.plataformas.clear()
        for plat_id in data["platforms"]:
            plat = Plataforma.query.get(plat_id)
            if plat:
                usuario.plataformas.append(plat)
    
    if "icon" in data:
        usuario.id_icono = data["icon"]

    db.session.commit()

    return jsonify({"msg": "Information saved successfully"}), 200



"""
+------------------------------------ FORM ------------------------------------+
"""

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