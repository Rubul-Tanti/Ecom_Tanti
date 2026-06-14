'use client'
import { useUserContext } from '@/contextProvider';
import useUser from '@/hooks/use_user';
import { Address } from '@/server/user/type';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import usePromocode from '@/hooks/use-promoCode';
import { handleGetPromocode } from '@/server/promoCodes';
import { PromoCode } from '@/server/promoCodes/types';
import { LocationEdit, Trash2, Minus, Plus } from 'lucide-react';
import useOrder, { RazorpayPaymentResponse } from '@/hooks/use_order';

interface ProductImage {
  url: string;
}

interface ProductVariant {
  id: string;
  finalPrice: number;
  color: string;
  colorName: string;
  deliveryCharge: number;
  images: ProductImage[];
}

interface Product {
  id: string;
  name: string;
}

interface CartItem {
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
}

interface DisplayCartItem {
  id: string;
  productName: string;
  colorName: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
  deliveryCharge: number;
    productId:string,
  variantId: string,
}

const CheckoutComponent = () => {
  const { orderItems } = useUserContext();
  const router = useRouter();
const loadRazorPayScript = (src: string) => {
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");

    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

useEffect(() => {
  loadRazorPayScript(
    "https://checkout.razorpay.com/v1/checkout.js"
  );
}, []);
  // State
  const [displayCartItems, setDisplayCartItems] = useState<DisplayCartItem[]>([]);
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [promoError, setPromoError] = useState('');
  const [promoCodeLoading,setPromoCodeLoading]=useState(false)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const {createOrder,orderPaid}=useOrder()
  // Hooks
  const { getUser } = useUser();
  const { data: userData, isLoading: isUserLoading } = getUser();

  // Initialize cart items
  useEffect(() => {
    if (orderItems.length === 0) {
      router.replace('/');
    } else {
      const transformed: DisplayCartItem[] = orderItems.map((item: CartItem) => ({
        productId:item.productId,
        variantId:item.productVariantId,
        id: item.id,
        productName: item.product.name,
        colorName: item.productVariant.colorName,
        price: item.productVariant.finalPrice,
        quantity: item.quantity,
        image: item.productVariant.images[0]?.url || '',
        size: item.size,
        deliveryCharge: item.productVariant.deliveryCharge,
      }));
      setDisplayCartItems(transformed);
    }
  }, [orderItems, router]);

  // Load user addresses
  useEffect(() => {
    if (userData && !isUserLoading) {
      setAddresses(userData?.data?.addresses || []);
    }
  }, [userData, isUserLoading]);

  // Calculations
  const subtotal = displayCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalDeliveryCharge = displayCartItems.reduce(
    (sum, item) => sum + item.deliveryCharge * item.quantity,
    0
  );

  const discount = promoCode?.amount || 0;
  const total = subtotal - discount + totalDeliveryCharge;

  // Handlers
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');

    try {
      setPromoCodeLoading(true)
      const response = await handleGetPromocode(promoInput);
      if (response?.data?.amount) {
        setPromoCode(response.data);
        setPromoInput('');
        setShowPromoInput(false);

      } else {
        setPromoError('Invalid promo code');
      }
    } catch (error) {
      setPromoError('Invalid promo code');
    } finally {
      setIsApplyingPromo(false);
      setPromoCodeLoading(false)
    }
  };

  const handleRemovePromo = () => {
    setPromoCode(null);
    setPromoInput('');
    setShowPromoInput(false);
    setPromoError('');
  };

  const handleRemoveItem = (itemId: string) => {
    setDisplayCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setDisplayCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };


  const handleCheckout = async () => {
    if (!addresses.length) {
      alert('Please add a delivery address');
      router.push('/profile');
      return;
    }

    const data={
       addressId:addresses[selectedAddressIndex].id
      ,promoCodeId:promoCode?.id,
      item:displayCartItems.map((item)=>{ return {productId:item.productId,variantId:item.variantId,size:item.size,quantity:item.quantity}})
    }
    createOrder.mutate(data,{onSuccess:(v)=>{
      const options = {
  key:process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  order_id:v.data.razorPayOrderId,
  amount:v.data.totalAmount*100,
  currency:v.data.currency,
        name: "Ecom Order Placed",
         handler: async (response:RazorpayPaymentResponse) => {
          console.log(response)
          orderPaid.mutate({orderId:v.data.id,data:response},{onSuccess:()=>{
            router.push("/")
          }})
      },
};
const razorpay = new window.Razorpay(options);
    razorpay.open();
    },onError:()=>{}})
    console.log('Checkout data:',data);
  };

  if (orderItems.length === 0) return null;

  return (
    <>
      <style>{responsiveStyles}</style>
      <div className="checkout-container">
        <h1 className="checkout-heading">Checkout</h1>

        <div className="checkout-main">
          {/* Left Column */}
          <div className="checkout-left">
            {/* Delivery Address Section */}
            <section className="checkout-section">
              <div className="section-header">
                <h2 className="section-title">
                  <LocationEdit size={16} style={{ marginRight: '8px' }} />
                  Delivery Address
                </h2>
                {addresses.length === 0 ? (
                  <Button onClick={() => router.push('/profile')}>Add Address</Button>
                ) : (
                  <button
                    className="edit-btn"
                    onClick={() => router.push('/profile')}
                  >
                    Edit
                  </button>
                )}
              </div>

              {isUserLoading ? (
                <AddressSkeleton />
              ) : addresses.length === 0 ? (
                <div className="empty-state">
                  <p>No address found. Please add one to proceed.</p>
                </div>
              ) : (
                <>
                  <div className="address-selector">
                    {addresses.map((address, index) => (
                      <label key={index} className="address-radio">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressIndex === index}
                          onChange={() => setSelectedAddressIndex(index)}
                          style={{ marginRight: '12px', cursor: 'pointer' }}
                        />
                        <div className="address-content">
                          <div className="address-name">{address.label}</div>
                          <div className="address-details">
                            <p>{address.phone}</p>
                            <p>{address.line1}</p>
                            <p>
                              {address.district}, {address.state} {address.pincode}
                            </p>
                          </div>
                          {address.isDefault && (
                            <span className="default-badge">Default</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Order Items Section */}
            <section className="checkout-section">
              <h2 className="section-title">
                🛒 Order Items ({displayCartItems.length})
              </h2>

              {displayCartItems.length === 0 ? (
                <div className="empty-state">
                  <p>No items in cart</p>
                </div>
              ) : (
                <div className="items-list">
                  {displayCartItems.map(item => (
                    <div key={item.id} className="cart-item-card">
                      {/* Product Image */}
                      <div className="item-image-container">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="item-image"
                          />
                        ) : (
                          <div className="item-image-placeholder">📦</div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="item-details">
                        <h3 className="item-name">{item.productName}</h3>
                        <p className="item-meta">Color: {item.colorName}</p>
                        <p className="item-meta">Size: {item.size}</p>
                        <p className="item-price">₹{item.price}</p>
                      </div>

                      {/* Quantity Control */}
                      <div className="quantity-control">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="quantity-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="quantity-text">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="quantity-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="item-total">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="remove-btn"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Summary */}
          <aside className="checkout-right">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {promoCode && (
                <div className="summary-row" style={{ color: '#22c55e' }}>
                  <span>Discount</span>
                  <span>−₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Delivery Charges</span>
                <span>₹{totalDeliveryCharge.toFixed(2)}</span>
              </div>

              <div className="divider" />

              <div className="total-row">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              {/* Promo Code Section */}
              <section className="checkout-section" style={{ marginTop: '16px' }}>
                {!promoCode ? (
                  <>
                    {!showPromoInput ? (
                      <button
                        className="show-promo-btn"
                        onClick={() => setShowPromoInput(true)}
                      >
                        + Have a promo code?
                      </button>
                    ) : (
                      <>
                        <div className="promo-container">
                          <input
                            type="text"
                            placeholder="Enter promo code"
                            value={promoInput}
                            onChange={e =>
                              setPromoInput(e.target.value.toUpperCase())
                            }
                            className="promo-input"
                            disabled={isApplyingPromo}
                          />
                          <button
                            onClick={handleApplyPromo}
                            className="apply-btn"
                            disabled={isApplyingPromo || !promoInput.trim()}
                          >
                            {isApplyingPromo ? 'Applying...' : 'Apply'}
                          </button>
                        </div>
                        {promoError && (
                          <p className="error-text">{promoError}</p>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="promo-success-card">
                    <p className="success-text">
                      ✓ {promoCode.code} applied
                    </p>
                    <button
                      onClick={handleRemovePromo}
                      className="remove-promo-btn"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </section>

              <button

                onClick={handleCheckout}
                className="checkout-btn"
                disabled={displayCartItems.length === 0 || addresses.length === 0||createOrder.isPending||promoCodeLoading}
              >
                Proceed to Payment
              </button>

              <p className="secure-text">🔒 Secure payment with Razorpay</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

// Skeleton loader component
const AddressSkeleton = () => (
  <div className="skeleton">
    <div className="skeleton-line" />
    <div className="skeleton-line" style={{ width: '60%' }} />
    <div className="skeleton-line" style={{ width: '90%', marginTop: '8px' }} />
    <div className="skeleton-line" style={{ width: '75%' }} />
  </div>
);

const responsiveStyles = `
  .checkout-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9fafb;
    min-height: 100vh;
  }
  .checkout-heading {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 30px;
    color: #1f2937;
  }
  .checkout-main {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
  }
  .checkout-left {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .checkout-right {
    height: fit-content;
    position: sticky;
    top: 20px;
  }
  .checkout-section {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
    display: flex;
    align-items: center;
  }
  .edit-btn {
    padding: 6px 12px;
    background-color: #e5e7eb;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  .edit-btn:hover {
    background-color: #d1d5db;
  }
  .address-selector {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .address-radio {
    display: flex;
    padding: 12px;
    background-color: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s;
  }
  .address-radio:hover {
    border-color: #3b82f6;
  }
  .address-content {
    flex: 1;
  }
  .address-name {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1f2937;
  }
  .address-details {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
    margin: 0;
  }
  .address-details p {
    margin: 0;
  }
  .default-badge {
    display: inline-block;
    background-color: #dbeafe;
    color: #1e40af;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    margin-top: 8px;
  }
  .empty-state {
    padding: 20px;
    text-align: center;
    color: #6b7280;
  }
  .items-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .cart-item-card {
    display: grid;
    grid-template-columns: 80px 1fr 120px 100px 50px;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background-color: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }
  .item-image-container {
    width: 80px;
    height: 80px;
    background-color: white;
    border-radius: 6px;
    overflow: hidden;
  }
  .item-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .item-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }
  .item-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .item-name {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item-meta {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }
  .item-price {
    font-size: 14px;
    font-weight: 600;
    color: #059669;
    margin: 0;
  }
  .quantity-control {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }
  .quantity-btn {
    width: 28px;
    height: 28px;
    border: 1px solid #e5e7eb;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .quantity-btn:hover {
    background-color: #f3f4f6;
  }
  .quantity-btn:active {
    transform: scale(0.95);
  }
  .quantity-text {
    font-size: 14px;
    font-weight: 600;
    min-width: 30px;
    text-align: center;
  }
  .item-total {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    text-align: right;
  }
  .remove-btn {
    width: 28px;
    height: 28px;
    border: 1px solid #fecaca;
    background-color: #fee2e2;
    color: #991b1b;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .remove-btn:hover {
    background-color: #fecaca;
  }
  .summary-card {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .summary-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1f2937;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding-bottom: 12px;
    padding-top: 12px;
    font-size: 14px;
    color: #6b7280;
  }
  .divider {
    height: 1px;
    background-color: #e5e7eb;
    margin: 12px 0;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
    padding-top: 12px;
  }
  .show-promo-btn {
    background: none;
    color: #0d9488;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    padding: 0;
    text-align: left;
  }
  .show-promo-btn:hover {
    text-decoration: underline;
  }
  .promo-container {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  .promo-input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    outline: none;
    font-size: 14px;
    background-color: #fff;
    color: #000;
    transition: border-color 0.2s;
  }
  .promo-input:focus {
    border-color: #3b82f6;
  }
  .apply-btn {
    padding: 10px 18px;
    background: #000;
    color: #fff;
    border: 1px solid #000;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }
  .apply-btn:hover:not(:disabled) {
    background: #374151;
  }
  .apply-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .promo-success-card {
    padding: 12px;
    background-color: #f0fdf4;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .success-text {
    margin: 0;
    color: #166534;
    font-size: 14px;
    font-weight: 500;
  }
  .error-text {
    margin: 8px 0 0 0;
    color: #991b1b;
    font-size: 13px;
  }
  .remove-promo-btn {
    padding: 4px 8px;
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
  }
  .remove-promo-btn:hover {
    background-color: #fecaca;
  }
  .checkout-btn {
    width: 100%;
    padding: 12px;
    margin-top: 16px;
    background-color: #059669;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .checkout-btn:hover:not(:disabled) {
    background-color: #047857;
  }
  .checkout-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .secure-text {
    text-align: center;
    font-size: 12px;
    color: #6b7280;
    margin: 12px 0 0 0;
  }
  .skeleton {
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }
  .skeleton-line {
    width: 100%;
    height: 16px;
    background: #e5e5e5;
    border-radius: 4px;
    margin-bottom: 12px;
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ======================== */
  /* RESPONSIVE BREAKPOINTS   */
  /* ======================== */

  /* Tablet: 768px - 1023px */
  @media (max-width: 1023px) {
    .checkout-main {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    .checkout-right {
      position: static;
      order: -1;
    }
    .summary-card {
      margin-bottom: 0;
    }
    .cart-item-card {
      grid-template-columns: 80px 1fr 120px 80px 50px;
    }
  }

  /* Mobile: below 768px */
  @media (max-width: 767px) {
    .checkout-container {
      padding: 12px;
    }
    .checkout-heading {
      font-size: 22px;
      margin-bottom: 20px;
    }
    .checkout-section {
      padding: 14px;
    }
    .section-title {
      font-size: 16px;
    }
    .cart-item-card {
      grid-template-columns: 70px 1fr auto;
      grid-template-rows: auto auto;
      gap: 8px;
      padding: 10px;
    }
    .item-image-container {
      width: 70px;
      height: 70px;
      grid-row: 1 / 3;
    }
    .item-details {
      grid-column: 2;
      grid-row: 1;
    }
    .item-name {
      font-size: 13px;
      white-space: normal;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .quantity-control {
      grid-column: 2;
      grid-row: 2;
      justify-content: flex-start;
    }
    .quantity-btn {
      width: 32px;
      height: 32px;
    }
    .quantity-text {
      min-width: 36px;
      font-size: 15px;
    }
    .item-total {
      grid-column: 3;
      grid-row: 1;
      font-size: 15px;
      font-weight: 700;
      color: #059669;
    }
    .remove-btn {
      grid-column: 3;
      grid-row: 2;
      width: 32px;
      height: 32px;
      justify-self: end;
    }
    .address-radio {
      padding: 10px;
    }
    .address-name {
      font-size: 14px;
    }
    .address-details {
      font-size: 12px;
    }
    .summary-title {
      font-size: 16px;
    }
    .summary-row {
      font-size: 13px;
    }
    .total-row {
      font-size: 15px;
    }
    .checkout-btn {
      font-size: 15px;
      padding: 14px;
    }
    .promo-container {
      flex-direction: column;
      gap: 8px;
    }
    .apply-btn {
      width: 100%;
      padding: 12px;
    }
  }

  /* Small mobile: below 480px */
  @media (max-width: 479px) {
    .checkout-container {
      padding: 8px;
    }
    .checkout-heading {
      font-size: 20px;
      margin-bottom: 16px;
    }
    .checkout-section {
      padding: 12px;
      border-radius: 6px;
    }
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    .cart-item-card {
      grid-template-columns: 60px 1fr auto;
      gap: 6px;
      padding: 8px;
    }
    .item-image-container {
      width: 60px;
      height: 60px;
    }
    .item-name {
      font-size: 12px;
    }
    .item-meta {
      font-size: 11px;
    }
    .item-price {
      font-size: 12px;
    }
    .quantity-btn {
      width: 28px;
      height: 28px;
    }
    .quantity-text {
      font-size: 13px;
      min-width: 28px;
    }
    .item-total {
      font-size: 13px;
    }
    .remove-btn {
      width: 28px;
      height: 28px;
    }
    .checkout-btn {
      font-size: 14px;
    }
  }
`;

export default CheckoutComponent;