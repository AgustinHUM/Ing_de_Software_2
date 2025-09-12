import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, StyleSheet, Text, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import SearchBar from '../components/Searchbar';
import { useTheme } from 'react-native-paper';

export default function Search() {
  const route = useRoute();
  const routeQuery = route.params?.query ?? '';
  const [query, setQuery] = useState(routeQuery);

  useEffect(() => {
    setQuery(routeQuery);
  }, [routeQuery]);

  // Datos de prueba para mostrar resultados filtrados (sólo para testing obvio)
  const sampleItems = ['Matrix','Scott Pilgrim','Buscando a Nemo','IT','Avengers: Endgame','Iron-Man 3',
    'Spider-Man 1','Spider-Man 2','Spider-Man 3','The Amazing Spider-Man','The Amazing Spider-Man 2',
    'Spider-Man: Homecoming','Spider-Man: Far from home','Spider-Man: No way home'];

  const results = query
    ? sampleItems.filter(item => item.toLowerCase().includes(query.toLowerCase()))
    : [];
    const theme = useTheme();
  return (
    <SafeAreaView style={{flex:1,padding:16}}>
        <View style={{flex:0.25,alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontSize:25, textAlign: 'center', color: theme.colors.text, fontWeight: '500' }}>Películas</Text>
        </View>
        
        <SearchBar initialQuery={query} />

        <View style={{flex:1,padding:16}}>
            {query ? (
            <>
                <Text style={{color:theme.colors.text,fontSize:18}}>Buscaste: 
                    <Text style={{color:theme.colors.primary,fontSize:18}}> {query}</Text>
                </Text>
                

                <Text style={{color:theme.colors.text,fontSize:18}}>Resultados (testing):</Text>

                {results.length > 0 ? (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => <Text style={{color:theme.colors.secondary,fontSize:14}}>{item}</Text>}
                />
                ) : (
                <Text style={{color:theme.colors.text,fontSize:16}}>No hay resultados para "{query}".</Text>
                )}
            </>
            ) : (
            <Text style={{marginTop: 12,color: theme.colors.disabled}}>Escribe algo en la barra de búsqueda y presiona buscar para ver los resultados aquí.</Text>
            )}
        </View>
    </SafeAreaView>
  );
}
