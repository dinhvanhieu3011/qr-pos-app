import React from 'react';
import { View, FlatList, StyleSheet, Alert, Image } from 'react-native';
import { List, Text, Button, Divider, IconButton, Card, Surface } from 'react-native-paper';
import { useCart } from '../contexts/CartContext';
import { useInvoices } from '../contexts/InvoiceContext';
import { CartItem } from '../types';
import { useNavigation } from '@react-navigation/native';
import { AppTheme, dragonBallStyles } from '../theme';
import Container from '../components/Container';
import * as Crypto from 'expo-crypto';

const capsuleIcon = require('../assets/dragonball/capsule.png');

const CartScreen = () => {
  const { cart, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const { addInvoice } = useInvoices();
  const navigation = useNavigation();

  const handlePayment = async () => {
    if (cart.length === 0) return;

    Alert.alert(
      'Thanh toán',
      `Xác nhận thanh toán ${totalAmount.toLocaleString('vi-VN')} đ?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đồng ý', 
          onPress: async () => {
             // Create Invoice
             const newInvoice = {
                id: Crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                items: [...cart],
                totalAmount: totalAmount,
                paymentMethod: 'cash' as const,
             };
             await addInvoice(newInvoice);
             clearCart();
             Alert.alert('Thành công', 'Đã thanh toán và lưu hóa đơn!');
             navigation.goBack();
          } 
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={[dragonBallStyles.card, styles.itemCard]}>
      <View style={styles.itemInfo}>
          <Text variant="titleMedium" style={{fontWeight: '900', color: '#E65100', textTransform: 'uppercase'}}>{item.name}</Text>
          <Text variant="bodyMedium" style={{color: '#F57F17', fontWeight: 'bold'}}>
             {item.price.toLocaleString('vi-VN')} đ
          </Text>
      </View>
      
      <View style={styles.quantityContainer}>
          <IconButton 
            icon="minus" 
            mode="contained"
            containerColor="#FFF3E0"
            iconColor="#E65100"
            size={20} 
            onPress={() => updateQuantity(item.id, item.quantity - 1)} 
          />
          <Text variant="titleMedium" style={{fontWeight: 'bold', minWidth: 20, textAlign: 'center'}}>{item.quantity}</Text>
          <IconButton 
            icon="plus" 
            mode="contained"
            containerColor={AppTheme.colors.primary}
            iconColor="white"
            size={20} 
            onPress={() => updateQuantity(item.id, item.quantity + 1)} 
            />
      </View>
      
      <Text variant="titleMedium" style={{fontWeight: 'bold', color: AppTheme.colors.secondary, minWidth: 80, textAlign: 'right'}}>
          {(item.price * item.quantity).toLocaleString('vi-VN')}
      </Text>
    </View>
  );

  return (
    <Container withPadding={false}>
      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={capsuleIcon} style={{width: 80, height: 80, marginBottom: 16}} />
          <Text variant="bodyLarge" style={{fontWeight: 'bold', color: '#E65100'}}>GIỎ HÀNG TRỐNG</Text>
        </View>
      ) : (
        <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{height: 12}} />}
            contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}

      <View style={styles.footer}>
        <View style={styles.totalRow}>
            <Text variant="titleMedium" style={{fontWeight: 'bold'}}>TỔNG SỨC MẠNH:</Text>
            <Text variant="headlineSmall" style={{ fontWeight: '900', color: AppTheme.colors.primary }}>
                {totalAmount.toLocaleString('vi-VN')} đ
            </Text>
        </View>
        <Button 
            mode="contained" 
            onPress={handlePayment} 
            disabled={cart.length === 0}
            style={styles.payButton}
            contentStyle={{ height: 56 }}
            labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
            buttonColor={AppTheme.colors.secondary}
        >
            KAMEHAMEHA (THANH TOÁN)
        </Button>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 0,
    marginHorizontal: 16,
  },
  itemInfo: {
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    gap: 4,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 4,
    borderTopColor: AppTheme.colors.primary,
    elevation: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  payButton: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFF',
  },
});

export default CartScreen;
