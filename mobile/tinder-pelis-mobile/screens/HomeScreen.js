import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '../AuthContext';
import GradientButton from '../components/GradientButton';

export default function HomeScreen() {
  const { signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Text variant='titleLarge' style={{color:'#fff'}}>Inicio (placeholder)</Text>
      <Text variant='bodyMedium' style={{color:'#fff'}}>Lorem ipsum lorem ipsum lorem ipsum.</Text>
      <GradientButton mode="outlined" onPress={() => signOut()} style={{ marginTop: 12 }}>
        Cerrar sesión
      </GradientButton>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, justifyContent: 'center' } });