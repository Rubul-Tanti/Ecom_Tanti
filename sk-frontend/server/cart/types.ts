export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  deliveryCharge:number;
  size: string;
  productImageUrl: string;
  productName: string;
  ProductColorName: string;
  Price: number;
  productVariantId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type GetCartResponse = {
  message: string;
  data: CartItem[];
};