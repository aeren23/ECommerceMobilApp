import React, { useState } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { products, categories, Product, tagConfig } from '../../data/products';
import { useCart } from '../../context/CartContext';

export default function HomeScreen() {
  // useState hook'larını kullanıyoruz
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const { addToCart } = useCart();

  // Kategori filtreleme fonksiyonu
  const filterByCategory = (category: string) => {
    setSelectedCategory(category);
    
    if (category === 'Tümü') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === category);
      setFilteredProducts(filtered);
    }
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
      category: product.category,
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

  // İndirimli ürünleri filtrele
  const discountedProducts = products.filter(product => 
    product.originalPrice && product.originalPrice > product.price
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

  // Ürün kartı komponenti
  const ProductCard = ({ item }: { item: Product }) => (
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
  );

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header  */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>E-Ticaret Demo</Text>
        <Text style={styles.headerSubtitle}>
          {filteredProducts.length} ürün bulundu
        </Text>
      </View>

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

        {/* Ürün Grid */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((product, index) => {
            if (index % 2 === 0) {
              return (
                <View key={`row-${index}`} style={styles.row}>
                  <ProductCard item={product} />
                  {filteredProducts[index + 1] && (
                    <ProductCard item={filteredProducts[index + 1]} />
                  )}
                </View>
              );
            }
            return null;
          })}
        </View>
      </ScrollView>
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
});
