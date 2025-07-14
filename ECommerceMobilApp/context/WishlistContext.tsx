import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { WishlistAPI, ProductAPI } from '../services/ApiService';
import { useUser } from './UserContext';

interface WishlistContextType {
  wishlistItems: string[];
  wishlistProducts: any[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loadWishlist: () => Promise<void>;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, user } = useUser();

  // Wishlist'i yükle
  const loadWishlist = async () => {
    if (!isLoggedIn) {
      setWishlistItems([]);
      setWishlistProducts([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log('❤️ Loading wishlist...');
      
      const wishlistIds = await WishlistAPI.getWishlistSimple();
      
      if (wishlistIds && wishlistIds.length > 0) {
        console.log(`❤️ Found ${wishlistIds.length} items in wishlist`);
        setWishlistItems(wishlistIds);
        
        // Ürün detaylarını çek
        await loadWishlistProductDetails(wishlistIds);
      } else {
        console.log('❤️ Wishlist is empty');
        setWishlistItems([]);
        setWishlistProducts([]);
      }
    } catch (error) {
      console.error('❌ Error loading wishlist:', error);
      Alert.alert('Hata', 'Favoriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Wishlist ürünlerinin detaylarını yükle
  const loadWishlistProductDetails = async (productIds: string[]) => {
    try {
      console.log('📦 Loading wishlist product details...');
      
      const productPromises = productIds.map(async (productId) => {
        const product = await ProductAPI.getByIdSimple(productId);
        return product;
      });

      const products = await Promise.all(productPromises);
      const validProducts = products.filter(product => product !== null);
      
      console.log(`✅ Loaded ${validProducts.length} wishlist products`);
      setWishlistProducts(validProducts);
    } catch (error) {
      console.error('❌ Error loading wishlist product details:', error);
    }
  };

  // Wishlist'e ürün ekle
  const addToWishlist = async (productId: string) => {
    if (!isLoggedIn) {
      Alert.alert('Uyarı', 'Favorilere eklemek için giriş yapmalısınız');
      return;
    }

    if (isInWishlist(productId)) {
      Alert.alert('Bilgi', 'Bu ürün zaten favorilerinizde');
      return;
    }

    try {
      console.log(`❤️ Adding product ${productId} to wishlist...`);
      
      const result = await WishlistAPI.addToWishlistSimple(productId);
      
      if (result.success) {
        // Yerel state'i güncelle
        const newWishlistItems = [...wishlistItems, productId];
        setWishlistItems(newWishlistItems);
        
        // Ürün detayını yükle ve ekle
        const product = await ProductAPI.getByIdSimple(productId);
        if (product) {
          setWishlistProducts(prev => [...prev, product]);
        }
        
        console.log('✅ Product added to wishlist successfully');
        Alert.alert('Başarılı', 'Ürün favorilerinize eklendi', [{ text: 'Tamam' }]);
      } else {
        console.error('❌ Failed to add to wishlist:', result.message);
        Alert.alert('Hata', result.message || 'Favorilere eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error);
      Alert.alert('Hata', 'Favorilere eklenirken bir hata oluştu');
    }
  };

  // Wishlist'ten ürün çıkar
  const removeFromWishlist = async (productId: string) => {
    if (!isLoggedIn) {
      return;
    }

    try {
      console.log(`💔 Removing product ${productId} from wishlist...`);
      
      const result = await WishlistAPI.removeFromWishlistSimple(productId);
      
      if (result.success) {
        // Yerel state'i güncelle
        setWishlistItems(prev => prev.filter(id => id !== productId));
        setWishlistProducts(prev => prev.filter(product => product.id !== productId));
        
        console.log('✅ Product removed from wishlist successfully');
        Alert.alert('Başarılı', 'Ürün favorilerinizden çıkarıldı', [{ text: 'Tamam' }]);
      } else {
        console.error('❌ Failed to remove from wishlist:', result.message);
        Alert.alert('Hata', result.message || 'Favorilerden çıkarılırken hata oluştu');
      }
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      Alert.alert('Hata', 'Favorilerden çıkarılırken bir hata oluştu');
    }
  };

  // Wishlist'i tamamen temizle
  const clearWishlist = async () => {
    if (!isLoggedIn) {
      return;
    }

    try {
      console.log('🗑️ Clearing wishlist...');
      
      const result = await WishlistAPI.clearWishlistSimple();
      
      if (result.success) {
        setWishlistItems([]);
        setWishlistProducts([]);
        
        console.log('✅ Wishlist cleared successfully');
        Alert.alert('Başarılı', 'Tüm favoriler temizlendi', [{ text: 'Tamam' }]);
      } else {
        console.error('❌ Failed to clear wishlist:', result.message);
        Alert.alert('Hata', result.message || 'Favoriler temizlenirken hata oluştu');
      }
    } catch (error) {
      console.error('❌ Error clearing wishlist:', error);
      Alert.alert('Hata', 'Favoriler temizlenirken bir hata oluştu');
    }
  };

  // Ürünün wishlist'te olup olmadığını kontrol et
  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.includes(productId);
  };

  // Wishlist sayısını getir
  const getWishlistCount = (): number => {
    return wishlistItems.length;
  };

  // Kullanıcı giriş yaptığında wishlist'i yükle
  useEffect(() => {
    if (isLoggedIn) {
      loadWishlist();
    } else {
      setWishlistItems([]);
      setWishlistProducts([]);
    }
  }, [isLoggedIn]);

  const value: WishlistContextType = {
    wishlistItems,
    wishlistProducts,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    loadWishlist,
    getWishlistCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
