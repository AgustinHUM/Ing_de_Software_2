import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GradientButton from "../components/GradientButton";
import TextInput from "../components/TextInput";
import LoadingOverlay from "../components/LoadingOverlay"; // ← agregado

import { createGroup } from '../src/services/api';
import * as SecureStore from 'expo-secure-store';

import ErrorOverlay from "../components/ErrorOverlay"; // ← agregado

const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

export default function CreateGroup({ navigation }) {
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const textColor = theme.colors?.text ?? "#fff";
  const [groupName, setGroupName] = useState("");

  // loading state
  const [loading, setLoading] = useState(false);

  // Overlay de error genérico
  const [showGenericError, setShowGenericError] = useState(false);
  const isGenericBackendError = (err) => {
    const msg = (err?.message || "").toLowerCase();
    return (
      msg.startsWith("http ") ||       // "HTTP 500", etc.
      msg.includes("timeout") ||       // "Request timeout"
      msg.includes("no response") ||   // "No response from server"
      msg === "request error"
    );
  };

  // FUNCIÓN QUE LLAMA AL BACK
  async function handleCreate() {
    if (loading) return; // evitar doble submit
    const name = (groupName || '').trim();
    if (!name) return;

    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
      Alert.alert('???', 'You need to be logged in to create a group.');
      return;
    }

    setLoading(true);
    try {
      const data = await createGroup(name, token); // { group_join_id: N }
      setLoading(false); // clear loading before navigation to avoid setState on unmounted component
      navigation.navigate('GroupCode', { code: data.group_join_id, groupName: name});
    } catch (e) {
      setLoading(false);
      // Mostrar overlay SOLO si el back no especifica el error
      if (isGenericBackendError(e)) {
        setShowGenericError(true); // se oculta solo a los 5s (según tu componente)
      } else {
        Alert.alert('Error', e.message || 'No se pudo crear el grupo');
      }
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      {/* Loading overlay */}
      <LoadingOverlay visible={loading} />

      {/* Overlay de error genérico */}
      <ErrorOverlay
        visible={showGenericError}
        onHide={() => setShowGenericError(false)}
      />

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
        <View style={{ alignItems: "center", width: '70%', alignSelf: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: textColor, textAlign: "center" }}>
            What should we name this group?
          </Text>
        </View>
        <View style={{ height: 24 }} />

        <TextInput
          value={groupName}
          onChangeText={setGroupName}
          label="Group Name"
        />

        <View style={{ height: 40 }} />

        <GradientButton
          onPress={handleCreate}
          disabled={!groupName.trim() || loading}
        >
          Create Group
        </GradientButton>
      </View>
    </KeyboardAvoidingView>
  );
}
