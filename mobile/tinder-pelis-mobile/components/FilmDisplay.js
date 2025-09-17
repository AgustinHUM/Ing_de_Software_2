import { Image, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import {setAlpha} from '../theme'
import { useEffect, useState } from "react";

export default function FilmDisplay({movie,width,initialSelected,onPress=()=>{},toggleable=false,glow=true}) {
    const theme = useTheme();
    const [selected, setSelected] = useState(initialSelected);
    const poster = movie.poster;
    useEffect(() => {
        setSelected(initialSelected);
    }, [initialSelected]);

    const toggle = () => {
        const next = !selected;
        setSelected(next);
        try {
        onPress(next);
        } catch (e) {
        }
    };
    return (
        <View key={movie.id} style={{ width: width }}> 
            {glow ? (
            <TouchableOpacity onPress={toggleable ? toggle : onPress} activeOpacity={0.7}>
                <View style={{backgroundColor:theme.colors.surface, marginBottom:16, width: '100%', aspectRatio: 2/3, borderRadius:15, overflow:'hidden',borderWidth:selected ? 5 : 1,borderColor:setAlpha(theme.colors.primary,selected ? 1 : 0.5),
                    boxShadow: [{
                        offsetX: 0,
                        offsetY: 0,
                        blurRadius: selected ? 20 : 12,
                        spread: 0,
                        color: setAlpha(theme.colors.primary,selected ? 1 : 0.6),
                        }] }}>
                    <Image
                        source={poster}
                        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                    />
                </View>
            </TouchableOpacity>
            ) : (
                <View style={{backgroundColor:theme.colors.surface, marginBottom:16, width: '100%', aspectRatio: 2/3, borderRadius:15, overflow:'hidden'}}>
                    <Image
                        source={poster}
                        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                    />
                </View>
            )}
        </View>
        );
    }