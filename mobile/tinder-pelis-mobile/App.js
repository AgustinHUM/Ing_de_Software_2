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

/*
const theme=makeTheme({
  primary:'rgba(0,0,0,1)',secondary:'rgba(0,0,0,1)',
  background:'rgba(0,0,0,1)',surface:'rgba(0,0,0,1)',
  accent:'rgba(0,0,0,1)',text:'rgba(0,0,0,1)'
});
  */
const theme = makeTheme();
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
    <Stack.Navigator screenOptions={{headerTintColor:theme.colors.text, headerStyle:{backgroundColor:theme.colors.background} }}>
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