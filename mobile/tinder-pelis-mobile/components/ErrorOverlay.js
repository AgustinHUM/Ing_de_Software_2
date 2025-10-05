// components/ErrorOverlay.js
import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function ErrorOverlay({
  visible = false,
  message = 'Ups, something went wrong.\nPlease try again.',
  onHide,
  autoHideMs = 5000,
  width = undefined,
  height = undefined,
  background = 'rgba(0,0,0,0.5)',

  iconSize = 88,
  fontSize = 22,
  fontWeight = '800',
  letterSpacing = 0.3,
}) {
  const theme = useTheme();

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onHide?.(), autoHideMs);
    return () => clearTimeout(t);
  }, [visible, autoHideMs, onHide]);

  if (!visible) return null;

  const styles = StyleSheet.create({
    container: [
      { ...StyleSheet.absoluteFillObject, zIndex: 1000, elevation: 1000 },
      width ? { width } : {},
      height ? { height } : {},
    ],
    backdrop: [
      { ...StyleSheet.absoluteFillObject },
      width ? { width } : {},
      height ? { height } : {},
    ],
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    text: {
      textAlign: 'center',
      color: theme.colors.text,
      marginTop: 14,
      fontSize,
      fontWeight,
      letterSpacing,
      lineHeight: Math.round(fontSize * 1.25),
    },
  });

  return (
    <View style={styles.container} pointerEvents="auto">
      <View style={[styles.backdrop, { backgroundColor: background }]} />
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={iconSize}
          color={theme.colors.primary}
        />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}
