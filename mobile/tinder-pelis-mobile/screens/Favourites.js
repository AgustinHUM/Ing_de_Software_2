// Favorites.js
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FilmDisplay from '../components/FilmDisplay';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getFavourites, getSeenMovies } from '../src/services/api';
import * as SecureStore from 'expo-secure-store';

// 🔹 Tus 6 películas hardcodeadas
const movies = [
  {
    id: 'm1',
    title: 'Interstellar',
    genres: ['Ciencia Ficción', 'Superhéroes'],
    poster: require('../assets/interstellar.jpg'),
    rating: 8.7,
    year: 2014,
    runtime: '169',
    director: 'Anthony Russo, Joe Russo',
    ageRating: 'PG-13',
    platforms: ['Disney+', 'Prime Video', 'aaaaaaaaaaa', 'bbbbbbbbbbbbbbbbbbb', 'cccccc', 'DirectTV', 'ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'],
    description:
      'After the devastating events of Avengers: Infinity War, the universe is in ruins. The Avengers assemble once more to undo Thanos’ actions and restore balance to the universe.',
  },
  {
    id: 'm2',
    title: 'Los tipos malos 2',
    genres: ['Acción', 'Animación', 'Crimen'],
    poster: require('../assets/the_bad_guys_2.jpg'),
    rating: 7.3,
    year: 2023,
    runtime: '100',
    director: 'Pierre Perifel',
    ageRating: 'PG',
    platforms: ['Netflix', 'Hulu'],
    description:
      'The Bad Guys return for another thrilling adventure as they navigate their way through a heist gone wrong, learning the value of teamwork and friendship.',
  },
  {
    id: 'm3',
    title: 'Jaws',
    genres: ['Terror', 'Thriller'],
    poster: require('../assets/jaws.jpg'),
    rating: 8.0,
    year: 1975,
    runtime: '124',
    director: 'Steven Spielberg',
    ageRating: 'PG',
    platforms: ['Prime Video', 'HBO Max'],
    description:
      'A giant great white shark terrorizes a small resort town, prompting the local sheriff, a marine biologist, and a grizzled fisherman to hunt it down.',
  },
  {
    id: 'm4',
    title: 'Mufasa',
    genres: ['Animación', 'Familia', 'Infantil'],
    poster: require('../assets/mufasa.jpg'),
    rating: 7.2,
    year: 2024,
    runtime: '90',
    director: 'Barry Jenkins',
    ageRating: 'G',
    platforms: ['Disney+'],
    description:
      'A prequel to The Lion King, exploring the rise of Mufasa and his journey to becoming the king of the Pride Lands.',
  },
  {
    id: 'm5',
    title: 'Scott Pilgrim vs. the World',
    genres: ['Ciencia ficción', 'Comedia', 'Drama'],
    poster: { uri: 'https://cdn.watchmode.com/posters/01336293_poster_w342.jpg' },
    rating: 10.0,
    year: 2010,
    runtime: '112',
    director: 'Edgar Wright',
    ageRating: 'PG-13',
    platforms: ['Netflix'],
    description:
      'Scott Pilgrim must defeat his new girlfriend’s seven evil exes in order to win her heart in this quirky and action-packed comedy.',
  },
  {
    id: 'm6',
    title: 'The Greatest Showman',
    genres: ['Musical', 'Familia', 'Drama', 'superheroes', 'comedia musical', 'las aventuras de hugh jackman'],
    poster: require('../assets/greatest_showman.jpg'),
    rating: 7.6,
    year: 2017,
    runtime: '105',
    director: 'Michael Gracey',
    ageRating: 'PG',
    platforms: ['Disney+', 'Hulu'],
    description:
      'Inspired by the story of P.T. Barnum, this musical celebrates the birth of show business and the visionary who rose from nothing to create a spectacle that became a worldwide sensation.',
  },
];

