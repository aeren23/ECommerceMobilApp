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

// Coupon DTO'ları
export interface CouponDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: number; // 1: Percentage, 2: FixedAmount
  value: number;
  minimumAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageLimitPerUser?: number;
  isActive: boolean;
  createdById: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  productId: string;
  product?: {
    id: string;
    name: string;
    image: string;
  };
  currentUsageCount: number;
}

export interface CreateCouponDto {
  code: string;
  name: string;
  description?: string;
  type: number; // 1: Percentage, 2: FixedAmount
  value: number;
  minimumAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageLimitPerUser?: number;
  isActive: boolean;
  productId: string;
  createdBy?: string; // Backend'de zorunlu
}

export interface UpdateCouponDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: number;
  value: number;
  minimumAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageLimitPerUser?: number;
  isActive: boolean;
  productId: string;
  createdBy?: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  discountAmount: number;
  finalPrice: number;
  message: string;
  coupon?: {
    id: string;
    code: string;
    name: string;
    description: string;
    type: number;
    value: number;
    minimumAmount?: number;
    startDate: string;
    endDate: string;
    usageLimit?: number;
    usageLimitPerUser?: number;
    currentUsageCount: number;
    isActive: boolean;
    createdBy: string;
    productId: string;
  };
}

export interface ValidateCouponRequest {
  couponCode: string;
  productId: string;
  quantity: number;
  originalPrice: number;
}

// Cart DTO'ları
export interface CartItemDto {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    image: string;
    category?: {
      id: string;
      name: string;
    };
  };
}

export interface CartDto {
  id: string;
  userId: string;
  totalPrice: number;
  items: CartItemDto[];
}

export interface AddCartItemRequest {
  productId: string;
  quantity: number;
}

// API Base URL 
const DEVICE_IP = '192.168.1.80'; // Bilgisayarın Wi-Fi IP'si
const API_PORT = '5222';

const API_BASE_URL = __DEV__ 
  ? `http://${DEVICE_IP}:${API_PORT}/api`  // Development: Wi-Fi IP
  : 'https://your-production-api.com/api'; // Production: Gerçek domain

const TOKEN_STORAGE_KEY = '@auth_token';
// Cache key'leri
const CATEGORIES_CACHE_KEY = '@categories_cache';
const PRODUCTS_CACHE_KEY = '@products_cache';
const CART_CACHE_KEY = '@cart_cache';
const CACHE_EXPIRY_KEY = '@cache_expiry';

// Cache süresi: 5 dakika (300000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

