import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Modal, RefreshControl, Animated } from 'react-native';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuthSession } from 'providers/AuthProvider';
import { format } from 'date-fns';
import { useState, useMemo, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const USER_INFO_QUERY = gql`
  query UserInfo {
    userInfo {
      invoices {
        id
        amount
        paid
        paidAt
        currency
        paymentId
        createdAt
      }
    }
  }
`;

type SortOption = 'newest' | 'oldest' | 'paidFirst' | 'unpaidFirst';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' as SortOption },
  { label: 'Oldest First', value: 'oldest' as SortOption },
  { label: 'Paid First', value: 'paidFirst' as SortOption },
  { label: 'Unpaid First', value: 'unpaidFirst' as SortOption },
];

interface Invoice {
  id: string;
  amount: string;
  paid: string;
  paidAt: string | null;
  currency: string;
  paymentId: string | null;
  createdAt: string;
}

export default function InvoicesScreen() {
  const { token } = useAuthSession();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const { loading, error, data, refetch } = useQuery(USER_INFO_QUERY, {
    context: {
      headers: {
        Authorization: `Bearer ${token?.current}`,
      },
    },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    console.log('Token:', token?.current);
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('Data:', data);
  }, [token, loading, error, data]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePayNow = (invoiceId: string) => {
    const paymentUrl = `https://egs-backend.mxv.pt/pay/${invoiceId}`;
    Linking.openURL(paymentUrl);
  };

  const sortedInvoices = useMemo(() => {
    if (!data?.userInfo?.invoices) return [];
    
    const invoices = [...data.userInfo.invoices].filter(Boolean);
    
    switch (sortBy) {
      case 'newest':
        return invoices.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return invoices.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'paidFirst':
        return invoices.sort((a, b) => {
          if (a.paid === b.paid) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return a.paid === "true" ? -1 : 1;
        });
      case 'unpaidFirst':
        return invoices.sort((a, b) => {
          if (a.paid === b.paid) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return a.paid === "true" ? 1 : -1;
        });
      default:
        return invoices;
    }
  }, [data?.userInfo?.invoices, sortBy]);

  const selectedSortLabel = SORT_OPTIONS.find(option => option.value === sortBy)?.label || 'Newest First';

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing invoices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const totalPaid = useMemo(() => {
    return data?.userInfo?.invoices
      ?.filter((invoice: Invoice) => invoice.paid === "true")
      .reduce((sum: number, invoice: Invoice) => sum + parseFloat(invoice.amount), 0) || 0;
  }, [data?.userInfo?.invoices]);

  const totalUnpaid = useMemo(() => {
    return data?.userInfo?.invoices
      ?.filter((invoice: Invoice) => invoice.paid !== "true")
      .reduce((sum: number, invoice: Invoice) => sum + parseFloat(invoice.amount), 0) || 0;
  }, [data?.userInfo?.invoices]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: 40 }]}>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
      </View>
    );
  }

  if (error) {
    console.error('GraphQL Error:', error);
    return (
      <View style={[styles.container, { paddingTop: 40 }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorTitle}>Error Loading Invoices</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!data?.userInfo?.invoices) {
    return (
      <View style={[styles.container, { paddingTop: 40 }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No invoices found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#175D97', '#1A6BA8']}
        style={styles.header}
      >
        <Text style={styles.title}>My Invoices</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={styles.summaryValue}>{totalPaid.toFixed(2)} €</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Unpaid</Text>
            <Text style={[styles.summaryValue, styles.unpaidValue]}>{totalUnpaid.toFixed(2)} €</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setIsSortModalVisible(true)}
        >
          <Text style={styles.sortButtonText}>{selectedSortLabel}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isSortModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsSortModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Invoices</Text>
              <TouchableOpacity onPress={() => setIsSortModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  sortBy === option.value && styles.selectedSortOption
                ]}
                onPress={() => {
                  setSortBy(option.value);
                  setIsSortModalVisible(false);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortBy === option.value && styles.selectedSortOptionText
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Ionicons name="checkmark" size={20} color="#175D97" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <FlatList
        data={sortedInvoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.invoiceCard}>
            <View style={styles.invoiceHeader}>
              <View style={styles.invoiceDateContainer}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.invoiceDate}>
                  {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                item.paid === "true" ? styles.paidBadge : styles.unpaidBadge
              ]}>
                <Text style={[
                  styles.status,
                  item.paid === "true" ? styles.paid : styles.unpaid
                ]}>
                  {item.paid === "true" ? 'Paid' : 'Unpaid'}
                </Text>
              </View>
            </View>
            <View style={styles.invoiceDetails}>
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amount}>
                  {parseFloat(item.amount).toFixed(2)} {item.currency}
                </Text>
              </View>
              {item.paid !== "true" && (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handlePayNow(item.id)}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No invoices found</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <Text style={styles.footerText}>End of Results</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#175D97']}
            tintColor="#175D97"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryItem: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  unpaidValue: {
    color: '#FF3B30',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sortLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sortButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedSortOption: {
    backgroundColor: '#f8f8f8',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedSortOptionText: {
    color: '#175D97',
    fontWeight: 'bold',
  },
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  invoiceDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  unpaidBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  paid: {
    color: '#27AE60',
  },
  unpaid: {
    color: '#FF3B30',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  payButton: {
    backgroundColor: '#175D97',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    paddingVertical: 15,
  },
  footer: {
    marginBottom:80,
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#175D97',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  skeletonHeader: {
    height: 40,
    backgroundColor: '#f0f0f0',
    margin: 20,
    borderRadius: 8,
  },
  skeletonCard: {
    height: 100,
    backgroundColor: '#f0f0f0',
    margin: 20,
    marginTop: 10,
    borderRadius: 12,
  },
});
