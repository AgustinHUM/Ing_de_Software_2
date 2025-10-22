from flask import request, jsonify
from sqlalchemy.orm import joinedload
from ..models.models import *
from ..db import db
import jwt

# -------------------- HELPERS -------------------- #
def _get_user_from_token():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return None, jsonify({"Error": "No se recibió token"}), 401

    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        mail_usuario = payload.get("email")
    except Exception:
        return None, jsonify({"Error": "Token inválido"}), 401

    if not mail_usuario:
        return None, jsonify({"Error": "No se pudo obtener email del token"}), 401

    usuario = Usuario.query.options(
        joinedload(Usuario.plataformas),
        joinedload(Usuario.generos_fav),
        joinedload(Usuario.favoritas),
        joinedload(Usuario.pais)
    ).filter_by(mail=mail_usuario).first()

    if not usuario:
        return None, jsonify({"Error": f"Usuario con mail \"{mail_usuario}\" no encontrado"}), 404

    return usuario, None, None

# -------------------- USER INFO -------------------- #
def show_user_info():
    if request.method != "GET":
        return jsonify({"Error": "Método no permitido"}), 405

    usuario, err_resp, status = _get_user_from_token()
    if err_resp:
        return err_resp, status

    lista_plataformas = [{"id": p.id_plataforma,
                          "nombre": p.nombre_plataforma,
                          "logo": p.url_logo} for p in usuario.plataformas]

    res = {
        "email": usuario.mail,
        "nombre": usuario.nombre_cuenta,
        "id_pais": usuario.pais.id_pais if usuario.pais else None,
        "flag": usuario.pais.url_bandera if usuario.pais else None,
        "plataformas": lista_plataformas,
    }

    return jsonify(res), 200


def update_user_info():
    if request.method != "POST":
        return jsonify({"error": "Método no permitido"}), 405

    usuario, err_resp, status = _get_user_from_token()
    if err_resp:
        return err_resp, status

    data = request.get_json() if request.is_json else request.form

    if "nombre" in data:
        usuario.nombre_cuenta = data["nombre"]

    if "id_pais" in data:
        pais = Pais.query.get(data["id_pais"])
        if pais:
            usuario.pais = pais

    if "plataformas" in data:
        plataformas = Plataforma.query.filter(Plataforma.id_plataforma.in_(data["plataformas"])).all()
        usuario.plataformas = plataformas

    db.session.commit()
    return jsonify({"message": "Los parámetros se actualizaron con éxito"}), 200

# -------------------- FORM -------------------- #
def show_form():
    if request.method != "GET":
        return jsonify({"Error": "Método no permitido"}), 405

    # traer todo de una sola vez
    paises = Pais.query.all()
    plataformas = Plataforma.query.all()
    generos = Genero.query.all()

    lista_paises = [{"id": p.id_pais, "name": p.nombre_pais, "flag": p.url_bandera} for p in paises]
    lista_plataformas = [{"id": p.id_plataforma, "name": p.nombre_plataforma, "logo": p.url_logo} for p in plataformas]
    lista_genero = [{"id": g.id_genero, "name": g.nombre_genero} for g in generos]

    return jsonify({"countries": lista_paises, "platforms": lista_plataformas, "genres": lista_genero}), 200


def save_user_form():
    if request.method != "POST":
        return jsonify({"error": "Método no permitido"}), 405

    info = request.get_json() if request.is_json else request.form
    usuario, err_resp, status = _get_user_from_token()
    if err_resp:
        return err_resp, status

    # countries
    countries = info.get("countries", [])
    if countries:
        pais = Pais.query.get(int(countries[0]))
        if pais:
            usuario.pais = pais

    # generos_fav
    genres = info.get("genres", [])
    if genres:
        generos = Genero.query.filter(Genero.id_genero.in_([int(g) for g in genres])).all()
        usuario.generos_fav = generos

    # favoritas
    movies = info.get("movies", [])
    if movies:
        peliculas = Pelicula.query.filter(Pelicula.id_pelicula.in_([int(m) for m in movies])).all()
        usuario.favoritas = peliculas

    # plataformas
    services = info.get("services", [])
    if services:
        plataformas = Plataforma.query.filter(Plataforma.id_plataforma.in_([int(s) for s in services])).all()
        usuario.plataformas = plataformas

    usuario.formulario_pendiente = False
    db.session.commit()

    return jsonify({"msg": "Formulario guardado con éxito"}), 200
