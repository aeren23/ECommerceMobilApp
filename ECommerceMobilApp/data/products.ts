// Mock ürün verisi - gerçek projede API'den gelecek
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating: number;
  stock: number;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
    description: 'Apple iPhone 15 Pro - 128GB, Titanium Blue',
    category: 'Telefon',
    rating: 4.8,
    stock: 15
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
    description: 'Samsung Galaxy S24 - 256GB, Phantom Black',
    category: 'Telefon',
    rating: 4.6,
    stock: 23
  },
  {
    id: '3',
    name: 'MacBook Air M3',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
    description: 'Apple MacBook Air M3 Chip - 13 inch, 8GB RAM',
    category: 'Laptop',
    rating: 4.9,
    stock: 8
  },
  {
    id: '4',
    name: 'AirPods Pro',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=300',
    description: 'Apple AirPods Pro 2. Nesil - Active Noise Cancelling',
    category: 'Kulaklık',
    rating: 4.7,
    stock: 42
  },
  {
    id: '5',
    name: 'Nike Air Max',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    description: 'Nike Air Max 90 - Beyaz/Siyah Kombinasyon',
    category: 'Ayakkabı',
    rating: 4.5,
    stock: 67
  },
  {
    id: '6',
    name: 'Gaming Klavye',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300',
    description: 'Mekanik Gaming Klavye - RGB Aydınlatmalı',
    category: 'Teknoloji',
    rating: 4.3,
    stock: 31
  }
];

export const categories = [
  'Tümü',
  'Telefon',
  'Laptop', 
  'Kulaklık',
  'Ayakkabı',
  'Teknoloji'
];
