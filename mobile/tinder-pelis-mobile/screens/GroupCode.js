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
import { getGroupUsersById, leaveGroup } from "../src/services/api";
import ErrorOverlay from "../components/ErrorOverlay";
import * as Clipboard from 'expo-clipboard';
import Pusher from 'pusher-js/react-native';
import { useAuth } from "../AuthContext";

const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

// helper: id interno -> código lindo
const toJoinCode = (groupId) => groupId * 7 + 13;

export default function GroupCode({ navigation, route }) {
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const textColor = theme.colors?.text ?? "#fff";
  const {state,updateUser} = useAuth();
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
    const msg = (err?.msg || "").toLowerCase();
    return (
      msg.startsWith("http ") ||       // "HTTP 500", etc.
      msg.includes("timeout") ||       // "Request timeout"
      msg.includes("no response") ||   // "No response from server"
      msg === "request error"
    );
  };

  const groupRef = useMemo(() => {
    return state.user.groups.find(item => item.id === groupId);
  },[state.user.groups, groupId]);

  // --- Fetch initial members once (replaces the old polling) ---
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
          if (groupRef.members != list.length) {
            updateUser({groups:state.user.groups.map(group => group.id != groupId ? group : {...group,members:list.length})});
          }
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

    if (groupId) {
      fetchMembers(); // carga inicial
    } else {
      setMembers([]);
    }

    return () => {
      cancelled = true;
    };
  }, [groupId]);

useEffect(() => {
  if (!groupId) return;          // subscribe by internal id (not joinCode)
  let pusher = null;
  let channel = null;
  let mounted = true;

  (async () => {
    try {
      // enable pusher debug logs (helps a lot when troubleshooting)
      Pusher.logToConsole = true;

      pusher = new Pusher('fcb8b1c83278ac43036d', {
        cluster: 'sa1',
        // forceTLS: true, // uncomment if your app requires TLS
      });

      console.log('Pusher init, connection state:', pusher.connection.state);

      // subscribe to internal-id channel
      channel = pusher.subscribe(`group-${groupId}`);

      // debug connection state changes
      pusher.connection.bind('state_change', (states) => {
        console.log('Pusher state change:', states);
      });
      pusher.connection.bind('connected', () => {
        console.log('Pusher connected, socket id:', pusher.connection.socket_id);
      });
      pusher.connection.bind('error', (err) => {
        console.log('Pusher connection error', err);
      });

      // bind the event
      channel.bind('new-member', (payload) => {
        try {
          // defensive parsing and logging
          const data = typeof payload === 'string' ? (() => {
            try { return JSON.parse(payload); } catch { return payload; }
          })() : payload;

          console.log('PUSHER EVENT new-member payload:', JSON.stringify(data));

          const name = data?.username || (data?.email ? data.email.split('@')[0] : 'User');
          const email = data?.email ?? null;

          if (!mounted) return;
          setMembers(prev => {
            const exists = prev.some(m => (email && m.email === email));
            if (exists) {
              return prev;
            }
            updateUser({groups:state.user.groups.map(group => group.id != groupId ? group : {...group,members:group.members + 1})});
            return [...prev, { email, username: name }];
          });

        } catch (err) {
          console.log('pusher event handling error', err);
        }
      });

      channel.bind('member-left', (payload) => {
        try {
          const data = typeof payload === 'string' ? (() => {
            try { return JSON.parse(payload); } catch { return payload; }
          })() : payload;

          console.log('PUSHER EVENT member-left payload:', JSON.stringify(data));
          const email = data?.email ?? null;
          if (!email) return; // Need email to know who left

          if (!mounted) return;
          setMembers(prev => {
            const newMembers = prev.filter(m => m.email !== email);
            
            // If a member was actually removed, update global count
            if (newMembers.length < prev.length) {
              updateUser({
                groups: state.user.groups.map(group => 
                  group.id !== groupId ? group : {...group, members: Math.max(0, group.members - 1)}
                )
              });
            }
            
            return newMembers;
          });

        } catch (err) {
          console.log('pusher event (member-left) handling error', err);
        }
      });


    } catch (err) {
      console.log('Pusher setup error', err);
    }
  })();

  return () => {
    mounted = false;
    try {
      if (channel) {
        channel.unbind_all && channel.unbind_all();
        pusher && pusher.unsubscribe && pusher.unsubscribe(`group-${groupId}`);
      }
      if (pusher) {
        pusher.disconnect && pusher.disconnect();
      }
    } catch (e) {
      console.log('Pusher cleanup error', e);
    }
  };
}, [groupId]);


  const goStart = () => navigation.navigate("Home");
  const goSwipe = () => navigation.navigate("GroupSwiping", { groupId, groupName, startWithoutPrefs });

  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 6,
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
       <Text
      style={{
        color: item.action === "left" ? "red" : textColor,
        opacity: 0.85,
      }}
    >
      {item.action === "left" ? "Has left the group" : "Has joined the group"}
    </Text>
  </View>
);

  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      'Are you sure you want to leave this group?',
      [
        { text: "Cancel", style: "cancel" }, 
        { text: "Leave", style: "destructive", onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync("userToken");
              if (!token || !groupId) {
                throw new Error("Missing auth token or group ID");
              }
              await leaveGroup(groupId, token);
              updateUser({groups:state.user.groups.filter(group => group.id != groupId)});
              navigation.navigate("Groups");
            } catch (e) {
              console.log("leaveGroup error:", e?.message || e);
              Alert.alert("Error", "Could not leave the group. Please try again later.");
            }
          } 
        }
      ]
    );
  }


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

              {/* Trash (Leave group) small button - red */}
              <TouchableOpacity
                onPress={handleLeaveGroup}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: '#FF4444',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontWeight: "700" }}>Leave</Text>
                </View>
              </TouchableOpacity>

            </View>

            {/* Separador */}
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(255,255,255,0.2)",
                marginTop: 24,
              }}
            />

            {/* Lista de miembros (actualizada en tiempo real vía Pusher) */}
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
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            />

            <View style={{ height: 20 }} />

            {/* Botón principal */}
            <GradientButton onPress={goSwipe} style={{ paddingVertical: 18, borderRadius: 16 }}>
                Start swiping
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
                    ? (theme.colors.surface)
                    : "transparent",
                  borderWidth: 2,
                  borderColor: theme.colors.text,
                }}
              >
                {startWithoutPrefs ? (
                  <MaterialCommunityIcons name="check-bold" size={16} color={theme.colors.primary} />
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
