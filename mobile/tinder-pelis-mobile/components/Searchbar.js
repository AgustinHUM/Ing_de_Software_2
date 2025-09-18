import React, { useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';

export default function SearchBar({initialQuery=''}) {
  const [query, setQuery] = useState(initialQuery);
  const navigation = useNavigation();
  const theme = useTheme();

  const submit = () => {
    navigation.navigate('Search', { 'query': query });
  };

  return (
      <TextInput
        mode="outlined"
        placeholder="Buscar"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={submit}
        returnKeyType="search"
        style={{
                backgroundColor: 'rgba(105, 105, 105, 0.7)',
                height: Platform.select({ ios: 44, android: 48 }),
                fontSize: 16,
                paddingLeft: 10,
                outlineColor:'transparent'
            }}
        outlineStyle={{borderRadius:20}}
        right={<TextInput.Icon
                icon={() => <Feather name="search" size={20} color={theme.colors.placeholderText} />}
                onPress={submit}
                forceTextInputFocus={false}
                />}
        textColor={theme.colors.text}
        placeholderTextColor={theme.colors.placeholderText}
      />
  );
}
