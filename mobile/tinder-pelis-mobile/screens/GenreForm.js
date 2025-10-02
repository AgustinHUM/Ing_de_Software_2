import { useTheme } from "react-native-paper";
import * as SecureStore from 'expo-secure-store';
import SelectableListForm from "../components/Form";

export default function GenresFormScreen({ navigation , route}) {
  const GENRES_FAKE = [
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

  const prevResults = route?.params?.formResults ?? {};
  const GENRES = prevResults.formData?.genres.map(item => ({ id: item.id, name: item.name })) || GENRES_FAKE;

  return (
    <SelectableListForm 
        title="What are your favourite genres?"
        mandatory={false}
        items={GENRES}
        buttonText="Next"
        showGoBack={true}
        onSubmit={(selectedGenres)=>{
        const genres = selectedGenres.map(g=>g.id);
        navigation.navigate("MoviesForm",{ formResults: { ...prevResults, genres } });
        }}
        showSelectButton={false}
        />
  );
}
