import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API ServiceResponse tipi - .NET API'den gelen response formatı
export interface ServiceResponse<T> {
  value: T;
  success: boolean;
  errorMessage?: string;
}

// Category DTO'ları
export interface CategoryDto {
  id: string;
  name: string;
}

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  id: string;
  name: string;
}

// API Base URL - Basitleştirilmiş
// Development modunda hep manuel IP kullan
const DEVICE_IP = '192.168.78.84'; // Bilgisayarın Wi-Fi IP'si
const API_PORT = '5222';

const API_BASE_URL = __DEV__ 
  ? `http://${DEVICE_IP}:${API_PORT}/api`  // Development: Wi-Fi IP
  : 'https://your-production-api.com/api'; // Production: Gerçek domain

const TOKEN_STORAGE_KEY = '@auth_token';
const CATEGORIES_CACHE_KEY = '@categories_cache';
const PRODUCTS_CACHE_KEY = '@products_cache';
const CACHE_EXPIRY_KEY = '@cache_expiry';

// Cache süresi: 5 dakika (300000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

// Global API çağrısı fonksiyonu - ServiceResponse formatını handle eder
export const apiCall = async <T>(endpoint: string, method: string = 'GET', body?: any): Promise<ServiceResponse<T>> => {
  try {
    // Debug için URL'yi logla
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`API Call: ${method} ${fullUrl}`);
    
    // Token'ı AsyncStorage'dan al
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    // Token varsa Authorization header'ını ekle
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Token added to headers');
    } else {
      console.log('❌ No token found');
    }

    console.log('Sending request...');
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);

    // Response body'yi al - önce text olarak al, sonra JSON parse et
    const responseText = await response.text();
    console.log('Response Text:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.log('Response was not valid JSON:', responseText);
      
      // JSON parse edilemezse error döndür
      return {
        value: null as T,
        success: false,
        errorMessage: `Invalid JSON response: ${responseText.substring(0, 200)}...`
      };
    }
    
    console.log('Response Data:', responseData);

    if (!response.ok) {
      console.log(`API Error - Status: ${response.status}`);
      
      // 401 Unauthorized durumunda token'ı temizle
      if (response.status === 401) {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        await AsyncStorage.removeItem('@user_data');
        console.log('Token cleared due to 401 error');
      }
      
      // ServiceResponse formatında hata döndür
      return {
        value: null as T,
        success: false,
        errorMessage: responseData.errorMessage || `API Error: ${response.status} - ${response.statusText}`
      };
    }

    // Başarılı response - ServiceResponse formatında döndür
    // API'den gelen format: { result: { success, value, errorMessage } }
    if (responseData.result) {
      console.log('ServiceResponse format detected in result wrapper');
      return responseData.result as ServiceResponse<T>;
    } else if (responseData.success !== undefined) {
      // Zaten ServiceResponse formatında
      console.log('ServiceResponse format detected');
      return responseData as ServiceResponse<T>;
    } else {
      // Düz data gelmiş, ServiceResponse formatına çevir
      console.log('Converting to ServiceResponse format');
      return {
        value: responseData,
        success: true,
        errorMessage: undefined
      };
    }
  } catch (error) {
    console.error(`❌ API Call Error (${endpoint}):`, error);
    
    // Network veya parse hatası
    return {
      value: null as T,
      success: false,
      errorMessage: error.message || 'Network request failed'
    };
  }
};

