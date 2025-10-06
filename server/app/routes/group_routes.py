from flask import Blueprint, request
from ..controllers.user_controller import create_group, add_user_to_group, get_user_groups, get_group_users

grupo_bp = Blueprint("grupos", __name__)

@grupo_bp.route("/groups", methods=["POST", "GET"])
def groups_route():
    if request.method == "POST":
        return create_group()
    if request.method == "GET":
        return get_user_groups()


@grupo_bp.route("/groups/join", methods=["POST"])
def join_group_route():
    return add_user_to_group()


@grupo_bp.route("/groups/users", methods=["GET"])
def group_users_route():
    return get_group_users()
