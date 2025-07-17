import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { router } from 'expo-router';

export default function SellerPanelScreen() {
  const { user, hasRole } = useUser();

  // Eğer satıcı değilse erişim engelle
  if (!hasRole('seller')) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Satıcı Paneli</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.accessDenied}>
          <Ionicons name="warning-outline" size={80} color="#FF3B30" />
          <Text style={styles.accessDeniedTitle}>Erişim Engellendi</Text>
          <Text style={styles.accessDeniedText}>
            Bu bölüme sadece satıcı yetkisine sahip kullanıcılar erişebilir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      id: 'products',
      title: 'Ürünlerim',
      subtitle: 'Ürünlerinizi görüntüleyin ve yönetin',
      icon: 'cube-outline',
      color: '#007AFF',
      onPress: () => router.push('/seller/my-products')
    },
    {
      id: 'add-product',
      title: 'Ürün Ekle',
      subtitle: 'Yeni ürün ekleyin',
      icon: 'add-circle-outline',
      color: '#34C759',
      onPress: () => router.push('/seller/add-product')
    },
    {
      id: 'coupons',
      title: 'Kupon Yönetimi',
      subtitle: 'Ürünleriniz için kupon oluşturun',
      icon: 'ticket-outline',
      color: '#FF6B35',
      onPress: () => router.push('/seller/coupons')
    },
    {
      id: 'orders',
      title: 'Siparişler',
      subtitle: 'Gelen siparişleri görüntüleyin',
      icon: 'receipt-outline',
      color: '#FF9500',
      onPress: () => Alert.alert('Yakında', 'Siparişler sayfası yakında aktif olacak!')
    },
    {
      id: 'analytics',
      title: 'Satış Analizi',
      subtitle: 'Satış performansınızı görüntüleyin',
      icon: 'analytics-outline',
      color: '#AF52DE',
      onPress: () => Alert.alert('Yakında', 'Satış analizi yakında aktif olacak!')
    },
    {
      id: 'settings',
      title: 'Mağaza Ayarları',
      subtitle: 'Mağaza bilgilerinizi düzenleyin',
      icon: 'storefront-outline',
      color: '#FF3B30',
      onPress: () => Alert.alert('Yakında', 'Mağaza ayarları yakında aktif olacak!')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Satıcı Paneli</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Hoş geldiniz, {user?.fullName}
          </Text>
          <Text style={styles.welcomeSubtext}>
            Satıcı panelinizden işlemlerinizi yönetebilirsiniz
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>0</Text>
            <Text style={styles.statsLabel}>Aktif Ürün</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>0</Text>
            <Text style={styles.statsLabel}>Bekleyen Sipariş</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>₺0</Text>
            <Text style={styles.statsLabel}>Bu Ay Kazanç</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/seller/add-product')}
            >
              <Ionicons name="add-circle" size={32} color="#34C759" />
              <Text style={styles.quickActionText}>Ürün Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Yakında', 'Fiyat güncelleme yakında aktif olacak!')}
            >
              <Ionicons name="pricetag" size={32} color="#FF9500" />
              <Text style={styles.quickActionText}>Fiyat Güncelle</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Yakında', 'Stok güncelleme yakında aktif olacak!')}
            >
              <Ionicons name="cube" size={32} color="#007AFF" />
              <Text style={styles.quickActionText}>Stok Güncelle</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#B8860B',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  welcomeSection: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
