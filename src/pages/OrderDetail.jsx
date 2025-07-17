import React, { useState, useEffect } from "react";
import { Order } from "@/api/entities";
import { Chat } from "@/api/entities";
import { User } from "@/api/entities";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  CreditCard,
  MessageCircle,
  Star,
  AlertTriangle,
  Phone,
  Gift // Added missing import
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PriceConfirmation from "../components/order/PriceConfirmation";
import RefundDonationFlow from "../components/order/RefundDonationFlow";
import CashPaymentFlow from "../components/payment/CashPaymentFlow";

const statusConfig = {
  pending: { label: "Menunggu Driver", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  accepted: { label: "Driver Menuju Toko", color: "bg-blue-100 text-blue-800", icon: Package },
  shopping: { label: "Sedang Berbelanja", color: "bg-purple-100 text-purple-800", icon: Package },
  price_confirmation: { label: "Menunggu Konfirmasi Harga", color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
  price_negotiation: { label: "Negosiasi Harga", color: "bg-pink-100 text-pink-800", icon: AlertTriangle },
  waiting_additional_payment: { label: "Menunggu Pembayaran Tambahan", color: "bg-red-100 text-red-800", icon: CreditCard },
  delivering: { label: "Dalam Perjalanan", color: "bg-indigo-100 text-indigo-800", icon: Package },
  completed: { label: "Selesai", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800", icon: AlertTriangle }
};

export default function OrderDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRefundFlow, setShowRefundFlow] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const orderId = urlParams.get('order_id');
    if (orderId) {
      loadOrderDetail(orderId);
    }
    loadCurrentUser();
  }, [location]);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const loadOrderDetail = async (orderId) => {
    try {
      const orderData = await Order.get(orderId);
      
      // Security check: Verify user owns this order
      const user = await User.me();
      if (orderData.created_by !== user.email) {
        alert("Anda tidak memiliki akses ke pesanan ini.");
        navigate(createPageUrl("Dashboard"));
        return;
      }
      
      setOrder(orderData);
    } catch (error) {
      console.error("Error loading order detail:", error);
      alert("Pesanan tidak ditemukan atau terjadi error.");
      navigate(createPageUrl("Dashboard"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundProcessed = (type, amount, remaining = 0) => {
    // Update order state after refund processing
    setOrder(prev => ({
      ...prev,
      refund_status: 'processed',
      refund_processed_at: new Date().toISOString()
    }));
    
    setShowRefundFlow(false);
    
    if (type === 'donated') {
      alert(`Terima kasih! Donasi sebesar Rp ${amount.toLocaleString('id-ID')} telah berhasil dikirim.`);
    } else if (type === 'kept') {
      alert(`Refund sebesar Rp ${amount.toLocaleString('id-ID')} akan diproses dalam 1-3 hari kerja.`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Pesanan yang Anda cari tidak dapat ditemukan.</p>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Detail Pesanan
            </h1>
            <p className="text-gray-600">
              ID: {order.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        {/* Main Order Card */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-gray-900">
                  {order.item_description}
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  {new Date(order.created_date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <Badge className={`${statusConfig[order.status]?.color} text-sm px-3 py-2`}>
                <StatusIcon className="w-4 h-4 mr-2" />
                {statusConfig[order.status]?.label}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Informasi Barang</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><strong>Deskripsi:</strong> {order.item_description}</p>
                    {order.item_category && (
                      <p><strong>Kategori:</strong> {order.item_category}</p>
                    )}
                    {order.customer_notes && (
                      <p><strong>Catatan:</strong> {order.customer_notes}</p>
                    )}
                    {order.urgency_level !== 'normal' && (
                      <Badge className="bg-red-100 text-red-800">
                        {order.urgency_level === 'urgent' ? 'Mendesak' : 'Express'}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Lokasi
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {order.store_location && (
                      <p><strong>Toko:</strong> {order.store_location}</p>
                    )}
                    <p><strong>Alamat Pengantaran:</strong> {order.delivery_address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Informasi Harga</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Budget Maksimum:</span>
                      <span className="font-semibold">Rp {order.max_budget?.toLocaleString('id-ID')}</span>
                    </div>
                    {order.confirmed_price && (
                      <div className="flex justify-between">
                        <span>Harga Dikonfirmasi:</span>
                        <span className="font-semibold text-green-600">Rp {order.confirmed_price.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {order.actual_price && (
                      <div className="flex justify-between">
                        <span>Harga Aktual:</span>
                        <span className="font-semibold text-blue-600">Rp {order.actual_price.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Ongkir:</span>
                      <span>Rp {(order.delivery_fee || 15000).toLocaleString('id-ID')}</span>
                    </div>
                    {order.service_fee > 0 && (
                      <div className="flex justify-between">
                        <span>Biaya Layanan:</span>
                        <span>Rp {order.service_fee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">
                        Rp {(order.total_customer_payment || 
                             (order.actual_price || order.confirmed_price || order.max_budget) + 
                             (order.delivery_fee || 15000) + 
                             (order.service_fee || 0)).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {order.customer_phone && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Kontak
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p><strong>Telepon:</strong> {order.customer_phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Section - Enhanced with Cash Payment */}
            {order.status !== 'pending' && order.status !== 'cancelled' && (
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Informasi Pembayaran
                </h3>
                
                {/* Cash Payment Flow */}
                {(order.payment_status === 'pending' || 
                  order.payment_status === 'cash_on_delivery' || 
                  order.payment_status === 'manual_transfer_pending') && (
                  <CashPaymentFlow 
                    order={order}
                    onPaymentUpdate={setOrder}
                    showDriverContact={order.status !== 'pending'}
                  />
                )}

                {/* Digital Payment Info */}
                {order.payment_status === 'paid' && (
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Pembayaran Berhasil</span>
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>Total Dibayar: <strong>Rp {order.total_customer_payment?.toLocaleString('id-ID')}</strong></p>
                      {order.duitku_reference && (
                        <p>Referensi: <span className="font-mono text-xs">{order.duitku_reference}</span></p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Refund Flow */}
            {order.refund_amount > 0 && order.refund_status !== 'processed' && (
              <div>
                {!showRefundFlow ? (
                  <Alert className="border-green-200 bg-green-50">
                    <Gift className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong>Anda mendapat refund!</strong><br />
                          Barang lebih murah Rp {order.refund_amount.toLocaleString('id-ID')} dari budget.
                        </div>
                        <Button
                          onClick={() => setShowRefundFlow(true)}
                          className="bg-green-600 hover:bg-green-700 ml-4"
                        >
                          Kelola Refund
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <RefundDonationFlow
                    order={order}
                    refundAmount={order.refund_amount}
                    onRefundProcessed={handleRefundProcessed}
                  />
                )}
              </div>
            )}

            {/* Price Confirmation Section */}
            {order.status === 'price_confirmation' && (
              <PriceConfirmation
                order={order}
                onUpdate={setOrder}
              />
            )}

            {/* Chat Section */}
            {order.driver_id && order.status !== 'pending' && order.status !== 'cancelled' && (
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Komunikasi dengan Driver
                </h3>
                <div className="flex gap-4">
                  <Link to={createPageUrl(`Chat?order=${order.id}`)} className="flex-1">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat dengan Driver
                    </Button>
                  </Link>
                  {order.status === 'completed' && (
                    <Link to={createPageUrl(`Reviews`)} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Star className="w-4 h-4 mr-2" />
                        Beri Review
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => navigate(createPageUrl("Dashboard"))}
                variant="outline"
                className="flex-1"
              >
                Kembali ke Dashboard
              </Button>
              {order.status === 'pending' && (
                <Button
                  onClick={() => navigate(createPageUrl(`CreateOrder`))}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Buat Pesanan Baru
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}