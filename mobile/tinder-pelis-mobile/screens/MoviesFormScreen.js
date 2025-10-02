import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { Divider, IconButton, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import SearchBar from "../components/Searchbar";
import GradientButton from "../components/GradientButton";
import { useNavigation, useRoute } from "@react-navigation/native";
import FilmDisplay from "../components/FilmDisplay";
import * as SecureStore from "expo-secure-store";
import { saveForm } from "../src/services/api";
import { useAuth } from "../AuthContext";

export default function MoviesFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { setFormPendingAsync, withBusy } = useAuth();
  const MOVIES = useMemo(
    () => [
      { id: "m1", title: "Avengers: Endgame", poster: require("../assets/avengers_endgame.jpg") },
      { id: "m2", title: "Los tipos malos 2", poster: require("../assets/the_bad_guys_2.jpg") },
      { id: "m3", title: "Jaws", poster: require("../assets/jaws.jpg") },
      { id: "m4", title: "Mufasa", poster: require("../assets/mufasa.jpg") },
      { id: "m5", title: "Scott Pilgrim vs. the World", poster: { uri: "https://cdn.watchmode.com/posters/01336293_poster_w342.jpg" } },
      { id: "m6", title: "The Greatest Showman", poster: require("../assets/greatest_showman.jpg") },
    ],
    []
  );

  const prevResults = route?.params?.formResults ?? {};

  const title = "Movies you've loved";
  const buttonText = "End form";

  const [filteredItems, setFilteredItems] = useState(MOVIES);
  const [selectedIds, setSelectedIds] = useState([]);

const handleFinish = async () => {
  try {
    await withBusy(async () => {
      const email = await SecureStore.getItemAsync("lastLoginEmail");
      if (email) {
        await SecureStore.deleteItemAsync("lastLoginEmail");
      }
      const token = await SecureStore.getItemAsync("userToken");
      const formResults = { ...prevResults, movies: selectedIds };
      console.log("Form results: ", formResults);

      await saveForm(formResults, token);

      await setFormPendingAsync(false);
    });

    console.log("Formulario guardado y formPending actualizado");
    
    navigation.navigate("MainApp");
  } catch (err) {
    console.log("Error saving form:", err);
  }
};

  const normalize = (str = "") =>
    String(str)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  useEffect(() => {
    setFilteredItems(MOVIES);
    setSelectedIds((prev) => prev.filter((id) => MOVIES.some((it) => it.id === id)));
  }, [MOVIES]);

  const filterByQuery = useCallback(
    (query) => {
      const q = normalize((query || "").trim());
      if (!q) {
        setFilteredItems(MOVIES);
        return;
      }
      setFilteredItems(MOVIES.filter((it) => normalize(it.title).includes(q)));
    },
    [MOVIES]
  );

  const toggleSelected = useCallback(
    (id, selected) => {
      setSelectedIds((prev) => {
        const exists = prev.includes(id);
        if (selected) {
          if (!exists) return [...prev, id];
          return prev;
        } else {
          if (exists) return prev.filter((n) => n !== id);
          return prev;
        }
      });
    },
    []
  );

  return (
    <View style={{ flex: 1, paddingTop: 40, backgroundColor: theme.colors.background }}>
      <View style={{ flexDirection: "row", paddingHorizontal: 25, alignItems: "center", justifyContent: "space-between" }}>
        <IconButton icon={() => <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />} onPress={() => navigation.goBack()} />
        <GradientButton mode="text" onPress={handleFinish}>
          {buttonText}
        </GradientButton>
      </View>

      <View style={{ flexDirection: "column", paddingHorizontal: 25, justifyContent: "center", alignItems: "center" }}>
        <View style={{ alignItems: "center", width: "75%" }}>
          <Text variant="headlineSmall" style={{ marginVertical: 12, textAlign: "center", color: theme.colors.text, fontWeight: 700 }}>
            {title}
          </Text>
        </View>

        <View style={{ flexDirection: "row", width: "100%", marginVertical: "3%", gap: "3%" }}>
          <View style={{ flex: 1 }}>
            <SearchBar onSubmit={filterByQuery} />
          </View>
        </View>

        <Divider
          style={{
            backgroundColor: theme.colors.primary,
            width: "100%",
            height: 5,
            borderRadius: 5,
            marginTop: 16,
          }}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 128, paddingHorizontal: 25 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: 16, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {filteredItems.map((movie) => (
            <FilmDisplay
              width={"30%"}
              key={movie.id}
              movie={movie}
              // initial selection based on id
              initialSelected={selectedIds.includes(movie.id)}
              toggleable={true}
              // report selected boolean; we forward id so parent knows which movie toggled
              onPress={(selected) => toggleSelected(movie.id, selected)}
            />
          ))}

          {filteredItems.length % 3 === 2 && (
            <View style={{ width: "30%" }}>
              <View style={{ marginBottom: 16, width: "100%", aspectRatio: 2 / 3, borderRadius: 15, overflow: "hidden", backgroundColor: "transparent" }} />
            </View>
          )}

          {filteredItems.length === 0 && (
            <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
              <Text style={{ color: theme.colors.text }}>No movies found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
