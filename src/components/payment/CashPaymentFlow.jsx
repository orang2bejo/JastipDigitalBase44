import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Order } from "@/api/entities";
import { User } from "@/api/entities";
import { 
  Banknote, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Phone,
  MessageCircle,
  Camera
} from 'lucide-react';

export default function CashPaymentFlow({ order, onStatusUpdate }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleConfirmCashPayment = async () => {
    if (!order) return;

    setIsConfirming(true);
    try {
      const user = await User.me();
      
      // Update order status to indicate cash payment confirmation
      await Order.update(order.id, {
        payment_status: 'manual_confirmed',
        cash_confirmed_by: user.id,
        cash_confirmed_at: new Date().toISOString(),
        manual_confirmation_notes: 'Pembayaran cash dikonfirmasi oleh customer'
      });

      setConfirmationSent(true);
      
      if (onStatusUpdate) {
        onStatusUpdate('manual_confirmed');
      }

      // Send WhatsApp notification to admin
      const message = encodeURIComponent(
        `*Konfirmasi Pembayaran Cash*\n\n` +
        `*Order ID:* ${order.id}\n` +
        `*Customer:* ${user.full_name}\n` +
        `*Item:* ${order.item_description}\n` +
        `*Total:* Rp ${order.total_customer_payment?.toLocaleString('id-ID')}\n` +
        `*Status:* Customer konfirmasi sudah bayar cash\n\n` +
        `Mohon verifikasi dengan driver terkait.`
      );
      
      const whatsappUrl = `https://wa.me/6282340042948?text=${message}`;
      window.open(whatsappUrl, '_blank');

    } catch (error) {
      console.error('Error confirming cash payment:', error);
      alert('Terjadi kesalahan saat konfirmasi pembayaran. Silakan coba lagi.');
    } finally {
      setIsConfirming(false);
    }
  };

  const getTotalAmount = () => {
    if (!order) return 0;
    
    let total = 0;
    
    // Add actual price or confirmed price
    if (order.actual_price) {
      total += order.actual_price;
    } else if (order.confirmed_price) {
      total += order.confirmed_price;
    } else {
      total += order.max_budget || 0;
    }
    
    // Add delivery fee
    total += order.delivery_fee || 0;
    
    // Add service fee
    total += order.service_fee || 0;
    
    // Add tip if any
    total += order.tip_amount || 0;
    
    return total;
  };

  const getPaymentStatusInfo = () => {
    switch (order?.payment_status) {
      case 'cash_on_delivery':
        return {
          icon: <Banknote className="w-5 h-5 text-orange-500" />,
          status: 'Pembayaran Cash',
          description: 'Bayar langsung ke driver saat barang diantar',
          color: 'bg-orange-100 text-orange-800'
        };
      case 'manual_confirmed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          status: 'Cash Terkonfirmasi',
          description: 'Pembayaran cash telah dikonfirmasi',
          color: 'bg-green-100 text-green-800'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-gray-500" />,
          status: 'Menunggu Pembayaran',
          description: 'Menunggu konfirmasi pembayaran',
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const paymentInfo = getPaymentStatusInfo();
  const totalAmount = getTotalAmount();

  return (
    <div className="space-y-4">
      {/* Payment Status */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {paymentInfo.icon}
            <div>
              <span className="text-xl">Pembayaran Cash</span>
              <Badge className={`ml-3 ${paymentInfo.color}`}>
                {paymentInfo.status}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {/* Amount Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Rincian Pembayaran:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Harga Barang:</span>
                  <span>Rp {(order.actual_price || order.confirmed_price || order.max_budget || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkir:</span>
                  <span>Rp {(order.delivery_fee || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Layanan:</span>
                  <span>Rp {(order.service_fee || 0).toLocaleString('id-ID')}</span>
                </div>
                {order.tip_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Tip Driver:</span>
                    <span>Rp {order.tip_amount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <hr className="border-gray-300" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            {order.payment_status === 'cash_on_delivery' && (
              <Alert className="border-blue-200 bg-blue-50">
                <Banknote className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Cara Pembayaran Cash:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Siapkan uang pas sebesar <strong>Rp {totalAmount.toLocaleString('id-ID')}</strong></li>
                    <li>Bayar langsung ke driver saat barang diantar</li>
                    <li>Minta struk atau konfirmasi dari driver</li>
                    <li>Konfirmasi pembayaran melalui tombol di bawah setelah bayar</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Confirmation Button */}
            {order.payment_status === 'cash_on_delivery' && !confirmationSent && (
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleConfirmCashPayment}
                  disabled={isConfirming}
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                >
                  {isConfirming ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Mengonfirmasi...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Konfirmasi Sudah Bayar Cash
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Klik tombol ini setelah Anda membayar cash ke driver
                </p>
              </div>
            )}

            {/* Confirmation Success */}
            {confirmationSent && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Konfirmasi Terkirim!</strong> Admin akan memverifikasi pembayaran Anda dengan driver. 
                  Pesanan akan diproses segera setelah verifikasi selesai.
                </AlertDescription>
              </Alert>
            )}

            {/* Contact Options */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  const message = encodeURIComponent(
                    `Halo, saya butuh bantuan terkait pembayaran cash untuk pesanan ${order.id}. Mohon bantuannya.`
                  );
                  window.open(`https://wa.me/6282340042948?text=${message}`, '_blank');
                }}
              >
                <Phone className="w-4 h-4 mr-2" />
                Hubungi Admin
              </Button>
              
              {order.driver_id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    window.location.href = `/Chat?order=${order.id}`;
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat Driver
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}