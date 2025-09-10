import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

export default function Seleccionable({
    label = '',
    fontSize = 14,
    icon = null, 
    height = 'auto',
    width = 'auto',
    onSelect = () => {},
    initialSelected = false,
    disabled = false,
    }) {
    const theme = useTheme();
    const start = theme.colors?.primary ?? 'rgba(255, 138, 0, 1)';
    const end = theme.colors?.secondary ?? 'rgba(252, 210, 94, 1)';

    const [selected, setSelected] = useState(initialSelected);

    useEffect(() => {
        setSelected(initialSelected);
    }, [initialSelected]);

    const toggle = () => {
        if (disabled) return;
        const next = !selected;
        setSelected(next);
        try {
        onSelect(next);
        } catch (e) {
        }
    };

    const containerStyle = {
        height,
        width,
        borderRadius: 999,
        overflow: 'hidden',
        alignItems: 'flex-start',
        alignSelf:'flex-start',
        justifyContent: 'center'
    };

    const centerStyle = {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        flexDirection: 'row' 
    }

    const textColor = selected
      ? (theme.colors?.text ?? '#fff')
      : (theme.colors?.placeholderText ?? theme.colors?.placeholder ?? 'rgba(255,255,255,0.6)');

    // Si el icono es elemento React lo renderiza, si no asume que es una imagen
    const renderIcon = () => {
      if (!icon) return null;
      if (React.isValidElement(icon)) {
        return <View style={{ marginRight: 8 }}>{icon}</View>;
      }
      return <Image source={icon} style={{ width: 20, height: 20, marginRight: 8 }} resizeMode="contain" />;
    };

    if (!selected) {
        return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggle}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: false, disabled }}
            style={{...containerStyle, backgroundColor: 'rgba(105,105,105,0.7)', padding:5 }}
        >
            <View style={centerStyle}>
              {renderIcon()}
              <Text numberOfLines={1} style={{ color: textColor, fontSize: fontSize, fontWeight: '600' }}>{label}</Text>
            </View>
        </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
        activeOpacity={0.85}
        onPress={toggle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ selected: true, disabled }}
        style={containerStyle}
        >
        <LinearGradient colors={[start, end]} start={[0, 0]} end={[1, 0]} style={{...containerStyle, padding:5}}>
            <View style={centerStyle}>
              {renderIcon()}
              <Text numberOfLines={1} style={{ color: textColor, fontSize: fontSize, fontWeight: '600' }}>{label}</Text>
            </View>
        </LinearGradient>
        </TouchableOpacity>
    );
}
