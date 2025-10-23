import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
} from 'react-native';
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
  const { signIn, state } = useAuth();

  async function onLogin() {
    setError(null);
    try {
      await signIn(email, password);
      // App.js handles navigation with formPending
    } catch (e) {
      setError(String(e?.msg || 'Could not log in. Please try again.'));
    }
  }

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 60 : 80;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignSelf: 'center', alignItems: 'center', marginBottom: '6%', width: '90%' }}>
            <Text variant="headlineLarge" style={{ textAlign: 'center', color: theme.colors.text, fontWeight: '700' }}>
              Welcome Back!
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.text, marginTop: 8, textAlign: 'center' }}>
              Complete these details to proceed.
            </Text>
          </View>

          <View style={{ gap: '3%', paddingHorizontal: 8 }}>
            <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput label="Password" value={password} onChangeText={setPassword} password={true} />
            <View style={{ height: 32, alignContent: 'center' }}>
              {error ? <HelperText style={{ fontSize: 16, fontWeight: '700' }} type="error">{error}</HelperText> : null}
            </View>
          </View>

          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <GradientButton mode="contained" onPress={onLogin} style={{ width: btnWidth }}>
              Login
            </GradientButton>
          </View>

          <View style={{ width: '100%', alignItems: 'center', marginTop: '3%', backgroundColor: 'transparent' }}>
            <Text variant="bodyLarge" style={{ color: theme.colors.text, textAlign: 'center' }}>
              Don't have an account?
            </Text>
            <GradientButton
              mode="text"
              fullWidth
              onPress={() => navigation.navigate('SignUp')}
              style={{ width: btnWidth, marginTop: '-2%' }}
            >
              Register here
            </GradientButton>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  contentContainer: { flexGrow: 1, paddingTop: 128, justifyContent: 'flex-start' },
  textInput: { mode: 'outlined', borderRadius: 100 },
});
