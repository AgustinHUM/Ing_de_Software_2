from flask import jsonify, render_template, redirect, url_for, request
from ..config import Config, bcrypt
from ..models.models import *


def handle_login():

    if request.method == "POST":
        if request.is_json:
            info = request.get_json()
        else:
            info = request.form

        mail = info.get("email")
        contrasenia = info.get("password")

        usuario = Usuario.query.filter_by(mail = mail).first()
        if not usuario:
            return jsonify({"error": "Error en las credenciales"}), 401
        
        if not bcrypt.check_password_hash(usuario.contrasenia, contrasenia):
            return jsonify({"error": "Error en las credenciales"}), 401
        
        try:
            resp = Config.COGNITO_CLIENT.admin_initiate_auth(UserPoolId=Config.COGNITO_USER_POOL_ID,
                                                             ClientId=Config.COGNITO_CLIENT_ID,
                                                             AuthFlow="ADMIN_NO_SRP_AUTH",
                                                             AuthParameters={
                                                                 "USERNAME": mail,
                                                                 "PASSWORD": contrasenia
                                                             })
            return jsonify({
                "id_token": resp["AuthenticationResult"]["IdToken"],
                "access_token": resp["AuthenticationResult"]["AccessToken"],
                "refresh_token": resp["AuthenticationResult"]["RefreshToken"],
                "nombre_cuenta": usuario.nombre_cuenta
            }), 200
        
        except Config.COGNITO_CLIENT.exceptions.NotAuthorizedException:
            return jsonify({"error": "Error en las credenciales (Cognito)"}), 401

