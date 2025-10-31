import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, FlatList, ScrollView, Image, Platform } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import SearchBar from '../components/Searchbar';
import Seleccionable from '../components/Seleccionable';
import { useNavigation } from '@react-navigation/native';
import FilmDisplay from '../components/FilmDisplay';
import LoadingBox from '../components/LoadingBox';
import GradientButton from '../components/GradientButton';
import * as SecureStore from 'expo-secure-store';
import { homeMovies } from '../src/services/api';

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation();

  // Géneros de prueba (en la versión final asumo que se sacarán de la db)
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
   useEffect(() => {
   const fetchMovies = async () => {
     setLoading(true);
     try {
       const token = await SecureStore.getItemAsync("userToken");
       const data = await homeMovies(token);
       if (data) {
         setMovies(data);
       }
     } catch (error) {
       console.error('Error fetching home movies:', error);
     } finally {
       setLoading(false);
     }
   };


   fetchMovies();
 }, []);
 const PLACEHOLDER_COUNT = 6;
 const placeholders = Array.from({ length: PLACEHOLDER_COUNT });
  // ---- Filtrado de películas ----------------------------------------------------------------
  const displayedMovies = activeFilters.length === 0
    ? movies
    : movies.filter(movie => activeFilters.every(f => movie.genres.includes(f)));
  // --------------------------------------------------------------------------------------------

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

  return (
    <View style={{ flex: 1, padding: '1%', flexDirection:'column' }}>
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

        <View style={{padding:'5%', flex:1, gap:15, backgroundColor:'transparent'}}>

          <View >
            <SearchBar />
          </View>

          <View style={{paddingHorizontal:5}}>
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

          <View style={{paddingHorizontal:5}}>
            <View>
              <Text style={{color:theme.colors.text, fontWeight:700, fontSize:20}}>
                Movies for you:
              </Text>
            </View>

            <View style={{paddingTop:16, flexDirection: 'row', flexWrap: 'wrap', justifyContent:'space-between',height: 350 }}>
             {loading ? (
               placeholders.map((_, idx) => (
                 <View key={`ph-${idx}`} style={{ width: '30%' }}>
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
               displayedMovies.map(movie => (
                 <FilmDisplay
                   width={'30%'}
                   key={movie.id}
                   movie={{ ...movie, poster: { uri: movie.poster } }}
                   onPress={(selected) => navigation.navigate('FilmDetails', { movie: { ...movie, poster: { uri: movie.poster } } })}
                 />
               ))
             )}
              {displayedMovies.length % 3 ===2 && (
                <View style={{ width: '30%' }}>
                  <View style={{marginBottom:16, width: '100%', aspectRatio: 2/3, borderRadius:15, overflow:'hidden', backgroundColor:'transparent' }} />
                </View>
              )}
              {!loading && displayedMovies.length === 0 && (
                <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
                  <Text style={{ color: theme.colors.text }}>Sorry! We couldn't find any movies for you with those filters!</Text>
                </View>
              )}
            </View>

          </View>
          <GradientButton style={[matchButtonStyle]} inverted={true}> 
            <Text style={{color: theme?.colors?.onGradient ?? theme.colors.text,fontSize:16,fontWeight:700}}>MATCH</Text>
          </GradientButton> 
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
