from flask import Blueprint, request
from ..controllers.session_controller import *
from ..controllers.user_actions_controller import *
from ..controllers.movie_controller import *
from ..controllers.group_controller import *
from ..controllers.user_config_controller import *
from ..controllers.admin_controller import *


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
+------------------------------------- ADMIN --------------------------------------+
"""

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin/home", methods=["GET"])
def admin_home_route():
    return "Admin Home"

@admin_bp.route("/admin/login", methods=["GET"])
def admin_login_route():
    return handle_admin_login()

@admin_bp.route("/admin/create", methods=["POST"])
def admin_create_route():
    return admin_create()

@admin_bp.route("/admin/delete", methods=["DELETE"])
def admin_delete_route():
    return admin_delete()

@admin_bp.route("/admin/home/user_count", methods=["GET"])
def admin_user_count_route():
    return admin_user_count()

@admin_bp.route("/admin/home/most_rated_movies", methods=["GET"])
def admin_rated_movies_route():
    return get_most_rated_movies()
#Debería recibir algo como esto:
#GET /admin/home/most_rated_movies?page=2&per_page=10

@admin_bp.route("/admin/home/users_most_favourites", methods=["GET"])
def admin_users_most_fv():
    return get_users_most_favourite_movies()
#Debería recibir algo como esto:
#GET /admin/home/users_most_favourites?page=2&per_page=10


"""
+------------------------------------- RECOMMENDATIONS --------------------------------------+
"""
rec_bp = Blueprint("recommendations", __name__)

@rec_bp.route("/recommendations/movies", methods=["GET"])
def recommend_movies_route():
    return recommend_movies()
