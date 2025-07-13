import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useUser } from '../../context/UserContext';
import { ProductAPI, CategoryAPI } from '../../services/ApiService';

interface Category {
  id: string;
  name: string;
}

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const { user, isSeller } = useUser();
  
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Satıcı kontrolü
  if (!isSeller) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ürün Düzenle</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.accessDenied}>
          <Ionicons name="warning-outline" size={80} color="#FF3B30" />
          <Text style={styles.accessDeniedTitle}>Erişim Engellendi</Text>
          <Text style={styles.accessDeniedText}>
            Bu bölüme sadece satıcılar erişebilir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Kategorileri ve ürün bilgilerini paralel yükle
      const [categoriesResponse, productResponse] = await Promise.all([
        CategoryAPI.getAll(),
        ProductAPI.getById(id as string)
      ]);

      // Kategorileri set et
      if (categoriesResponse.success && categoriesResponse.value) {
        setCategories(categoriesResponse.value);
      }

      // Ürün bilgilerini set et
      if (productResponse.success && productResponse.value) {
        const product = productResponse.value;
        setProductName(product.name || '');
        setPrice(product.price?.toString() || '');
        setOriginalPrice(product.originalPrice?.toString() || '');
        setStock(product.stock?.toString() || '');
        setImage(product.image || '');
        setSelectedCategory(product.categoryId || '');
      } else {
        Alert.alert('Hata', 'Ürün bilgileri yüklenemedi');
        router.back();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    // Validation
    if (!productName.trim()) {
      Alert.alert('Hata', 'Ürün adı boş olamaz');
      return;
    }

    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('Hata', 'Geçerli bir fiyat girin');
      return;
    }

    if (!stock.trim() || isNaN(Number(stock))) {
      Alert.alert('Hata', 'Geçerli bir stok miktarı girin');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Hata', 'Lütfen bir kategori seçin');
      return;
    }

    if (!image.trim()) {
      Alert.alert('Hata', 'Ürün resmi URL\'si boş olamaz');
      return;
    }

    try {
      setIsSubmitting(true);

      const productData = {
        id: id as string,
        name: productName.trim(),
        categoryId: selectedCategory,
        image: image.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        seller: user?.fullName || '',
        stock: Number(stock),
        rating: 4.0, // Default rating
        tags: ['Güncellenmiş'] // Default tags
      };

      const response = await ProductAPI.update(productData);

      if (response.success) {
        Alert.alert(
          'Başarılı', 
          'Ürün başarıyla güncellendi!',
          [
            {
              text: 'Tamam',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('Hata', response.errorMessage || 'Ürün güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Hata', 'Ürün güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ürün Düzenle</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B8860B" />
          <Text style={styles.loadingText}>Ürün bilgileri yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ürün Düzenle</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ürün Adı *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ürün adını girin"
                value={productName}
                onChangeText={setProductName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kategori *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={setSelectedCategory}
                  style={styles.picker}
                >
                  <Picker.Item label="Kategori seçin..." value="" />
                  {categories.map((category) => (
                    <Picker.Item
                      key={category.id}
                      label={category.name}
                      value={category.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Fiyat (₺) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Gerçek Fiyat (₺)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={originalPrice}
                  onChangeText={setOriginalPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Stok Miktarı *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ürün Resmi URL *</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/image.jpg"
                value={image}
                onChangeText={setImage}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleUpdateProduct}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Ürünü Güncelle</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#B8860B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  submitButton: {
    backgroundColor: '#B8860B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 20,
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
