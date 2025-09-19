import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, StyleSheet, Text, FlatList, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import SearchBar from '../components/Searchbar';
import MovieSearchItem from '../components/MovieSearchItem';
import SearchEmptyState from '../components/SearchEmptyState';
import SearchNoResults from '../components/SearchNoResults';
import LoadingOverlay from '../components/LoadingOverlay';
import { useTheme } from 'react-native-paper';
import { getMovies } from '../src/services/api';

export default function Search() {
  const route = useRoute();
  const theme = useTheme();
  const routeQuery = route.params?.query ?? '';
  const [query, setQuery] = useState(routeQuery);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(routeQuery);
  }, [routeQuery]);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const moviesData = await getMovies();
      setMovies(moviesData);
    } catch (error) {
      console.error('Error loading movies:', error);
      Alert.alert('Error', 'No se pudieron cargar las películas');
    } finally {
      setLoading(false);
    }
  };

  const results = query
    ? movies.filter(movie => 
        movie.movie_name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleMoviePress = (movie) => {
    // Aquí irá la navegación a detalles cuando conectemos con el backend
  };

  const renderContent = () => {
    if (loading && movies.length === 0) {
      return <SearchEmptyState />;
    }

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
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.galleryContainer}
        columnWrapperStyle={styles.row}
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

      <LoadingOverlay visible={loading} />
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
  galleryContainer: {
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  row: {
    justifyContent: 'space-around',
  },
});
