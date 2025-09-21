import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GradientButton from "../components/GradientButton";
import Input from "../components/TextInput";

const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

export default function CreateGroup({ navigation }) {
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const textColor = theme.colors?.text ?? "#fff";
  const [groupName, setGroupName] = useState("");

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
          onPress={() => {
            // luego: POST /groups con { group_name: groupName } y token
          }}
          disabled={!groupName.trim()}
        >
          Create Group
        </GradientButton>
      </View>
    </KeyboardAvoidingView>
  );
}