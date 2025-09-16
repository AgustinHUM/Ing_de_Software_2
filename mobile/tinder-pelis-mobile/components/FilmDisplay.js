import { Image, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

export default function FilmDisplay({id,poster,onPress}) {
    const theme = useTheme();
    return (
        <TouchableOpacity key={id} style={{ width: '30%' }} onPress={onPress} activeOpacity={0.7}>
            <View style={{marginBottom:8, width: '100%', aspectRatio: 2/3, borderRadius:15, overflow:'hidden',
            boxShadow: [{
                offsetX: 0,
                offsetY: 0,
                blurRadius: 8,
                spread: 0,
                color: theme.colors.primary,
                }] }}>
                <Image
                    source={poster}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                 />
            </View>
        </TouchableOpacity>
    );
}