import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export default function SpinningIcon({ 
  Icon, 
  size = 100, 
  color, 
  duration = 2000, 
  style,
  iconName, // For vector icons (e.g., MaterialCommunityIcons)
  isSvg = true // Set to false for vector icons
}) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim, duration]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={[{ transform: [{ rotate: spin }] }, style]}>
      {isSvg ? (
        <Icon width={size} height={size} fill={color} />
      ) : (
        <Icon name={iconName} size={size} color={color} />
      )}
    </Animated.View>
  );
}
