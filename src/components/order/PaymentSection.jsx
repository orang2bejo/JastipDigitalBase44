
import React, { useState } from 'react';
import { Order } from '@/api/entities';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Banknote,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { createPaymentFlip } from '@/api/functions/createPaymentFlip'; // Kept as per outline, might be used for legacy orders
import { createPaymentDuitku } from '@/api/functions'; // NEW: Duitku integration

export default function PaymentSection({ order, onPaymentSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');

  // Calculate payment breakdown
  const itemPrice = order.confirmed_price || order.actual_price || 0;
  const deliveryFee = Math.max(10000, Math.floor(itemPrice * 0.15));
  const serviceFee = Math.floor(itemPrice * 0.05);
  const totalAmount = itemPrice + deliveryFee + serviceFee;

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    if (paymentMethod === 'cash') {
      try {
        await Order.update(order.id, {
          status: 'shopping',
          payment_status: 'cash_on_delivery',
          payment_method: 'cash',
          total_customer_payment: totalAmount
        });
        onPaymentSuccess();
        alert('✅ Pembayaran Cash dipilih! Driver akan segera berbelanja dan mengantar pesanan Anda.');
      } catch (error) {
        console.error('COD setup error:', error);
        setPaymentError('Gagal setup pembayaran cash');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Handle online payment with Duitku (NEW)
    try {
      console.log('Starting Duitku payment process for order:', order.id);
      const { data } = await createPaymentDuitku({ order_id: order.id });

      if (!data.success || !data.payment_url) {
        throw new Error(data.error || 'Gagal membuat halaman pembayaran.');
      }

      console.log('Duitku payment link created. Reloading order details...');
      // Refresh data untuk menampilkan link pembayaran
      onPaymentSuccess();

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Terjadi kesalahan. Silakan coba lagi atau pilih metode pembayaran lain.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getAbsoluteUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http')) {
      return url;
    }
    return `https://${url}`;
  };

  // UPDATED: Support Duitku payment URL
  if (order.status === 'waiting_payment') {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-lg">✅ Link Pembayaran Duitku Siap!</p>
              <p className="text-sm mt-1">
                Link pembayaran sudah dibuat. Silakan klik tombol di bawah untuk melanjutkan pembayaran di tab baru.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border-l-4 border-orange-400">
              <h4 className="font-semibold text-orange-900 mb-2">Ringkasan Pembayaran:</h4>
              <div className="space-y-1 text-sm text-orange-800">
                 <div className="flex justify-between">
                  <span>Harga Barang:</span>
                  <span>Rp {(order.actual_price || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim:</span>
                  <span>Rp {(order.delivery_fee || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Layanan:</span>
                  <span>Rp {(order.service_fee || 0).toLocaleString('id-ID')}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total:</span>
                  <span>Rp {(order.total_customer_payment || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {order.duitku_payment_url && (
                <a 
                  href={order.duitku_payment_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    🔗 Buka Halaman Pembayaran Duitku
                  </Button>
                </a>
              )}
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                🔄 Refresh Status
              </Button>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-semibold mb-1">💡 Petunjuk:</p>
              <ul className="space-y-1">
                <li>• Klik "Buka Halaman Pembayaran Duitku" untuk melanjutkan</li>
                <li>• Setelah pembayaran berhasil, status pesanan akan otomatis terupdate</li>
                <li>• Jika tidak berubah dalam 5 menit, klik "Refresh Status"</li>
              </ul>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // KONDISI DEFAULT: Tampilkan form pilihan pembayaran (untuk status price_confirmation)
  return (
    <div className="space-y-6">
      <div className="p-6 border rounded-2xl bg-white shadow-lg">
        <h3 className="text-xl font-bold mb-4">Ringkasan Pembayaran</h3>
        <div className="space-y-2 text-gray-700">
          <div className="flex justify-between"><span>Harga Barang</span> <span className="font-medium">Rp {itemPrice.toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between"><span>Ongkos Kirim</span> <span className="font-medium">Rp {deliveryFee.toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between"><span>Biaya Layanan</span> <span className="font-medium">Rp {serviceFee.toLocaleString('id-ID')}</span></div>
        </div>
        <div className="border-t my-4" />
        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>Total Pembayaran</span>
          <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="p-6 border rounded-2xl bg-white shadow-lg">
        <h3 className="text-xl font-bold mb-4">Pilih Metode Pembayaran</h3>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
          <Label htmlFor="online" className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
            <RadioGroupItem value="online" id="online" />
            <CreditCard className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-semibold">Pembayaran Online</p>
              <p className="text-sm text-gray-600">Kartu kredit, virtual account, e-wallet, QRIS via Duitku</p>
            </div>
          </Label>
          <Label htmlFor="cash" className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
            <RadioGroupItem value="cash" id="cash" />
            <Banknote className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-semibold">Bayar Tunai (COD)</p>
              <p className="text-sm text-gray-600">Bayar tunai saat barang diantar</p>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {paymentError && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Terjadi Kesalahan</AlertTitle>
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handlePayment} disabled={isProcessing} className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700">
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {paymentMethod === 'online' ? 'Membuat Link Pembayaran...' : 'Memproses...'}
          </div>
        ) : (
          `Bayar Rp ${totalAmount.toLocaleString('id-ID')}`
        )}
      </Button>
    </div>
  );
}
