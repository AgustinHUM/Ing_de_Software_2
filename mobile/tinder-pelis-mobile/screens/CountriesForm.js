import { useTheme } from "react-native-paper";
import SelectableListForm from "../components/Form";

export default function CountriesForm({ navigation }) {
  const COUNTRIES = [
    { id:"USA", name: "United States of America", icon: { uri: "https://cdn.watchmode.com/misc_images/icons/usFlag2.png" } },
    { id:"UK", name: "United Kingdom", icon: { uri: "https://cdn.watchmode.com/misc_images/icons/flagGB.png" } },
    { id:"CA", name: "Canada", icon: { uri: "https://cdn.watchmode.com/misc_images/icons/flagCA.png" } },

  ];

  const theme = useTheme();
  return (
    <SelectableListForm 
    title="Where are you viewing from?"
    mandatory={true}
    items={COUNTRIES}
    buttonText="Next"
    showGoBack={false}
    onSubmit={(selectedCountries)=>{
      const countries = selectedCountries.map(c => c.id);
      navigation.navigate("StreamingServicesForm",{formResults:{countries: countries}});
    }}
    />
  );
}
