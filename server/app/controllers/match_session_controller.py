from flask import request, jsonify
from datetime import datetime
from sqlalchemy import desc
from ..models.models import *
from ..db import db
from ..functions.aux_functions import *
import jwt
import uuid


class MatchingSession:
    def __init__(self, session_id, group_id, creator_email):
        self.session_id = session_id
        self.group_id = group_id
        self.creator_email = creator_email
        self.participants = {}  # {email: {name, genres, status, joined_at}}
        self.status = "waiting_for_participants"  # waiting_for_participants, genre_selection, matching, completed
        self.movies = []  # List of 10 movies for voting
        self.current_movie_index = 0
        self.votes = {}  # {movie_id: {email: vote (True/False)}}
        self.results = None
        self.created_at = datetime.now()
        self.movie_scores = {}  # {movie_id: total_likes}
        self.genres = []  # List of all genres from all participants (allows duplicates)
    
    def add_participant(self, email, name, genres=None):
        """Add a participant to the session"""
        self.participants[email] = {
            "name": name,
            "genres": genres or [],
            "status": "joined",
            "joined_at": datetime.now()
        }
    
    def set_participant_genres(self, email, genres):
        """Set genres for a participant"""
        if email in self.participants:
            self.participants[email]["genres"] = genres
            # Add all genres to the session genres list (allows duplicates)
            self.genres.extend(genres)
            self.participants[email]["status"] = "ready"
    
    def get_participant_count(self):
        """Get number of participants"""
        return len(self.participants)
    
    def get_ready_participants(self):
        """Get participants who have completed genre selection"""
        return [email for email, data in self.participants.items() 
                if data["status"] == "ready"]
    
    def can_start_matching(self):
        """Check if session can start matching"""
        return len(self.get_ready_participants()) > 0
    
    def vote_on_movie(self, email, movie_id, vote):
        """Record a vote for any movie (asynchronous voting)"""
        if movie_id not in self.votes:
            self.votes[movie_id] = {}
        self.votes[movie_id][email] = vote
        
        # Update movie scores
        if movie_id not in self.movie_scores:
            self.movie_scores[movie_id] = 0
        
        # Recalculate score for this movie
        self.movie_scores[movie_id] = sum(1 for vote_val in self.votes[movie_id].values() if vote_val)
    
    def get_user_votes(self, email):
        """Get all votes by a specific user"""
        user_votes = {}
        for movie_id, votes in self.votes.items():
            if email in votes:
                user_votes[movie_id] = votes[email]
        return user_votes
    
    def get_user_voting_progress(self, email):
        """Get user's voting progress (how many movies they've voted on)"""
        user_votes = self.get_user_votes(email)
        return {
            "voted_count": len(user_votes),
            "total_movies": len(self.movies),
            "completed": len(user_votes) >= len(self.movies),
            "voted_movie_ids": list(user_votes.keys())
        }
    
    def get_next_movie_for_user(self, email):
        """Get the next movie this user hasn't voted on yet"""
        user_votes = self.get_user_votes(email)
        for movie in self.movies:
            movie_id = movie.get('id')
            if movie_id not in user_votes:
                return movie
        return None  # User has voted on all movies
    
    def all_participants_completed_voting(self):
        """Check if ALL participants have voted on ALL movies"""
        ready_participants = self.get_ready_participants()
        for email in ready_participants:
            progress = self.get_user_voting_progress(email)
            if not progress["completed"]:
                return False
        return True
    
    def get_participants_voting_status(self):
        """Get voting status for all participants"""
        status = {}
        for email in self.get_ready_participants():
            progress = self.get_user_voting_progress(email)
            status[email] = {
                "name": self.participants[email]["name"],
                "voted_count": progress["voted_count"],
                "total_movies": progress["total_movies"],
                "completed": progress["completed"],
                "percentage": (progress["voted_count"] / progress["total_movies"]) * 100 if progress["total_movies"] > 0 else 0
            }
        return status
    
    def is_matching_complete(self):
        """Check if matching is complete (all participants voted on all movies)"""
        return self.all_participants_completed_voting()
    
    def calculate_results(self):
        """Calculate the winning movie"""
        if not self.movie_scores:
            return None
        
        # Find movie with highest score
        winning_movie_id = max(self.movie_scores.keys(), 
                             key=lambda x: self.movie_scores[x])
        winning_score = self.movie_scores[winning_movie_id]
        
        # Find the movie object
        winning_movie = next((movie for movie in self.movies 
                            if movie.get('id') == winning_movie_id), None)
        
        self.results = {
            "winning_movie": winning_movie,
            "score": winning_score,
            "total_participants": len(self.get_ready_participants()),
            "all_scores": self.movie_scores
        }
        
        return self.results
    
    def to_dict(self):
        """Convert session to dictionary for JSON response"""
        return {
            "session_id": self.session_id,
            "group_id": self.group_id,
            "creator_email": self.creator_email,
            "participants": self.participants,
            "status": self.status,
            "movies": self.movies,
            "voting_status": self.get_participants_voting_status(),
            "all_completed": self.all_participants_completed_voting(),
            "results": self.results,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# Global in-memory storage for matching sessions
matching_sessions = {}  # {session_id: MatchingSession}


def get_movies_for_session(limit=15,generos={}):
    """Get movies for matching session using the same format as request_movie_info"""
    try:
        # Use the same database query as request_movie_info but get top rated movies
        peliculas = (
            db.session.query(PeliculaCompleta)
            .order_by(desc(PeliculaCompleta.score_critica))
            .limit(limit)
            .all()
        )
        
        # Use the exact same formatting as request_movie_info
        movies = [ {"id": peli.id_pelicula,
                   "title": peli.titulo,
                   "poster": peli.url_poster,
                   "genres": peli.generos,
                   "platforms": peli.plataformas,
                   "year": peli.anio_lanzamiento,
                   "runtime":peli.duracion,
                   "director":peli.directores,
                   "rating":peli.score_critica,
                   "description":peli.trama,
                   "ageRating":peli.clasificacion_edad
                   } for peli in peliculas]
        print(movies)

        return movies
        
    except Exception as e:
        print(f"Error getting movies for session: {str(e)}")
        raise


# Standard token validation pattern
def validate_token_and_get_user():
    """Standard token validation following established patterns"""
    try:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return None, jsonify({"error": "Token no proporcionado"}), 401
        
        payload = jwt.decode(token, options={"verify_signature": False})
        email = payload.get("email")
        
        if not email:
            return None, jsonify({"error": "Token inválido"}), 401
        
        user = Usuario.query.filter_by(mail=email).first()
        if not user:
            return None, jsonify({"error": "Usuario no encontrado"}), 404
            
        return user, None, None
        
    except Exception as e:
        return None, jsonify({"error": "Token inválido", "detail": str(e)}), 401


def create_session():
    """POST /api/matching/create-session - Create new matching session"""
    try:
        if request.method != "POST":
            return jsonify({"error": "Método no permitido"}), 405
        
        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return error_response, error_code
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
            
        group_id = data.get("group_id")
        
        if not group_id:
            return jsonify({"error": "group_id es requerido"}), 400
        
        # Check if group exists and user is member
        grupo = Grupo.query.get(group_id)
        if not grupo:
            return jsonify({"error": "Grupo no encontrado"}), 404
        
        if user not in grupo.usuarios:
            return jsonify({"error": "Usuario no es miembro del grupo"}), 403
        
        # Check if there's already an active session for this group
        for session in matching_sessions.values():
            if session.group_id == group_id and session.status in ["waiting_for_participants", "matching"]:
                return jsonify({"error": "Ya existe una sesión activa para este grupo"}), 409
        
        # Create new session
        session_id = str(uuid.uuid4())
        session = MatchingSession(session_id, group_id, user.mail)
        matching_sessions[session_id] = session
        
        return jsonify({
            "session_id": session_id,
            "mensaje": "Sesión creada exitosamente"
        }), 201
        
    except Exception as e:
        return jsonify({"error": "Error inesperado", "detail": str(e)}), 500


def join_session():
    """POST /api/matching/join-session - Join existing session"""
    try:
        if request.method != "POST":
            return jsonify({"error": "Método no permitido"}), 405
        
        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return error_response, error_code
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
            
        session_id = data.get("session_id")
        selected_genres = data.get("genres", [])
        
        if not session_id:
            return jsonify({"error": "session_id es requerido"}), 400
        
        session = matching_sessions.get(session_id)
        if not session:
            return jsonify({"error": "Sesión no encontrada"}), 404
        
        if session.status not in ["waiting_for_participants"]:
            return jsonify({"error": "La sesión no acepta nuevos participantes"}), 409
        
        # Check if user is member of the group
        grupo = Grupo.query.get(session.group_id)
        if user not in grupo.usuarios:
            return jsonify({"error": "Usuario no es miembro del grupo"}), 403
        
        # Add participant to session
        session.add_participant(user.mail, user.nombre_cuenta, selected_genres)
        session.set_participant_genres(user.mail, selected_genres)
        
        return jsonify({
            "mensaje": "Se unió a la sesión exitosamente",
            "session": session.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Error inesperado", "detail": str(e)}), 500


def get_session_status():
    """GET /api/matching/session-status/<session_id> - Get session status"""
    try:
        if request.method != "GET":
            return jsonify({"error": "Método no permitido"}), 405
        
        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return error_response, error_code
        
        session_id = request.view_args.get("session_id")
        if not session_id:
            return jsonify({"error": "session_id es requerido"}), 400
        
        session = matching_sessions.get(session_id)
        if not session:
            return jsonify({"error": "Sesión no encontrada"}), 404
        
        # Check if user is member of the group
        grupo = Grupo.query.get(session.group_id)
        if user not in grupo.usuarios:
            return jsonify({"error": "Usuario no es miembro del grupo"}), 403
        
        return jsonify(session.to_dict()), 200
        
    except Exception as e:
        return jsonify({"error": "Error inesperado", "detail": str(e)}), 500


def get_group_session():
    """GET /api/matching/group-session/<group_id> - Get active session for group"""
    try:
        if request.method != "GET":
            return jsonify({"error": "Método no permitido"}), 405
        
        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return error_response, error_code
        
        group_id = request.view_args.get("group_id")
        if not group_id:
            return jsonify({"error": "group_id es requerido"}), 400
            
        try:
            group_id = int(group_id)
        except ValueError:
            return jsonify({"error": "group_id debe ser un número válido"}), 400
        
        # Check if user is member of the group
        grupo = Grupo.query.get(group_id)
        if not grupo or user not in grupo.usuarios:
            return jsonify({"error": "Grupo no encontrado o usuario no es miembro"}), 404
        
        # Find active session for this group
        for session in matching_sessions.values():
            if session.group_id == group_id and session.status in ["waiting_for_participants", "matching"]:
                return jsonify(session.to_dict()), 200
        
        return jsonify({"error": "No hay sesión activa"}), 404
        
    except Exception as e:
        return jsonify({"error": "Error inesperado", "detail": str(e)}), 500


def start_matching():
    """POST /api/matching/start-matching - Begin the matching process"""
    try:
        if request.method != "POST":
            return jsonify({"error": "Método no permitido"}), 405
        
        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return error_response, error_code
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
            
        session_id = data.get("session_id")
        if not session_id:
            return jsonify({"error": "session_id es requerido"}), 400
        
        session = matching_sessions.get(session_id)
        if not session:
            return jsonify({"error": "Sesión no encontrada"}), 404
        
        # Only creator can start matching
        if session.creator_email != user.mail:
            return jsonify({"error": "Solo el creador de la sesión puede iniciar el matching"}), 403
        
        if not session.can_start_matching():
            return jsonify({"error": "No hay participantes listos para matching"}), 409
        
        # Get movies using the separate function
        try:
            print(f"Getting movies for session {session_id}, participants: {list(session.participants.keys())}")

            movies = get_movies_for_session(limit=15, generos=session.genres)
            print(f"Got {len(movies)} movies with {len(session.genres)} total genres: {session.genres}")
            session.movies = movies[:10]  # Limit to 10 movies
            session.status = "matching"
            
            return jsonify({
                "mensaje": "Matching iniciado exitosamente",
                "session": session.to_dict()
            }), 200
            
        except Exception as movie_error:
            print(f"Error getting movies: {str(movie_error)}")
            import traceback
            print(traceback.format_exc())
            return jsonify({"error": f"Error obteniendo películas para matching: {str(movie_error)}"}), 500
            
    except Exception as e:
        print(f"Error in start_matching: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": "Error inesperado", "detail": str(e)}), 500


def vote_movie():
    """POST /api/matching/vote - Vote on a movie"""
    try:
        if request.method != "POST":
            return jsonify({"error": "Método no permitido"}), 405
        
        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return error_response, error_code
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
            
        session_id = data.get("session_id")
        movie_id = data.get("movie_id")
        vote = data.get("vote")  # True for like, False for pass
        
        if session_id is None or movie_id is None or vote is None:
            return jsonify({"error": "session_id, movie_id y vote son requeridos"}), 400
        
        session = matching_sessions.get(session_id)
        if not session:
            return jsonify({"error": "Sesión no encontrada"}), 404
        
        if session.status != "matching":
            return jsonify({"error": "La sesión no está en estado de matching"}), 409
        
        # Check if user is participant
        if user.mail not in session.participants:
            return jsonify({"error": "Usuario no es participante de la sesión"}), 403
        
        # Record vote
        session.vote_on_movie(user.mail, movie_id, vote)
        
        # Check if matching is complete
        if session.is_matching_complete():
            session.calculate_results()
            session.status = "completed"
        
        return jsonify({
            "mensaje": "Voto registrado exitosamente",
            "session": session.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Error inesperado", "detail": str(e)}), 500


def get_user_next_movie():
    """GET /api/matching/next-movie/<session_id> - Get next movie for user to vote on"""
    try:
        if request.method != "GET":
            return jsonify({"error": "Método no permitido"}), 405
        
        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return error_response, error_code
        
        session_id = request.view_args.get("session_id")
        if not session_id:
            return jsonify({"error": "session_id es requerido"}), 400
        
        session = matching_sessions.get(session_id)
        if not session:
            return jsonify({"error": "Sesión no encontrada"}), 404
        
        if user.mail not in session.participants:
            return jsonify({"error": "Usuario no es participante de la sesión"}), 403
        
        next_movie = session.get_next_movie_for_user(user.mail)
        progress = session.get_user_voting_progress(user.mail)
        
        return jsonify({
            "next_movie": next_movie,
            "progress": progress,
            "session_status": session.status
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Error inesperado", "detail": str(e)}), 500
