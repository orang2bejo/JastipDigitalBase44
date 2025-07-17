import React, { useState } from "react";
import { Order } from "@/api/entities";
import { createPaymentDuitku } from "@/api/functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Banknote, 
  AlertCircle, 
  CheckCircle,
  Clock
} from "lucide-react";

export default function AdditionalPayment({ order, onPaymentComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const additionalAmount = order.additional_payment_amount || 0;

  const handleDigitalPayment = async () => {
    setIsProcessing(true);
    try {
      const response = await createPaymentDuitku({ 
        order_id: order.id,
        payment_type: 'additional'
      });
      
      if (response.data.success && response.data.paymentUrl) {
        // Update order status
        await Order.update(order.id, {
          additional_payment_url: response.data.paymentUrl,
          additional_payment_reference: response.data.reference
        });
        
        // Redirect to payment
        window.open(response.data.paymentUrl, '_blank');
      } else {
        throw new Error('Failed to create payment link');
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Gagal membuat link pembayaran. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashPayment = async () => {
    setIsProcessing(true);
    try {
      await Order.update(order.id, {
        additional_payment_method: 'cash',
        status: 'delivering',
        additional_payment_status: 'pending_cash'
      });
      
      onPaymentComplete && onPaymentComplete();
    } catch (error) {
      console.error("Error updating payment method:", error);
      alert("Gagal memilih metode pembayaran cash");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <CreditCard className="w-5 h-5" />
          Pembayaran Tambahan Diperlukan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Harga barang ternyata lebih mahal dari budget awal. Kamu perlu membayar selisihnya untuk melanjutkan pesanan.
          </AlertDescription>
        </Alert>

        <div className="bg-white rounded-lg p-4 border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Budget Awal:</p>
              <p className="font-semibold">Rp {order.max_budget?.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-gray-600">Harga Sebenarnya:</p>
              <p className="font-semibold">Rp {order.actual_price?.toLocaleString('id-ID')}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-gray-600 text-sm">Pembayaran Tambahan:</p>
            <p className="text-2xl font-bold text-red-600">
              Rp {additionalAmount.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {!paymentMethod && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Pilih Metode Pembayaran:</h4>
            
            <Button
              onClick={() => setPaymentMethod('digital')}
              variant="outline"
              className="w-full justify-start border-blue-200 hover:bg-blue-50"
            >
              <CreditCard className="w-5 h-5 mr-3 text-blue-600" />
              <div className="text-left">
                <p className="font-semibold text-blue-800">Pembayaran Digital</p>
                <p className="text-sm text-blue-600">Via Duitku (QRIS, Bank Transfer, E-Wallet)</p>
              </div>
            </Button>

            <Button
              onClick={() => setPaymentMethod('cash')}
              variant="outline"
              className="w-full justify-start border-green-200 hover:bg-green-50"
            >
              <Banknote className="w-5 h-5 mr-3 text-green-600" />
              <div className="text-left">
                <p className="font-semibold text-green-800">Bayar Cash ke Driver</p>
                <p className="text-sm text-green-600">Bayar selisih langsung saat barang diantar</p>
              </div>
            </Button>
          </div>
        )}

        {paymentMethod === 'digital' && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Pembayaran Digital</h4>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Kamu akan diarahkan ke halaman pembayaran Duitku untuk menyelesaikan pembayaran tambahan sebesar <strong>Rp {additionalAmount.toLocaleString('id-ID')}</strong>.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDigitalPayment}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Bayar Sekarang
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setPaymentMethod('')}
                  variant="outline"
                  disabled={isProcessing}
                >
                  Kembali
                </Button>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'cash' && (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Pembayaran Cash</h4>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Kamu akan membayar selisih sebesar <strong>Rp {additionalAmount.toLocaleString('id-ID')}</strong> langsung ke driver saat barang diantar.
              </p>
              <Alert className="border-green-200 bg-green-50 mb-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Pesanan akan dilanjutkan ke proses pengantaran. Pastikan kamu siap dengan uang cash saat driver tiba.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button
                  onClick={handleCashPayment}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Konfirmasi Cash
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setPaymentMethod('')}
                  variant="outline"
                  disabled={isProcessing}
                >
                  Kembali
                </Button>
              </div>
            </div>
          </div>
        )}

        {order.additional_payment_status === 'pending_cash' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Pembayaran cash sudah dikonfirmasi. Driver sedang menuju lokasimu untuk mengantarkan barang. 
              Siapkan uang cash sebesar <strong>Rp {additionalAmount.toLocaleString('id-ID')}</strong>.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}