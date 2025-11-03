// Groups.js
import React, { useState, useRef } from "react";
import {
  View,
  Pressable,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import {
  ActivityIndicator,
  Divider,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import GradientButton from "../components/GradientButton";
import { getUserGroups } from "../src/services/api";
import * as SecureStore from "expo-secure-store";
import LoadingOverlay from "../components/LoadingOverlay";
import ErrorOverlay from "../components/ErrorOverlay";

import SearchBar from "../components/Searchbar";
import Seleccionable from "../components/Seleccionable";
import LoadingBox from "../components/LoadingBox";
import { tweakColor } from "../theme";
import { useAuth } from "../AuthContext";

const { width } = Dimensions.get("window");

// Alturas según el Appbar
const APPBAR_HEIGHT = 60;
const APPBAR_BOTTOM_INSET = 10;

const FAB_SIZE = 64;
const FAB_MARGIN = 24;
const POPUP_GAP = 12;

const OUTER_PAD = 16; // padding del SafeAreaView
const CONTENT_PAD = 16; // padding del contenedor interno

export default function GroupsHome({ navigation }) {
  const theme = useTheme(); // react-navigation theme (used for layout/colors)
  const paperTheme = usePaperTheme(); // react-native-paper theme (Seleccionable uses paper theme)
  const { bottom } = useSafeAreaInsets();
  const textColor = theme.colors?.text ?? "#fff";
  const { state, updateUser } = useAuth();
  const gradStart = theme?.colors?.primary ?? "#FF8A00";
  const gradEnd =
    theme?.colors?.secondary ??
    theme?.colors?.accent ??
    theme?.colors?.primary ??
    "#FFC300";

  const [showPopup, setShowPopup] = useState(false);

  // search state is updated when SearchBar's onSubmit is called
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // <-- new: pull-to-refresh state
  const [showGenericError, setShowGenericError] = useState(false);

  // mounted ref so async calls don't update after unmount
  const mountedRef = useRef(true);

  const isGenericBackendError = (err) => {
    const msg = (err?.message || "").toLowerCase();
    return (
      msg.startsWith("http ") || // "HTTP 500", etc.
      msg.includes("timeout") || // "Request timeout"
      msg.includes("no response") || // "No response from server"
      msg === "request error"
    );
  };

  // fetchGroups extracted so it can be reused for initial load and refresh
  const fetchGroups = React.useCallback(
    async ({ showLoading = true } = {}) => {
      if (!mountedRef.current) return;
      if (showLoading) setLoading(true);
      try {
        const token = await SecureStore.getItemAsync("userToken");
        if (token) {
          const userGroups = await getUserGroups(token);
          if (mountedRef.current) {
            setGroups(userGroups || []);
            updateUser({ groups: userGroups || [] });
          }
        } else {
          if (mountedRef.current) setGroups([]);
        }
      } catch (error) {
        console.error(error);
        if (isGenericBackendError(error)) {
          setShowGenericError(true);
        } else {
          Alert.alert(
            "Error",
            error?.message ||
              error?.msg ||
              error?.error ||
              "An error occurred while looking for your groups."
          );
        }
        if (mountedRef.current) setGroups([]);
      } finally {
        if (mountedRef.current && showLoading) setLoading(false);
      }
    },
    [updateUser]
  );

useFocusEffect(
  React.useCallback(() => {
    mountedRef.current = true;

    const user = state?.user;
    const userHasGroupsProp =
      user != null && Object.prototype.hasOwnProperty.call(user, "groups");

    if (userHasGroupsProp) {
      // user.groups exists (could be [], null, or an array) — use it
      setGroups(user.groups ?? []);
    } else {
      // we haven't fetched groups yet
      fetchGroups({ showLoading: true });
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchGroups, state?.user])
);

  // onRefresh triggered by pull-to-refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchGroups({ showLoading: false });
    } finally {
      if (mountedRef.current) setRefreshing(false);
    }
  }, [fetchGroups]);

  const availableWidth = width - 2 * OUTER_PAD - 2 * CONTENT_PAD;

  // espacios para evitar solapes con Appbar/FAB
  const fabBottom = FAB_MARGIN + APPBAR_BOTTOM_INSET + APPBAR_HEIGHT + bottom;
  const popupRight = FAB_MARGIN + FAB_SIZE + POPUP_GAP;

  const filteredGroups =
    (search || "").trim().length > 0
      ? groups.filter((g) => (g.name || "").toLowerCase().includes(search.toLowerCase()))
      : groups;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: OUTER_PAD }}>
      {/* Loading & error overlays */}
      <ErrorOverlay visible={showGenericError} onHide={() => setShowGenericError(false)} />

      <View style={{ flex: 0.25, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "700", textAlign: "center", color: textColor }}>
          My Groups
        </Text>
      </View>

      {/* Use your SearchBar component. It will call onSubmit with the query when the user submits. */}
      <SearchBar initialQuery={search} onSubmit={(q) => setSearch(q)} />
      <Divider
        style={{
          backgroundColor: theme.colors.primary,
          width: "100%",
          height: 5,
          borderRadius: 5,
          marginTop: 16,
        }}
      />
      {/* Contenido */}
      <View style={{ flex: 1, paddingBottom: 64 }}>
        {loading ? (
          <View style={{ flex: 0.75, alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((i) => {
              return (
                <LoadingBox
                  key={i}
                  style={{
                    marginTop: 16,
                    width: Math.min(availableWidth, 420),
                    height: 60,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              );
            })}
          </View>
        ) : filteredGroups.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", paddingTop: 64 }}>
            <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 8, color: textColor }}>
              Looks empty...
            </Text>

            <MaterialCommunityIcons
              name="sofa"
              size={Math.min(width * 0.45, 220)}
              color={theme.colors.primary}
            />

            <Text style={{ marginTop: 8, opacity: 0.9, color: textColor }}>
              Add a group to begin!
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 128 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            // <-- RefreshControl enables the 'pull down to refresh' spinner and triggers onRefresh
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.background}
              />
            }
          >
            {filteredGroups.map((item) => {
              const members = item.members ?? 1;
              const label = item.name ?? "Untitled group";
              const red_variation = ((item.id * 732) % 81 - 40) * Math.sqrt(item.members);
              const green_variation = ((item.id * 127) % 81 - 40) * Math.sqrt(item.members);
              const blue_variation = ((item.id * 247) % 81 - 40) * Math.sqrt(item.members);
              return (
                <TouchableOpacity
                  key={String(item.id)}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("GroupCode", { groupId: item.id, groupName: item.name })}
                  style={{ alignItems: "center", marginTop: 16 }}
                >
                  <LinearGradient
                    colors={[
                      tweakColor(gradStart, red_variation, green_variation, blue_variation),
                      tweakColor(gradEnd, red_variation, green_variation, blue_variation),
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: Math.min(availableWidth, 420),
                      borderRadius: 999,
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "700",
                          color: theme.colors?.onGradient ?? theme.colors.text,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {label}
                      </Text>

                      <View style={{ flex: 1 }} />

                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text
                          style={{
                            color: theme.colors?.onGradient ?? theme.colors.text,
                            opacity: 0.95,
                            marginRight: 8,
                            fontSize: 16,
                            fontWeight: "700",
                          }}
                        >
                          {members}
                        </Text>
                        <MaterialCommunityIcons
                          name="account-group"
                          size={24}
                          color={theme.colors?.onGradient ?? theme.colors.text}
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}

            {/* footer spacer */}
            <View style={{ height: 8 }} />
          </ScrollView>
        )}
      </View>

      {(!loading && !showPopup && groups.length === 0) && (
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
      {!loading && (
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
      )}

      {/* Popup al costado del + (REPLACED Modal with overlay + popup view) */}
      {showPopup && (
        <>
          {/* Fullscreen half-opacity overlay. Touching it closes the popup */}
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
            onPress={() => setShowPopup(false)}
          />

          {/* Popup buttons (rendered after overlay so they're on top) */}
          <View
            style={{
              position: "absolute",
              right: popupRight,
              bottom: fabBottom,
              alignItems: "flex-end",
              gap: 16,
              zIndex: 1000, // ensure it's above the overlay on Android
            }}
          >
            <GradientButton
              fullWidth={true}
              onPress={() => {
                setShowPopup(false);
                navigation.navigate("CreateGroup");
              }}
              style={{ marginTop: 32, marginLeft: 16 }}
            >
              Create group
            </GradientButton>

            <GradientButton
              fullWidth={true}
              mode="outlined"
              onPress={() => {
                setShowPopup(false);
                navigation.navigate("JoinGroup");
              }}
            >
              Join group
            </GradientButton>
          </View>
        </>
      )}
    </View>
  );
}
