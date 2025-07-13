import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useUser } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { UserAPI } from '../services/ApiService';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
}

export default function SettingsScreen() {
  const { user, isLoggedIn, logout, isCustomer, isSeller, isAdmin, hasRole } = useUser();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  // Profil verilerini yükle
  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await UserAPI.getProfileSimple();
      if (profile) {
        setProfileData(profile);
        setFullName(profile.fullName || '');
        setEmail(profile.email || '');
        setPhoneNumber(profile.phoneNumber || '');
        setAddress(profile.address || '');
      }
    } catch (error) {
      console.error('Profile yüklenirken hata:', error);
      Alert.alert('Hata', 'Profil bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadProfile();
    }
  }, [isLoggedIn]);

  // Profil güncelle
  const handleUpdateProfile = async () => {
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      Alert.alert('Hata', 'Ad Soyad, E-posta ve Telefon alanları zorunludur.');
      return;
    }

    try {
      setSaving(true);
      const result = await UserAPI.updateProfileSimple({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim() || undefined,
      });

      if (result.success) {
        Alert.alert('Başarılı', 'Profil bilgileri güncellendi. Yeniden giriş yapmanız gerekiyor.', [
          {
            text: 'Tamam',
            onPress: () => {
              logout();
              router.replace('/auth/login');
            }
          }
        ]);
      } else {
        Alert.alert('Hata', result.message || 'Profil güncellenemedi.');
      }
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  // Seller rolüne yükselt
  const handleUpgradeToSeller = async () => {
    Alert.alert(
      'Satıcı Olmak',
      'Satıcı hesabına yükseltmek istediğinizden emin misiniz? Bu işlem sonrasında yeniden giriş yapmanız gerekecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          onPress: async () => {
            try {
              setUpgrading(true);
              const result = await UserAPI.addRoleSimple('Seller');
              
              if (result.success) {
                Alert.alert('Başarılı', 'Satıcı rolü başarıyla eklendi! Yeniden giriş yapmanız gerekiyor.', [
                  {
                    text: 'Tamam',
                    onPress: () => {
                      logout();
                      router.replace('/auth/login');
                    }
                  }
                ]);
              } else {
                Alert.alert('Hata', result.message || 'Rol eklenirken hata oluştu.');
              }
            } catch (error) {
              console.error('Rol eklenirken hata:', error);
              Alert.alert('Hata', 'Rol eklenirken bir hata oluştu.');
            } finally {
              setUpgrading(false);
            }
          }
        }
      ]
    );
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#B8860B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ayarlar</Text>
        </View>
        <View style={styles.notLoggedContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#8E8E93" />
          <Text style={styles.notLoggedText}>Ayarlara erişmek için giriş yapmalısınız</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#B8860B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ayarlar</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B8860B" />
          <Text style={styles.loadingText}>Profil bilgileri yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#B8860B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Kullanıcı Profil Kartı */}
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={40} color="#B8860B" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{fullName || 'Kullanıcı'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {isAdmin ? '👑 Yönetici' : isSeller ? '🏪 Satıcı' : '🛍️ Müşteri'}
              </Text>
            </View>
          </View>
        </View>

        {/* Profil Bilgileri */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#B8860B" />
            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              <Ionicons name="person" size={16} color="#666" /> Ad Soyad *
            </Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Ad Soyad giriniz"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              <Ionicons name="mail" size={16} color="#666" /> E-posta *
            </Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta adresiniz"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              <Ionicons name="call" size={16} color="#666" /> Telefon *
            </Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Telefon numaranız"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              <Ionicons name="location" size={16} color="#666" /> Adres
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Adresiniz (isteğe bağlı)"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.updateButton, saving && styles.buttonDisabled]}
            onPress={handleUpdateProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="save" size={18} color="white" />
                <Text style={styles.updateButtonText}>Profili Güncelle</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Hesap Yükseltme - Sadece Customer rolündeki kullanıcılar için */}
        {isCustomer && !isSeller && !isAdmin && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up" size={20} color="#34C759" />
              <Text style={styles.sectionTitle}>Satıcı Ol</Text>
            </View>
            <View style={styles.upgradeCard}>
              <View style={styles.upgradeIcon}>
                <Ionicons name="storefront" size={30} color="#34C759" />
              </View>
              <View style={styles.upgradeContent}>
                <Text style={styles.upgradeTitle}>Satıcı Hesabına Yükselt</Text>
                <Text style={styles.upgradeDescription}>
                  Kendi ürünlerinizi satın ve gelir elde edin!
                </Text>
                <View style={styles.upgradeFeatures}>
                  <Text style={styles.feature}>• Sınırsız ürün ekleme</Text>
                  <Text style={styles.feature}>• Satış takibi</Text>
                  <Text style={styles.feature}>• Gelir raporları</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.upgradeButton, upgrading && styles.buttonDisabled]}
              onPress={handleUpgradeToSeller}
              disabled={upgrading}
            >
              {upgrading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="rocket" size={20} color="white" />
                  <Text style={styles.upgradeButtonText}>Hemen Başla</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Hesap Güvenliği */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#FF9500" />
            <Text style={styles.sectionTitle}>Hesap Güvenliği</Text>
          </View>
          
          <View style={styles.securityInfo}>
            <Text style={styles.securityText}>
              ⚠️ Profil bilgilerinizi güncelledikten sonra güvenlik amacıyla yeniden giriş yapmanız gerekecektir.
            </Text>
          </View>
        </View>

        {/* Alt boşluk */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#F8F9FA',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#B8860B',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8860B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#FFFFFF',
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: '#B8860B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  upgradeCard: {
    backgroundColor: '#F8FFF8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E6F7E6',
  },
  upgradeIcon: {
    marginRight: 16,
    alignSelf: 'flex-start',
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  upgradeFeatures: {
    gap: 4,
  },
  feature: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  securityInfo: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  securityText: {
    fontSize: 14,
    color: '#8B6914',
    lineHeight: 20,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
  notLoggedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notLoggedText: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 24,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
});
