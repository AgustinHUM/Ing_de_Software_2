import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { setAlpha } from '../theme';

/**
 * LoadingBox
 *
 * - Uses react-native-paper theme (useTheme)
 * - Renders a Surface with backgroundColor = theme.colors.surface
 * - Shows a soft, diagonal glistening shimmer implemented with expo-linear-gradient
 * - Accepts common View sizing/styling via `style` and spreads remaining props
 *
 * Additional optional props:
 *  - shimmerWidth (fraction of diagonal, default 0.35)
 *  - speed (ms for one shimmer pass, default 1400)
 *  - shimmerOpacity (opacity of the shimmer band, default 0.18)
 *
 * Example:
 * <LoadingBox style={{ width: 200, height: 120, borderRadius: 8 }} />
 */
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

  const diagonal = Math.sqrt(layout.width * layout.width + layout.height * layout.height) || 0;
  const stripWidth = Math.max(20, diagonal * shimmerWidth);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-diagonal - stripWidth, diagonal + stripWidth],
  });

  const animatedStyle = {
    position: 'absolute',
    left: -stripWidth,
    top: -diagonal * 0.25,
    width: stripWidth * 2,
    height: diagonal * 1.5 || 0,
    transform: [{ translateX }, { rotate: '45deg' }],
    opacity: shimmerOpacity,
  };

  return (
    <Surface
      ref={ref}
      onLayout={onLayout}
      style={[styles.surface, { backgroundColor: theme.colors.surface }, style]}
      {...rest}
    >
      {children}

      {layout.width > 0 && layout.height > 0 && (
        <Animated.View pointerEvents="none" style={animatedStyle}>
          <LinearGradient

            colors={[ 'transparent', setAlpha(theme.colors.primary,0.5), 'transparent' ]}
            locations={[0.25, 0.5, 0.75]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </Surface>
  );
});

const styles = StyleSheet.create({
  surface: {
    overflow: 'hidden',
  },
});

export default LoadingBox;

