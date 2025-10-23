import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GradientButton from "../components/GradientButton";
import Input from "../components/TextInput";

// Para conectar al back
import { Alert } from 'react-native';
import { useAuth } from '../AuthContext';
import { joinGroup } from '../src/services/api';

import ErrorOverlay from "../components/ErrorOverlay"; // ← agregado

const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

export default function JoinGroup({ navigation }) {
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const textColor = theme.colors?.text ?? "#fff";
  const [joinCode, setJoinCode] = useState("");

  // OBTENER TOKEN
  const { state } = useAuth();
  const token = state?.userToken;

  // Overlay de error genérico
  const [showGenericError, setShowGenericError] = useState(false);
  const isGenericBackendError = (err) => {
    const msg = (err?.msg || "").toLowerCase();
    return (
      msg.startsWith("http ") ||       // "HTTP 500", etc.
      msg.includes("timeout") ||       // "Request timeout"
      msg.includes("no response") ||   // "No response from server"
      msg === "request error"
    );
  };

  // FUNCIÓN QUE LLAMA AL BACK
  async function handleJoin() {
    if (!token) {
      Alert.alert('Sesión', 'Necesitás iniciar sesión para unirte a un grupo.');
      return;
    }
    const code = Number(joinCode);
    if (!code || Number.isNaN(code)) {
      Alert.alert('Código inválido', 'Ingresá un número válido.');
      return;
    }

    try {
      const data = await joinGroup(code, token); // { message: "..." }
      Alert.alert('Listo', data?.message || 'Te uniste al grupo', [
        { text: 'OK', onPress: () => navigation.navigate('Groups') },
      ]);
    } catch (e) {
      if (isGenericBackendError(e)) {
        setShowGenericError(true); // se cierra solo a los 5s
      } else {
        Alert.alert('Error', e.msg || 'No te pudimos unir al grupo');
      }
    }
  }

  const onChangeCode = (value) => setJoinCode(value.replace(/\D/g, ""));
  const canSubmit = joinCode.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
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
        <View style={{ flexDirection: "row", alignItems: "center", height: 48 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={textColor} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ textAlign: "center", fontSize: 22, fontWeight: "700", color: textColor }}>
              Join a Group
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ height: 32 }} />

        <Text style={{ fontSize: 28, fontWeight: "800", lineHeight: 34, color: textColor }}>
          What’s the invite code?
        </Text>
        <View style={{ height: 8 }} />
        <Text style={{ opacity: 0.85, color: textColor }}>
          Enter the code your friend shared with you.
        </Text>

        <View style={{ height: 24 }} />

        <Input
          value={joinCode}
          onChangeText={onChangeCode}
          placeholder="e.g. 12345"
          keyboardType="number-pad"
          mode="flat"
          underlineColor="rgba(255,255,255,0.9)"
          style={{ backgroundColor: "transparent" }}
        />

        <View style={{ height: 40 }} />

        <GradientButton
          onPress={handleJoin}
          disabled={!canSubmit}
        >
          Join Group
        </GradientButton>
      </View>
    </KeyboardAvoidingView>
  );
}
