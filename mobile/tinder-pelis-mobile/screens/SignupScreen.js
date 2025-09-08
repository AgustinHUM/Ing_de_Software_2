import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { HelperText, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../AuthContext';
import GradientButton from '../components/GradientButton';
import TextInput from '../components/TextInput';

export default function LoginScreen({ navigation }) {
  const { width } = Dimensions.get('window');

  const theme = useTheme();
  const spacingS = theme.tokens?.spacing?.s ?? 16;
  const spacingL = theme.tokens?.spacing?.l ?? 24;
  const buttonMaxWidth = 420;
  const btnWidth = Math.min(width * 0.8, buttonMaxWidth);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const { signUp } = useAuth();

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (confirmPassword) {
      if (text !== confirmPassword) setError('Las contraseñas no coinciden');
      else setError(null);
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (password) {
      if (text !== password) setError('Las contraseñas no coinciden.');
      else setError(null);
    }
  };

  const onSignIn = async () => {
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await signUp(email, nombre, password);
    } catch (e) {
      setError('Ocurrió un error.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ alignSelf: 'center', alignItems: 'center', marginBottom: '10%', width: '70%' }}>
        <Text variant="headlineLarge" style={{ textAlign: 'center', color: theme.colors.text, fontWeight: '700' }}>
          Bienvenido a 
              <Text style={{ color: theme.colors.text, fontWeight: '700' }}> Nombre</Text>
              <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>App</Text>!
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.text, marginTop: 8, textAlign: 'center' }}>
          Para comenzar te pedimos que completes tus datos.
        </Text>
      </View>
      <View style={{ gap: '3%'}}>
        <TextInput label="Nombre completo" value={nombre} onChangeText={setNombre} />
        <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput label="Contraseña" value={password} onChangeText={handlePasswordChange} password={true} />
        <TextInput label="Confirmar contraseña" value={confirmPassword} onChangeText={handleConfirmPasswordChange} password={true} />
        <View style={{height:32,alignContent:'center'}}>
          {error ? <HelperText style={{fontSize:16,fontWeight:'700'}} type="error">{error}</HelperText> : null}
        </View>
      </View>
      <GradientButton mode="contained" onPress={onSignIn} style={{ marginTop: 12 }}>
        Registrarme
      </GradientButton>
      <View style={{ width: '100%', alignItems: 'center', marginTop: spacingL, backgroundColor: 'transparent' }}>
        <Text variant="bodyLarge" style={{ color: theme.colors.text, textAlign: 'center' }}>
          ¿Ya estás registrado?
        </Text>
        <GradientButton
          mode="text"
          fullWidth
          onPress={() => navigation.navigate('Login')}
          style={{ width: btnWidth, marginTop: '-2%'}}
        >
          Iniciar sesión
        </GradientButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'top', paddingTop: '10%' },
  textInput: { mode: 'outlined', borderRadius: 100 },
});
