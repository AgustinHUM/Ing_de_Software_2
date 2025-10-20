import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

const DetailList = ({ list, visibleCount = 3, onShowMore, containerStyle, textStyle}) => {
    const theme = useTheme();

    const baseContainerStyle = {
        backgroundColor: theme.colors.primary,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 4,
        marginBottom: 8,
    };
    const baseTextStyle = {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '600',
    };

    if (!list || list.length === 0 || (list.length===1 && !list[0])) {
        return (
            <View
                style={[baseContainerStyle, containerStyle]}
            >
                <Text
                    style={[baseTextStyle, textStyle]}
                >
                    N/A
                </Text>
            </View>
        );
    }

    const visibleItems = list.slice(0, visibleCount);
    const hasMore = list.length > visibleCount;

    return (
        <>
            {visibleItems.map((item, index) => (
                <View key={index} style={[baseContainerStyle, containerStyle]}>
                    <Text style={[baseTextStyle, textStyle]}>
                        {item}
                    </Text>
                </View>
            ))}
            {hasMore && (
                <TouchableOpacity
                    onPress={onShowMore}
                    disabled={!onShowMore}
                    activeOpacity={0.8}
                    style={[baseContainerStyle, containerStyle]}
                >
                    <Text style={[baseTextStyle, textStyle, { paddingHorizontal: 4 }]}>
                        ...
                    </Text>
                </TouchableOpacity>
            )}
        </>
    );
};

export default DetailList;
