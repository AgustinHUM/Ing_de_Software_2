from flask import request, jsonify
from ..models.models import *
from ..db import db
from ..functions.aux_functions import *
import jwt



def create_group():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        nombre_grupo_nuevo = info.get("group_name")

        usuario = get_token_user(request, "Cannot group owner")
        
        id_nuevo_grupo = generate_id()
        nuevo_grupo = Grupo(id_grupo=id_nuevo_grupo, nombre_grupo=nombre_grupo_nuevo)
        nuevo_grupo.usuarios.append(usuario)

        db.session.add(nuevo_grupo)
        db.session.commit()

        codigo_union = id_nuevo_grupo*7 + 13
        codigo_grupo = {"id": codigo_union}

        return jsonify(codigo_grupo), 200
    

def add_user_to_group():
    if request.method == "POST":
        
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        codigo_union = info.get("id")
        id_grupo = (codigo_union - 13) // 7

        usuario = get_token_user(request, "Cannot find user to add")
        
        grupo = Grupo.query.filter_by(id_grupo=id_grupo).first()

        if not grupo:
            return jsonify({"msg": "Cannot find specified group"}), 404
        
        grupo.usuarios.append(usuario)
        db.session.commit()

        return jsonify({"message": "User added successfully"}), 200
    
        
def get_user_groups():
    if request.method == "GET":

        usuario = get_token_user(request, "Cannot find user")

        lista_grupos = [
            {"id": grupo.id_grupo, "name": grupo.nombre_grupo, "members": len(grupo.usuarios)}
            for grupo in usuario.grupos
        ]

        return jsonify(lista_grupos), 200
    

def get_group_users():
    if request.method == "GET":

        group_id = request.args.get("group_id", type=int)
        if not group_id:
            return jsonify({"msg": "Group id is missing"}), 400

        grupo = Grupo.query.filter_by(id_grupo=group_id).first()
        if grupo is None:
            return jsonify({"msg": "Cannot find group"}), 404

        usuarios = grupo.usuarios or []
        lista = [{"email": u.mail, "username": u.nombre_cuenta} for u in usuarios]

        return jsonify(lista), 200