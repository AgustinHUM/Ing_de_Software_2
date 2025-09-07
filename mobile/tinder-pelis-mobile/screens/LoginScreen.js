import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { useAuth } from '../AuthContext';
import GradientButton from '../components/GradientButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { signIn } = useAuth();

  const onSignIn = async () => {
    setError(null);
    try {
      await signIn(email, password);
    } catch (e) {
      setError('Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <GradientButton mode="contained" onPress={onSignIn} style={{ marginTop: 12 }}>
        Iniciar sesión
      </GradientButton>

      <GradientButton mode='outlined' onPress={() => navigation.navigate('SignUp')} style={{ marginTop: 8 }}>
        ¿No tiene cuenta? Registrate aquí
      </GradientButton>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, justifyContent: 'center' } });