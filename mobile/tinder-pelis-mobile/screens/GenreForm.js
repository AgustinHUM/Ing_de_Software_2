import { useTheme } from "react-native-paper";
import * as SecureStore from 'expo-secure-store';
import SelectableListForm from "../components/Form";
import { useRoute } from "@react-navigation/native";

export default function GenresFormScreen({ navigation }) {
  const GENRES = [
    {id:'g1', name: "Acción" },
    {id:'g2', name: "Ciencia Ficción" },
    {id:'g3', name: "Romance" },
    {id:'g4', name: "Musical" },
    {id:'g5', name: "Misterio" },
    {id:'g6', name: "Thriller" },
    {id:'g7', name: "Criminal" },
    {id:'g8', name: "Policial" },
    {id:'g9', name: "Superhéroes" },
    {id:'g10', name: "Fantasía" },
    {id:'g11', name: "Kung-Fu Panda 2" },
    {id:'g12', name: "Infantil" },
    {id:'g13', name: "Animación" },
    {id:'g14', name: "Comedia" },
  ];

  const theme = useTheme();
  const route = useRoute();
  const prevResults = route?.params?.formResults ?? {};

  return (
    <SelectableListForm 
        title="What are your favourite genres?"
        mandatory={false}
        items={GENRES}
        buttonText="Next"
        showGoBack={true}
        onSubmit={(selectedGenres)=>{
        const genres = selectedGenres.map(g=>g.id);
        navigation.navigate("DirectorsForm",{ formResults: { ...prevResults, genres } });
        }}
        showSelectButton={false}
        />
  );
}
