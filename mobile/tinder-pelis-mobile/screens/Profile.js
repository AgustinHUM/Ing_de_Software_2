import { View, Text } from "react-native"
import { useTheme } from "react-native-paper"
import { useAuth } from "../AuthContext";
import GradientButton from "../components/GradientButton";

export default function ProfileScreen({navigation} ) {
    const theme = useTheme();
    const { signOut } = useAuth();
    
    return (
        <View style={{flex:1,width:'100%', alignItems:'center', justifyContent:'center',padding:16}}>
            <View style={{backgroundColor:theme.colors.surface, padding:48,borderRadius:25,borderWidth:4,borderColor:theme.colors.primary}}>
            <Text style={{color:theme.colors.text}}>Pantalla del perfil</Text>
            </View>
            <GradientButton mode="outlined" onPress={() => signOut()} style={{ marginTop: 12 }}>
            Cerrar sesión
            </GradientButton>
        </View>
    )
}