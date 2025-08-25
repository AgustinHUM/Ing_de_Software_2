from typing import Optional, List
from ..db import db
from ..models.user import User

def create_user(email: str, name: str) -> User:
    u = User(email=email, name=name)
    db.session.add(u)
    db.session.commit()
    return u

def list_users() -> list[User]:
    return User.query.order_by(User.id.desc()).all()
