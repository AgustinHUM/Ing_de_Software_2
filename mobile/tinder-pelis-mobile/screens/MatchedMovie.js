import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const movies = [
  {
    id: "m1",
    title: "Jaws",
    genres: ["Romantic comedy"],
    poster: require("../assets/jaws.jpg"),
    rating: 6.9,
    year: 1996,
  },
  {
    id: "m2",
    title: "Interstellar",
    genres: ["Science fiction"],
    poster: require("../assets/interstellar.jpg"),
    rating: 8.7,
    year: 2014,
  },
  {
    id: "m3",
    title: "The Bad Guys 2",
    genres: ["Action", "Animation"],
    poster: require("../assets/the_bad_guys_2.jpg"),
    rating: 7.3,
    year: 2023,
  },
];

export default function MatchedMovie() {
  const theme = useTheme();
  const navigation = useNavigation();

  const randomMovie = movies[Math.floor(Math.random() * movies.length)];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      {/* Title */}
      <Text
        style={{
          color: "#FFA500",
          fontSize: 55,
          fontWeight: "900",
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        It’s a match!
      </Text>

      <Text
        style={{
          color: "white",
          fontSize: 17,
          marginBottom: 20,
          textAlign: "center",
          opacity: 0.9,
        }}
      >
        Your group also loved this movie:
      </Text>

      {/* Movie card */}
      <View
        style={{
          width: width * 0.78,
          borderRadius: 18,
          overflow: "hidden",
          borderWidth: 2.5,
          borderColor: "#FFA500",
          shadowColor: "#FFA500",
          shadowOpacity: 0.3,
          shadowRadius: 10,
        }}
      >
        <Image
          source={randomMovie.poster}
          style={{
            width: "100%",
            height: 450,
            resizeMode: "cover",
          }}
        />

        {/* Gradient overlay for text */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            paddingVertical: 15,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 22,
              fontWeight: "800",
              marginBottom: 4,
            }}
          >
            {randomMovie.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="star"
              size={16}
              color="#FFA500"
              style={{ marginRight: 4 }}
            />
            <Text style={{ color: "white", fontWeight: "600", marginRight: 8 }}>
              {randomMovie.rating}
            </Text>
            <Text style={{ color: "white", opacity: 0.9 }}>
              {randomMovie.year} – {randomMovie.genres.join(", ")}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Subtitle */}
      <Text
        style={{
          color: "white",
          fontSize: 15,
          marginTop: 20,
          opacity: 0.5,
          textAlign: "center",
        }}
      >
        Are you happy with the matched movie?
      </Text>

      {/* Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
          marginTop: 18,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("GroupSwiping")}
          style={{
            backgroundColor: "#FF4444",
            borderRadius: 30,
            paddingVertical: 12,
            paddingHorizontal: 26,
            minWidth: 160,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 17,
              fontWeight: "800",
            }}
          >
            ←   Try Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Favourites")}
          style={{
            backgroundColor: "#4CAF50",
            borderRadius: 25,
            paddingVertical: 12,
            paddingHorizontal: 26,
            minWidth: 160,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 17,
              fontWeight: "800",
            }}
          >
            Keep Match →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
