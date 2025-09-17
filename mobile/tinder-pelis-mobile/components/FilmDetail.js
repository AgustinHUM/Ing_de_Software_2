import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';


export default function MovieDetail({
    icon,
    label,
    value,
    fallback = null,
    containerStyle = {},
    textStyle = {},
}) {
    const theme = useTheme();

    if (!value) {
        return fallback;
    }

    return (
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8, ...containerStyle }}>
            {icon && icon} 
            <Text
                style={{
                    color: theme.colors.text,
                    fontSize: 14,
                    fontWeight: '600',
                    marginLeft: 8,
                    ...textStyle,
                }}
            >
                {label && `${label}: `}{value}
            </Text>
        </View>
    );
}