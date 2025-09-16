import { useTheme } from "react-native-paper";
import SelectableListForm from "../components/Form";

export default function StreamingServicesForm({ navigation }) {
  const SERVICES = [
    { name: "Netflix", icon: { uri: "https://cdn.watchmode.com/provider_logos/netflix_100px.png" } },
    { name: "Disney+", icon: require("../assets/DisneyPlus.jpg") },
    { name: "Prime Video", icon: require("../assets/PrimeVideo.jpg") },
    { name: "Hulu", icon: require("../assets/Hulu.jpg") },
    { name: "Max", icon: require("../assets/Max.jpg") },
    { name: "Paramount Plus", icon: require("../assets/ParamountPlus.jpg") },
    { name: "YouTube", icon: { uri: "https://cdn.watchmode.com/provider_logos/youtube_100px.png" } },
    { name: "DirectTV", icon: require("../assets/DirectTV.jpg") },
    { name: "Netflix 2", icon: require("../assets/Netflix.jpg") },
    { name: "Disney*", icon: require("../assets/DisneyPlus.jpg") },
    { name: "Prime Video 2", icon: require("../assets/PrimeVideo.jpg") },
    { name: "Hulu 2", icon: require("../assets/Hulu.jpg") },
    { name: "Maximo", icon: require("../assets/Max.jpg") },
    { name: "Paramount Plus 2", icon: require("../assets/ParamountPlus.jpg") },
  ];

  const theme = useTheme();

  return (
    <SelectableListForm 
    title="What are your favorite streaming platforms?"
    mandatory={true}
    items={SERVICES}
    buttonText="Next"
    showGoBack={true}
    onSubmit={(selectedServices)=>navigation.navigate("GenreForm")}
    />
  );
}
