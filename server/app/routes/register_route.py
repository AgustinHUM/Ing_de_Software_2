from flask import Blueprint, request, jsonify
from ..controllers.register_controller import register_user

register_bp = Blueprint('register', __name__)

@register_bp.route('/register', methods=['POST'])
def register():
