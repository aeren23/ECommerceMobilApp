import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Product, tagConfig } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUser } from '../../context/UserContext';
import { ProductAPI } from '../../services/ApiService';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { addToCart: addToCartContext, cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isLoggedIn } = useUser();

  // Ürünü API'den yükle
  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const response = await ProductAPI.getById(id as string);
      
      if (response.success && response.value) {
        setProduct(response.value);
      } else {
        console.error('Failed to load product:', response.errorMessage);
        Alert.alert('Hata', 'Ürün yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Hata', 'Ürün yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Kategori adını bul
  const getCategoryName = (categoryId: string): string => {
    const nameMap: { [key: string]: string } = {
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890': 'Elektronik',
      'b2c3d4e5-f6g7-8901-bcde-f12345678901': 'Giyim',
      'c3d4e5f6-g7h8-9012-cdef-123456789012': 'Ev & Bahçe',
      'd4e5f6g7-h8i9-0123-def1-234567890123': 'Spor',
      'e5f6g7h8-i9j0-1234-ef12-345678901234': 'Kitap',
      'f6g7h8i9-j0k1-2345-f123-456789012345': 'Kozmetik',
      'g7h8i9j0-k1l2-3456-1234-567890123456': 'Oyuncak',
      'h8i9j0k1-l2m3-4567-2345-678901234567': 'Mutfak',
    };
    return nameMap[categoryId] || 'Diğer';
  };
  
  // Sepetteki bu ürünün miktarını kontrol et
  const cartItem = cartItems.find(item => item.id === id);
  const currentCartQuantity = cartItem ? cartItem.quantity : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B8860B" />
          <Text style={styles.loadingText}>Ürün yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ürün bulunamadı</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (product.stock === 0) {
      Alert.alert('Uyarı', 'Bu ürün stokta bulunmamaktadır.');
      return;
    }

    if (quantity > product.stock) {
      Alert.alert(
        'Stok Uyarısı',
        `Bu üründen en fazla ${product.stock} adet satın alabilirsiniz.`
      );
      return;
    }

    // Backend API'ye sepete ekleme isteği
    await addToCartContext(product.id, quantity);

    // Miktar seçiciyi sıfırla
    setQuantity(1);
  };

  // Wishlist toggle fonksiyonu
  const handleWishlistToggle = async () => {
    if (!product) return;
    
    if (!isLoggedIn) {
      Alert.alert(
        'Giriş Gerekli',
        'Favorilere eklemek için giriş yapmalısınız',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Giriş Yap', 
            onPress: () => router.push('/login')
          }
        ]
      );
      return;
    }

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error('❌ Error toggling wishlist:', error);
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Ürün Resmi */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          
          {/* Wishlist Butonu */}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleWishlistToggle}
          >
            <Ionicons
              name={isInWishlist(product.id) ? "heart" : "heart-outline"}
              size={24}
              color={isInWishlist(product.id) ? "#FF3B30" : "#666"}
            />
          </TouchableOpacity>
          
          {/* Etiketler */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagContainer}>
              {product.tags.map((tag, index) => {
                const config = tagConfig[tag as keyof typeof tagConfig];
                if (!config) return null;
                
                return (
                  <View 
                    key={index} 
                    style={[styles.tag, { backgroundColor: config.bgColor }]}
                  >
                    <Text style={styles.tagIcon}>{config.icon}</Text>
                    <Text style={[styles.tagText, { color: config.color }]}>
                      {config.text}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Ürün Bilgileri */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{getCategoryName(product.categoryId)}</Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {product.rating}</Text>
            <Text style={styles.stock}>
              {product.stock > 0 ? `${product.stock} adet stokta` : 'Stok tükendi'}
            </Text>
          </View>

          {/* Fiyat ve indirim */}
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>
              ₺{product.price.toLocaleString()}
            </Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                ₺{product.originalPrice.toLocaleString()}
              </Text>
            )}
            {product.originalPrice && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  %{Math.round((1 - product.price / product.originalPrice) * 100)} İndirim
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.productDescription}>
            {product.description}
          </Text>

          {/* Satıcı Bilgisi */}
          <View style={styles.sellerContainer}>
            <Text style={styles.sellerLabel}>Satıcı:</Text>
            <Text style={styles.sellerName}>{product.seller || 'Bilinmiyor'}</Text>
          </View>

          {/* Miktar Seçici */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Adet:</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Text style={[
                  styles.quantityButtonText,
                  quantity <= 1 && styles.disabledText
                ]}>−</Text>
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={increaseQuantity}
                disabled={quantity >= product.stock}
              >
                <Text style={[
                  styles.quantityButtonText,
                  quantity >= product.stock && styles.disabledText
                ]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Toplam Fiyat */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Toplam:</Text>
            <Text style={styles.totalPrice}>
              ₺{(product.price * quantity).toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Alt Butonlar */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.buttonRow}>
          {/* Favorilere Ekle Butonu */}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleWishlistToggle}
          >
            <Ionicons
              name={isInWishlist(product.id) ? "heart" : "heart-outline"}
              size={20}
              color={isInWishlist(product.id) ? "#FF3B30" : "#666"}
            />
            <Text style={[
              styles.favoriteButtonText,
              isInWishlist(product.id) && styles.favoriteButtonTextActive
            ]}>
              {isInWishlist(product.id) ? 'Favorilerde' : 'Favorilere Ekle'}
            </Text>
          </TouchableOpacity>

          {/* Sepete Ekle Butonu */}
          <TouchableOpacity 
            style={[
              styles.addToCartButton,
              product.stock === 0 && styles.disabledButton
            ]}
            onPress={handleAddToCart}
            disabled={product.stock === 0}
          >
            <Text style={styles.addToCartButtonText}>
              {product.stock === 0 ? 'Stok Tükendi' : 'Sepete Ekle'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  imageContainer: {
    backgroundColor: 'white',
    padding: 20,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  tagContainer: {
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  tagIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rating: {
    fontSize: 16,
    color: '#666',
  },
  stock: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B8860B',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sellerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  sellerName: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 15,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  disabledText: {
    color: '#ccc',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  bottomContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
  },
  favoriteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  favoriteButtonTextActive: {
    color: '#FF3B30',
  },
  addToCartButton: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    flex: 2,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  wishlistButton: {
    position: 'absolute',
    top: 30,
    right: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
