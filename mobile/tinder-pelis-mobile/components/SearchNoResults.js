import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function SearchNoResults({ query }) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          <Image 
            source={require('../assets/popcorn.png')} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          ¡Ay! Esa opcion no está disponible
        </Text>
        <Text style={[styles.subtitle, { color: '#FF6B35' }]}>
          Intenta con otra búsqueda
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  imageContainer: {
    marginBottom: 40,
  },
  imageWrapper: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  image: {
    width: 130,
    height: 130,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
});
