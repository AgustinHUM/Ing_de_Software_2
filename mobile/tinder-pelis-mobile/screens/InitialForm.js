import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Seleccionable from "../components/Seleccionable";
import { useState } from "react";

export default function InitialFormScreen() {
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
        
        <View style={{ flex: 1, paddingTop: 3,paddingHorizontal: 25, backgroundColor: theme.colors.background }}>
            <View style={{flexDirection:'row',justifyContent:'flex-end'}}>
            <TouchableOpacity onPress={() => null} style={{ padding: 8 }}>
              <Text style={{ color: theme.colors.text }}>Siguiente</Text>
            </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 32 }}>
                <View style={{width:'75%', justifyContent:'center'}}>
                <Text variant="headlineSmall" style={{textAlign:'center', color: theme.colors.text, fontWeight: 700 }}>
                    ¿Qué servicios de streaming tenés?
                </Text>
                </View>
            </View>

                {SERVICIOS.map(serv => (
                <View key={serv.name} style={{ marginBottom: 12 }}>
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