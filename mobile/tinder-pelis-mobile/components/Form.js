import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, View } from "react-native";
import { Divider, IconButton, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import SearchBar from "../components/Searchbar";
import Seleccionable from "../components/Seleccionable";
import GradientButton from "../components/GradientButton";
import { useNavigation } from "@react-navigation/native";

export default function SelectableListForm({
  items = [], // { name: string, icon?: img }
  title = "",
  buttonText = "Next",
  mandatory = false,
  onSubmit = null, // (selectedItems) => {}
  showGoBack = true,
  showSelectButton = true,
  unitarySelection = false, 
}) {
  const theme = useTheme();
  const navigation = useNavigation();
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedNames, setSelectedNames] = useState([]);

  const normalize = (str = "") =>
    String(str)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  useEffect(() => {
    setFilteredItems(items);
    setSelectedNames((prev) => {
      const filtered = prev.filter((n) => items.some((it) => it.name === n));
      if (unitarySelection && filtered.length > 1) return [filtered[0]];
      return filtered;
    });
  }, [items, unitarySelection]);

  const filterByQuery = useCallback(
    (query) => {
      const q = normalize((query || "").trim());
      if (!q) {
        setFilteredItems(items);
        return;
      }
      setFilteredItems(items.filter((it) => normalize(it.name).includes(q)));
    },
    [items]
  );

  const toggleSelected = useCallback(
    (name, selected) => {
      setSelectedNames((prev) => {
        const exists = prev.includes(name);

        // Unit-only selection mode
        if (unitarySelection) {
          if (selected) {
            // selecting an item -> replace with this single selection
            if (exists) return prev; // already selected
            return [name];
          } else {
            // deselecting -> remove it
            if (exists) return prev.filter((n) => n !== name);
            return prev;
          }
        }

        // Multi-selection mode (original behavior)
        if (selected) {
          if (!exists) return [...prev, name];
          return prev;
        } else {
          if (exists) return prev.filter((n) => n !== name);
          return prev;
        }
      });
    },
    [unitarySelection]
  );

  const handleMainButton = useCallback(() => {
    if (typeof onSubmit === "function") {
      const selectedItems = items.filter((item) => selectedNames.includes(item.name));
      onSubmit(selectedItems);
    }
  }, [onSubmit, selectedNames, items]);

  const allVisibleSelected =
    filteredItems.length > 0 && filteredItems.every((it) => selectedNames.includes(it.name));

  const toggleSelectAllVisible = useCallback(() => {
    const visibleNames = filteredItems.map((it) => it.name);
    setSelectedNames((prev) => {
      const allSelected = visibleNames.length > 0 && visibleNames.every((n) => prev.includes(n));
      if (!allSelected) {
        // If unitarySelection, only pick the first visible item
        if (unitarySelection) {
          if (visibleNames.length === 0) return prev;
          return [visibleNames[0]];
        }
        // otherwise add all visible to the selection
        const set = new Set(prev);
        visibleNames.forEach((n) => set.add(n));
        return Array.from(set);
      } else {
        // Deselect visible
        return prev.filter((n) => !visibleNames.includes(n));
      }
    });
  }, [filteredItems, unitarySelection]);

  return (
    <View style={{ flex: 1, paddingTop: 40, paddingHorizontal: 25, backgroundColor: theme.colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        {showGoBack ? (
          <IconButton
            icon={() => <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />}
            onPress={() => navigation.goBack()}
          />
        ) : (
          <View style={{ width: 48 }} />
        )}

        <GradientButton mode="text" onPress={handleMainButton} disabled={!!(mandatory && selectedNames.length === 0)}>
          {buttonText}
        </GradientButton>
      </View>

      <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <View style={{ alignItems: "center", width: "75%" }}>
          <Text variant="headlineSmall" style={{ marginVertical: 12, textAlign: "center", color: theme.colors.text, fontWeight: 700 }}>
            {title}
          </Text>
        </View>

        <View style={{ flexDirection: "row", width: "100%", marginVertical: "3%", gap: "3%" }}>
          <View style={{ flex: 1 }}>
            <SearchBar onSubmit={filterByQuery} />
          </View>
          {showSelectButton ? (
            <View style={{ alignItems: "center" }}>
              <GradientButton mode="outlined" onPress={toggleSelectAllVisible}>
                {allVisibleSelected ? "Deselect all" : "Select all"}
              </GradientButton>
            </View>
          ) : null}
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

      <ScrollView contentContainerStyle={{ paddingBottom: 128 }} showsVerticalScrollIndicator={false}>
        {filteredItems.map((it) => (
          <View key={`${it.name}-${selectedNames.includes(it.name)}`} style={{ marginTop: 12 }}>
            <Seleccionable
              label={it.name}
              height={75}
              icon={it.icon}
              iconHeight={48}
              iconWidth={48}
              initialSelected={selectedNames.includes(it.name)}
              onSelect={(selected) => toggleSelected(it.name, selected)}
              width="100%"
              fontSize={18}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
