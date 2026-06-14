export interface PromoCode {
  id: string;
  code: string;
  amount: number;
  minOrder: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetPromoCodesResponse {
  message: string;
  data: PromoCode[];
}
export interface GetPromoCodeResponse {
  message: string;
  data: PromoCode;
}
