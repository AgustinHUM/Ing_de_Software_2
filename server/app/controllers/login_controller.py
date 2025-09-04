from ..models.user import User
from ..db import db

def login_user(data):
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
