import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, FlatList, ScrollView, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import SearchBar from '../components/Searchbar';
import Seleccionable from '../components/Seleccionable';
import { useNavigation } from '@react-navigation/native';
import FilmDisplay from '../components/FilmDisplay';

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation();

  // Géneros de prueba (en la versión final asumo que se sacarán de la db)
  const allGenres = [
    'Acción', 'Drama', 'Comedia', 'Crimen', 'Terror',
    'Ciencia ficción', 'Fantasía', 'Romance', 'Thriller', 'Aventura',
    'Documental', 'Animación', 'Musical', 'Familia', 'Deportes', 'Superhéroes',
    'Historia', 'Guerra', 'Western', 'Biografía', 'Misterio','Infantil',
    '2da Guerra Mundial','1ra Guerra Mundial','Revolución Rusa','Kung-Fu Panda 2'
  ];

 
  // 6 películas de prueba, lo mismo, esto en el final vendrá de la db
  const movies = [
    {
      id: 'm1',
      title: 'Avengers: Endgame',
      genres: ['Acción', 'Superhéroes'],
      poster: require('../assets/avengers_endgame.jpg'),
      rating: 8.4,
      year: 2019,
      runtime: '181',
      director: 'Anthony Russo, Joe Russo',
      ageRating: 'PG-13',
      platforms: ['Disney+', 'Prime Video'],
      description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. The Avengers assemble once more to undo Thanos’ actions and restore balance to the universe.'
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
      description: 'The Bad Guys return for another thrilling adventure as they navigate their way through a heist gone wrong, learning the value of teamwork and friendship.'
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
      description: 'A giant great white shark terrorizes a small resort town, prompting the local sheriff, a marine biologist, and a grizzled fisherman to hunt it down.'
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
      description: 'A prequel to The Lion King, exploring the rise of Mufasa and his journey to becoming the king of the Pride Lands.'
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
      description: 'Scott Pilgrim must defeat his new girlfriend’s seven evil exes in order to win her heart in this quirky and action-packed comedy.'
    },
    {
      id: 'm6',
      title: 'The Greatest Showman',
      genres: ['Musical', 'Familia', 'Drama',"superheroes","comedia musical","las aventuras de hugh jackman"],
      poster: require('../assets/greatest_showman.jpg'),
      rating: 7.6,
      year: 2017,
      runtime: '105',
      director: 'Michael Gracey',
      ageRating: 'PG',
      platforms: ['Disney+', 'Hulu'],
      description: 'Inspired by the story of P.T. Barnum, this musical celebrates the birth of show business and the visionary who rose from nothing to create a spectacle that became a worldwide sensation.'
    }
  ];
  // ------------------------------------------------------------

  // Cuántos géneros mostrar en la vista principal antes de "Ver más"
  const VISIBLE_COUNT = 6;

  const [activeFilters, setActiveFilters] = useState([]);
  const [showMore, setShowMore] = useState(false);

  const toggleFilter = (genre, selected) => {
    setActiveFilters(prev => {
      const exists = prev.includes(genre);
      if (selected) {
        // si selected=true lo ponemos en la lista
        if (!exists) return [...prev, genre];
        return prev;
      } else {
        // si selected=false lo sacamos
        if (exists) return prev.filter(g => g !== genre);
        return prev;
      }
    });
  };

  const visibleGenres = allGenres.slice(0, VISIBLE_COUNT);
  const moreGenres = allGenres.slice(VISIBLE_COUNT);

  // ---- Filtrado de películas ----------------------------------------------------------------
  const displayedMovies = activeFilters.length === 0
    ? movies
    : movies.filter(movie => movie.genres.some(g => activeFilters.includes(g)));
  // --------------------------------------------------------------------------------------------

  return (
    <View style={{ flex: 1, padding: '1%', flexDirection:'column' }}>
      <ScrollView
        style={{paddingTop:'20%', flex:0.75, backgroundColor: 'transparent'}}
        contentContainerStyle={{ flexGrow: 1, }}
        showsVerticalScrollIndicator={false}
      >

        <View style={{alignItems:'center'}}>
          <Text variant='headlineLarge' style={{color:theme.colors.text, fontWeight:700}}>Bienvenido de nuevo</Text>
          <Text variant='bodyMedium' style={{color:theme.colors.text}}>¿Qué vamos a ver hoy?</Text>
        </View>

        <View style={{padding:'5%', flex:1, gap:15}}>

          <View >
            <SearchBar />
          </View>

          <View style={{paddingHorizontal:5}}>
            <View>
              <Text style={{color:theme.colors.text, fontWeight:700, fontSize:20}}>
                Géneros:
              </Text>
            </View>

            <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent:'center'}}>
              {visibleGenres.map(genre => (
                <View key={genre} style={{marginHorizontal:'1%',paddingTop:'2%'}}>
                  <Seleccionable
                    fontSize={12}
                    label={genre}
                    initialSelected={activeFilters.includes(genre)}
                    onSelect={(selected) => toggleFilter(genre, selected)}
                  />
                </View>
              ))}

              {moreGenres.length > 0 && (
                <View style={{paddingTop:'2%'}}>
                <TouchableOpacity
                  onPress={() => setShowMore(true)}
                  activeOpacity={0.8}
                  style={{
                    marginLeft: '1%',
                    alignSelf: 'flex-start',
                    padding:5,
                    paddingHorizontal:12,
                    borderRadius: 999,
                    backgroundColor: 'rgba(105,105,105,0.7)',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ color: theme.colors.placeholderText, fontSize:12, fontWeight: '600' }}>
                    Ver más...
                  </Text>
                </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={{paddingHorizontal:5}}>
            <View>
              <Text style={{color:theme.colors.text, fontWeight:700, fontSize:20}}>
                Películas:
              </Text>
            </View>

            <View style={{paddingTop:16, flexDirection: 'row', flexWrap: 'wrap', justifyContent:'space-between' }}>
              {displayedMovies.map(movie => (
                <FilmDisplay width={'30%'} key={movie.id} movie={movie} onPress={(selected) => navigation.navigate('FilmDetails', { movie })} ></FilmDisplay>
              ))}
              {displayedMovies.length % 3 ===2 && (
                <View style={{ width: '30%' }}>
                  <View style={{marginBottom:16, width: '100%', aspectRatio: 2/3, borderRadius:15, overflow:'hidden', backgroundColor:'transparent' }} />
                </View>
              )}
              {displayedMovies.length === 0 && (
                <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
                  <Text style={{ color: theme.colors.text }}>No hay películas que coincidan con los filtros seleccionados.</Text>
                </View>
              )}
            </View>

          </View>

          <View style={{height:180}} />
        </View>

      </ScrollView>

      <Modal
        visible={showMore}
        animationType="slide"
        onRequestClose={() => setShowMore(false)}
        transparent={false}
      >
        <View style={{ flex: 1, padding: 25, backgroundColor: theme.colors.background }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <Text variant="headlineSmall" style={{ color: theme.colors.text, fontWeight: 700 }}>Todos los géneros</Text>
            <TouchableOpacity onPress={() => setShowMore(false)} style={{ padding: 8 }}>
              <Text style={{ color: theme.colors.text }}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {moreGenres.map(genre => (
              <View key={genre} style={{ marginBottom: 12 }}>
                <Seleccionable
                  label={genre}
                  initialSelected={activeFilters.includes(genre)}
                  onSelect={(selected) => toggleFilter(genre, selected)}
                  width='100%'
                  fontSize={18}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}
