export interface Product {
    id: string;
    qrCode: string; // The barcode/QR data
    name: string;
    price: number;
    imageUri?: string; // Local file URI
    description?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Invoice {
    id: string;
    createdAt: string; // ISO string
    items: CartItem[];
    totalAmount: number;
    paymentMethod: 'cash' | 'transfer' | 'other';
}
