import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AdminAPI, AppUserWithRolesDto } from '../../services/ApiService';

export default function UsersManagementScreen() {
  const [users, setUsers] = useState<AppUserWithRolesDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      console.log('Loading users...');
      
      const response = await AdminAPI.getAllUsersWithRoles();
      
      if (response.success && response.value) {
        setUsers(response.value);
        console.log('✅ Users loaded:', response.value.length);
      } else {
        console.error('❌ Failed to load users:', response.errorMessage);
        Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return '#FF3B30';
      case 'Seller': return '#34C759';
      case 'Customer': return '#007AFF';
      default: return '#8E8E93';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return 'shield';
      case 'Seller': return 'storefront';
      case 'Customer': return 'person';
      default: return 'help';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const UserCard = ({ item }: { item: AppUserWithRolesDto }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => {
        Alert.alert(
          'Kullanıcı Bilgileri',
          `Adı: ${item.fullName || 'Belirtilmemiş'}\nEmail: ${item.email}\nTelefon: ${item.phoneNumber}\nAdres: ${item.address || 'Belirtilmemiş'}\nKayıt Tarihi: ${formatDate(item.createdAt)}\nSipariş Sayısı: ${item.orders.length}`,
          [{ text: 'Tamam' }]
        );
      }}
    >
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.fullName || 'İsimsiz Kullanıcı'}
          </Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userPhone}>{item.phoneNumber}</Text>
        </View>
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.orders.length}</Text>
            <Text style={styles.statLabel}>Sipariş</Text>
          </View>
        </View>
      </View>

      <View style={styles.rolesContainer}>
        <Text style={styles.rolesLabel}>Roller:</Text>
        <View style={styles.rolesList}>
          {item.roles.length > 0 ? (
            item.roles.map((role, index) => (
              <View 
                key={index}
                style={[
                  styles.roleTag,
                  { backgroundColor: getRoleColor(role) + '15' }
                ]}
              >
                <Ionicons 
                  name={getRoleIcon(role) as any} 
                  size={12} 
                  color={getRoleColor(role)} 
                />
                <Text style={[styles.roleText, { color: getRoleColor(role) }]}>
                  {role}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noRoles}>Rol atanmamış</Text>
          )}
        </View>
      </View>

      <View style={styles.userFooter}>
        <Text style={styles.joinDate}>
          Kayıt: {formatDate(item.createdAt)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kullanıcı Yönetimi</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {users.length} kullanıcı | {users.filter(u => u.roles.includes('Admin')).length} admin | {users.filter(u => u.roles.includes('Seller')).length} satıcı
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.loadingText}>Kullanıcılar yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={({ item }) => <UserCard item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  statsBar: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 20,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  userStats: {
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  rolesContainer: {
    marginBottom: 12,
  },
  rolesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  rolesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  noRoles: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
