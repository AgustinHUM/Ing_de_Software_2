from flask import request, jsonify
from sqlalchemy.orm import joinedload
from ..models.models import *
from ..db import db
import jwt


"""
+------------------------------------ USER INFO ------------------------------------+
"""

def show_user_info():
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
                joinedload(Usuario.plataformas)
            ).filter_by(mail=mail_usuario).first()

            if not usuario:
                print(f"Usuario con mail \"{mail_usuario}\" no encontrado")
                return jsonify({"error": f"Usuario con mail \"{mail_usuario}\" no encontrado"})
            
            pais = usuario.pais
            lista_plataformas = [{"id": p.id_plataforma,
                                  "nombre": p.nombre_plataforma,
                                  "logo": p.url_logo} for p in usuario.plataformas]
            
            res = {"email": usuario.mail,
                   "nombre": usuario.nombre_cuenta,
                   "id_pais": pais.id_pais,
                   "flag": pais.url_bandera,
                   "plataformas": lista_plataformas,  
                   }
            
            return jsonify(res), 200
        

def update_user_info():
    if request.method != "POST":
        return jsonify({"error": "Método no permitido"}), 405

    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"Error": "No se recibió token"}), 401
    payload = jwt.decode(token, options={"verify_signature": False})
    mail_usuario = payload.get("email")
    if not mail_usuario:
        return jsonify({"Error": "No se pudo obtener email del token"}), 401

    usuario = Usuario.query.options(
        joinedload(Usuario.plataformas)
        ).filter_by(mail=mail_usuario).first()
    if not usuario:
        return jsonify({"error": f"Usuario con mail \"{mail_usuario}\" no encontrado"}), 404

    data = request.get_json() if request.is_json else request.form

    if "nombre" in data:
        usuario.nombre_cuenta = data["nombre"]

    if "id_pais" in data:
        usuario.id_pais = data["id_pais"]

    if "plataformas" in data:
        usuario.plataformas.clear()
        for plat_id in data["plataformas"]:
            plat = Plataforma.query.get(plat_id)
            if plat:
                usuario.plataformas.append(plat)

    db.session.commit()

    return jsonify({"message": "Los parametros se actualizaron con exito"}), 200



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

        return jsonify({"msg": "Formulario guardado con éxito"}), 200