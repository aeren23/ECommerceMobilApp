import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { products, tagConfig } from '../../data/products';
import { useCart } from '../../context/CartContext';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const insets = useSafeAreaInsets();
  const { addToCart: addToCartContext, cartItems } = useCart();
  
  // ID'ye göre ürünü bul
  const product = products.find(p => p.id === id);

  // Sepetteki bu ürünün miktarını kontrol et
  const cartItem = cartItems.find(item => item.id === id);
  const currentCartQuantity = cartItem ? cartItem.quantity : 0;

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

  const handleAddToCart = () => {
    if (product.stock === 0) {
      Alert.alert('Uyarı', 'Bu ürün stokta bulunmamaktadır.');
      return;
    }

    if (currentCartQuantity + quantity > product.stock) {
      Alert.alert(
        'Stok Uyarısı',
        `Bu üründen en fazla ${product.stock} adet satın alabilirsiniz. Sepetinizde zaten ${currentCartQuantity} adet var.`
      );
      return;
    }

    addToCartContext({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      maxStock: product.stock,
    }, quantity);

    Alert.alert(
      'Sepete Eklendi! 🛒',
      `${product.name} - ${quantity} adet sepetinize eklendi.`,
      [
        { text: 'Tamam', style: 'default' },
        { text: 'Sepete Git', onPress: () => router.push('/(tabs)/cart') }
      ]
    );

    // Miktar seçiciyi sıfırla
    setQuantity(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Ürün Resmi */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          
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
          <Text style={styles.productCategory}>{product.category}</Text>
          
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
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
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
  addToCartButton: {
    backgroundColor: '#B8860B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
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
});
