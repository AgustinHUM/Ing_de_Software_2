// EditProfile.js
import React, { useEffect, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import {
  Text,
  useTheme,
  Avatar,
  Surface,
  Divider,
  IconButton,
} from "react-native-paper";
import { useAuth } from "../AuthContext";
import GradientButton from "../components/GradientButton";
import { setAlpha } from "../theme";
import SelectableListForm from "../components/Form";
import { showUserForm, updateUserInfo } from "../src/services/api";
import TextInput from "../components/TextInput";
import * as SecureStore from 'expo-secure-store';
import LoadingOverlay from "../components/LoadingOverlay";
import { localAvatars } from "./Profile";
const { width } = Dimensions.get("window");

export default function EditProfileScreen({ navigation }) {
  const theme = useTheme();
  const { state,updateUser } = useAuth();
  const initialUser = state.user || {};

  // Edited fields state (start from initial)
  const [name, setName] = useState(initialUser?.name ?? "");
  const [icon, setIcon] = useState(initialUser?.icon ?? null); 
  const [country, setCountry] = useState({id: initialUser?.country ?? null, flag: initialUser?.flag ?? null}); // object { id,flag }
  const [platforms, setPlatforms] = useState(initialUser?.platforms ?? []); // array of objects
  const [genres, setGenres] = useState(initialUser?.genres ?? []); // array of names or objects

  // modal for list selection (country/platforms/genres/icon)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'country' | 'platforms' | 'genres' | 'icon'
  const [formData, setFormData] = useState(null); // object returned by showUserForm()
  const [loadingFormData, setLoadingFormData] = useState(false);

  const [avatarError, setAvatarError] = useState(false);

  // helper to trigger opening a selection modal and fetch showUserForm() if needed
  const openSelector = async (type) => {
    setModalType(type);
    // Only fetch lists for types that need it (country/platforms/genres)
    if (!formData && (type === "country" || type === "platforms" || type === "genres")) {
      setLoadingFormData(true);
      try {
        const data = await showUserForm(); // { countries, platforms, genres }
        setFormData(data || {});
      } catch (e) {
        console.error("Error fetching form lists:", e);
        Alert.alert("Error", "Could not load options, please try later.");
      } finally {
        setLoadingFormData(false);
        setModalVisible(true);
      }
    } else {
      // already have data or it's icon selection
      setModalVisible(true);
    }
  };

  // Build SelectableListForm `items` depending on modalType
  const buildItemsForModal = () => {
    if (!modalType) return [];
    if (modalType === "country") {
      const countries = (formData?.countries || []).map((c) => ({
        name: c.name,
        id: c.id,
        icon: c.flag ? { uri: c.flag } : undefined,
        raw: c,
      }));
      return countries;
    }
    if (modalType === "platforms") {
      const plats = (formData?.platforms || []).map((p) => ({
        name: p.name,
        id: p.id,
        icon: p.logo ? { uri: p.logo } : undefined,
        raw: p,
      }));
      return plats;
    }
    if (modalType === "genres") {
      const gs = (formData?.genres || []).map((g) => ({
        name: g.name,
        id: g.id,
        raw: g,
      }));
      return gs;
    }
    if (modalType === "icon") {
        const array = [];
        for (let k = 0; k < localAvatars.length; k++) {
            array.push({
                name: localAvatars[k].name || `Avatar ${k}`,
                id: k,
                icon: localAvatars[k].avatar,
                raw: { key: k, source: localAvatars[k] },
                });
        }
      return array;
    }
    return [];
  };

  // When SelectableListForm submits selected items:
  const handleSelectionSubmit = (selectedItems) => {
    if (!modalType) return;

    if (modalType === "country") {
      // Expecting single selection
      const sel = selectedItems[0] ?? null;
      setCountry(sel?.raw ?? { id: sel?.id, name: sel?.name, flag: sel?.icon?.uri });
    } else if (modalType === "platforms") {
      // store raw platform objects (from formData platforms)
      const arr = selectedItems.map((s) => s.raw ?? { id: s.id, name: s.name, logo: s.icon?.uri });
      setPlatforms(arr);
    } else if (modalType === "genres") {
      const arr = selectedItems.map((s) => s.id);
      setGenres(arr);
    } else if (modalType === "icon") {
      const sel = selectedItems[0];
      if (sel) {
        setIcon(sel.id); // store key referencing localAvatars
        setAvatarError(false);
      }
    }

    // close modal
    setModalVisible(false);
    setModalType(null);
  };

  const cancel = () => {
    navigation.goBack();
  };

  const apply = async () => {
    const modified = {};
    if (initialUser?.name !== name) {
        modified.name = name;
    }
    if (initialUser?.icon !== icon) {
        modified.icon = icon;
    }
    if (initialUser?.country !== country.id) {
        modified.country = country.id;
    }
    if (JSON.stringify(initialUser?.platforms || []) !== JSON.stringify(platforms || [])) {
        modified.platforms = platforms;
    }
    if (JSON.stringify(initialUser?.genres || []) !== JSON.stringify(genres || [])) {
        modified.genres = genres;
    }
    const saveUserInfo = async () => {
      setLoadingFormData(true);
      try {
        const token = await SecureStore.getItemAsync('userToken');
        await updateUserInfo({...modified, platforms: platforms.map((p)=>p.id)}, token);
        updateUser({...modified, flag: country.flag,}, true); 
      } catch (error) {
        console.error('Error saving:', error);
      } finally {
        setLoadingFormData(false);
      }
    };
    try{
    await saveUserInfo();
    Alert.alert("Saved", "Changes have been saved.", [
      { text: "OK", onPress: () => navigation.navigate("Profile") },
    ]);}
    catch {
      Alert.alert("Error","An error occurred while saving your data. Try again later.")
    }
  };



  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingOverlay visible={loadingFormData} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" style={{ color: theme.colors.text, marginRight: 12, fontWeight: "700", alignSelf: "center", marginBottom: 16 }}>
            Edit Profile
        </Text>
        <View style={styles.avatarWrap}>
        <View style={{ alignItems: 'center', marginBottom: 26 }}>
            <View
            style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                overflow: 'hidden',
                borderColor: setAlpha(theme.colors.primary, 0.5),
                borderWidth: 1,
                elevation: 8,
                position: 'relative',
            }}
            >
            {/* Image or fallback */}
            {localAvatars?.[icon]?.avatar && !avatarError ? (
                <Image
                source={localAvatars[icon].avatar}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                onError={() => setAvatarError(true)}
                />
            ) : (
                <Avatar.Text
                size={120}
                label={(name || initialUser?.name || 'U').charAt(0).toUpperCase()}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: theme.colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                color={theme.colors.onPrimary}
                />
            )}

            {/* translucent overlay (between image and icon) */}
            <View
                pointerEvents="none"
                style={{
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.60)',
                }}
            />

            {/* full pressable area + pencil icon on top (centered) */}
            <TouchableOpacity
                onPress={() => openSelector('icon')}
                activeOpacity={0.8}
                style={{
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <IconButton
                icon="pencil"
                size={50}
                onPress={() => openSelector('icon')}
                iconColor={theme.colors.primary}
                style={{
                    borderRadius: 999,
                    margin: 0,
                    elevation: 4,
                }}
                rippleColor={setAlpha(theme.colors.primary, 0.08)}
                />
            </TouchableOpacity>
            </View>
        </View>
        </View>

        {/* Surface with editable fields */}
        <Surface
          style={[
            styles.infoSurface,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
              boxShadow: [
                {
                  offsetX: 0,
                  offsetY: 0,
                  blurRadius: 16,
                  spread: 0,
                  color: setAlpha(theme.colors.primary, 0.6),
                },
              ],
            },
          ]}
        >
          {/* Name row (TextInput + edit icon not needed since inline) */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Name</Text>

            <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                style={{ flex:0.5 }}
              />
            </View>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.primary }]} />

          {/* Country */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Country</Text>

            <View style={styles.countryRight}>
              {country?.flag ? (
                <Image style={{ width: 54, height: 36, borderRadius: 9, marginRight: 8 }} source={{ uri: country.flag }} />
              ) : (
                <View style={{ width: 54, height: 36, borderRadius: 9, backgroundColor: setAlpha(theme.colors.onSurface, 0.04), marginRight: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 10, color: theme.colors.text }}>No</Text>
                </View>
              )}

              <IconButton
                icon="pencil"
                size={20}
                onPress={() => openSelector("country")}
                iconColor={theme.colors.primary}
                rippleColor={setAlpha(theme.colors.primary, 0.08)}
              />
            </View>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.primary }]} />

          {/* Streaming platforms */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Streaming platforms</Text>

            <View style={styles.expandableRight}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => openSelector("platforms")}
                iconColor={theme.colors.primary}
                rippleColor={setAlpha(theme.colors.primary, 0.08)}
              />
            </View>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.primary }]} />

          {/* Genres */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Favourite genres</Text>

            <View style={styles.expandableRight}>

              <IconButton
                icon="pencil"
                size={20}
                onPress={() => openSelector("genres")}
                iconColor={theme.colors.primary}
                rippleColor={setAlpha(theme.colors.primary, 0.08)}
              />
            </View>
          </View>
        </Surface>

        {/* Bottom action buttons */}
        <View style={styles.buttonsWrap}>
          <GradientButton onPress={apply} style={{ marginBottom: 12 }}>
            Apply
          </GradientButton>

          <GradientButton mode="text" onPress={cancel} style={{ marginBottom: 6 }}>
            Cancel
          </GradientButton>
        </View>
      </ScrollView>

      {/* Modal wrapper for SelectableListForm */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setModalType(null);
        }}
      >
        <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
              <SelectableListForm
              pTop={0}
                items={buildItemsForModal()}
                title={
                  modalType === "country"
                    ? "Select country"
                    : modalType === "platforms"
                    ? "Select platforms"
                    : modalType === "genres"
                    ? "Select genres"
                    : modalType === "icon"
                    ? "Select avatar"
                    : ""
                }
                buttonText="Done"
                mandatory={modalType === "country"} // country required if you want that behaviour
                onSubmit={(selected) => {
                  // selected -> array of items selected
                  handleSelectionSubmit(selected);
                }}
                showGoBack={false}
                showSelectButton={modalType !== "icon" && modalType !== "country"}
                unitarySelection={modalType === "country" || modalType === "icon"}
                initialSelected={modalType === "icon" ? [icon] : modalType === "country" && country?.id ? [country.id] 
                  : modalType === "platforms" ? platforms.map((p) => p.id) 
                  : modalType === "genres" ? genres.map(g=>g.id) : []}
              />
        </View>
      </Modal>
    </View>
  );
}

/* Styles - mostly consistent with your Profile.js */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 128 },
  avatarWrap: { alignItems: "center", marginTop: 8, marginBottom: 20 },
  avatar: { elevation: 8 },
  nameText: { marginTop: 12, fontSize: 20, fontWeight: "700" },

  infoSurface: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: { fontSize: 15, fontWeight: "700" },
  infoValue: { fontSize: 15, opacity: 0.95, maxWidth: width * 0.45, textAlign: "right" },
  divider: { height: 1 },

  countryRight: { flexDirection: "row", alignItems: "center" },

  /* Expandable specific (reused) */
  expandableRight: { flex: 1, alignItems: "flex-end" },
  expandedListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  expandedList: {
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
  },

  buttonsWrap: { marginTop: 6, marginBottom: 16, paddingHorizontal: 6 },

  /* Modal styles - similar to Profile.js */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    maxHeight: "90%",
    width: "100%",
    position: "absolute",
    left: 0,
    top: Platform.OS === "ios" ? 75 : 50,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
  },
  modalSurface: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
});
