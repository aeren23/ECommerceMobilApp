import React from 'react';
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

export default function AdminPanelScreen() {
  const { user, hasRole } = useUser();

  // Eğer admin değilse erişim engelle
  if (!hasRole('admin')) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Paneli</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.accessDenied}>
          <Ionicons name="warning-outline" size={80} color="#FF3B30" />
          <Text style={styles.accessDeniedTitle}>Erişim Engellendi</Text>
          <Text style={styles.accessDeniedText}>
            Bu bölüme sadece admin yetkisine sahip kullanıcılar erişebilir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      id: 'users',
      title: 'Kullanıcı Yönetimi',
      subtitle: 'Tüm kullanıcıları görüntüleyin ve yönetin',
      icon: 'people-outline',
      color: '#007AFF',
      onPress: () => Alert.alert('Yakında', 'Kullanıcı yönetimi yakında aktif olacak!')
    },
    {
      id: 'products',
      title: 'Ürün Yönetimi',
      subtitle: 'Tüm ürünleri görüntüleyin ve yönetin',
      icon: 'cube-outline',
      color: '#34C759',
      onPress: () => Alert.alert('Yakında', 'Ürün yönetimi yakında aktif olacak!')
    },
    {
      id: 'orders',
      title: 'Sipariş Yönetimi',
      subtitle: 'Tüm siparişleri görüntüleyin ve yönetin',
      icon: 'receipt-outline',
      color: '#FF9500',
      onPress: () => Alert.alert('Yakında', 'Sipariş yönetimi yakında aktif olacak!')
    },
    {
      id: 'categories',
      title: 'Kategori Yönetimi',
      subtitle: 'Ürün kategorilerini yönetin',
      icon: 'folder-outline',
      color: '#AF52DE',
      onPress: () => Alert.alert('Yakında', 'Kategori yönetimi yakında aktif olacak!')
    },
    {
      id: 'reports',
      title: 'Raporlar',
      subtitle: 'Satış ve kullanıcı raporlarını görüntüleyin',
      icon: 'bar-chart-outline',
      color: '#FF3B30',
      onPress: () => Alert.alert('Yakında', 'Raporlar yakında aktif olacak!')
    },
    {
      id: 'settings',
      title: 'Sistem Ayarları',
      subtitle: 'Uygulama ayarlarını yönetin',
      icon: 'settings-outline',
      color: '#8E8E93',
      onPress: () => Alert.alert('Yakında', 'Sistem ayarları yakında aktif olacak!')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Paneli</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Hoş geldiniz, {user?.fullName}
          </Text>
          <Text style={styles.welcomeSubtext}>
            Admin panelinizden sistem yönetimi yapabilirsiniz
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>0</Text>
            <Text style={styles.statsLabel}>Toplam Kullanıcı</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>0</Text>
            <Text style={styles.statsLabel}>Aktif Ürün</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>0</Text>
            <Text style={styles.statsLabel}>Bekleyen Sipariş</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>0</Text>
            <Text style={styles.statsLabel}>Satıcı Sayısı</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>₺0</Text>
            <Text style={styles.statsLabel}>Bu Ay Ciro</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>0</Text>
            <Text style={styles.statsLabel}>Kategori Sayısı</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Yönetim Paneli</Text>
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
              onPress={() => Alert.alert('Yakında', 'Kullanıcı ekleme yakında aktif olacak!')}
            >
              <Ionicons name="person-add" size={32} color="#34C759" />
              <Text style={styles.quickActionText}>Kullanıcı Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Yakında', 'Kategori ekleme yakında aktif olacak!')}
            >
              <Ionicons name="folder-open" size={32} color="#FF9500" />
              <Text style={styles.quickActionText}>Kategori Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Yakında', 'Rapor oluşturma yakında aktif olacak!')}
            >
              <Ionicons name="document-text" size={32} color="#007AFF" />
              <Text style={styles.quickActionText}>Rapor Oluştur</Text>
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
    backgroundColor: '#FF3B30',
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
    marginBottom: 15,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
