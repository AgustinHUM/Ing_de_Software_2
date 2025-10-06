import { useTheme } from "react-native-paper";
import SelectableListForm from "../components/Form";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export default function CountriesForm({ navigation, route }) {
  
  const COUNTRIES_FAKE = [
    { id:"USA", name: "United States of America", icon: { uri: "https://cdn.watchmode.com/misc_images/icons/usFlag2.png" } },
    { id:"UK", name: "United Kingdom", icon: { uri: "https://cdn.watchmode.com/misc_images/icons/flagGB.png" } },
    { id:"CA", name: "Canada", icon: { uri: "https://cdn.watchmode.com/misc_images/icons/flagCA.png" } },

  ];

  const formData = route.params?.formData;
  const COUNTRIES = formData?.countries.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.flag ? { uri: item.flag } : undefined
  })) || COUNTRIES_FAKE;



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
      navigation.navigate("StreamingServicesForm",{formResults:{formData, countries} });
    }}
    />
  );
}
