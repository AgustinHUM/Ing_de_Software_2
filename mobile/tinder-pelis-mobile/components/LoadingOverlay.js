import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

export default function LoadingOverlay({ visible = false }) {
  const theme = useTheme();
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="auto">
      <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
      <View style={styles.center}>
        <ActivityIndicator animating size="large" />
        <Text style={[styles.text, { color: theme.colors.text, marginTop: 12 }]}>Loading…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
  },
});
