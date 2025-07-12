import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService, { AuthAPI, TestAPI, CategoryAPI, ProductAPI } from '../services/ApiService';
import DataInitializer from '../utils/DataInitializer';

// Kullanıcı tipi - API response'una uygun
export interface User {
  id: string;
  fullName: string;  // API'de fullName olarak geliyor
  email: string;
  phoneNumber: string;  // API'de phoneNumber olarak geliyor
  address?: string;
  createdAt: string;
  role?: string;  // Kullanıcı rolü: customer, seller, admin
  orders?: any[];  // API'de orders array'i geliyor
}

// API Auth Response tipi
interface AuthResponse {
  user: User;
  token: string;
}

// Context tipi
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    fullName: string;    // API'ye uygun field name
    email: string;
    password: string;
    phoneNumber: string; // API'ye uygun field name
    address: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isLoggedIn: boolean;
  // Rol kontrol fonksiyonları
  isCustomer: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  getUserRole: () => string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@user_data';
const TOKEN_STORAGE_KEY = '@auth_token';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama başlatıldığında kullanıcı verilerini yükle
  useEffect(() => {
    loadUserData();
    initializeData();
    preloadAppData(); // Cache'i önceden yükle
  }, []);

  // Uygulama verilerini cache'e önceden yükle
  const preloadAppData = async () => {
    try {
      console.log('🚀 UserContext: Preloading app data to cache...');
      
      // Kategorileri ve ürünleri paralel olarak yükle
      await Promise.all([
        CategoryAPI.getAll(),
        ProductAPI.getAll()
      ]);
      
      console.log('✅ UserContext: App data preloaded successfully!');
    } catch (error) {
      console.error('❌ UserContext: App data preload failed:', error);
    }
  };

  // Data initializer'ı çalıştır
  const initializeData = async () => {
    try {
      console.log('🚀 UserContext: Starting data initialization...');
      
      // Veri zaten seeded olduğu için artık otomatik çalışmayacak
      // await DataInitializer.forceReset();
      
      console.log('✅ UserContext: Data initialization skipped - data already seeded');
    } catch (error) {
      console.error('❌ UserContext: Data initialization failed:', error);
    }
  };

  // AsyncStorage'dan aktif kullanıcı verilerini ve token'ı yükle
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      
      if (userData && token) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Kullanıcı verileri yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı verilerini ve token'ı kaydet
  const saveUserData = async (userData: User, token: string) => {
    try {
      // Güvenlik kontrolü - null/undefined kontrolü
      if (!userData || !token) {
        console.error('❌ SaveUserData: Invalid data provided');
        console.log('User data:', userData);
        console.log('Token:', token ? 'Token exists' : 'Token is missing');
        return;
      }
      
      // Token'dan rol bilgisini çıkar ve user verisine ekle
      const role = await getRoleFromToken();
      const userWithRole = { ...userData, role: role || userData.role || 'customer' };
      
      console.log('Saving user data:', {
        id: userWithRole.id,
        fullName: userWithRole.fullName,
        email: userWithRole.email,
        role: userWithRole.role
      });
      
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithRole));
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      setUser(userWithRole);
      
      console.log('User data saved successfully');
    } catch (error) {
      console.error('❌ Kullanıcı verileri kaydedilemedi:', error);
    }
  };

  // API çağrısı için genel fonksiyon kaldırıldı - artık ApiService kullanıyoruz

  // Giriş yap
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log('Login attempt:', email);
      
      // Önce API bağlantısını test et
      const connectionTest = await TestAPI.checkConnection();
      console.log('Connection test result:', connectionTest);
      
      if (!connectionTest.reachable) {
        console.error('❌ API sunucusuna ulaşılamıyor');
        return false;
      }
      
      // Basitleştirilmiş AuthAPI kullan
      const result = await AuthAPI.loginSimple(email, password);
      
      console.log('Login result:', result);
      
      if (result) {
        // Başarılı durumda doğrudan user ve token data'sı gelir
        const { user, token } = result;
        
        console.log('User from API:', {
          id: user?.id,
          fullName: user?.fullName,
          email: user?.email,
          type: typeof user
        });
        console.log('Token from API:', token ? 'Token exists' : 'Token is missing');
        
        if (user && token) {
          await saveUserData(user, token);
          return true;
        } else {
          console.error('❌ Invalid user or token data');
          return false;
        }
      } else {
        // Hata durumunda null döner
        console.error('❌ Login failed - result is null');
        return false;
      }
    } catch (error) {
      console.error('❌ Giriş hatası DETAY:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Kayıt ol
  const register = async (userData: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      
      console.log('Register attempt:', userData.email);
      
      // Basitleştirilmiş AuthAPI kullan
      const result = await AuthAPI.registerSimple(userData);
      
      console.log('Register result:', result);
      
      if (result.success) {
        console.log('Registration successful, now auto-login...');
        
        // Register başarılı oldu, şimdi otomatik login yap
        const loginResult = await AuthAPI.loginSimple(userData.email, userData.password);
        
        console.log('Auto-login result:', loginResult);
        
        if (loginResult) {
          // Login başarılı durumda user ve token data'sı gelir
          const { user, token } = loginResult;
          
          console.log('User from auto-login:', {
            id: user?.id,
            fullName: user?.fullName,
            email: user?.email,
            type: typeof user
          });
          console.log('Token from auto-login:', token ? 'Token exists' : 'Token is missing');
          
          if (user && token) {
            await saveUserData(user, token);
            return { success: true };
          } else {
            console.error('❌ Invalid user or token data from auto-login');
            return { success: false, message: 'Kayıt başarılı ancak giriş yapılamadı' };
          }
        } else {
          console.error('❌ Auto-login failed after successful registration');
          return { 
            success: false, 
            message: 'Kayıt başarılı ancak otomatik giriş yapılamadı. Lütfen manual giriş yapın.' 
          };
        }
      } else {
        // Hata durumunda message ile birlikte gelir
        console.error('❌ Register failed:', result.message);
        return { 
          success: false, 
          message: result.message || 'Kayıt işlemi başarısız' 
        };
      }
    } catch (error: any) {
      console.error('❌ Kayıt hatası DETAY:', error);
      return { 
        success: false, 
        message: error.message || 'Kayıt işlemi başarısız' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Çıkış yap
  const logout = async (): Promise<void> => {
    try {
      // AuthAPI logout fonksiyonu token'ları temizler
      await AuthAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  // Profil güncelle
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        // Token'ı al çünkü saveUserData iki parametre bekliyor
        const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY) || '';
        await saveUserData(updatedUser, token);
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
    }
  };

  // Token'dan rol bilgisini çıkar
  const getRoleFromToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) return null;

      // JWT token'ı decode et
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Rol bilgisi farklı field'larda olabilir
      const role = payload.role || payload.Role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      
      console.log('Token payload role:', role);
      return role || 'customer'; // Default role customer
    } catch (error) {
      console.error('❌ Token decode error:', error);
      return null;
    }
  };

  // Kullanıcı rolü kontrol fonksiyonları
  const getUserRole = (): string | null => {
    return user?.role || null;
  };

  const isCustomer = user?.role === 'customer' || user?.role === 'Customer';
  const isSeller = user?.role === 'seller' || user?.role === 'Seller';
  const isAdmin = user?.role === 'admin' || user?.role === 'Admin';

  const contextValue: UserContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    isLoggedIn: !!user,
    isCustomer,
    isSeller,
    isAdmin,
    getUserRole,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
