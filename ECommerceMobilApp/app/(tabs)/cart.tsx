import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';

export default function CartScreen() {
  const { cart, cartItems, removeFromCart, getTotalPrice, getTotalItems, clearCart, createOrder, isLoading, refreshCart } = useCart();
  const { isLoggedIn, user } = useUser();

  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      'Ürünü Kaldır',
      'Bu ürünü sepetten kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kaldır', onPress: () => removeFromCart(productId), style: 'destructive' }
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Sepeti Temizle',
      'Tüm ürünleri sepetten kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Temizle', onPress: clearCart, style: 'destructive' }
      ]
    );
  };

  const handleCheckout = () => {
    // Giriş kontrolü
    if (!isLoggedIn) {
      Alert.alert(
        'Giriş Gerekli 🔐',
        'Ödeme yapabilmek için önce giriş yapmanız gerekmektedir.',
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'Giriş Yap', 
            onPress: () => router.push('/auth/login')
          }
        ]
      );
      return;
    }

    // Sepet boş kontrolü
    if (!cart || !cartItems || cartItems.length === 0) {
      Alert.alert('Sepet Boş', 'Sipariş vermek için sepetinizde ürün olmalı.');
      return;
    }

    // Sipariş onayı
    Alert.alert(
      'Sipariş Onayı 🛍️',
      `Merhaba ${user?.fullName}!\n\n📦 ${getTotalItems()} ürün\n💰 Toplam: ₺${getTotalPrice().toLocaleString()}\n\nSiparişinizi onaylıyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Siparişi Onayla', 
          onPress: async () => {
            try {
              await createOrder();
            } catch (error) {
              console.error('Order creation error:', error);
              Alert.alert('Hata', 'Sipariş oluşturulurken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  const CartItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/product/${item.productId}`)}
      activeOpacity={0.8}
    >
      <View style={styles.cartItem}>
        <Image 
          source={{ uri: item.product?.image || 'https://via.placeholder.com/100' }} 
          style={styles.productImage} 
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.product?.name || 'Ürün'}</Text>
          <Text style={styles.productCategory}>{item.product?.category?.name || 'Kategori'}</Text>
          <Text style={styles.productPrice}>₺{item.price.toLocaleString()}</Text>
          <Text style={styles.productQuantity}>Adet: {item.quantity}</Text>
          <Text style={styles.productTotal}>Toplam: ₺{(item.price * item.quantity).toLocaleString()}</Text>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.productId)}
          >
            <Text style={styles.removeButtonText}>Kaldır</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sepetim</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🛒</Text>
          <Text style={styles.emptyStateTitle}>Sepetiniz Boş</Text>
          <Text style={styles.emptyStateText}>
            Henüz sepetinize ürün eklemediniz.{'\n'}
            Ana sayfadan ürün eklemeye başlayın!
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/')}
          >
            <Text style={styles.shopButtonText}>Alışverişe Başla</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sepetim ({getTotalItems()} ürün)</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearButton}>Temizle</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={cartItems}
        renderItem={CartItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartList}
      />

      <View style={styles.totalContainer}>
        <View style={styles.totalInfo}>
          <Text style={styles.totalLabel}>Toplam ({getTotalItems()} ürün)</Text>
          <Text style={styles.totalPrice}>₺{getTotalPrice().toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Ödeme Yap</Text>
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
  header: {
    backgroundColor: '#B8860B',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  clearButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cartList: {
    padding: 15,
  },
  cartItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
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
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  checkoutButton: {
    backgroundColor: '#B8860B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B8860B',
    marginTop: 4,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
