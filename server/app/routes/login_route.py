from flask import Blueprint, request
from ..controllers.login_controller import handle_login

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST', 'GET'])
def login():
    return handle_login(request)