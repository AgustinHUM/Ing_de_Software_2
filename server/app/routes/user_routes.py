from flask import Blueprint, request
from ..controllers.user_controller import show_user_info, update_user_info


usuario_bp = Blueprint("usuario", __name__)

@usuario_bp.route("/user", methods=["GET"])
def show_user_info_route():
    return show_user_info()

@usuario_bp.route("/user/update", methods=["POST"])
def update_user_info_route():
    return update_user_info()