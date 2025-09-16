import { useTheme } from "react-native-paper";
import SelectableListForm from "../components/Form";

export default function CountriesForm({ navigation }) {
  const COUNTRIES = [
    { name: "United States of America", icon: { uri: "https://cdn.watchmode.com/misc_images/icons/usFlag2.png" } },
    { name: "United Kingdom", icon: { uri: "https://cdn.watchmode.com/misc_images/icons/flagGB.png" } },
    { name: "Canada", icon: { uri: "https://cdn.watchmode.com/misc_images/icons/flagCA.png" } },

  ];

  const theme = useTheme();

  return (
    <SelectableListForm 
    title="Where are you viewing from?"
    mandatory={true}
    items={COUNTRIES}
    buttonText="Next"
    showGoBack={true}
    onSubmit={(selectedCountries)=>navigation.navigate("StreamingServicesForm",{selectedCountries})}
    />
  );
}
