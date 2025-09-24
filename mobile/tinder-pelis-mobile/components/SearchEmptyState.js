import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function SearchEmptyState() {
  const theme = useTheme();
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.delay(800),
      ]).start(() => bounce());
    };
    bounce();
  }, [bounceAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, { transform: [{ translateY: bounceAnim }] }]}>
        <View style={styles.imageWrapper}>
          <Image 
            source={require('../assets/movie.png')} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          ¡Tu próxima película favorita te está esperando! 
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
          Encontrá películas increíbles para ver con tus amigos  
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop:96
  },
  imageContainer: {
    marginBottom: 40,
  },
  imageWrapper: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    width: 140,
    height: 140,
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
