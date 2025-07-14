import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const { isLoggedIn } = useUser();
  const { 
    wishlistProducts, 
    isLoading, 
    removeFromWishlist, 
    clearWishlist, 
    loadWishlist,
    getWishlistCount 
  } = useWishlist();
  const { addToCart } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  };

  // Sepete ekle
  const handleAddToCart = async (product: any) => {
    if (product.stock === 0) {
      Alert.alert('Uyarı', 'Bu ürün stokta bulunmamaktadır.');
      return;
    }

    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Hata', 'Ürün sepete eklenirken bir hata oluştu');
    }
  };

  // Favorilerden çıkar
  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    Alert.alert(
      'Favorilerden Çıkar',
      `"${productName}" ürününü favorilerinizden çıkarmak istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkar',
          style: 'destructive',
          onPress: () => removeFromWishlist(productId)
        }
      ]
    );
  };

  // Tüm favorileri temizle
  const handleClearWishlist = () => {
    if (getWishlistCount() === 0) {
      Alert.alert('Bilgi', 'Favorileriniz zaten boş');
      return;
    }

    Alert.alert(
      'Tüm Favorileri Temizle',
      'Tüm favorilerinizi temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: clearWishlist
        }
      ]
    );
  };

  // Giriş yapılmamış durumu
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#B8860B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorilerim</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#8E8E93" />
          <Text style={styles.emptyTitle}>Favorilere Erişim</Text>
          <Text style={styles.emptyText}>
            Favorilerinizi görmek için giriş yapmalısınız
          </Text>
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

  // Loading durumu
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#B8860B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorilerim</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B8860B" />
          <Text style={styles.loadingText}>Favoriler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Boş favoriler durumu
  if (wishlistProducts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#B8860B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorilerim</Text>
        </View>
        
        <FlatList
          data={[]}
          renderItem={() => null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={80} color="#8E8E93" />
              <Text style={styles.emptyTitle}>Henüz Favori Yok</Text>
              <Text style={styles.emptyText}>
                Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize ekleyin
              </Text>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push('/(tabs)/')}
              >
                <Ionicons name="storefront" size={20} color="white" />
                <Text style={styles.shopButtonText}>Alışverişe Başla</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  // Favori ürün kartı
  const renderFavoriteItem = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <TouchableOpacity 
        style={styles.productContent}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>
              ₺{item.price.toLocaleString()}
            </Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>
                ₺{item.originalPrice.toLocaleString()}
              </Text>
            )}
          </View>
          
          <View style={styles.productDetails}>
            <Text style={styles.seller}>Satıcı: {item.seller}</Text>
            <Text style={styles.stock}>
              {item.stock > 0 ? `Stok: ${item.stock}` : 'Stokta Yok'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            item.stock === 0 && styles.disabledButton
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={item.stock === 0}
        >
          <Ionicons 
            name="bag-add" 
            size={18} 
            color={item.stock === 0 ? '#999' : 'white'} 
          />
          <Text style={[
            styles.addToCartText,
            item.stock === 0 && styles.disabledText
          ]}>
            {item.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromWishlist(item.id, item.name)}
        >
          <Ionicons name="heart-dislike" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#B8860B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorilerim</Text>
        <TouchableOpacity onPress={handleClearWishlist} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {getWishlistCount()} favori ürün
        </Text>
      </View>

      <FlatList
        data={wishlistProducts}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
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
    justifyContent: 'space-between',
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
    flex: 1,
  },
  clearButton: {
    padding: 8,
  },
  countContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  countText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productContent: {
    flexDirection: 'row',
    padding: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#B8860B',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  productDetails: {
    gap: 4,
  },
  seller: {
    fontSize: 12,
    color: '#666',
  },
  stock: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B8860B',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#E5E5EA',
  },
  addToCartText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
  },
  removeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B8860B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  },
});
