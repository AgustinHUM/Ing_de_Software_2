import { Image, TouchableOpacity, View, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { setAlpha } from '../theme';
import { useEffect, useState } from "react";
import MovieDetail from "./FilmDetail";
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import DetailList from "./DetailList";
import TitleDisplay from "./TitleDisplay";

const POSTER_ASPECT = 2 / 3; // width / height

export default function FilmDisplay({
  movie,
  width,
  height,
  initialSelected,
  onPress = () => {},
  toggleable = false,
  glow = true,
  interactable = true,
  onlyPoster = true,
}) {
  const theme = useTheme();
  const [selected, setSelected] = useState(initialSelected);
  const poster = movie.poster;
  const visible_genres = 3;

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  const toggle = () => {
    const next = !selected;
    setSelected(next);
    try {
      onPress(next);
    } catch (e) {}
  };

  let posterWidth;
  let posterHeight;
  const numericWidth = typeof width === "number";
  const numericHeight = typeof height === "number";

  if (numericWidth) {
    posterWidth = width;
    posterHeight = width / POSTER_ASPECT;
  } else if (numericHeight) {
    posterHeight = height;
    posterWidth = height * POSTER_ASPECT;
  }

  const containerStyle = [
    { alignItems: "flex-start" },
    { width: width ?? undefined, height: height ?? undefined },
    !onlyPoster ? { flexDirection: "row", alignItems: "flex-start" } : {},
  ];

  const posterWrapperStyle = [
    {
      marginBottom: 16,
      borderRadius: 15,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
      borderWidth: !glow ? 0 : selected ? 5 : 1,
      borderColor: setAlpha(theme.colors.primary, selected ? 1 : 0.5),
    },
    glow
      ? {
          boxShadow: [
            {
              offsetX: 0,
              offsetY: 0,
              blurRadius: selected ? 20 : 12,
              spread: 0,
              color: setAlpha(theme.colors.primary, selected ? 1 : 0.6),
            },
          ],
        }
      : {},
    ...(posterWidth && posterHeight
      ? [{ width: posterWidth, height: posterHeight }]
      : [{ width: "100%", aspectRatio: POSTER_ASPECT }]),
  ];

  const imageStyle = [{ width: "100%", height: "100%", resizeMode: "cover" }];

  return (
      <TouchableOpacity
        style={containerStyle}
        onPress={toggleable ? toggle : onPress}
        activeOpacity={interactable ? 0.7 : 1}
      >
        <View style={posterWrapperStyle}>
          <Image source={poster} style={imageStyle} />
        </View>

      {!onlyPoster && (
        <View
          style={[
            { marginLeft: 16, marginTop: 4, justifyContent: "flex-start", flexShrink: 1 },
            posterHeight ? { height: posterHeight } : {},
          ]}
        >
            <TitleDisplay title={movie.title} numberOfLines={2} style={{marginBottom:8}} />

            <View style={{flexDirection:'row', gap:16}}>
                    <MovieDetail 
                    icon={<Feather name="calendar" size={16} color={theme.colors.text} />} 
                    value={movie.year ?? "N/A"} />
                    <MovieDetail 
                    icon={<Octicons name="hourglass" size={16} color={theme.colors.text} />} 
                    value={movie.runtime ? `${movie.runtime} min` : "N/A"} />
            </View>
            <MovieDetail 
                    icon={<Ionicons name="ticket-outline" size={16} color={theme.colors.text} />}
                    value={`Rated: ${movie.ageRating ?? 'N/A'}`} />
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            <DetailList
                list={movie.genres}
                visibleCount={visible_genres}
            />
            </View>


        </View>
      )}
      </TouchableOpacity>
  );
}
