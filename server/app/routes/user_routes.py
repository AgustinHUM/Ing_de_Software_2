from flask import Blueprint, request
from ..controllers.user_controller import show_user_info, update_user_info, add_remove_favorite_movie,show_favorites


usuario_bp = Blueprint("usuario", __name__)

@usuario_bp.route("/user", methods=["GET"])
def show_user_info_route():
    return show_user_info()

@usuario_bp.route("/user/update", methods=["POST"])
def update_user_info_route():
    return update_user_info()

@usuario_bp.route("/user/favorites", methods=["GET"])
def show_favorites_route():
    return show_favorites()

@usuario_bp.route("/user/to_favorite", methods=["POST"])
def add_favourite_route():
    return add_remove_favorite_movie()