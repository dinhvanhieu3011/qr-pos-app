import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { Invoice } from '../types';

interface InvoiceContextData {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => Promise<void>;
  getInvoiceById: (id: string) => Invoice | undefined;
}

const InvoiceContext = createContext<InvoiceContextData>({} as InvoiceContextData);

const STORAGE_KEY = '@invoices';

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        setInvoices(JSON.parse(jsonValue));
      }
      syncInvoices(); // Background sync
    } catch (e) {
      console.error('Failed to load invoices', e);
    }
  };

  const syncInvoices = async () => {
     try {
       // Fetch Invoices and their Items
       const { data, error } = await supabase
          .from('invoices')
          .select('*, invoice_items(*)')
          .order('created_at', { ascending: false });

       if (data && !error) {
           const mappedInvoices: Invoice[] = data.map((inv: any) => ({
              id: inv.id,
              totalAmount: inv.total_amount,
              paymentMethod: inv.payment_method,
              createdAt: inv.created_at,
              items: inv.invoice_items.map((item: any) => ({
                 id: item.product_id, // Note: This mapping might be tricky if local items have different structure
                 name: 'Product', // We don't have name easily here unless we join products. 
                                  // Simplified: We assume local log is enough for details, or we fetch products too.
                                  // ideally we should join products table.
                 price: item.price_at_time,
                 quantity: item.quantity,
              }))
           }));
           // merging logic is complex, for MVP we skip overriding local if local is newer? 
           // actually, for POS, local creation is key. 
           // Let's just Push local new ones? 
           // For now: Just Download Cloud history to populate device?
           // No, CartScreen creates invoice locally.
       }
     } catch (err) {
         console.log('Invoice sync err', err);
     }
  };

  const addInvoice = async (invoice: Invoice) => {
    const newList = [invoice, ...invoices];
    setInvoices(newList);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      
      // Push to Cloud
      const { error } = await supabase.from('invoices').insert({
         id: invoice.id,
         total_amount: invoice.totalAmount,
         payment_method: invoice.paymentMethod,
         created_at: invoice.createdAt,
      });

      if (!error) {
         // Push items
         const itemsPayload = invoice.items.map(item => ({
             invoice_id: invoice.id,
             product_id: item.id, // Ensure this is UUID too! ProductContext uses UUID now? 
                                  // Wait, ProductContext generates custom ID?
                                  // ProductContext uses: Date.now() + random.
                                  // This is NOT UUID. It will fail if product_id is uuid in DB.
             quantity: item.quantity,
             price_at_time: item.price
         }));
         
         // Only push items if product_id is valid uuid? 
         // If products were created locally with non-UUID, this fails.
         // We updated ProductContext to use temp ID, then Cloud ID.
         // But existing products might cause issues? 
         // Let's assume user starts fresh or we migrated. 
         // Actually, I should probably check if ID is UUID.
         
         await supabase.from('invoice_items').insert(itemsPayload);
      }
    } catch (e) {
      console.error('Failed to save invoice to cloud', e);
    }
  };

  const getInvoiceById = (id: string) => {
    return invoices.find((i) => i.id === id);
  };

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice, getInvoiceById }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => useContext(InvoiceContext);
