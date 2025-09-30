from flask import Blueprint, request
from ..controllers.login_controller import handle_login
from ..controllers.info_controller import show_home_movies

pantalla_principal_bp = Blueprint('pantalla_principal', __name__)

@pantalla_principal_bp.route('/pantalla_principal', methods=['POST', 'GET'])
def pantalla_principal():
    return 'Pantalla Principal'

@pantalla_principal_bp.route("/pantalla_principal/movies", methods=["GET"])
def recomended_movies_route():
    return show_home_movies()