import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { CartAPI, CartDto, CartItemDto, OrderAPI } from '../services/ApiService';
import { useUser } from './UserContext';

// Context type - Backend API'ye uygun
interface CartContextType {
  cart: CartDto | null;
  cartItems: CartItemDto[];
  addToCart: (productId: string, quantity?: number, couponCode?: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  createOrder: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
}

// Context oluştur
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoggedIn } = useUser();

  // Kullanıcı login durumu değiştiğinde sepeti yükle
  useEffect(() => {
    if (isLoggedIn && user) {
      loadCart();
    } else {
      // Logout durumunda sepeti temizle
      setCart(null);
      setIsLoading(false);
    }
  }, [isLoggedIn, user]);

  // Sepeti API'den yükle
  const loadCart = async () => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🛒 Loading cart from API...');
      const response = await CartAPI.getCart();
      
      console.log('🛒 Cart API response:', response);
      
      if (response.success && response.value) {
        console.log('🛒 Cart data received:', {
          id: response.value.id,
          userId: response.value.userId,
          totalPrice: response.value.totalPrice,
          itemsCount: response.value.items?.length || 0,
          items: response.value.items?.map(item => ({
            productId: item.productId,
            productName: item.product?.name || 'Unknown',
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
          }))
        });
        setCart(response.value);
      } else {
        console.log('Cart not found or empty:', response.errorMessage);
        setCart(null);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Sepeti yenile
  const refreshCart = async () => {
    await loadCart();
  };

  // Sepete ürün ekle
  const addToCart = async (productId: string, quantity: number = 1, couponCode?: string) => {
    console.log('CartContext.addToCart called with:', { productId, quantity, couponCode, isLoggedIn });
    
    if (!isLoggedIn) {
      console.log('User not logged in');
      Alert.alert('Giriş Gerekli', 'Sepete ürün eklemek için giriş yapmalısınız.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🛒 Starting cart addition process...');
      
      const response = await CartAPI.addToCart(productId, quantity, couponCode);
      console.log('Cart API Response:', response);
      
      if (response.success) {
        // Sepeti yenile
        console.log('Product added successfully, refreshing cart...');
        await loadCart();
        Alert.alert('Başarılı', 'Ürün sepete eklendi!');
      } else {
        console.error('Failed to add to cart:', response.errorMessage);
        Alert.alert('Hata', response.errorMessage || 'Ürün sepete eklenemedi');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Hata', 'Ürün sepete eklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Sepetten ürün çıkar
  const removeFromCart = async (productId: string) => {
    if (!isLoggedIn) return;

    try {
      setIsLoading(true);
      const response = await CartAPI.removeFromCart(productId);
      
      if (response.success) {
        // Sepeti yenile
        await loadCart();
        Alert.alert('Başarılı', 'Ürün sepetten çıkarıldı!');
      } else {
        Alert.alert('Hata', response.errorMessage || 'Ürün sepetten çıkarılamadı');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      Alert.alert('Hata', 'Ürün sepetten çıkarılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Sepeti temizle
  const clearCart = async () => {
    if (!isLoggedIn) return;

    try {
      setIsLoading(true);
      const response = await CartAPI.clearCart();
      
      if (response.success) {
        setCart(null);
        Alert.alert('Başarılı', 'Sepet temizlendi!');
      } else {
        Alert.alert('Hata', response.errorMessage || 'Sepet temizlenemedi');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      Alert.alert('Hata', 'Sepet temizlenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Sipariş oluştur
  const createOrder = async () => {
    if (!isLoggedIn || !user) {
      Alert.alert('Giriş Gerekli', 'Sipariş vermek için giriş yapmalısınız.');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      Alert.alert('Sepet Boş', 'Sipariş vermek için sepetinizde ürün olmalı.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🛍️ Creating order from cart...');
      
      // Backend'in beklediği format - artık price bilgisi de gerekli
      const orderData = {
        userId: user.id,
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price // Cart item'ın birim fiyatı (backend'de kuruş)
        }))
      };
      
      console.log('Order data:', orderData);
      
      const response = await OrderAPI.createOrderSimple(orderData);
      console.log('Order creation response:', response);
      
      if (response.success) {
        // API'den sepeti de temizle 
        try {
          const clearResponse = await CartAPI.clearCart();
          if (clearResponse.success) {
            console.log('Cart cleared in backend after order creation');
            setCart(null); // Local state'i de temizle
          }
        } catch (clearError) {
          console.error('Error clearing cart in backend:', clearError);
          // Sipariş başarılı oldu ama sepet temizlenemedi, sadece log
        }
        
        Alert.alert(
          'Sipariş Başarılı! 🎉',
          `Siparişiniz başarıyla oluşturuldu.\nSipariş ID: ${response.orderId}`,
          [
            { text: 'Tamam', onPress: () => console.log('Order completed') }
          ]
        );
      } else {
        console.error('❌ Order creation failed:', response.message);
        Alert.alert(
          'Sipariş Hatası',
          response.message || 'Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'
        );
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      Alert.alert('Hata', 'Sipariş oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Toplam fiyat hesapla
  const getTotalPrice = (): number => {
    if (!cart) {
      console.log('💰 getTotalPrice: Cart is null, returning 0');
      return 0;
    }
    
    console.log('💰 getTotalPrice: Cart totalPrice from backend:', cart.totalPrice);
    
    // Ek kontrol: Frontend'de de hesaplayalım
    const calculatedTotal = cart.items?.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      console.log(`💰 Item ${item.productId}: price=${item.price} x quantity=${item.quantity} = ${itemTotal}`);
      return total + itemTotal;
    }, 0) || 0;
    
    console.log('💰 Frontend calculated total:', calculatedTotal);
    console.log('💰 Backend totalPrice:', cart.totalPrice);
    
    if (calculatedTotal !== cart.totalPrice) {
      console.log('calculatedTotal = ', calculatedTotal);
      console.log('cart.totalPrice = ', cart.totalPrice);
      console.warn('⚠️ MISMATCH: Frontend and backend totals differ!');
    }
    
    return cart.totalPrice;
  };

  // Toplam ürün sayısı hesapla
  const getTotalItems = (): number => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Cart items - kolay erişim için
  const cartItems = cart?.items || [];

  const contextValue: CartContextType = {
    cart,
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    createOrder,
    getTotalPrice,
    getTotalItems,
    isLoading,
    refreshCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}