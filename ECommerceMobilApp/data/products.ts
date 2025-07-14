// API'den gelen ürün verisi
export interface Product {
  id: string;  // Guid string olarak gelir
  name: string;
  categoryId: string;  // Guid string olarak gelir
  category?: {
    id: string;
    name: string;
  };
  image: string;
  price: number;
  originalPrice?: number;
  seller: string;
  stock: number;
  rating: number;
  tags: string[];
  description?: string;  // Frontend için ekstra field
}

// Mock veriler artık yok - API'den gelecek
export const products: Product[] = [];

// Etiket renkleri ve ikonları
export const tagConfig = {
  'indirimli': { color: '#FF3B30', bgColor: '#FFE5E5', icon: '🏷️', text: 'İndirimli' },
  'çok-satılan': { color: '#FF9500', bgColor: '#FFF0E5', icon: '🔥', text: 'Çok Satılan' },
  'yeni': { color: '#34C759', bgColor: '#E5F7E5', icon: '✨', text: 'Yeni' },
  'sınırlı': { color: '#AF52DE', bgColor: '#F0E5F7', icon: '⚡', text: 'Sınırlı' },
  'premium': { color: '#B8860B', bgColor: '#F5F0E5', icon: '👑', text: 'Premium' },
  'popüler': { color: '#007AFF', bgColor: '#E5F0FF', icon: '⭐', text: 'Popüler' },
  'gaming': { color: '#FF2D92', bgColor: '#FFE5F0', icon: '🎮', text: 'Gaming' },
  'spor': { color: '#4CD964', bgColor: '#E5F7E5', icon: '🏋️', text: 'Spor' },
  'Oyuncak': { color: '#FF9500', bgColor: '#FFF0E5', icon: '🧸', text: 'Oyuncak' },
  'Çocuk': { color: '#FF6B6B', bgColor: '#FFE8E8', icon: '👶', text: 'Çocuk' },
  'Yaratıcı': { color: '#9C88FF', bgColor: '#F0EDFF', icon: '🎨', text: 'Yaratıcı' },
  'Teknoloji': { color: '#00D4AA', bgColor: '#E5FFF9', icon: '💻', text: 'Teknoloji' },
  'Moda': { color: '#FF8A65', bgColor: '#FFF3E0', icon: '👗', text: 'Moda' },
  'Ev': { color: '#81C784', bgColor: '#E8F5E8', icon: '🏠', text: 'Ev' },
  'Sağlık': { color: '#64B5F6', bgColor: '#E3F2FD', icon: '💊', text: 'Sağlık' },
  'Kitap': { color: '#8D6E63', bgColor: '#EFEBE9', icon: '📚', text: 'Kitap' },
  'Müzik': { color: '#BA68C8', bgColor: '#F3E5F5', icon: '🎵', text: 'Müzik' },
};

export const categories = [
  'Tümü',
  'Telefon',
  'Laptop', 
  'Kulaklık',
  'Ayakkabı',
  'Teknoloji'
];
