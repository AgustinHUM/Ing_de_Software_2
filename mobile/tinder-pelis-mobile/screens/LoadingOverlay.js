import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function LoadingScreen() {
    const theme = useTheme();

    return (
        <View style={{
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    }} pointerEvents="auto">
            <View style={{
        padding: 20,
        borderRadius: 12,
        backgroundColor: theme.accent,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 160,
    }}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.secondary, fontSize: 16, marginTop: 12 }}>Cargando...</Text>
            </View>
        </View>
    );
}
