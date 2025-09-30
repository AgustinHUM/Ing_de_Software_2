import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// import * as Clipboard from "expo-clipboard";

import GradientButton from "../components/GradientButton";

const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

export default function GroupCode({ navigation, route }) {
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const textColor = theme.colors?.text ?? "#fff";

  const codeParam = route?.params?.code;
  const groupName = route?.params?.groupName ?? "Group 1";

  // hoy no usamos esto para lógica, sólo UI del mock
  const [startWithoutPrefs, setStartWithoutPrefs] = useState(true);

  const code = (codeParam ?? "------").toString().toUpperCase();

  // const onCopy = async () => {
  //   await Clipboard.setStringAsync(code);
  //   Alert.alert("Copied", "Invite code copied to clipboard");
  // };

  // const onShare = async () => {
  //   try {
  //     await Share.share({ message: `Join my group with this code: ${code}` });
  //   } catch {}
  // };

  const goStart = () => {
    // Cuando tengamos la navegación real, cambiar este destino.
    navigation.navigate("Home");
  };

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
              {groupName}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ height: 24 }} />

        <Text style={{ fontSize: 18, textAlign: "center", color: textColor, opacity: 0.9 }}>
          Use the code below to invite{"\n"}friends to your group
        </Text>

        <View style={{ height: 24 }} />

        {/* Caja grande con el código */}
        <View
          style={{
            alignSelf: "center",
            paddingVertical: 28,
            paddingHorizontal: 32,
            borderRadius: 18,
            backgroundColor: theme.colors?.surface ?? "rgba(33,5,65,1)",
            borderWidth: 3,
            borderColor: theme.colors?.primary ?? "rgba(255,138,0,1)",
            minWidth: 220,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 44,
              fontWeight: "900",
              letterSpacing: 3,
              color: textColor,
            }}
          >
            {code}
          </Text>
        </View>

        {/* Botones Copiar / Compartir */}
        <View
          style={{
            marginTop: 14,
            flexDirection: "row",
            gap: 16,
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            // onPress={ onCopy }
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: theme.colors?.accent ?? "rgba(50,23,68,1)",
            }}
          >
            <Text style={{ color: textColor, fontWeight: "700" }}>📋 Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            // onPress={ {/* onShare */} }
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: theme.colors?.accent ?? "rgba(50,23,68,1)",
            }}
          >
            <Text style={{ color: textColor, fontWeight: "700" }}>🔗 Share</Text>
          </TouchableOpacity>
        </View>

        {/* Separador */}
        <View
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.2)",
            marginVertical: 24,
          }}
        />

        
        {/* 
        <View style={{ gap: 12 }}>
          {["User 1", "User 2", "User 3", "User 4"].map((u, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                }}
              >
                <Text style={{ color: textColor, fontWeight: "800" }}>{u}</Text>
              </View>
              <Text style={{ color: textColor, opacity: 0.8 }}>Has joined your group</Text>
            </View>
          ))}
        </View>
        */}

        <View style={{ height: 20 }} />

        {/* Botón principal */}
        <GradientButton onPress={goStart}style={{ paddingVertical: 18, borderRadius: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "900", textAlign: "center" }}>
                Start swiping
            </Text>
        </GradientButton>

        {/* Checkbox “Start without setting preferences” */}
        <TouchableOpacity
          onPress={() => setStartWithoutPrefs((v) => !v)}
          style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              marginRight: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: startWithoutPrefs
                ? (theme.colors?.secondary ?? "rgba(251,195,76,1)")
                : "transparent",
              borderWidth: startWithoutPrefs ? 0 : 2,
              borderColor: "rgba(255,255,255,0.7)",
            }}
          >
            {startWithoutPrefs ? (
              <MaterialCommunityIcons name="check-bold" size={16} color="#000" />
            ) : null}
          </View>
          <Text style={{ color: textColor, opacity: 0.95 }}>
            Start without setting preferences
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}