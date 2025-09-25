from flask import Blueprint, request
<<<<<<< HEAD
from ..controllers.user_controller import create_group, add_user_to_group, get_user_groups
=======
from ..controllers.user_controller import create_group, add_user_to_group, bring_groups
>>>>>>> 76a6c6daf527697d0b4515663a71bcb0fd800914

grupo_bp = Blueprint("grupos", __name__)

@grupo_bp.route("/groups", methods=["POST", "GET"])
def groups_route():
    if request.method == "POST":
        return create_group()
    if request.method == "GET":
        return get_user_groups()


@grupo_bp.route("/groups/join", methods=["POST"])
def join_group_route():
<<<<<<< HEAD
    return add_user_to_group()
=======
    return add_user_to_group

@grupo_bp.route("/groups/user_groups", methods=["GET"])
def bring_groups_routes():
    return bring_groups
>>>>>>> 76a6c6daf527697d0b4515663a71bcb0fd800914
