import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ProductAPI, CategoryAPI, CategoryDto } from '../../services/ApiService';
import { Product } from '../../data/products';
import { Picker } from '@react-native-picker/picker';

export default function EditProductScreen() {
  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [seller, setSeller] = useState('');
  const [stock, setStock] = useState('');
  const [rating, setRating] = useState('');
  const [tags, setTags] = useState('');

  // Ürün ve kategorileri yükle
  useEffect(() => {
    loadProductAndCategories();
  }, [productId]);

  const loadProductAndCategories = async () => {
    try {
      setIsLoading(true);

      // Ürün ve kategorileri paralel yükle
      const [productResponse, categoriesResponse] = await Promise.all([
        ProductAPI.getById(productId as string),
        CategoryAPI.getAll()
      ]);

      if (productResponse.success && productResponse.value) {
        const productData = productResponse.value;
        setProduct(productData);
        
        // Form alanlarını doldur
        setName(productData.name);
        setCategoryId(productData.categoryId);
        setImage(productData.image);
        setPrice(productData.price.toString());
        setOriginalPrice(productData.originalPrice?.toString() || '');
        setSeller(productData.seller);
        setStock(productData.stock.toString());
        setRating(productData.rating.toString());
        setTags(productData.tags.join(', '));
      } else {
        Alert.alert('Hata', 'Ürün bulunamadı');
        router.back();
      }

      if (categoriesResponse.success && categoriesResponse.value) {
        setCategories(categoriesResponse.value);
      }

    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Hata', 'Ürün yüklenirken bir hata oluştu');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  // Ürünü güncelle
  const handleUpdateProduct = async () => {
    // Validasyon
    if (!name.trim() || !categoryId || !image.trim() || !price || !seller.trim() || !stock) {
      Alert.alert('Uyarı', 'Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    const priceNum = parseFloat(price);
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : undefined;
    const stockNum = parseInt(stock);
    const ratingNum = parseFloat(rating) || 0;

    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Uyarı', 'Geçerli bir fiyat girin');
      return;
    }

    if (originalPriceNum && (isNaN(originalPriceNum) || originalPriceNum <= priceNum)) {
      Alert.alert('Uyarı', 'Eski fiyat, yeni fiyattan büyük olmalıdır');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Uyarı', 'Geçerli bir stok miktarı girin');
      return;
    }

    if (ratingNum < 0 || ratingNum > 5) {
      Alert.alert('Uyarı', 'Puan 0-5 arasında olmalıdır');
      return;
    }

    try {
      setIsSaving(true);

      const updateData = {
        id: productId as string,
        name: name.trim(),
        categoryId,
        image: image.trim(),
        price: priceNum,
        originalPrice: originalPriceNum,
        seller: seller.trim(),
        stock: stockNum,
        rating: ratingNum,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };

      const response = await ProductAPI.update(updateData);

      if (response.success) {
        Alert.alert('Başarılı', 'Ürün başarıyla güncellendi', [
          { text: 'Tamam', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Hata', response.errorMessage || 'Ürün güncellenirken bir hata oluştu');
      }

    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Hata', 'Ürün güncellenirken bir hata oluştu');
    } finally {
      setIsSaving(false);
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
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.loadingText}>Ürün yükleniyor...</Text>
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Product Image Preview */}
        {image ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
          </View>
        ) : null}

        <View style={styles.formContainer}>
          {/* Ürün Adı */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ürün Adı *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ürün adını girin"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Kategori */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategori *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={categoryId}
                onValueChange={setCategoryId}
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

          {/* Görsel URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Görsel URL *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://example.com/image.jpg"
              value={image}
              onChangeText={setImage}
              autoCapitalize="none"
            />
          </View>

          {/* Fiyat */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fiyat (₺) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          {/* Eski Fiyat */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Eski Fiyat (₺)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0 (İndirim için)"
              value={originalPrice}
              onChangeText={setOriginalPrice}
              keyboardType="numeric"
            />
          </View>

          {/* Satıcı */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Satıcı *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Satıcı adı"
              value={seller}
              onChangeText={setSeller}
            />
          </View>

          {/* Stok */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stok Miktarı *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0"
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />
          </View>

          {/* Puan */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Puan (0-5)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="4.5"
              value={rating}
              onChangeText={setRating}
              keyboardType="numeric"
            />
          </View>

          {/* Etiketler */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Etiketler</Text>
            <TextInput
              style={styles.textInput}
              placeholder="indirimli, yeni, popüler (virgül ile ayırın)"
              value={tags}
              onChangeText={setTags}
            />
          </View>

          {/* Güncelle Butonu */}
          <TouchableOpacity
            style={[styles.updateButton, isSaving && styles.disabledButton]}
            onPress={handleUpdateProduct}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.updateButtonText}>Ürünü Güncelle</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  picker: {
    height: 50,
  },
  updateButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
