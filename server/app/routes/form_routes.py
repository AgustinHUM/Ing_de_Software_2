from flask import Blueprint, request
from ..controllers.user_controller import save_user_form

forms_bp = Blueprint("forms", __name__)

@forms_bp.route("/saveUserForm", methods=["POST"])
def save_user_form_route():
    return save_user_form()

