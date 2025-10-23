import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert } from "react-native";
import { Text, useTheme, Avatar, Card, Divider } from "react-native-paper";
import { useAuth } from "../AuthContext";
import GradientButton from "../components/GradientButton";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation, setAppTheme, themesMap, currentThemeName }) {
  const theme = useTheme();
  const { signOut, user } = useAuth();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  async function onSignOut() {
    try {
      await signOut();
    } catch (e) {
      Alert.alert('Error', String(e?.msg || 'No se pudo cerrar sesión'));
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header minimalista */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <Avatar.Text 
            size={60} 
            label={user?.name?.charAt(0).toUpperCase() || 'U'} 
            style={[styles.avatar, { backgroundColor: '#FF6B35' }]}
          />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user?.name || 'Usuario'}
            </Text>
            <Text style={[styles.userEmail, { color: 'white' }]}>
              {user?.email || 'usuario@email.com'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Configuraciones en cards separadas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Personalización
          </Text>
          
          <View style={[styles.configCard, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity 
              style={styles.configHeader}
              onPress={() => setShowThemeSelector(!showThemeSelector)}
              activeOpacity={0.7}
            >
              <View style={styles.configHeaderLeft}>
                <View style={[styles.configIcon, { backgroundColor: '#FF6B35' }]}>
                  <Text style={styles.configIconText}>🎨</Text>
                </View>
                <View>
                  <Text style={[styles.configTitle, { color: theme.colors.text }]}>
                    Tema de la app
                  </Text>
                  <Text style={[styles.configSubtitle, { color: 'white' }]}>
                    {currentThemeName}
                  </Text>
                </View>
              </View>
              <Text style={[styles.expandIcon, { color: theme.colors.onSurfaceVariant }]}>
                {showThemeSelector ? '−' : '+'}
              </Text>
            </TouchableOpacity>

            {showThemeSelector && (
              <View style={styles.themeGrid}>
                {Object.keys(themesMap).map((tkey) => {
                  const colors = themesMap[tkey];
                  const selected = currentThemeName === tkey;

                  return (
                    <TouchableOpacity
                      key={tkey}
                      onPress={() => setAppTheme(tkey)}
                      style={[
                        styles.themeOption,
                        { 
                          backgroundColor: selected ? colors.primary : colors.surface,
                          borderColor: selected ? colors.primary : colors.outline,
                        }
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.themeName, 
                        { color: selected ? colors.onPrimary : colors.text }
                      ]}>
                        {tkey}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Otras configuraciones */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Configuración
          </Text>
          
          <View style={[styles.configCard, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity style={styles.configItem} activeOpacity={0.7}>
              <View style={styles.configItemLeft}>
                <View style={[styles.configIcon, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.configIconText}>🔔</Text>
                </View>
                <Text style={[styles.configTitle, { color: theme.colors.text }]}>
                  Notificaciones
                </Text>
              </View>
              <Text style={[styles.arrow, { color: theme.colors.onSurfaceVariant }]}>›</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

            <TouchableOpacity style={styles.configItem} activeOpacity={0.7}>
              <View style={styles.configItemLeft}>
                <View style={[styles.configIcon, { backgroundColor: '#2196F3' }]}>
                  <Text style={styles.configIconText}>🔒</Text>
                </View>
                <Text style={[styles.configTitle, { color: theme.colors.text }]}>
                  Privacidad
                </Text>
              </View>
              <Text style={[styles.arrow, { color: theme.colors.onSurfaceVariant }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cerrar sesión */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.signOutButton, { backgroundColor: theme.colors.errorContainer }]}
            onPress={onSignOut}
            activeOpacity={0.8}
          >
            <Text style={[styles.signOutText, { color: theme.colors.onErrorContainer }]}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  configCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  configHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  configIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  configIconText: {
    fontSize: 18,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  configSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
  },
  themeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '500',
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  configItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  arrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  signOutButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
