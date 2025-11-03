from flask import Blueprint, request
from ..controllers.session_controller import *
from ..controllers.user_actions_controller import *
from ..controllers.movie_controller import *
from ..controllers.group_controller import *
from ..controllers.user_config_controller import *
from ..controllers.match_session_controller import *


"""
+------------------------------------ SESSION ------------------------------------+
Blueprints: Registro y Login de usuarios
"""

register_bp = Blueprint("register", __name__)

@register_bp.route("/register", methods=["POST"])
def register():
    return handle_register()


login_bp = Blueprint("login", __name__)

@login_bp.route("/login", methods=["POST"])
def login():
    return handle_login()




"""
+------------------------------------ FORMS --------------------------------------+
Blueprints: Manejo de formularios de usuario
"""

forms_bp = Blueprint("forms", __name__)

@forms_bp.route("/saveUserForm", methods=["POST"])
def save_user_form_route():
    return save_user_form()

@forms_bp.route("/showUserForm", methods=["GET"])
def show_user_form_route():
    return show_form()




"""
+----------------------------- SEARCH / INFO MOVIES ------------------------------+
Blueprints: Búsqueda e información de películas
"""

movie_info_bp = Blueprint("movie_info", __name__)

@movie_info_bp.route("/movies", methods=["GET"])
def request_movie_info_route():
    return request_movie_info()

@movie_info_bp.route("/movies/detailsScreen", methods=["GET"])
def movie_details_screen_info_route():
    return movie_details_screen_info()




"""
+----------------------------- SEEN / RATED MOVIES -------------------------------+
Blueprints: Películas vistas y calificadas
"""

seen_movies_bp = Blueprint("seen_movies", __name__)

@seen_movies_bp.route("/seen_movies/rate_movie", methods=["POST"])
def rate_movie_route():
    return rate_movie()

@seen_movies_bp.route("/seen_movies/get_seen_movies", methods=["GET"])
def get_seen_movies_route():
    return get_seen_movies()

@seen_movies_bp.route("/seen_movies/get_user_rating", methods=["GET"])
def get_user_rating_route():
    return get_user_rating()




"""
+------------------------------------ GROUPS -------------------------------------+
Blueprints: Gestión de grupos y usuarios dentro de ellos
"""

grupo_bp = Blueprint("grupos", __name__)

@grupo_bp.route("/groups", methods=["POST", "GET"])
def groups_route():
    if request.method == "POST":
        return create_group()
    if request.method == "GET":
        return get_user_groups()

@grupo_bp.route("/groups/join", methods=["POST"])
def join_group_route():
    return add_user_to_group()

@grupo_bp.route("/groups/users", methods=["GET"])
def group_users_route():
    return get_group_users()




"""
+------------------------------------- HOME --------------------------------------+
Blueprints: Pantalla principal y películas recomendadas
"""

pantalla_principal_bp = Blueprint("home", __name__)

@pantalla_principal_bp.route("/home", methods=["POST", "GET"])
def pantalla_principal():
    return "Pantalla Principal"

@pantalla_principal_bp.route("/home/movies", methods=["GET"])
def recomended_movies_route():
    return show_home_movies()




"""
+------------------------------------- USER --------------------------------------+
Blueprints: Información y acciones del usuario
"""

usuario_bp = Blueprint("usuario", __name__)

@usuario_bp.route("/user", methods=["GET"])
def show_user_info_route():
    return show_user_info()

@usuario_bp.route("/user/update", methods=["POST"])
def update_user_info_route():
    return update_user_info()

@usuario_bp.route("/user/favorites", methods=["GET"])
def show_favorites_route():
    return show_favorites()

@usuario_bp.route("/user/to_favorite", methods=["POST"])
def add_favourite_route():
    return add_remove_favorite_movie()


"""
+--------------------------------- MATCHING SESSIONS ---------------------------------+
Blueprints: Gestionar match 
"""

match_bp = Blueprint("match", __name__)

@match_bp.route("/match/create_session", methods=["POST"])
def create_session_route():
    return create_session()

@match_bp.route("/match/join_session", methods=["POST"])
def join_session_route():
    return join_session()

@match_bp.route("/match/start_matching", methods=["POST"])
def start_matching_route():
    return start_matching()

@match_bp.route("/match/submit_votes", methods=["POST"])
def submit_votes_route():
    return submit_votes()

@match_bp.route("/match/end_session", methods=["POST"])
def end_session_route():
    return end_session()

@match_bp.route("/match/session_status/<session_id>", methods=["GET"])
def get_session_status_route(session_id):
    return get_session_status()

@match_bp.route("/match/group_session/<group_id>", methods=["GET"])
def get_group_session_route(group_id):
    return get_group_session()