// Global API çağrısı fonksiyonu - ServiceResponse formatını handle eder
export const apiCall = async <T>(endpoint: string, method: string = 'GET', body?: any): Promise<ServiceResponse<T>> => {
  try {
    // Token'ı AsyncStorage'dan al
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    // Token varsa Authorization header'ını ekle
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await response.text();

    if (response.status === 400) {
      // 400 hatalarını sessizce geç
    }

    let responseData;
    try {
      // Boş response kontrolü
      if (!responseText || responseText.trim() === '') {
        responseData = { success: true, value: true };
      } else {
        responseData = JSON.parse(responseText);
      }
    } catch (parseError) {
      // Boş response kontrolü
      if (!responseText || responseText.trim() === '') {
        responseData = { success: true, value: true };
      } else {
        // JSON parse edilemezse error döndür
        return {
          value: null as T,
          success: false,
          errorMessage: `Invalid JSON response: ${responseText.substring(0, 200)}...`
        };
      }
    }

    if (!response.ok) {
      // 401 Unauthorized durumunda token'ı temizle
      if (response.status === 401) {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        await AsyncStorage.removeItem('@user_data');
      }
      
      // ServiceResponse formatında hata döndür
      return {
        value: null as T,
        success: false,
        errorMessage: responseData.errorMessage || `API Error: ${response.status} - ${response.statusText}`
      };
    }

    // Başarılı response - ServiceResponse formatında döndür
    if (responseData.result) {
      return responseData.result as ServiceResponse<T>;
    } else if (responseData.success !== undefined) {
      // Zaten ServiceResponse formatında
      return responseData as ServiceResponse<T>;
    } else {
      // Düz data gelmiş, ServiceResponse formatına çevir
      return {
        value: responseData,
        success: true,
        errorMessage: undefined
      };
    }
  } catch (error) {
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
  getAll: async (forceRefresh: boolean = false): Promise<ServiceResponse<CategoryDto[]>> => {
    try {
      // ForceRefresh true ise cache'i atla
      if (!forceRefresh) {
        // Önce cache'e bak
        const isCacheValid = await CategoryAPI.isCacheValid();
        if (isCacheValid) {
          const cachedCategories = await AsyncStorage.getItem(CATEGORIES_CACHE_KEY);
          if (cachedCategories) {
            return {
              success: true,
              value: JSON.parse(cachedCategories),
              errorMessage: undefined
            };
          }
        }
      }

      // Cache yoksa, geçersizse veya forceRefresh true ise API'den çek
      const response = await apiCall<CategoryDto[]>('/Category');
      
      // Başarılı response'u cache'e kaydet
      if (response.success && response.value) {
        await AsyncStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(response.value));
        await AsyncStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
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
    }
    
    return response;
  },

  // Kategori güncelle
  update: async (categoryData: UpdateCategoryDto): Promise<ServiceResponse<string>> => {
    const response = await apiCall<string>('/Category', 'PUT', categoryData);
    
    // Başarılı update işleminden sonra cache'i temizle
    if (response.success) {
      await CategoryAPI.clearCache();
    }
    
    return response;
  },

  // Kategori sil
  delete: async (id: string): Promise<ServiceResponse<boolean>> => {
    const response = await apiCall<boolean>(`/Category/${id}`, 'DELETE');
    
    // Başarılı delete işleminden sonra cache'i temizle
    if (response.success) {
      await CategoryAPI.clearCache();
    }
    
    return response;
  }
};

// Product API
export const ProductAPI = {
  // (cache'li)
  getAll: async (forceRefresh: boolean = false): Promise<ServiceResponse<any[]>> => {
    try {
      // ForceRefresh true ise cache'i atla
      if (!forceRefresh) {
        const isCacheValid = await CategoryAPI.isCacheValid();
        if (isCacheValid) {
          const cachedProducts = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);
          if (cachedProducts) {
            return {
              success: true,
              value: JSON.parse(cachedProducts),
              errorMessage: undefined
            };
          }
        }
      }

      // Cache yoksa, geçersizse veya forceRefresh true ise API'den çek
      const response = await apiCall<any[]>('/Product');
      
      // Başarılı response'u cache'e kaydet
      if (response.success && response.value) {
        await AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(response.value));
        await AsyncStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
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
    // format: {product: {...}}
    const requestData = {
      product: productData
    };
    
    const response = await apiCall<string>('/Product', 'PUT', requestData);
    
    // Başarılı update işleminden sonra cache'i temizle
    if (response.success) {
      await ProductAPI.clearCache();
    }
    
    return response;
  },

  // Ürün sil (sadece satıcılar için)
  delete: async (id: string): Promise<ServiceResponse<string>> => {
    const response = await apiCall<string>(`/Product/${id}`, 'DELETE');
    
    // Başarılı delete işleminden sonra cache'i temizle
    if (response.success) {
      await ProductAPI.clearCache();
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
  getAllSimple: async (forceRefresh: boolean = false): Promise<any[] | null> => {
    const response = await ProductAPI.getAll(forceRefresh);
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

// Cart API'leri - Backend'e uygun cache destekli
export const CartAPI = {
  // Sepeti getir (cache destekli)
  getCart: async (): Promise<ServiceResponse<CartDto>> => {
    try {
      // Önce cache'i kontrol et
      const cacheKey = CART_CACHE_KEY;
      const expiryKey = `${CACHE_EXPIRY_KEY}_cart`;
      
      const cachedData = await AsyncStorage.getItem(cacheKey);
      const cachedExpiry = await AsyncStorage.getItem(expiryKey);
      
      if (cachedData && cachedExpiry) {
        const expiryTime = parseInt(cachedExpiry);
        if (Date.now() < expiryTime) {
          return {
            value: JSON.parse(cachedData),
            success: true
          };
        }
      }
      
      const response = await apiCall<CartDto>('/Cart');
      
      // Başarılı response'u cache'le
      if (response.success && response.value) {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(response.value));
        await AsyncStorage.setItem(expiryKey, (Date.now() + CACHE_DURATION).toString());
      }
      
      return response;
    } catch (error) {
      console.error('Error in CartAPI.getCart:', error);
      return {
        value: null as CartDto,
        success: false,
        errorMessage: error.message || 'Failed to get cart'
      };
    }
  },

  // Sepete ürün ekle
  addToCart: async (productId: string, quantity: number, couponCode?: string): Promise<ServiceResponse<boolean>> => {
    try {
      let endpoint: string;
      let requestBody: any;
      
      // Kupon kodu varsa kuponlu endpoint, yoksa kuponsuz endpoint kullan
      if (couponCode && couponCode.trim() !== '') {
        endpoint = '/Cart/add-item-with-coupon';
        requestBody = { 
          productId, 
          quantity,
          couponCode: couponCode.trim()
        };
      } else {
        endpoint = '/Cart/add-item';
        requestBody = { 
          productId, 
          quantity
        };
      }
      
      const response = await apiCall<boolean>(endpoint, 'POST', requestBody);
      
      // Başarılı işlemde cache'i temizle
      if (response.success) {
        await AsyncStorage.removeItem(CART_CACHE_KEY);
        await AsyncStorage.removeItem(`${CACHE_EXPIRY_KEY}_cart`);
      }
      
      return response;
    } catch (error) {
      return {
        value: false,
        success: false,
        errorMessage: error.message || 'Failed to add item to cart'
      };
    }
  },

  // Sepetten ürün çıkar
  removeFromCart: async (productId: string): Promise<ServiceResponse<boolean>> => {
    try {
      const response = await apiCall<boolean>(`/Cart/remove-item/${productId}`, 'DELETE');
      
      // Başarılı işlemde cache'i temizle
      if (response.success) {
        await AsyncStorage.removeItem(CART_CACHE_KEY);
        await AsyncStorage.removeItem(`${CACHE_EXPIRY_KEY}_cart`);
      }
      
      return response;
    } catch (error) {
      return {
        value: false,
        success: false,
        errorMessage: error.message || 'Failed to remove item from cart'
      };
    }
  },

  // Sepeti temizle
  clearCart: async (): Promise<ServiceResponse<boolean>> => {
    try {
      const response = await apiCall<boolean>('/Cart/clear', 'DELETE');
      
      // Başarılı işlemde cache'i temizle
      if (response.success) {
        await AsyncStorage.removeItem(CART_CACHE_KEY);
        await AsyncStorage.removeItem(`${CACHE_EXPIRY_KEY}_cart`);
      }
      
      return response;
    } catch (error) {
      return {
        value: false,
        success: false,
        errorMessage: error.message || 'Failed to clear cart'
      };
    }
  },

  // Cache'i manuel temizle
  clearCache: async (): Promise<void> => {
    await AsyncStorage.removeItem(CART_CACHE_KEY);
    await AsyncStorage.removeItem(`${CACHE_EXPIRY_KEY}_cart`);
    console.log('🗑️ Cart cache manually cleared');
  }
};

// Order API'leri - ServiceResponse formatını kullanır
export const OrderAPI = {
  // Sipariş oluştur
  createOrder: async (orderData: {
    userId: string;
    items: {
      productId: string;
      quantity: number;
      price: number; // Cart item'ın birim fiyatı
    }[];
  }): Promise<ServiceResponse<string>> => {
    try {
      console.log('🛍️ OrderAPI.createOrder called with:', orderData);
      
      const response = await apiCall<string>('/Order', 'POST', orderData);
      console.log('📨 Order API Response:', response);
      
      // Başarılı işlemde sadece cache'i temizle (backend'de sepet otomatik temizlenir)
      if (response.success) {
        await AsyncStorage.removeItem(CART_CACHE_KEY);
        await AsyncStorage.removeItem(`${CACHE_EXPIRY_KEY}_cart`);
        console.log('🗑️ Cart cache cleared after order creation');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error in OrderAPI.createOrder:', error);
      return {
        value: '',
        success: false,
        errorMessage: error.message || 'Failed to create order'
      };
    }
  },

  // Kullanıcının siparişlerini getir
  getOrders: async (): Promise<ServiceResponse<any[]>> => {
    try {
      console.log('📋 OrderAPI.getOrders called');
      const response = await apiCall<any[]>('/Order');
      console.log('📨 Orders API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error in OrderAPI.getOrders:', error);
      return {
        value: [],
        success: false,
        errorMessage: error.message || 'Failed to get orders'
      };
    }
  },

  // ID ile sipariş getir
  getOrderById: async (orderId: string): Promise<ServiceResponse<any>> => {
    try {
      console.log('🔍 OrderAPI.getOrderById called with:', orderId);
      const response = await apiCall<any>(`/Order/${orderId}`);
      console.log('📨 Order details API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error in OrderAPI.getOrderById:', error);
      return {
        value: null,
        success: false,
        errorMessage: error.message || 'Failed to get order details'
      };
    }
  },

  // Sipariş iptal et
  cancelOrder: async (orderId: string): Promise<ServiceResponse<boolean>> => {
    try {
      console.log('❌ OrderAPI.cancelOrder called with:', orderId);
      const response = await apiCall<boolean>(`/Order/${orderId}`, 'DELETE');
      console.log('📨 Cancel order API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error in OrderAPI.cancelOrder:', error);
      return {
        value: false,
        success: false,
        errorMessage: error.message || 'Failed to cancel order'
      };
    }
  },

  // Basitleştirilmiş fonksiyonlar
  createOrderSimple: async (orderData: {
    userId: string;
    items: {
      productId: string;
      quantity: number;
      price: number; // Cart item'ın birim fiyatı
    }[];
  }): Promise<{ success: boolean; orderId?: string; message?: string }> => {
    const response = await OrderAPI.createOrder(orderData);
    return {
      success: response.success,
      orderId: response.success ? response.value : undefined,
      message: response.success ? undefined : response.errorMessage
    };
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

// Wishlist API'leri - ServiceResponse formatını kullanır
export const WishlistAPI = {
  // Kullanıcının wishlist'ini getir (sadece ürün ID'leri)
  getWishlist: async (): Promise<ServiceResponse<string[]>> => {
    return apiCall<string[]>('/Wishlist');
  },

  // Wishlist'e ürün ekle
  addToWishlist: async (productId: string): Promise<ServiceResponse<any>> => {
    return apiCall<any>(`/Wishlist/add/${productId}`, 'POST');
  },

  // Wishlist'ten ürün çıkar
  removeFromWishlist: async (productId: string): Promise<ServiceResponse<any>> => {
    return apiCall<any>(`/Wishlist/remove/${productId}`, 'DELETE');
  },

  // Wishlist'i tamamen temizle
  clearWishlist: async (): Promise<ServiceResponse<any>> => {
    return apiCall<any>('/Wishlist/clear', 'DELETE');
  },

  // Basitleştirilmiş fonksiyonlar
  getWishlistSimple: async (): Promise<string[] | null> => {
    const response = await WishlistAPI.getWishlist();
    return response.success ? response.value : null;
  },

  addToWishlistSimple: async (productId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await WishlistAPI.addToWishlist(productId);
    return {
      success: response.success,
      message: response.success ? undefined : response.errorMessage
    };
  },

  removeFromWishlistSimple: async (productId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await WishlistAPI.removeFromWishlist(productId);
    return {
      success: response.success,
      message: response.success ? undefined : response.errorMessage
    };
  },

  clearWishlistSimple: async (): Promise<{ success: boolean; message?: string }> => {
    const response = await WishlistAPI.clearWishlist();
    return {
      success: response.success,
      message: response.success ? undefined : response.errorMessage
    };
  }
};

// User API'leri - ServiceResponse formatını kullanır
export const UserAPI = {
  // Profil bilgilerini getir
  getProfile: async (): Promise<ServiceResponse<any>> => {
    return apiCall<any>('/UserProfile');
  },

  // Profil bilgilerini güncelle
  updateProfile: async (userData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address?: string;
  }): Promise<ServiceResponse<any>> => {
    return apiCall<any>('/UserProfile', 'PUT', userData);
  },

  // Kullanıcıya rol ekle (seller rolüne yükseltme için)
  addRole: async (roleName: string): Promise<ServiceResponse<any>> => {
    return apiCall<any>('/UserProfile/add-role', 'POST', roleName);
  },

  // Profili sil
  deleteProfile: async (): Promise<ServiceResponse<any>> => {
    return apiCall<any>('/UserProfile', 'DELETE');
  },

  // Basitleştirilmiş fonksiyonlar
  getProfileSimple: async (): Promise<any | null> => {
    const response = await UserAPI.getProfile();
    return response.success ? response.value : null;
  },

  updateProfileSimple: async (userData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const response = await UserAPI.updateProfile(userData);
    return {
      success: response.success,
      message: response.success ? undefined : response.errorMessage
    };
  },

  addRoleSimple: async (roleName: string): Promise<{ success: boolean; message?: string }> => {
    const response = await UserAPI.addRole(roleName);
    return {
      success: response.success,
      message: response.success ? undefined : response.errorMessage
    };
  }
};

// Coupon API
export const CouponAPI = {
  // Kupon oluştur
  create: async (couponData: CreateCouponDto): Promise<ServiceResponse<CouponDto>> => {
    try {
      // Kullanıcı profilini getir
      const userProfile = await UserAPI.getProfile();
      
      if (!userProfile.success || !userProfile.value) {
        return {
          success: false,
          value: {} as CouponDto,
          errorMessage: 'User profile not found'
        };
      }

      // CreatedBy alanını ekle
      const dataWithCreatedBy = {
        ...couponData,
        createdBy: userProfile.value.id
      };

      return await apiCall<CouponDto>('/coupon', 'POST', dataWithCreatedBy);
    } catch (error) {
      return {
        success: false,
        value: {} as CouponDto,
        errorMessage: 'Error creating coupon'
      };
    }
  },

  // Kendi kuponlarını getir
  getMyCoupons: async (): Promise<ServiceResponse<CouponDto[]>> => {
    return await apiCall<CouponDto[]>('/coupon/my-coupons');
  },

  // Kupon güncelle
  update: async (couponData: UpdateCouponDto): Promise<ServiceResponse<CouponDto>> => {
    try {
      // Kullanıcı profilini getir
      const userProfile = await UserAPI.getProfile();
      
      if (!userProfile.success || !userProfile.value) {
        return {
          success: false,
          value: {} as CouponDto,
          errorMessage: 'User profile not found'
        };
      }

      // CreatedBy alanını ekle
      const dataWithCreatedBy = {
        ...couponData,
        createdBy: userProfile.value.id
      };

      return await apiCall<CouponDto>('/coupon', 'PUT', dataWithCreatedBy);
    } catch (error) {
      return {
        success: false,
        value: {} as CouponDto,
        errorMessage: 'Error updating coupon'
      };
    }
  },

  // Kupon sil
  delete: async (couponId: string): Promise<ServiceResponse<boolean>> => {
    return await apiCall<boolean>(`/coupon/${couponId}`, 'DELETE');
  },

  // Kupon doğrula
  validate: async (request: ValidateCouponRequest): Promise<ServiceResponse<CouponValidationResult>> => {
    return await apiCall<CouponValidationResult>('/coupon/validate', 'POST', request);
  }
};

// Admin DTO'ları
export interface AppUserWithRolesDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  createdAt: string;
  orders: string[];
  roles: string[];
}

export interface OrderListDto {
  id: string;
  userId: string;
  user?: AppUserWithRolesDto;
  items: OrderItemDto[];
  totalPrice: number;
  createdAt: string;
}

export interface OrderItemDto {
  id: string;
  orderId: string;
  productId: string;
  product?: any;
  quantity: number;
  price: number;
}

export interface OrderDto {
  id: string;
  userId: string;
  user?: any;
  items: OrderItemDto[];
  totalPrice: number;
  createdAt: string;
}

// Admin API'leri - ServiceResponse formatını kullanır
export const AdminAPI = {
  // Tüm kullanıcıları rollerle getir
  getAllUsersWithRoles: async (): Promise<ServiceResponse<AppUserWithRolesDto[]>> => {
    return apiCall<AppUserWithRolesDto[]>('/Admin/users-with-roles');
  },

  // Tüm siparişleri kullanıcı bilgisiyle getir
  getAllOrdersWithUsers: async (): Promise<ServiceResponse<OrderListDto[]>> => {
    return apiCall<OrderListDto[]>('/Admin/orders-with-users');
  },

  // Sipariş detaylarını getir (admin için)
  getOrderDetailsById: async (orderId: string): Promise<ServiceResponse<OrderDto>> => {
    return apiCall<OrderDto>(`/Admin/orders-details/${orderId}`);
  },

  // Basitleştirilmiş fonksiyonlar
  getAllUsersWithRolesSimple: async (): Promise<AppUserWithRolesDto[] | null> => {
    const response = await AdminAPI.getAllUsersWithRoles();
    return response.success ? response.value : null;
  },

  getAllOrdersWithUsersSimple: async (): Promise<OrderListDto[] | null> => {
    const response = await AdminAPI.getAllOrdersWithUsers();
    return response.success ? response.value : null;
  },

  getOrderDetailsByIdSimple: async (orderId: string): Promise<OrderDto | null> => {
    const response = await AdminAPI.getOrderDetailsById(orderId);
    return response.success ? response.value : null;
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
  Admin: AdminAPI,
  Token: TokenUtils
};

export default ApiService;