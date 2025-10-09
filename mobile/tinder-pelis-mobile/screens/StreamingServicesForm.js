import { useTheme } from "react-native-paper";
import SelectableListForm from "../components/Form";


export default function StreamingServicesForm({ navigation, route}) {
  const PLATFORMS_FAKE = [
    { id:'p1', name: "Netflix", icon: { uri: "https://cdn.watchmode.com/provider_logos/netflix_100px.png" } },
    { id:'p2', name: "Disney+", icon: require("../assets/DisneyPlus.jpg") },
    { id:'p3', name: "Prime Video", icon: require("../assets/PrimeVideo.jpg") },
    { id:'p4', name: "Hulu", icon: require("../assets/Hulu.jpg") },
    { id:'p5', name: "Max", icon: require("../assets/Max.jpg") },
    { id:'p6', name: "Paramount Plus", icon: require("../assets/ParamountPlus.jpg") },
    { id:'p7', name: "YouTube", icon: { uri: "https://cdn.watchmode.com/provider_logos/youtube_100px.png" } },
    { id:'p8', name: "DirectTV", icon: require("../assets/DirectTV.jpg") },
    { id:'p9', name: "Netflix 2", icon: require("../assets/Netflix.jpg") },
    { id:'p10', name: "Disney*", icon: require("../assets/DisneyPlus.jpg") },
    { id:'p12', name: "Prime Video 2", icon: require("../assets/PrimeVideo.jpg") },
    { id:'p13', name: "Hulu 2", icon: require("../assets/Hulu.jpg") },
    { id:'p14', name: "Maximo", icon: require("../assets/Max.jpg") },
    { id:'p15', name: "Paramount Plus 2", icon: require("../assets/ParamountPlus.jpg") },
  ];

  const theme = useTheme();
  
  const prevResults = route.params.formResults;
  const PLATFORMS = prevResults.formData.platforms.map(item => ({
    id: item.id,
    name: item.name,
    icon: item.logo ? { uri: item.logo } : undefined
  })) || PLATFORMS_FAKE;


  return (
    <SelectableListForm 
    title="What are your favorite streaming platforms?"
    mandatory={true}
    items={PLATFORMS}
    buttonText="Next"
    showGoBack={true}
    onSubmit={(selectedServices)=>{
      const services = selectedServices.map(s=>s.id);
      navigation.navigate("GenreForm",{ formResults: { ...prevResults, services } });
    }}
    />
  );
}
