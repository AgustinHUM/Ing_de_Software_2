from flask import Blueprint, request
from ..controllers.register_controller import handle_register

register_bp = Blueprint('register', __name__)

@register_bp.route('/register', methods=['POST'])
def register():
    return handle_register()