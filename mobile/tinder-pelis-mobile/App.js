import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './AuthContext';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import { theme } from './theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}

function MainNavigator() {
  const { state } = useAuth();

  return (
    <Stack.Navigator>
      {state.isLoading ? (
        // simple loading placeholder
        <Stack.Screen name="Loading" component={() => null} options={{ headerShown: false }} />
      ) : !state.userToken ? (
        // Auth flow
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log in' }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create account' }} />
        </>
      ) : (
        // App
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}