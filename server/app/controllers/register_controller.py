from flask import request, redirect, jsonify
from ..models.models import *
from ..config import Config, bcrypt
from ..db import db



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
            return jsonify({"error": "Ya existe el usuario"}), 400
        
        hash_contr = bcrypt.generate_password_hash(contrasenia).decode("utf-8")
        print("hash: ",hash_contr)

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
            return jsonify({"error":"Ya existe en Cognito"}), 400 
        
        n_usuario = Usuario(mail=mail, nombre_cuenta = nombre_usuario, contrasenia = hash_contr, formulario_pendiente=True)
        db.session.add(n_usuario)
        db.session.commit()

        return jsonify({"message":"Registro exitoso"}), 200

