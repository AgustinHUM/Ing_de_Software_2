import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  PanResponder,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const movies = [
  {
    id: "m1",
    title: "Interstellar",
    genres: ["Ciencia Ficción", "Superhéroes"],
    poster: require("../assets/interstellar.jpg"),
    rating: 8.7,
    year: 2014,
    runtime: "169",
    description:
      "After the devastating events of Avengers: Infinity War, the universe is in ruins. The Avengers assemble once more to undo Thanos’ actions and restore balance to the universe.",
  },
  {
    id: "m2",
    title: "Los tipos malos 2",
    genres: ["Acción", "Animación", "Crimen"],
    poster: require("../assets/the_bad_guys_2.jpg"),
    rating: 7.3,
    year: 2023,
    runtime: "100",
    description:
      "The Bad Guys return for another thrilling adventure as they navigate their way through a heist gone wrong.",
  },
  {
    id: "m3",
    title: "Jaws",
    genres: ["Terror", "Thriller"],
    poster: require("../assets/jaws.jpg"),
    rating: 8.0,
    year: 1975,
    runtime: "124",
    description:
      "A giant great white shark terrorizes a small resort town, prompting the local sheriff, a marine biologist, and a grizzled fisherman to hunt it down.",
  },
];

export default function MovieMatch() {
  const theme = useTheme();
  const navigation = useNavigation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSynopsis, setShowSynopsis] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;

  // Handle swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10,
      onPanResponderMove: Animated.event([null, { dx: position.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          swipe("right");
        } else if (gesture.dx < -120) {
          swipe("left");
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const swipe = (direction) => {
    const toValue = direction === "right" ? width : -width;
    Animated.timing(position, {
      toValue: { x: toValue, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setCurrentIndex((prev) => prev + 1);
      position.setValue({ x: 0, y: 0 });
      setShowSynopsis(false);
    });
  };

  const movie = movies[currentIndex];
  if (!movie)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: Platform.OS === "ios" ? 80 : 45,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 28,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          No more movies!
        </Text>
        <Text
          style={{
            color: theme.colors.secondary,
            fontSize: 18,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          Wait for your friends to finish swiping.
        </Text>
      </View>
    );

  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === "ios" ? 80 : 45,
        alignItems: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 28,
          fontWeight: "800",
          marginBottom: 20,
        }}
      >
        Movie Match
      </Text>

      <Animated.View
        {...panResponder.panHandlers}
        style={{
          width: "90%",
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: theme.colors.elevation.level1,
          transform: [
            { translateX: position.x },
            {
              rotate: position.x.interpolate({
                inputRange: [-width / 2, 0, width / 2],
                outputRange: ["-10deg", "0deg", "10deg"],
              }),
            },
          ],
          elevation: 4,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowSynopsis((prev) => !prev)}
        >
          <Image
            source={movie.poster}
            style={{ width: "100%", height: 450, resizeMode: "cover" }}
          />
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 24,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              {movie.title}
            </Text>
            <Text
              style={{
                color: theme.colors.secondary,
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              ⭐ {movie.rating} • {movie.year} • {movie.runtime} min •{" "}
              {movie.genres[0]}
            </Text>

            {showSynopsis && (
              <ScrollView
                style={{
                  maxHeight: 120,
                  marginTop: 10,
                  borderTopWidth: 1,
                  borderColor: theme.colors.outlineVariant,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 16,
                    lineHeight: 22,
                    marginTop: 8,
                  }}
                >
                  {movie.description}
                </Text>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          width: "80%",
          marginTop: 30,
        }}
      >
        <TouchableOpacity onPress={() => swipe("left")}>
          <MaterialCommunityIcons
            name="close"
            size={60}
            color={theme.colors.error}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => swipe("right")}>
          <MaterialCommunityIcons
            name="heart"
            size={60}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("SavedMovies")}
          style={{
            backgroundColor: "#FFD700",
            borderRadius: 40,
            padding: 10,
          }}
        >
          <MaterialCommunityIcons name="bookmark" size={45} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
