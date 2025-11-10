import React, { useState } from 'react';
import { View, Dimensions, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import GradientButton from '../components/GradientButton';
import FilmDisplay from '../components/FilmDisplay';
import { setAlpha } from '../theme';
import { rateMovie } from '../src/services/api';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width } = Dimensions.get('window');
const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

const SAVE_BAR_HEIGHT = 76;

export default function DidYouWatch() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { bottom, top } = useSafeAreaInsets();

  const movie = route.params?.movie ?? {};
  const title = movie?.title ?? 'Unknown';
  const year = movie?.year ?? '';



  // Altura fija para el botón + compensación AppBar
  const fixedSaveBottom = bottom + APPBAR_BOTTOM_INSET + APPBAR_HEIGHT + 12;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      {/* Layout SIN SCROLL: todo fijo en la pantalla */}
      <View
        style={{
          flex: 1,
          paddingTop: top + 48,
          paddingHorizontal: 20,
          alignItems: 'center',
        }}
      >
        
        <View style={{ justifyContent: 'flex-start',marginBottom:32}} >
          <Text style={{ textAlign: 'center', fontSize: 34, lineHeight: 38, fontWeight: '800', color: theme.colors.text }}>
            Did you watch <Text style={{color:theme.colors.primary, fontWeight:'800'}} >{title}</Text> yet?
          </Text>
          <View style={{width:'60%', alignSelf:'center'}} >
            <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 8, color: setAlpha(theme.colors.text, 0.7) }}>
                Let us know so we can improve your recommendations!
            </Text>
          </View>
          <View style={{ alignItems: 'center',marginTop:32 }}>
            <FilmDisplay width={240} movie={movie} onPress={null} interactable={false} />
          </View>
        </View>
            
        <View style={{ gap:12 }} >
            <GradientButton style={{width:300}} onPress={()=>navigation.navigate("RateFilm",{movie:movie})} >
                Yes, rate it now
            </GradientButton>
            <GradientButton mode='outlined' style={{width:300}} onPress={()=>{
                AsyncStorage.setItem('lastMatchedMovie',JSON.stringify({...movie, time: Date.now()}));
                navigation.navigate("Home");}} >
                Remind me later
            </GradientButton>
            <GradientButton mode='text' style={{width:300}} onPress={()=>navigation.navigate("Home")} >
                Don't remind me again
            </GradientButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
