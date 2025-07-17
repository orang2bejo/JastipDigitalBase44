import React, { useState } from 'react';
import { createPaymentDuitku } from '@/api/functions';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';

export default function DuitkuPopPayment({ order, onPaymentSuccess, onPaymentError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError('');

      console.log('🎯 Initiating Duitku payment for order:', order.id);
      
      // Call backend function to create Duitku payment
      const response = await createPaymentDuitku({ order_id: order.id });
      
      console.log('📦 Payment response:', response);
      
      if (response.data?.success && response.data?.paymentUrl) {
        console.log('✅ Payment URL received:', response.data.paymentUrl);
        
        // Redirect ke halaman pembayaran Duitku
        window.open(response.data.paymentUrl, '_blank');
        
        // Call onPaymentSuccess jika ada
        if (onPaymentSuccess) {
          onPaymentSuccess(response.data);
        }
        
      } else {
        const errorMsg = response.data?.error || response.error || 'Gagal membuat pembayaran';
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      console.error('Payment creation error:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(`💥 Gagal memulai pembayaran: ${errorMessage}`);
      
      if (onPaymentError) {
        onPaymentError({ error: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Bayar dengan Duitku
          </>
        )}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      )}
    </>
  );
}