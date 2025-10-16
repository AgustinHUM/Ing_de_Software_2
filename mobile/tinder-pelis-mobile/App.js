import React, { useRef, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, useTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './AuthContext';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import { makeTheme } from './theme';
import AppBar from './components/Appbar';
import ProfileScreen from './screens/Profile';

// import FriendsScreen from './screens/Friends';

import Groups from './screens/Groups';
import CreateGroup from './screens/CreateGroup';
import JoinGroup from './screens/JoinGroup';
import GroupCode from './screens/GroupCode';

import SearchScreen from './screens/Search';
import FavouritesScreen from './screens/Favourites';
import InitialFormScreen from './screens/InitialForm';
import GenresFormScreen from './screens/GenreForm';
import FilmDetailsScreen from './screens/FilmDetailsScreen';
import LoadingOverlay from './components/LoadingOverlay';
import StreamingServicesForm from './screens/StreamingServicesForm';
import CountriesForm from './screens/CountriesForm';
import DirectorsFormScreen from './screens/DirectorsForm';
import MoviesFormScreen from './screens/MoviesFormScreen';
import RateFilm from './screens/RateFilm';

const Stack = createNativeStackNavigator();

const THEME_STORAGE_KEY = 'APP_SELECTED_THEME';

// --- Mapeo de temas (sin cambios) ---
const TEMAS = {
  default: { primary: 'rgba(255, 138, 0, 1)', secondary: 'rgba(251, 195, 76, 1)',
    background: 'rgba(18, 8, 36, 1)', surface: 'rgba(33, 5, 65, 1)',
    accent:'rgba(50, 23, 68, 1)', text: 'rgba(255, 255, 255, 1)',
  },
  Light: {
    primary: 'rgba(25, 118, 210, 1)', secondary: 'rgba(144, 202, 249, 1)',
    background: 'rgba(255, 255, 255, 1)', surface: 'rgba(245, 245, 245, 1)',
    accent: 'rgba(90, 90, 90, 1)', text: 'rgba(0, 0, 0, 1)',
  },
  Dark: {background:'rgba(48, 48, 48, 1)',surface:'rgba(80, 79, 79, 1)',
    primary:'rgba(0, 0, 0, 1)',secondary:'rgba(44, 44, 44, 1)',
    accent:'rgba(192, 192, 192, 1)',text:'rgba(255, 255, 255, 1)'
  },
  Cold: {background:'rgba(1, 33, 56, 1)',surface:'rgba(81, 45, 167, 1)',
    primary:'rgba(60, 184, 233, 1)',secondary:'rgba(196, 210, 248, 1)',
    accent:'rgba(2, 84, 109, 1)',text:'rgba(231, 212, 248, 1)'
  },
  Warm: {background:'rgba(27, 1, 1, 1)',surface:'rgba(48, 4, 4, 1)',
    primary:'rgba(197, 8, 8, 1)',secondary:'rgba(206, 119, 19, 1)',
    accent:'rgba(207, 191, 44, 1)',text:'rgba(247, 167, 167, 1)'
  },
  Nature: {background:'rgba(5, 29, 2, 1)',surface:'rgba(12, 32, 2, 1)',
    primary:'rgba(90, 68, 11, 1)',secondary:'rgba(66, 38, 2, 1)',
    accent:'rgba(125, 243, 121, 1)',text:'rgba(98, 195, 62, 1)'
  },
  Barbie: {background:'rgba(170, 67, 153, 1)',surface:'rgba(83, 4, 64, 1)',
    primary:'rgba(240, 104, 234, 1)',secondary:'rgba(224, 12, 97, 1)',
    accent:'rgba(176, 37, 226, 1)',text:'rgba(239, 185, 231, 1)',disabled:'rgba(239, 185, 231, 1)'
  },
  TheBatman: {background:'rgba(0, 0, 0, 1)',surface:'rgba(42, 8, 8, 1)',
    primary:'rgba(164, 14, 14, 1)',secondary:'rgba(91, 3, 3, 1)',
    accent:'rgba(48, 28, 28, 1)',text:'rgba(215, 8, 8, 1)'
  },
  Matrix: {background:'rgba(0, 0, 0, 1)',surface:'rgba(17, 42, 8, 1)',
    primary:'rgba(51, 169, 19, 1)',secondary:'rgba(34, 66, 31, 1)',
    accent:'rgba(23, 180, 11, 1)',text:'rgba(110, 165, 104, 1)'
  },
  MrIncredible: {background:'rgba(184, 3, 3, 1)',surface:'rgba(255, 2, 2, 1)',
    primary:'rgba(251, 206, 4, 1)',secondary:'rgba(180, 171, 0, 1)',
    accent:'rgba(251, 230, 4, 1)',text:'rgba(44, 1, 1, 1)',placeholder:'rgba(0, 0, 0, 1)'
  },
  Frozone: {background:'rgba(255, 255, 255, 1)',surface:'rgba(17, 89, 119, 1)',
    primary:'rgba(4, 251, 247, 1)',secondary:'rgba(0, 53, 59, 1)',
    accent:'rgba(4, 251, 247, 1)',text:'rgba(0, 0, 0, 1)',placeholder:'rgba(255,255,255,1)'
  },
  Christmas:  {background:'rgba(255, 255, 255, 1)',surface:'rgba(177, 255, 181, 1)',
    primary:'rgba(187, 13, 4, 1)',secondary:'rgba(6, 188, 30, 1)',
    accent:'rgba(251, 4, 4, 1)',text:'rgba(255, 0, 0, 1)',placeholder:'rgba(255,255,255,1)'
  },
  Ghost:  {background:'rgba(228, 227, 227, 1)',surface:'rgba(130, 130, 130, 1)',
    primary:'rgba(0, 0, 0, 1)',secondary:'rgba(194, 194, 194, 1)',
    accent:'rgba(4, 4, 4, 1)',text:'rgba(101, 101, 101, 1)',placeholder:'rgba(255,255,255,1)'
  }
};
// -------------------------------------------------------------------

export default function App() {
  const navigationRef = useRef(null);
  const [currentRoute, setCurrentRoute] = useState('Home');

  // Estado de tema en App.js
  const [themeName, setThemeName] = useState('default');
  const [theme, setTheme] = useState(() => makeTheme(TEMAS.default));

  // Cargar tema guardado al iniciar la app
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && TEMAS[saved] && mounted) {
          setThemeName(saved);
          setTheme(makeTheme(TEMAS[saved]));
        }
      } catch (e) {
        console.warn('Error cargando tema guardado:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Función que Profile llama para actualizar themeName y theme (y lo persiste)
  const setAppThemeByName = async (name) => {
    try {
      const colors = TEMAS[name] ?? TEMAS.default;
      setTheme(makeTheme(colors));
      setThemeName(name);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
    } catch (e) {
      console.warn('Error guardando tema seleccionado:', e);
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppInner
            setAppTheme={setAppThemeByName}
            themesMap={TEMAS}
            themeName={themeName}
            navigationRef={navigationRef}
            setCurrentRoute={(r) => setCurrentRoute(r)}
          />
        </AuthProvider>
      </PaperProvider>
    </>
  );
}

function AppInner({ setAppTheme, themesMap, themeName, navigationRef, setCurrentRoute }) {
  const auth = useAuth(); 
  const [currentRoute, setCurrentRouteLocal] = useState('Home');
  const theme = useTheme();

  return (
    <>
      <NavigationContainer
        theme={theme}
        ref={navigationRef}
        onReady={() => {
          try {
            const r = navigationRef.current?.getCurrentRoute?.();
            if (r?.name) {
              setCurrentRouteLocal(r.name);
              setCurrentRoute?.(r.name);
            }
          } catch (e) {
            console.warn('nav ready error', e);
          }
        }}
        onStateChange={() => {
          try {
            const r = navigationRef.current?.getCurrentRoute?.();
            if (r?.name) {
              setCurrentRouteLocal(r.name);
              setCurrentRoute?.(r.name);
            }
          } catch (e) {
            console.warn('nav state change error', e);
          }
        }}
      >
        <MainNavigator
          setAppTheme={setAppTheme}
          themesMap={themesMap}
          themeName={themeName}
        />
        <AppBar currentRouteName={currentRoute} navigationRef={navigationRef} />
      </NavigationContainer>

      <LoadingOverlay visible={!!auth.busy} />
    </>
  );
}




function MainNavigator({ setAppTheme, themesMap, themeName }) {
  const { state } = useAuth();
  const [firstLogin, setFirstLogin] = useState(false);

  useEffect(() => {
   setFirstLogin(state.user?.formPending || false);
   console.log(`En app.js, formPending cambió a ${state.user?.formPending}`)
   console.log(`Usuario: ${state.user?.email}, name: ${state.user?.name}, formPending: ${state.user?.formPending}`);
  }, [state.user?.formPending]);

  return (
    <Stack.Navigator
      screenOptions={{
        animation:'none', headerStyle:{backgroundColor:TEMAS[themeName].background}
      }}
    >
      {!state.userToken ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false, animation:'none' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{title: 'Login', animation:'none' }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Sign up', animation:'none' }} />
        </>
      ) : firstLogin ? (
        <>
          <Stack.Screen name="InitialForm" component={InitialFormScreen} options={{ headerShown: false }} />
          <Stack.Screen name="StreamingServicesForm" component={StreamingServicesForm} options={{headerShown:false}} />
          <Stack.Screen name="CountriesForm" component={CountriesForm} options={{headerShown:false}} />
          <Stack.Screen name="GenreForm" component={GenresFormScreen} options={{headerShown:false}} />
          <Stack.Screen name="DirectorsForm" component={DirectorsFormScreen} options={{headerShown:false}} />
          <Stack.Screen name="MoviesForm" component={MoviesFormScreen} options={{headerShown:false}} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="FilmDetails" component={FilmDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" options={{ headerShown: false }}>
            {props => (
              <ProfileScreen
                {...props}
                setAppTheme={setAppTheme}
                themesMap={themesMap}
                currentThemeName={themeName}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Groups" component={Groups} options={{ headerShown: false }} />
          <Stack.Screen name="CreateGroup" component={CreateGroup} options={{ headerShown: false }} />
          <Stack.Screen name="JoinGroup" component={JoinGroup} options={{ headerShown: false }} />
          <Stack.Screen name="GroupCode" component={GroupCode} options={{ headerShown: false }} />

          <Stack.Screen name="RateFilm" component={RateFilm} options={{ headerShown: false }} />
          
          <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Favourites" component={FavouritesScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}


