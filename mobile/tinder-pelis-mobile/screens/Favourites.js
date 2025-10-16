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
import LoadingBox from '../components/LoadingBox';


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
      <View style={{ marginBottom: 4, height: 300 }}>
        <Text style={{ color: theme.colors.text, fontWeight: 700, fontSize: 25, marginBottom: 12, marginTop: 10, marginLeft: 13 }}>
          Favorites:
        </Text>

        { ((favLoading || favs.length > 0) ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 10 }}>
              {favLoading ? (
                [1,2,3].map(i=>(<View
                  key={i}
                  style={{
                    width: 130,
                    alignItems: 'center',
                    marginRight: 12,
                    marginTop: 10,
                    marginLeft: 3,
                  }}
                >  
                  <LoadingBox style={{ width:120,height:180, borderRadius:15 }} />
                  <LoadingBox style={{ width:120,height:30, borderRadius:8, marginTop:18 }} />
                </View>))
              ) : (favs.map((movie, idx) => (
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
                </View>)
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, marginHorizontal: 10 }}>
            <Text style={{ color: theme.colors.secondary, fontSize: 30, fontWeight: '700' }}>Nothing here...</Text>
            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '400', textAlign: 'center' }}>
              Try searching for a movie you love and tap the heart icon! 
            </Text>
          </View>
        ))}
      </View>

      {/* ---------------- TO WATCH ---------------- */}
      <View style={{ marginBottom: 4, marginTop: 10, height: 320}}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Text style={{ color: theme.colors.text, fontWeight: 700, fontSize: 25, marginBottom: 12, marginTop: 10, marginLeft: 13 }}>
            Watched:
          </Text>
        </View>
        { watchedLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 10 }}>
              {[1,2,3].map(i => (
                <View
                  key={i}
                  style={{
                    width: 130,
                    alignItems: 'center',
                    marginRight: 12,
                    marginTop: 10,
                    marginLeft: 3,
                  }}
                >
                  <LoadingBox style={{ width:120,height:180, borderRadius:15 }} />
                  <LoadingBox style={{ width:120,height:15, borderRadius:4, marginTop:18 }} />
                  <LoadingBox style={{ width:60,height:15, borderRadius:4, marginTop:8 }} />
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (watched.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginHorizontal:10 }}>
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
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, marginHorizontal: 10 }}>
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
