import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Vibration, Alert, Platform } from 'react-native';
import { Text, Button, Card, IconButton } from 'react-native-paper';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import BarcodeScanner, { CameraView } from '@pushpendersingh/react-native-scanner';

import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import { AppTheme, clayStyles } from '../theme';

const PosScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { getProductByQr } = useProducts();
  const { addToCart, totalItems, totalAmount } = useCart();
  const { logout } = useAuth();
  
  const [lastScanned, setLastScanned] = useState<Product | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);


  // Debounce scanning using refs for synchronous checks
  const lastScannedCode = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const granted = await BarcodeScanner.hasCameraPermission();
    setHasPermission(granted);
    if (!granted) {
      const status = await BarcodeScanner.requestCameraPermission();
      setHasPermission(status);
    }
  };


  // Use useFocusEffect to manage scanning lifecycle
  useFocusEffect(
    useCallback(() => {
      let isSubscribed = true;

      const startScanning = async () => {
        if (hasPermission) {
          try {
            await BarcodeScanner.startScanning((results) => {
              if (isSubscribed && results && results.length > 0) {
                handleBarCodeScanned(results[0].data);
              }
            });
          } catch (e) {
            console.error('Error starting scanner:', e);
          }
        }
      };

      startScanning();

      return () => {
        isSubscribed = false;
        BarcodeScanner.stopScanning();
      };
    }, [hasPermission])
  );


  const handleBarCodeScanned = (data: string) => {
    const now = Date.now();
    // Prevent same code scanning within 2 seconds
    if (data === lastScannedCode.current && now - lastScanTime.current < 2000) {
      return;
    }

    lastScannedCode.current = data;
    lastScanTime.current = now;

    const product = getProductByQr(data);
    if (product) {
      Vibration.vibrate();
      addToCart(product);
      setLastScanned(product);
      // Wait a bit before navigating to Cart, or just show notification?
      // Navigation immediately might be jarring with imperative scanner.
      // But let's follow logic:
      navigation.navigate('Cart');
    } else {
       Vibration.vibrate([0, 200, 100, 200]); // Error pattern
    }
  };

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={{marginBottom: 10}}>Cần quyền Camera để bán hàng</Text>
        <Button mode="contained" onPress={checkPermission}>Cấp quyền</Button>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text>Đang kiểm tra quyền...</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView style={StyleSheet.absoluteFill} />
      )}


      {/* Overlay for Last Scanned Item */}
      {lastScanned && (
        <Card style={styles.lastItemCard}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: 'green' }}>Đã thêm: {lastScanned.name}</Text>
            <Text variant="bodyMedium">{lastScanned.price.toLocaleString('vi-VN')} đ</Text>
          </Card.Content>
        </Card>
      )}

      {/* Logout Button */}
      <IconButton
        icon="logout"
        iconColor="white"
        containerColor="rgba(0,0,0,0.5)"
        size={24}
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', onPress: logout }
          ]);
        }}
      />

       {/* Bottom Control Bar */}
       <View style={styles.bottomBar}>
          <View style={styles.cartInfo}>
             <Text variant="titleMedium" style={{color: '#fff', opacity: 0.9}}>{totalItems} sản phẩm</Text>
             <Text variant="headlineSmall" style={{color: '#fff', fontWeight: 'bold'}}>
                {totalAmount.toLocaleString('vi-VN')} đ
             </Text>
          </View>

          <Button 
            mode="contained" 
            icon="arrow-right"
            contentStyle={{flexDirection: 'row-reverse', height: 48}} 
            style={[styles.payButton, clayStyles.fab]}
            buttonColor={AppTheme.colors.tertiary}
            textColor="white"
            onPress={() => navigation.navigate('Cart')}
          >
            Thanh toán
          </Button>
       </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastItemCard: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    ...clayStyles.card,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Override opacity
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0, 
    right: 0,
    backgroundColor: AppTheme.colors.secondary, // Goku sash blue
    borderTopLeftRadius: 0, // Sharp corners for bottom bar? Or match roundness?
    borderTopRightRadius: 0,
    padding: 20,
    paddingBottom: 30, // Safe area
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 20,
    borderTopWidth: 4,
    borderTopColor: AppTheme.colors.primary, // Orange top border
  },
  cartInfo: {
    justifyContent: 'center',
  },
  payButton: {
    borderRadius: 50, // Capsule like
    paddingHorizontal: 16,
    backgroundColor: AppTheme.colors.primary, // Orange button
    borderWidth: 2,
    borderColor: '#FFF',
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    margin: 0,
  },
});

export default PosScreen;
