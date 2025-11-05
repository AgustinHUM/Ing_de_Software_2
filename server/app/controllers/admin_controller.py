from flask import request, redirect, jsonify
from ..functions.aux_functions import *
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from ..models.models import *
from ..config import Config
from ..db import db


def admin_create():
    if request.method == "POST":
        info = request.get_json() if request.is_json else request.form

        # Permitir crear el PRIMER admin sin token
        if Admin.query.count() == 0:
            admin_creador = None
        else:
            admin_creador = get_token_admin(request, "Administrator (creator) not found")

        mail = info.get("email")
        nombre_usuario = info.get("username")
        contrasenia = info.get("password")

        if Admin.query.filter_by(mail=mail).first():
            return jsonify({"msg": "Administrator already exists"}), 400
        
        hash_contr = bcrypt.generate_password_hash(contrasenia).decode("utf-8")

        try:

            Config.COGNITO_CLIENT.admin_create_user(
                UserPoolId=Config.COGNITO_USER_POOL_ID,
                Username=mail,
                UserAttributes=[
                    {"Name": "email", "Value": mail},
                    {"Name": "name", "Value": nombre_usuario}
                ],
                MessageAction="SUPPRESS", 
                TemporaryPassword=contrasenia
            )

            Config.COGNITO_CLIENT.admin_set_user_password(
                UserPoolId=Config.COGNITO_USER_POOL_ID,
                Username=mail,
                Password=contrasenia,
                Permanent=True
            )
        except Config.COGNITO_CLIENT.exceptions.UsernameExistsException:
            return jsonify({"msg":"Administrator already exists in cognito"}), 400 
        
        n_admin = Admin(
            mail=mail,
            nombre_cuenta=nombre_usuario,
            contrasenia=hash_contr,
            mail_creador = admin_creador.mail if admin_creador else None
        )
        db.session.add(n_admin)
        db.session.commit()

        return jsonify({"msg": "Administrator created successfully"}), 201



def admin_delete():
    if request.method == "DELETE":
        info = request.get_json() if request.is_json else request.form

        admin_eliminador = get_token_admin(request, "Administrator (deleter) not found")

        mail = info.get("email")

        admin_a_eliminar = Admin.query.filter_by(mail=mail).first()
        if not admin_a_eliminar:
            return jsonify({"msg": "Administrator to delete not found"}), 404
        
        if admin_eliminador.mail == admin_a_eliminar.mail:
            return jsonify({"msg": "You cannot delete yourself"}), 400

        if admin_a_eliminar.mail == "rootadmin@mingle.com":
            return jsonify({"msg": "Cannot delete root administrator"}), 403

        admin_a_eliminar.eliminado_por_mail = admin_eliminador.mail
        admin_a_eliminar.esta_eliminado = True
        db.session.commit()

        return jsonify({"msg": "Administrator deleted successfully"}), 200
    
    

def admin_user_count():
    if request.method == "GET":
        cantidad = db.session.query(func.count(Usuario.id_usuario)).scalar()
        return jsonify({"user_count": cantidad}), 200



def get_most_rated_movies():
    if request.method == "GET":
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 10))
            if page < 1:
                page = 1
            if per_page < 1:
                per_page = 10

            query_paginada = get_paginated_rm(page, per_page)

            res = [{"id": peli.Pelicula.id_pelicula,
                    "title": peli.Pelicula.titulo,
                    "avg_rating": float(peli.promedio_rating),
                    "raing_count": int(peli.cantidad_ratings),} for peli in query_paginada]

            return jsonify({
                "page": page,
                "per_page": per_page,
                "movies": res
            }), 200

        except Exception as e:
            return jsonify({"msg": "Cannot obtain most rated movies"}), 500
    


def get_users_most_favourite_movies():
    if request.method == "GET":
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))

        resultados = get_paginated_fm(page, per_page)

        res = [{"id": peli.Pelicula.id_pelicula,
                "title": peli.Pelicula.titulo,
                "fv_count": int(peli.cantidad_favoritos),} for peli in resultados]

        return jsonify({
            "page": page,
            "per_page": per_page,
            "movies": res
        }), 200
