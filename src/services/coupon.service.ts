import { Coupon } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Coupons Data
const mockCoupons: Coupon[] = [
  {
    code: 'SWIFT20',
    discountType: 'percent',
    value: 20,
    minOrderValue: 100,
    maxDiscount: 100,
    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
    description: '20% off on your first order',
  },
  {
    code: 'FLAT50',
    discountType: 'flat',
    value: 50,
    minOrderValue: 200,
    expiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    isActive: true,
    description: 'Flat ₹50 off on orders above ₹200',
  },
  {
    code: 'HEALTH100',
    discountType: 'flat',
    value: 100,
    minOrderValue: 500,
    expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    isActive: true,
    description: 'Flat ₹100 off on orders above ₹500',
  },
  {
    code: 'MEGA30',
    discountType: 'percent',
    value: 30,
    minOrderValue: 300,
    maxDiscount: 150,
    expiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    isActive: true,
    description: '30% off up to ₹150 on orders above ₹300',
  },
  {
    code: 'EXPIRED10',
    discountType: 'percent',
    value: 10,
    minOrderValue: 100,
    expiry: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Expired
    isActive: false,
    description: 'This coupon has expired',
  },
];

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  error?: string;
}

export const couponService = {
  // Get all active coupons
  getActiveCoupons: async (): Promise<Coupon[]> => {
    await delay(300);
    const now = new Date();
    return mockCoupons.filter(c => c.isActive && new Date(c.expiry) > now);
  },

  // Validate coupon
  validateCoupon: async (code: string, orderAmount: number): Promise<CouponValidationResult> => {
    await delay(500);
    
    const coupon = mockCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (!coupon) {
      return { valid: false, error: 'Invalid coupon code' };
    }
    
    if (!coupon.isActive) {
      return { valid: false, error: 'This coupon is no longer active' };
    }
    
    if (new Date(coupon.expiry) < new Date()) {
      return { valid: false, error: 'This coupon has expired' };
    }
    
    if (orderAmount < coupon.minOrderValue) {
      return { 
        valid: false, 
        error: `Minimum order value is ₹${coupon.minOrderValue}` 
      };
    }
    
    // Calculate discount
    let discount: number;
    if (coupon.discountType === 'percent') {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }
    
    return { valid: true, coupon, discount: Math.round(discount) };
  },

  // Apply coupon (just validates - actual application happens in checkout)
  applyCoupon: async (code: string, orderAmount: number): Promise<CouponValidationResult> => {
    return couponService.validateCoupon(code, orderAmount);
  },

  // Get coupon by code
  getCouponByCode: async (code: string): Promise<Coupon | undefined> => {
    await delay(200);
    return mockCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  },
};

export default couponService;
