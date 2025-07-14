import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AdminAPI, ProductAPI, OrderListDto, OrderDto, OrderItemDto } from '../../services/ApiService';

export default function OrdersManagementScreen() {
  const [orders, setOrders] = useState<OrderListDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [orderProducts, setOrderProducts] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Loading orders...');
      
      const response = await AdminAPI.getAllOrdersWithUsers();
      
      if (response.success && response.value) {
        setOrders(response.value);
        console.log('✅ Orders loaded:', response.value.length);
      } else {
        console.error('❌ Failed to load orders:', response.errorMessage);
        Alert.alert('Hata', 'Siparişler yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      Alert.alert('Hata', 'Siparişler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const openOrderDetails = async (orderId: string) => {
    try {
      setLoadingOrderDetails(true);
      setModalVisible(true);
      console.log('📋 Loading order details for:', orderId);
      
      // Sipariş detaylarını getir
      const orderResponse = await AdminAPI.getOrderDetailsById(orderId);
      
      if (orderResponse.success && orderResponse.value) {
        setSelectedOrder(orderResponse.value);
        
        // Her ürün için ürün bilgilerini getir
        const productPromises = orderResponse.value.items.map(async (item: OrderItemDto) => {
          const productResponse = await ProductAPI.getById(item.productId);
          return {
            ...item,
            product: productResponse.success ? productResponse.value : null
          };
        });
        
        const productsWithDetails = await Promise.all(productPromises);
        setOrderProducts(productsWithDetails);
        console.log('✅ Order details loaded with products');
      } else {
        Alert.alert('Hata', 'Sipariş detayları yüklenirken bir hata oluştu');
        setModalVisible(false);
      }
    } catch (error) {
      console.error('❌ Error loading order details:', error);
      Alert.alert('Hata', 'Sipariş detayları yüklenirken bir hata oluştu');
      setModalVisible(false);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
    setOrderProducts([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `₺${price.toLocaleString()}`;
  };

  const OrderCard = ({ item }: { item: OrderListDto }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => openOrderDetails(item.id)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>#{item.id.substring(0, 8)}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.orderAmount}>
          <Text style={styles.amountText}>{formatPrice(item.totalPrice)}</Text>
          <Text style={styles.itemCount}>{item.items.length} ürün</Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <Ionicons name="person" size={16} color="#666" />
        <Text style={styles.customerName}>
          {item.user?.fullName || 'Bilinmeyen Müşteri'}
        </Text>
        <Text style={styles.customerEmail}>({item.user?.email})</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.viewDetails}>Detayları Görüntüle</Text>
        <Ionicons name="chevron-forward" size={16} color="#007AFF" />
      </View>
    </TouchableOpacity>
  );

  const OrderDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sipariş Detayları</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {loadingOrderDetails ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color="#FF3B30" />
              <Text style={styles.loadingText}>Sipariş detayları yükleniyor...</Text>
            </View>
          ) : selectedOrder ? (
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Sipariş Bilgileri */}
              <View style={styles.orderDetailsSection}>
                <Text style={styles.sectionTitle}>Sipariş Bilgileri</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Sipariş ID:</Text>
                  <Text style={styles.detailValue}>#{selectedOrder.id.substring(0, 8)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tarih:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedOrder.createdAt)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Toplam Tutar:</Text>
                  <Text style={[styles.detailValue, styles.totalAmount]}>
                    {formatPrice(selectedOrder.totalPrice)}
                  </Text>
                </View>
              </View>

              {/* Müşteri Bilgileri */}
              {selectedOrder.user && (
                <View style={styles.orderDetailsSection}>
                  <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ad Soyad:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.user.fullName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.user.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Telefon:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.user.phoneNumber}</Text>
                  </View>
                  {selectedOrder.user.address && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Adres:</Text>
                      <Text style={styles.detailValue}>{selectedOrder.user.address}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Sipariş Ürünleri */}
              <View style={styles.orderDetailsSection}>
                <Text style={styles.sectionTitle}>Sipariş Ürünleri ({selectedOrder.items.length})</Text>
                {orderProducts.map((item, index) => (
                  <View key={index} style={styles.productItem}>
                    <Image 
                      source={{ uri: item.product?.image || 'https://via.placeholder.com/60' }} 
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>
                        {item.product?.name || 'Ürün bulunamadı'}
                      </Text>
                      <Text style={styles.productPrice}>
                        {formatPrice(item.price)} x {item.quantity}
                      </Text>
                      <Text style={styles.productTotal}>
                        Toplam: {formatPrice(item.price * item.quantity)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sipariş Yönetimi</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {orders.length} sipariş  | {formatPrice(totalRevenue)} toplam ciro
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={({ item }) => <OrderCard item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <OrderDetailsModal />
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
  statsBar: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  listContainer: {
    padding: 20,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderInfo: {},
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  customerEmail: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetails: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  // Modal Styles
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
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  orderDetailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
});
