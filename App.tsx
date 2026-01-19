import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AppTheme } from './src/theme';

import { ProductProvider } from './src/contexts/ProductContext';
import { CartProvider } from './src/contexts/CartContext';
import { InvoiceProvider } from './src/contexts/InvoiceContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={AppTheme}>
        <ProductProvider>
          <InvoiceProvider>
            <CartProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </CartProvider>
          </InvoiceProvider>
        </ProductProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
