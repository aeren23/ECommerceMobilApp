import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '../../context/UserContext';
import { ProductAPI } from '../../services/ApiService';

export default function MyProductsScreen() {
  const { user, isSeller } = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Satıcı kontrolü
  if (!isSeller) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ürünlerim</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.accessDenied}>
          <Ionicons name="warning-outline" size={80} color="#FF3B30" />
          <Text style={styles.accessDeniedTitle}>Erişim Engellendi</Text>
          <Text style={styles.accessDeniedText}>
            Bu bölüme sadece satıcılar erişebilir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    loadMyProducts();
  }, []);

  const loadMyProducts = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.fullName) {
        Alert.alert('Hata', 'Kullanıcı bilgileri bulunamadı');
        return;
      }

      const response = await ProductAPI.getBySeller(user.fullName);
      
      if (response.success && response.value) {
        setProducts(response.value);
      } else {
        console.error('Failed to load products:', response.errorMessage);
        Alert.alert('Hata', 'Ürünler yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Hata', 'Ürünler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyProducts();
    setRefreshing(false);
  };

  const handleEditProduct = (product: any) => {
    router.push({
      pathname: '/seller/edit-product',
      params: { id: product.id }
    });
  };

  const handleDeleteProduct = (product: any) => {
    Alert.alert(
      'Ürünü Sil',
      `"${product.name}" ürününü silmek istediğinizden emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteProduct(product.id),
        },
      ]
    );
  };

  const deleteProduct = async (productId: string) => {
    try {
      const response = await ProductAPI.delete(productId);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Ürün başarıyla silindi');
        loadMyProducts(); // Listeyi yenile
      } else {
        Alert.alert('Hata', response.errorMessage || 'Ürün silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Hata', 'Ürün silinirken bir hata oluştu');
    }
  };

  const ProductItem = ({ item }: { item: any }) => (
    <View style={styles.productItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>₺{item.price?.toLocaleString()}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>
              ₺{item.originalPrice?.toLocaleString()}
            </Text>
          )}
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.stockText}>
            Stok: {item.stock}
          </Text>
          <Text style={styles.ratingText}>
            ⭐ {item.rating}
          </Text>
        </View>
        
        <Text style={styles.categoryText}>
          {item.category?.name || 'Kategori Yok'}
        </Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditProduct(item)}
        >
          <Ionicons name="pencil" size={18} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item)}
        >
          <Ionicons name="trash" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ürünlerim</Text>
        <TouchableOpacity onPress={() => router.push('/seller/add-product')}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B8860B" />
          <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Henüz ürününüz yok</Text>
          <Text style={styles.emptySubtitle}>
            İlk ürününüzü eklemek için aşağıdaki butona tıklayın
          </Text>
          <TouchableOpacity 
            style={styles.addFirstProductButton}
            onPress={() => router.push('/seller/add-product')}
          >
            <Text style={styles.addFirstProductText}>İlk Ürünümü Ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={ProductItem}
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
    backgroundColor: '#B8860B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  addFirstProductButton: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  addFirstProductText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  productItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B8860B',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  stockText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  categoryText: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  actionsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 20,
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
