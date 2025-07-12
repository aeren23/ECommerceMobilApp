import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '../../context/UserContext';
import { ProductAPI, CategoryAPI, CategoryDto } from '../../services/ApiService';

export default function AddProductScreen() {
  const { user, isSeller } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  
  // Form state
  const [productData, setProductData] = useState({
    name: '',
    categoryId: '',
    image: '',
    price: '',
    originalPrice: '',
    seller: user?.fullName || 'Default Seller',
    stock: '',
    rating: '0',
    tags: [] as string[],
  });

  // Mevcut tag'lar
  const availableTags = [
    'Yeni', 'İndirim', 'Ücretsiz Kargo', 'Hızlı Teslimat', 
    'Popüler', 'Özel Fiyat', 'Sınırlı Sayıda', 'Kaliteli'
  ];

  // Kategorileri API'den yükle
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await CategoryAPI.getAll();
      
      if (response.success && response.value) {
        setCategories(response.value);
      } else {
        console.error('Categories load failed:', response.errorMessage);
        // Fallback kategoriler
        setCategories([
          { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Elektronik' },
          { id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901', name: 'Giyim' },
          { id: 'c3d4e5f6-g7h8-9012-cdef-123456789012', name: 'Ev & Bahçe' },
          { id: 'd4e5f6g7-h8i9-0123-def1-234567890123', name: 'Spor' },
          { id: 'e5f6g7h8-i9j0-1234-ef12-345678901234', name: 'Kitap' },
          { id: 'f6g7h8i9-j0k1-2345-f123-456789012345', name: 'Kozmetik' },
          { id: 'g7h8i9j0-k1l2-3456-1234-567890123456', name: 'Oyuncak' },
          { id: 'h8i9j0k1-l2m3-4567-2345-678901234567', name: 'Mutfak' },
        ]);
      }
    } catch (error) {
      console.error('Categories load error:', error);
      // Fallback kategoriler
      setCategories([
        { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Elektronik' },
        { id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901', name: 'Giyim' },
        { id: 'c3d4e5f6-g7h8-9012-cdef-123456789012', name: 'Ev & Bahçe' },
        { id: 'd4e5f6g7-h8i9-0123-def1-234567890123', name: 'Spor' },
        { id: 'e5f6g7h8-i9j0-1234-ef12-345678901234', name: 'Kitap' },
        { id: 'f6g7h8i9-j0k1-2345-f123-456789012345', name: 'Kozmetik' },
        { id: 'g7h8i9j0-k1l2-3456-1234-567890123456', name: 'Oyuncak' },
        { id: 'h8i9j0k1-l2m3-4567-2345-678901234567', name: 'Mutfak' },
      ]);
    }
  };

  // Eğer satıcı değilse erişim engelle
  if (!isSeller) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ürün Ekle</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed-outline" size={80} color="#ccc" />
          <Text style={styles.accessDeniedTitle}>Erişim Engellendi</Text>
          <Text style={styles.accessDeniedText}>
            Bu sayfaya erişim için satıcı hesabınızla giriş yapmalısınız.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setProductData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Tag toggle fonksiyonu
  const toggleTag = (tag: string) => {
    setProductData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const validateForm = () => {
    if (!productData.name.trim()) {
      Alert.alert('Hata', 'Ürün adı boş olamaz');
      return false;
    }
    if (!productData.categoryId) {
      Alert.alert('Hata', 'Kategori seçmelisiniz');
      return false;
    }
    if (!productData.price.trim()) {
      Alert.alert('Hata', 'Fiyat boş olamaz');
      return false;
    }
    if (!productData.stock.trim()) {
      Alert.alert('Hata', 'Stok miktarı boş olamaz');
      return false;
    }
    if (!productData.image.trim()) {
      Alert.alert('Hata', 'Görsel URL boş olamaz');
      return false;
    }
    
    // Sayı kontrolü
    const price = parseFloat(productData.price);
    const stock = parseInt(productData.stock);
    const rating = parseFloat(productData.rating);
    
    if (isNaN(price) || price <= 0) {
      Alert.alert('Hata', 'Geçerli bir fiyat girin');
      return false;
    }
    if (isNaN(stock) || stock < 0) {
      Alert.alert('Hata', 'Geçerli bir stok miktarı girin');
      return false;
    }
    if (isNaN(rating) || rating < 0 || rating > 5) {
      Alert.alert('Hata', 'Değerlendirme 0-5 arasında olmalıdır');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const productPayload = {
        product: {
          name: productData.name,
          categoryId: productData.categoryId, // String olarak kalacak
          image: productData.image,
          price: parseFloat(productData.price),
          originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
          seller: productData.seller,
          stock: parseInt(productData.stock),
          rating: parseFloat(productData.rating),
          tags: productData.tags,
        }
      };

      const response = await ProductAPI.createSimple(productPayload);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Ürün başarıyla eklendi', [
          { text: 'Tamam', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Hata', response.message || 'Ürün eklenirken bir hata oluştu');
      }
    } catch (error) {
      Alert.alert('Hata', 'Ürün eklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ürün Ekle</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ürün Adı *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ürün adını girin"
              value={productData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Kategori *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    productData.categoryId === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => handleInputChange('categoryId', category.id)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    productData.categoryId === category.id && styles.categoryButtonTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fiyat (₺) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={productData.price}
              onChangeText={(value) => handleInputChange('price', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Orijinal Fiyat (₺)</Text>
            <TextInput
              style={styles.input}
              placeholder="İndirimli fiyat için"
              value={productData.originalPrice}
              onChangeText={(value) => handleInputChange('originalPrice', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Stok Miktarı *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={productData.stock}
              onChangeText={(value) => handleInputChange('stock', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Görsel URL *</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/image.jpg"
              value={productData.image}
              onChangeText={(value) => handleInputChange('image', value)}
              keyboardType="url"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Satıcı</Text>
            <TextInput
              style={styles.input}
              placeholder="Satıcı adı"
              value={productData.seller}
              onChangeText={(value) => handleInputChange('seller', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Değerlendirme</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              value={productData.rating}
              onChangeText={(value) => handleInputChange('rating', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Etiketler</Text>
            <View style={styles.tagsContainer}>
              {availableTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagButton,
                    productData.tags.includes(tag) && styles.tagButtonActive
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[
                    styles.tagButtonText,
                    productData.tags.includes(tag) && styles.tagButtonTextActive
                  ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Ürün Ekle</Text>
            )}
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#B8860B',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tagButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  tagButtonText: {
    fontSize: 12,
    color: '#666',
  },
  tagButtonTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#B8860B',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
