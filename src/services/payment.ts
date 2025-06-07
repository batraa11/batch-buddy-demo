export interface PaymentRequest {
  amount: string;
  currency: string;
  description: string;
  email: string;
  method: 'upi' | 'card';
}

export interface PaymentResponse {
  success: boolean;
  error?: string;
  transactionId?: string;
}

export const initiatePayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  // This is a mock implementation. In a real app, this would integrate with a payment gateway
  try {
    // Simulate initial processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Always succeed in demo mode
    return {
      success: true,
      transactionId: `TXN_${Date.now()}`
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Payment failed"
    };
  }
}; 