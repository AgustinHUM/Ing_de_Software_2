from flask import Blueprint, request
from ..controllers.info_controller import request_movie_info, selected_movie_info, movie_details_screen_info

movie_info_bp = Blueprint('movie_info', __name__)

@movie_info_bp.route("/movies", methods=["GET"])
def request_movie_info_route():
    return request_movie_info()

@movie_info_bp.route("/movies/selected", methods=["POST"])
def selected_movie_info_route():
    return selected_movie_info()

@movie_info_bp.route("/movies/detailsScreen", methods=["GET"])
def movie_details_screen_info_route():
    return movie_details_screen_info()