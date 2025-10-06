import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert, Modal } from "react-native";
import { Text, useTheme, Avatar, Card, Divider, TextInput, Button } from "react-native-paper";
import { useAuth } from "../AuthContext";
import GradientButton from "../components/GradientButton";
import { LinearGradient } from 'expo-linear-gradient';
import { getUserInfo, updateUserInfo, getFormData } from '../src/services/api';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation, setAppTheme, themesMap, currentThemeName }) {
  const theme = useTheme();
  const { signOut, user, userToken } = useAuth();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    id_pais: null,
    plataformas: []
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    countries: [],
    platforms: []
  });
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);
  
  // Cargar información del usuario al montar el componente
  useEffect(() => {
    loadUserInfo();
    loadFormData();
  }, []);

  async function loadFormData() {
    try {
      const data = await getFormData();
      setFormData({
        countries: data.countries || [],
        platforms: data.platforms || []
      });
    } catch (error) {
      console.error('Error cargando datos del formulario:', error);
    }
  }

  async function loadUserInfo() {
    if (!userToken) return;
    
    try {
      setLoading(true);
      const info = await getUserInfo(userToken);
      setUserInfo(info);
      setEditForm({
        nombre: info.nombre || '',
        id_pais: info.id_pais || null,
        plataformas: info.plataformas?.map(p => p.id) || []
      });
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
      Alert.alert('Error', 'No se pudo cargar la información del usuario');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit() {
    console.log('handleSaveEdit called');
    console.log('userToken:', userToken);
    console.log('editForm:', editForm);
    
    if (!userToken) {
      console.log('No userToken available');
      Alert.alert('Error', 'No hay token de autenticación');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Calling updateUserInfo...');
      await updateUserInfo(editForm, userToken);
      console.log('updateUserInfo successful');
      await loadUserInfo(); // Recargar información actualizada
      setShowEditModal(false);
      Alert.alert('Éxito', 'Información actualizada correctamente');
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      Alert.alert('Error', `No se pudo actualizar la información: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function onSignOut() {
    try {
      await signOut();
    } catch (e) {
      Alert.alert('Error', String(e?.message || 'No se pudo cerrar sesión'));
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
              {userInfo?.nombre || user?.name || 'Usuario'}
            </Text>
            <Text style={[styles.userEmail, { color: 'white' }]}>
              {user?.email || 'usuario@email.com'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowEditModal(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.editButtonText, { color: theme.colors.onPrimary }]}>
              Editar
            </Text>
          </TouchableOpacity>
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

      {/* Modal de edición */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Editar Perfil
            </Text>
            <TouchableOpacity 
              onPress={() => setShowEditModal(false)}
              style={styles.closeButton}
            >
              <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Nombre
              </Text>
              <TextInput
                value={editForm.nombre}
                onChangeText={(text) => setEditForm({...editForm, nombre: text})}
                placeholder="Ingresa tu nombre"
                style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
                textColor={theme.colors.text}
                mode="outlined"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                País
              </Text>
              <TouchableOpacity 
                style={[styles.selectorButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
                onPress={() => setShowCountrySelector(!showCountrySelector)}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectorText, { color: theme.colors.text }]}>
                  {editForm.id_pais ? 
                    formData.countries.find(c => c.id === editForm.id_pais)?.name || 'País seleccionado' : 
                    'Seleccionar país'
                  }
                </Text>
                <Text style={[styles.selectorArrow, { color: theme.colors.onSurfaceVariant }]}>
                  {showCountrySelector ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showCountrySelector && (
                <ScrollView style={[styles.selectorList, { backgroundColor: theme.colors.surface }]} maxHeight={150}>
                  {formData.countries.map((country) => (
                    <TouchableOpacity
                      key={country.id}
                      style={[
                        styles.selectorItem,
                        { backgroundColor: editForm.id_pais === country.id ? theme.colors.primary : 'transparent' }
                      ]}
                      onPress={() => {
                        setEditForm({...editForm, id_pais: country.id});
                        setShowCountrySelector(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.selectorItemText,
                        { color: editForm.id_pais === country.id ? theme.colors.onPrimary : theme.colors.text }
                      ]}>
                        {country.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Plataformas de Streaming
              </Text>
              <TouchableOpacity 
                style={[styles.selectorButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
                onPress={() => setShowPlatformSelector(!showPlatformSelector)}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectorText, { color: theme.colors.text }]}>
                  {editForm.plataformas.length > 0 ? 
                    `${editForm.plataformas.length} plataforma(s) seleccionada(s)` : 
                    'Seleccionar plataformas'
                  }
                </Text>
                <Text style={[styles.selectorArrow, { color: theme.colors.onSurfaceVariant }]}>
                  {showPlatformSelector ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showPlatformSelector && (
                <ScrollView style={[styles.selectorList, { backgroundColor: theme.colors.surface }]} maxHeight={200}>
                  {formData.platforms.map((platform) => {
                    const isSelected = editForm.plataformas.includes(platform.id);
                    return (
                      <TouchableOpacity
                        key={platform.id}
                        style={[
                          styles.selectorItem,
                          { backgroundColor: isSelected ? theme.colors.primary : 'transparent' }
                        ]}
                        onPress={() => {
                          const newPlataformas = isSelected 
                            ? editForm.plataformas.filter(id => id !== platform.id)
                            : [...editForm.plataformas, platform.id];
                          setEditForm({...editForm, plataformas: newPlataformas});
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.selectorItemText,
                          { color: isSelected ? theme.colors.onPrimary : theme.colors.text }
                        ]}>
                          {platform.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: theme.colors.outline }]}
              onPress={() => setShowEditModal(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.onSurface }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                console.log('Save button pressed');
                handleSaveEdit();
              }}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={[styles.saveButtonText, { color: theme.colors.onPrimary }]}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  // Estilos del modal
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para selectores
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  selectorText: {
    fontSize: 16,
    flex: 1,
  },
  selectorArrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  selectorList: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 150,
  },
  selectorItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectorItemText: {
    fontSize: 16,
  },
});
