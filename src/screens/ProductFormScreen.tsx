import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useProducts } from '../contexts/ProductContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CameraView, BarcodeScanner, BarcodeResult } from '@pushpendersingh/react-native-scanner';
import * as ImagePicker from 'expo-image-picker';

type ParamList = {
  ProductForm: { productId?: string; scanFirst?: boolean };
};

const ProductFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'ProductForm'>>();
  const { products, addProduct, updateProduct, getProductByQr } = useProducts();

  const [activeProductId, setActiveProductId] = useState<string | undefined>(route.params?.productId);
  const isEditMode = !!activeProductId;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // Initial load
  useEffect(() => {
    if (route.params?.scanFirst) {
        startScanningProcess();
    }
  }, [route.params?.scanFirst]);

  useEffect(() => {
    if (activeProductId) {
      const product = products.find((p) => p.id === activeProductId);
      if (product) {
        setName(product.name);
        setPrice(product.price.toString());
        setQrCode(product.qrCode);
        setImageUri(product.imageUri);
      }
    }
  }, [activeProductId, products]);

  // Clean up on unmount or when scanning stops
  useEffect(() => {
    return () => {
        BarcodeScanner.stopScanning();
        BarcodeScanner.releaseCamera();
    };
  }, []);

  const handleSave = async () => {
    if (!name || !price || !qrCode) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Tên, Giá và Mã QR');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
       Alert.alert('Lỗi', 'Giá không hợp lệ');
       return;
    }

    try {
      if (isEditMode && activeProductId) {
        await updateProduct({
          id: activeProductId,
          name,
          price: priceValue,
          qrCode,
          imageUri,
        });
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm');
      } else {
        await addProduct({
          name,
          price: priceValue,
          qrCode,
          imageUri,
        });
        Alert.alert('Thành công', 'Đã thêm sản phẩm mới');
      }
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lưu');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần cấp quyền Camera để chụp ảnh');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onBarcodeDetected = (barcodes: BarcodeResult[]) => {
      if (barcodes && barcodes.length > 0) {
          const data = barcodes[0].data;
          stopScanningProcess();
          handleBarCodeScanned(data);
      }
  };

  const startScanningProcess = async () => {
      const granted = await BarcodeScanner.requestCameraPermission();
      if (!granted) {
          Alert.alert('Lỗi', 'Cần cấp quyền camera để quét mã');
          return;
      }
      setIsScanning(true);
      await BarcodeScanner.startScanning(onBarcodeDetected);
  };

  const stopScanningProcess = async () => {
      await BarcodeScanner.stopScanning();
      setIsScanning(false);
      setTorchOn(false);
  };

  const toggleTorch = async () => {
      try {
          if (torchOn) {
              await BarcodeScanner.disableFlashlight();
              setTorchOn(false);
          } else {
              await BarcodeScanner.enableFlashlight();
              setTorchOn(true);
          }
      } catch (e) {
          console.error("Torch error", e);
      }
  };

  const handleBarCodeScanned = (data: string) => {
    // Check if product exists
    const existingProduct = getProductByQr(data);
    
    if (existingProduct) {
       // Switch to Edit Mode
       setActiveProductId(existingProduct.id);
    } else {
       // New Product
       setActiveProductId(undefined);
       setQrCode(data);
       setName('');
       setPrice('');
       setImageUri(undefined);
    }
  };

  if (isScanning) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <CameraView style={StyleSheet.absoluteFill} />
        
        <View style={styles.scanControls}>
            <Button 
                mode="contained" 
                onPress={toggleTorch}
                style={{marginBottom: 10, backgroundColor: 'rgba(0,0,0,0.5)'}}
            >
                {torchOn ? 'Tắt Đèn' : 'Bật Đèn'}
            </Button>
            <Button 
                mode="contained" 
                style={styles.cancelScanButton} 
                onPress={stopScanningProcess}
            >
                Hủy Quét
            </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text variant="headlineSmall" style={styles.title}>
          {isEditMode ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}
        </Text>

        <TextInput
          label="Tên sản phẩm"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        
        <TextInput
          label="Giá tiền (VNĐ)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />

        <View style={styles.qrContainer}>
          <TextInput
            label="Mã QR / Barcode"
            value={qrCode}
            onChangeText={setQrCode}
            style={[styles.input, { flex: 1 }]}
          />
          <Button 
            icon="qrcode-scan" 
            mode="outlined" 
            onPress={startScanningProcess}
            style={styles.scanButton}
          >
            Quét
          </Button>
        </View>

        <View style={styles.imageButtonsContainer}>
          <Button mode="outlined" icon="camera" onPress={handleTakePhoto} style={styles.flexBtn}>
            Chụp Ảnh
          </Button>
          <View style={{width: 10}} />
          <Button mode="outlined" icon="image" onPress={handlePickImage} style={styles.flexBtn}>
            Thư Viện
          </Button>
        </View>
        
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        )}

        <Button 
          mode="contained" 
          onPress={handleSave} 
          style={styles.saveButton}
          contentStyle={{ height: 50 }}
        >
          {isEditMode ? 'Cập Nhật' : 'Lưu Sản Phẩm'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  form: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  qrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanButton: {
    marginLeft: 10,
    marginTop: 6, // Align visually with input
    height: 50,
    justifyContent: 'center',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  flexBtn: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  saveButton: {
    marginTop: 10,
  },
  scanControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cancelScanButton: {
    backgroundColor: 'red',
  },
});

export default ProductFormScreen;
