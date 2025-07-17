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
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Product, tagConfig } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUser } from '../../context/UserContext';
import { ProductAPI, CouponAPI, ValidateCouponRequest } from '../../services/ApiService';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { addToCart: addToCartContext, cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isLoggedIn } = useUser();

  // Kupon state'leri
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: number;
    value: number;
    description: string;
    discount: number;
    finalPrice: number;
  } | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Ürünü API'den yükle
  useEffect(() => {
    loadProduct();
  }, [id]);

  // Quantity değiştiğinde kupon tekrar validate et
  useEffect(() => {
    if (appliedCoupon && product) {
      validateCouponForQuantity();
    }
  }, [quantity]);

  const validateCouponForQuantity = async () => {
    if (!appliedCoupon || !product) return;

    try {
      const request: ValidateCouponRequest = {
        couponCode: appliedCoupon.code,
        productId: product.id,
        quantity: quantity,
        originalPrice: product.price * quantity
      };

      const response = await CouponAPI.validate(request);

      if (response.success && response.value.isValid) {
        const coupon = response.value.coupon;
        
        // DEBUG: Console'da değerleri kontrol et
        console.log('🔍 Quantity Change Response:', {
          discountAmount: response.value.discountAmount,
          finalPrice: response.value.finalPrice,
          originalPrice: product.price * quantity,
          quantity: quantity,
          productPrice: product.price
        });
        
        setAppliedCoupon({
          code: coupon?.code || appliedCoupon.code,
          type: coupon?.type || appliedCoupon.type,
          value: coupon?.value || appliedCoupon.value,
          description: coupon?.description || appliedCoupon.description,
          discount: response.value.discountAmount,
          finalPrice: response.value.finalPrice
        });
      } else {
        // Kupon artık geçerli değilse kaldır
        setAppliedCoupon(null);
        setCouponCode('');
        Alert.alert('Kupon Geçersiz', 'Kupon bu miktar için geçerli değil ve kaldırıldı.');
      }
    } catch (error) {
      console.error('Error revalidating coupon:', error);
      setAppliedCoupon(null);
      setCouponCode('');
    }
  };

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

  // Kategori adını product'tan çek
  const getCategoryName = (categoryId: string): string => {
    return product?.category?.name || 'Bilinmeyen Kategori';
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
    const couponCodeToSend = appliedCoupon ? appliedCoupon.code : undefined;
    await addToCartContext(product.id, quantity, couponCodeToSend);

    // Miktar seçiciyi sıfırla
    setQuantity(1);
    
    // Kupon varsa temizle
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCouponCode('');
    }
  };

  // Kupon uygulama fonksiyonu
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Uyarı', 'Lütfen kupon kodu girin');
      return;
    }

    if (!isLoggedIn) {
      Alert.alert('Giriş Gerekli', 'Kupon uygulayabilmek için giriş yapmanız gerekiyor');
      return;
    }

    if (!product) return;

    setIsValidatingCoupon(true);

    try {
      const request: ValidateCouponRequest = {
        couponCode: couponCode.trim(),
        productId: product.id,
        quantity: quantity,
        originalPrice: product.price 
      };

      const response = await CouponAPI.validate(request);

      if (response.success && response.value.isValid) {
        const coupon = response.value.coupon;
        
        
        setAppliedCoupon({
          code: coupon?.code || couponCode.trim(),
          type: coupon?.type || 1,
          value: coupon?.value || 0,
          description: coupon?.description || '',
          discount: response.value.discountAmount,
          finalPrice: response.value.finalPrice
        });

        setShowCouponModal(false);
        Alert.alert('Başarılı', `Kupon uygulandı! ₺${response.value.discountAmount.toLocaleString()} indirim kazandınız.`);
      } else {
        Alert.alert('Kupon Geçersiz', response.value.message || 'Bu kupon bu ürün için geçerli değil.');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      Alert.alert('Hata', 'Kupon doğrulanırken bir hata oluştu');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Kupon kaldırma fonksiyonu
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
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

          {/* Kupon Kodu */}
          <View style={styles.couponContainer}>
            <Text style={styles.sectionTitle}>Kupon Kodu</Text>
            <View style={styles.couponInputContainer}>
              <TextInput
                style={styles.couponInput}
                placeholder="Kupon kodunu giriniz"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[
                  styles.couponButton,
                  (!couponCode || isValidatingCoupon) && styles.disabledButton
                ]}
                onPress={handleApplyCoupon}
                disabled={!couponCode || isValidatingCoupon}
              >
                <Text style={styles.couponButtonText}>
                  {isValidatingCoupon ? 'Kontrol Ediliyor...' : 'Uygula'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {appliedCoupon && (
              <View style={styles.appliedCouponContainer}>
                <View style={styles.appliedCouponInfo}>
                  <Text style={styles.appliedCouponText}>
                    {appliedCoupon.code} - {appliedCoupon.type === 1 ? `%${appliedCoupon.value}` : `₺${appliedCoupon.value}`}
                  </Text>
                  <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeCouponButton}>
                    <Text style={styles.removeCouponButtonText}>Kaldır</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.couponDescriptionText}>
                  {appliedCoupon.description}
                </Text>
              </View>
            )}
          </View>

          {/* Toplam Fiyat */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Toplam:</Text>
            <View style={styles.couponPriceContainer}>
              {appliedCoupon && (
                <Text style={styles.couponOriginalPrice}>
                  ₺{(product.price * quantity).toLocaleString()}
                </Text>
              )}
              <Text style={styles.totalPrice}>
                ₺{(appliedCoupon ? appliedCoupon.finalPrice : product.price * quantity).toLocaleString()}
              </Text>
              
              {/* DEBUG: Değerleri göster */}
              {appliedCoupon && (
                <View style={{marginTop: 5}}>
                  <Text style={{fontSize: 10, color: 'red'}}>
                    DEBUG: finalPrice={appliedCoupon.finalPrice}, discount={appliedCoupon.discount}
                  </Text>
                  <Text style={{fontSize: 10, color: 'red'}}>
                    quantity={quantity}, productPrice={product.price}
                  </Text>
                </View>
              )}
            </View>
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
  couponContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  couponButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  couponButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  appliedCouponContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  appliedCouponInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  appliedCouponText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  removeCouponButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeCouponButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  couponDescriptionText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  couponPriceContainer: {
    alignItems: 'flex-end',
  },
  couponOriginalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
});
