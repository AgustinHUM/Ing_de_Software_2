import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Share,
  Alert,
  FlatList,
} from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GradientButton from "../components/GradientButton";
import * as SecureStore from "expo-secure-store";
import { getGroupUsersById } from "../src/services/api";
import ErrorOverlay from "../components/ErrorOverlay"; // ← agregado

const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

export default function GroupCode({ navigation, route }) {
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const textColor = theme.colors?.text ?? "#fff";

  const codeParam = route?.params?.code;            // join code (número)
  const groupName = route?.params?.groupName ?? "Group 1";
  const code = (codeParam ?? "------").toString().toUpperCase();

  // Calcular group_id como en el back: (join_code - 13) // 7
  const groupId = useMemo(() => {
    const n = Number(codeParam);
    if (Number.isFinite(n)) return Math.floor((n - 13) / 7);
    return null;
  }, [codeParam]);

  const [members, setMembers] = useState([]);       // [{email, username}]
  const [startWithoutPrefs, setStartWithoutPrefs] = useState(true);

  // Error overlay (solo para errores genéricos del back)
  const [showGenericError, setShowGenericError] = useState(false);
  const outageShownRef = useRef(false); // evita mostrar overlay repetidas veces durante el mismo “corte”

  const isGenericBackendError = (err) => {
    const msg = (err?.message || "").toLowerCase();
    return (
      msg.startsWith("http ") ||       // "HTTP 500", etc.
      msg.includes("timeout") ||       // "Request timeout"
      msg.includes("no response") ||   // "No response from server"
      msg === "request error"
    );
  };

  const pollingRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMembers() {
      try {
        if (!groupId) return;
        const token = await SecureStore.getItemAsync("userToken");
        if (!token) return;
        const list = await getGroupUsersById(groupId, token);
        if (!cancelled && Array.isArray(list)) {
          setMembers(list);
          // si volvió a funcionar, reseteamos el flag para permitir mostrar overlay en una futura caída
          outageShownRef.current = false;
        }
      } catch (e) {
        console.log("getGroupUsers error:", e?.message || e);
        if (isGenericBackendError(e) && !outageShownRef.current) {
          setShowGenericError(true);     // se autocierrra a los 5s
          outageShownRef.current = true; // no volver a mostrar hasta que haya una respuesta OK
        }
        // si no es genérico, no molestamos con alertas en polling; solo log
      }
    }

    // carga inicial
    fetchMembers();
    // polling cada 2s
    pollingRef.current = setInterval(fetchMembers, 2000);

    return () => {
      cancelled = true;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [groupId]);

  const goStart = () => navigation.navigate("Home");

  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.12)",
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 14,
          maxWidth: "60%",
        }}
      >
        <Text style={{ color: textColor, fontWeight: "800" }} numberOfLines={1}>
          {item.username || item.email || "User"}
        </Text>
      </View>
      <Text style={{ color: textColor, opacity: 0.85 }}>
        Has joined your group
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      {/* Overlay de error genérico (idéntico estilo al LoadingOverlay) */}
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

        {/* Acciones opcionales */}
        <View
          style={{
            marginTop: 14,
            flexDirection: "row",
            gap: 16,
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => Alert.alert("Copied", "Invite code copied to clipboard")}
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
            onPress={async () => {
              try {
                await Share.share({ message: `Join my group with this code: ${code}` });
              } catch {}
            }}
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

        {/* Lista de miembros (refresco cada 2s) */}
        <FlatList
          data={members}
          keyExtractor={(u, i) => (u.email || u.username || `m${i}`)}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ color: textColor, opacity: 0.8, textAlign: "center" }}>
              Waiting for friends to join…
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 16 }}
        />

        <View style={{ height: 20 }} />

        {/* Botón principal */}
        <GradientButton onPress={goStart} style={{ paddingVertical: 18, borderRadius: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "900", textAlign: "center" }}>
            Start swiping
          </Text>
        </GradientButton>

        {/* Checkbox */}
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
