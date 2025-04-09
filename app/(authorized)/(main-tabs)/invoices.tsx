import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Modal, RefreshControl } from 'react-native';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuthSession } from 'providers/AuthProvider';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';

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

export default function InvoicesScreen() {
  const { token } = useAuthSession();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { loading, error, data, refetch } = useQuery(USER_INFO_QUERY, {
    context: {
      headers: {
        Authorization: `Bearer ${token?.current}`,
      },
    },
  });

  const handlePayNow = (invoiceId: string) => {
    const paymentUrl = `https://egs-backend.mxv.pt/pay/${invoiceId}`;
    Linking.openURL(paymentUrl);
  };

  const sortedInvoices = useMemo(() => {
    if (!data?.userInfo?.invoices) return [];
    
    const invoices = [...data.userInfo.invoices];
    
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error loading invoices</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Invoices</Text>
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
          <View style={styles.invoiceItem}>
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceDate}>
                {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
              </Text>
              <Text style={[styles.status, item.paid === "true" ? styles.paid : styles.unpaid]}>
                {item.paid === "true" ? 'Paid' : 'Unpaid'}
              </Text>
            </View>
            <View style={styles.invoiceDetails}>
              <Text style={styles.amount}>
                {item.amount} {item.currency}
              </Text>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    padding: 20,
    textAlign: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
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
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedSortOption: {
    backgroundColor: '#f0f7ff',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedSortOptionText: {
    color: '#175D97',
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  invoiceItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paid: {
    backgroundColor: '#e6f7e6',
    color: '#2e7d32',
  },
  unpaid: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  payButton: {
    backgroundColor: '#175D97',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    marginTop: 10,
    marginBottom: 95,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
});
