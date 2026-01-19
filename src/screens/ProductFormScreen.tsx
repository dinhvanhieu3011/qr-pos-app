import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Keyboard, ScrollView, Alert, Modal } from 'react-native';
import { TextInput, Button, Text, HelperText, Appbar } from 'react-native-paper';
import { useProducts } from '../contexts/ProductContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
  
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);

  // Initial load
  useEffect(() => {
    if (route.params?.scanFirst) {
      setIsScanning(true);
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

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setIsScanning(false);
    
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
    if (!permission) {
      // Camera permissions are still loading
      return <View />;
    }

    if (!permission.granted) {
       return (
        <View style={styles.permissionContainer}>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>Cần cấp quyền Camera để quét mã</Text>
          <Button mode="contained" onPress={requestPermission}>Cấp quyền</Button>
          <Button style={{marginTop: 20}} onPress={() => setIsScanning(false)}>Hủy</Button>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
             barcodeTypes: ["qr", "ean13", "ean8", "pdf417", "upc_e", "code128"],
          }}

        />
        <Button 
          mode="contained" 
          style={styles.cancelScanButton} 
          onPress={() => setIsScanning(false)}
        >
          Hủy Quét
        </Button>
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
            onPress={() => setIsScanning(true)}
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
  cancelScanButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'red',
  },
});

export default ProductFormScreen;
