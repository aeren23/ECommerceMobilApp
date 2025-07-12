import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Product, tagConfig } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { ProductAPI, CategoryAPI, CategoryDto } from '../../services/ApiService';

export default function HomeScreen() {
  // useState hook'larını kullanıyoruz
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Tümü']);
  const [categoriesData, setCategoriesData] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  // Kategorileri API'den yükle (Cache'li)
  const loadCategories = async () => {
    try {
      console.log('🔄 Loading categories...');
      const response = await CategoryAPI.getAll();
      
      if (response.success && response.value) {
        console.log('✅ Categories loaded successfully');
        setCategoriesData(response.value);
        // Kategori listesini güncelle - "Tümü" seçeneğini ekle
        const categoryNames = ['Tümü', ...response.value.map(cat => cat.name)];
        setCategories(categoryNames);
      } else {
        console.error('Categories load failed:', response.errorMessage);
        // Varsayılan kategoriler kalsın
        setCategories([
          'Tümü',
          'Elektronik',
          'Giyim',
          'Ev & Bahçe',
          'Spor',
          'Kitap',
          'Kozmetik',
          'Oyuncak',
          'Mutfak',
        ]);
      }
    } catch (error) {
      console.error('Categories load error:', error);
      // Varsayılan kategoriler kalsın
      setCategories([
        'Tümü',
        'Elektronik',
        'Giyim',
        'Ev & Bahçe',
        'Spor',
        'Kitap',
        'Kozmetik',
        'Oyuncak',
        'Mutfak',
      ]);
    }
  };

  // Ürünleri API'den yükle - sadece component mount olduğunda
  useEffect(() => {
    console.log('📱 HomeScreen mounted - Loading data...');
    loadCategories();
    loadProducts();
  }, []); // Boş dependency array - sadece mount'ta çalışır

  // Ürünleri API'den yükle (Cache'li)
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading products...');
      const response = await ProductAPI.getAll();
      
      if (response.success && response.value) {
        console.log('✅ Products loaded successfully');
        setProducts(response.value);
        setFilteredProducts(response.value);
      } else {
        console.error('Failed to load products:', response.errorMessage);
        Alert.alert('Hata', 'Ürünler yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Hata', 'Ürünler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Kategori filtreleme fonksiyonu
  const filterByCategory = (category: string) => {
    setSelectedCategory(category);
    
    if (category === 'Tümü') {
      setFilteredProducts(products);
    } else {
      // Önce gerçek kategori verilerinden ID'yi bul
      const categoryId = getCategoryId(category);
      const filtered = products.filter(product => product.categoryId === categoryId);
      setFilteredProducts(filtered);
    }
  };

  // Kategori ID'sini bul
  const getCategoryId = (categoryName: string): string => {
    // Önce gerçek kategori verilerinden ara
    const category = categoriesData.find(cat => cat.name === categoryName);
    if (category) {
      return category.id;
    }
    
    // Fallback - eski hardcoded mapping
    const categoryMap: { [key: string]: string } = {
      'Elektronik': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'Giyim': 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
      'Ev & Bahçe': 'c3d4e5f6-g7h8-9012-cdef-123456789012',
      'Spor': 'd4e5f6g7-h8i9-0123-def1-234567890123',
      'Kitap': 'e5f6g7h8-i9j0-1234-ef12-345678901234',
      'Kozmetik': 'f6g7h8i9-j0k1-2345-f123-456789012345',
      'Oyuncak': 'g7h8i9j0-k1l2-3456-1234-567890123456',
      'Mutfak': 'h8i9j0k1-l2m3-4567-2345-678901234567',
    };
    return categoryMap[categoryName] || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  };

  // Kategori adını bul
  const getCategoryName = (categoryId: string): string => {
    // Önce gerçek kategori verilerinden ara
    const category = categoriesData.find(cat => cat.id === categoryId);
    if (category) {
      return category.name;
    }
    
    // Fallback - eski hardcoded mapping
    const nameMap: { [key: string]: string } = {
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890': 'Elektronik',
      'b2c3d4e5-f6g7-8901-bcde-f12345678901': 'Giyim',
      'c3d4e5f6-g7h8-9012-cdef-123456789012': 'Ev & Bahçe',
      'd4e5f6g7-h8i9-0123-def1-234567890123': 'Spor',
      'e5f6g7h8-i9j0-1234-ef12-345678901234': 'Kitap',
      'f6g7h8i9-j0k1-2345-f123-456789012345': 'Kozmetik',
      'g7h8i9j0-k1l2-3456-1234-567890123456': 'Oyuncak',
      'h8i9j0k1-l2m3-4567-2345-678901234567': 'Mutfak',
    };
    return nameMap[categoryId] || 'Diğer';
  };

  // Hızlı sepete ekleme fonksiyonu
  const handleQuickAddToCart = (product: Product) => {
    if (product.stock === 0) {
      Alert.alert('Uyarı', 'Bu ürün stokta bulunmamaktadır.');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: getCategoryName(product.categoryId),
      maxStock: product.stock,
    });

    Alert.alert(
      'Sepete Eklendi! 🛒',
      `${product.name} sepetinize eklendi.`,
      [
        { text: 'Tamam', style: 'default' },
        { text: 'Sepete Git', onPress: () => router.push('/(tabs)/cart') }
      ]
    );
  };

  // İndirimli ürünleri filtrele - useMemo ile optimize et
  const discountedProducts = useMemo(() => 
    filteredProducts.filter(product => 
      product.originalPrice && product.originalPrice > product.price
    ), [filteredProducts]
  );

  // Fırsatlar kartı komponenti
  const DealCard = ({ item }: { item: Product }) => {
    const discountPercentage = item.originalPrice 
      ? Math.round((1 - item.price / item.originalPrice) * 100)
      : 0;

    return (
      <TouchableOpacity 
        style={styles.dealCard}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <View style={styles.dealImageContainer}>
          <Image source={{ uri: item.image }} style={styles.dealImage} />
          <View style={styles.dealDiscountBadge}>
            <Text style={styles.dealDiscountText}>%{discountPercentage}</Text>
          </View>
        </View>
        
        <View style={styles.dealInfo}>
          <Text style={styles.dealName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.dealPriceContainer}>
            <Text style={styles.dealPrice}>
              ₺{item.price.toLocaleString()}
            </Text>
            <Text style={styles.dealOriginalPrice}>
              ₺{item.originalPrice?.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.dealAddButton}
            onPress={() => handleQuickAddToCart(item)}
          >
            <Text style={styles.dealAddButtonText}>Sepete Ekle</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Ürün kartı komponenti - React.memo ile optimize edildi
  const ProductCard = React.memo(({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        
        {/* Etiketler */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagContainer}>
            {item.tags.slice(0, 2).map((tag, index) => {
              const config = tagConfig[tag as keyof typeof tagConfig];
              if (!config) return null;
              
              return (
                <View 
                  key={index} 
                  style={[styles.tag, { backgroundColor: config.bgColor }]}
                >
                  <Text style={styles.tagIcon}>{config.icon}</Text>
                  <Text style={[styles.tagText, { color: config.color }]}>
                    {config.text}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        
        {/* Fiyat ve indirim */}
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            ₺{item.price.toLocaleString()}
          </Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>
              ₺{item.originalPrice.toLocaleString()}
            </Text>
          )}
        </View>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          <Text style={styles.stock}>Stok: {item.stock}</Text>
        </View>
        
        {/* Satıcı bilgisi */}
        <View style={styles.sellerContainer}>
          <Text style={styles.sellerLabel}>Satıcı:</Text>
          <Text style={styles.sellerName}>{item.seller || 'Bilinmiyor'}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            item.stock === 0 && styles.disabledButton
          ]}
          onPress={() => handleQuickAddToCart(item)}
          disabled={item.stock === 0}
        >
          <Text style={styles.addToCartButtonText}>
            {item.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), (prevProps, nextProps) => {
    // Shallow comparison for performance
    return prevProps.item.id === nextProps.item.id && 
           prevProps.item.stock === nextProps.item.stock;
  });

  // Kategori butonu komponenti
  const CategoryButton = ({ category }: { category: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.activeCategoryButton
      ]}
      onPress={() => filterByCategory(category)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category && styles.activeCategoryText
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  // Manuel yenileme fonksiyonu (cache temizleyerek)
  const refreshData = async () => {
    try {
      console.log('🔄 Manual refresh triggered - Clearing cache...');
      
      // Cache'i temizle
      await CategoryAPI.clearCache();
      await ProductAPI.clearCache();
      
      // Verileri yeniden yükle
      await loadCategories();
      await loadProducts();
      
      console.log('✅ Data refreshed successfully');
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      Alert.alert('Hata', 'Yenileme sırasında bir hata oluştu');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header  */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>E-Ticaret Demo</Text>
        <Text style={styles.headerSubtitle}>
          {filteredProducts.length} ürün bulundu
        </Text>
      </View>

      {/* Loading */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B8860B" />
          <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
        </View>
      ) : (
        <>
          {/* Kategoriler */}
          <View style={styles.categoriesContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContent}
            >
              {categories.map((category) => (
                <CategoryButton key={category} category={category} />
              ))}
            </ScrollView>
          </View>
          
          {/* Scrollable İçerik */}
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
        

        {/* Kaçırılmaz Fırsatlar */}
        {discountedProducts.length > 0 && (
          <View style={styles.dealsSection}>
            <View style={styles.dealsSectionHeader}>
              <Text style={styles.dealsTitle}>🔥 Kaçırılmaz Fırsatlar</Text>
              <Text style={styles.dealsSubtitle}>Sınırlı süre indirimli ürünler</Text>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dealsContainer}
            >
              {discountedProducts.map((product) => (
                <DealCard key={product.id} item={product} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Ürün Grid - FlatList ile optimize edildi */}
        <View style={styles.productsGrid}>
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => <ProductCard item={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            // Performans optimizasyonları
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
            initialNumToRender={10}
            getItemLayout={(data, index) => (
              {length: 220, offset: 220 * Math.floor(index / 2), index}
            )}
          />
        </View>
      </ScrollView>
      </>
      )}
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  // Scroll Container Stilleri
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Kaçırılmaz Fırsatlar Bölümü 
  dealsSection: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dealsSectionHeader: {
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  dealsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  dealsSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  dealsContainer: {
    paddingHorizontal: 15,
  },
  dealCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  dealImageContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  dealImage: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  dealDiscountBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dealDiscountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dealInfo: {
    flex: 1,
  },
  dealName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    lineHeight: 16,
  },
  dealPriceContainer: {
    marginBottom: 6,
  },
  dealPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 1,
  },
  dealOriginalPrice: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  dealAddButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  dealAddButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesContent: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  activeCategoryButton: {
    backgroundColor: '#B8860B',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeCategoryText: {
    color: 'white',
  },
  // Products Grid Stilleri
  productsGrid: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  tagContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  tagIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8860B',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerLabel: {
    fontSize: 11,
    color: '#666',
    marginRight: 5,
  },
  sellerName: {
    fontSize: 11,
    color: '#B8860B',
    fontWeight: '500',
  },
  rating: {
    fontSize: 12,
    color: '#666',
  },
  stock: {
    fontSize: 12,
    color: '#666',
  },
  addToCartButton: {
    backgroundColor: '#B8860B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});
