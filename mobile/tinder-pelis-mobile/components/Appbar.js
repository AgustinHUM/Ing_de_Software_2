import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme, TouchableRipple } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { setAlpha } from '../theme';

const ICON_LIBS = {
  MaterialCommunityIcons,
  Feather,
  MaterialIcons
};

const routes = [
  {
    key: 'Home',
    label: 'Home',
    route: 'Home',
    icon: { filled: 'home-variant', outline: 'home-variant-outline' },
    filledLib: 'MaterialDesignIcons',
    outlineLib: 'MaterialDesignIcons',
  },
  {
    key: 'Groups',
    label: 'Groups',
    route: 'Groups',
    icon: { filled: 'account-group', outline: 'account-group-outline' },
    filledLib: 'MaterialCommunityIcons',
    outlineLib: 'MaterialCommunityIcons',
  },
  {
    key: 'Search',
    label: 'Search',
    route: 'Search',

    icon: { filled: 'magnify', outline: 'search' },
    filledLib: 'MaterialCommunityIcons',
    outlineLib: 'Feather',
  },
  {
    key: 'Favourites',
    label: 'Favourites',
    route: 'Favourites',
    icon: { filled: 'heart', outline: 'heart-outline' },
    filledLib: 'MaterialCommunityIcons',
    outlineLib: 'MaterialCommunityIcons',
  },
  {
    key: 'Profile',
    label: 'Profile',
    route: 'Profile',
    icon: { filled: 'account', outline: 'account-outline' },
    filledLib: 'MaterialCommunityIcons',
    outlineLib: 'MaterialCommunityIcons',
  },
];

export default function AppBar({ currentRouteName = 'Home', navigationRef }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const insetHorizontal = 16;
  const insetBottom = 10;
  const height = 60;
  const radiusBottom = 40;
  const radiusTop = 10;

  const visibleRouteNames = [...routes.map((r) => r.route), 'FilmDetails', 'CreateGroup', 'JoinGroup'];
  const shouldShow = visibleRouteNames.includes(currentRouteName);

  if (!shouldShow) return null;

  const containerStyle = {
    position: 'absolute',
    left: insetHorizontal,
    right: insetHorizontal,
    bottom: insetBottom + (insets.bottom || 0),
    height,
    borderBottomLeftRadius: radiusBottom,
    borderBottomRightRadius: radiusBottom,
    borderTopLeftRadius: radiusTop,
    borderTopRightRadius: radiusTop,
    overflow: 'hidden',
    boxShadow: [{
                    offsetX: 0,
                    offsetY: 0,
                    blurRadius: 24,
                    spread: 0,
                    color: setAlpha(theme.colors.primary,0.6),
                    }]
  };

  return (
    <View style={[containerStyle]} pointerEvents="box-none">
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={[0.2, 0]}
        end={[1, 0]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.inner, { height }]}>
        {routes.map((r) => {
          const active =
            currentRouteName === r.route ||
            currentRouteName === r.key ||
            (currentRouteName || '').toLowerCase().includes(r.key.toLowerCase());

          const libName = active ? r.filledLib : r.outlineLib;
          const IconComp = ICON_LIBS[libName] || MaterialCommunityIcons;
          const iconName = active ? r.icon.filled : r.icon.outline;

          const color = active ? theme.colors.text : 'rgba(255,255,255,0.85)';
          const size = 30;

          return (
            <TouchableRipple
              key={r.key}
              borderless={true}
              rippleColor={theme.colors.text}
              onPress={() => {
                try {
                  navigationRef?.current?.navigate(r.route);
                } catch (e) {
                  console.warn('Error en la navegacion con la appbar.', e);
                }
              }}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityLabel={r.label}
              rippleDuration={250}
            >
              <View style={styles.tabContent}>
                {React.createElement(IconComp, { name: iconName, size, color })}
              </View>
            </TouchableRipple>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
  },
});
