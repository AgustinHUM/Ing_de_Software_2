import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, StyleSheet, Text, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import SearchBar from '../components/Searchbar';
import MovieSearchItem from '../components/MovieSearchItem';
import SearchEmptyState from '../components/SearchEmptyState';
import SearchNoResults from '../components/SearchNoResults';
import { useTheme } from 'react-native-paper';

export default function Search() {
  const route = useRoute();
  const theme = useTheme();
  const routeQuery = route.params?.query ?? '';
  const [query, setQuery] = useState(routeQuery);

  useEffect(() => {
    setQuery(routeQuery);
  }, [routeQuery]);

  // Datos de prueba para la maquetación
  const sampleMovies = [
    {
      movie_id: 1,
      movie_name: 'Spiderman',
      movie_release: '2002',
      genre: 'Acción',
      movie_length: 139,
      streaming_service: 'Netflix',
      poster_url: 'https://via.placeholder.com/150x200/FF0000/FFFFFF?text=Spider-Man'
    },
    {
      movie_id: 2,
      movie_name: 'Spider-Man: No Way Home',
      movie_release: '2021',
      genre: 'Acción',
      movie_length: 139,
      streaming_service: 'Disney+',
      poster_url: 'https://via.placeholder.com/150x200/0000FF/FFFFFF?text=No+Way+Home'
    },
    {
      movie_id: 3,
      movie_name: 'Avengers: Endgame',
      movie_release: '2019',
      genre: 'Acción',
      movie_length: 181,
      streaming_service: 'Disney+',
      poster_url: 'https://via.placeholder.com/150x200/800080/FFFFFF?text=Endgame'
    }
  ];

  const results = query
    ? sampleMovies.filter(movie => 
        movie.movie_name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleMoviePress = (movie) => {
    console.log('Película seleccionada:', movie);
    // Aquí irá la navegación a detalles cuando conectemos con el backend
  };

  const renderContent = () => {
    if (!query) {
      return <SearchEmptyState />;
    }

    if (results.length === 0) {
      return <SearchNoResults query={query} />;
    }

    return (
      <FlatList
        data={results}
        keyExtractor={(item) => item.movie_id.toString()}
        renderItem={({ item }) => (
          <MovieSearchItem 
            movie={item} 
            onPress={handleMoviePress}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Buscar peliculas
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <SearchBar initialQuery={query} />
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
});
