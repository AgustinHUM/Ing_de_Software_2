import { useTheme } from "react-native-paper";
import { StyleSheet, View, Text } from "react-native";
import GradientButton from "../components/GradientButton";

export default function InitialFormScreen({ navigation }) {

  const theme = useTheme();

  return (
    <View style={{
        ...StyleSheet.absoluteFillObject, 
        backgroundColor:theme.colors.background, 
        alignItems:'center',
        justifyContent:'center',paddingHorizontal:'10%', height:'90%'}}>
        <Text style={{fontSize:32, marginVertical:12, textAlign: "center", color: theme.colors.text, fontWeight: 700 }}>
            Help us get to know you better
        </Text>
        <Text style={{fontSize:16, marginBottom:12, textAlign: "center", color: theme.colors.text, fontWeight: 300 }}>
            Complete the initial form to get personalized results based on your interests.
        </Text>
        <Text style={{fontSize:16, marginBottom:36, textAlign: "center", color: theme.colors.text, fontWeight: 300 }}>
            All preferences can be changed later.
        </Text>
        <GradientButton fullWidth onPress={()=>navigation.navigate('CountriesForm')}>
            Get started
        </GradientButton>
    </View>
  );
}
