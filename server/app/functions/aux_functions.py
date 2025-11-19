import random
from ..models.models import *
from ..config import Config, bcrypt
import hmac, hashlib, base64
from flask import request, jsonify
from sqlalchemy import func, desc, text
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



"""
+------------------------------------ ADMIN FUNCTIONS ------------------------------------+
"""
def get_token_admin(request, msg):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"msg": "No Token Received"}), 401

        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            mail_admin = payload.get("email")
        except jwt.DecodeError:
            return jsonify({"msg": "Invalid token"}), 401

        if not mail_admin:
            return jsonify({"msg": "Cannot obtain email from token"}), 401
        
        admin = Admin.query.filter_by(mail=mail_admin).first()

        if not admin:
            return jsonify({"msg": msg}), 404

        return admin


def most_rated_movies_query():
    query = (
        db.session.query(
            Pelicula,
            func.avg(UsuarioVioPeli.rating).label("promedio_rating"),
            func.count(UsuarioVioPeli.rating).label("cantidad_ratings")
        )
        .join(UsuarioVioPeli)
        .filter(UsuarioVioPeli.rating.isnot(None))
        .group_by(Pelicula.id_pelicula)
        .order_by(desc("cantidad_ratings"), desc("promedio_rating"))
    )
    return query


def get_paginated_rm(page=1, per_page=10):
    query = most_rated_movies_query()
    offset = (page - 1) * per_page
    res = query.limit(per_page).offset(offset).all()
    return res



def users_most_favourite_movies_query():  
    query = (
        db.session.query(
            Pelicula,
            func.count(pelis_favoritas.c.mail_usuario).label("cantidad_favoritos")
        )
        .join(pelis_favoritas, Pelicula.id_pelicula == pelis_favoritas.c.id_pelicula)
        .group_by(Pelicula.id_pelicula)
        .order_by(desc("cantidad_favoritos"))
    )
    return query


def get_paginated_fm(page=1, per_page=10):
    query = users_most_favourite_movies_query()
    offset_value = (page - 1) * per_page
    res = query.limit(per_page).offset(offset_value).all()
    return res

"""
+------------------------------------ ADMIN FUNCTIONS ------------------------------------+
"""

def calc_vector_usuario(mail, genres):
    sql = text("SELECT calcular_vector_usuario(:m, :g)")
    db.session.execute(sql, {
        "m": mail,
        "g": genres 
    })
    db.session.commit()



def recomendar_grupo(mails, platforms=None, countries=None, genres=None, limit_count=10):
    sql = text("""
        SELECT * FROM recomendar_peliculas(
            :mails,
            :platforms,
            :countries,
            :genres,
            :limit_count
        );
    """)
    result = db.session.execute(sql, {
        "mails": mails,
        "platforms": platforms,
        "countries": countries,
        "genres": genres,
        "limit_count": limit_count
    })
    return result.fetchall()

