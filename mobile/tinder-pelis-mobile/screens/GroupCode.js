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
import { ActivityIndicator, Text } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GradientButton from "../components/GradientButton";
import * as SecureStore from "expo-secure-store";
import { getGroupUsersById } from "../src/services/api";
import ErrorOverlay from "../components/ErrorOverlay";
import * as Clipboard from 'expo-clipboard';

const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

// helper: id interno -> código lindo
const toJoinCode = (groupId) => groupId * 7 + 13;

export default function GroupCode({ navigation, route }) {
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const textColor = theme.colors?.text ?? "#fff";

  // Params posibles:
  const codeParam = route?.params?.code;            // flujo viejo (join code)
  const groupIdParam = route?.params?.groupId;      // flujo nuevo (desde Groups)
  const groupNameParam = route?.params?.groupName;

  // groupId a usar: prioridad al param nuevo; si no, lo calculamos desde code
  const groupId = useMemo(() => {
    if (Number.isFinite(groupIdParam)) return groupIdParam;
    const n = Number(codeParam);
    if (Number.isFinite(n)) return Math.floor((n - 13) / 7);
    return null;
  }, [groupIdParam, codeParam]);

  // código lindo que mostramos: si vino id, lo generamos; si no, usamos codeParam
  const joinCode = useMemo(() => {
    if (Number.isFinite(groupIdParam)) return toJoinCode(groupIdParam);
    const n = Number(codeParam);
    return Number.isFinite(n) ? n : null;
  }, [groupIdParam, codeParam]);

  const [groupName, setGroupName] = useState(groupNameParam ?? "Group");
  const [members, setMembers] = useState([]);       // [{email, username}]
  const [startWithoutPrefs, setStartWithoutPrefs] = useState(true);

  // Error overlay (solo para errores genéricos del back)
  const [showGenericError, setShowGenericError] = useState(false);
  const outageShownRef = useRef(false); // evita overlay repetido durante la misma caída
  const [loading, setLoading] = useState(false); 

  const isGenericBackendError = (err) => {
    const msg = (err?.message || "").toLowerCase();
    return (
      msg.startsWith("http ") ||       // "HTTP 500", etc.
      msg.includes("timeout") ||       // "Request timeout"
      msg.includes("no response") ||   // "No response from server"
      msg === "request error"
    );
  };

  // Polling de miembros cada 2s (si hay groupId)
  const pollingRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMembers() {
      try {
        setLoading(true);
        if (!groupId) return;
        const token = await SecureStore.getItemAsync("userToken");
        if (!token) return;
        const list = await getGroupUsersById(groupId, token);
        if (!cancelled && Array.isArray(list)) {
          setMembers(list);
          outageShownRef.current = false; // volvió a responder OK
        }
      } catch (e) {
        console.log("getGroupUsers error:", e?.message || e);
        if (isGenericBackendError(e) && !outageShownRef.current) {
          setShowGenericError(true);     // se autocierrra a los 5s
          outageShownRef.current = true;
        }
      } finally {
        setLoading(false);
      }
    }

    if (pollingRef.current) clearInterval(pollingRef.current);

    if (groupId) {
      fetchMembers(); // carga inicial
      pollingRef.current = setInterval(fetchMembers, 2000);
    } else {
      setMembers([]);
    }

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

  const codeLabel = (joinCode ?? "------").toString().toUpperCase();

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
        {/* Header simple */}
        <View style={{ flexDirection: "row", alignItems: "center", height: 48 }}>
          <TouchableOpacity onPress={() => navigation.navigate("Groups")} style={{ padding: 8 }}>
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

        {/* Si no hay params válidos */}
        {!groupId ? (
          <>
            <View style={{ alignItems: "center", marginTop: 12 }}>
              <Text style={{ color: textColor, opacity: 0.85, textAlign: "center" }}>
                No group selected. Please open this screen from “My Groups”.
              </Text>
            </View>
            <View style={{ height: 20 }} />
            <GradientButton onPress={() => navigation.navigate("Groups")} style={{ paddingVertical: 16, borderRadius: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "900", textAlign: "center" }}>
                Go to My Groups
              </Text>
            </GradientButton>
          </>
        ) : (
          <>
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
                {codeLabel}
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
              {/* Copy button */}
              <TouchableOpacity
                onPress={async () => { await Clipboard.setStringAsync(codeLabel); }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: theme.colors?.accent ?? "rgba(50,23,68,1)",
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="content-copy" size={18} color={textColor} style={{ marginRight: 8 }} />
                  <Text style={{ color: textColor, fontWeight: "700" }}>Copy</Text>
                </View>
              </TouchableOpacity>

              {/* Share button */}
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await Share.share({ message: `Join my group with this code: ${codeLabel}` });
                  } catch {}
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: theme.colors?.accent ?? "rgba(50,23,68,1)",
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="share-variant" size={18} color={textColor} style={{ marginRight: 8 }} />
                  <Text style={{ color: textColor, fontWeight: "700" }}>Share</Text>
                </View>
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
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
              }
              ListFooterComponent={
                members.length === 1 ? (
                  <View style={{ marginTop: 16, alignItems: "center" }}>
                    <Text style={{ color: textColor, opacity: 0.8, fontStyle: "italic" }}>
                      Waiting for others to join...
                    </Text>
                  </View>
                ) : null
              }
              contentContainerStyle={{ paddingBottom: 16 }}
            />

            <View style={{ height: 20 }} />

            {/* Botón principal */}
            <GradientButton onPress={goStart} style={{ paddingVertical: 18, borderRadius: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: "900", textAlign: "center", color:theme.colors.text }}>
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
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