export default function Favorites() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [favLoading, setFavLoading] = useState(false);
  const [watchedLoading, setWatchedLoading] = useState(false);
  const [favs, setFavs] = useState([]);
  const [watched, setWatched] = useState([]);

    useEffect(() => {
    const fetchFavourites = async () => {
        setFavLoading(true);
        try {
        const token = await SecureStore.getItemAsync("userToken");
        const data = await getFavourites(token);
        
        if (data) {
            setFavs(data);
        }
        } catch (error) {
        console.error('Error fetching favourite movies:', error);
        } finally {
        setFavLoading(false);
        }
    };

    fetchFavourites();

    }, []);

    useEffect(() => {
    const fetchWatched = async () => {
        setWatchedLoading(true);
        try {
        const token = await SecureStore.getItemAsync("userToken");
        const data = await getSeenMovies(token);
        
        if (data) {
            setWatched(data);
        }
        } catch (error) {
        console.error('Error fetching watched movies:', error);
        } finally {
        setWatchedLoading(false);
        }
    };

    fetchWatched();

    }, []);

  return (
  <View style={{ flex: 1, flexDirection: 'column', paddingTop: Platform.OS === 'ios' ? 80 : 45 }}>
    <View style={{ marginBottom: 4, alignItems:'baseline' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center',textAlign:'center',width:'100%', justifyContent: 'center' }}>  
        <Text
          style={{
            color: theme.colors.text,
            fontWeight: 700,
            fontSize: 28,
            marginBottom: 5,
            textAlign: 'center',
          }}
        >
          My Movies
        </Text>
      </View>
      {/* ---------------- FAVS ---------------- */}
      <View style={{ marginBottom: 4, height: 300, marginHorizontal: 10 }}>
        <Text style={{ color: theme.colors.text, fontWeight: 700, fontSize: 25, marginBottom: 12, marginTop: 10, marginLeft: 3 }}>
          Favorites:
        </Text>

        { favLoading ? (
          <ActivityIndicator size="medium" color={theme.colors.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
        ) : (favs.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {favs.map((movie, idx) => (
                <View
                  key={movie.id}
                  style={{
                    width: 130,
                    alignItems: 'center',
                    marginRight: 12,
                    marginTop: 10,
                    marginLeft: 3,
                  }}
                >
                  <FilmDisplay
                    width={120}
                    movie={{...movie,poster:{uri: movie.poster}}}
                    onPress={() => navigation.navigate('FilmDetails', { movie: { ...movie, poster: { uri: movie.poster } } })}
                  />
                  <Text
                    style={{
                      marginTop: 0.5,
                      fontWeight: '600',
                      color: theme.colors.text,
                      textAlign: 'center',
                    }}
                    numberOfLines={2}
                  >
                    {movie.title}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text style={{ color: theme.colors.secondary, fontSize: 30, fontWeight: '700' }}>Nothing here...</Text>
            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '400', textAlign: 'center' }}>
              Try searching for a movie you love and tap the heart icon! 
            </Text>
          </View>
        ))}
      </View>

      {/* ---------------- TO WATCH ---------------- */}
<<<<<<< HEAD
      <View style={{ marginBottom: 4, marginTop: 10, height: 300, marginHorizontal: 10 }}>
        <Text style={{ color: theme.colors.text, fontWeight: 700, fontSize: 25, marginBottom: 12, marginTop: 10, marginLeft: 3 }}>
          Watched:
        </Text>

        {watched.length > 0 ? (
=======
      <View style={{ marginBottom: 4, marginTop: 10, height: 320, marginHorizontal: 10}}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Text style={{ color: theme.colors.text, fontWeight: 700, fontSize: 25, marginBottom: 12, marginTop: 10, marginLeft: 3 }}>
            Wacthed:
          </Text>
        </View>
        { watchedLoading ? (
          <ActivityIndicator size="medium" color={theme.colors.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
        ) : (watched.length > 0 ? (
>>>>>>> c9b9518daa44af4b35fb1f8219ac7051914fd8c0
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {watched.map((movie, idx) => (
                <View
                  key={movie.id + idx}
                  style={{
                    width: 130,
                    alignItems: 'center',
                    marginRight: 12,
                    marginTop: 10,
                    marginLeft: 3,
                  }}
                >
                  <FilmDisplay
                    width={120}
                    movie={{...movie,poster:{uri: movie.poster}}}
                    onPress={() => navigation.navigate('FilmDetails', { movie: { ...movie, poster: { uri: movie.poster } } })}
                  />
                  <Text
                    style={{
                      marginTop: 0.5,
                      fontWeight: '600',
                      color: theme.colors.text,
                      textAlign: 'center',
                    }}
                    numberOfLines={1}
                  >
                    {movie.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <MaterialCommunityIcons
                      name="star"
                      size={20}
                      color={theme.colors.primary}
                      style={{ marginRight: 3 }}
                    />
                    <Text style={{ color: '#aaa', fontWeight: '500', fontSize: 14, marginRight: 2 }}>Rating</Text>
                    <Text style={{ color: theme.colors.text, fontWeight: '500', fontSize: 14 }}>
                      {movie.rating} / 10
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text style={{ color: theme.colors.secondary, fontSize: 30, fontWeight: '700' }}>Nothing here...</Text>
            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '400', textAlign: 'center' }}>
              Try searching for a movie you watched recently and rate it!
            </Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);}