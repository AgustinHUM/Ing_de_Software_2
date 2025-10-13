import React, { useState } from 'react';
import { Alert, View, StyleSheet, Dimensions } from 'react-native';
import { HelperText, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../AuthContext';
import GradientButton from '../components/GradientButton';
import TextInput from '../components/TextInput';
import ErrorOverlay from '../components/ErrorOverlay';

export default function LoginScreen({ navigation }) {
  const { width } = Dimensions.get('window');
  const theme = useTheme();
  const buttonMaxWidth = 420;
  const btnWidth = Math.min(width * 0.8, buttonMaxWidth);

  const [nombre, setNombre] = useState('');
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const { signUp, signIn } = useAuth();

  // Overlay de error genérico
  const [showGenericError, setShowGenericError] = useState(false);
  const isGenericBackendError = (err) => {
    const msg = (err?.message || '').toLowerCase();
    return (
      msg.startsWith('http ') ||
      msg.includes('timeout') ||
      msg.includes('no response') ||
      msg === 'request error'
    );
  };

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
      setError("The passwords don't match.");
      return;
    }

    try {
      await signUp(email, nombre, password);
      Alert.alert("Éxito", "Usuario creado con éxito", [
        { text: "OK", onPress: async () => { await signIn(email, password); } }
      ]);
    } catch (e) {
      if (isGenericBackendError(e)) {
        setShowGenericError(true);       // se oculta a los 5s
      } else {
        setError(String(e?.message || 'An error occurred.'));
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Overlay (no bloquea teclado si en el componente tiene pointerEvents="none") */}
      <ErrorOverlay
        visible={showGenericError}
        onHide={() => setShowGenericError(false)}
      />

      <View style={{ alignSelf: 'center', alignItems: 'center', marginBottom: '10%', width: '70%' }}>
        <Text variant="headlineLarge" style={{ textAlign: 'center', color: theme.colors.text, fontWeight: '700' }}>
          Welcome to 
          <Text style={{ color: theme.colors.text, fontWeight: '700' }}> Movie</Text>
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Mingle</Text>!
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.text, marginTop: 8, textAlign: 'center' }}>
          To begin we ask you fill out some information.
        </Text>
      </View>

      <View style={{ gap: '1%'}}>
        <TextInput label="Full Name" value={nombre} onChangeText={setNombre} />
        <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput label="Password" value={password} onChangeText={handlePasswordChange} password={true} />
        <TextInput label="Confirm Password" value={confirmPassword} onChangeText={handleConfirmPasswordChange} password={true} />
        
      </View>

      <View style={{height:32,alignContent:'center'}}>
        {error ? <HelperText style={{fontSize:16,fontWeight:'700'}} type="error">{error}</HelperText> : null}
      </View>

      <GradientButton mode="contained" onPress={onSignIn} style={{ marginTop: 12 }}>
        Register
      </GradientButton>

      <View style={{ width: '100%', alignItems: 'center', marginTop: '10%', backgroundColor: 'transparent' }}>
        <Text variant="bodyLarge" style={{ color: theme.colors.text, textAlign: 'center' }}>
          Already Registered?
        </Text>
        <GradientButton
          mode="text"
          fullWidth
          onPress={() => navigation.navigate('Login')}
          style={{ width: btnWidth, marginTop: '-2%'}}
        >
          Login here
        </GradientButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'top', paddingTop: '15%' },
  textInput: { mode: 'outlined', borderRadius: 100 },
});
