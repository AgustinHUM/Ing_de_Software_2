from flask import Blueprint, request
from ..controllers.user_controller import get_seen_movies, get_user_rating, rate_movie

    
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