import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Easing, View } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { setAlpha } from '../theme';

const LoadingBox = forwardRef(({ style, children, shimmerWidth = 0.75, speed = 1400, shimmerOpacity = 0.18, ...rest }, ref) => {
  const theme = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const running = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: speed,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    );

    anim.setValue(0);
    running.start();
    return () => running.stop();
  }, [anim, speed]);

  function onLayout(e) {
    const { width, height } = e.nativeEvent.layout;
    if (width !== layout.width || height !== layout.height) setLayout({ width, height });
  }

  const flattened = StyleSheet.flatten(style) || {};
  const wrapperBorderRadius = flattened.borderRadius ?? flattened.borderTopLeftRadius ?? 0;

  const diagonal = Math.sqrt(layout.width * layout.width + layout.height * layout.height) || 0;

  // Make the shimmer *much* wider/longer to avoid seeing its rectangular edge.
  // Increase these multipliers if your boxes are extremely elongated.
  const SHIMMER_LENGTH_MULTIPLIER = 1.5; 
  const SHIMMER_HEIGHT_MULTIPLIER = 5.0; 

  const baseStrip = Math.max(20, diagonal * shimmerWidth);
  const stripWidth = baseStrip * SHIMMER_LENGTH_MULTIPLIER; // very long
  const shimmerHeight = Math.max(20, diagonal * SHIMMER_HEIGHT_MULTIPLIER);

  const left = -stripWidth * 0.5;
  const top = -(shimmerHeight - layout.height) / 2;

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-stripWidth * 1.5, stripWidth * 1.5],
  });

  const animatedStyle = {
    position: 'absolute',
    left,
    top,
    width: stripWidth * 2, // extra safety
    height: shimmerHeight || 0,
    transform: [{ translateX }, { rotate: '45deg' }],
    opacity: shimmerOpacity,
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.wrapper,
        {
          borderRadius: wrapperBorderRadius,
        },
      ]}
    >
      <Surface
        ref={ref}
        style={[styles.surface, { backgroundColor: theme.colors.surface }, style]}
        {...rest}
      >
        {children}

        {layout.width > 0 && layout.height > 0 && (
          <Animated.View pointerEvents="none" style={animatedStyle}>
            <LinearGradient
              colors={['transparent', setAlpha(theme.colors.primary, 0.5), 'transparent']}
              locations={[0.25, 0.5, 0.75]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
      </Surface>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden', 
  },
  surface: {
  },
});

export default LoadingBox;
