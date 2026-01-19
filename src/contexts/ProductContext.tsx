import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../services/supabase';
import { Product } from '../types';

interface ProductContextData {
  products: Product[];
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductByQr: (qrCode: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextData>({} as ProductContextData);

const STORAGE_KEY = '@products';

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // 1. Load from Local First (Instant UI)
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        setProducts(JSON.parse(jsonValue));
      }
      
      // 2. Sync with Cloud (Background)
      syncProducts();
    } catch (e) {
      console.error('Failed to load products', e);
    }
  };

  const syncProducts = async () => {
    try {
       const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
       if (!error && data) {
          // Merge logic could be here, but for now Cloud is truth for list
          // Map Supabase fields to App fields if needed (e.g. snake_case to camelCase)
          const mappedProducts: Product[] = data.map((p: any) => ({
             id: p.id,
             name: p.name,
             price: p.price,
             qrCode: p.qr_code,
             imageUri: p.image_url,
          }));
          
          setProducts(mappedProducts);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mappedProducts));
       }
    } catch (err) {
       console.log('Sync error:', err);
    }
  };

  const saveProducts = async (newProducts: Product[]) => {
    try {
      const jsonValue = JSON.stringify(newProducts);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      setProducts(newProducts);
    } catch (e) {
      console.error('Failed to save products', e);
    }
  };

  // Helper to upload image to Supabase
  // Helper to upload image to Supabase
  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      if (!uri) return null;
      if (uri.startsWith('http')) return uri; // Already uploaded

      // Use FileSystem to read file as Base64, then decode to ArrayBuffer
      // This avoids 0-byte issues with fetch().blob() in React Native
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      const arrayBuffer = decode(base64);

      const filename = `product-${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from('products')
        .upload(filename, arrayBuffer, {
           contentType: 'image/jpeg',
           upsert: false
        });

      if (error) {
         console.error('Upload failed', error);
         return null;
      }

      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filename);
      return publicUrl;
    } catch (e) {
      console.error('Image upload error', e);
      return null;
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    // 1. Optimistic Update (Local)
    const tempId = Crypto.randomUUID();
    const newProduct: Product = { ...productData, id: tempId };
    const newList = [newProduct, ...products];
    await saveProducts(newList);

    // 2. Upload Image & Save to Cloud
    try {
       const publicImageUrl = await uploadImage(productData.imageUri || '');
       
       const { data, error } = await supabase.from('products').insert({
          name: productData.name,
          price: productData.price,
          qr_code: productData.qrCode,
          image_url: publicImageUrl || productData.imageUri, // Use public URL if uploaded, else local (fallback)
       }).select().single();

       if (data && !error) {
          // Replace temp ID with real ID (if we wanted to switch to DB ID, but we use UUID now)
          // Actually if we use UUID locally, we should probably set the ID in insert?
          // Let's stick to using the DB Generated ID for truth, OR force our UUID.
          // IF we use gen_random_uuid(), DB makes it.
          // Let's UPDATE the local product with the DB ID + Public Image URL
          const realProduct = { 
             id: data.id, 
             name: data.name, 
             price: data.price, 
             qrCode: data.qr_code, 
             imageUri: data.image_url 
          };
          const updatedList = newList.map(p => p.id === tempId ? realProduct : p);
          await saveProducts(updatedList);
       }
    } catch (err) {
       console.error('Cloud add failed', err);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    // 1. Local Update
    const newList = products.map((p) => p.id === updatedProduct.id ? updatedProduct : p);
    await saveProducts(newList);

    // 2. Cloud Update
    try {
       const publicImageUrl = await uploadImage(updatedProduct.imageUri || '');
       
       await supabase.from('products').update({
          name: updatedProduct.name,
          price: updatedProduct.price,
          qr_code: updatedProduct.qrCode,
          image_url: publicImageUrl || updatedProduct.imageUri,
       }).eq('id', updatedProduct.id);
    } catch (err) {
       console.error('Cloud update failed', err);
    }
  };

  const deleteProduct = async (id: string) => {
    // 1. Local Delete
    const newList = products.filter((p) => p.id !== id);
    await saveProducts(newList);

    // 2. Cloud Delete
    try {
       await supabase.from('products').delete().eq('id', id);
    } catch (err) {
       console.error('Cloud delete failed', err);
    }
  };

  const getProductByQr = (qrCode: string) => {
    return products.find((p) => p.qrCode === qrCode);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        refreshProducts: loadProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductByQr,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
