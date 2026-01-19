import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { List, Text, Card, Divider } from 'react-native-paper';
import { useInvoices } from '../contexts/InvoiceContext';
import { CartItem, Invoice } from '../types';
import { useRoute, RouteProp } from '@react-navigation/native';

type ParamList = {
  InvoiceDetail: { invoiceId: string };
};

const InvoiceDetailScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'InvoiceDetail'>>();
  const { invoiceId } = route.params;
  const { getInvoiceById } = useInvoices();
  const [invoice, setInvoice] = useState<Invoice | undefined>(undefined);

  useEffect(() => {
    if (invoiceId) {
      setInvoice(getInvoiceById(invoiceId));
    }
  }, [invoiceId, getInvoiceById]); // getInvoiceById dependency included explicitly via hook

  if (!invoice) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy hóa đơn</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: CartItem }) => (
    <List.Item
      title={item.name}
      description={`${item.price.toLocaleString('vi-VN')} đ x ${item.quantity}`}
      right={() => <Text style={{alignSelf:'center'}}>{(item.price * item.quantity).toLocaleString('vi-VN')} đ</Text>}
    />
  );

  return (
    <View style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.totalText}>
            Tổng tiền: {invoice.totalAmount.toLocaleString('vi-VN')} đ
          </Text>
          <Text variant="bodyMedium">
            Ngày: {new Date(invoice.createdAt).toLocaleString('vi-VN')}
          </Text>
          <Text variant="bodySmall" style={{color:'gray'}}>ID: {invoice.id}</Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.header}>Chi tiết đơn hàng</Text>
      <Divider />
      
      <FlatList
        data={invoice.items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Divider />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    margin: 16,
    backgroundColor: '#e3f2fd',
  },
  totalText: {
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 8,
  },
  header: {
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
});

export default InvoiceDetailScreen;
