import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";


const { width } = Dimensions.get("window");


// ---------- Peliculas hardcodeadas ----------
const movies = [
  {
    id: "m1",
    title: "Clueless",
    genres: ["Romantic comedy"],
    poster: require("../assets/jaws.jpg"),
    rating: 6.9,
    year: 1996,
    runtime: "97",
    description:
      "A popular Beverly Hills teen, confident in her style and social skills, spends her time matchmaking for friends and improving lives around her. Along the way, she faces unexpected lessons about friendship, romance, and self-awareness.",
  },
  {
    id: "m2",
    title: "Interstellar",
    genres: ["Science fiction"],
    poster: require("../assets/interstellar.jpg"),
    rating: 8.7,
    year: 2014,
    runtime: "169",
    description:
      "A group of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  },
  {
    id: "m3",
    title: "The Bad Guys 2",
    genres: ["Action", "Animation"],
    poster: require("../assets/the_bad_guys_2.jpg"),
    rating: 7.3,
    year: 2023,
    runtime: "100",
    description:
      "The Bad Guys return for another thrilling adventure as they navigate their way through a heist gone wrong.",
  },
];

export default function MovieMatch() {
  const theme = useTheme();
  const navigation = useNavigation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // ---------------------------
  // CONFIG: sizes you can tweak
  // ---------------------------
  const INFO_HEIGHT = 100; // height of the bottom info bar when closed (title + small meta)
  const MAX_EXPANDED_HEIGHT = 280; // maximum height when open (info + synopsis visible)
  // ---------------------------

  // Animated height for the bottom panel (starts closed)
  const panelHeight = useRef(new Animated.Value(INFO_HEIGHT)).current;
  // Animated opacity for synopsis text
  const synopsisOpacity = useRef(new Animated.Value(0)).current;
  
  // Function to calculate synopsis height based on text length
  const calculateSynopsisHeight = (text) => {
    const wordsPerLine = 8; // Approximate words per line
    const lineHeight = 20;
    const padding = 40; // Extra padding for title and margins
    const words = text.split(' ').length;
    const lines = Math.ceil(words / wordsPerLine);
    const calculatedHeight = Math.min(lines * lineHeight + padding, 180); // Cap at 180px
    return Math.max(calculatedHeight, 80); // Minimum 80px
  };

  // swipe position for whole card
  const position = useRef(new Animated.ValueXY()).current;

  // No PanResponder needed - only button-based swiping

  const swipe = (direction) => {
    const toValue = direction === "right" ? width * 1.2 : -width * 1.2;
    Animated.timing(position, {
      toValue: { x: toValue, y: 0 },
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      // reset and move to next
      position.setValue({ x: 0, y: 0 });
      panelHeight.setValue(INFO_HEIGHT);
      synopsisOpacity.setValue(0);
      setIsOpen(false);
      setCurrentIndex((prev) => prev + 1);
    });
  };

  // Toggle open/close: animate height (grow/shrink) and synopsis opacity
  const togglePanel = () => {
    const synopsisHeight = calculateSynopsisHeight(movie.description);
    const openTo = isOpen ? INFO_HEIGHT : INFO_HEIGHT + synopsisHeight;
    const opacityTo = isOpen ? 0 : 1;

    // animate height (must use useNativeDriver: false for height)
    Animated.timing(panelHeight, {
      toValue: openTo,
      duration: 350,
      useNativeDriver: false,
    }).start();

    // animate synopsis opacity (can use native driver)
    Animated.timing(synopsisOpacity, {
      toValue: opacityTo,
      duration: 250,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };

  const movie = movies[currentIndex];
  
  // Navigate to MatchedMovie screen when all movies are finished
  React.useEffect(() => {
    if (!movie) {
      navigation.navigate("MatchedMovie");
    }
  }, [movie, navigation]);
  
  if (!movie) {
    return null; // Return null while navigating
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 5,
      }}
    >
      {/* Screen title */}
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 30,
          fontWeight: "800",
          marginBottom: 30,
        }}
      >
         Movie <Text style={{ color: theme.colors.primary }}>Matching</Text>
      </Text>

       {/* Card (button-swipeable only) */}
       <Animated.View
         style={{
           width: "85%",
           borderRadius: 18,
           overflow: "hidden",
           backgroundColor: theme.colors.surface,
           transform: [
             { translateX: position.x },
           ],
           elevation: 4,
         }}
       >
        {/* Touching poster toggles the bottom panel */}
        <TouchableOpacity activeOpacity={0.95} onPress={togglePanel}>
          {/* Poster image with glow effect */}
          <View
            style={{
              borderRadius: 18,
              overflow: "hidden",
              backgroundColor: theme.colors.surface,
              borderWidth: 3,
              borderColor: theme.colors.primary + "50", // 50 = 0.5 opacity
              shadowColor: theme.colors.primary,
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.6,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Image
              source={movie.poster}
              style={{ width: "100%", height: 480, resizeMode: "cover" }}
              
            />
          </View>

          {/* ========================
              Bottom panel (anchored to bottom)
              - We animate its height (panelHeight) so it grows upward
              - Inside: first the info row (always visible), then the synopsis area (opacity-controlled)
             ======================== */}
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0, // anchor to bottom of the card
              left: 0,
              right: 0,
              height: panelHeight, // animated height
            }}
          >
            {/* Gradient overlay for nicer legibility */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.95)"]}
              style={{ flex: 1 }}
            >
              {/* Info row (title, rating) - stays at the top of the panel */}
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 12,
                  paddingBottom: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      color: "white",
                      fontSize: 24,
                      fontWeight: "700",
                      flex: 1,
                    }}
                  >
                    {movie.title}
                  </Text>

                  <MaterialCommunityIcons
                    name="star"
                    size={16}
                    color="#FFA500"
                    style={{ marginRight: 4 }}
                    
                  />
                  <Text style={{ color: "white", fontWeight: "600" }}>
                    {movie.rating}
                  </Text>
                </View>

                <Text style={{ color: "white", fontSize: 14, opacity: 0.92 }}>
                  {movie.year} • {movie.genres.join(", ")} • {movie.runtime} min
                </Text>
              </View>

              {/* Synopsis container - visible only when open.
                  We use Animated.View opacity + a little translate for a nicer touch.
                  The ScrollView is limited so it won't push layout beyond EXPANDED_HEIGHT. */}
              <Animated.View
                style={{
                  opacity: synopsisOpacity,
                  transform: [
                    {
                      translateY: synopsisOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                  paddingHorizontal: 16,
                  paddingBottom: 12,
                }}
                pointerEvents={isOpen ? "auto" : "none"} // disable interaction when closed
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 15,
                    fontWeight: "700",
                    marginBottom: 6,
                  }}
                >
                  Synopsis:
                </Text>

                 <ScrollView
                   style={{ maxHeight: calculateSynopsisHeight(movie.description) - 18 }}
                   showsVerticalScrollIndicator={false}
                 >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 14,
                      lineHeight: 20,
                      opacity: 0.95,
                    }}
                  >
                    {movie.description}
                  </Text>
                </ScrollView>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Action buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          width: "70%",
          marginTop: 25,
        }}
      >
        <TouchableOpacity
          onPress={() => swipe("left")}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#FF4444",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="close" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("AddToFavourites")}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#FF8A00",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="bookmark" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => swipe("right")}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#4CAF50",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="heart" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
