import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import GradientButton from '../components/GradientButton';
import { useAuth } from '../AuthContext';

export default function WelcomeScreen({ navigation }) {
  const { guestSignIn } = useAuth();

  return (
    <View style={styles.container}>
      <Text variant='titleLarge' style={{ marginBottom: 0 }}>NombreApp</Text>
      <Text variant='bodyMedium' style={{ marginBottom: 24 }}>Bienvenido a *NombreApp*!</Text>

      <GradientButton mode="contained" onPress={() => navigation.navigate('Login')} style={{ marginBottom: 8, width:200}}>
        Iniciar sesión
      </GradientButton>

      <GradientButton mode="outlined" onPress={() => navigation.navigate('SignUp')} style={{ marginBottom: 8, width:200 }}>
        Registrarse
      </GradientButton>

      <GradientButton mode="text" onPress={() => guestSignIn()}>
        Continuar como invitado
      </GradientButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
});