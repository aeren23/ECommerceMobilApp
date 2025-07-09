import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kullanıcı tipi
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  address?: string;
  createdAt: string;
}

// Context tipi
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@user_data';
const USERS_STORAGE_KEY = '@users_data'; // Tüm kullanıcılar için

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama başlatıldığında kullanıcı verilerini yükle
  useEffect(() => {
    loadUserData();
  }, []);

  // AsyncStorage'dan aktif kullanıcı verilerini yükle
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Kullanıcı verileri yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı verilerini kaydet
  const saveUserData = async (userData: User) => {
    try {
      // Aktif kullanıcı bilgisini kaydet
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      
      // Tüm kullanıcılar listesini güncelle
      const allUsersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const allUsers = allUsersData ? JSON.parse(allUsersData) : {};
      allUsers[userData.email] = userData;
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
      
      setUser(userData);
    } catch (error) {
      console.error('Kullanıcı verileri kaydedilemedi:', error);
    }
  };

  // Email ile kullanıcı bilgilerini getir
  const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
      const allUsersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      if (allUsersData) {
        const allUsers = JSON.parse(allUsersData);
        return allUsers[email.toLowerCase()] || null;
      }
      return null;
    } catch (error) {
      console.error('Kullanıcı bulunamadı:', error);
      return null;
    }
  };

  // Giriş yap
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Basit demo authentication - gerçek uygulamada API çağrısı olacak
      if (email && password.length >= 4) {
        // Önce daha önce kaydedilmiş kullanıcı var mı kontrol et
        const existingUser = await getUserByEmail(email);
        
        if (existingUser) {
          // Kayıtlı kullanıcı varsa, onun bilgilerini kullan
          await saveUserData(existingUser);
          return true;
        } else {
          // Yeni kullanıcı için basic bilgiler oluştur
          const userData: User = {
            id: `user_${Date.now()}`,
            email: email.toLowerCase(),
            name: email.split('@')[0], // Email'in @ öncesi kısmını geçici isim olarak al
            phone: '0555 000 00 00', // Login için geçici telefon
            createdAt: new Date().toISOString(),
          };
          
          await saveUserData(userData);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Giriş hatası:', error);
      return false;
    }
  };

  // Kayıt ol
  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }): Promise<boolean> => {
    try {
      // Basit demo authentication - gerçek uygulamada API çağrısı olacak
      if (userData.email && userData.password.length >= 4 && userData.name && userData.phone) {
        // Önce bu email ile kayıt var mı kontrol et
        const existingUser = await getUserByEmail(userData.email);
        
        if (existingUser) {
          // Zaten kayıt varsa hata döndür
          return false;
        }
        
        const newUser: User = {
          id: `user_${Date.now()}`,
          email: userData.email.toLowerCase(),
          name: userData.name,
          phone: userData.phone,
          createdAt: new Date().toISOString(),
        };
        
        await saveUserData(newUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      return false;
    }
  };

  // Çıkış yap
  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
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
        await saveUserData(updatedUser);
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
    }
  };

  const contextValue: UserContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    isLoggedIn: !!user,
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
