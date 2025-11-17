from flask import request, jsonify
from ..models.models import *
from ..db import db
from ..functions.aux_functions import *
from ..functions.pusher_client import pusher_client
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
        return jsonify({"group_join_id": codigo_union}), 200
    

def add_user_to_group():
    if request.method == "POST":
        
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        codigo_union = info.get("group_join_id")
        id_grupo = (codigo_union - 13) // 7

        usuario = get_token_user(request, "Cannot find user to add")
        
        grupo = Grupo.query.options(joinedload(Grupo.usuarios)).filter_by(id_grupo=id_grupo).first()

        if not grupo:
            return jsonify({"msg": "Cannot find specified group"}), 404
        
        if usuario not in grupo.usuarios:
            grupo.usuarios.append(usuario)
            db.session.commit()

        pusher_client.trigger(
            f"group-{id_grupo}",
            "new-member",
            {"email": usuario.mail, "username": usuario.nombre_cuenta}
        )

        return jsonify({"id":id_grupo,"name":grupo.nombre_grupo,"members":len(grupo.usuarios)}), 200
    

def leave_group():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        codigo_union = info.get("group_join_id")
        if codigo_union is None:
            return jsonify({"msg": "group_join_id missing"}), 400

        try:
            id_grupo = int((int(codigo_union) - 13) // 7)
        except Exception:
            return jsonify({"msg": "Invalid group_join_id"}), 400

        usuario = get_token_user(request, "Cannot find user to remove")
        grupo = Grupo.query.options(joinedload(Grupo.usuarios)).filter_by(id_grupo=id_grupo).first()

        if not grupo:
            return jsonify({"msg": "Cannot find specified group"}), 404

        if usuario in grupo.usuarios:
            try:
                grupo.usuarios.remove(usuario)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                return jsonify({"msg": "Error removing user from group", "error": str(e)}), 500

            try:
                pusher_client.trigger(
                    f"group-{id_grupo}",
                    "member-left",
                    {"email": usuario.mail, "username": usuario.nombre_cuenta}
                )
            except Exception as e:
                print("pusher trigger error on leave:", e)

            return jsonify({"id": id_grupo, "name": grupo.nombre_grupo, "members": len(grupo.usuarios)}), 200
        else:
            return jsonify({"msg": "User is not a member of this group"}), 400


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

        grupo = Grupo.query.options(joinedload(Grupo.usuarios)).filter_by(id_grupo=group_id).first()
        if not grupo:
            return jsonify({"Error": "No se encuentra el grupo"}), 404

        lista = [{"email": u.mail, "username": u.nombre_cuenta, "avatar":u.id_icono} for u in grupo.usuarios]

        return jsonify(lista), 200