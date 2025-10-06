import React, { useState } from "react";
import { View, Modal, Pressable, TouchableOpacity, Dimensions, FlatList, Alert } from "react-native";
import { Text, TextInput as PaperTextInput, useTheme as usePaperTheme } from "react-native-paper";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import GradientButton from "../components/GradientButton";
import { getUserGroups } from "../src/services/api";
import * as SecureStore from 'expo-secure-store';
import LoadingOverlay from "../components/LoadingOverlay";
import ErrorOverlay from "../components/ErrorOverlay";


const { width } = Dimensions.get("window");

// Alturas según el Appbar
const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

const FAB_SIZE = 64;
const FAB_MARGIN = 24;
const POPUP_GAP = 12;

const OUTER_PAD = 16;   // padding del SafeAreaView
const CONTENT_PAD = 16; // padding del contenedor interno

// Buscador local (no tocamos el Searchbar de películas)
function GroupSearch({ placeholder = "Search for a group", style, onSubmit, value, onChangeText }) {
  const paperTheme = usePaperTheme();
  return (
    <PaperTextInput
      mode="outlined"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      onSubmitEditing={onSubmit}
      returnKeyType="search"
      style={[{ borderRadius: 20 }, style]}
      outlineStyle={{ borderRadius: 20 }}
      left={<PaperTextInput.Icon icon="magnify" />}
      textColor={paperTheme.colors.text}
      placeholderTextColor={paperTheme.colors.placeholder}
    />
  );
}

function GroupItem({ name, members = 1, onPress, availableWidth }) {
  return (
    <View style={{ alignItems: "center", marginTop: 16 }}>
      <GradientButton
        onPress={onPress}
        fullWidth={false}
        style={{
          width: Math.min(availableWidth, 420),
          borderRadius: 999,
          paddingVertical: 14,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{ fontSize: 20, fontWeight: "700", color: "white" }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {name}
          </Text>
          <View style={{ flex: 1 }} />
          <Text style={{ color: "white", opacity: 0.9 }}>
            {members} {members === 1 ? "Member" : "Members"}
          </Text>
        </View>
      </GradientButton>
    </View>
  );
}

export default function GroupsHome({ navigation }) {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const textColor = theme.colors?.text ?? "#fff";

  const gradStart = theme?.colors?.primary ?? "#FF8A00";
  const gradEnd =
    theme?.colors?.secondary ??
    theme?.colors?.accent ??
    theme?.colors?.primary ??
    "#FFC300";

  const [showPopup, setShowPopup] = useState(false);
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
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


  useFocusEffect(
    React.useCallback(() => {
      const fetchGroups = async () => {
        setLoading(true);
        try {
          const token = await SecureStore.getItemAsync("userToken");
          if (token) {
            const userGroups = await getUserGroups(token);
            setGroups(userGroups || []);
          } else {
            setGroups([]);
          }
        } catch (error) {
          console.error(error);
          if (isGenericBackendError(error)) {
            setShowGenericError(true);
          } else {
            Alert.alert("Error", error.message || "Could not fetch groups.");
          }
          setGroups([]);
        } finally {
          setLoading(false);
        }
      };

      fetchGroups();

      return () => {
        // Optional cleanup
      };
    }, [])
  );

  const availableWidth = width - 2 * OUTER_PAD - 2 * CONTENT_PAD;

  // espacios para evitar solapes con Appbar/FAB
  const contentBottomPad = bottom + APPBAR_BOTTOM_INSET + APPBAR_HEIGHT + 16;
  const listBottomPad = contentBottomPad + FAB_SIZE + FAB_MARGIN + 8;
  const fabBottom = FAB_MARGIN + APPBAR_BOTTOM_INSET + APPBAR_HEIGHT + bottom;
  const popupRight = FAB_MARGIN + FAB_SIZE + POPUP_GAP;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: OUTER_PAD }}>

      {loading ? <LoadingOverlay visible={loading} /> : null}
      <ErrorOverlay
        visible={showGenericError}
        onHide={() => setShowGenericError(false)}
      />

      <View style={{ flex: 0.25, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "700", textAlign: "center", color: textColor }}>
          My Groups
        </Text>
      </View>

      <GroupSearch
        value={search}
        onChangeText={setSearch}
        onSubmit={() => {}}
        placeholder="Search for a group"
      />

      {/* Contenido */}
      <View style={{ flex: 1, padding: CONTENT_PAD, paddingBottom: contentBottomPad }}>
        {groups.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 8, color: textColor }}>
              Looks empty...
            </Text>

            <MaterialCommunityIcons
              name="sofa"
              size={Math.min(width * 0.45, 220)}
              color={theme.dark ? "#ffb199" : "#c04a2f"}
            />

            <Text style={{ marginTop: 8, opacity: 0.9, color: textColor }}>
              Add a group to begin!
            </Text>
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(g) => String(g.id)}
            contentContainerStyle={{ paddingBottom: listBottomPad }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <GroupItem
                name={item.name}
                members={item.members}
                availableWidth={availableWidth}
                
                // ir a GroupCode con el id y el nombre del grupo
                onPress={() => navigation.navigate('GroupCode', { groupId: item.id, groupName: item.name })}
              />
            )}
            ListFooterComponent={<View style={{ height: 8 }} />}
          />
        )}
      </View>

      {/* Texto “Planning…” (se oculta solo con el popup abierto) */}
      {!showPopup && (
        <View
          style={{
            position: "absolute",
            right: popupRight,
            bottom: fabBottom + 8,
            paddingHorizontal: 12,
            maxWidth: width * 0.6,
          }}
        >
          <Text style={{ textAlign: "right", color: textColor, opacity: 0.95 }}>
            Planning a movie night?{"\n"}Create a new group{"\n"}Or join one!
          </Text>
        </View>
      )}

      {/* FAB + con gradiente del theme */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => setShowPopup(true)}
        style={{
          position: "absolute",
          right: FAB_MARGIN,
          bottom: fabBottom,
        }}
      >
        <LinearGradient
          colors={[gradStart, gradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: FAB_SIZE / 2,
            alignItems: "center",
            justifyContent: "center",
            elevation: 6,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <MaterialCommunityIcons name="plus" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Popup al costado del + */}
      <Modal transparent visible={showPopup} animationType="fade" onRequestClose={() => setShowPopup(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={() => setShowPopup(false)} />
        <View
          style={{
            position: "absolute",
            right: popupRight,
            bottom: fabBottom + 8,
            alignItems: "flex-end",
            gap: 12,
          }}
        >
          <GradientButton
            fullWidth={false}
            onPress={() => {
              setShowPopup(false);
              navigation.navigate("CreateGroup");
            }}
          >
            Create group
          </GradientButton>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setShowPopup(false);
              navigation.navigate("JoinGroup");
            }}
            style={{
              borderRadius: 999,
              borderWidth: 2,
              borderColor: gradStart,
              paddingVertical: 12,
              paddingHorizontal: 18,
              backgroundColor: "transparent",
            }}
          >
            <Text style={{ fontWeight: "700", color: textColor }}>Join group</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
