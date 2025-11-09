import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { 
  getMatchSessionStatus, 
  submitAllVotes,
  endMatchSession 
} from "../src/services/api";
import { useMatchingWebSocket } from "../websockets/useMatchingWebSocket";


const { width } = Dimensions.get("window");

export default function GroupSwiping({ route, navigation }) {
  const theme = useTheme();
  // const navigation = useNavigation(); // Remove this since we get it from props
  
  // Get params from navigation
  const { groupId, sessionId, groupName, isSoloSession } = route.params || {};
  
  // Session state
  const [session, setSession] = useState(null);
  const [movies, setMovies] = useState([]);
  const [userVotes, setUserVotes] = useState({}); // {movieId: true/false}
  const [loading, setLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // WebSocket connection for real-time updates
  const { isConnected, disconnect } = useMatchingWebSocket(sessionId, {
    onVotesSubmitted: (data) => {
      console.log('Someone submitted votes:', data);
      fetchSessionData(); // Update voting progress
    },
    
    onMatchingComplete: (data) => {
      console.log('Matching complete! Results:', data.results);
      // Navigate directly to MatchedMovie without alert
      navigation.navigate('MatchedMovie', { 
        results: data.results,
        sessionId,
        groupId,
        groupName,
        isSoloSession
      });
    },

    onSessionEnded: () => {
      Alert.alert(
        'Session Ended',
        'The session has been ended by the creator.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  });

  // Fetch session data and movies
  const fetchSessionData = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const response = await getMatchSessionStatus(sessionId, token);
      setSession(response);
      setMovies(response.movies || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch session data:', error);
      Alert.alert('Error', 'Failed to load session data');
      navigation.goBack();
    }
  };

  // Load session data on mount
  useEffect(() => {
    if (!sessionId) {
      Alert.alert('Error', 'No session ID provided');
      navigation.goBack();
      return;
    }
    fetchSessionData();
  }, [sessionId]);

  // Cleanup WebSocket when leaving screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      disconnect();
    });
    return unsubscribe;
  }, [navigation, disconnect]);

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
  
  // Position for swipe animation
  const position = useRef(new Animated.ValueXY()).current;
  
  const calculateSynopsisHeight = (text) => {
    const wordsPerLine = 8; // Approximate words per line
    const lineHeight = 20;
    const padding = 20;
    const words = text.split(' ').length;
    const lines = Math.ceil(words / wordsPerLine);
    const calculatedHeight = Math.min(lines * lineHeight + padding, 180); // Cap at 180px
    return Math.max(calculatedHeight, 80); // Minimum 80px
  };

  // No PanResponder needed - only button-based swiping

  const swipe = (direction) => {
    if (!movie) return;
    
    // Record the vote
    const vote = direction === "right"; // true for like, false for dislike
    const newVotes = {
      ...userVotes,
      [movie.id]: vote
    };
    setUserVotes(newVotes);

    const toValue = direction === "right" ? width * 1.2 : -width * 1.2;
    Animated.timing(position, {
      toValue: { x: toValue, y: 0 },
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      // reset and move to next
      panelHeight.setValue(INFO_HEIGHT);
      synopsisOpacity.setValue(0);
      setIsOpen(false);

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // reset animation AFTER next card mounts
      setTimeout(() => {
        position.setValue({ x: 0, y: 0 });
      }, 0);

      // Auto-submit when finished
      if (nextIndex >= movies.length) {
        handleAutoSubmitVotes(newVotes);
      }
    });
  };

  // Auto-submit votes when all movies are completed
  const handleAutoSubmitVotes = async (votesToSubmit = userVotes) => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("userToken");
      console.log('Auto-submitting votes:', votesToSubmit);
      console.log('Movies count:', movies.length, 'Votes count:', Object.keys(votesToSubmit).length);
      console.log('Movie IDs in votes:', Object.keys(votesToSubmit));
      console.log('Movie IDs from movies array:', movies.map(m => m.id));
      
      // Log which movies were liked vs disliked
      Object.entries(votesToSubmit).forEach(([movieId, liked]) => {
        const movie = movies.find(m => m.id == movieId);
        console.log(`Vote: ${movie?.title || movieId} - ${liked ? 'LIKED' : 'DISLIKED'}`);
      });
      
      await submitAllVotes(sessionId, votesToSubmit, token);
      setHasSubmitted(true);
      // User will be automatically taken to results via WebSocket
    } catch (error) {
      console.error('Failed to submit votes:', error);
      Alert.alert('Error', 'Failed to submit votes. Please try again.');
    } finally {
      setLoading(false);
    }
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
  
  // Check if all movies have been voted on
  const allMoviesVoted = Object.keys(userVotes).length === movies.length;
  
  // Show loading screen while fetching data
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text, fontSize: 16 }}>Loading session...</Text>
      </View>
    );
  }

  // Show waiting screen after votes are submitted (removed submit votes screen)
  if (hasSubmitted || (allMoviesVoted && currentIndex >= movies.length)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, padding: 20 }}>
        <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          ✅ Votes Submitted!
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
          Waiting for results...
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 14, opacity: 0.7, textAlign: 'center' }}>
          You'll be automatically taken to the winner when ready!
        </Text>
      </View>
    );
  }

  // No movie to show (shouldn't happen with proper error handling)
  if (!movie) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text, fontSize: 16 }}>No movies available</Text>
      </View>
    );
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
          marginBottom: 10,
        }}
      >
         Movie <Text style={{ color: theme.colors.primary }}>Mingle</Text>
      </Text>

      {/* Progress indicator */}
      <Text style={{ 
        color: theme.colors.text, 
        fontSize: 16, 
        marginBottom: 20,
        opacity: 0.8 
      }}>
        {groupName}
      </Text>

      {/* WebSocket status indicator */}
      <Text style={{ 
        color: isConnected ? '#4CAF50' : '#FF5722', 
        fontSize: 12, 
        marginBottom: 15,
        opacity: 0.8 
      }}>
        {/* Removed live updates text */}
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
            {movie.poster ? (
              <Image
                source={{ uri: movie.poster }}
                style={{ width: "100%", height: 480, resizeMode: "cover" }}
              />
            ) : (
              <View style={{ 
                width: "100%", 
                height: 480, 
                backgroundColor: theme.colors.surface,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <MaterialCommunityIcons 
                  name="film" 
                  size={100} 
                  color={theme.colors.onSurface}
                  style={{ opacity: 0.3 }}
                />
                <Text style={{ 
                  color: theme.colors.onSurface, 
                  fontSize: 16, 
                  marginTop: 10,
                  opacity: 0.6
                }}>
                  No poster available
                </Text>
              </View>
            )}
          </View>

          <Animated.View //Bottom panel
            style={{
              position: "absolute",
              bottom: 0, // anchor to bottom of the card
              left: 0,
              right: 0,
              height: panelHeight, // animated height
            }}
          >
            {/* Gradient overlay */}
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
                  paddingBottom: 10,
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

      {/* Barra de botones inferior (dislike, guardar, like) */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          width: "80%",
          marginTop: 25,
        }}
      >
        <TouchableOpacity
          onPress={() => swipe("left")}
          style={{
            width: 70,
            height: 70,
            borderRadius: 50,
            backgroundColor: "#FF4444",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="close" size={30} color="white" fontWeight />
        </TouchableOpacity>

        <TouchableOpacity
        //  Hay que cambiar esto para que guarde la peli en favoritos
          style={{
            width: 55,
            height: 55,
            borderRadius: 30,
            marginTop: 5, 
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
            width: 70,
            height: 70,
            borderRadius: 50,
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
