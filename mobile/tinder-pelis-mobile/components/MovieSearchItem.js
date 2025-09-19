import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function MovieSearchItem({ movie, onPress }) {
  const theme = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.surface }]} 
      onPress={() => onPress && onPress(movie)}
      activeOpacity={0.7}
    >
      <View style={styles.posterContainer}>
        <Image 
          source={{ uri: movie.movie_poster_url || 'https://via.placeholder.com/150x200' }} 
          style={styles.poster}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
          {movie.movie_name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    marginBottom: 16,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  posterContainer: {
    width: '100%',
    height: 160,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    padding: 8,
    minHeight: 50,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 18,
  },
});