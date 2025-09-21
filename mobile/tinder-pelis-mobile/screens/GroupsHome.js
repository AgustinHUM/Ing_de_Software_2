import React, { useState } from "react";
import { View, Modal, Pressable, TouchableOpacity, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

import Searchbar from "../components/Searchbar";
import GradientButton from "../components/GradientButton"; // lo usamos dentro del popup

const { width } = Dimensions.get("window");

export default function GroupsHome({ navigation }) {
  const theme = useTheme();
  const [showPopup, setShowPopup] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 20 }}>
      {/* Título */}
      <View style={{ height: 16 }} />
      <Text style={{ textAlign: "center", fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        My Groups
      </Text>

      {/* Search (no hace nada aún) */}
      <Searchbar placeholder="Search for a group" />

      <View style={{ height: 32 }} />

      {/* Estado vacío */}
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 8 }}>Looks empty...</Text>

        {/* Sofá como icono (no agregamos imágenes nuevas) */}
        <MaterialCommunityIcons name="sofa" size={Math.min(width * 0.45, 220)} color="tomato" />

        <Text style={{ marginTop: 8, opacity: 0.9 }}>Add a group to begin!</Text>

        {/* Textito inferior (como en el mockup) */}
        <View style={{ position: "absolute", bottom: 28, left: 0, right: 0, paddingHorizontal: 20 }}>
          <Text style={{ textAlign: "center", opacity: 0.95 }}>
            Planning a movie night?{"\n"}Create a new group{"\n"}Or join one!
          </Text>
        </View>
      </View>

      {/* Botón flotante + */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => setShowPopup(true)}
        style={{ position: "absolute", right: 24, bottom: 100 }}
      >
        <LinearGradient
          colors={["#FF8A00", "#FFC300"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
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

      {/* POPUP con opciones (Create / Join) */}
      <Modal
        transparent
        visible={showPopup}
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        {/* fondo oscuro clickeable */}
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={() => setShowPopup(false)} />

        {/* opciones arriba de la Appbar, a la derecha (como el mockup) */}
        <View style={{ position: "absolute", right: 16, bottom: 96, alignItems: "flex-end", gap: 12 }}>
          {/* Botón Create group (usa tu GradientButton) */}
          <GradientButton
            fullWidth={false}
            onPress={() => {
              setShowPopup(false);
              navigation.navigate("CreateGroup");
            }}
          >
            Create group
          </GradientButton>

          {/* Botón Join group (outlined simple) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setShowPopup(false);
              navigation.navigate("JoinGroup");
            }}
            style={{
              borderRadius: 999,
              borderWidth: 2,
              borderColor: "#FF8A00",
              paddingVertical: 12,
              paddingHorizontal: 18,
              backgroundColor: "transparent",
            }}
          >
            <Text style={{ fontWeight: "700" }}>Join group</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}