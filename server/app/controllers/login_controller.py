from flask import jsonify, render_template, redirect, url_for, request
from ..config import Config, bcrypt
from ..models.models import *
import hmac, hashlib, base64

def get_secret_hash(username, client_id, client_secret):
    msg = username + client_id
    dig = hmac.new(
        client_secret.encode('utf-8'),
        msg.encode('utf-8'),
        hashlib.sha256
    ).digest()
    return base64.b64encode(dig).decode()


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
            return jsonify({"error": "Error en las credenciales"}), 401

        if not bcrypt.check_password_hash(usuario.contrasenia, contrasenia):
            print("contraseña recibida:", repr(contrasenia))
            print("hash almacenado:", repr(usuario.contrasenia))
            print("check:", bcrypt.check_password_hash(usuario.contrasenia, contrasenia))

            return jsonify({"error": "Error en las credenciales"}), 401


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
                "nombre_cuenta": usuario.nombre_cuenta
            }), 200

        except Config.COGNITO_CLIENT.exceptions.NotAuthorizedException:
            return jsonify({"error": "Error en las credenciales (Cognito)"}), 401

        except Exception as e:
            return jsonify({"error": "Error inesperado en Cognito", "detail": str(e)}), 500