import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Order } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('processing');

  const orderId = searchParams.get('order_id');
  const resultCode = searchParams.get('resultCode');
  const merchantOrderId = searchParams.get('merchantOrderId');
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (orderId) {
      loadOrderStatus();
    }
  }, [orderId]);

  const loadOrderStatus = async () => {
    try {
      setIsLoading(true);
      
      // Tunggu sebentar untuk memastikan callback sudah diproses
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderData = await Order.get(orderId);
      setOrder(orderData);
      
      // Tentukan status pembayaran berdasarkan resultCode dan status order
      if (resultCode === '00') {
        if (orderData?.status === 'shopping' || orderData?.payment_status === 'paid') {
          setPaymentStatus('success');
        } else {
          setPaymentStatus('processing');
          // Coba refresh lagi setelah 3 detik
          setTimeout(() => {
            loadOrderStatus();
          }, 3000);
        }
      } else if (resultCode === '01') {
        setPaymentStatus('failed');
      } else {
        setPaymentStatus('pending');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setPaymentStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusConfig = () => {
    switch (paymentStatus) {
      case 'success':
        return {
          icon: CheckCircle,
          title: 'Pembayaran Digital Berhasil! 🎉',
          subtitle: 'Driver sedang menuju toko untuk berbelanja',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'failed':
        return {
          icon: XCircle,
          title: 'Pembayaran Digital Gagal',
          subtitle: 'Silakan gunakan pembayaran cash atau coba lagi nanti',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'processing':
        return {
          icon: Clock,
          title: 'Memproses Pembayaran Digital...',
          subtitle: 'Payment gateway masih trial - mungkin butuh waktu lama atau error',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          icon: Clock,
          title: 'Status Pembayaran Digital',
          subtitle: 'Mengecek status pembayaran... (Trial mode)',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Memproses Pembayaran</h2>
            <p className="text-gray-600">Mohon tunggu sebentar...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Trial Warning */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-800">Pembayaran Digital Trial</p>
                <p className="text-sm text-orange-700">
                  Payment gateway masih dalam tahap pengujian. Untuk pengalaman terbaik, gunakan pembayaran cash.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card className={`${statusConfig.borderColor} ${statusConfig.bgColor}`}>
          <CardHeader className="text-center">
            <StatusIcon className={`w-16 h-16 mx-auto mb-4 ${statusConfig.color}`} />
            <CardTitle className={`text-2xl ${statusConfig.color}`}>
              {statusConfig.title}
            </CardTitle>
            <p className={`${statusConfig.color} opacity-80`}>
              {statusConfig.subtitle}
            </p>
          </CardHeader>
          
          {order && (
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-900">Detail Pesanan:</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Pesanan:</span>
                    <span className="font-medium">{order.item_description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pembayaran:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(order.total_customer_payment)}
                    </span>
                  </div>
                  {reference && (
                    <div className="flex justify-between">
                      <span>Reference:</span>
                      <span className="font-mono text-xs">{reference}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {paymentStatus === 'failed' && (
                  <Button 
                    onClick={() => navigate(createPageUrl(`OrderDetail?order_id=${orderId}`))}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Coba Pembayaran Cash
                  </Button>
                )}
                
                {paymentStatus === 'processing' && (
                  <Button 
                    onClick={loadOrderStatus}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </Button>
                )}
                
                <Button 
                  onClick={() => navigate(createPageUrl('Dashboard'))}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Dashboard
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}