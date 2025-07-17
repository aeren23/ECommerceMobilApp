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
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '../../context/UserContext';
import { CouponAPI, CouponDto, CreateCouponDto, UpdateCouponDto } from '../../services/ApiService';
import { Product } from '../../data/products';
import { ProductAPI } from '../../services/ApiService';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SellerCouponsScreen() {
  const { user, isSeller } = useUser();
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponDto | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 1, // 1: Percentage, 2: FixedAmount
    value: '',
    minimumAmount: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
    usageLimit: '',
    usageLimitPerUser: '',
    isActive: true,
    productId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // Satıcı kontrolü
  if (!isSeller) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kupon Yönetimi</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="warning-outline" size={80} color="#FF3B30" />
          <Text style={styles.loadingText}>Bu sayfaya sadece satıcılar erişebilir</Text>
        </View>
      </SafeAreaView>
    );
  }

  const loadData = async (isRefresh = false) => {
    try {
      if (!user?.fullName) {
        console.error('User not found or no fullName');
        return;
      }

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [couponsResponse, productsResponse] = await Promise.all([
        CouponAPI.getMyCoupons(),
        ProductAPI.getBySeller(user.fullName)
      ]);

      if (couponsResponse.success && couponsResponse.value) {
        setCoupons(couponsResponse.value);
      }

      if (productsResponse.success && productsResponse.value) {
        setProducts(productsResponse.value);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 1,
      value: '',
      minimumAmount: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: '',
      usageLimitPerUser: '',
      isActive: true,
      productId: ''
    });
    setEditingCoupon(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (coupon: CouponDto) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value.toString(),
      minimumAmount: coupon.minimumAmount?.toString() || '',
      startDate: new Date(coupon.startDate),
      endDate: new Date(coupon.endDate),
      usageLimit: coupon.usageLimit?.toString() || '',
      usageLimitPerUser: coupon.usageLimitPerUser?.toString() || '',
      isActive: coupon.isActive,
      productId: coupon.productId
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.code.trim() || !formData.name.trim() || !formData.value.trim() || !formData.productId) {
      Alert.alert('Uyarı', 'Kod, isim, değer ve ürün alanları zorunludur');
      return;
    }

    const numericValue = parseFloat(formData.value);
    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert('Uyarı', 'Kupon değeri geçerli bir sayı olmalıdır');
      return;
    }

    if (formData.type === 1 && numericValue > 100) {
      Alert.alert('Uyarı', 'Yüzde indirimi 100\'den fazla olamaz');
      return;
    }

    if (formData.startDate >= formData.endDate) {
      Alert.alert('Uyarı', 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }

    try {
      setIsCreating(true);

      const couponData = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        value: numericValue,
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        usageLimitPerUser: formData.usageLimitPerUser ? parseInt(formData.usageLimitPerUser) : undefined,
        isActive: formData.isActive,
        productId: formData.productId
      };

      let response;
      if (editingCoupon) {
        response = await CouponAPI.update({
          id: editingCoupon.id,
          ...couponData
        });
      } else {
        response = await CouponAPI.create(couponData);
      }

      if (response.success) {
        Alert.alert('Başarılı', editingCoupon ? 'Kupon güncellendi' : 'Kupon oluşturuldu');
        setModalVisible(false);
        resetForm();
        await loadData();
      } else {
        Alert.alert('Hata', response.errorMessage || 'Kupon kaydedilemedi');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      Alert.alert('Hata', 'Kupon kaydedilirken bir hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (coupon: CouponDto) => {
    Alert.alert(
      'Kuponu Sil',
      `"${coupon.name}" kuponunu silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await CouponAPI.delete(coupon.id);
              if (response.success) {
                Alert.alert('Başarılı', 'Kupon silindi');
                await loadData();
              } else {
                Alert.alert('Hata', response.errorMessage || 'Kupon silinemedi');
              }
            } catch (error) {
              Alert.alert('Hata', 'Kupon silinirken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    loadData(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const getCouponTypeText = (type: number) => {
    return type === 1 ? 'Yüzde' : 'Sabit Tutar';
  };

  const getCouponValue = (coupon: CouponDto) => {
    return coupon.type === 1 ? `%${coupon.value}` : `₺${coupon.value}`;
  };

  const getSelectedProduct = () => {
    return products.find(p => p.id === formData.productId);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kupon Yönetimi</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.loadingText}>Kuponlar yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>Kupon Yönetimi</Text>
        <TouchableOpacity onPress={openCreateModal}>
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
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{coupons.length}</Text>
            <Text style={styles.statsLabel}>Kuponlarınız</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{products.length}</Text>
            <Text style={styles.statsLabel}>Ürünleriniz</Text>
          </View>
        </View>

        {/* Coupons List */}
        <View style={styles.listContainer}>
          {coupons.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="ticket-outline" size={64} color="#999" />
              <Text style={styles.emptyText}>Henüz kupon bulunmuyor</Text>
              <Text style={styles.emptySubtext}>
                Ürünleriniz için kupon oluşturmak için + butonuna tıklayın
              </Text>
            </View>
          ) : (
            coupons.map((coupon) => (
              <View key={coupon.id} style={styles.couponCard}>
                <View style={styles.couponHeader}>
                  <View style={styles.couponInfo}>
                    <Text style={styles.couponCode}>{coupon.code}</Text>
                    <Text style={styles.couponName}>{coupon.name}</Text>
                  </View>
                  <View style={styles.couponValue}>
                    <Text style={styles.valueText}>{getCouponValue(coupon)}</Text>
                    <Text style={styles.typeText}>{getCouponTypeText(coupon.type)}</Text>
                  </View>
                </View>

                <View style={styles.couponDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="cube-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>
                      {coupon.product?.name || 'Ürün bulunamadı'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>
                      {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>
                      {coupon.currentUsageCount} / {coupon.usageLimit || '∞'} kullanım
                    </Text>
                  </View>
                </View>

                <View style={styles.couponFooter}>
                  <View style={styles.statusBadge}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: coupon.isActive ? '#34C759' : '#FF3B30' }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: coupon.isActive ? '#34C759' : '#FF3B30' }
                    ]}>
                      {coupon.isActive ? 'Aktif' : 'Pasif'}
                    </Text>
                  </View>
                  <View style={styles.couponActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => openEditModal(coupon)}
                    >
                      <Ionicons name="pencil" size={16} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(coupon)}
                    >
                      <Ionicons name="trash" size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCoupon ? 'Kupon Düzenle' : 'Yeni Kupon Oluştur'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Kupon Kodu */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Kupon Kodu *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Örn: YENI20"
                  value={formData.code}
                  onChangeText={(text) => setFormData({...formData, code: text.toUpperCase()})}
                  autoCapitalize="characters"
                />
              </View>

              {/* Kupon Adı */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Kupon Adı *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Kupon adı"
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                />
              </View>

              {/* Açıklama */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Açıklama</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Kupon açıklaması"
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Ürün Seçimi */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ürün * (Sadece kendi ürünleriniz)</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.productId}
                    onValueChange={(value) => setFormData({...formData, productId: value})}
                    style={styles.picker}
                  >
                    <Picker.Item label="Ürün seçin" value="" />
                    {products.map((product) => (
                      <Picker.Item
                        key={product.id}
                        label={product.name}
                        value={product.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* İndirim Tipi */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>İndirim Tipi</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value})}
                    style={styles.picker}
                  >
                    <Picker.Item label="Yüzde İndirimi" value={1} />
                    <Picker.Item label="Sabit Tutar İndirimi" value={2} />
                  </Picker>
                </View>
              </View>

              {/* İndirim Değeri */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  İndirim Değeri * {formData.type === 1 ? '(%)' : '(₺)'}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={formData.type === 1 ? "20" : "50"}
                  value={formData.value}
                  onChangeText={(text) => setFormData({...formData, value: text})}
                  keyboardType="numeric"
                />
              </View>

              {/* Minimum Tutar */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Minimum Tutar (₺)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="100"
                  value={formData.minimumAmount}
                  onChangeText={(text) => setFormData({...formData, minimumAmount: text})}
                  keyboardType="numeric"
                />
              </View>

              {/* Tarih Aralığı */}
              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Başlangıç Tarihi</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text>{formData.startDate.toLocaleDateString('tr-TR')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Bitiş Tarihi</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text>{formData.endDate.toLocaleDateString('tr-TR')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Kullanım Limitleri */}
              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Toplam Kullanım</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="100"
                    value={formData.usageLimit}
                    onChangeText={(text) => setFormData({...formData, usageLimit: text})}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Kişi Başı Kullanım</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="1"
                    value={formData.usageLimitPerUser}
                    onChangeText={(text) => setFormData({...formData, usageLimitPerUser: text})}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Aktif Durumu */}
              <View style={styles.formGroup}>
                <View style={styles.switchContainer}>
                  <Text style={styles.formLabel}>Aktif Durumu</Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => setFormData({...formData, isActive: value})}
                    trackColor={{ false: '#767577', true: '#34C759' }}
                    thumbColor={formData.isActive ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSubmit}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingCoupon ? 'Güncelle' : 'Oluştur'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setFormData({...formData, startDate: selectedDate});
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setFormData({...formData, endDate: selectedDate});
            }
          }}
        />
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
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
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
  couponCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  couponInfo: {
    flex: 1,
  },
  couponCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 4,
  },
  couponName: {
    fontSize: 14,
    color: '#333',
  },
  couponValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  typeText: {
    fontSize: 12,
    color: '#666',
  },
  couponDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  couponActions: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  formLabel: {
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
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF3B30',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
