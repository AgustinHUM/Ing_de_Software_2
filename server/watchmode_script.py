

import datetime
from app import create_app
from app.db import db
from app.models.models import Cuenta, Genero, Grupo, Pais, Pelicula, Plataforma, PeliculaPlataformaPais
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
        "Acorn TV",
        "AppleTV+",
        "BBC iPlayer",
        "Beamafilm",
        "Britbox",
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
        "Globoplay",
        "Hallmark Movies Now",
        "Max",               
        "HiDive",
        "Hollywood Suite",
        "Hoopla",
        "Hulu",
        "JioHotstar",
        "Kanopy",
        "MGM+",
        "Movistar+",
        "MUBI",
        "Netflix",
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
        "YouTube Premium",
        "Zee5"
    ]

    platform_name_mapping = {
        "Amazon": "Prime Video",
        "AppleTV": "AppleTV+",
        "HBO Max": "Max",
        "HBO": "Max",
        "YouTube": "YouTube Premium",
        "Disney": "Disney+",
        "Disney Plus": "Disney+",
        "Hulu Plus": "Hulu",
        "Showtime": "Paramount+"
    }

    """
    # Plataformas
    platforms_response = requests.get(f'{base_url}sources/?apiKey={api_key}')
    platforms_data = platforms_response.json()
    for platform in platforms_data:
        api_platform_name = platform.get('name')
        platform_name = platform_name_mapping.get(api_platform_name, api_platform_name)
        
        if platform_name in plataformas_limpiadas and not Plataforma.query.filter_by(nombre_plataforma=platform_name).first():
            new_platform = Plataforma(
                id_plataforma=platform.get('id'),
                nombre_plataforma=platform_name,
                url_logo=platform.get('logo_100px')
            )
            session.add(new_platform)
    
    session.commit()
    print("Successfully added platforms from cleaned list")
    
    platform_details_response = requests.get(f'{base_url}sources/?apiKey={api_key}')
    platform_details_data = platform_details_response.json() if platform_details_response.status_code == 200 else []
    """
    

    # Peliculas
    params = {
        'apiKey': api_key,
        'types': 'movie',
        'page': 1,
        'limit': 180,  # Get more to skip first 30
        'sort_by': 'popularity_desc'
    }
    print("Fetching 180 popular movies (skipping first 30)...")
    print(params)
    response = requests.get('https://api.watchmode.com/v1/list-titles/', params=params)
    print(response)
    
    all_movies = []
    if response.status_code == 200:
        all_movies = response.json().get('titles', [])[30:]  # Skip first 30 results
    else:
        print(f"Failed to fetch movies: {response.status_code}")
        return

    title_ids = [movie['id'] for movie in all_movies] 
    for title_id in title_ids:
        existing_movie = Pelicula.query.get(title_id)
        if existing_movie:
            print(f"Movie with ID {title_id} already exists. Updating...")
        else:
            print(f"Creating new movie with ID {title_id}")

        details_url = f'{base_url}title/{title_id}/details/?apiKey={api_key}'
        details_response = requests.get(details_url)
        if details_response.status_code != 200:
            print(f"Failed to fetch details for title {title_id}")
            continue
        details = details_response.json()

        if not details.get('us_rating'):
            print(f"Skipping movie {details.get('title', 'Unknown')} - no US rating available")
            continue

        sources_url = f'{base_url}title/{title_id}/sources/?apiKey={api_key}'
        sources_response = requests.get(sources_url)
        sources = sources_response.json() if sources_response.status_code == 200 else []

        cast_crew_url = f'{base_url}title/{title_id}/cast-crew/?apiKey={api_key}'
        cast_crew_response = requests.get(cast_crew_url)
        directors = []
        if cast_crew_response.status_code == 200:
            cast_crew_data = cast_crew_response.json()
            for person in cast_crew_data:
                    job = person.get('job', '') or person.get('role', '')
                    roles = [role.strip() for role in job.split(',')]
                    if 'Director' in roles:
                        directors.append(person.get('name', person.get('full_name', '')))
        
        directors_str = ', '.join(directors) if directors else 'Unknown'

        critic_score = details.get('critic_score')
        critic_score_converted = critic_score / 10.0 if critic_score is not None else None

        if existing_movie:
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
        
        for genre_id in details.get('genres', []):
            genero = Genero.query.get(genre_id)
            if genero and genero not in current_movie.generos:
                current_movie.generos.append(genero)
            
        if not existing_movie: 
            session.add(current_movie)
        try:
            session.commit()
            print(f"Successfully saved movie {current_movie.titulo}")
        except Exception as e:
            print(f"Error saving movie {current_movie.titulo}: {e}")
            session.rollback()
            continue


        existing_relationships = PeliculaPlataformaPais.query.filter_by(id_pelicula=current_movie.id_pelicula).all()
        if existing_relationships:
            print(f"Removing {len(existing_relationships)} existing relationships for {current_movie.titulo}")
            for rel in existing_relationships:
                session.delete(rel)

        new_relationships_count = 0
        processed_combinations = set()  
        
        for src in sources:
            plataforma = Plataforma.query.filter_by(id_plataforma=src['source_id']).first()
            
            if not plataforma:
                api_platform_name = src.get('name', '')
                mapped_platform_name = platform_name_mapping.get(api_platform_name, api_platform_name)
                plataforma = Plataforma.query.filter_by(nombre_plataforma=mapped_platform_name).first()
                
            if plataforma:
                region_code = src.get('region')
                if region_code:
                    pais = Pais.query.filter_by(codigo_pais=region_code).first()
                    if pais:
                        combination_key = (plataforma.id_plataforma, pais.id_pais)
                        
                        if combination_key not in processed_combinations:
                            nueva_relacion = PeliculaPlataformaPais(
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

        try:
            session.commit()
            print(f"Successfully added relationships for movie {current_movie.titulo}")
        except Exception as e:
            print(f"Error adding relationships for movie {current_movie.titulo}: {e}")
            session.rollback()
        

    session.close()

if __name__ == "__main__":
    seed_watchmode()