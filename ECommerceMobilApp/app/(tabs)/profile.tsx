import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useUser } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { user, isLoggedIn, logout, isCustomer, isSeller, isAdmin } = useUser();

  const getRoleName = () => {
    if (isAdmin) return 'Admin';
    if (isSeller) return 'Satıcı';
    if (isCustomer) return 'Müşteri';
    return 'Kullanıcı';
  };

  const getRoleColor = () => {
    if (isAdmin) return '#FF3B30';
    if (isSeller) return '#B8860B';
    if (isCustomer) return '#34C759';
    return '#8E8E93';
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          onPress: async () => {
            await logout();
            Alert.alert('Başarılı', 'Çıkış işlemi tamamlandı.');
          }
        }
      ]
    );
  };

  const showFeature = (feature: string) => {
    Alert.alert('Bilgi', `${feature} özelliği yakında eklenecek!`);
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profilim</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            {isLoggedIn ? (
              <>
                <Text style={styles.welcomeText}>Merhaba, {user?.fullName}!</Text>
                <View style={[styles.rolebadge, { backgroundColor: getRoleColor() }]}>
                  <Text style={styles.roleBadgeText}>{getRoleName()}</Text>
                </View>
                <Text style={styles.userInfo}>📧 {user?.email}</Text>
                <Text style={styles.userInfo}>📞 {user?.phoneNumber}</Text>
                {user?.address && (
                  <Text style={styles.userInfo}>📍 {user.address}</Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.welcomeText}>Merhaba!</Text>
                <Text style={styles.loginPrompt}>
                  Alışverişe başlamak için giriş yapın
                </Text>
              </>
            )}
          </View>

          {!isLoggedIn ? (
            <View style={styles.authButtons}>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>Üye Ol</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authButtons}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Rol-based Menu Items */}
          {isLoggedIn && (isSeller || isAdmin) && (
            <View style={styles.roleMenuSection}>
              <Text style={styles.sectionTitle}>Yönetim Paneli</Text>
              
              {isSeller && (
                <TouchableOpacity 
                  style={styles.roleMenuItem}
                  onPress={() => router.push('/seller-panel')}
                >
                  <View style={[styles.roleMenuIcon, { backgroundColor: '#B8860B15' }]}>
                    <Ionicons name="storefront" size={24} color="#B8860B" />
                  </View>
                  <View style={styles.roleMenuContent}>
                    <Text style={styles.roleMenuTitle}>Satıcı Paneli</Text>
                    <Text style={styles.roleMenuSubtitle}>Ürünlerinizi yönetin</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                </TouchableOpacity>
              )}
              
              {isAdmin && (
                <TouchableOpacity 
                  style={styles.roleMenuItem}
                  onPress={() => router.push('/admin-panel')}
                >
                  <View style={[styles.roleMenuIcon, { backgroundColor: '#FF3B3015' }]}>
                    <Ionicons name="settings" size={24} color="#FF3B30" />
                  </View>
                  <View style={styles.roleMenuContent}>
                    <Text style={styles.roleMenuTitle}>Admin Paneli</Text>
                    <Text style={styles.roleMenuSubtitle}>Sistem yönetimi</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Regular Menu Items */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Menü</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => showFeature('Siparişlerim')}
            >
              <Ionicons name="receipt-outline" size={20} color="#666" />
              <Text style={styles.menuItemText}>Siparişlerim</Text>
              <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => showFeature('Favorilerim')}
            >
              <Ionicons name="heart-outline" size={20} color="#666" />
              <Text style={styles.menuItemText}>Favorilerim</Text>
              <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => showFeature('Ayarlar')}
            >
              <Ionicons name="settings-outline" size={20} color="#666" />
              <Text style={styles.menuItemText}>Ayarlar</Text>
              <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => showFeature('Yardım')}
            >
              <Ionicons name="help-circle-outline" size={20} color="#666" />
              <Text style={styles.menuItemText}>Yardım</Text>
              <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => showFeature('İletişim')}
            >
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.menuItemText}>İletişim</Text>
              <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#B8860B',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userSection: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  rolebadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 10,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginPrompt: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  userInfo: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  authButtons: {
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#B8860B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B8860B',
  },
  registerButtonText: {
    color: '#B8860B',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#8E8E93',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  roleMenuSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 16,
    marginLeft: 16,
  },
  roleMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roleMenuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleMenuContent: {
    flex: 1,
  },
  roleMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  roleMenuSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  menuArrow: {
    fontSize: 18,
    color: '#ccc',
  },
});
