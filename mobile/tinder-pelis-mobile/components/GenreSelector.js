import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import Seleccionable from './Seleccionable';

// Genres available for selection (moved from GroupCode)
const allGenres = [
  "Action",
  "Action & Adventure", 
  "Adventure",
  "Animation",
  "Anime",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Food",
  "Game Show",
  "History",
  "Horror",
  "Kids",
  "Music",
  "Musical",
  "Mystery",
  "Nature",
  "News",
  "Reality",
  "Romance",
  "Sci-Fi & Fantasy",
  "Science Fiction",
  "Soap",
  "Sports",
  "Supernatural",
  "Talk",
  "Thriller",
  "Travel",
  "TV Movie",
  "War",
  "War & Politics",
  "Western"
];

export default function GenreSelector({ 
  visible, 
  onClose, 
  onSubmit,
  loading = false,
  initialGenres = []
}) {
  const theme = useTheme();
  const [selectedGenres, setSelectedGenres] = useState(initialGenres);

  const handleClose = () => {
    setSelectedGenres(initialGenres);
    onClose();
  };

  const toggleGenre = (genre, selected) => {
    if (selected) {
      setSelectedGenres(prev => [...prev, genre]);
    } else {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedGenres);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent={false}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          padding: 25,
          paddingVertical: Platform.OS === "ios" ? 70 : 35,
          backgroundColor: theme.colors.background,
        }}
      >
        {/* Header with Close button */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View style={{ width: 40 }}>{/* para centrar */}</View>
          <Text
            style={{
              color: theme.colors.text,
              fontWeight: "700",
              fontSize: 18,
              textAlign: "center",
              flex: 1,
            }}
          >
            Select Genres
          </Text>

          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <Text
              style={{
                width: 40,
                color: theme.colors.primary,
                fontSize: 16,
                fontWeight: "600",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {selectedGenres.length > 0 ? (loading ? "Joining..." : "Join") : "Skip"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Top divider */}
        <Divider
          style={{
            backgroundColor: theme.colors.primary,
            width: "100%",
            height: 5,
            borderRadius: 5,
          }}
        />

        {/* Scrollable genre list */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {allGenres.map((genre) => (
            <View key={genre} style={{ marginTop: 12 }}>
              <Seleccionable
                label={genre}
                initialSelected={selectedGenres.includes(genre)}
                onSelect={(selected) => toggleGenre(genre, selected)}
                width="100%"
                fontSize={18}
              />
            </View>
          ))}
        </ScrollView>

        {/* Bottom divider */}
        <Divider
          style={{
            backgroundColor: theme.colors.primary,
            width: "100%",
            height: 5,
            borderRadius: 5,
            marginBottom: 16,
          }}
        />

        {/* Bottom button — keep Skip/Join logic */}
        <TouchableOpacity
          onPress={onClose}
          disabled={loading}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 25,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 17,
              fontWeight: "800",
              opacity: loading ? 0.5 : 1,
            }}
          >
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
