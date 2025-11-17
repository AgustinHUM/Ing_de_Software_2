import React, { useEffect, useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, FlatList, ScrollView, Image, Platform } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import SearchBar from '../components/Searchbar';
import Seleccionable from '../components/Seleccionable';
import { useNavigation } from '@react-navigation/native';
import FilmDisplay from '../components/FilmDisplay';
import LoadingBox from '../components/LoadingBox';
import GradientButton from '../components/GradientButton';
import * as SecureStore from 'expo-secure-store';
import { homeMovies, createSoloMatch } from '../src/services/api';
import GenreSelector from '../components/GenreSelector';
import { useAuth } from '../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedIcon from '../components/AnimatedIcon';
import SpinningIcon from '../components/SpinningIcon';
import Icon from '../assets/gear-spinner.svg';

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { state, updateUser } = useAuth();
  const MOVIE_WIDTH = 118;
  const allGenres = [ "Action",
   "Action & Adventure",
   "Adventure",
   "Animation",
   "Anime",
   "Biography",
   "Comedy",
   "Crime",
   "Documentary",
   "Drama",
   "Family",
   "Fantasy",
   "Food",
   "Game Show",
   "History",
   "Horror",
   "Kids",
   "Music",
   "Musical",
   "Mystery",
   "Nature",
   "News",
   "Reality",
   "Romance",
   "Sci-Fi & Fantasy",
   "Science Fiction",
   "Soap",
   "Sports",
   "Supernatural",
   "Talk",
   "Thriller",
   "Travel",
   "TV Movie",
   "War",
   "War & Politics",
   "Western"];

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

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenreSelector, setShowGenreSelector] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);

   useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('lastMatchedMovie');
        if (raw) {
          let movieObj = null;
          try {
            movieObj = JSON.parse(raw);
          } catch (e) {
            // no debería pasar esto pero por las dudas
            movieObj = raw;
            console.warn('lastMatchedMovie found but JSON.parse failed — using raw value', e);
          }
          if (movieObj && movieObj.time && (Date.now() - movieObj.time) > (3) * 60 * 60 * 1000) { // 3 horas
            await AsyncStorage.removeItem('lastMatchedMovie');
            navigation.navigate('DidYouWatch', { movie: movieObj });
          }
        }
      } catch (err) {
        console.error('Error while checking lastMatchedMovie from AsyncStorage', err);
      }
    })();
  }, []);

   useEffect(() => {
    const user = state?.user;
    const userHasMoviesProp =
      user != null && Object.prototype.hasOwnProperty.call(user, "homeMovies");
    const fetchMovies = async () => {
      setLoading(!userHasMoviesProp);
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const data = await homeMovies(token);
        if (data && data!==movies) {
          setMovies(data);
          updateUser(user => ({ ...user, homeMovies: data }));
        }
      } catch (error) {
        console.error('Error fetching home movies:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userHasMoviesProp) {
      setLoading(false);
      setMovies(user.homeMovies ?? []);
      fetchMovies();
    } else {
      fetchMovies();
    }

 }, []);
 const PLACEHOLDER_COUNT = 6;
 const placeholders = Array.from({ length: PLACEHOLDER_COUNT });
  // ---- Filtrado de películas ----------------------------------------------------------------
  const displayedMovies = activeFilters.length === 0
    ? movies
    : movies.filter(movie => activeFilters.every(f => movie.genres.includes(f)));
  // --------------------------------------------------------------------------------------------

  const chunk = (arr, size = 2) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const moviePairs = chunk(displayedMovies, 2);


  const matchButtonStyle = {
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      overflow: 'hidden',
      height: 40,
      alignSelf:'center',
      justifyContent: 'center',
      width:150,
      boxShadow: [{
                      offsetX: 0,
                      offsetY: 0,
                      blurRadius: 14,
                      spread: 0,
                      color: theme.colors.primary,
                      }]
    };
  if (matchLoading) {
      return (
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, width: '100%', height: '100%' }}>
          <View style={{ width:'100%', height: '40%', justifyContent: 'center', alignItems: 'center' }}>
            <SpinningIcon 
              Icon={Icon} 
              size={150} 
              color={theme.colors.primary}
              style={{
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 20,
              }}
            />
          </View>
          <Text style={{ color: theme.colors.text, fontSize: 20 }}>Loading session...</Text>
        </View>
      );
    }
  

  return (
    <View style={{ flex: 1,paddingBottom:6, flexDirection:'column' }}>
      <View
        style={{paddingTop:'17%', flex:0.75,flexGrow:1, backgroundColor: 'transparent'}}
      >

        <View style={{ alignItems: 'center' }}>
         <Text variant="headlineLarge" style={{ textAlign: 'center',fontSize:36, color: theme.colors.text, fontWeight: '700' }}>
             <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Movie</Text>
             <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Mingle</Text>
           </Text>
         <Text variant='bodyMedium' style={{ color: theme.colors.text }}>What are we watching today?</Text>
       </View>

        <View style={{ flex:1, gap:15, backgroundColor:'transparent'}}>

          <View style={{paddingHorizontal:21,paddingTop:21}} >
            <SearchBar />
          </View>

          <View style={{paddingHorizontal:26}}>
            <View>
              <Text style={{color:theme.colors.text, fontWeight:700, fontSize:20}}>
                Genres:
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
              <View style={{ paddingTop: '2%' }}>
                <TouchableOpacity
                  onPress={() => setShowMore(true)}
                  activeOpacity={0.8}
                  style={{
                    marginLeft: '1%',
                    alignSelf: 'flex-start',
                    padding: 5,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    backgroundColor: activeFilters.some(g=>moreGenres.includes(g)) ? theme.colors.primary : 'rgba(105,105,105,0.7)',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ color: activeFilters.some(g=>moreGenres.includes(g)) ? theme.colors.text : theme.colors.placeholderText, fontSize: 12, fontWeight: '600' }}>
                    More...
                  </Text>
                </TouchableOpacity>
               </View>
             )}

            </View>
          </View>

          <View >
            <View style={{paddingLeft:26}}>
              <Text style={{color:theme.colors.text, fontWeight:700, fontSize:20}}>
                Movies for you:
              </Text>
            </View>

            <ScrollView style={{height: 370 }} 
            contentContainerStyle={{paddingTop:8,paddingLeft:16, flexDirection: 'row', justifyContent:'flex-start',gap:13}} 
            horizontal={true} showsHorizontalScrollIndicator={false}>
             {loading ? (
               chunk(placeholders,2).map((_, idx) => (
                 <View
                  key={`pair-${idx}`}
                  style={{
                    width: MOVIE_WIDTH,
                    padding:5,
                    justifyContent: 'flex-start'
                  }}
                >
                   <LoadingBox
                     style={{
                       marginBottom: 16,
                       width: '100%',
                       aspectRatio: 2 / 3,
                       borderRadius: 15,
                       overflow: 'hidden'
                     }}
                   />
                   <LoadingBox
                     style={{
                       marginBottom: 16,
                       width: '100%',
                       aspectRatio: 2 / 3,
                       borderRadius: 15,
                       overflow: 'hidden'
                     }}
                   />
                 </View>
               ))
             ) : (
               moviePairs.map((pair, pairIdx) => (
                <View
                  key={`pair-${pairIdx}`}
                  style={{
                    width: MOVIE_WIDTH,
                    padding:5,
                    backgroundColor: 'transparent',
                    justifyContent: 'flex-start'
                  }}
                >
                  {pair.map((movie, i) =>
                    movie ? (
                      <View key={movie.id} >
                        <FilmDisplay
                          width={'100%'}
                          movie={{ ...movie, poster: { uri: movie.poster } }}
                          onPress={() =>
                            navigation.navigate('FilmDetails', {
                              movie: { ...movie, poster: { uri: movie.poster } }
                            })
                          }
                        />
                      </View>
                    ) : (
                      // empty slot for missing second movie (keeps consistent layout)
                      <View
                        key={`empty-${pairIdx}`}
                        style={{
                          width: '100%',
                          aspectRatio: 2 / 3,
                          borderRadius: 15,
                          overflow: 'hidden',
                          backgroundColor: 'transparent'
                        }}
                      />
                    )
                  )}
                </View>
              ))
             )}
              {!loading && displayedMovies.length === 0 && (
                <View style={{ width: '100%', alignItems: 'center', marginTop: 20, width:300,marginLeft:40 }}>
                  <Text style={{ color: theme.colors.text, textAlign:'center' }}>Sorry! We couldn't find any movies to match you! May be try changing your preferences.</Text>
                </View>
              )}
            </ScrollView>

          
          <GradientButton 
            style={[matchButtonStyle]} 
            inverted={true}
            loading={matchLoading}
            onPress={() => setShowGenreSelector(true)}
          > 
            <Text style={{color: theme?.colors?.onGradient ?? theme.colors.text,fontSize:16,fontWeight:700}}>MATCH</Text>
          </GradientButton>
            </View>
          <GenreSelector 
            visible={showGenreSelector}
            onClose={() => setShowGenreSelector(false)}
            onSubmit={async (genres) => {
              setMatchLoading(true);
              const token = await SecureStore.getItemAsync("userToken");
              const session = await createSoloMatch(token, genres);
              navigation.navigate("GroupSwiping", { 
                sessionId: session.session_id,
                isSoloSession: true
              });
              setShowGenreSelector(false);
            }}
            loading={matchLoading}
          />
        </View>
      
      </View>
      

 <Modal
       visible={showMore}
       animationType="slide"
       onRequestClose={() => setShowMore(false)}
       transparent={false}
     >
       <View style={{ flex: 1, flexDirection:'column', padding: 25, paddingVertical: Platform.OS === 'ios' ? 70 : 35, backgroundColor: theme.colors.background }}>
         <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
           <Text variant="headlineMedium" style={{ color: theme.colors.text, fontWeight: 700 }}>All Genres</Text>
        </View>
         <Divider
                   style={{
                     backgroundColor: theme.colors.primary,
                     width: "100%",
                     height: 5,
                     borderRadius: 5,
                   }}
                 />
         <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
           {allGenres.map(genre => (
             <View key={genre} style={{ marginTop: 12 }}>
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
         <Divider
                   style={{
                     backgroundColor: theme.colors.primary,
                     width: "100%",
                     height: 5,
                     borderRadius: 5,
                     marginBottom:16
                   }}
                 />
         <GradientButton onPress={() => setShowMore(false)}>Apply filter</GradientButton>
       </View>
     </Modal>
    </View>
  );
}
