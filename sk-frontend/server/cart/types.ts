export type CartResponse = {
  message: string;
  data: CartItem[];
};

export type CartItem = {
  id: string;
  orderId: string | null;
  productId: string;
  quantity: number;
  size: string;
  productVariantId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
  productVariant: ProductVariant;
};

export type Product = {
  id: string;
  name: string;
};

export type ProductVariant = {
  id: string;
  finalPrice: number;
  color: string;
  colorName: string;
  deliveryCharge: number;
  images: ProductImage[];
};

export type ProductImage = {
  url: string;
};