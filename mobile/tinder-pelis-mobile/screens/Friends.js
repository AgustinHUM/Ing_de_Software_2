import { View, Text } from "react-native"
import { useTheme } from "react-native-paper"

export default function FriendsScreen({navigation} ) {
    const theme = useTheme();
    return (
        <View style={{flex:1,width:'100%', alignItems:'center', justifyContent:'center',padding:16}}>
            <View style={{backgroundColor:theme.colors.surface, padding:48,borderRadius:25,borderWidth:4,borderColor:theme.colors.primary}}>
            <Text style={{color:theme.colors.text}}>Pantalla de amigos/matches?</Text>
            </View>
        </View>
    )
}