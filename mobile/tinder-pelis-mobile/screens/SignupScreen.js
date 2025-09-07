import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useAuth } from '../AuthContext';
import GradientButton from '../components/GradientButton';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp } = useAuth();

  const onSignUp = async () => {
    await signUp(email, password);
  };

  return (
    <View style={styles.container}>
      <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <GradientButton mode="contained" onPress={onSignUp} style={{ marginTop: 12 }}>
        Registrarse
      </GradientButton>

      <GradientButton mode='outlined' onPress={() => navigation.navigate('Login')} style={{ marginTop: 8 }}>
        ¿Ya estás registrado? Iniciar sesión
      </GradientButton>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, justifyContent: 'center' } });