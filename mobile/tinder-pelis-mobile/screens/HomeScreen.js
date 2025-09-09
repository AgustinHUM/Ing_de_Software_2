import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import SearchBar from '../components/Searchbar';

export default function HomeScreen() {
  const theme = useTheme();
  const test = false;
  const colortest = test ? 'rgba(0,120,0,0.15)' : 'transparent';
  return (
    <View style={styles.container}> 
      <View style={{flex:0.1}} />
      <View style={{flex:0.75,backgroundColor:colortest}}>

        <View style={{alignItems:'center'}}>
          <Text variant='headlineLarge' style={{color:theme.colors.text, fontWeight:700}}>Bienvenido de nuevo</Text>
          <Text variant='bodyMedium' style={{color:theme.colors.text}}>¿Qué vamos a ver hoy?</Text>
        </View>

        <View style={{padding:'5%',flex:0.30,gap:'10%'}}>
          <View style={{flex:0.40}}>
          <SearchBar></SearchBar>
          </View>
          <View style={{backgroundColor:'blue',flex:0.60}}>

          </View>

        </View>


      </View>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: '0.5%', flexDirection:'column' } });