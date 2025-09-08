import { View, StyleSheet, ImageBackground, SafeAreaView, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import GradientButton from '../components/GradientButton';
import { useAuth } from '../AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const bg = require('../assets/bg.jpg');


export default function WelcomeScreen({ navigation }) {
  const { guestSignIn } = useAuth();
  const theme = useTheme();
  const { width } = Dimensions.get('window');

  const spacingM = theme.tokens?.spacing?.m ?? 16;
  const spacingL = theme.tokens?.spacing?.l ?? 24;
  const spacingXXL = theme.tokens?.spacing?.xxl ?? 64;
  const titleColor = '#fff';
  const secondary = theme.colors?.secondary ?? '#fcd25eff';
  const subtitleColor = theme.colors.text;
  const buttonMaxWidth = 420;
  const btnWidth = Math.min(width * 0.8, buttonMaxWidth);

  //const gradianteFondo = ['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.95)']; //negro
  const gradianteFondo = ['rgba(25, 15, 27, 0.6)', 'rgba(10, 4, 10, 0.95)']; //violeta
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]}>
      <ImageBackground source={bg} style={styles.bg} imageStyle={{ resizeMode: 'cover' }} blurRadius={3}>
        <LinearGradient
          colors={gradianteFondo}
          style={styles.overlay}
          start={[0.5, 0]}
          end={[0.5, 1]}
        />

        <View style={[styles.inner, { paddingHorizontal: spacingM, paddingVertical: spacingL }]}>
          <View style={{ alignItems: 'center', marginBottom: spacingXXL }}>
            <Text variant="headlineLarge" style={{ textAlign: 'center', color: titleColor, fontWeight: '700' }}>
              <Text style={{ color: titleColor, fontWeight: '700' }}>Nombre</Text>
              <Text style={{ color: secondary, fontWeight: '700' }}>App</Text>
            </Text>

            <Text variant="bodyLarge" style={{ color: subtitleColor, marginTop: 8, textAlign: 'center' }}>
              Acá podríamos escribir alguna cosa
            </Text>
          </View>

          <View style={{ width: '100%', alignItems: 'center', marginTop: 4 }}>
            <GradientButton
              mode="contained"
              fullWidth
              onPress={() => navigation.navigate('Login')}
              style={{ width: btnWidth, marginVertical: spacingM / 2 }}
              borderWidth={3}
            >
              Iniciar sesión
            </GradientButton>

            <GradientButton
              mode="outlined"
              fullWidth
              onPress={() => navigation.navigate('SignUp')}
              style={{ width: btnWidth, marginVertical: spacingM / 2 }}
            >
              Registrarme
            </GradientButton>

            <Text variant="bodyLarge" style={{ color: subtitleColor, marginTop: spacingL, textAlign: 'center' }}>
              ¿Quieres probar la App sin registrarte?
            </Text>

            <GradientButton
              mode="text"
              fullWidth
              onPress={() => guestSignIn()}
              style={{ width: btnWidth, marginTop: spacingM / 2 }}
            >
              Entrar como invitado
            </GradientButton>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
