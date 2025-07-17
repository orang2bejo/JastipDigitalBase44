import React, { useState, useEffect } from "react";
import { SpecialistOrder } from "@/api/entities";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  CheckCircle,
  MessageSquare,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SpecialistNegotiation() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadOrderData();
  }, []);

  const loadOrderData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('id');
      
      if (!orderId) {
        navigate(createPageUrl("SpecialistService"));
        return;
      }

      const orders = await SpecialistOrder.filter({ id: orderId });
      if (orders.length > 0) {
        const orderData = orders[0];
        setOrder(orderData);
        setQuotes(orderData.quotes || []);
      }
    } catch (error) {
      console.error("Error loading order data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptQuote = async (quote) => {
    setProcessing(true);
    try {
      await SpecialistOrder.update(order.id, {
        status: "accepted",
        mitra_id: quote.mitra_id,
        final_agreed_price: quote.quoted_price,
        platform_fee_amount: quote.quoted_price * 0.06, // 6% platform fee
        mitra_earning: quote.quoted_price * 0.94
      });

      // Navigate to specialist chat atau success page
      navigate(createPageUrl(`SpecialistChat?order=${order.id}`));
    } catch (error) {
      console.error("Error accepting quote:", error);
    } finally {
      setProcessing(false);
    }
  };

  const urgencyColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800", 
    high: "bg-orange-100 text-orange-800",
    emergency: "bg-red-100 text-red-800"
  };

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="h-96 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pesanan Tidak Ditemukan</h1>
        <Button onClick={() => navigate(createPageUrl("SpecialistService"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Layanan Spesialis
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("SpecialistService"))}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Pilih Mitra Terbaik 🔧
            </h1>
            <p className="text-gray-600">
              Bandingkan penawaran dan pilih mitra yang sesuai kebutuhan Anda
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{order.service_type.replace(/_/g, ' ').toUpperCase()}</span>
              <Badge className={urgencyColors[order.urgency_level]}>
                {order.urgency_level === 'emergency' ? 'DARURAT!' : 
                 order.urgency_level === 'high' ? 'Urgent' :
                 order.urgency_level === 'medium' ? 'Sedang' : 'Normal'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{order.problem_description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{order.customer_location?.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>
                  {order.preferred_time ? 
                    new Date(order.preferred_time).toLocaleString('id-ID') : 
                    'Fleksibel'
                  }
                </span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Budget Range Anda:</h4>
              <p className="text-lg font-bold text-blue-800">
                Rp {order.budget_range?.min_budget?.toLocaleString('id-ID')} - 
                Rp {order.budget_range?.max_budget?.toLocaleString('id-ID')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Alert */}
        {order.status === 'pending' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Menunggu penawaran dari mitra. Penawaran biasanya masuk dalam 5-15 menit.
            </AlertDescription>
          </Alert>
        )}

        {order.status === 'quoted' && quotes.length > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>{quotes.length} penawaran</strong> diterima! Pilih yang terbaik sesuai kebutuhan Anda.
            </AlertDescription>
          </Alert>
        )}

        {/* Quotes Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Penawaran dari Mitra ({quotes.length})
          </h2>

          {quotes.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
              <CardContent className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Belum Ada Penawaran
                </h3>
                <p className="text-gray-500">
                  Mitra sedang menyiapkan penawaran untuk Anda. Mohon tunggu sebentar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {quotes.map((quote, index) => (
                <Card key={index} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {quote.mitra_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{quote.mitra_rating || 5.0}</span>
                          </div>
                          <Badge variant="secondary">Mitra Terverifikasi</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600 mb-1">
                          Rp {quote.quoted_price?.toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Est. {quote.estimated_duration}
                        </p>
                      </div>
                    </div>

                    {quote.includes && quote.includes.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Yang Termasuk:</h4>
                        <div className="flex flex-wrap gap-2">
                          {quote.includes.map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              ✓ {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {quote.notes && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Catatan Mitra:</h4>
                        <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">
                          {quote.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <p>Penawaran berlaku sampai:</p>
                        <p className="font-medium">
                          {new Date(quote.valid_until).toLocaleString('id-ID')}
                        </p>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button variant="outline">
                          <Phone className="w-4 h-4 mr-2" />
                          Telepon
                        </Button>
                        <Button
                          onClick={() => acceptQuote(quote)}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Pilih Mitra Ini
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Fee Information */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Informasi Pembayaran:</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Platform fee: 6% dari harga yang disepakati</p>
              <p>• Pembayaran aman melalui sistem escrow</p>
              <p>• Uang baru diteruskan ke mitra setelah pekerjaan selesai</p>
              <p>• Garansi 100% uang kembali jika tidak puas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}