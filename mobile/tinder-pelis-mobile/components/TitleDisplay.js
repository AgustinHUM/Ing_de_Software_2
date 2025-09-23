

import React, { useState } from 'react';
import { Text } from 'react-native';
import { useTheme } from 'react-native-paper';

const TitleDisplay = ({ title, numberOfLines = 1, style }) => {
    const theme = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);

    const onTextLayout = text => {
        if (text.nativeEvent.lines.length > numberOfLines && !isExpanded) {
            setIsTruncated(true);
        } else {
            setIsTruncated(false);
        }
    };

    if (!title) {
        return null;
    }

    const handlePress = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Text 
            style={[{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text }, style]}
            onTextLayout={onTextLayout}
            numberOfLines={isExpanded ? undefined : numberOfLines}
            onPress={handlePress}
        >
            {title}
            {isTruncated && !isExpanded && (
                <Text style={{ color: theme.colors.primary }}>
                    ...
                </Text>
            )}
            {isTruncated && isExpanded && (
                 <Text style={{ color: theme.colors.primary }}>
                    {' ^'}
                </Text>
            )}
        </Text>
    );
};  

export default TitleDisplay;

