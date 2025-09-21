import React, { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';

export default function SearchBar({ initialQuery = '', onSubmit = null }) {
  const [query, setQuery] = useState(initialQuery);
  const navigation = useNavigation();
  const theme = useTheme();

  const defaultSubmit = useCallback((q) => {
    navigation.navigate('Search', { query: q });
  }, [navigation]);

  const handleSubmit = useCallback(() => {
    const q = (query ?? '').trim();
    if (onSubmit) {
      onSubmit(q);
    } else {
      defaultSubmit(q);
    }
  }, [onSubmit, defaultSubmit, query]);

  return (
    <TextInput
      mode="outlined"
      placeholder="Peliculas"
      value={query}
      onChangeText={setQuery}
      onSubmitEditing={handleSubmit}          
      returnKeyType="peliculas"
      style={{
        backgroundColor: 'rgba(105, 105, 105, 0.7)',
        height: Platform.select({ ios: 44, android: 48 }),
        fontSize: 16,
        paddingLeft: 10,
        outlineColor: 'transparent',
      }}
      outlineStyle={{ borderRadius: 20 }}
      right={
        <TextInput.Icon
          icon={() => <Feather name="search" size={20} color={theme.colors.placeholder || '#999'} />}
          onPress={handleSubmit}            
          forceTextInputFocus={false}
        />
      }
      textColor={theme.colors.text}
      placeholderTextColor={theme.colors.placeholder || '#999'}
    />
  );
}
