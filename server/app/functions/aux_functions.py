import random
from ..models.models import *
from ..config import Config, bcrypt
import hmac, hashlib, base64


def get_secret_hash(username, client_id, client_secret):
    msg = username + client_id
    dig = hmac.new(
        client_secret.encode('utf-8'),
        msg.encode('utf-8'),
        hashlib.sha256
    ).digest()
    return base64.b64encode(dig).decode()


def generate_id():
    while True:
        id_random = random.randint(10000, 99999)

        if not Grupo.query.get(id_random):
            return id_random
        
