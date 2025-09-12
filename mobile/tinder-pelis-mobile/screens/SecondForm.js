import { ScrollView, TouchableOpacity, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import Seleccionable from "../components/Seleccionable";
import { useState } from "react";
import * as SecureStore from 'expo-secure-store';
import GradientButton from "../components/GradientButton";
import { useAuth } from "../AuthContext";

export default function GenresFormScreen({navigation}) {
    const SERVICIOS = [
        {name:'Acción',
            //icon:require('../assets/Netflix.jpg')
        },
        {name:'Ciencia Ficción',
            //icon:require('../assets/DisneyPlus.jpg')
        },
        {name:'Romance',
            //icon:require('../assets/PrimeVideo.jpg')
        },
        {name:'Musical',
            //icon:require('../assets/Hulu.jpg')
        },
        {name:'Misterio',
            //icon:require('../assets/Max.jpg')
        },
        {name:'Thriller',
            //icon:require('../assets/ParamountPlus.jpg')
        },
        {name:'Criminal',
            //icon:require('../assets/DirectTV.jpg')
        },
        {name:'Policial',
            //icon:require('../assets/Netflix.jpg')
        },
        {name:'Superhéroes',
            //icon:require('../assets/DisneyPlus.jpg')
        },
        {name:'Fantasía',
            //icon:require('../assets/PrimeVideo.jpg')
        },
        {name:'Kung-Fu Panda 2',
            //icon:require('../assets/Hulu.jpg')
        },
        {name:'Infantil',
            //icon:require('../assets/Max.jpg')
        },
        {name:'Animación',
            //icon:require('../assets/ParamountPlus.jpg')
        },
        {name:'Comedia',
            //icon:require('../assets/DirectTV.jpg')
        },
    ];
    const theme = useTheme();
    const [genresSelected, setGenresSelected] = useState([]);
    const toggleSelected = (serv, selected) => {
    setGenresSelected(prev => {
      const exists = prev.includes(serv);
      if (selected) {
        // si selected=true lo ponemos en la lista
        if (!exists) return [...prev, serv];
        return prev;
      } else {
        // si selected=false lo sacamos
        if (exists) return prev.filter(s => s !== serv);
        return prev;
      }
    });
  };
        // Al finalizar, marcar el flag de primer login como completado y borrar el email
        const handleFinish = async () => {
            const email = await SecureStore.getItemAsync('lastLoginEmail');
            if (email) {
                const safeEmail = email.toLowerCase().replace(/[^a-z0-9._-]/g, '_');
                const key = `firstLoginDone__${safeEmail}`;
                await SecureStore.setItemAsync(key, '1');
                await SecureStore.deleteItemAsync('lastLoginEmail');
            }
            
            navigation.replace('Home');
        };

        return(
                <View style={{ flex: 1, paddingHorizontal: 25, backgroundColor: theme.colors.background }}>
                        <View style={{flexDirection:'row',justifyContent:'flex-end'}}>
                                <GradientButton
                                mode="text"
                                onPress={handleFinish}
                                >
                                Finalizar
                                </GradientButton>
                        </View>
            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{width:'75%', justifyContent:'center'}}>
                <Text variant="headlineSmall" style={{textAlign:'center', color: theme.colors.text, fontWeight: 700 }}>
                    ¿Qué géneros te gustan más?
                </Text>
                </View>
                <Divider style={{backgroundColor:theme.colors.primary,width:'100%',height:5,borderRadius:5,marginTop:16}} />
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 128 }} showsVerticalScrollIndicator={false}>

                {SERVICIOS.map(serv => (
                <View key={serv.name} style={{ marginTop: 12 }}>
                    <Seleccionable
                    label={serv.name}
                    height={75}
                    //icon={serv.icon}
                    //iconHeight={48}
                    //iconWidth={48}
                    initialSelected={genresSelected.includes(serv.name)}
                    onSelect={(selected) => toggleSelected(serv.name, selected)}
                    width='100%'
                    fontSize={18}
                    />
                </View>
                ))}

            </ScrollView>
            </View>
    )
}