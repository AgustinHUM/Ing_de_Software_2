import React from 'react';
import { View, Image, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import { setAlpha } from '../theme';
import FilmDisplay from '../components/FilmDisplay';
import FilmDetail from '../components/FilmDetail';
import { useState } from 'react';


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
  const movie = route.params?.movie || fallbackMovie;
  const [showMore, setShowMore] = useState(false);
  const [showGenresModal, setShowGenresModal] = React.useState(false);
  const visible_genres = 3; 
  const VISIBLE_GENRES_COUNT = 3;

  return (
    <View style={{ flex: 1, flexDirection:'column'}}>
        <ScrollView
            style={{paddingTop:'15%', flex:0.75, padding:'3%', backgroundColor: 'transparent'}}
            contentContainerStyle={{ flexGrow: 1, }}
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
                </View>

                <View style={{paddingTop:16, flexDirection: 'row', flexWrap: 'wrap', justifyContent:'space-between', flex:1}}>
                    <FilmDisplay width={'50%'} key={movie.id} movie={movie} onPress={null} glow={true} />
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
                                movie.genres.slice(0, VISIBLE_GENRES_COUNT).map((genre, index) => (
                                    <View
                                        key={index}
                                        style={{
                                            backgroundColor: theme.colors.secondary,
                                            borderRadius: 999,
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            marginRight: 4,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                textAlign: 'center',
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

                            {movie.genres && movie.genres.length > VISIBLE_GENRES_COUNT && (
                                <TouchableOpacity
                                    onPress={() => setShowGenresModal(true)}
                                    activeOpacity={0.8}
                                    style={{
                                        backgroundColor: theme.colors.secondary,
                                        borderRadius: 999,
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        marginRight: 4,
                                        marginBottom: 8,
                                    }}
                                >
                                    <Text
                                        style={{
                                            textAlign: 'center',
                                            color: theme.colors.text,
                                            fontSize: 14,
                                            fontWeight: '600',
                                        }}
                                    >
                                        More...
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {movie.year ? (
                            <FilmDetail 
                                icon={<Feather name="calendar" size={16} color={theme.colors.text} />}
                                value={movie.year}
                            />
                        ) : null}
                        {movie.runtime ? (
                            <FilmDetail 
                                icon={<Octicons name="hourglass" size={16} color={theme.colors.text} />}
                                value={`${movie.runtime} min`}
                            />
                        ) : null}
                        {movie.director ? (
                            <FilmDetail 
                                icon={<Ionicons name="person-outline" size={16} color={theme.colors.text} />}
                                label="Director"
                                value={movie.director}
                            />
                        ) : null}
                        {movie.ageRating ? (
                            <FilmDetail 
                                icon={<Ionicons name="ticket-outline" size={16} color={theme.colors.text} />}
                                label="Rated"
                                value={movie.ageRating}
                            />
                        ) : null}
                    </View>
                </View>
                

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems:'flex-start', justifyContent:'space-between', flex:1, marginBottom:16 }}>
                    {movie.rating ? (
                        <FilmDetail
                            icon= {<MaterialIcons name='star-outline' size={16} color={theme.colors.primary} />}
                            value={movie.rating.toFixed(1)}
                            textStyle={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600', marginLeft: 6}}
                            containerStyle={{flexDirection: 'row',
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            marginRight: 8,
                            marginBottom: 8,
                            backgroundColor: theme.colors.surface,
                            alignItems: 'center'}}>
                        </FilmDetail>
                    ) : null}
                    
                    {movie.platforms ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'flex-start', flex: 1, marginBottom: 16 }}>
                            {movie.platforms.map((platform) => (
                                <FilmDetail
                                    key={platform}
                                    value={platform}
                                    textStyle={{ color: theme.colors.primary, fontSize: 14, fontWeight: '600', marginLeft: 0 }}
                                    containerStyle={{
                                        flexDirection: 'row',
                                        paddingVertical: 10,
                                        paddingHorizontal: 12,
                                        borderRadius: 8,
                                        marginRight: 8,
                                        marginBottom: 8,
                                        backgroundColor: theme.colors.surface,
                                        alignItems: 'center',
                                    }}
                                />
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

        <Modal
            visible={showGenresModal}
            animationType="slide"
            onRequestClose={() => setShowGenresModal(false)}
            transparent={false}
        >
            <View style={{ flex: 1, padding: 25, paddingVertical: Platform.OS === 'ios' ? 70 : 35, backgroundColor: theme.colors.background }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <Text variant="headlineSmall" style={{ color: theme.colors.text, fontWeight: 700 }}>All Genres</Text>
                    <TouchableOpacity onPress={() => setShowGenresModal(false)} style={{ padding: 8 }}>
                        <Text style={{ color: theme.colors.text }}>Close</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                    {movie.genres.map((genre, index) => (
                        <View
                            key={index}
                            style={{
                                backgroundColor: theme.colors.secondary,
                                borderRadius: 999,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                marginRight: 4,
                                marginBottom: 8,
                            }}
                        >
                            <Text
                                style={{
                                    textAlign: 'center',
                                    color: theme.colors.text,
                                    fontSize: 14,
                                    fontWeight: '600',
                                }}
                            >
                                {genre}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </Modal>
    </View>
  );
}
