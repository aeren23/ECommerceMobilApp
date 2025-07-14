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
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ProductAPI, CategoryAPI, CategoryDto } from '../../services/ApiService';
import { Product } from '../../data/products';

export default function AdminProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ürünleri yükle
  const loadProducts = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) setIsLoading(true);
      const response = await ProductAPI.getAll(forceRefresh);
      
      if (response.success && response.value) {
        setProducts(response.value);
      } else {
        Alert.alert('Hata', response.errorMessage || 'Ürünler yüklenemedi');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Hata', 'Ürünler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Kategorileri yükle
  const loadCategories = async () => {
    try {
      const response = await CategoryAPI.getAll();
      if (response.success && response.value) {
        setCategories(response.value);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Kategori adını bul
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Bilinmeyen Kategori';
  };

  // Ürün sil
  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Ürün Sil',
      `"${product.name}" ürününü silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ProductAPI.delete(product.id);
              
              if (response.success) {
                Alert.alert('Başarılı', 'Ürün başarıyla silindi');
                await loadProducts(true);
              } else {
                Alert.alert('Hata', response.errorMessage || 'Ürün silinemedi');
              }
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Hata', 'Ürün silinirken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  // Ürün düzenle
  const handleEditProduct = (product: Product) => {
    // Ürün düzenleme sayfasına yönlendir
    router.push({
      pathname: '/admin/edit-product',
      params: { productId: product.id }
    });
  };

  // Refresh
  const onRefresh = () => {
    setIsRefreshing(true);
    loadProducts(true);
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ürün Yönetimi</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ürün Yönetimi</Text>
        <TouchableOpacity onPress={() => router.push('/seller/add-product')}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{products.length}</Text>
            <Text style={styles.statsLabel}>Toplam Ürün</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>
              {products.filter(p => p.stock > 0).length}
            </Text>
            <Text style={styles.statsLabel}>Stokta Olan</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>
              {products.filter(p => p.stock === 0).length}
            </Text>
            <Text style={styles.statsLabel}>Stok Tükenen</Text>
          </View>
        </View>

        {/* Products List */}
        <View style={styles.listContainer}>
          {products.map((product) => (
            <View key={product.id} style={styles.productItem}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productCategory}>
                  {getCategoryName(product.categoryId)}
                </Text>
                <Text style={styles.productSeller}>Satıcı: {product.seller}</Text>
                
                <View style={styles.productDetails}>
                  <Text style={styles.productPrice}>₺{product.price.toLocaleString()}</Text>
                  <Text style={[
                    styles.productStock,
                    product.stock === 0 && styles.outOfStock
                  ]}>
                    Stok: {product.stock}
                  </Text>
                </View>

                <View style={styles.productMeta}>
                  <Text style={styles.productRating}>⭐ {product.rating}</Text>
                  <Text style={styles.productId}>ID: {product.id.substring(0, 8)}...</Text>
                </View>
              </View>

              <View style={styles.productActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditProduct(product)}
                >
                  <Ionicons name="pencil" size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteProduct(product)}
                >
                  <Ionicons name="trash" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {products.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color="#999" />
              <Text style={styles.emptyText}>Henüz ürün bulunmuyor</Text>
              <Text style={styles.emptySubtext}>Yeni ürün eklemek için + butonuna tıklayın</Text>
            </View>
          )}
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
    padding: 20,
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
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  statsCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
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
    color: '#FF3B30',
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 2,
  },
  productSeller: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
  productStock: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  outOfStock: {
    color: '#FF3B30',
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productRating: {
    fontSize: 12,
    color: '#666',
  },
  productId: {
    fontSize: 10,
    color: '#999',
  },
  productActions: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#E5F0FF',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
