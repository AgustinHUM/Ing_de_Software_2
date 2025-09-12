import { ScrollView, TouchableOpacity, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import Seleccionable from "../components/Seleccionable";
import { useState } from "react";
import GradientButton from "../components/GradientButton";

export default function InitialFormScreen({navigation}) {
    const SERVICIOS = [
        {name:'Netflix',
            icon:require('../assets/Netflix.jpg')
        },
        {name:'Disney+',
            icon:require('../assets/DisneyPlus.jpg')
        },
        {name:'Prime Video',
            icon:require('../assets/PrimeVideo.jpg')
        },
        {name:'Hulu',
            icon:require('../assets/Hulu.jpg')
        },
        {name:'Max',
            icon:require('../assets/Max.jpg')
        },
        {name:'Paramount Plus',
            icon:require('../assets/ParamountPlus.jpg')
        },
        {name:'DirectTV',
            icon:require('../assets/DirectTV.jpg')
        },
        {name:'Netflix 2',
            icon:require('../assets/Netflix.jpg')
        },
        {name:'Disney*',
            icon:require('../assets/DisneyPlus.jpg')
        },
        {name:'Prime Video 2',
            icon:require('../assets/PrimeVideo.jpg')
        },
        {name:'Hulu 2',
            icon:require('../assets/Hulu.jpg')
        },
        {name:'Maximo',
            icon:require('../assets/Max.jpg')
        },
        {name:'Paramount Plus 2',
            icon:require('../assets/ParamountPlus.jpg')
        },
        {name:'DirectTV 2',
            icon:require('../assets/DirectTV.jpg')
        },
    ];
    const theme = useTheme();
    const [servicesSelected, setServicesSelected] = useState([]);
    const toggleSelected = (serv, selected) => {
    setServicesSelected(prev => {
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
    return(
        
        <View style={{ flex: 1, paddingTop: 40,paddingHorizontal: 25, backgroundColor: theme.colors.background }}>
            <View style={{flexDirection:'row',justifyContent:'flex-end'}}>
                <GradientButton
                mode="text"
                disabled={!!(servicesSelected.length===0)}
                onPress={() => navigation.navigate('GenreForm')}
                >
                Siguiente
                </GradientButton>
            </View>
            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{width:'75%', justifyContent:'center'}}>
                <Text variant="headlineSmall" style={{textAlign:'center', color: theme.colors.text, fontWeight: 700 }}>
                    ¿Qué servicios de streaming tenés?
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
                    icon={serv.icon}
                    iconHeight={48}
                    iconWidth={48}
                    initialSelected={servicesSelected.includes(serv.name)}
                    onSelect={(selected) => toggleSelected(serv.name, selected)}
                    width='100%'
                    fontSize={24}
                    />
                </View>
                ))}

            </ScrollView>
            </View>
    )
}