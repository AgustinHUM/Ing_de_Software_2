from flask import request, jsonify
from ..models.models import *
from ..db import db
from ..functions.aux_functions import *
from ..functions.pusher_client import pusher_client
import jwt
from sqlalchemy.orm import joinedload


def create_group():
    if request.method == "POST":
        info = request.get_json() if request.is_json else request.form
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
            return jsonify({"Error": "No se encuentra al usuario creador del grupo"}), 404

        id_nuevo_grupo = generate_id()
        nuevo_grupo = Grupo(id_grupo=id_nuevo_grupo, nombre_grupo=nombre_grupo_nuevo)
        nuevo_grupo.usuarios.append(usuario_creador)

        db.session.add(nuevo_grupo)
        db.session.commit()

        codigo_union = id_nuevo_grupo * 7 + 13
        return jsonify({"group_join_id": codigo_union}), 200


def add_user_to_group():
    if request.method == "POST":
        info = request.get_json() if request.is_json else request.form
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
        grupo = Grupo.query.options(joinedload(Grupo.usuarios)).filter_by(id_grupo=id_grupo).first()

        if not usuario_agregado or not grupo:
            return jsonify({"Error": "Usuario o grupo no encontrado"}), 404

        if usuario_agregado not in grupo.usuarios:
            grupo.usuarios.append(usuario_agregado)
            db.session.commit()

        pusher_client.trigger(
            f"group-{id_grupo}",
            "new-member",
            {"email": usuario_agregado.mail, "username": usuario_agregado.nombre_cuenta}
        )

        return jsonify({"message": "El usuario se agregó con éxito"}), 200


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

        usuario = Usuario.query.options(joinedload(Usuario.grupos).joinedload(Grupo.usuarios)) \
            .filter_by(mail=mail_usuario).first()

        if not usuario:
            return jsonify({"Error": "No se encuentra al usuario"}), 404

        lista_grupos = [
            {"id": grupo.id_grupo, "name": grupo.nombre_grupo, "members": len(grupo.usuarios)}
            for grupo in usuario.grupos
        ]

        return jsonify(lista_grupos), 200


def get_group_users():
    if request.method == "GET":
        group_id = request.args.get("group_id", type=int)
        if not group_id:
            return jsonify({"Error": "Falta group_id"}), 400

        grupo = Grupo.query.options(joinedload(Grupo.usuarios)).filter_by(id_grupo=group_id).first()
        if not grupo:
            return jsonify({"Error": "No se encuentra el grupo"}), 404

        lista = [{"email": u.mail, "username": u.nombre_cuenta} for u in grupo.usuarios]
        return jsonify(lista), 200
