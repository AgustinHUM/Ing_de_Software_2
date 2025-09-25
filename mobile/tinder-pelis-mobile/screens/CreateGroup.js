import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GradientButton from "../components/GradientButton";
import Input from "../components/TextInput";

// Para conectar al back
import { useAuth } from '../AuthContext';
import { createGroup } from '../src/services/api';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

export default function CreateGroup({ navigation }) {
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const textColor = theme.colors?.text ?? "#fff";
  const [groupName, setGroupName] = useState("");

  // FUNCIÓN QUE LLAMA AL BACK
  async function handleCreate() {
    const name = (groupName || '').trim();
    if (!name) return;

    const token = await SecureStore.getItemAsync("userToken");

    console.log("Token sent:", token);

    if (!token) {
      Alert.alert('Sesión', 'Necesitás iniciar sesión para crear un grupo.');
      return;
    }

    try {
      const data = await createGroup(name, token); // { group_join_id: N }
      Alert.alert(
        'Grupo creado',
        `Compartí este código para que se unan:\n${data.group_join_id}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Groups') }]
      );
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo crear el grupo');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: top + 8,
          paddingBottom: bottom + APPBAR_BOTTOM_INSET + APPBAR_HEIGHT + 16,
        }}
      >
        {/* Header simple */}
        <View style={{ flexDirection: "row", alignItems: "center", height: 48 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={textColor} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ textAlign: "center", fontSize: 22, fontWeight: "700", color: textColor }}>
              Create a Group
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ height: 32 }} />

        <Text style={{ fontSize: 28, fontWeight: "800", lineHeight: 34, color: textColor }}>
          What should we{"\n"}name this group?
        </Text>

        <View style={{ height: 24 }} />

        <Input
          value={groupName}
          onChangeText={setGroupName}
          placeholder=""
          mode="flat"
          underlineColor="rgba(255,255,255,0.9)"
          style={{ backgroundColor: "transparent" }}
        />

        <View style={{ height: 40 }} />

        <GradientButton
          onPress={handleCreate}
          disabled={!groupName.trim()}
        >
          Create Group
        </GradientButton>
      </View>
    </KeyboardAvoidingView>
  );
}