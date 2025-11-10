from flask import request, jsonify
from datetime import datetime
from sqlalchemy import desc
from ..models.models import *
from ..db import db
from ..functions.aux_functions import *
from ..functions.pusher_client import pusher_client
import jwt
import uuid
from ..controllers.user_actions_controller import recommend_movies

class MatchingSession:
    def __init__(self, session_id, group_id, creator_email):
        self.session_id = session_id
        self.group_id = group_id
        self.creator_email = creator_email
        self.participants = {}  # {email: {username, genres, status, joined_at}}
        self.status = "waiting_for_participants"  # waiting_for_participants, matching, completed
        self.movies = []  # List of 10 movies for voting
        self.votes = {}  # {email: {movie_id: vote (True/False)}}
        self.results = None
        self.created_at = datetime.now()
        self.completed_at = None  # When the session was completed
    
    def add_participant(self, token):
        try:
            from types import SimpleNamespace
            
            mock_headers = SimpleNamespace()
            mock_headers.get = lambda key, default='': f'Bearer {token}' if key == 'Authorization' else default
            
            mock_request = SimpleNamespace()
            mock_request.headers = mock_headers
            
            user = get_token_user(mock_request, "Cannot find user for session")
            if isinstance(user, tuple):  # Error response
                return False, user
            
            email = user.mail
            self.participants[email] = {
                "username": user.nombre_cuenta,
                "genres": [],
                "status": "joined", 
                "joined_at": datetime.now()
            }
            
            pusher_client.trigger(
                f"matching-session-{self.session_id}",
                "participant-joined",
                {
                    "email": email,
                    "username": user.nombre_cuenta,
                    "participants_count": len(self.participants),
                    "message": "joined the session",
                    "action": "joined_session"
                }
            )
            
            pusher_client.trigger(
                f"group-{self.group_id}",
                "participant-joined",
                {
                    "email": email,
                    "username": user.nombre_cuenta,
                    "participants_count": len(self.participants),
                    "message": "joined the session",
                    "action": "joined_session"
                }
            )
            
            return True, email
        except Exception as e:
            print(f"Error adding participant: {e}")
            return False, str(e)
    
    def set_participant_genres(self, email, genres):
        if email in self.participants:
            self.participants[email]["genres"] = genres
            self.participants[email]["status"] = "ready"
            
            pusher_client.trigger(
                f"matching-session-{self.session_id}",
                "participant-ready",
                {
                    "email": email,
                    "username": self.participants[email]["username"],
                    "ready_count": self.get_ready_count(),
                    "message": "is ready to match",
                    "action": "ready_to_match"
                }
            )
            
            pusher_client.trigger(
                f"group-{self.group_id}",
                "participant-ready",
                {
                    "email": email,
                    "username": self.participants[email]["username"],
                    "ready_count": self.get_ready_count(),
                    "message": "is ready to match",
                    "action": "ready_to_match"
                }
            )
    
    def get_participants_with_status(self):
        participants_data = []
        for email, data in self.participants.items():
            user_votes = self.votes.get(email, {})
            participants_data.append({
                "email": email,
                "username": data["username"],
                "genres": data["genres"],
                "status": data["status"],
                "joined_at": data["joined_at"].isoformat() if isinstance(data["joined_at"], datetime) else data["joined_at"],
                "votes_completed": len(user_votes),
                "total_movies": len(self.movies),
                "voting_complete": len(user_votes) >= len(self.movies) if self.movies else False
            })
        return participants_data

    def get_ready_count(self):
        return len([p for p in self.participants.values() if p["status"] == "ready"])

    def can_start_matching(self):
        return self.get_ready_count() >= 1
    
    def submit_all_votes(self, email, movie_votes):
        if email not in self.participants:
            return False, "User not in session"
        
        if len(movie_votes) != len(self.movies):
            return False, f"Expected {len(self.movies)} votes, got {len(movie_votes)}"
        
        print(f"DEBUG: Submitting votes for {email}")
        print(f"DEBUG: Vote data: {movie_votes}")
        
        self.votes[email] = movie_votes
        
        pusher_client.trigger(
            f"matching-session-{self.session_id}",
            "votes-submitted",
            {
                "email": email,
                "completed_voters": len(self.votes),
                "total_ready": self.get_ready_count()
            }
        )
        
        print(f"DEBUG: Total votes in session: {len(self.votes)} out of {self.get_ready_count()} ready participants")
        
        if len(self.votes) >= self.get_ready_count():
            self.status = "completed"
            print(f"DEBUG: All participants voted, calculating results...")
            self.calculate_results()
            
            # Trigger WebSocket event for completion
            pusher_client.trigger(
                f"matching-session-{self.session_id}",
                "matching-complete",
                {
                    "results": self.results
                }
            )
            
            # Mark session for cleanup (will be removed by cleanup_expired_sessions)
            self.completed_at = datetime.now()
        
        return True, "Votes submitted successfully"
    
    def calculate_results(self):
        if not self.votes or not self.movies:
            return None
        
        print(f"DEBUG: Calculating results for session {self.session_id}")
        print(f"DEBUG: Total votes received: {len(self.votes)}")
        print(f"DEBUG: Total movies: {len(self.movies)}")
        print(f"DEBUG: Votes data: {self.votes}")
        
        movie_scores = {}
        for movie in self.movies:
            movie_id = movie['id']
            score = 0
            for user_email, user_votes in self.votes.items():
                key = str(movie_id)
                if key in user_votes:
                    vote = user_votes[key]
                    print(f"DEBUG: Vote for movie {movie_id} by {user_email}: value={vote} type={type(vote)}")
                    # Accept True, 'true', 1 as like
                    if vote is True or vote == 'true' or vote == 1:
                        score += 1
                        print(f"DEBUG: User {user_email} liked movie {movie_id} ({movie['title']})")
                else:
                    print(f"DEBUG: No vote for movie {movie_id} by {user_email}")
            movie_scores[movie_id] = score
            print(f"DEBUG: Movie {movie['title']} (ID: {movie_id}) got {score} votes")
        
        if not movie_scores:
            return None
        
        print(f"DEBUG: All movie scores: {movie_scores}")
        winning_movie_id = max(movie_scores.keys(), key=lambda x: movie_scores[x])
        winning_score = movie_scores[winning_movie_id]
        print(f"DEBUG: Winner ID: {winning_movie_id}, Score: {winning_score}")
        
        winning_movie = next((movie for movie in self.movies 
                            if movie.get('id') == winning_movie_id), None)
        
        print(f"DEBUG: Winning movie: {winning_movie['title'] if winning_movie else 'None'}")
        
        self.results = {
            "winning_movie": winning_movie,
            "score": winning_score,
            "total_participants": self.get_ready_count(),
            "all_scores": movie_scores
        }
        
        return self.results
    
    def to_dict(self):
               
        return {
            "session_id": self.session_id,
            "group_id": self.group_id,
            "creator_email": self.creator_email,
            "participants": self.get_participants_with_status(),
            "status": self.status,
            "movies": self.movies,
            "can_start": self.can_start_matching(),
            "results": self.results,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# Global in-memory storage for matching sessions
matching_sessions = {}  # {session_id: MatchingSession}


def cleanup_expired_sessions():
    current_time = datetime.now()
    sessions_to_remove = []
    
    for session_id, session in matching_sessions.items():
        # Remove sessions that are completed or older than 2 hours
        time_diff = current_time - session.created_at
        if session.status == "completed" or time_diff.total_seconds() > 7200:  # 2 hours
            sessions_to_remove.append(session_id)
            
            # Trigger final WebSocket cleanup event
            pusher_client.trigger(
                f"matching-session-{session_id}",
                "session-cleanup",
                {"reason": "expired" if time_diff.total_seconds() > 7200 else "completed"}
            )
    
    for session_id in sessions_to_remove:
        del matching_sessions[session_id]
        print(f"Cleaned up session {session_id}")
    return len(sessions_to_remove)


def end_session():
    try:
        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return jsonify({"msg": error_response.get("msg", "Token error")}), error_code

        data = request.get_json()
        session_id = data.get("session_id")
        if not session_id:
            return jsonify({"msg": "session_id is required"}), 400

        session = matching_sessions.get(session_id)
        if not session:
            return jsonify({"msg": "Session not found"}), 404

        if session.creator_email != user.mail:
            return jsonify({"msg": "Only session creator can end session"}), 403

        session.status = "completed"
        pusher_client.trigger(
            f"matching-session-{session_id}",
            "session-ended",
            {"ended_by": user.mail}
        )
        return jsonify({"msg": "Session ended successfully"}), 200
    except Exception as e:
        print(f"Error ending session: {e}")
        return jsonify({"msg": "Internal server error"}), 500


def get_movies_for_session(session, limit=10, genres=None):
    try:
        mails = [mail for mail in session.participants.keys()]
        movies = recommend_movies(mails)
        return movies
    except Exception as e:
        print(f"Error getting movies for session: {str(e)}")
        return {"msg": "Error getting movies for session"}


def validate_token_and_get_user():
    try:
        user = get_token_user_join(request)
        if isinstance(user, tuple):
            # Always return error in {'msg': ...} format
            return None, {"msg": user[0].get("msg", "Token validation error")}, user[1]
        return user, None, None
    except Exception as e:
        return None, {"msg": "Token validation error"}, 401


def create_session():
    """POST /match/create_session - Create new matching session"""
    try:
        # Clean up old sessions first
        cleanup_expired_sessions()
        
        if request.method != "POST":
            return jsonify({"msg": "Method not allowed"}), 405

        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return jsonify({"msg": error_response.get("msg", "Token error")}), error_code

        data = request.get_json()
        if not data:
            return jsonify({"msg": "No JSON data provided"}), 400

        group_id = data.get("group_id")
        if group_id is not None:
            grupo = Grupo.query.get(group_id)
            if not grupo:
                return jsonify({"msg": "Group not found"}), 404

            if user not in grupo.usuarios:
                return jsonify({"msg": "User is not a member of this group"}), 403

            for session in matching_sessions.values():
                if session.group_id == group_id and session.status in ["waiting_for_participants", "matching"]:
                    return jsonify({"msg": "Active session already exists for this group", "session_id": session.session_id}), 409

        session_id = str(uuid.uuid4())
        session = MatchingSession(session_id, group_id, user.mail)
        success, result = session.add_participant(request.headers.get("Authorization", "").replace("Bearer ", ""))
        if not success:
            return jsonify({"msg": "Failed to add creator to session"}), 500

        matching_sessions[session_id] = session
        
        if group_id is not None:
            pusher_client.trigger(
                f"group-{group_id}",
                "session-created",
                {
                    "session_id": session_id,
                    "creator_email": user.mail,
                    "creator_username": user.nombre_cuenta,
                    "message": "created a session",
                    "action": "created_session"
                }
            )
        return jsonify({
            "msg": "Session created successfully",
            "session_id": session_id,
            "session": session.to_dict()
        }), 201
    except Exception as e:
        print(f"Error creating session: {e}")
        return jsonify({"msg": "Internal server error"}), 500


def join_session():
    try:
        if request.method != "POST":
            return jsonify({"msg": "Method not allowed"}), 405

        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return jsonify({"msg": error_response.get("msg", "Token error")}), error_code

        data = request.get_json()
        if not data:
            return jsonify({"msg": "No JSON data provided"}), 400

        session_id = data.get("session_id")
        selected_genres = data.get("genres", [])
        if not session_id:
            return jsonify({"msg": "session_id is required"}), 400

        session = matching_sessions.get(session_id)
        if not session:
            return jsonify({"msg": "Session not found"}), 404

        if session.status not in ["waiting_for_participants"]:
            return jsonify({"msg": "Session is not accepting new participants"}), 400

        # Only validate group membership for non-solo sessions (positive group_id)
        if session.group_id is not None and session.group_id > 0:
            grupo = Grupo.query.get(session.group_id)
            if not grupo:
                return jsonify({"msg": "Group not found"}), 404
            if user not in grupo.usuarios:
                return jsonify({"msg": "User is not a member of this group"}), 403

        success, result = session.add_participant(request.headers.get("Authorization", "").replace("Bearer ", ""))
        if not success:
            return jsonify({"msg": f"Failed to join session: {result}"}), 400

        
        session.set_participant_genres(user.mail, selected_genres)
        return jsonify({
            "msg": "Successfully joined session",
            "session": session.to_dict()
        }), 200
    except Exception as e:
        print(f"Error joining session: {e}")
        return jsonify({"msg": "Internal server error"}), 500


def start_matching():
    try:
        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return jsonify({"msg": error_response.get("msg", "Token error")}), error_code

        data = request.get_json()
        session_id = data.get("session_id")
        session = matching_sessions.get(session_id)

        if not session:
            return jsonify({"msg": "Session not found"}), 404

        if session.creator_email != user.mail:
            return jsonify({"msg": "Only session creator can start matching"}), 403

        if not session.can_start_matching():
            return jsonify({"msg": "Not enough participants ready"}), 400

        all_genres = []
        for participant in session.participants.values():
            all_genres.extend(participant.get("genres", []))
        session.movies = get_movies_for_session(session, limit=10, genres=list(set(all_genres)))
        session.status = "matching"
        print(session.movies)
        event_data = {
            "movies": session.movies,
            "status": session.status,
            "message": f"{user.nombre_cuenta} started the matching",
            "action": "started_matching"
        }
        pusher_client.trigger(
            f"matching-session-{session_id}",
            "matching-started",
            event_data
        )
        pusher_client.trigger(
            f"group-{session.group_id}",
            "matching-started", 
            event_data
        )
        return jsonify({
            "msg": "Matching started",
            "session": session.to_dict()
        }), 200
    except Exception as e:
        print(f"Error starting matching: {e}")
        return jsonify({"msg": "Internal server error"}), 500


def submit_votes():
    try:
        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return jsonify({"msg": error_response.get("msg", "Token error")}), error_code

        data = request.get_json()
        session_id = data.get("session_id")
        votes = data.get("votes")  # {movie_id: True/False}
        if not session_id or votes is None:
            return jsonify({"msg": "session_id and votes are required"}), 400

        session = matching_sessions.get(session_id)
        if not session:
            return jsonify({"msg": "Session not found"}), 404

        if session.status != "matching":
            return jsonify({"msg": "Session is not in matching phase"}), 400

        success, message = session.submit_all_votes(user.mail, votes)
        if not success:
            return jsonify({"msg": message}), 400
        return jsonify({
            "msg": message,
            "session": session.to_dict()
        }), 200
    except Exception as e:
        print(f"Error submitting votes: {e}")
        return jsonify({"msg": "Internal server error"}), 500


def get_session_status():
    try:
        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return jsonify({"msg": error_response.get("msg", "Token error")}), error_code

        session_id = request.view_args.get("session_id")
        if not session_id:
            return jsonify({"msg": "session_id is required"}), 400

        session = matching_sessions.get(session_id)
        if not session:
            return jsonify({"msg": "Session not found"}), 404

        # Only validate group membership for non-solo sessions (positive group_id)
        if session.group_id is not None and session.group_id > 0:
            grupo = Grupo.query.get(session.group_id)
            if not grupo:
                return jsonify({"msg": "Group not found"}), 404
            if user not in grupo.usuarios:
                return jsonify({"msg": "User is not a member of this group"}), 403

        return jsonify(session.to_dict()), 200
    except Exception as e:
        print(f"Error getting session status: {e}")
        return jsonify({"msg": "Internal server error"}), 500


def get_group_session():
    try:
        user, error_response, error_code = validate_token_and_get_user()
        if error_response:
            return jsonify({"msg": error_response.get("msg", "Token error")}), error_code

        group_id = request.view_args.get("group_id")
        if not group_id:
            return jsonify({"msg": "group_id is required"}), 400

        grupo = Grupo.query.get(group_id)
        if not grupo:
            return jsonify({"msg": "Group not found"}), 404

        if user not in grupo.usuarios:
            return jsonify({"msg": "User is not a member of this group"}), 403

        for session in matching_sessions.values():
            if session.group_id == int(group_id) and session.status in ["waiting_for_participants", "matching"]:
                return jsonify(session.to_dict()), 200
        return jsonify({"msg": "No active session found for this group"}), 404
    except Exception as e:
        print(f"Error getting group session: {e}")
        return jsonify({"msg": "Internal server error"}), 500