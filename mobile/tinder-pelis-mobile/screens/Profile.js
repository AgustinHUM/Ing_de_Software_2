import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert, Image } from 'react-native';
import { Text, useTheme, Avatar, Divider, Surface } from 'react-native-paper';
import { useAuth } from '../AuthContext';
import GradientButton from '../components/GradientButton';
import { setAlpha } from '../theme';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation, setAppTheme, themesMap, currentThemeName }) {
  const theme = useTheme();
  const { signOut, state } = useAuth();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const user = state?.user || {};

  async function onSignOut() {
    try {
      await signOut();
    } catch (e) {
      Alert.alert('Error', String(e?.message || 'Could not sign out.'));
    }
  }

  function onEditProfile() {
    // Try to navigate to an EditProfile screen if it exists in your navigator.
    if (navigation?.navigate) navigation.navigate('EditProfile');
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Big centered avatar + name */}
        <View style={styles.avatarWrap}>
          <Avatar.Text
            size={120}
            label={(user?.name || 'U').charAt(0).toUpperCase()}
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            color={theme.colors.onPrimary}
          />
          <Text style={[styles.nameText, { color: theme.colors.text }]} numberOfLines={1} ellipsizeMode="tail">
            {user?.name || 'Usuario'}
          </Text>
        </View>

        {/* Surface with user info fields */}
        <Surface style={[styles.infoSurface, { backgroundColor: theme.colors.surface, borderColor:theme.colors.primary,
          boxShadow: [{
                      offsetX: 0,
                      offsetY: 0,
                      blurRadius: 16,
                      spread: 0,
                      color: setAlpha(theme.colors.primary,0.6),}]
         }]}>
          {/* Email */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Email</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{user?.email || 'user@example.com'}</Text>
          </View>
          <Divider style={[styles.divider, { backgroundColor: theme.colors.primary }]} />

          {/* Country with flag circle on the right */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Country</Text>
            <View style={styles.countryRight}>
              <Image width={30} height={30} source={{uri: "https://cdn.watchmode.com/misc_images/icons/usFlag2.png"}} resizeMode='contain'/>
            </View>
          </View>
          <Divider style={[styles.divider, { backgroundColor: theme.colors.primary }]} />

          {/* Streaming platforms */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Streaming platforms</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]} numberOfLines={1} ellipsizeMode="tail">
              {user?.platforms?.join(', ') || '—'}
            </Text>
          </View>
          <Divider style={[styles.divider, { backgroundColor: theme.colors.primary }]} />

          {/* Favourite genres */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Favourite genres</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]} numberOfLines={1} ellipsizeMode="tail">
              {user?.genres?.join(', ') || '—'}
            </Text>
          </View>
        </Surface>

        {/* Buttons: Edit Profile then Sign Out */}
        <View style={styles.buttonsWrap}>
          <GradientButton
            onPress={onEditProfile}
            style={styles.editButton}
          >
            Edit Profile
          </GradientButton>

          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: theme.colors.errorContainer }]}
            onPress={onSignOut}
            activeOpacity={0.8}
          >
            <Text style={[styles.signOutText, { color: theme.colors.onErrorContainer }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.themeSection, { backgroundColor: theme.colors.surface, borderColor:theme.colors.primary,
              boxShadow: [{
                      offsetX: 0,
                      offsetY: 0,
                      blurRadius: 16,
                      spread: 0,
                      color: setAlpha(theme.colors.primary,0.6),}]
             }]}>
          <TouchableOpacity
            style={styles.themeHeader}
            onPress={() => setShowThemeSelector((s) => !s)}
            activeOpacity={0.8}
          >
            <Text style={[styles.themeLabel, { color: theme.colors.text }]}>App theme</Text>
            <Text style={[styles.themeCurrent, { color: theme.colors.primary }]}>{currentThemeName}</Text>
          </TouchableOpacity>

          {showThemeSelector && (
            <>
            <Divider style={{...styles.divider, backgroundColor:theme.colors.primary}} />
            <View style={styles.themeGrid}>
              {Object.keys(themesMap || {}).map((tkey) => {
                const colors = themesMap[tkey] || {};
                const selected = currentThemeName === tkey;
                return (
                  <TouchableOpacity
                    key={tkey}
                    onPress={() => setAppTheme(tkey)}
                    style={[
                      styles.themeOption,
                      { borderColor: theme.colors.secondary, 
                        backgroundColor: theme.colors.surface,
                        boxShadow: selected ? [{
                          offsetX: 0,
                          offsetY: 0,
                          blurRadius: 16,
                          spread: 0,
                          color: setAlpha(theme.colors.primary,0.6),}] : [{}]
                       },
                    ]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.themeName, { color: selected ? theme.colors.primary : theme.colors.text }]}>{tkey}</Text>
                    <View style={{height:18, flexDirection:'row', gap:8}} >
                      <View style={{height:'100%', aspectRatio:1, borderRadius:99, backgroundColor:colors.primary, borderWidth:1, borderColor:colors.surface}} />
                      <View style={{height:'100%', aspectRatio:1, borderRadius:99, backgroundColor:colors.secondary, borderWidth:1, borderColor:colors.surface}} />
                      <View style={{height:'100%', aspectRatio:1, borderRadius:99, backgroundColor:colors.accent, borderWidth:1, borderColor:colors.surface}} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            </>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 64, paddingBottom:256 },
  avatarWrap: { alignItems: 'center', marginTop: 8, marginBottom: 20 },
  avatar: { elevation: 4 },
  nameText: { marginTop: 12, fontSize: 24, fontWeight: '700' },

  infoSurface: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth:1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: { fontSize: 15, fontWeight: '600' },
  infoValue: { fontSize: 15, opacity: 0.95, maxWidth: width * 0.45, textAlign: 'right' },
  divider: { height: 1 },

  countryRight: { flexDirection: 'row', alignItems: 'center' },
  flagCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  buttonsWrap: { marginTop: 6, marginBottom: 16, paddingHorizontal: 6 },
  editButton: { marginBottom: 12 },
  signOutButton: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    elevation: 2,
    marginBottom:10
  },
  signOutText: { fontSize: 16, fontWeight: '700' },

  themeSection: {
    borderRadius: 12,
    borderWidth:1
   },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding:12
  },
  themeLabel: { fontSize: 15, fontWeight: '600' },
  themeCurrent: { fontSize: 15 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap',marginTop:6,padding:12, paddingHorizontal:24, justifyContent:'center' },
  themeOption: {
    flexDirection:'row',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    width:'90%', justifyContent:'space-between', alignItems:'center'
  },
  themeName: { fontSize: 13, fontWeight: '600' },
});
