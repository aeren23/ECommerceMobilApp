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
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CategoryAPI, CategoryDto } from '../../services/ApiService';

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Kategorileri yükle
  const loadCategories = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) setIsLoading(true);
      const response = await CategoryAPI.getAll(forceRefresh);
      
      if (response.success && response.value) {
        setCategories(response.value);
      } else {
        Alert.alert('Hata', response.errorMessage || 'Kategoriler yüklenemedi');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Hata', 'Kategoriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Yeni kategori ekle
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Uyarı', 'Kategori adı boş olamaz');
      return;
    }

    try {
      setIsCreating(true);
      const response = await CategoryAPI.create({ name: newCategoryName.trim() });
      
      if (response.success) {
        Alert.alert('Başarılı', 'Kategori başarıyla oluşturuldu');
        setNewCategoryName('');
        setModalVisible(false);
        await loadCategories(true); // Fresh data
      } else {
        Alert.alert('Hata', response.errorMessage || 'Kategori oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Hata', 'Kategori oluşturulurken bir hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  // Kategori sil
  const handleDeleteCategory = (category: CategoryDto) => {
    Alert.alert(
      'Kategori Sil',
      `"${category.name}" kategorisini silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await CategoryAPI.delete(category.id);
              
              if (response.success) {
                Alert.alert('Başarılı', 'Kategori başarıyla silindi');
                await loadCategories(true);
              } else {
                Alert.alert('Hata', response.errorMessage || 'Kategori silinemedi');
              }
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Hata', 'Kategori silinirken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  // Kategori güncelle
  const handleUpdateCategory = (category: CategoryDto) => {
    Alert.prompt(
      'Kategori Güncelle',
      'Yeni kategori adını girin:',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Güncelle',
          onPress: async (newName) => {
            if (!newName?.trim()) {
              Alert.alert('Uyarı', 'Kategori adı boş olamaz');
              return;
            }

            try {
              const response = await CategoryAPI.update({
                id: category.id,
                name: newName.trim()
              });
              
              if (response.success) {
                Alert.alert('Başarılı', 'Kategori başarıyla güncellendi');
                await loadCategories(true);
              } else {
                Alert.alert('Hata', response.errorMessage || 'Kategori güncellenemedi');
              }
            } catch (error) {
              console.error('Error updating category:', error);
              Alert.alert('Hata', 'Kategori güncellenirken bir hata oluştu');
            }
          }
        }
      ],
      'plain-text',
      category.name
    );
  };

  // Refresh
  const onRefresh = () => {
    setIsRefreshing(true);
    loadCategories(true);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kategori Yönetimi</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.loadingText}>Kategoriler yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>Kategori Yönetimi</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{categories.length}</Text>
          <Text style={styles.statsLabel}>Toplam Kategori</Text>
        </View>

        {/* Categories List */}
        <View style={styles.listContainer}>
          {categories.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={styles.categoryIcon}>
                  <Ionicons name="folder" size={24} color="#FF3B30" />
                </View>
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryId}>ID: {category.id.substring(0, 8)}...</Text>
                </View>
              </View>
              
              <View style={styles.categoryActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleUpdateCategory(category)}
                >
                  <Ionicons name="pencil" size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Ionicons name="trash" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {categories.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="#999" />
              <Text style={styles.emptyText}>Henüz kategori bulunmuyor</Text>
              <Text style={styles.emptySubtext}>Yeni kategori eklemek için + butonuna tıklayın</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Kategori Ekle</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Kategori adı..."
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewCategoryName('');
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateCategory}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.createButtonText}>Oluştur</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  statsLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  categoryId: {
    fontSize: 12,
    color: '#999',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#E5F0FF',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  createButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
