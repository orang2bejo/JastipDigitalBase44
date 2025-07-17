
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Wallet, ArrowLeft, AlertCircle } from 'lucide-react';
import { createPaymentDuitku } from '@/api/functions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Order } from '@/api/entities'; // Assuming this is for type checking or future use
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PaymentButton({ order, onPaymentSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showCashOption, setShowCashOption] = useState(false);
  const navigate = useNavigate();

  const handleOnlinePayment = async () => {
    setIsProcessing(true);
    setError(null);

    console.log('=== FRONTEND PAYMENT START ===');
    console.log('Order ID:', order.id);
    console.log('Order status:', order.status);

    try {
      // PERBAIKAN: Menangkap error dengan lebih baik
      const { data, error: functionError } = await createPaymentDuitku({
        order_id: order.id
      });

      console.log('Payment function response:', { data, error: functionError });

      if (functionError) {
        console.error('Payment function error:', functionError);
        // Menampilkan pesan error yang lebih spesifik dari backend
        setError(`Error: ${functionError.error || 'Gagal memulai pembayaran'}${functionError.details ? `. Detail: ${JSON.stringify(functionError.details)}` : ''}`);
        return;
      }

      if (data?.payment_url) {
        console.log('Redirecting to payment URL:', data.payment_url);
        window.open(data.payment_url, '_blank');
        if (onPaymentSuccess) onPaymentSuccess(); // Call success callback after opening URL
      } else {
        console.error('No payment URL in response:', data);
        setError('URL pembayaran tidak diterima dari server.');
      }

    } catch (err) {
      console.error('Payment execution error:', err);
      setError(`Gagal memproses permintaan: ${err.message || 'Network error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashPayment = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // Simulate an API call for cash payment confirmation
      // In a real application, this would involve a backend endpoint
      // to update the order status to 'pending_cash_payment' or similar.
      console.log('Initiating cash payment for order:', order.id);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      // Assuming success for the sake of this example
      // A real implementation would check for backend confirmation
      console.log('Cash payment initiated successfully.');
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      navigate(createPageUrl('order_detail', { orderId: order.id })); // Redirect to order detail or success page
    } catch (err) {
      console.error('Cash payment error:', err);
      setError(`Gagal memproses pembayaran tunai: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = (order.confirmed_price || order.actual_price || 0) +
                     (order.delivery_fee || 0) +
                     (order.service_fee || 0);

  return (
    <div className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {!showCashOption ? (
        <div className="space-y-3">
          <Button
            onClick={handleOnlinePayment}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg font-semibold"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses Pembayaran...
              </div>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Bayar Online Rp {totalAmount.toLocaleString('id-ID')}
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowCashOption(true)}
            disabled={isProcessing}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 text-lg font-semibold"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Pilih Pembayaran Tunai
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
            <p className="text-lg text-gray-700">
                Anda memilih pembayaran tunai. Pembayaran akan dilakukan saat pengambilan barang atau saat kurir tiba.
            </p>
            <Button
                onClick={handleCashPayment}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg font-semibold"
            >
                {isProcessing ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Mengonfirmasi Pembayaran Tunai...
                    </div>
                ) : (
                    <>
                        <Wallet className="w-5 h-5 mr-2" />
                        Konfirmasi Pembayaran Tunai
                    </>
                )}
            </Button>
            <Button
                onClick={() => setShowCashOption(false)}
                disabled={isProcessing}
                variant="outline"
                className="w-full border-gray-300 text-gray-800 hover:bg-gray-100 py-3 text-lg font-semibold"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali ke Opsi Pembayaran Online
            </Button>
        </div>
      )}
    </div>
  );
}
