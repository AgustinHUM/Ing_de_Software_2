import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// Usa TUS componentes ya existentes:
import GradientButton from "../components/GradientButton";
import Input from "../components/TextInput"; // tu wrapper de input

export default function JoinGroup({ navigation }) {
  const theme = useTheme();
  const [joinCode, setJoinCode] = useState("");

  // (opcional) Aceptar solo dígitos para el código
  const onChangeCode = (value) => {
    const onlyDigits = value.replace(/\D/g, "");
    setJoinCode(onlyDigits);
  };

  const canSubmit = joinCode.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Header simple con botón back */}
        <View style={{ flexDirection: "row", alignItems: "center", height: 56 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ textAlign: "center", fontSize: 22, fontWeight: "700" }}>
              Join a Group
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ height: 40 }} />

        {/* Título grande tipo mockup */}
        <Text style={{ fontSize: 28, fontWeight: "800", lineHeight: 34 }}>
          What’s the invite code?
        </Text>

        <View style={{ height: 8 }} />
        <Text style={{ opacity: 0.85 }}>
          Enter the code your friend shared with you.
        </Text>

        <View style={{ height: 24 }} />

        {/* Input: tu componente */}
        <Input
          value={joinCode}
          onChangeText={onChangeCode}
          placeholder="e.g. 12345"
          keyboardType="number-pad"     // aceptá números en el teclado
          mode="flat"                   // si tu wrapper lo ignora, no pasa nada
          underlineColor="rgba(255,255,255,0.9)"
          style={{ backgroundColor: "transparent" }}
        />

        <View style={{ height: 40 }} />

        {/* Botón con tu GradientButton (por ahora sin conectar al back) */}
        <GradientButton
          onPress={() => {
            // Más adelante:
            // POST /groups/join con { group_join_id: Number(joinCode) } y token en header
            // Por ahora, no hace nada (solo estructura).
          }}
          disabled={!canSubmit}
        >
          Join Group
        </GradientButton>
      </View>
    </KeyboardAvoidingView>
  );
}