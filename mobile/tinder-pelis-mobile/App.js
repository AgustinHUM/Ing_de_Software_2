import { StatusBar } from 'expo-status-bar';
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
    <>
    <StatusBar style="light"/>
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer theme={theme}>
          <MainNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
    </>
  );
}

function MainNavigator() {
  const { state } = useAuth();

  return (
    <Stack.Navigator screenOptions={{headerTintColor:theme.colors.onPrimary, headerStyle:{backgroundColor:theme.colors.surface} }}>
      {state.isLoading ? (
        // placeholder de carga
        <Stack.Screen name="Loading" component={() => null} options={{ headerShown: false }} />
      ) : !state.userToken ? (
        // flow de autenticacion
        <>
          <Stack.Screen name="Inicio" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Inicio de sesión'}} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Registro' }} />
        </>
      ) : (
        // App
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}