import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  Modal,
  Pressable,
  Platform, 
  FlatList
} from 'react-native';
import { Text, useTheme, Avatar, Divider, Surface, IconButton } from 'react-native-paper';
import { useAuth } from '../AuthContext';
import GradientButton from '../components/GradientButton';
import { setAlpha } from '../theme';
import { getUserInfo } from '../src/services/api';
import * as SecureStore from 'expo-secure-store';
import LoadingBox from '../components/LoadingBox';
const { width } = Dimensions.get('window');

export const localAvatars = [
  {avatar: require('../assets/avatars/0.png'), name: 'Default'},
  {avatar: require('../assets/avatars/1.png'), name: 'Avatar 1'},
  //{avatar: require('../assets/avatars/1.png'), name: 'Avatar 1'}
];


export default function ProfileScreen({ navigation, setAppTheme, themesMap, currentThemeName }) {
  const theme = useTheme();
  const { signOut, state, updateUser } = useAuth();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [user, setUser] = useState(state.user || {});
  const [loading, setLoading] = useState(false);

  const [platformsExpanded, setPlatformsExpanded] = useState(false);
  const [genresExpanded, setGenresExpanded] = useState(false);

  // keep a reference to the user object that came from auth state when the screen mounted
  const initialUser = state.user || {};

  const isEmpty = (v) => (
    v === undefined || v === null ||
    (typeof v === 'string' && v.trim() === '') ||
    (Array.isArray(v) && v.length === 0)
  );

  async function onSignOut() {
    try {
      await signOut();
    } catch (e) {
      Alert.alert('Error', String(e?.message || 'Could not sign out.'));
    }
  }

  function onEditProfile() {
    if (navigation?.navigate) navigation.navigate('EditProfile');
  }

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const data = await getUserInfo(token);
        if (data) {
          setUser(data);
          updateUser(data);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  const shouldShowLoader = (fieldName) => {
    const initialVal = initialUser?.[fieldName];
    const currentVal = user?.[fieldName];
    return isEmpty(initialVal) && loading && isEmpty(currentVal);
  };


  const [avatarError, setAvatarError] = useState(false);



  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <ScrollView  contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Big centered avatar + name */}
      <View style={styles.avatarWrap}>
        {shouldShowLoader('icon') ? (
          <LoadingBox style={{ width: 120, height: 120, borderRadius: 60 }} />
        ) : (localAvatars[user?.icon]?.avatar && !avatarError) ? (
          <Image
            source={localAvatars[user?.icon].avatar}
            style={[{ width: 120, height: 120, borderRadius: 60,
              borderColor: setAlpha(theme.colors.primary,0.5), borderWidth:1,
              boxShadow: [
                {
                  offsetX: 0,
                  offsetY: 0,
                  blurRadius: 16,
                  spread: 0,
                  color: setAlpha(theme.colors.primary, 0.6),
                },
              ], }, styles.avatar]}
            resizeMode="cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <Avatar.Text
            size={120}
            label={(user?.name || 'U').charAt(0).toUpperCase()}
            style={[{ borderRadius: 60,
              borderColor: setAlpha(theme.colors.primary,0.5), borderWidth:1,
              boxShadow: [
                {
                  offsetX: 0,
                  offsetY: 0,
                  blurRadius: 16,
                  spread: 0,
                  color: setAlpha(theme.colors.primary, 0.6),
                },
              ], }, styles.avatar, { backgroundColor: theme.colors.primary }]}
            color={theme.colors.onPrimary}
          />
        )}

        {/* Name field: show loader / placeholder / actual value */}
        {shouldShowLoader('name') ? (
          <LoadingBox style={{ width: 180, height: 28, borderRadius: 8, marginTop: 12 }} />
        ) : (
          <Text style={[styles.nameText, { color: theme.colors.text }]} numberOfLines={1} ellipsizeMode="tail">
            {isEmpty(user?.name) && !loading ? 'No name set' : (user?.name || 'User')}
          </Text>
        )}
      </View>

        {/* Surface with user info fields */}
        <Surface
          style={[
            styles.infoSurface,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
              boxShadow: [
                {
                  offsetX: 0,
                  offsetY: 0,
                  blurRadius: 16,
                  spread: 0,
                  color: setAlpha(theme.colors.primary, 0.6),
                },
              ],
            },
          ]}
        >
          {/* Email */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Email</Text>

            {shouldShowLoader('email') ? (
              <LoadingBox style={{ width: width * 0.45, height: 22, borderRadius: 8 }} onSurface={true} />
            ) : (
              <Text style={[styles.infoValue, { color: theme.colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                {isEmpty(user?.email) && !loading ? 'No email set' : (user?.email || 'user@example.com')}
              </Text>
            )}
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.primary }]} />

          {/* Country with flag on the right */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Country</Text>

            {shouldShowLoader('country') ? (
              <View style={styles.countryRight}>
                <LoadingBox style={{ width: 42, height: 28, borderRadius: 7 }} onSurface={true} />
              </View>
            ) : (
              <View style={styles.countryRight}>
                {/* flag */}
                {user?.flag ? (
                  <Image
                    style={{width: 42, height: 28, borderRadius: 7}}
                    source={{ uri: user.flag }}
                    resizeMode="contain"
                  />
                ) : (
                  // show a tiny placeholder if no flag and not loading
                  <View style={{width: 42, height: 28, borderRadius: 7, backgroundColor: setAlpha(theme.colors.onSurface, 0.04), alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{ fontSize: 10, color: theme.colors.text }}>No</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.primary }]} />

          {/* Streaming platforms */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Streaming platforms</Text>

            {shouldShowLoader('platforms') ? (
              <LoadingBox style={{ width: 22, height: 22, borderRadius: 8}} onSurface={true} />
            ) : (
              <View style={styles.expandableRight}>
                {user?.platforms && user?.platforms.length === 1 ? (
                  <View style={{...styles.listItem, paddingTop:0}}>
                    <Text style={[styles.listItemText, { color: theme.colors.text }]}>{user.platforms[0]?.name || 'Unknown'}</Text>
                    {user.platforms[0]?.image ? (
                      <Image source={{ uri: user.platforms[0].image }} style={{...styles.platformImage, marginRight:0,marginLeft:12}} resizeMode="cover" />
                    ) : (
                      <Avatar.Text size={32} label={(user.platforms[0]?.name || '?').charAt(0).toUpperCase()} style={{ backgroundColor: theme.colors.primary, marginLeft: 12 }} />
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPlatformsExpanded(prev => !prev)}
                  style={styles.expandToggle}
                >

                  <IconButton
                    icon={platformsExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    onPress={() => setPlatformsExpanded(prev => !prev)}
                    accessibilityLabel={platformsExpanded ? 'Collapse platforms' : 'Expand platforms'}
                    style={{ margin: -5}}
                    iconColor={theme.colors.text}
                    rippleColor={setAlpha(theme.colors.primary, 0.08)}
                  />
                </TouchableOpacity>)}
              </View>
            )}
          </View>

          {/* Expanded platforms list (appears when expanded) */}
          {platformsExpanded && !shouldShowLoader('platforms') && (
            <View style={[styles.expandedListContainer, { borderTopColor: theme.colors.secondary }]}>
              <View style={styles.expandedList}>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
                >
                  {(user?.platforms && user.platforms.length > 0) ? (
                    user.platforms.map((p) => (
                      <View
                        key={p?.id ?? p?.name}
                        style={styles.platformTile}
                      >
                        <View style={styles.platformTileInner}>
                          {p?.image ? (
                            <Image
                              source={{ uri: p.image }}
                              style={styles.platformTileImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <Avatar.Text
                              size={36}
                              label={(p?.name || '?').charAt(0).toUpperCase()}
                              style={{ backgroundColor: theme.colors.primary, marginRight: 10 }}
                              color={theme.colors.onPrimary}
                            />
                          )}

                          <Text
                            style={[styles.platformTileText, { color: theme.colors.text }]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {p?.name || 'Unknown'}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.listItem}>
                      <Text style={{ color: theme.colors.text }}>No platforms set</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          )}


          <Divider style={[styles.divider, { backgroundColor: theme.colors.primary }]} />

          {/* Favourite genres */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Favourite genres</Text>

            {shouldShowLoader('genres') ? (
              <LoadingBox style={{ width: 22, height: 22, borderRadius: 8 }} onSurface={true} />
            ) : (
              <View style={styles.expandableRight}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setGenresExpanded(prev => !prev)}
                  style={styles.expandToggle}
                >

                  <IconButton
                    icon={genresExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    onPress={() => setGenresExpanded(prev => !prev)}
                    accessibilityLabel={genresExpanded ? 'Collapse genres' : 'Expand genres'}
                    style={{ margin: -5 }}
                    iconColor={theme.colors.text}
                    rippleColor={setAlpha(theme.colors.primary, 0.08)}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Expanded genres list */}
          {genresExpanded && !shouldShowLoader('genres') && (
            <View style={[styles.expandedListContainer, { borderTopColor: theme.colors.secondary }]}>
              <View style={styles.expandedList}>
                <ScrollView contentContainerStyle={styles.genresWrap} showsVerticalScrollIndicator={true}>
                  {(!isEmpty(user?.genres)) ? (
                    user.genres.map((g, idx) => (
                      <View key={`${g}-${idx}`} style={[styles.genreBadge, { backgroundColor: setAlpha(theme.colors.primary, 0.08), borderColor: setAlpha(theme.colors.primary, 0.16) }]}>
                        <Text style={{ color: theme.colors.text }}>{g}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.listItem}>
                      <Text style={{ color: theme.colors.text }}>No genres set</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          )}
        </Surface>

        {/* Buttons: Edit Profile then Sign Out */}
        <View style={styles.buttonsWrap}>
          <GradientButton onPress={onEditProfile} style={styles.editButton} 
          disabled={shouldShowLoader("country") || shouldShowLoader("genres") || 
          shouldShowLoader("name") || shouldShowLoader("icon") ||
          shouldShowLoader("platforms") || shouldShowLoader("email")}>
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

        {/* Theme section header (now opens modal) */}
        <View
          style={[
            styles.themeSection,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
              boxShadow: [
                {
                  offsetX: 0,
                  offsetY: 0,
                  blurRadius: 16,
                  spread: 0,
                  color: setAlpha(theme.colors.primary, 0.6),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.themeHeader}
            onPress={() => setShowThemeSelector(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.themeLabel, { color: theme.colors.text }]}>App theme</Text>
            <Text style={[styles.themeCurrent, { color: theme.colors.primary }]}>{currentThemeName}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for theme selector */}
      <Modal
        visible={showThemeSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowThemeSelector(false)}
      >
        {/* Backdrop: pressing it closes modal */}
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowThemeSelector(false)}
        >
          {/* Empty: backdrop handled by Pressable */}
        </Pressable>

        {/* Modal content container - appears above backdrop */}
        <View style={styles.modalContainer}>
          <Surface
            style={[
              styles.modalSurface,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary,
                boxShadow: [
                  {
                    offsetX: 0,
                    offsetY: 0,
                    blurRadius: 16,
                    spread: 0,
                    color: setAlpha(theme.colors.primary, 0.6),
                  },
                ],
              },
            ]}
          >
            {/* Header row inside modal: title + close */}
            <View style={[styles.themeHeader, { paddingHorizontal: 16 }]}> 
              <Text style={[styles.themeLabel, { color: theme.colors.text }]}>App theme</Text>
              <TouchableOpacity onPress={() => setShowThemeSelector(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Close</Text>
              </TouchableOpacity>
            </View>

            <Divider style={[styles.divider, { backgroundColor: theme.colors.primary }]} />

            <ScrollView contentContainerStyle={styles.themeGrid} showsVerticalScrollIndicator={false}>
              {Object.keys(themesMap || {}).map((tkey) => {
                const colors = themesMap[tkey] || {};
                const selected = currentThemeName === tkey;
                return (
                  <TouchableOpacity
                    key={tkey}
                    onPress={() => {
                      setAppTheme(tkey);
                      setShowThemeSelector(false);
                    }}
                    style={[
                      styles.themeOption,
                      {
                        borderColor: theme.colors.secondary,
                        backgroundColor: theme.colors.surface,
                        boxShadow: selected
                          ? [
                              {
                                offsetX: 0,
                                offsetY: 0,
                                blurRadius: 16,
                                spread: 0,
                                color: setAlpha(theme.colors.primary, 0.6),
                              },
                            ]
                          : [{}],
                      },
                    ]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.themeName, { color: selected ? theme.colors.primary : theme.colors.text }]}>{tkey}</Text>
                    <View style={{ height: 18, flexDirection: 'row', gap: 8 }}>
                      <View style={{ height: '100%', aspectRatio: 1, borderRadius: 99, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.surface }} />
                      <View style={{ height: '100%', aspectRatio: 1, borderRadius: 99, backgroundColor: colors.secondary, borderWidth: 2, borderColor: colors.surface }} />
                      <View style={{ height: '100%', aspectRatio: 1, borderRadius: 99, backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.surface }} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Surface>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 0.90 },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 64, paddingBottom: 256 },
  avatarWrap: { alignItems: 'center', marginTop: 8, marginBottom: 20 },
  avatar: { elevation: 8 },
  nameText: { marginTop: 12, fontSize: 24, fontWeight: '700' },

  infoSurface: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: { fontSize: 15, fontWeight: '700' },
  infoValue: { fontSize: 15, opacity: 0.95, maxWidth: width * 0.45, textAlign: 'right' },
  divider: { height: 1 },

  countryRight: { flexDirection: 'row', alignItems: 'center' },

  /* Expandable specific */
  expandableRight: { flex: 1, alignItems: 'flex-end', },
  expandToggle: { flexDirection: 'row', alignItems: 'center', justifyContent:'flex-end', minWidth: 120, maxWidth: width * 0.6 },
  expandedListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  expandedList: {
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  platformImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
  },
    /* Two-column platform tiles */
  platformTile: {
    width: '50%',               // two columns
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  platformTileInner: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingRight: 8
  },
  platformTileImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 10,
  },
  platformTileText: {
    fontSize: 14,
    flex: 1,            // allows truncation to work
    flexShrink: 1,
  },

  listItemText: {
    fontSize: 15,
  },
  genresWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 8,
  },
  genreBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
  },

  flagCircle: { width: 54, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  buttonsWrap: { marginTop: 6, marginBottom: 16, paddingHorizontal: 6 },
  editButton: { marginBottom: 12 },
  signOutButton: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 10,
  },
  signOutText: { fontSize: 16, fontWeight: '700' },

  themeSection: {
    borderRadius: 12,
    borderWidth: 1,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  themeLabel: { fontSize: 15, fontWeight: '700' },
  themeCurrent: { fontSize: 15 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, padding: 12, paddingHorizontal: 24, justifyContent: 'center' },
  themeOption: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeName: { fontSize: 13, fontWeight: '600' },

  /* Modal styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    height: '81.5%',
    width: '100%',
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 75 : 50,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  modalSurface: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
