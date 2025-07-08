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
import { products } from '../../data/products';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  
  // ID'ye göre ürünü bul
  const product = products.find(p => p.id === id);

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

  const addToCart = () => {
    Alert.alert(
      'Sepete Eklendi!',
      `${product.name} - ${quantity} adet sepetinize eklendi.`,
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Ürün Resmi */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
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

          <Text style={styles.productPrice}>
            ₺{product.price.toLocaleString()}
          </Text>

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
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            product.stock === 0 && styles.disabledButton
          ]}
          onPress={addToCart}
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
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
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
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B8860B',
    marginBottom: 15,
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
    paddingBottom: 30,
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
