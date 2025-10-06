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


const { width } = Dimensions.get('window');
const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

// Botón fijo arriba del AppBar
const SAVE_BAR_HEIGHT = 76;

export default function RateFilm() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { bottom, top } = useSafeAreaInsets();

  const movie = route.params?.movie ?? {};
  const title = movie?.title ?? 'Unknown';
  const year = movie?.year ?? '';
  const userRating = route.params?.userRating ?? 5; 

  // Enteros 0..10, arranca en 5
  const [rating, setRating] = useState(userRating);
  const [saving, setSaving] = useState(false);

  const btnWidth = Math.min(width * 0.85, 420);

  // Poster más chico (reutiliza FilmDisplay para usar la MISMA imagen que en FilmDetails)
  const posterContainerWidth = '48%';

  function inc() { setRating(r => Math.min(10, Math.round(r + 1))); }
  function dec() { setRating(r => Math.max(0, Math.round(r - 1))); }

  async function onSave() {
    setSaving(true);
    try {
      // 1. Get token from SecureStore (same pattern as FilmDetailsScreen)
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Error', 'Please log in again');
        return;
      }
      
      // 2. Pass token to API call (using current rating state, not userRating param)
      await rateMovie(movie.id, rating, token);
      
      // 3. Success feedback
      Alert.alert('Saved', 'Your rating was saved.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Rating save error:', error);
      Alert.alert('Error', 'Failed to save rating. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  

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
          paddingTop: top + 8,
          paddingHorizontal: 20,
          // Dejo espacio bajo para que el contenido quede por encima del botón fijo
          paddingBottom: fixedSaveBottom + SAVE_BAR_HEIGHT + 8,
        }}
      >
        {/* Header centrado */}
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 48, marginBottom: 6 }}>
          <IconButton
            icon={() => <MaterialIcons name="chevron-left" size={28} color={theme.colors.text} />}
            onPress={() => navigation.goBack()}
            style={{ margin: 0 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '700', color: theme.colors.text }}>
              Rate it
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Contenido en columnas, SIN SCROLL, ajustado a la altura disponible */}
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          {/* Título grande */}
          <Text style={{ textAlign: 'center', fontSize: 34, lineHeight: 38, fontWeight: '800', color: theme.colors.text }}>
            Rate this movie
          </Text>

          {/* Poster centrado (más chico) */}
          <View style={{ alignItems: 'center' }}>
            <FilmDisplay width={posterContainerWidth} movie={movie} onPress={null} interactable={false} />
          </View>

          {/* Título + año */}
          <Text
            style={{
              textAlign: 'center',
              color: theme.colors.text,
              fontSize: 22,
              fontWeight: '700',
              marginTop: 6,
            }}
            numberOfLines={2}
          >
            {year ? `${title} (${year})` : title}
          </Text>

          {/* Rating + +/- */}
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                minWidth: 200,
                gap: 8,
              }}
            >
              <MaterialIcons name="star" size={20} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '800' }}>
                {rating}{' '}
                <Text style={{ color: setAlpha(theme.colors.text, 0.8), fontWeight: '700' }}>
                  / 10
                </Text>
              </Text>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 12, gap: 18 }}>
              <TouchableOpacity
                onPress={dec}
                style={{
                  width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: theme.colors.primary,
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="remove" size={26} color={theme.colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={inc}
                style={{
                  width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: theme.colors.primary,
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="add" size={26} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Botón fijo (NO scrollea) por encima del AppBar */}
        <View
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            bottom: fixedSaveBottom,
            height: SAVE_BAR_HEIGHT,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GradientButton
            onPress={onSave}
            disabled={saving}
            style={{ width: btnWidth, alignSelf: 'center' }}
          >
            {saving ? 'Saving…' : 'Save Rating'}
          </GradientButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
