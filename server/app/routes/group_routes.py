from flask import Blueprint, request
from ..controllers.user_controller import create_group, add_user_to_group

grupo_bp = Blueprint("grupos", __name__)

@grupo_bp.route("/groups", methods=["POST"])
def create_group_route():
    return create_group()

@grupo_bp.route("/groups/join", methods=["POST"])
def join_group_route():
    return add_user_to_group()