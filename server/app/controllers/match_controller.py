import jwt
from app.models.models import *
from flask import request, jsonify
from app.controllers.user_config_controller import show_user_info


class MatchSession:
    def __init__(self, group_id, creator_email, genres={}, movies=[], participants=[], status="waiting for participant", matched_movie=None):
        self.group_id = group_id
        self.creator_email = creator_email
        self.genres = genres
        self.movies = movies
        self.participants = participants
        self.status = status
        self.matched_movie = matched_movie

def get_user_email_from_token(token):
    payload = jwt.decode(token, options={"verify_signature": False})
    mail_usuario = payload.get("email")

    if not mail_usuario:
        print("No email found in token")
        return None

    usuario = Usuario.query.filter_by(mail=mail_usuario).first()
    if not usuario:
        print(f"User with email \"{mail_usuario}\" not found")
        return None

    return mail_usuario

def create_session():
    if request.method == "POST":
        info = request.get_json()
        
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            print("No token received")
            return jsonify({"msg": "No token received"}), 401

        user_email = get_user_email_from_token(token)
        if not user_email:
            return jsonify({"msg": "Could not retrieve email from token"}), 401

        new_session = MatchSession(group_id=info.get("group_id"), creator_email=user_email)
        new_session.participants.append(user_email)
        print(f"Created new match session for group {info.get('group_id')} by user {user_email}")
        
        session_data = {
            "group_id": new_session.group_id,
            "creator_email": new_session.creator_email,
            "genres": new_session.genres,
            "movies": new_session.movies,
            "participants": new_session.participants,
            "status": new_session.status,
            "matched_movie": new_session.matched_movie,
        }
        return jsonify({"msg": "Session created successfully", "session": session_data}), 201

def join_session(session, user_token):
    user_email = show_user_info(user_token).get("email")
    if user_email and user_email not in session.participants:
        session.participants.append(user_email)
    return session



