import random
from ..models.models import *
from ..config import Config, bcrypt
import hmac, hashlib, base64
from flask import request, jsonify
from sqlalchemy.orm import joinedload
import jwt


def get_secret_hash(username, client_id, client_secret):
    msg = username + client_id
    dig = hmac.new(
        client_secret.encode('utf-8'),
        msg.encode('utf-8'),
        hashlib.sha256
    ).digest()
    return base64.b64encode(dig).decode()


def generate_id():
    while True:
        id_random = random.randint(10000, 99999)

        if not Grupo.query.get(id_random):
            return id_random
        

def get_token_user(request, msg):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"msg": "No Token Received"}), 401

        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            mail_usuario = payload.get("email")
        except jwt.DecodeError:
            return jsonify({"msg": "Invalid token"}), 401

        if not mail_usuario:
            return jsonify({"msg": "Cannot obtain email from token"}), 401
        
        usuario = Usuario.query.filter_by(mail=mail_usuario).first()

        if not usuario:
            return jsonify({"msg": msg}), 404

        return usuario


def get_token_full_user(request):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"msg": "No Token Received"}), 401

        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            mail_usuario = payload.get("email")
        except jwt.DecodeError:
            return jsonify({"msg": "Invalid token"}), 401

        if not mail_usuario:
            return jsonify({"msg": "Cannot obtain email from token"}), 401
        
        usuario = Usuario.query.options(
            joinedload(Usuario.generos_fav),
            joinedload(Usuario.plataformas)
        ).filter_by(mail=mail_usuario).first()

        if not usuario:
            return jsonify({"msg": f"User with email as \"{mail_usuario}\" cannot be found"}), 404

        return usuario

def get_token_user_fav(request):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"msg": "No Token Received"}), 401

        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            mail_usuario = payload.get("email")
        except jwt.DecodeError:
            return jsonify({"msg": "Invalid token"}), 401

        if not mail_usuario:
            return jsonify({"msg": "Cannot obtain email from token"}), 401
        
        usuario = Usuario.query.options(
            joinedload(Usuario.favoritas)
        ).filter_by(mail=mail_usuario).first()

        if not usuario:
            return jsonify({"msg": f"User with email as \"{mail_usuario}\" cannot be found"}), 404

        return usuario

def get_token_user_join(request):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"msg": "No Token Received"}), 401

        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            mail_usuario = payload.get("email")
        except jwt.DecodeError:
            return jsonify({"msg": "Invalid token"}), 401

        if not mail_usuario:
            return jsonify({"msg": "Cannot obtain email from token"}), 401
        
        usuario = Usuario.query.options(
            joinedload(Usuario.plataformas),
            joinedload(Usuario.generos_fav),
            joinedload(Usuario.favoritas),
            joinedload(Usuario.pais)
        ).filter_by(mail=mail_usuario).first()

        if not usuario:
            return jsonify({"msg": f"User with email as \"{mail_usuario}\" cannot be found"}), 404

        return usuario          

