from typing import Optional, List
from ..db import db
from ..models.models import User

<<<<<<< HEAD
=======
#esto vino con el modelo, no se si sirve
def create_user(email: str, name: str) -> User:
    u = User(email=email, name=name)
    db.session.add(u)
    db.session.commit()
    return u

def list_users() -> list[User]:
    return User.query.order_by(User.id.desc()).all()
>>>>>>> main
