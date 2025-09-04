// components/GradientButton.js
import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

export default function GradientButton({
  children,
  onPress,
  loading = false,
  disabled = false,
  style,
  mode = 'contained', // 'contained' | 'outlined' | 'text'
  borderWidth = 2,
}) {
  const paperTheme = useTheme();
  const start = paperTheme.colors.gradientStart || '#ff8a00';
  const end = paperTheme.colors.gradientEnd || '#ffb347';
  const radius = 100;
  const onPrimary = paperTheme.colors.onPrimary || '#fff';
  const surface = paperTheme.colors.surface || 'transparent';

  // Text color for outlined/text modes: use gradient start by default (or primary)
  const outlineTextColor = start;

  // disabled appearance: use lower opacity
  const disabledStyle = disabled ? { opacity: 0.6 } : null;

  // Contained mode: gradient background
  if (mode === 'contained') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || loading}
        style={style}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[start, end]}
          start={[0, 0]}
          end={[1, 0]}
          style={[styles.gradient, { borderRadius: radius }, disabledStyle]}
        >
          {loading ? (
            <ActivityIndicator color={onPrimary} />
          ) : (
            <Text style={[styles.text, { color: onPrimary, fontWeight: paperTheme.typography?.buttonWeight || '600' }]}>
              {children}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Outlined mode: gradient border, inner view with surface (or transparent)
  if (mode === 'outlined') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || loading}
        style={style}
        accessibilityRole="button"
      >
        {/* Outer gradient acts as the border */}
        <LinearGradient
          colors={[start, end]}
          start={[0, 0]}
          end={[1, 0]}
          style={[
            {
              borderRadius: radius,
              padding: borderWidth, // thickness of the gradient border
            },
            disabledStyle,
          ]}
        >
          {/* Inner container is the button surface */}
          <View style={[styles.inner, { borderRadius: Math.max(0, radius - borderWidth), backgroundColor: surface }]}>
            {loading ? (
              <ActivityIndicator color={outlineTextColor} />
            ) : (
              <Text style={[styles.text, { color: outlineTextColor, fontWeight: paperTheme.typography?.buttonWeight || '600' }]}>
                {children}
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Text mode: no gradient background, plain tappable text (we still use gradient color for text if desired)
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={style}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={[styles.text, { color: outlineTextColor, fontWeight: paperTheme.typography?.buttonWeight || '600' }]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
  },
});
