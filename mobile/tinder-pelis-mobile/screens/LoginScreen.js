import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { HelperText, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../AuthContext';
import GradientButton from '../components/GradientButton';
import TextInput from '../components/TextInput';

export default function LoginScreen({ navigation }) {
  const { width } = Dimensions.get('window');
  
  const theme = useTheme();
  const spacingL = theme.tokens?.spacing?.l ?? 24;
  const buttonMaxWidth = 420;
  const btnWidth = Math.min(width * 0.8, buttonMaxWidth);


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { signIn } = useAuth();

  async function onLogin() {
    setError(null);
    try {
      await signIn(email, password);
      // No navegamos manualmente: el stack global redirige según primer login
    } catch (e) {
      Alert.alert('Error', String(e?.message || 'No se pudo iniciar sesión'));
    }
  }

  // Navegación automática según primer login eliminada, ahora se maneja directo en onLogin

  return (
    <View style={styles.container}>
      <View style={{alignSelf:'center', alignItems: 'center', marginBottom: '10%', width:'90%'}}>
            <Text variant="headlineLarge" style={{ textAlign: 'center', color: theme.colors.text, fontWeight: '700' }}>
              Bienvenido de vuelta!
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.text, marginTop: 8, textAlign: 'center' }}>
              Completa tus datos para avanzar.
            </Text>
      </View>
      <View style={{flex:0.4,gap:'3%'}}>
        <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput label="Contraseña" value={password} onChangeText={setPassword} password={true} />
        <View style={{height:32,alignContent:'center'}}>
          {error ? <HelperText style={{fontSize:16,fontWeight:'700'}} type="error">{error}</HelperText> : null}
        </View>
      </View>
  <GradientButton mode="contained" onPress={onLogin}>
        Iniciar sesión
      </GradientButton>
      <View style={{ width: '100%', alignItems: 'center', marginTop: '3%',backgroundColor:'transparent' }}>
        <Text variant="bodyLarge" style={{ color: theme.colors.text, textAlign: 'center' }}>
        ¿No tenés una cuenta?
        </Text>
        <GradientButton
                mode="text"
                fullWidth
                onPress={() => navigation.navigate('SignUp')}
                style={{ width: btnWidth, marginTop: '-2%'}}
              >
                Registrate aquí
        </GradientButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, padding: 16, justifyContent: 'top' , paddingTop:'25%',gap:'5%'},
  textInput: {mode:'outlined', borderRadius:100}
});