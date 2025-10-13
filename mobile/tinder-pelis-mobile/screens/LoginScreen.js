import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { signIn, state } = useAuth();

  // Overlay de error genérico (timeout, 5xx, sin respuesta…)
  const [showGenericError, setShowGenericError] = useState(false);
  const isGenericBackendError = (err) => {
    const msg = (err?.message || '').toLowerCase();
    return (
      msg.startsWith('http ') ||    // "HTTP 500", etc.
      msg.includes('timeout') ||    // "Request timeout"
      msg.includes('no response') ||// "No response from server"
      msg === 'request error'
    );
  };

  async function onLogin() {
    setError(null);
    try {
      await signIn(email, password);
      // App.js redirige según formPending
    } catch (e) {
      if (isGenericBackendError(e)) {
        setShowGenericError(true);       // se oculta solo a los 5s
      } else {
        setError(String(e?.message || 'Could not log in. Please try again.'));
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* Overlay (no bloquea teclado si en el componente tiene pointerEvents="none") */}
      <ErrorOverlay
        visible={showGenericError}
        onHide={() => setShowGenericError(false)}
      />

      <View style={{alignSelf:'center', alignItems: 'center', marginBottom: '10%', width:'90%'}}>
        <Text variant="headlineLarge" style={{ textAlign: 'center', color: theme.colors.text, fontWeight: '700' }}>
          Welcome Back!
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.text, marginTop: 8, textAlign: 'center' }}>
          Complete these details to proceed.
        </Text>
      </View>

      <View style={{flex:0.4,gap:'3%'}}>
        <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput label="Password" value={password} onChangeText={setPassword} password={true} />
        <View style={{height:32,alignContent:'center'}}>
          {error ? <HelperText style={{fontSize:16,fontWeight:'700'}} type="error">{error}</HelperText> : null}
        </View>
      </View>

      <GradientButton mode="contained" onPress={onLogin}>
        Login
      </GradientButton>

      <View style={{ width: '100%', alignItems: 'center', marginTop: '3%', backgroundColor:'transparent' }}>
        <Text variant="bodyLarge" style={{ color: theme.colors.text, textAlign: 'center' }}>
          ¿Don't have an account?
        </Text>
        <GradientButton
          mode="text"
          fullWidth
          onPress={() => navigation.navigate('SignUp')}
          style={{ width: btnWidth, marginTop: '-2%'}}
        >
          Register here
        </GradientButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'top', paddingTop:'25%', gap:'5%' },
  textInput: { mode:'outlined', borderRadius:100 }
});
