import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import {mixColors} from '../theme'

export default function GradientButton({
  children,
  onPress,
  loading = false,
  disabled = false,
  style,
  mode = 'contained', // 'contained' | 'outlined' | 'text'
  borderWidth = 3,
  fullWidth = false,
}) {
  const theme = useTheme();

  // Lo pide al theme pero por si falla los redefino
  const start = theme.colors?.primary ?? 'rgba(255, 138, 0, 1)';
  const end = theme.colors?.secondary ?? 'rgba(252, 210, 94, 1)';
  const text = theme.colors?.text ?? '#fff';
  const borderColor = mixColors(start,end) //Un tono en el medio para los colores fijos
  const disabledOpacity = 0.6;

  const buttonHeight = (theme.sizes && theme.sizes.buttonHeight) || 52;
  const paddingH = (theme.tokens && theme.tokens.spacing && theme.tokens.spacing.m) ?? 18;
  const fontSize = (theme.tokens && theme.tokens.typography && theme.tokens.typography.buttonSize) ?? 16;
  const fontWeight = (theme.tokens && theme.tokens.typography && theme.tokens.typography.buttonWeight) ?? '600';

  const borderRadius = Math.round(buttonHeight / 2);
  const disabledStyle = disabled ? { opacity: disabledOpacity } : null;
  const wrapperWidthStyle = fullWidth ? { width: '100%' } : {};

  const Content = ({ color }) =>
    loading ? (
      <ActivityIndicator color={color} />
    ) : (
      <Text style={[styles.text, { color, fontSize, fontWeight }]} numberOfLines={1}>
        {children}
      </Text>
    );

  // Variante con fondo en degradé
  if (mode === 'contained') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || loading}
        style={[wrapperWidthStyle, style]}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[start, end]}
          start={[0, 0]}
          end={[1, 0]}
          style={[
            styles.gradient,
            {
              borderRadius,
              minHeight: buttonHeight,
              paddingHorizontal: paddingH,
            },
            disabledStyle,
          ]}
        >
          <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: buttonHeight }}>
            <Content color={text} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Variante solo borde
  if (mode === 'outlined') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          wrapperWidthStyle,
          style,
          {
            borderRadius,
            borderWidth,
            borderColor,
            backgroundColor: 'transparent',
            minHeight: buttonHeight,
            paddingHorizontal: paddingH,
            alignItems: 'center',
            justifyContent: 'center',
          },
          disabledStyle,
        ]}
        accessibilityRole="button"
      >
        <Content color={borderColor} />
      </TouchableOpacity>
    );
  }

  // Variante solo texto
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={[wrapperWidthStyle, style, { paddingHorizontal: paddingH, minHeight: buttonHeight, justifyContent: 'center' }]}
      accessibilityRole="button"
    >
      {loading ? <ActivityIndicator color={borderColor} /> : <Text style={[styles.text, { color: borderColor, fontSize, fontWeight }]}>{children}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    includeFontPadding: false,
    textAlign: 'center',
  },
});
