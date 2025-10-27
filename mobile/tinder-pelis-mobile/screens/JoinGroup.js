import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GradientButton from "../components/GradientButton";
import TextInput from "../components/TextInput";
import LoadingOverlay from "../components/LoadingOverlay"; // ← agregado

// Para conectar al back
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
  const { state,updateUser } = useAuth();
  const token = state?.userToken;

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
  async function handleJoin() {
    if (loading) return; // evitar doble submit

    if (!token) {
      Alert.alert('Sesión', 'Necesitás iniciar sesión para unirte a un grupo.');
      return;
    }
    const code = Number(joinCode);
    if (!code || Number.isNaN(code)) {
      Alert.alert('Código inválido', 'Ingresá un número válido.');
      return;
    }

    setLoading(true);
    try {
      const data = await joinGroup(code, token);
      updateUser({groups:[...state.user.groups,{id:data.id,name:data.name,members:data.members}]});
      setLoading(false); // limpiar loading antes de mostrar el alert / navegar
      Alert.alert('Listo', data?.message || 'Group joined!', [
        { text: 'OK', onPress: () => navigation.navigate('GroupCode',{groupId:data.id,groupName:data.name}) },
      ]);
    } catch (e) {
      setLoading(false);
      if (isGenericBackendError(e)) {
        setShowGenericError(true); // se cierra solo a los 5s
      } else {
        Alert.alert('Error', e.message || 'Sorry! We could not join you to the group.');
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

        <Text style={{ fontSize: 28, fontWeight: "800", lineHeight: 34, color: textColor, textAlign: "center" }}>
          What's the invite code?
        </Text>
        <View style={{ height: 8 }} />
        <Text style={{ opacity: 0.85, color: textColor, textAlign: "center" }}>
          Enter the code your friend shared with you.
        </Text>

        <View style={{ height: 24 }} />

        <TextInput
          value={joinCode}
          onChangeText={onChangeCode}
          placeholder="e.g. 12345"
          keyboardType="number-pad"
          label="Group Code"
        />

        <View style={{ height: 40 }} />

        <GradientButton
          onPress={handleJoin}
          disabled={!canSubmit || loading}
        >
          Join Group
        </GradientButton>
      </View>
    </KeyboardAvoidingView>
  );
}
