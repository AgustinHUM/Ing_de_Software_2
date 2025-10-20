# necesario para que Python trate a 'routes' como paquete
from .routes import *

def register_routes(app):
    app.register_blueprint(login_bp)
    app.register_blueprint(register_bp)
    app.register_blueprint(pantalla_principal_bp)
    app.register_blueprint(movie_info_bp)
    app.register_blueprint(grupo_bp)
    app.register_blueprint(forms_bp)
    app.register_blueprint(usuario_bp)
    app.register_blueprint(seen_movies_bp)
