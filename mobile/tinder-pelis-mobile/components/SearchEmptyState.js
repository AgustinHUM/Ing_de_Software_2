import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useTheme } from 'react-native-paper';
import Movie from '../assets/movie.svg';

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
        <View style={{width:140,height:140, alignItems:'center',justifyContent:'center'}}>
        <View style={{width:100,height:70, alignItems:'center',justifyContent:'center', paddingBottom:40,
                     boxShadow: 
                      [{offsetX: 0,
                      offsetY: 0,
                      blurRadius: 50,
                      color:theme.colors.primary}],
                      borderRadius:999}}>
          <Movie width={140} height={140} color={theme.colors.primary} />
        </View>
        </View>
      </Animated.View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Your next favorite film is right around the corner! 
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
          Find amazing movies to watch with your friends and family
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
