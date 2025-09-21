import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// Usa TUS componentes existentes:
import GradientButton from "../components/GradientButton";
import Input from "../components/TextInput"; // es tu wrapper de input

export default function CreateGroup({ navigation }) {
  const theme = useTheme();
  const [groupName, setGroupName] = useState("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Header simple con back */}
        <View style={{ flexDirection: "row", alignItems: "center", height: 56 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ textAlign: "center", fontSize: 22, fontWeight: "700" }}>
              Create a Group
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ height: 40 }} />

        {/* Título grande */}
        <Text style={{ fontSize: 28, fontWeight: "800", lineHeight: 34 }}>
          What should we{"\n"}name this group?
        </Text>

        <View style={{ height: 24 }} />

        {/* Input: usa tu componente / sin inventar estilos raros */}
        <Input
          value={groupName}
          onChangeText={setGroupName}
          placeholder=""
          // si tu Input acepta 'mode' y 'underlineColor', genial; si no, lo ignora sin romper
          mode="flat"
          underlineColor="rgba(255,255,255,0.9)"
          style={{ backgroundColor: "transparent" }}
        />

        <View style={{ height: 40 }} />

        {/* Botón con tu GradientButton */}
        <GradientButton
          onPress={() => {
            // por ahora no llamamos al backend
            // cuando conectemos: POST /groups con { group_name: groupName } + token
          }}
        >
          Create Group
        </GradientButton>
      </View>
    </KeyboardAvoidingView>
  );
}