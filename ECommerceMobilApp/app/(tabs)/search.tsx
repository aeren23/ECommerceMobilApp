import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Product } from '../../data/products';
import { ProductAPI } from '../../services/ApiService';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce timer
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Ürünleri API'den yükle
  useEffect(() => {
    loadProducts();
    
    // Cleanup function
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await ProductAPI.getAll();
      
      if (response.success && response.value) {
        setAllProducts(response.value);
      } else {
        console.error('Failed to load products:', response.errorMessage);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Arama fonksiyonu (debounce'li)
  const handleSearch = (text: string) => {
    setSearchText(text);
    
    // Önceki timeout'u temizle
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (text.length > 0) {
      setIsSearching(true);
      
      // 300ms bekleyip arama yap
      const timeout = setTimeout(() => {
        const filtered = allProducts.filter(product =>
          product.name.toLowerCase().includes(text.toLowerCase()) ||
          (product.category && product.category.name && product.category.name.toLowerCase().includes(text.toLowerCase())) ||
          (product.seller && product.seller.toLowerCase().includes(text.toLowerCase()))
        );
        setSearchResults(filtered);
        setIsSearching(false);
      }, 300);
      
      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const SearchResultItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultPrice}>₺{item.price?.toLocaleString()}</Text>
        <Text style={styles.resultCategory}>
          {item.category?.name || 'Kategori Yok'}
        </Text>
        <Text style={styles.resultSeller}>
          {item.seller || 'Satıcı Yok'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ürün Arama</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Ürün veya kategori ara..."
          value={searchText}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
      </View>

      {searchText.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeader}>
            {isSearching ? 'Aranıyor...' : `${searchResults.length} sonuç bulundu`}
          </Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#B8860B" style={styles.loader} />
          ) : isSearching ? (
            <ActivityIndicator size="small" color="#B8860B" style={styles.loader} />
          ) : (
            <FlatList
              data={searchResults}
              renderItem={SearchResultItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Aradığınız ürünü yazın
          </Text>
          {isLoading && (
            <ActivityIndicator size="large" color="#B8860B" style={styles.loader} />
          )}
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    padding: 15,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  resultItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    // iOS için gölge
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Android için gölge
    elevation: 5,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B8860B',
    marginBottom: 3,
  },
  resultCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  resultSeller: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  loader: {
    marginTop: 20,
  },
});
