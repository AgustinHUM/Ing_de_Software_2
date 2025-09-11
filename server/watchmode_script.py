# server/scripts/seed_watchmode.py

import datetime
from app import create_app
from app.db import db
from app.models.models import Cuenta, Genero, Grupo, Pais, Pelicula, Plataforma
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
    

    # Paises
    countries_response = requests.get(f'{base_url}regions/?apiKey={api_key}')
    countries_data = countries_response.json()
    i = 0
    for country in countries_data:
        i += 1
        if not Pais.query.filter_by(nombre_pais=country.get('country')).first():
            new_country = Pais(
                id_pais= i,
                nombre_pais=country.get('name'),
            )
            session.add(new_country)

    # Plataformas
    platforms_response = requests.get(f'{base_url}sources/?apiKey={api_key}')
    platforms_data = platforms_response.json()
    for platform in platforms_data:
        if not Plataforma.query.filter_by(nombre_plataforma=platform.get('name')).first():
            new_platform = Plataforma(
                id_plataforma=platform.get('id'),
                nombre_plataforma=platform.get('name'),
            )
            for country in platform.get('regions', []):
                region = Pais.query.filter_by(nombre_pais=country).first()
                if region and region not in new_platform.paises:
                    new_platform.paises.append(region)
            session.add(new_platform)"""
    
    """#agreagar paises a plataformas ya existentes (falta agregar codigo de pais)
    print("Adding regions to existing platforms...")
    platforms_response = requests.get(f'{base_url}sources/?apiKey={api_key}')
    platforms_data = platforms_response.json()
    for platform in platforms_data:
        existing_platform = Plataforma.query.filter_by(nombre_plataforma=platform.get('name')).first()
        if existing_platform:
            print(platform.get('regions'))
            for country_code in platform.get('regions'):
                region = Pais.query.filter_by(codigo_pais=country_code).first()
                if region and region not in existing_platform.paises:
                    existing_platform.paises.append(region)
            session.add(existing_platform)
        try:
            session.commit()
            print(f"Successfully added regions {existing_platform.nombre_plataforma} {existing_platform.paises}")
        except Exception as e:
            print(f"Error adding regions to platform {existing_platform.nombre_plataforma}: {e}")
            session.rollback()
    """
    
    

    """# Peliculas
    all_movies = []
    genres_data = [{"id": 1, "name": "Action"}, {"id": 4, "name": "Comedy"}, {"id": 3, "name": "Animation"},{"id":33,"name":"Anime"}]
    for genre in genres_data:
        genre_id = genre['id']
        platforms_data = [{"id": 203, "name": "Netflix"}, {"id": 157, "name": "Hulu"}, {"id": 26, "name": "Prime Video"}]
        for platform in platforms_data:
            platform_id = platform['id']
            params = {
            'apiKey': api_key,
            'types': 'movie',
            'genres': genre_id,
            'limit': 5,
            'source_ids': platform_id,
            'sort_by': 'relevance_desc'
            }
            print(params)
            response = requests.get('https://api.watchmode.com/v1/list-titles/', params=params)
            print(response)
            all_movies.extend(response.json().get('titles', []))

    title_ids = list(set([movie['id'] for movie in all_movies])) 
    for title_id in title_ids:
        # Check if movie already exists
        if Pelicula.query.get(title_id):
            print(f"Movie with ID {title_id} already exists. Skipping.")
            continue

        # buscar detalles de la pelicula
        details_url = f'{base_url}title/{title_id}/details/?apiKey={api_key}'
        details_response = requests.get(details_url)
        if details_response.status_code != 200:
            print(f"Failed to fetch details for title {title_id}")
            continue
        details = details_response.json()

        # Buscar data de streaming
        sources_url = f'{base_url}title/{title_id}/sources/?apiKey={api_key}'
        sources_response = requests.get(sources_url)
        sources = sources_response.json() if sources_response.status_code == 200 else []

        # Agregar a base de datos
        new_pelicula = Pelicula(
            id_pelicula=details['id'],
            trama=details.get('plot_overview', ''),
            anio_lanzamiento=details.get('year'),
            titulo=details.get('title'),
            duracion=details.get('runtime_minutes'),
            clasificacion_edad=details.get('us_rating', ''),
            url_poster=details.get('poster', ''),
            score=details.get('critic_score', None)
        )
        print(new_pelicula)
        # agregar generos
        for genre_id in details.get('genres', []):
            genero = Genero.query.get(genre_id)
            if genero and genero not in new_pelicula.generos:
                new_pelicula.generos.append(genero)
            

        # agregar plataformas
        for src in sources:
            plataforma = Plataforma.query.filter_by(id_plataforma=src['source_id']).first()
            if plataforma and plataforma not in new_pelicula.plataformas:
                new_pelicula.plataformas.append(plataforma)

        session.add(new_pelicula)
        # Commit 1 a la veza para testear
        try:
            session.commit()
            print(f"Successfully added movie {new_pelicula.titulo}")
        except Exception as e:
            print(f"Error adding movie {new_pelicula.titulo}: {e}")
            session.rollback()
        """

    session.close()

if __name__ == "__main__":
    seed_watchmode()