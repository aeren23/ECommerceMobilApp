import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { router } from 'expo-router';
import { AdminAPI, ProductAPI, CategoryAPI, AppUserWithRolesDto, OrderListDto } from '../services/ApiService';

export default function AdminPanelScreen() {
  const { user, hasRole } = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    totalSellers: 0,
    monthlyRevenue: 0,
    totalCategories: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AppUserWithRolesDto[]>([]);
  const [orders, setOrders] = useState<OrderListDto[]>([]);

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

  // Admin dashboard verilerini yükle
  useEffect(() => {
    if (hasRole('admin')) {
      loadDashboardData();
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading admin dashboard data...');

      // Paralel olarak tüm verileri yükle
      const [usersResponse, ordersResponse, productsResponse, categoriesResponse] = await Promise.all([
        AdminAPI.getAllUsersWithRoles(),
        AdminAPI.getAllOrdersWithUsers(),
        ProductAPI.getAll(),
        CategoryAPI.getAll()
      ]);

      console.log('📊 Dashboard data loaded:', {
        users: usersResponse.success ? usersResponse.value?.length : 0,
        orders: ordersResponse.success ? ordersResponse.value?.length : 0,
        products: productsResponse.success ? productsResponse.value?.length : 0,
        categories: categoriesResponse.success ? categoriesResponse.value?.length : 0
      });

      // Kullanıcı verileri
      if (usersResponse.success && usersResponse.value) {
        setUsers(usersResponse.value);
        const sellers = usersResponse.value.filter(user => user.roles.includes('Seller'));
        
        setStats(prev => ({
          ...prev,
          totalUsers: usersResponse.value?.length || 0,
          totalSellers: sellers.length
        }));
      }

      // Sipariş verileri
      if (ordersResponse.success && ordersResponse.value) {
        setOrders(ordersResponse.value);
        const totalRevenue = ordersResponse.value.reduce((sum, order) => sum + order.totalPrice, 0);
        
        setStats(prev => ({
          ...prev,
          pendingOrders: ordersResponse.value?.length || 0,
          monthlyRevenue: totalRevenue
        }));
      }

      // Ürün verileri
      if (productsResponse.success && productsResponse.value) {
        setStats(prev => ({
          ...prev,
          totalProducts: productsResponse.value?.length || 0
        }));
      }

      // Kategori verileri
      if (categoriesResponse.success && categoriesResponse.value) {
        setStats(prev => ({
          ...prev,
          totalCategories: categoriesResponse.value?.length || 0
        }));
      }

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      Alert.alert('Hata', 'Dashboard verileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'users',
      title: 'Kullanıcı Yönetimi',
      subtitle: `${stats.totalUsers} kullanıcı | ${stats.totalSellers} satıcı`,
      icon: 'people-outline',
      color: '#007AFF',
      onPress: () => router.push('/admin/users')
    },
    {
      id: 'products',
      title: 'Ürün Yönetimi',
      subtitle: `${stats.totalProducts} aktif ürün`,
      icon: 'cube-outline',
      color: '#34C759',
      onPress: () => router.push('/admin/products')
    },
    {
      id: 'orders',
      title: 'Sipariş Yönetimi',
      subtitle: `${stats.pendingOrders} sipariş | ₺${stats.monthlyRevenue.toLocaleString()} ciro`,
      icon: 'receipt-outline',
      color: '#FF9500',
      onPress: () => router.push('/admin/orders')
    },
    {
      id: 'categories',
      title: 'Kategori Yönetimi',
      subtitle: `${stats.totalCategories} kategori`,
      icon: 'folder-outline',
      color: '#AF52DE',
      onPress: () => router.push('/admin/categories')
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
            <Text style={styles.statsNumber}>{isLoading ? '...' : stats.totalUsers}</Text>
            <Text style={styles.statsLabel}>Toplam Kullanıcı</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{isLoading ? '...' : stats.totalProducts}</Text>
            <Text style={styles.statsLabel}>Aktif Ürün</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{isLoading ? '...' : stats.pendingOrders}</Text>
            <Text style={styles.statsLabel}>Toplam Sipariş</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{isLoading ? '...' : stats.totalSellers}</Text>
            <Text style={styles.statsLabel}>Satıcı Sayısı</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>
              {isLoading ? '...' : `₺${stats.monthlyRevenue.toLocaleString()}`}
            </Text>
            <Text style={styles.statsLabel}>Toplam Ciro</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{isLoading ? '...' : stats.totalCategories}</Text>
            <Text style={styles.statsLabel}>Kategori Sayısı</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Yönetim Paneli</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF3B30" />
              <Text style={styles.loadingText}>Dashboard yükleniyor...</Text>
            </View>
          ) : (
            menuItems.map((item) => (
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
            ))
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});
