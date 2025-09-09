import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './AuthContext';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import { makeTheme } from './theme';
import AppBar from './components/Appbar';
import ProfileScreen from './screens/Profile';
import FriendsScreen from './screens/Friends';
import SearchScreen from './screens/Search';
import FavouritesScreen from './screens/Favourites';

/*
const theme=makeTheme({
  primary:'rgba(0,0,0,1)',secondary:'rgba(0,0,0,1)',
  background:'rgba(0,0,0,1)',surface:'rgba(0,0,0,1)',
  accent:'rgba(0,0,0,1)',text:'rgba(0,0,0,1)'
});
  
 const theme=makeTheme({
  background:'rgba(1, 33, 56, 1)',surface:'rgba(38, 4, 119, 1)',
  accent:'rgba(2, 84, 109, 1)',text:'rgba(249, 248, 248, 1)'
}); */

const theme = makeTheme();
const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useRef(null);
  const [currentRoute, setCurrentRoute] = useState('Home'); // track for AppBar visibility & highlight

  return (
    <>
      <StatusBar style="light" />
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer
            theme={theme}
            ref={navigationRef}
            onReady={() => {
              try {
                const r = navigationRef.current?.getCurrentRoute?.();
                if (r?.name) setCurrentRoute(r.name);
              } catch (e) {
                console.warn('nav ready error', e);
              }
            }}
            onStateChange={() => {
              try {
                const r = navigationRef.current?.getCurrentRoute?.();
                if (r?.name) setCurrentRoute(r.name);
              } catch (e) {
                console.warn('nav state change error', e);
              }
            }}
          >
            <MainNavigator />
            <AppBar currentRouteName={currentRoute} navigationRef={navigationRef} />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </>
  );
}

function MainNavigator() {
  const { state } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        animation:'none',
        headerTintColor: theme.colors.text,
        headerStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {state.isLoading ? (
        <Stack.Screen name="Loading" component={() => null} options={{ headerShown: false }} />
      ) : !state.userToken ? (
        <>
          <Stack.Screen name="Inicio" component={WelcomeScreen} options={{ headerShown: false,animation:'fade_from_bottom' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Inicio de sesión',animation:'fade_from_bottom' }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Registro',animation:'fade_from_bottom' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Friends" component={FriendsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Favourites" component={FavouritesScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}
