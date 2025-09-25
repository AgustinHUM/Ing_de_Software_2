# necesario para que Python trate a 'routes' como paquete
from .login_route import login_bp
from .register_route import register_bp
from .pantalla_principal_route import pantalla_principal_bp
from .general_info_route import movie_info_bp
<<<<<<< HEAD
from .group_routes import grupo_bp
=======
from .form_routes import forms_bp
>>>>>>> 76a6c6daf527697d0b4515663a71bcb0fd800914

def register_routes(app):
    app.register_blueprint(login_bp)
    app.register_blueprint(register_bp)
    app.register_blueprint(pantalla_principal_bp)
    app.register_blueprint(movie_info_bp)
<<<<<<< HEAD
    app.register_blueprint(grupo_bp)
=======
    app.register_blueprint(forms_bp)
>>>>>>> 76a6c6daf527697d0b4515663a71bcb0fd800914