// Test API bağlantısı
export const TestAPI = {
  checkConnection: async () => {
    try {
      console.log('Testing API connection...');
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/swagger`);
      console.log('API is reachable:', response.status);
      return { status: response.status, reachable: true };
    } catch (error) {
      console.error('❌ API not reachable:', error);
      return { reachable: false, error: error.message };
    }
  }
};

// Auth API'leri - ServiceResponse formatını kullanır
export const AuthAPI = {
  login: async (email: string, password: string): Promise<ServiceResponse<{ user: any, token: string }>> => {
    return apiCall<{ user: any, token: string }>('/Auth/login', 'POST', { email, password });
  },
  
  register: async (userData: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
  }): Promise<ServiceResponse<{ user: any, token: string }>> => {
    return apiCall<{ user: any, token: string }>('/Auth/register', 'POST', userData);
  },

  logout: async (): Promise<void> => {
    // Token'ı temizle
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem('@user_data');
  },

  // Helper fonksiyonlar - UserContext için basitleştirilmiş
  loginSimple: async (email: string, password: string): Promise<{ user: any, token: string } | null> => {
    const response = await AuthAPI.login(email, password);
    return response.success ? response.value : null;
  },

  registerSimple: async (userData: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const response = await AuthAPI.register(userData);
    return {
      success: response.success,
      message: response.success ? undefined : response.errorMessage
    };
  }
};

// Category API - ServiceResponse formatını kullanır + Cache mekanizması
export const CategoryAPI = {
  // Cache kontrol fonksiyonu
  isCacheValid: async (): Promise<boolean> => {
    try {
      const expiry = await AsyncStorage.getItem(CACHE_EXPIRY_KEY);
      if (!expiry) return false;
      
      const expiryTime = parseInt(expiry, 10);
      return Date.now() < expiryTime;
    } catch (error) {
      console.error('Cache expiry check failed:', error);
      return false;
    }
  },

  // Cache'i temizle
  clearCache: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        CATEGORIES_CACHE_KEY,
        PRODUCTS_CACHE_KEY,
        CACHE_EXPIRY_KEY
      ]);
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Cache clear failed:', error);
    }
  },

  // Tüm kategorileri getir (cache'li)
  getAll: async (): Promise<ServiceResponse<CategoryDto[]>> => {
    try {
      // Önce cache'e bak
      const isCacheValid = await CategoryAPI.isCacheValid();
      if (isCacheValid) {
        const cachedCategories = await AsyncStorage.getItem(CATEGORIES_CACHE_KEY);
        if (cachedCategories) {
          console.log('Loading categories from cache');
          return {
            success: true,
            value: JSON.parse(cachedCategories),
            errorMessage: undefined
          };
        }
      }

      // Cache yoksa veya geçersizse API'den çek
      console.log('Fetching categories from API');
      const response = await apiCall<CategoryDto[]>('/Category');
      
      // Başarılı response'u cache'e kaydet
      if (response.success && response.value) {
        await AsyncStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(response.value));
        await AsyncStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
        console.log('Categories cached successfully');
      }
      
      return response;
    } catch (error) {
      console.error('❌ CategoryAPI.getAll error:', error);
      return {
        success: false,
        value: [],
        errorMessage: error.message || 'Failed to fetch categories'
      };
    }
  },

  // ID'ye göre kategori getir
  getById: async (id: string): Promise<ServiceResponse<CategoryDto>> => {
    return apiCall<CategoryDto>(`/Category/${id}`);
  },

  // Yeni kategori oluştur
  create: async (categoryData: CreateCategoryDto): Promise<ServiceResponse<string>> => {
    const response = await apiCall<string>('/Category', 'POST', categoryData);
    
    // Başarılı create işleminden sonra cache'i temizle
    if (response.success) {
      await CategoryAPI.clearCache();
      console.log('Cache cleared after category creation');
    }
    
    return response;
  },

  // Kategori güncelle
  update: async (categoryData: UpdateCategoryDto): Promise<ServiceResponse<string>> => {
    const response = await apiCall<string>('/Category', 'PUT', categoryData);
    
    // Başarılı update işleminden sonra cache'i temizle
    if (response.success) {
      await CategoryAPI.clearCache();
      console.log('✅ Cache cleared after category update');
    }
    
    return response;
  },

  // Kategori sil
  delete: async (id: string): Promise<ServiceResponse<boolean>> => {
    const response = await apiCall<boolean>(`/Category/${id}`, 'DELETE');
    
    // Başarılı delete işleminden sonra cache'i temizle
    if (response.success) {
      await CategoryAPI.clearCache();
      console.log('✅ Cache cleared after category deletion');
    }
    
    return response;
  }
};

// Product API'leri - ServiceResponse formatını kullanır + Cache mekanizması
export const ProductAPI = {
  // Tüm ürünleri getir (cache'li)
  getAll: async (): Promise<ServiceResponse<any[]>> => {
    try {
      // Önce cache'e bak
      const isCacheValid = await CategoryAPI.isCacheValid();
      if (isCacheValid) {
        const cachedProducts = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);
        if (cachedProducts) {
          console.log('✅ Loading products from cache');
          return {
            success: true,
            value: JSON.parse(cachedProducts),
            errorMessage: undefined
          };
        }
      }

      // Cache yoksa veya geçersizse API'den çek
      console.log('Fetching products from API');
      const response = await apiCall<any[]>('/Product');
      
      // Başarılı response'u cache'e kaydet
      if (response.success && response.value) {
        await AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(response.value));
        await AsyncStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
        console.log('Products cached successfully');
      }
      
      return response;
    } catch (error) {
      console.error('ProductAPI.getAll error:', error);
      return {
        success: false,
        value: [],
        errorMessage: error.message || 'Failed to fetch products'
      };
    }
  },

  // Cache temizleme fonksiyonu
  clearCache: async (): Promise<void> => {
    await CategoryAPI.clearCache(); // Aynı cache temizleme fonksiyonu
  },

  // ID ile ürün getir
  getById: async (id: string): Promise<ServiceResponse<any>> => {
    return apiCall<any>(`/Product/${id}`);
  },

  // Ürün oluştur (sadece satıcılar için)
  create: async (productData: {
    product: {
      name: string;
      categoryId: string;
      image: string;
      price: number;
      originalPrice?: number;
      seller: string;
      stock: number;
      rating: number;
      tags: string[];
    }
  }): Promise<ServiceResponse<string>> => {
    const response = await apiCall<string>('/Product', 'POST', productData);
    
    // Başarılı create işleminden sonra cache'i temizle
    if (response.success) {
      await ProductAPI.clearCache();
      console.log('✅ Cache cleared after product creation');
    }
    
    return response;
  },

  // Ürün güncelle (sadece satıcılar için)
  update: async (productData: {
    id: string;
    name: string;
    categoryId: string;
    image: string;
    price: number;
    originalPrice?: number;
    seller: string;
    stock: number;
    rating: number;
    tags: string[];
  }): Promise<ServiceResponse<string>> => {
    const response = await apiCall<string>('/Product', 'PUT', productData);
    
    // Başarılı update işleminden sonra cache'i temizle
    if (response.success) {
      await ProductAPI.clearCache();
      console.log('Cache cleared after product update');
    }
    
    return response;
  },

  // Ürün sil (sadece satıcılar için)
  delete: async (id: string): Promise<ServiceResponse<string>> => {
    const response = await apiCall<string>(`/Product/${id}`, 'DELETE');
    
    // Başarılı delete işleminden sonra cache'i temizle
    if (response.success) {
      await ProductAPI.clearCache();
      console.log('✅ Cache cleared after product deletion');
    }
    
    return response;
  },

  // Arama Client-side
  search: async (query: string): Promise<ServiceResponse<any[]>> => {
    const allProducts = await ProductAPI.getAll();
    if (allProducts.success && allProducts.value) {
      const filtered = allProducts.value.filter((product: any) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.seller.toLowerCase().includes(query.toLowerCase())
      );
      return {
        success: true,
        value: filtered,
        errorMessage: undefined
      };
    }
    return allProducts;
  },

  // Kategori bazlı filtreleme 
  getByCategory: async (categoryId: string): Promise<ServiceResponse<any[]>> => {
    const allProducts = await ProductAPI.getAll();
    if (allProducts.success && allProducts.value) {
      const filtered = allProducts.value.filter((product: any) =>
        product.categoryId === categoryId
      );
      return {
        success: true,
        value: filtered,
        errorMessage: undefined
      };
    }
    return allProducts;
  },

  // Satıcıya göre ürünleri getir
  getBySeller: async (seller: string): Promise<ServiceResponse<any[]>> => {
    return apiCall<any[]>(`/Product/byseller/${encodeURIComponent(seller)}`);
  },

  // Basitleştirilmiş fonksiyonlar (UserContext tarzı)
  getAllSimple: async (): Promise<any[] | null> => {
    const response = await ProductAPI.getAll();
    return response.success ? response.value : null;
  },

  getByIdSimple: async (id: string): Promise<any | null> => {
    const response = await ProductAPI.getById(id);
    return response.success ? response.value : null;
  },

  createSimple: async (productData: any): Promise<{ success: boolean; message?: string; productId?: string }> => {
    const response = await ProductAPI.create(productData);
    return {
      success: response.success,
      message: response.success ? undefined : response.errorMessage,
      productId: response.success ? response.value : undefined
    };
  }
};

// Cart API'leri - ServiceResponse formatını kullanır
export const CartAPI = {
  getCart: async (): Promise<ServiceResponse<any>> => {
    return apiCall<any>('/cart');
  },

  addToCart: async (productId: string, quantity: number): Promise<ServiceResponse<any>> => {
    return apiCall<any>('/cart/add-item', 'POST', { productId, quantity });
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<ServiceResponse<any>> => {
    return apiCall<any>(`/cart/items/${itemId}`, 'PUT', { quantity });
  },

  removeFromCart: async (productId: string): Promise<ServiceResponse<any>> => {
    return apiCall<any>(`/cart/remove-item/${productId}`, 'DELETE');
  },

  clearCart: async (): Promise<ServiceResponse<any>> => {
    return apiCall<any>('/cart/clear', 'DELETE');
  }
};

// Order API'leri - ServiceResponse formatını kullanır
export const OrderAPI = {
  createOrder: async (orderData: any): Promise<ServiceResponse<any>> => {
    return apiCall<any>('/orders', 'POST', orderData);
  },

  getOrders: async (): Promise<ServiceResponse<any[]>> => {
    return apiCall<any[]>('/orders');
  },

  getOrderById: async (id: string): Promise<ServiceResponse<any>> => {
    return apiCall<any>(`/orders/${id}`);
  },

  cancelOrder: async (id: string): Promise<ServiceResponse<any>> => {
    return apiCall<any>(`/orders/${id}/cancel`, 'POST');
  }
};

// User API'leri - ServiceResponse formatını kullanır
export const UserAPI = {
  getProfile: async (): Promise<ServiceResponse<any>> => {
    return apiCall<any>('/users/profile');
  },

  updateProfile: async (userData: any): Promise<ServiceResponse<any>> => {
    return apiCall<any>('/users/profile', 'PUT', userData);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ServiceResponse<any>> => {
    return apiCall<any>('/users/change-password', 'POST', { currentPassword, newPassword });
  }
};

// Token yönetimi için yardımcı fonksiyonlar
export const TokenUtils = {
  // Token'ı al
  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  },

  // Token'ı kaydet
  setToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  },

  // Token'ı temizle
  clearToken: async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem('@user_data');
  },

  // Token'ın geçerli olup olmadığını kontrol et
  isTokenValid: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) return false;

      // JWT token'ı decode et ve expire tarihini kontrol et
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }
};

// Default export
const ApiService = {
  apiCall,
  Auth: AuthAPI,
  Product: ProductAPI,
  Cart: CartAPI,
  Order: OrderAPI,
  User: UserAPI,
  Token: TokenUtils
};

export default ApiService;