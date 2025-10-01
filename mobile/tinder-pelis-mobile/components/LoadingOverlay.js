import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

export default function LoadingOverlay({ visible = false, width = undefined, height = undefined, background = 'rgba(0,0,0,0.5)'}) {
  const theme = useTheme();
  const styles = StyleSheet.create({
  container: [
    {...StyleSheet.absoluteFillObject},
    width ? {width:width} : {} ,
    height ? {height:height} : {} ,
    {zIndex: 999,
    elevation: 999,}
  ],
  backdrop: [
    {...StyleSheet.absoluteFillObject},
    width ? {width:width} : {} ,
    height ? {height:height} : {} ,
  ],
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
  },
  });
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="auto">
      <View style={[styles.backdrop, { backgroundColor: background }]} />
      <View style={styles.center}>
        <ActivityIndicator animating size="large" />
        <Text style={[styles.text, { color: theme.colors.text, marginTop: 12 }]}>Loading…</Text>
      </View>
    </View>
  );


}

