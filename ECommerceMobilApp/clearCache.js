// Cache temizleme script'i
import AsyncStorage from '@react-native-async-storage/async-storage';

const clearAllCache = async () => {
  try {
    const keys = [
      '@categories_cache',
      '@products_cache', 
      '@cart_cache',
      '@cache_expiry',
      '@cache_expiry_cart'
    ];
    
    await AsyncStorage.multiRemove(keys);
    console.log('✅ All cache cleared!');
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
};

// Export the function
export { clearAllCache };
