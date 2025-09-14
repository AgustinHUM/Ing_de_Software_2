import React from 'react';
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useAuth } from "../AuthContext";
import GradientButton from "../components/GradientButton";



export default function ProfileScreen({ navigation, setAppTheme, themesMap, currentThemeName }) {
  const theme = useTheme();
  const { signOut } = useAuth();
  
  async function onSignOut() {
    try {
      await signOut();
    } catch (e) {
      Alert.alert('Error', String(e?.message || 'No se pudo cerrar sesión'));
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <View style={{ backgroundColor: theme.colors.surface, padding: 24, borderRadius: 25, borderWidth: 4, borderColor: theme.colors.primary, alignItems:'center' }}>
          <Text style={{ color: theme.colors.text, marginBottom: 8 }}>Pantalla del perfil</Text>
          <Text style={{ color: theme.colors.text, marginBottom: 12 }}>Tema actual: {currentThemeName}</Text>
        <View style={{marginVertical:32}}>
          <GradientButton onPress={(onSignOut)} style={{width:250}}>
            Cerrar sesión
          </GradientButton>
        </View>
          
        </View>


        <View style={{ width: '100%', paddingHorizontal: 24, marginTop: 24 }}>
          <Text variant="headlineSmall" style={{ color: theme.colors.text, fontWeight: 700, marginBottom: 8 }}>
            Elegir tema
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {Object.keys(themesMap).map((tkey) => {
              const colors = themesMap[tkey];
              const selected = currentThemeName === tkey;

              return (
                <TouchableOpacity
                  key={tkey}
                  onPress={() => setAppTheme(tkey)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    marginRight: 8,
                    marginBottom: 8,
                    backgroundColor: colors.surface,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? colors.primary : colors.accent,
                    minWidth: 100,
                    alignItems: 'center',
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: colors.text}}>
                    {tkey}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
