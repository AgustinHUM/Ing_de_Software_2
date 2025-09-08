from flask import Blueprint, request
from ..controllers.login_controller import handle_login

pantalla_principal_bp = Blueprint('pantalla_principal', __name__)

@pantalla_principal_bp.route('/pantalla_principal', methods=['POST', 'GET'])
def pantalla_principal():
    return 'Pantalla Principal'