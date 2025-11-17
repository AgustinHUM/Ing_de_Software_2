import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AnimatedIcon from "../components/AnimatedIcon";
import Icon from '../assets/no-movie-matched-icon.svg';


const { width } = Dimensions.get("window");



export default function MatchedMovie({ route }) {
  const theme = useTheme();
  const navigation = useNavigation();

  // Get the actual results from navigation params
  const { results, sessionId, groupId, groupName, isSoloSession } = route.params || {};
  
  // Use the winning movie from results, or fallback to hardcoded for backwards compatibility
  const winningMovie = results?.winning_movie;
  const displayMovie = winningMovie || null;
  const sharedBtn = {
  borderRadius: 30,            // same for both
  paddingVertical: 12,
  minWidth: 160,
  alignItems: "center",        // center children vertically
  flexDirection: "row",
  };

  const textStyle = {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  };

  const iconStyle = {
    marginBottom:-2,
    alignSelf: "center",
  };
  // Debug logging
  console.log('MatchedMovie results:', results);
  console.log('Winning movie:', winningMovie);
  console.log('Display movie:', displayMovie);



  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 70}}
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
        {!displayMovie ? "No Match Found..." : "It’s a match!"}
      </Text>

      <Text
        style={{
          color: "white",
          fontSize: 17,
          marginBottom: 15,
          textAlign: "center",
          opacity: 0.9,
        }}
      >
        {!displayMovie ? "We're afraid we couldn't find a match for you" : "Your group also loved this movie:"}
      </Text>

      {!displayMovie ? (
        <View style={{ width: '100%', height: width }}>
          <AnimatedIcon Icon={Icon} size={width * 0.6} />
        </View>
      ) : (
        <View style={{ width: '100%' }}> 
      {/* Movie card */}
      <View
        style={{
          width: "100%",
          aspectRatio: 0.70,
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
          style={{
            height: '100%',
            width: '100%',
            resizeMode: "cover",
          }}
          source={displayMovie.poster ? { uri: displayMovie.poster } : require("../assets/jaws.jpg")}
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
            {displayMovie.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="star"
              size={16}
              color="#FFA500"
              style={{ marginRight: 4 }}
            />
            <Text style={{ color: "white", fontWeight: "600", marginRight: 8 }}>
              {displayMovie.rating || 'N/A'}
            </Text>
            <Text style={{ color: "white", opacity: 0.9 }}>
              {displayMovie.year} – {displayMovie.genres ? displayMovie.genres.join(", ") : 'Unknown'}
            </Text>
          </View>
        </LinearGradient>
      </View>
        </View> )}

      {/* Subtitle */}
      <Text
        style={{
          color: "white",
          fontSize: 15,
            marginTop: 10,
          opacity: 0.5,
          textAlign: "center",
        }}
      >
          {!displayMovie ? "Shall we try again?" : "Are you happy with the matched movie?"}
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
          {/* LEFT (Try Again) */}
          <TouchableOpacity
            onPress={() => {
              if (isSoloSession) navigation.navigate("Home");
              else navigation.navigate("Groups");
            }}
            style={[sharedBtn, { backgroundColor: "#FF4444",justifyContent:'flex-start',paddingLeft:8 }]}
          >
            <MaterialCommunityIcons
              name="arrow-left-circle"
              size={30}
              color="white"
              style={[iconStyle,{marginRight:14}]}
            />
            <Text style={textStyle}>Try Again</Text>
          </TouchableOpacity>


          {/* RIGHT (Go to Movie) */}
            {displayMovie && (<TouchableOpacity
            onPress={() => {
              AsyncStorage.setItem('lastMatchedMovie',JSON.stringify({ ...winningMovie, poster: { uri: winningMovie.poster },time: Date.now() }));
              navigation.navigate("FilmDetails", { movie: { ...winningMovie, poster: { uri: winningMovie.poster } } });
              AsyncStorage.getItem('lastMatchedMovie').then(value => {
                console.log('Saved lastMatchedMovie:', value);
              }).catch(err => {
                console.error('Error saving lastMatchedMovie:', err);
              });
            }}
            style={[sharedBtn, { backgroundColor: "#4CAF50", justifyContent:'flex-end',paddingRight:8 }]}
          >
            <Text style={textStyle}>Go to Movie</Text>
            <MaterialCommunityIcons
              name="arrow-right-circle"
              size={30}
              color="white"
              style={[iconStyle,{marginLeft:8}]}
            />
            </TouchableOpacity>)
            } 
        </View>
    </View>
  );
}

