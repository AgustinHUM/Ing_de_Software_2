import React from 'react';
import { View, Image, TouchableOpacity, ScrollView, Modal, Platform, Dimensions } from 'react-native';
import { Text, useTheme, IconButton, ActivityIndicator, Divider } from 'react-native-paper';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import Fontisto from '@expo/vector-icons/Fontisto';
import { setAlpha } from '../theme';
import FilmDisplay from '../components/FilmDisplay';
import FilmDetail from '../components/FilmDetail';
import { useState, useEffect, useCallback } from 'react';
import Seleccionable from '../components/Seleccionable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DetailList from '../components/DetailList';
import TitleDisplay from '../components/TitleDisplay';
import { toFavorite,getMovieDetails } from '../src/services/api';
import * as SecureStore from "expo-secure-store";
import { getUserRating } from '../src/services/api';
import LoadingBox from '../components/LoadingBox';
import GradientButton from '../components/GradientButton';

const { width } = Dimensions.get('window');

const fallbackMovie = {
  title: 'Unkown Film',
  genres: [],
  poster: null,
  year: '',
  duration: '',
  director: '',
  rating: '',
  description: 'No description available.'
};

export default function FilmDetailsScreen() {
    const theme = useTheme();
    const route = useRoute();
    const navigation = useNavigation();
    const [movie,setMovie] = useState(route.params?.movie || fallbackMovie);
    const [showGenresModal, setShowGenresModal] = React.useState(false);
    const [isFavourite, setIsFavourite] = useState(false);      
    const [userRating, setUserRating] = useState(null); 
    const [favLoading, setFavLoading] = useState(false);
    const [loading, setLoading] = useState(false); // estado para el fetch de detalles
    const insets = useSafeAreaInsets();
    const insetBottom = 10;     
    const height = 80; 
    const [showMore, setShowMore] = useState(false);
    const [showAllPlatforms, setShowAllPlatforms] = useState(false);
    const visible_genres = 2;
    const visible_platforms = showAllPlatforms ? 30 : 5;

    useEffect(() => {
    const fetchMovieDetails = async () => {
        setFavLoading(true);
        setLoading(true); // indicamos que estamos fetchando detalles
        try {
        const token = await SecureStore.getItemAsync("userToken");
        const data = await getMovieDetails(movie.id, token);
        
        if (data) {
            setIsFavourite(data.is_favorite || false);
            // fusionamos la data nueva con la ya existente para no perder campos previos
            setMovie(prev => ({ ...prev, ...data }));
            console.log('Movie details fetched:', data);
        }
        } catch (error) {
        console.error('Error fetching movie details:', error);
        } finally {
        setLoading(false);
        setFavLoading(false);
        }
    };

    if (movie?.id) {
        fetchMovieDetails();
    }
    }, [movie?.id]);


    const containerStyle = {
        position: 'absolute',
        right: 16, 
        bottom: insetBottom + (insets.bottom || 0) + height + 10, 
        height: 60, 
        width: 60, 
        borderRadius: 30, 
        backgroundColor: theme.colors.primary, 
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: [{
            offsetX: 0,
            offsetY: 0,
            blurRadius: 24,
            spread: 0,
            color: setAlpha(theme.colors.primary, 0.6),
        }],
    };

    const toggleFavourite = async () => {
        if (favLoading) return; // prevent duplicate calls
        setFavLoading(true);
        const token = await SecureStore.getItemAsync("userToken");
        const action = isFavourite ? 'remove' : 'add';
        try {
            await toFavorite(movie.id, action, token);
            // only flip the local state after the server responds successfully
            setIsFavourite(prev => !prev);
        } catch (error) {
            console.error('Error updating favorite status:', error);
            // optionally show a toast/snackbar here
        } finally {
            setFavLoading(false);
        }
    }

    const toggleRated = () => {
        setRated((prev) => !prev);
    };


  const checkIfMovieRated = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await getUserRating(movie.id, token);
      console.log(response);
      setUserRating(response.rating); 
    } catch (error) {
      console.error('Error checking user rating:', error);
      setUserRating(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (movie.id) {
        checkIfMovieRated();
      }
    }, [movie.id])
  );


    return (
        <View style={{ flex: 1, flexDirection:'column'}}>
            <ScrollView
                style={{paddingTop:'15%', flex:0.75, padding:'3%', backgroundColor: 'transparent'}}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                        <IconButton
                        icon={() => (
                            <MaterialCommunityIcons
                            name="chevron-left"
                            size={32}
                            color={theme.colors.text}
                            />
                        )}
                        onPress={() => navigation.goBack()}
                        style={{ position: 'absolute', left: 0 }}
                        />
                        <Text variant='headlineSmall' style={{ color: theme.colors.text, fontWeight: 400 }}>Details</Text>
                        <View style={{ position: 'absolute', right: 0 }}>
                            <IconButton
                                icon={() => (
                                    favLoading ? (
                                      <ActivityIndicator size={20} />
                                    ) : (
                                      <MaterialCommunityIcons
                                        name={isFavourite ? 'heart' : 'heart-outline'}
                                        size={28}
                                        color={isFavourite ? theme.colors.primary : theme.colors.text} 
                                      />
                                    )
                                )}
                                onPress={toggleFavourite}
                                disabled={favLoading}
                            />
                        </View>
                    </View>


                    <View style={{paddingTop:16, flexDirection: 'row', flexWrap: 'wrap', justifyContent:'space-between', flex:1}}>
                        {!movie.poster ? (
                          <LoadingBox style={{ width: '50%', height: 240, borderRadius: 8 }} />
                        ) : (
                          <FilmDisplay width={'50%'} key={movie.id} movie={movie} onPress={null} interactable={false} />
                        )}

                        <View style={{ width: '47%' }}>

                            {!movie.title ? (
                              <LoadingBox style={{ width: '80%', height: 36, borderRadius: 6, marginBottom: 8 }} />
                            ) : (
                              <TitleDisplay
                                title={movie.title || 'Unknown title'}
                                style={{color:theme.colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 8,}}
                                numberOfLines={2}
                              />
                            )}

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                            <DetailList 
                                list={Array.isArray(movie.genres) && movie.genres.length ? movie.genres : ['No genres available']}
                                visibleCount={visible_genres}
                                onShowMore={() => setShowGenresModal(true)}
                            />
                            </View>

                            {/* Mostramos LoadingBox cuando estamos cargando */}
                            {loading ? (
                              <LoadingBox style={{width:120,height:20,borderRadius:6,marginBottom:8}} />
                            ) : (
                              <FilmDetail 
                                  icon={<Feather name="calendar" size={16} color={theme.colors.text} />}
                                  value={movie.year || 'Unknown'}
                              />
                            )}

                            {loading ? (
                              <LoadingBox style={{width:140,height:20,borderRadius:6,marginBottom:8}} />
                            ) : (
                              <FilmDetail 
                                  icon={<Octicons name="hourglass" size={16} color={theme.colors.text} />}
                                  value={movie.runtime ? `${movie.runtime} min` : 'Unknown'}
                              />
                            )}

                            {loading ? (
                              <LoadingBox style={{width:160,height:20,borderRadius:6,marginBottom:8}} />
                            ) : (
                              <FilmDetail 
                                  icon={<Ionicons name="person-outline" size={16} color={theme.colors.text} />}
                                  label="Director"
                                  value={movie.director || 'Unknown'}
                                  containerStyle={{paddingRight:1}}
                              />
                            )}

                            {loading ? (
                              <LoadingBox style={{width:100,height:20,borderRadius:6,marginBottom:8}} />
                            ) : (
                              <FilmDetail 
                                  icon={<Ionicons name="ticket-outline" size={16} color={theme.colors.text} />}
                                  label="Rated"
                                  value={movie.ageRating || 'N/A'}
                              />
                            )}
                        </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems:'flex-start', flex:1, marginBottom:16 }}>
                        {loading ? (
                              <LoadingBox style={{marginBottom:8,borderRadius:8,width:64,height:40, marginRight:8}} />
                            ) : (
                              <FilmDetail
                                  icon= {<MaterialIcons name='star-outline' size={16} color={theme.colors.text} />}
                                  value={!!movie.rating ? (typeof movie.rating === 'number' ? movie.rating.toFixed(1) : String(movie.rating)) : 'N/A'}
                                  textStyle={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginLeft: 6}}
                                  containerStyle={{flexDirection: 'row',
                                  paddingVertical: 10,
                                  paddingHorizontal: 12,
                                  borderRadius: 8,
                                  marginRight: 8,
                                  marginBottom: 8,
                                  backgroundColor: theme.colors.primary,
                                  alignItems: 'center'}}>
                              </FilmDetail>
                            )}

                        {loading ? (
                            <LoadingBox style={{marginBottom:8,borderRadius:8,width:256,height:40}} />
                        ) : Array.isArray(movie.platforms) && movie.platforms.length ? (
                            <>
                                <DetailList
                                    list={movie.platforms}
                                    visibleCount={visible_platforms}
                                    containerStyle={{
                                            flexDirection: 'row',
                                            paddingVertical: 10,
                                            paddingHorizontal: 12,
                                            borderRadius: 8,
                                            marginRight: 8,
                                            marginBottom: 8,
                                            backgroundColor: theme.colors.surface,
                                            alignItems: 'center',}}
                                    textStyle={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600', marginLeft: 0 }}
                                    onShowMore={() => setShowAllPlatforms(!showAllPlatforms)}
                                />

                                {showAllPlatforms ? (
                                    <TouchableOpacity onPress={() => setShowAllPlatforms(false)} >
                                        <FilmDetail
                                            icon={<MaterialIcons value="Show Less" name='expand-less' size={16} color={theme.colors.primary} />}
                                            textStyle={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600', marginLeft: 6 }}
                                            value={'Show Less'}/>
                                    </TouchableOpacity>
                                    ) : null}
                            </>
                        ) : (
                            <LoadingBox style={{marginBottom:8,borderRadius:8,width:256,height:40}} />
                        )}
                    </View>

                    <View style={{marginBottom:300}}>
                       {loading ? (
                           <LoadingBox style={{width:'100%',height:150, borderRadius:15}} />
                       ) : movie.description ? (
                       <>
                           <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                               Synopsis
                           </Text>
                           <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 22, opacity: 0.8 }}>
                               {movie.description}
                           </Text>
                       </>) : (
                       <>
                           <LoadingBox style={{width:'100%',height:150, borderRadius:15}}></LoadingBox>
                       </>) }
                   </View>
                </View>
            </ScrollView>

            <Modal
                visible={showGenresModal}
                animationType="slide"
                onRequestClose={() => setShowGenresModal(false)}
                transparent={false}
            >
                <View style={{ flex: 1, flexDirection:'column', padding: 25, paddingVertical: Platform.OS === 'ios' ? 70 : 35, backgroundColor: theme.colors.background }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                        <Text variant="headlineMedium" style={{ color: theme.colors.text, fontWeight: 700, textAlign:'center' }}>{movie.title}'{movie.title.slice(-1)==='s' ? '' : 's'} Genres</Text>
                    </View>
                    <Divider
                            style={{
                                backgroundColor: theme.colors.primary,
                                width: "100%",
                                height: 5,
                                borderRadius: 5,
                            }}
                            />

                    <ScrollView contentContainerStyle={{ paddingBottom: 24, flexGrow:0 }} showsVerticalScrollIndicator={false}>
                        { (Array.isArray(movie.genres) && movie.genres.length ? movie.genres : ['No genres available']).map((genre, index) => (
                            <View
                                key={index}
                                style={{
                                    backgroundColor: theme.colors.primary,
                                    borderRadius: 999,
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    marginRight: 4,
                                    marginTop: 12,
                                }}
                            >
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        color: theme.colors.text,
                                        fontSize: 16,
                                        fontWeight: '700',
                                    }}
                                >
                                    {genre}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                    <Divider
                        style={{
                        backgroundColor: theme.colors.primary,
                        width: "100%",
                        height: 5,
                        borderRadius: 5,
                        marginBottom:16}}/>
                    <GradientButton mode='outlined' onPress={() => setShowGenresModal(false)}>Close</GradientButton>
                    <View style={{flex:1}} />
                </View>
            </Modal>

         

        <View style={userRating ? {...containerStyle,backgroundColor:theme.colors.secondary} : containerStyle}>
            {loading ? <ActivityIndicator size={25} color={theme.colors.text} /> : 
            <IconButton
                icon={() => (
                    <MaterialCommunityIcons
                        name={userRating ? 'video-check-outline' : 'video-outline'}
                        size={32}
                        color={userRating ? theme.colors.text : theme.colors.text}
                    />
                )}
            onPress={() => {
                navigation.navigate('RateFilm', { movie, userRating });
            }}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />}
        </View>
    </View>
  );    
}
