from flask import request, redirect, jsonify
from ..models.models import *
from ..config import Config
from ..db import db
import random
import jwt

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
            pais = Pais.query.filter_by(nombre_pais=countries[0]).first()  
            if pais:
                usuario.pais = pais

        genres = info.get("genres", [])
        usuario.generos_fav = [
            Genero.query.filter_by(nombre_genero=g).first()
            for g in genres if Genero.query.filter_by(nombre_genero=g).first()
        ]

        movies = info.get("movies", [])
        usuario.favoritas = [
            Pelicula.query.filter_by(id_pelicula=int(m[1:])).first()
            for m in movies if Pelicula.query.filter_by(id_pelicula=int(m[1:])).first()
        ]

        services = info.get("services", [])
        usuario.plataformas = [
            Plataforma.query.filter_by(id_plataforma=int(s[1:])).first()
            for s in services if Plataforma.query.filter_by(id_plataforma=int(s[1:])).first()
        ]

        db.session.commit()

        return jsonify({"msg": "Formulario guardado con éxito"}), 200


def create_group():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        nombre_grupo_nuevo = info.get("group_name")

        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"Error": "No se recibió token"}), 401

        payload = jwt.decode(token, options={"verify_signature": False})
        mail_usuario = payload.get("email")

        if not mail_usuario:
            return jsonify({"Error": "No se pudo obtener email del token"}), 401
        
        usuario_creador = Usuario.query.filter_by(mail=mail_usuario).first()

        if not usuario_creador:
            return jsonify({"Error": "No se encuentra al usuario creador el grupo"})
        
        id_nuevo_grupo = generate_id()
        nuevo_grupo = Grupo(id_grupo=id_nuevo_grupo, nombre_grupo=nombre_grupo_nuevo)
        nuevo_grupo.usuarios.append(usuario_creador)

        db.session.add(nuevo_grupo)
        db.session.commit()

        codigo_union = id_nuevo_grupo*7 + 13
        codigo_grupo = {"group_join_id": codigo_union}

        return jsonify(codigo_grupo), 200


def add_user_to_group():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        codigo_union = info.get("group_join_id")
        id_grupo = (codigo_union - 13) // 7

        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"Error": "No se recibió token"}), 401

        payload = jwt.decode(token, options={"verify_signature": False})
        mail_usuario = payload.get("email")

        if not mail_usuario:
            return jsonify({"Error": "No se pudo obtener email del token"}), 401
        
        usuario_agregado = Usuario.query.filter_by(mail=mail_usuario).first()

        if not usuario_agregado:
            return jsonify({"Error": "No se encuentra al usuario"})
        
        grupo = Grupo.query.filter_by(id_grupo=id_grupo).first()

        if not grupo:
            return jsonify({"Error": "No se encuentra el grupo"}), 404
        
        grupo.usuarios.append(usuario_agregado)
        db.session.commit()

        return jsonify({"message": "el usuario se agregó con éxito"}), 200


def generate_id():
    while True:
        id_random = random.randint(10000, 99999)

        if not Grupo.query.get(id_random):
            return id_random

def get_user_groups():
    if request.method == "GET":
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"Error": "No se recibió token"}), 401

        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            mail_usuario = payload.get("email")
        except jwt.DecodeError:
            return jsonify({"Error": "Token inválido"}), 401

        if not mail_usuario:
            return jsonify({"Error": "No se pudo obtener email del token"}), 401

        usuario = Usuario.query.filter_by(mail=mail_usuario).first()

        if not usuario:
            return jsonify({"Error": "No se encuentra al usuario"}), 404

        lista_grupos = [
            {"id": grupo.id_grupo, "name": grupo.nombre_grupo, "members": len(grupo.usuarios)}
            for grupo in usuario.grupos
        ]

        return jsonify(lista_grupos), 200

