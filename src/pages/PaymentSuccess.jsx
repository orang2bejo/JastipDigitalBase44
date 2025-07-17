import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Order } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Gift, ArrowRight, MessageCircle } from 'lucide-react';
import DonationOption from '../components/payment/DonationOption';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [showDonationOption, setShowDonationOption] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const orderId = urlParams.get('order_id');
    const merchantOrderId = urlParams.get('merchantOrderId');
    
    if (orderId || merchantOrderId) {
      loadOrderDetails(orderId || merchantOrderId);
    } else {
      setIsLoading(false);
    }
  }, [location]);

  const loadOrderDetails = async (orderId) => {
    try {
      // Try to find order by ID or by duitku reference
      let orderData;
      
      if (orderId.startsWith('order_')) {
        // Direct order ID
        orderData = await Order.get(orderId);
      } else {
        // Duitku merchant order ID - need to find by duitku_merchant_order_id
        const orders = await Order.filter({ duitku_merchant_order_id: orderId });
        orderData = orders[0];
      }

      if (orderData) {
        setOrder(orderData);
        
        // Check if there's a refund amount
        if (orderData.refund_amount && orderData.refund_amount > 0) {
          setRefundAmount(orderData.refund_amount);
          setShowDonationOption(true);
        }
      }
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonationSubmit = (donatedAmount) => {
    // Update local state to reflect donation
    setRefundAmount(prev => prev - donatedAmount);
    if (refundAmount - donatedAmount <= 0) {
      setShowDonationOption(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Success Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pembayaran Berhasil! 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            Terima kasih! Pembayaran Anda telah berhasil diproses.
          </p>
        </div>

        {/* Order Details */}
        {order && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detail Pesanan</span>
                <Badge className="bg-green-100 text-green-800">
                  {order.payment_status === 'paid' ? 'Lunas' : 'Dibayar'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{order.item_description}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">ID Pesanan:</p>
                    <p className="font-mono text-xs">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {order.status === 'delivering' ? 'Dalam Perjalanan' : 
                       order.status === 'completed' ? 'Selesai' : order.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Dibayar:</p>
                    <p className="font-semibold text-green-600">
                      Rp {(order.total_customer_payment || 
                           (order.actual_price || order.max_budget) + 
                           (order.delivery_fee || 0) + 
                           (order.service_fee || 0)).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Alamat Pengantaran:</p>
                    <p className="text-xs">{order.delivery_address?.substring(0, 50)}...</p>
                  </div>
                </div>
              </div>

              {/* Refund Notice */}
              {refundAmount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Good News!</span>
                  </div>
                  <p className="text-green-700">
                    Harga barang lebih murah dari budget Anda. Anda mendapat refund sebesar 
                    <strong> Rp {refundAmount.toLocaleString('id-ID')}</strong>!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Donation Option */}
        {showDonationOption && refundAmount > 0 && (
          <DonationOption
            refundAmount={refundAmount}
            onDonationSubmit={handleDonationSubmit}
            showDonationOption={true}
          />
        )}

        {/* Next Steps */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Langkah Selanjutnya</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Driver Sedang Berbelanja</p>
                  <p className="text-sm text-blue-700">
                    Anda akan mendapat notifikasi dan bisa chat dengan driver untuk update
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => navigate(createPageUrl('Dashboard'))}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Kembali ke Dashboard
                </Button>
                
                {order && (
                  <Button
                    onClick={() => navigate(createPageUrl(`OrderDetail?order_id=${order.id}`))}
                    variant="outline"
                    className="flex-1"
                  >
                    Lihat Detail Pesanan
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thank You Message */}
        <div className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-2">Terima Kasih! 🙏</h2>
          <p className="text-purple-100 text-lg">
            Kami berkomitmen memberikan layanan terbaik untuk Anda
          </p>
        </div>

      </div>
    </div>
  );
}