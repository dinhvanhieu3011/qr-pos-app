import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { List, Text, Divider, Searchbar, Chip } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInvoices } from '../contexts/InvoiceContext';
import { Invoice } from '../types';
import { useNavigation } from '@react-navigation/native';
import { AppTheme, clayStyles } from '../theme';
import { TouchableOpacity } from 'react-native';

type FilterType = 'all' | 'today' | 'yesterday' | 'week' | 'month';

const InvoiceHistoryScreen = () => {
  const { invoices } = useInvoices();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return invoices.filter((invoice) => {
      // 1. Search Filter (by ID or Items names)
      const matchesSearch = 
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Date Filter
      const invoiceDate = new Date(invoice.createdAt);
      
      if (filterType === 'today') {
        return invoiceDate >= startOfToday;
      }
      if (filterType === 'yesterday') {
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfToday.getDate() - 1);
        return invoiceDate >= startOfYesterday && invoiceDate < startOfToday;
      }
      if (filterType === 'week') {
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Sunday as start
        return invoiceDate >= startOfWeek;
      }
      if (filterType === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return invoiceDate >= startOfMonth;
      }

      return true; // 'all'
    });
  }, [invoices, searchQuery, filterType]);

  const renderItem = ({ item }: { item: Invoice }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item.id })}
    >
      <View style={[clayStyles.card, styles.invoiceCard]}>
          <View style={styles.invoiceHeader}>
              <View style={styles.iconContainer}>
                 <List.Icon icon="receipt" color="white" />
              </View>
              <View style={{flex: 1, marginLeft: 12}}>
                  <Text variant="titleMedium" style={{fontWeight: 'bold', color: '#333'}}>
                    Hóa đơn #{item.id.slice(-6)}
                  </Text>
                  <Text variant="bodySmall" style={{color: '#888'}}>
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </Text>
              </View>
              <Text variant="titleLarge" style={{fontWeight: 'bold', color: AppTheme.colors.primary}}>
                  {item.totalAmount.toLocaleString('vi-VN')} đ
              </Text>
          </View>
          <Divider style={{marginVertical: 12, backgroundColor: '#eee'}} />
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
             <Text variant="bodyMedium" style={{color: '#666'}}>{item.items.length} món</Text>
             <Text variant="bodyMedium" style={{color: AppTheme.colors.tertiary, fontWeight: 'bold'}}>Đã thanh toán</Text>
          </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Tìm hóa đơn (ID, món ăn)..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['all', 'today', 'yesterday', 'week', 'month'].map((f) => (
            <Chip 
              key={f}
              selected={filterType === f} 
              onPress={() => setFilterType(f as any)} 
              style={[
                styles.chip, 
                filterType === f && { backgroundColor: AppTheme.colors.secondaryContainer }
              ]}
              textStyle={{ fontWeight: filterType === f ? 'bold' : 'normal' }}
              showSelectedOverlay
            >
              {f === 'all' ? 'Tất cả' : 
               f === 'today' ? 'Hôm nay' : 
               f === 'yesterday' ? 'Hôm qua' : 
               f === 'week' ? 'Tuần này' : 'Tháng này'}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {filteredInvoices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge">Không tìm thấy hóa đơn nào.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredInvoices}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Divider />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  searchbar: {
    margin: 16,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    elevation: 0,
    borderRadius: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexGrow: 0,
  },
  chip: {
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  invoiceCard: {
    padding: 16, 
    marginHorizontal: 16, 
    marginVertical: 8
  },
  invoiceHeader: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between'
  },
  iconContainer: {
    backgroundColor: AppTheme.colors.secondary, 
    borderRadius: 12, 
    padding: 4
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InvoiceHistoryScreen;
