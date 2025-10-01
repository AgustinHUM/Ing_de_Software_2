

import datetime
from app import create_app
from app.db import db
from app.models.models import Cuenta, Genero, Grupo, Pais, Pelicula, Plataforma, PeliculaPaisPlataforma
import requests 

def seed_watchmode():
    app = create_app()  
    app.app_context().push()
    session = db.session

    api_key = 'El1TkZY9xIPEWC9qgpDhI6i8DBfWwEz0YtMbWE8n'
    base_url = 'https://api.watchmode.com/v1/'

    """
    # Generos
    print("script started")
    genres_response = requests.get(f'{base_url}genres/?apiKey={api_key}')
    genres_data = genres_response.json()
    for genre in genres_data:
        if not Genero.query.filter_by(id_genero=genre.get('id')).first():
            new_genre = Genero(
                id_genero=genre.get('id'),
                nombre_genero=genre.get('name'),
            )
            session.add(new_genre)
    
    session.commit()
    print("Successfully added genres")

    # Paises
    countries_response = requests.get(f'{base_url}regions/?apiKey={api_key}')
    countries_data = countries_response.json()
    i = 0
    for country in countries_data:
        i += 1
        if not Pais.query.filter_by(codigo_pais=country.get('country')).first():
            new_country = Pais(
                id_pais= i,
                nombre_pais=country.get('name'),
                codigo_pais=country.get('country'),
                url_bandera=country.get('flag')
            )
            session.add(new_country)
    
    session.commit()
    print("Successfully added genres and countries")
"""
    # Plataformas

    plataformas_limpiadas = [
        "AMC+",
        "Acorn TV",
        "Adult Swim",
        "AppleTV+",
        "BBC iPlayer",
        "BET+",
        "BFI Player",
        "BINGE",
        "Beamafilm",
        "Britbox",
        "CBC Gem",
        "Clarovideo",         
        "Crave",
        "Criterion Channel",
        "Crunchyroll",
        "Curiosity Stream",
        "Curzon Home Cinema",
        "Disney+",
        "Discovery+",
        "FILMIN",
        "Fandor",
        "Fetch TV",
        "FuboTV",
        "Foxtel Now",
        "Globoplay",
        "Hallmark Movies Now",
        "Hayu",
        "Max",               
        "HiDive",
        "Hollywood Suite",
        "Hoopla",
        "Hulu",
        "ITVX",
        "JioHotstar",
        "Kanopy",
        "MGM+",
        "Movistar+",
        "MUBI",
        "Netflix",
        "Now TV",
        "Paramount+",
        "Peacock",
        "Plex",
        "Prime Video",
        "Rakuten TV",
        "Shudder",
        "SkyShowtime",
        "Sony LIV",
        "Stan",
        "STARZ",
        "Sun Nxt",
        "Sundance",
        "Topic",
        "WWE Network",
        "YouTube Premium",
        "Zee5"
    ]

    # Platform name mapping to handle API inconsistencies
    platform_name_mapping = {
        "Amazon": "Prime Video",
        "AppleTV": "AppleTV+",
        "HBO Max": "Max",
        "HBO": "Max",
        # Add more mappings as needed
    }

    # Plataformas
    platforms_response = requests.get(f'{base_url}sources/?apiKey={api_key}')
    platforms_data = platforms_response.json()
    for platform in platforms_data:
        api_platform_name = platform.get('name')
        # Map API name to our standardized name
        platform_name = platform_name_mapping.get(api_platform_name, api_platform_name)
        
        # Only add platforms that are in our cleaned platforms list
        if platform_name in plataformas_limpiadas and not Plataforma.query.filter_by(nombre_plataforma=platform_name).first():
            new_platform = Plataforma(
                id_plataforma=platform.get('id'),
                nombre_plataforma=platform_name,
                url_logo=platform.get('logo_100px')
            )
            session.add(new_platform)
    
    session.commit()
    print("Successfully added platforms from cleaned list")
    
    # Get platform details once for efficiency
    platform_details_response = requests.get(f'{base_url}sources/?apiKey={api_key}')
    platform_details_data = platform_details_response.json() if platform_details_response.status_code == 200 else []
    
    

    # Peliculas
    # Fetch 10 movies in a single call
    params = {
        'apiKey': api_key,
        'types': 'movie',
        'limit': 15,
        'sort_by': 'popularity_desc'
    }
    print("Fetching 10 popular movies...")
    print(params)
    response = requests.get('https://api.watchmode.com/v1/list-titles/', params=params)
    print(response)
    
    all_movies = []
    if response.status_code == 200:
        all_movies = response.json().get('titles', [])
    else:
        print(f"Failed to fetch movies: {response.status_code}")
        return

    title_ids = [movie['id'] for movie in all_movies] 
    for title_id in title_ids:
        # Check if movie already exists
        existing_movie = Pelicula.query.get(title_id)
        if existing_movie:
            print(f"Movie with ID {title_id} already exists. Updating...")
        else:
            print(f"Creating new movie with ID {title_id}")

        # buscar detalles de la pelicula
        details_url = f'{base_url}title/{title_id}/details/?apiKey={api_key}'
        details_response = requests.get(details_url)
        if details_response.status_code != 200:
            print(f"Failed to fetch details for title {title_id}")
            continue
        details = details_response.json()

        # Skip movies without US rating
        if not details.get('us_rating'):
            print(f"Skipping movie {details.get('title', 'Unknown')} - no US rating available")
            continue

        # Buscar data de streaming
        sources_url = f'{base_url}title/{title_id}/sources/?apiKey={api_key}'
        sources_response = requests.get(sources_url)
        sources = sources_response.json() if sources_response.status_code == 200 else []

        # Get cast and crew to extract directors
        cast_crew_url = f'{base_url}title/{title_id}/cast-crew/?apiKey={api_key}'
        cast_crew_response = requests.get(cast_crew_url)
        directors = []
        if cast_crew_response.status_code == 200:
            cast_crew_data = cast_crew_response.json()
            # Handle both list and dict responses
            if isinstance(cast_crew_data, list):
                # If it's a list, filter for directors directly
                for person in cast_crew_data:
                    # Check both 'job' and 'role' fields as the API might use either
                    job = person.get('job', '') or person.get('role', '')
                    # Check if "Director" is one of the roles (handle comma-separated roles)
                    roles = [role.strip() for role in job.split(',')]
                    if 'Director' in roles:
                        directors.append(person.get('name', person.get('full_name', '')))
            elif isinstance(cast_crew_data, dict):
                # If it's a dict, look for crew key
                crew = cast_crew_data.get('crew', [])
                for person in crew:
                    # Check both 'job' and 'role' fields as the API might use either
                    job = person.get('job', '') or person.get('role', '')
                    # Check if "Director" is one of the roles (handle comma-separated roles)
                    roles = [role.strip() for role in job.split(',')]
                    if 'Director' in roles:
                        directors.append(person.get('name', person.get('full_name', '')))
        
        directors_str = ', '.join(directors) if directors else 'Unknown'

        # Convert critic score from 0-100 to 0-10 scale
        critic_score = details.get('critic_score')
        critic_score_converted = critic_score / 10.0 if critic_score is not None else None

        # Create or update movie in database
        if existing_movie:
            # Update existing movie
            existing_movie.trama = details.get('plot_overview', '')
            existing_movie.anio_lanzamiento = details.get('year')
            existing_movie.titulo = details.get('title')
            existing_movie.duracion = details.get('runtime_minutes')
            existing_movie.clasificacion_edad = details.get('us_rating')
            existing_movie.url_poster = details.get('poster', '')
            existing_movie.score_critica = critic_score_converted
            existing_movie.score_usuarios = details.get('user_rating', 0.0)
            existing_movie.popularidad_percentil = details.get('popularity_percentile', 0.0)
            existing_movie.directores = directors_str
            current_movie = existing_movie
            print(f"Updating existing movie: {current_movie.titulo}")
        else:
            # Create new movie
            current_movie = Pelicula(
                id_pelicula=details['id'],
                trama=details.get('plot_overview', ''),
                anio_lanzamiento=details.get('year'),
                titulo=details.get('title'),
                duracion=details.get('runtime_minutes'),
                clasificacion_edad=details.get('us_rating'),
                url_poster=details.get('poster', ''),
                score_critica=critic_score_converted,
                score_usuarios=details.get('user_rating', 0.0),
                popularidad_percentil=details.get('popularity_percentile', 0.0),
                directores=directors_str
            )
            session.add(current_movie)
            print(f"Creating new movie: {current_movie.titulo}")
        
        # agregar generos
        for genre_id in details.get('genres', []):
            genero = Genero.query.get(genre_id)
            if genero and genero not in current_movie.generos:
                current_movie.generos.append(genero)
            
        # First add and commit the movie to the database
        if not existing_movie:  # Only add to session if it's a new movie
            session.add(current_movie)
        try:
            session.commit()
            print(f"Successfully saved movie {current_movie.titulo}")
        except Exception as e:
            print(f"Error saving movie {current_movie.titulo}: {e}")
            session.rollback()
            continue

        # Update ternary relationships: movie-platform-country
        # First, delete existing relationships for this movie to ensure data is current
        existing_relationships = PeliculaPaisPlataforma.query.filter_by(id_pelicula=current_movie.id_pelicula).all()
        if existing_relationships:
            print(f"Removing {len(existing_relationships)} existing relationships for {current_movie.titulo}")
            for rel in existing_relationships:
                session.delete(rel)

        # Now create new relationships based on current streaming availability
        new_relationships_count = 0
        processed_combinations = set()  # Track platform-country combinations to avoid duplicates
        
        for src in sources:
            # First try to find by source_id
            plataforma = Plataforma.query.filter_by(id_plataforma=src['source_id']).first()
            
            # If not found by ID, try to find by mapped name
            if not plataforma:
                api_platform_name = src.get('name', '')
                mapped_platform_name = platform_name_mapping.get(api_platform_name, api_platform_name)
                plataforma = Plataforma.query.filter_by(nombre_plataforma=mapped_platform_name).first()
                
            if plataforma:
                # Get the specific region for this source
                region_code = src.get('region')
                if region_code:
                    pais = Pais.query.filter_by(codigo_pais=region_code).first()
                    if pais:
                        # Create unique combination key to prevent duplicates
                        combination_key = (plataforma.id_plataforma, pais.id_pais)
                        
                        if combination_key not in processed_combinations:
                            # Create the ternary relationship
                            nueva_relacion = PeliculaPaisPlataforma(
                                id_pelicula=current_movie.id_pelicula,
                                id_plataforma=plataforma.id_plataforma,
                                id_pais=pais.id_pais
                            )
                            session.add(nueva_relacion)
                            processed_combinations.add(combination_key)
                            new_relationships_count += 1
                            print(f"Added relationship: {current_movie.titulo} -> {plataforma.nombre_plataforma} -> {pais.codigo_pais}")
                        else:
                            print(f"Skipping duplicate: {current_movie.titulo} -> {plataforma.nombre_plataforma} -> {pais.codigo_pais}")
                    else:
                        print(f"Country {region_code} not found in database for {plataforma.nombre_plataforma}")
                else:
                    print(f"No region specified for {plataforma.nombre_plataforma} source")
        
        print(f"Created {new_relationships_count} new relationships for {current_movie.titulo}")

        # Commit the relationships
        try:
            session.commit()
            print(f"Successfully added relationships for movie {current_movie.titulo}")
        except Exception as e:
            print(f"Error adding relationships for movie {current_movie.titulo}: {e}")
            session.rollback()
        

    session.close()

if __name__ == "__main__":
    seed_watchmode()