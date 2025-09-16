import { useTheme } from "react-native-paper";
import * as SecureStore from 'expo-secure-store';
import SelectableListForm from "../components/Form";

export default function GenresFormScreen({ navigation }) {
  const GENEROS = [
    { name: "Acción" },
    { name: "Ciencia Ficción" },
    { name: "Romance" },
    { name: "Musical" },
    { name: "Misterio" },
    { name: "Thriller" },
    { name: "Criminal" },
    { name: "Policial" },
    { name: "Superhéroes" },
    { name: "Fantasía" },
    { name: "Kung-Fu Panda 2" },
    { name: "Infantil" },
    { name: "Animación" },
    { name: "Comedia" },
  ];

  const theme = useTheme();

  // Al finalizar, marcar el flag de primer login como completado y borrar el email
  const handleFinish = async () => {
    const email = await SecureStore.getItemAsync("lastLoginEmail");
    if (email) {
      const safeEmail = email.toLowerCase().replace(/[^a-z0-9._-]/g, "_");
      const key = `firstLoginDone__${safeEmail}`;
      await SecureStore.setItemAsync(key, "1");
      await SecureStore.deleteItemAsync("lastLoginEmail");
    }

    navigation.replace("Home");
  };

  return (
    <SelectableListForm 
        title="What genres do you like?"
        mandatory={false}
        items={GENEROS}
        buttonText="End form"
        showGoBack={true}
        onSubmit={(selectedServices)=>handleFinish()}
        showSelectButton={false}
        />
  );
}
