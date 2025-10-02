from flask import Blueprint, request
from ..controllers.user_controller import save_user_form
from ..controllers.info_controller import show_form

forms_bp = Blueprint("forms", __name__)

@forms_bp.route("/saveUserForm", methods=["POST"])
def save_user_form_route():
    return save_user_form()

@forms_bp.route("/showUserForm", methods=["GET"])
def show_user_form_route():
    return show_form()