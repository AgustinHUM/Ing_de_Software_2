import React from 'react';
import { View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

const fallbackMovie = {
  title: 'Película Desconocida',
  genres: [],
  poster: null,
  year: '',
  duration: '',
  director: '',
  rating: '',
  description: 'No hay descripción disponible.'
};

export default function FilmDetailsScreen() {
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const movie = route.params?.movie || fallbackMovie;

  return (
    <View style={{ flex: 1, padding: '1%', flexDirection:'column'}}>
        <ScrollView
            style={{paddingTop:'15%', flex:0.75, backgroundColor: 'transparent'}}
            contentContainerStyle={{ flexGrow: 1, }}
            showsVerticalScrollIndicator={false}
        >
            <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                    <IconButton
                    icon="chevron-left"
                    size={32}
                    onPress={() => navigation.goBack()}
                    color={theme.colors.primary}
                    style={{ position: 'absolute', left: 0 }}
                    />
                    <Text variant='headlineSmall' style={{ color: theme.colors.text, fontWeight: 400 }}>Details</Text>
                </View>

                <View style={{paddingTop:16, flexDirection: 'row', flexWrap: 'wrap', justifyContent:'space-between', flex:1, marginBottom: 8}}>
                    <View style={{ alignItems: 'center', width: '50%', borderRadius:15, overflow:'hidden'}}>
                    {movie.poster && (
                        <Image
                        source={movie.poster}
                        style={{
                            width: '100%',
                            height: '100%',
                            resizeMode: 'cover'
                        }}
                        />
                    )}
                    </View>

                    <View style={{ width: '47%' }}>
                        <Text
                            style={{
                            color:theme.colors.text,
                            fontSize: 28,
                            fontWeight: 'bold',
                            marginBottom: 8,
                            }}
                        >
                            {movie.title}
                        </Text>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                            {movie.genres && movie.genres.length > 0 ? (
                            movie.genres.map((genre, index) => (
                            <View
                                key={index}
                                style={{
                                backgroundColor: theme.colors.primary,
                                borderRadius: 999,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                marginRight: 4,
                                marginBottom: 8,
                                }}
                            >
                                <Text
                                style={{
                                    color: theme.colors.text,
                                    fontSize: 14,
                                    fontWeight: '600',
                                }}
                                >
                                {genre}
                                </Text>
                            </View>
                            ))
                            ) : (
                            <View
                            style={{
                                backgroundColor: theme.colors.primary,
                                borderRadius: 999,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                marginRight: 8,
                                marginBottom: 16,
                            }}
                            >
                            <Text
                                style={{
                                color: theme.colors.text,
                                fontSize: 14,
                                fontWeight: '600',
                                }}
                            >
                                Sin géneros
                            </Text>
                            </View>
                            )}
                        </View>
                        {movie.year ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                            <Image
                                source={require('../assets/icons/calendar.png')}
                                style={{ width:16, height: 16, marginRight: 6 }}
                                resizeMode="contain"
                                tintColor={theme.colors.text}
                            />

                            <Text style={{
                                color: theme.colors.text,
                                fontSize: 14,
                                fontWeight: '500',
                            }}
                            >
                            {movie.year}
                            </Text>
                        </View>
                        ) : null}
                        {movie.runtime ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                            <Image
                                source={require('../assets/icons/hourglass.png')}
                                style={{ width:16, height: 16, marginRight: 6 }}
                                resizeMode="contain"
                                tintColor={theme.colors.text}
                            />
                            <Text style={{
                                color: theme.colors.text,
                                fontSize: 14,
                                fontWeight: '600',
                            }}
                            >
                            {movie.runtime} minutes
                            </Text>
                        </View>
                        ) : null}
                        {movie.director ? (
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, width: '85%' }}>
                            <Image
                                source={require('../assets/icons/person.png')}
                                style={{ width: 16, height: 16, marginRight: 6, marginTop: 2 }}
                                resizeMode="contain"
                                tintColor={theme.colors.text}
                            />
                            <Text
                            style={{
                                color: theme.colors.text,
                                fontSize: 14,
                                fontWeight: '600',
                                flexWrap: 'wrap',
                            }}
                            >
                            Director: {movie.director}
                            </Text>
                        </View>
                        ) : null}
                        {movie.ageRating ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                            <Image
                                source={require('../assets/icons/ticket.png')}
                                style={{ width:16, height: 16, marginRight: 6 }}
                                resizeMode="contain"
                                tintColor={theme.colors.text}
                            />
                            <Text style={{
                                color: theme.colors.text,
                                fontSize: 14,
                                fontWeight: '600',
                            }}
                            >
                            {movie.ageRating} Rated
                            </Text>
                        </View>
                        ) : null}
                    </View>
                </View>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems:'flex-start', justifyContent:'space-between', flex:1, marginBottom:16 }}>
                    {movie.rating ? (
                        <View style={{
                            flexDirection: 'row',
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            marginRight: 8,
                            marginBottom: 8,
                            backgroundColor: theme.colors.surface,
                            minWidth: 70,
                            alignItems: 'center',
                        }}
                        >   
                            <Image source={require('../assets/icons/star.png')} style={{ width:16, height: 16, marginRight: 6}} resizeMode="contain" tintColor={theme.colors.primary}/>
                            <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600' }}>
                                {movie.rating.toFixed(1) || 'N/A'}
                            </Text>
                    </View> 
                    ) : null}   
                    {movie.platforms ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems:'flex-start', justifyContent:'flex-start', flex:1, marginBottom:16 }}>
                        {movie.platforms.map((platform, index) => (
                            <View key={index} style={{
                                flexDirection: 'row',
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                borderRadius: 8,
                                marginRight: 8,
                                marginBottom: 8,
                                backgroundColor: theme.colors.surface,
                                minWidth: 70,
                                alignItems: 'center',
                            }}
                            >   
                            <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600' }}>
                                {platform}
                            </Text>
                            </View>
                        ))}
                    </View>
                    ) : null}
                </View>


                <View>
                    <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                        Synopsis
                    </Text>
                    <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 22, opacity: 0.8 }}>
                        {movie.description || 'No hay descripción disponible.'}
                    </Text>
                </View>
            </View>
        </ScrollView>
    </View>
  );
}
