import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Banknote, CheckCircle, AlertTriangle, Phone } from 'lucide-react';

export default function CashPaymentOption({ order, onCashPaymentConfirm }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleCashPayment = async () => {
    setIsConfirming(true);
    try {
      await onCashPaymentConfirm();
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error confirming cash payment:', error);
      alert('Gagal konfirmasi pembayaran cash. Silakan coba lagi.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (showConfirmation) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Pembayaran Cash Dikonfirmasi! 🎉
          </h3>
          <p className="text-green-700 mb-4">
            Driver akan segera menuju toko untuk berbelanja. Siapkan uang cash sesuai total pembayaran.
          </p>
          <p className="text-sm text-green-600">
            Status pesanan akan diperbarui secara real-time
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="w-6 h-6 text-green-600" />
          Pembayaran Cash (COD)
        </CardTitle>
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Pemberitahuan:</strong> Pembayaran digital masih dalam tahap trial dan mungkin mengalami error. 
            Untuk sementara, gunakan pembayaran cash yang sudah berjalan dengan lancar.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h4 className="font-semibold mb-3">Ringkasan Pembayaran Cash:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Harga Barang:</span>
                <span>{formatCurrency(order.actual_price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim:</span>
                <span>{formatCurrency(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan:</span>
                <span>{formatCurrency(order.service_fee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t">
                <span>Total Bayar Cash:</span>
                <span className="text-green-600">{formatCurrency(order.total_customer_payment)}</span>
              </div>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Phone className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Cara Pembayaran Cash:</strong><br />
              1. Klik "Konfirmasi Pembayaran Cash" di bawah<br />
              2. Driver akan segera menuju toko untuk berbelanja<br />
              3. Siapkan uang cash sesuai total pembayaran<br />
              4. Bayar cash kepada driver saat barang diantar
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleCashPayment}
            disabled={isConfirming}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg"
          >
            {isConfirming ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Mengkonfirmasi...
              </>
            ) : (
              <>
                <Banknote className="w-5 h-5 mr-2" />
                Konfirmasi Pembayaran Cash
              </>
            )}
          </Button>

          <p className="text-xs text-gray-600 text-center">
            Dengan mengklik tombol di atas, Anda menyetujui untuk membayar cash kepada driver 
            sejumlah <strong>{formatCurrency(order.total_customer_payment)}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}