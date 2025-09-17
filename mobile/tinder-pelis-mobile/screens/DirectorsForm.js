import { useTheme } from "react-native-paper";
import * as SecureStore from 'expo-secure-store';
import SelectableListForm from "../components/Form";
import { useRoute } from "@react-navigation/native";

export default function DirectorsFormScreen({ navigation }) {
  const DIRECTORS = [
    {id:'d1',  name: "Steven Spielberg" },
    {id:'d2',  name: "Martin Scorsese" },
    {id:'d3',  name: "Christopher Nolan" },
    {id:'d4',  name: "Greta Gerwig" },
    {id:'d5',  name: "Hayao Miyazaki" },
    {id:'d6',  name: "Quentin Tarantino" },
    {id:'d7',  name: "James Cameron" },
    {id:'d8',  name: "Tim Burton" },
    {id:'d9',  name: "Sofia Coppola" },
    {id:'d10', name: "Wachowski sisters" },
    {id:'d11', name: "Russo Brothers" },
  ];
  const route = useRoute();
  const prevResults = route?.params?.formResults ?? {};
  const theme = useTheme();
  return (
    <SelectableListForm 
        title="Pick your favourite directors"
        mandatory={false}
        items={DIRECTORS}
        buttonText="Next"
        showGoBack={true}
        onSubmit={(selectedDirectors)=>{
        const directors = selectedDirectors.map(d=>d.id);
        navigation.navigate("MoviesForm",{ formResults: { ...prevResults, directors } });
        }}
        showSelectButton={false}
        />
  );
}
