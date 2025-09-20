import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Alert, Platform, InteractionManager } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SearchBar from '../components/Searchbar';
import SearchEmptyState from '../components/SearchEmptyState';
import SearchNoResults from '../components/SearchNoResults';
import LoadingOverlay from '../components/LoadingOverlay';
import { Divider, useTheme } from 'react-native-paper';
import GradientButton from '../components/GradientButton';
import { getMovies } from '../src/services/api';
import FilmDisplay from '../components/FilmDisplay';

export default function Search() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const routeQuery = route.params?.query ?? '';
  const [query, setQuery] = useState(routeQuery);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const scrollRef = useRef(null);

  useEffect(() => {
    setQuery(routeQuery);
    if (routeQuery && routeQuery.trim() !== '') {
      setPage(0);
      fetchMovies(routeQuery, 0);
    } else {
      setMovies([]);
    }
  }, [routeQuery]);

  const fetchMovies = async (q, p) => {
    const trimmed = (q ?? '').trim();
    if (!trimmed) {
      setMovies([]);
      return;
    }

    setLoading(true);
    try {
      const resp = await getMovies(trimmed, p);
      console.log(resp);
      setMovies(Array.isArray(resp) ? resp : []);

      requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo?.({ y: 0, animated: true });
      });
    });
    } catch (err) {
      console.warn('Error fetching movies:', err);
      Alert.alert('Error', 'Ocurrió un error al buscar películas.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (q) => {
    const trimmed = (q ?? '').trim();
    setQuery(trimmed);
    setPage(0);
    fetchMovies(trimmed, 0);
  };

  const handlePrevPage = () => {
    if (page <= 0) return;
    const newPage = page - 1;
    setPage(newPage);
    fetchMovies(query, newPage);
  };

  const handleNextPage = () => {
    const newPage = page + 1;
    setPage(newPage);
    fetchMovies(query, newPage);
  };

  const renderContent = () => {
    if (loading && movies.length === 0) {
      return <SearchEmptyState />;
    }

    if (!query) {
      return <SearchEmptyState />;
    }

    if (movies.length === 0) {
      return <SearchNoResults query={query} />;
    }

    return (
      <ScrollView
        ref={scrollRef} 
        style={{ paddingTop: '5%', flex: 0.75, padding: '3%', backgroundColor: 'transparent' }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 64}}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'column' }}>
          {movies.map((m) => (
            <View
              key={m.movie_id?.toString() || Math.random().toString()}
              style={{ marginBottom: 30 }}
            >
              <FilmDisplay
                height={200}
                onlyPoster={false}
                movie={{ ...m, poster: { uri: m.poster } }}
                onPress={(selected) =>
                  navigation.navigate('FilmDetails', { movie: { ...m, poster: { uri: m.poster } } })
                }
              />
            </View>
          ))}
        </View>
        {!(movies.length < PAGE_SIZE & page==0) ? (<View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 16,
          }}
        >
          <GradientButton
            mode="text"
            onPress={handlePrevPage}
            disabled={page <= 0}
            style={{ minWidth: 110 }}
          >
            Prev page
          </GradientButton>

          <Text style={{ fontSize: 16, color: theme.colors.text }}>Page {page + 1}</Text>

          <GradientButton
            mode="text"
            onPress={handleNextPage}
            disabled={movies.length < PAGE_SIZE}
            style={{ minWidth: 110 }}
          >
            Next page
          </GradientButton>
        </View>) : null}
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: Platform.OS === 'ios' ? 80 : 45 }}>
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.colors.text }}>
          Search movies
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <SearchBar initialQuery={query} onSubmit={handleSearchSubmit} />
      </View>

      <View style={{ flex: 0.9, paddingHorizontal: 16 }}>
        <Divider
          style={{
            backgroundColor: theme.colors.primary,
            width: "100%",
            height: 5,
            borderRadius: 5,
            marginTop: 16,
          }}
        />
        {renderContent()}
      </View>

      <LoadingOverlay visible={loading} />
    </View>
  );
}
