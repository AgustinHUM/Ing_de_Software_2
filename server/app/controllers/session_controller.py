from flask import request, jsonify
from ..models.models import *
from ..config import Config, bcrypt
from ..db import db
from ..functions.aux_functions import *


"""
+------------------------------------ REGISTER ------------------------------------+
"""

def handle_register(info = None):
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        mail = info.get("email")
        nombre_usuario = info.get("username")
        contrasenia = info.get("password")

        if Usuario.query.filter_by(mail=mail).first():
            return jsonify({"msg": "User already exists"}), 400
        
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
            return jsonify({"msg":"User already exists"}), 400 
        
        n_usuario = Usuario(mail=mail, nombre_cuenta = nombre_usuario, contrasenia = hash_contr, formulario_pendiente = True, id_icono = 0) #El 0 es el icono por defecto
        db.session.add(n_usuario)
        db.session.commit()

        return jsonify({"msg":"Register completed successfully"}), 200



"""
+------------------------------------ LOG IN ------------------------------------+
"""
def handle_login():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        mail = info.get("email")
        contrasenia = info.get("password")


        usuario = Usuario.query.filter_by(mail=mail).first()
        if not usuario:
            return jsonify({"msg": "Auth credentials error"}), 401

        if not bcrypt.check_password_hash(usuario.contrasenia, contrasenia):
            return jsonify({"msg": "Auth credentials error"}), 401

        auth_params = {
            "USERNAME": mail,
            "PASSWORD": contrasenia,
            "SECRET_HASH": get_secret_hash(
                mail,
                Config.COGNITO_CLIENT_ID,
                Config.COGNITO_CLIENT_SECRET
            )
        }

        try:
            resp = Config.COGNITO_CLIENT.initiate_auth(
                ClientId=Config.COGNITO_CLIENT_ID,
                AuthFlow="USER_PASSWORD_AUTH",
                AuthParameters=auth_params
            )

            return jsonify({
                "id_token": resp["AuthenticationResult"]["IdToken"],
                "access_token": resp["AuthenticationResult"]["AccessToken"],
                "refresh_token": resp["AuthenticationResult"]["RefreshToken"],
                "nombre_cuenta": usuario.nombre_cuenta,
                "formulario_pendiente": usuario.formulario_pendiente
            }), 200

        except Config.COGNITO_CLIENT.exceptions.NotAuthorizedException:
            return jsonify({"msg": "Auth credentials error"}), 401

        except Exception as e:
            return jsonify({"msg": "Cognito error", "detail": str(e)}), 500
        


def handle_admin_login():
    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        mail = info.get("email")
        contrasenia = info.get("password")


        admin = Admin.query.filter_by(mail=mail).first()
        if not admin:
            return jsonify({"msg": "Auth credentials error"}), 401
        
        if admin.esta_eliminado == True:
            return jsonify({"msg": "This administrator account in no longer active"}), 401

        if not bcrypt.check_password_hash(admin.contrasenia, contrasenia):
            return jsonify({"msg": "Auth credentials error"}), 401

        auth_params = {
            "USERNAME": mail,
            "PASSWORD": contrasenia,
            "SECRET_HASH": get_secret_hash(
                mail,
                Config.COGNITO_CLIENT_ID,
                Config.COGNITO_CLIENT_SECRET
            )
        }

        try:
            resp = Config.COGNITO_CLIENT.initiate_auth(
                ClientId=Config.COGNITO_CLIENT_ID,
                AuthFlow="USER_PASSWORD_AUTH",
                AuthParameters=auth_params
            )

            return jsonify({
                "id_token": resp["AuthenticationResult"]["IdToken"],
                "access_token": resp["AuthenticationResult"]["AccessToken"],
                "refresh_token": resp["AuthenticationResult"]["RefreshToken"],
                "nombre_cuenta": admin.nombre_cuenta,
            }), 200

        except Config.COGNITO_CLIENT.exceptions.NotAuthorizedException:
            return jsonify({"msg": "Auth credentials error"}), 401

        except Exception as e:
            return jsonify({"msg": "Cognito error", "detail": str(e)}), 500