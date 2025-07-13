import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useUser } from '../context/UserContext';
import { OrderAPI, ProductAPI } from '../services/ApiService';
import { Ionicons } from '@expo/vector-icons';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  userId: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersScreen() {
  const { isLoggedIn, user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [productDetails, setProductDetails] = useState<{[key: string]: any}>({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Siparişleri yükle
  const loadOrders = async () => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('📋 Loading orders...');
      const response = await OrderAPI.getOrders();
      
      if (response.success && response.value) {
        console.log('✅ Orders loaded:', response.value.length);
        setOrders(response.value);
      } else {
        console.error('❌ Failed to load orders:', response.errorMessage);
        Alert.alert('Hata', 'Siparişler yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      Alert.alert('Hata', 'Siparişler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Component mount olduğunda siparişleri yükle
  useEffect(() => {
    loadOrders();
  }, [isLoggedIn]);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  // Ürün detaylarını çek
  const loadProductDetails = async (productIds: string[]) => {
    try {
      setLoadingProducts(true);
      const productPromises = productIds.map(async (productId) => {
        // Eğer bu ürün detayı zaten varsa tekrar çekme
        if (productDetails[productId]) {
          return { productId, product: productDetails[productId] };
        }
        
        const response = await ProductAPI.getById(productId);
        if (response.success && response.value) {
          return { productId, product: response.value };
        }
        return { productId, product: null };
      });

      const results = await Promise.all(productPromises);
      const newProductDetails = { ...productDetails };
      
      results.forEach(({ productId, product }) => {
        if (product) {
          newProductDetails[productId] = product;
        }
      });
      
      setProductDetails(newProductDetails);
    } catch (error) {
      console.error('Ürün detayları yüklenirken hata:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Sipariş detayını göster
  const showOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
    
    // Bu siparişte bulunan ürünlerin ID'lerini çıkar
    const productIds = order.items.map(item => item.productId);
    
    // Ürün detaylarını yükle
    if (productIds.length > 0) {
      await loadProductDetails(productIds);
    }
  };

  // Tarihi formatla
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Sipariş durumu rengini al
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#4CAF50';
      case 'shipped': return '#2196F3';
      case 'delivered': return '#8BC34A';
      case 'cancelled': return '#F44336';
      default: return '#8E8E93';
    }
  };

  // Sipariş durumu metnini al
  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Beklemede';
      case 'confirmed': return 'Onaylandı';
      case 'shipped': return 'Kargoda';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status || 'Bilinmiyor';
    }
  };

  // Giriş yapmamış kullanıcı için
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Siparişlerim</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Giriş Gerekli</Text>
          <Text style={styles.emptySubtitle}>
            Siparişlerinizi görmek için giriş yapmanız gerekmektedir.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading durumu
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Siparişlerim</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B8860B" />
          <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Sipariş öğesi render fonksiyonu
  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => showOrderDetails(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Sipariş #{item.id.slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      
      <View style={styles.orderSummary}>
        <Text style={styles.itemCount}>
          {item.items.length} ürün
        </Text>
        <Text style={styles.totalPrice}>
          ₺{item.totalPrice.toLocaleString()}
        </Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.viewDetails}>Detayları Görüntüle</Text>
        <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Siparişlerim</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Henüz Sipariş Yok</Text>
          <Text style={styles.emptySubtitle}>
            İlk siparişinizi vermek için alışverişe başlayın!
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/')}
          >
            <Text style={styles.shopButtonText}>Alışverişe Başla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#B8860B']}
            />
          }
        />
      )}

      {/* Sipariş Detay Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sipariş Detayı</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Sipariş Numarası</Text>
                  <Text style={styles.detailValue}>#{selectedOrder.id}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tarih</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedOrder.createdAt)}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Durum</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(selectedOrder.status)}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ürünler</Text>
                  {loadingProducts && (
                    <View style={styles.loadingProductsContainer}>
                      <ActivityIndicator size="small" color="#B8860B" />
                      <Text style={styles.loadingProductsText}>Ürün bilgileri yükleniyor...</Text>
                    </View>
                  )}
                  {selectedOrder.items.map((item, index) => {
                    const product = productDetails[item.productId];
                    const productName = product?.name || item.product?.name || `Ürün ID: ${item.productId}`;
                    
                    return (
                      <View key={index} style={styles.productItem}>
                        <Text style={styles.productName}>
                          {productName}
                        </Text>
                        <Text style={styles.productDetails}>
                          {item.quantity} adet × ₺{item.price.toLocaleString()} = ₺{(item.quantity * item.price).toLocaleString()}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.totalSection}>
                  <Text style={styles.totalLabel}>Toplam Tutar</Text>
                  <Text style={styles.totalValue}>₺{selectedOrder.totalPrice.toLocaleString()}</Text>
                </View>
              </ScrollView>
            )}
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
    backgroundColor: '#B8860B',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopButton: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  viewDetails: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
    minWidth: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  productItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 12,
    color: '#666',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  loadingProductsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginBottom: 8,
  },
  loadingProductsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});
