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
import { StyleSheet } from "react-native";
import LoadingBox from "../components/LoadingBox";

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
  const [isAnimating, setIsAnimating] = useState(false);

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
        groupName: groupName ?? 'Solo Session',
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
      console.log(response.movies);
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
    const padding = 36;
    const words = text.split(' ').length;
    const lines = Math.ceil(words / wordsPerLine);
    const calculatedHeight = Math.min(lines * lineHeight + padding, 280); // Cap at 180px
    return Math.max(calculatedHeight, 80); // Minimum 80px
  };

  // No PanResponder needed - only button-based swiping

  const swipe = (direction) => {
    if (!movie || isAnimating) return;

    setIsAnimating(true);

    // Record vote
    const vote = direction === "right";
    const newVotes = { ...userVotes, [movie.id]: vote };
    setUserVotes(newVotes);

    const toValue = direction === "right" ? width * 1.2 : -width * 1.2;

    // Animate top card out
    Animated.timing(position, {
      toValue: { x: toValue, y: 0 },
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      // Immediately advance index
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;

        if (nextIndex >= movies.length) {
          handleAutoSubmitVotes(newVotes);
        }

        return nextIndex;
      });

      // Reset animation for the new top card
      setTimeout(() => {
        position.setValue({ x: 0, y: 0 });
      }, 10);
      setIsOpen(false);
      panelHeight.setValue(INFO_HEIGHT);
      synopsisOpacity.setValue(0);
      setIsAnimating(false);
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

  const movie = movies[currentIndex] || null;
  const nextMovie = movies[currentIndex + 1] || null;

  // whenever movies load or change
  useEffect(() => {
    if (movies.length > 0) {
      setCurrentIndex(0);
      // Aggressively prefetch all movie posters for smooth transitions
      movies.forEach(movie => {
        if (movie.poster) {
          Image.prefetch(movie.poster).catch(err => 
            console.log('Failed to prefetch:', movie.title, err)
          );
        }
      });
    }
  }, [movies]);


  // Check if all movies have been voted on
  const allMoviesVoted = Object.keys(userVotes).length === movies.length;
  
  // Show waiting screen after votes are submitted (but not while loading initial data)
  if (!loading && (hasSubmitted || (allMoviesVoted && currentIndex >= movies.length))) {
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
  if (!loading && !movie) {
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
         Movie<Text style={{ color: theme.colors.primary }}>Mingle</Text>
      </Text>

      {/* Progress indicator */}
      <Text style={{ 
        color: theme.colors.text, 
        fontSize: 16, 
        marginBottom: 20,
        opacity: 0.8 
      }}>
        {groupName ?? 'Solo Session'} - Movie {Math.min(currentIndex + 1,movies.length)} of {movies.length}
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
       <View style={{width: "85%", borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.primary + "50", borderRadius: 18, overflow: "hidden", backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.primary + "50" }}>
       {loading ? (
         <LoadingBox 
           style={{
             width: "100%", 
             height: 480,
           }} 
         />
       ) : (
         <>
        {isAnimating && nextMovie && (
          <View style={{ ...StyleSheet.absoluteFillObject, overflow: "hidden", zIndex: 1 }}>
            <Image 
              source={{ uri: nextMovie.poster }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          </View>
        )}
        <TouchableOpacity activeOpacity={1} onPress={togglePanel} >
          <Animated.View
            style={{
              transform: [
                { translateX: position.x },
              ],
              zIndex: 10,
              elevation: 4,
          }}
          >
            
            <View>
            <View
              style={{
                overflow: "hidden",
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary + "50", // 50 = 0.5 opacity
                boxShadow: [
                            {
                              offsetX: 0,
                              offsetY: 0,
                              blurRadius: 100,
                              color: theme.colors.primary,
                              opacity: 1,
                            },
                          ],
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
                start={[0,0]}
                end={[0,0.33]}
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
                    style={{ maxHeight: calculateSynopsisHeight(movie.description) - 18,  }}
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
            

            </View>
          
          
          </Animated.View>
          </TouchableOpacity>
         </>
       )}
      </View>

      {/* Barra de botones inferior (dislike, guardar, like) */}
      {loading ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            width: "80%",
            marginTop: 25,
          }}
        >
          <LoadingBox style={{ width: 70, height: 70, borderRadius: 50 }} />
          <LoadingBox style={{ width: 70, height: 70, borderRadius: 50 }} />
        </View>
      ) : (
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
          disabled={isAnimating}
          style={{
            width: 70,
            height: 70,
            borderRadius: 50,
            backgroundColor: "#FF4444",
            justifyContent: "center",
            alignItems: "center",
            opacity: isAnimating ? 0.5 : 1,
          }}
        >
          <MaterialCommunityIcons name="close" size={30} color="white" fontWeight />
        </TouchableOpacity>

        

        <TouchableOpacity
          onPress={() => {
            //if (isSoloSession)
              //handleAutoSubmitVotes();
            //else {
              swipe("right");
            //}
          }}
          disabled={isAnimating}
          style={{
            width: 70,
            height: 70,
            borderRadius: 50,
            backgroundColor: "#4CAF50",
            justifyContent: "center",
            alignItems: "center",
            opacity: isAnimating ? 0.5 : 1,
          }}
        >
          <MaterialCommunityIcons name="heart" size={30} color="white" />
        </TouchableOpacity>
      </View>
      )}
    </View>
  );
}
