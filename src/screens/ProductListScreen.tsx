import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { FAB, Searchbar, Text, IconButton, Chip } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProducts } from '../contexts/ProductContext';
import { Product } from '../types';
import { useNavigation } from '@react-navigation/native';
import { AppTheme, dragonBallStyles } from '../theme';
import Container from '../components/Container';

const placeholderImage = require('../assets/dragonball/icon_4star.png');

const ProductListScreen = () => {
  const { products, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.qrCode.includes(searchQuery)
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      'Xóa sản phẩm',
      'Bạn có chắc muốn xóa sản phẩm này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => deleteProduct(id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={[dragonBallStyles.card, styles.cardContainer]}>
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProductForm', { productId: item.id })}
        style={styles.touchable}
      >
        <View style={styles.imageContainer}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.cardCover} />
          ) : (
            <View style={styles.placeholderCover}>
               <Image source={placeholderImage} style={{width: 60, height: 60, opacity: 0.8}} />
            </View>
          )}
           {/* Floating Action Buttons */}
          <View style={styles.actionContainer}>
            <IconButton 
                icon="pencil" 
                mode="contained" 
                containerColor={AppTheme.colors.surfaceVariant}
                iconColor={AppTheme.colors.primary}
                size={18} 
                onPress={() => navigation.navigate('ProductForm', { productId: item.id })} 
              />
            <IconButton 
                icon="delete" 
                mode="contained" 
                containerColor="#FFEBEE" 
                iconColor={AppTheme.colors.error}
                size={18} 
                onPress={() => handleDelete(item.id)} 
              />
          </View>
        </View>

        <View style={styles.cardContent}>
            <View>
              <Text variant="titleMedium" style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text variant="bodySmall" style={styles.productCode}>#{item.qrCode}</Text>
            </View>
            <Chip style={[dragonBallStyles.chip, styles.priceChip]} textStyle={{ color: '#E65100', fontWeight: 'bold' }}>
              {item.price.toLocaleString('vi-VN')} đ
            </Chip>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <Container style={{ paddingTop: insets.top }}>
      <Searchbar
        placeholder="Tìm kiếm năng lượng..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={{ color: '#BF360C' }}
        iconColor={AppTheme.colors.primary}
      />
      
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={placeholderImage} style={{width: 100, height: 100, opacity: 0.5, marginBottom: 16}} />
          <Text variant="bodyLarge" style={{color: '#E65100', fontWeight: 'bold'}}>Kho trống rỗng!</Text>
          <Text variant="bodyMedium" style={{ color: '#FF9800', marginTop: 8 }}>Thu thập sản phẩm ngay</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{height: 20}} />}
        />
      )}
      
      <FAB
        style={[styles.fab, dragonBallStyles.fab]}
        icon="plus"
        color="white"
        label="THÊM MỚI"
        onPress={() => navigation.navigate('ProductForm', { scanFirst: true })}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  searchbar: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  cardContainer: {
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  cardCover: {
    height: 160,
    width: '100%',
    borderTopLeftRadius: 14, // Slightly less than card border radius to fit inside border
    borderTopRightRadius: 14,
  },
  placeholderCover: {
    height: 120,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  productName: {
    fontWeight: '900', // Ultra Bold for Anime feel
    color: '#E65100',
    marginBottom: 4,
    maxWidth: 150,
    textTransform: 'uppercase',
  },
  productCode: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  priceChip: {
    // Overridden by dragonBallStyles
  },
  actionContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100
  },
});

export default ProductListScreen;
