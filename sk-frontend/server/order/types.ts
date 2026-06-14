export type OrderPayload = {
  addressId: string;
  promoCodeId: string | undefined;
  item: {
    productId: string;
    variantId: string;
    size: string;
    quantity: number;
  }[];
};
export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface ProductImage {
  url: string;
}

export interface Product {
  name: string;
  description: string;
}

export interface ProductVariant {
  images: ProductImage[];
  finalPrice: number;
  deliveryCharge: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productVariantId: string;
  size: string;
  quantity: number;
  createdAt: string;
  orderId: string;
  product: Product;
  productVariant: ProductVariant;
}

export interface Order {
  id: string;
  status: OrderStatus;
  currency: string;
  razorPayPaymentId: string;
  razorPayOrderId: string;
  razorPayPaymentSignature: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  userId: string;
  addressId: string;
  totalAmount: number;
  notes: string | null;
  promoCodeId: string | null;
  placedAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface GetOrdersResponse {
  message: string;
  orders: Order[];
}