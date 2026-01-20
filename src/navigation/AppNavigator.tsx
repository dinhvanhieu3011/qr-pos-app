import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

import PosScreen from '../screens/PosScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import CartScreen from '../screens/CartScreen';
import InvoiceHistoryScreen from '../screens/InvoiceHistoryScreen';
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen';
import LoginScreen from '../screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Hóa đơn"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'POS') iconName = 'barcode-scan';
          else if (route.name === 'Sản phẩm') iconName = 'cube-outline';
          else if (route.name === 'Hóa đơn') iconName = 'receipt';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="POS" component={PosScreen} options={{ title: 'Bán Hàng (POS)' }} />
      <Tab.Screen name="Sản phẩm" component={ProductListScreen} />
      <Tab.Screen name="Hóa đơn" component={InvoiceHistoryScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
      ) : (
        <>
          <Stack.Screen 
            name="Main" 
            component={TabNavigator} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ProductForm" 
            component={ProductFormScreen} 
            options={{ title: 'Thông tin sản phẩm' }}
          />
          <Stack.Screen 
            name="Cart" 
            component={CartScreen} 
            options={{ title: 'Giỏ hàng' }} 
          />
          <Stack.Screen 
            name="InvoiceDetail" 
            component={InvoiceDetailScreen} 
            options={{ title: 'Chi tiết hóa đơn' }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
