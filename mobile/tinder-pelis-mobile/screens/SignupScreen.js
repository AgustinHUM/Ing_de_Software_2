import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { HelperText, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../AuthContext';
import GradientButton from '../components/GradientButton';
import TextInput from '../components/TextInput';

export default function LoginScreen({ navigation }) {
  const { width } = Dimensions.get('window');

  const theme = useTheme();
  const buttonMaxWidth = 420;
  const btnWidth = Math.min(width * 0.8, buttonMaxWidth);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [passwordNotStrong, setPasswordNotStrong] = useState(false);
  const { signUp, signIn } = useAuth();

  // password strength check
  const isStrongPassword = (p = '') => {
    if (!p || p.length < 8) return false;
    if (!/[0-9]/.test(p)) return false;
    // special characters - include common punctuation
    if (!/[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]/.test(p)) return false;
    if (!/[A-Z]/.test(p)) return false;
    if (!/[a-z]/.test(p)) return false;
    return true;
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    // clear passwordNotStrong proactively if user types a strong password
    if (passwordNotStrong && isStrongPassword(text)) setPasswordNotStrong(false);

    if (confirmPassword) {
      if (text !== confirmPassword) setError("The passwords don't match.");
      else setError(null);
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (password) {
      if (text !== password) setError("The passwords don't match.");
      else setError(null);
    }
  };

  const onSignIn = async () => {
    setError(null);

    if (password !== confirmPassword) {
      setError("The passwords don't match.");
      return;
    }

    // check password strength
    const strong = isStrongPassword(password);
    if (!strong) {
      setPasswordNotStrong(true);
      setError('Password is not strong enough.');
      return;
    }
    setPasswordNotStrong(false);

    try {
      const res = await signUp(email, nombre, password);

      if (res && typeof res === 'object' && typeof res.status === 'number') {
        if (res.status !== 200 && res.status !== 204 && res.status !== 201) {
          try {
            const body = await (typeof res.json === 'function' ? res.json() : Promise.resolve(res));
            const msg = body?.msg ?? `Signup failed (status ${res.status})`;
            console.log('Signup error body:', body);
            setError(String(msg));
            return;
          } catch (parseErr) {
            setError(`Signup failed (status ${res.status})`);
            console.log('Error parsing signup error response:', parseErr);
            return;
          }
        }
      }

      Alert.alert('Success', 'User created successfully!', [
        { text: 'OK', onPress: async () => { await signIn(email, password); } }
      ]);
    } catch (e) {
      console.log('Signup error:', e);
      if (e?.message && e.message.includes('HTTP 500')) {
        setError('Network error. Please try again.');
        return;
      }
      setError(String(e?.message || 'An error occurred.'));
    }
  };

  // offset to lift the view — adjust if you have a header/navigation bar
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 60 : 80;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[styles.contentContainer, { paddingBottom: 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignSelf: 'center', alignItems: 'center', marginBottom: '6%', width: '70%' }}>
            <Text variant="headlineLarge" style={{ textAlign: 'center', color: theme.colors.text, fontWeight: '700' }}>
              Welcome to
              <Text style={{ color: theme.colors.text, fontWeight: '700' }}> Movie</Text>
              <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Mingle</Text>!
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.text, marginTop: 8, textAlign: 'center' }}>
              To begin we ask you fill out some information.
            </Text>
          </View>

          <View style={{ gap: '1%', paddingHorizontal: 8 }}>
            <TextInput label="Full Name" value={nombre} onChangeText={setNombre} />
            <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput label="Password" value={password} onChangeText={handlePasswordChange} password={true} />
            <Text
              style={{
                color: passwordNotStrong ? theme.colors.error : theme.colors.primary,
                fontSize: 12,
                opacity: 0.9,
                fontWeight: '400',
                textAlign: 'left',
                marginLeft: 16,
                marginBottom: 8, lineHeight: 18
              }}
            >
              • Minimum 8 characters{'\n'}• At least 1 number & 1 special character{'\n'}• At least 1 upper & 1 lowercase letter
            </Text>

            <TextInput label="Confirm Password" value={confirmPassword} onChangeText={handleConfirmPasswordChange} password={true} />
          </View>

          <View style={{ alignContent: 'center', paddingLeft: 16, marginTop: 6 }}>
            <HelperText style={{ fontSize: 14, fontWeight: '700', textAlign: 'center' }} type="error">
              <Text style={{ color: theme.colors.error }}>{!!error ? error : ''}</Text>
            </HelperText>
          </View>

          <View style={{ alignItems: 'center' }}>
            <GradientButton mode="contained" onPress={onSignIn} style={{ width: btnWidth, marginTop: 8 }} disabled={!email || !password || !nombre || !confirmPassword }>
              Sign up
            </GradientButton>
          </View>

          <View style={{ width: '100%', alignItems: 'center', marginTop: '5%', backgroundColor: 'transparent' }}>
            <Text variant="bodyLarge" style={{ color: theme.colors.text, textAlign: 'center' }}>
              Already Registered?
            </Text>
            <GradientButton
              mode="text"
              fullWidth
              onPress={() => navigation.navigate('Login')}
              style={{ width: btnWidth, marginTop: '-2%' }}
            >
              Login here
            </GradientButton>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  contentContainer: { flexGrow: 1, padding: 16, justifyContent: 'flex-start', paddingTop: 64 },
  textInput: { mode: 'outlined', borderRadius: 100 },
});
