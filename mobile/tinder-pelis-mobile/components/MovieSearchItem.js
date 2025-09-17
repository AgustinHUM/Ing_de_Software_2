import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Feather from '@expo/vector-icons/Feather';

export default function MovieSearchItem({ movie, onPress }) {
  const theme = useTheme();

  const getStreamingServiceColor = (service) => {
    const colors = {
      'Netflix': '#E50914',
      'Disney+': '#113CCF',
      'Prime Video': '#00A8E1',
      'HBO Max': '#8B5CF6',
      'Hulu': '#1CE783',
      'Paramount+': '#0064FF',
      'DirectTV': '#00A8E1'
    };
    return colors[service] || theme.colors.primary;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.surface }]} 
      onPress={() => onPress && onPress(movie)}
      activeOpacity={0.7}
    >
      <View style={styles.posterContainer}>
        <View style={styles.posterWrapper}>
          <Image 
            source={{ uri: movie.poster_url || 'https://via.placeholder.com/150x200' }} 
            style={styles.poster}
            resizeMode="cover"
          />
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
          {movie.movie_name}
        </Text>
        
        <View style={styles.detailsSection}>
          <View style={styles.detailsRow}>
            <Feather name="calendar" size={16} color="#FF6B35" />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {movie.movie_release}
            </Text>
          </View>
          
          <View style={styles.detailsRow}>
            <Feather name="link" size={16} color="#FF6B35" />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {movie.genre || 'Acción'}
            </Text>
          </View>
          
          <View style={styles.detailsRow}>
            <Feather name="clock" size={16} color="#FF6B35" />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {movie.movie_length} minutos
            </Text>
          </View>
        </View>
        
        {movie.streaming_service && (
          <View style={styles.streamingTag}>
            <Text style={[styles.streamingText, { 
              color: 'white',
              backgroundColor: getStreamingServiceColor(movie.streaming_service)
            }]}>
              {movie.streaming_service}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  posterContainer: {
    width: 90,
    height: 135,
    marginRight: 16,
  },
  posterWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 24,
  },
  detailsSection: {
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '500',
  },
  streamingTag: {
    marginTop: 4,
  },
  streamingText: {
    fontSize: 13,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
