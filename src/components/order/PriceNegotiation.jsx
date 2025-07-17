import React, { useState } from "react";
import { Order } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  X,
  Upload,
  MessageSquare
} from "lucide-react";

export default function PriceNegotiation({ order, onStatusChange, userRole }) {
  const [priceData, setPriceData] = useState({
    actual_price: order.actual_price || '',
    price_explanation: order.price_explanation || '',
    price_evidence_urls: order.price_evidence_urls || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setPriceData(prev => ({
        ...prev,
        price_evidence_urls: [...prev.price_evidence_urls, file_url]
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index) => {
    setPriceData(prev => ({
      ...prev,
      price_evidence_urls: prev.price_evidence_urls.filter((_, i) => i !== index)
    }));
  };

  const handleDriverSubmitPrice = async () => {
    if (!priceData.actual_price || parseFloat(priceData.actual_price) <= 0) {
      alert("Masukkan harga yang valid");
      return;
    }

    setIsSubmitting(true);
    try {
      await Order.update(order.id, {
        actual_price: parseFloat(priceData.actual_price),
        price_explanation: priceData.price_explanation,
        price_evidence_urls: priceData.price_evidence_urls,
        status: 'price_confirmation',
        price_submitted_at: new Date().toISOString()
      });
      
      onStatusChange && onStatusChange();
    } catch (error) {
      console.error("Error submitting price:", error);
      alert("Gagal mengirim konfirmasi harga");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerResponse = async (action) => {
    setIsSubmitting(true);
    try {
      const updateData = {
        customer_price_response: action,
        customer_response_at: new Date().toISOString()
      };

      if (action === 'approved') {
        // Hitung apakah perlu bayar tambahan atau refund
        const actualPrice = parseFloat(order.actual_price);
        const maxBudget = parseFloat(order.max_budget);
        const priceDifference = actualPrice - maxBudget;

        if (priceDifference > 0) {
          // Perlu bayar tambahan
          updateData.status = 'waiting_additional_payment';
          updateData.additional_payment_amount = priceDifference;
        } else if (priceDifference < 0) {
          // Perlu refund
          updateData.status = 'delivering';
          updateData.refund_amount = Math.abs(priceDifference);
        } else {
          // Harga sama persis
          updateData.status = 'delivering';
        }
      } else if (action === 'rejected') {
        updateData.status = 'price_negotiation';
      } else if (action === 'cancelled') {
        updateData.status = 'cancelled';
        updateData.cancellation_reason = 'Customer cancelled after price confirmation';
      }

      await Order.update(order.id, updateData);
      onStatusChange && onStatusChange();
    } catch (error) {
      console.error("Error responding to price:", error);
      alert("Gagal merespon konfirmasi harga");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNegotiationSubmit = async () => {
    if (!priceData.actual_price || parseFloat(priceData.actual_price) <= 0) {
      alert("Masukkan harga yang valid");
      return;
    }

    setIsSubmitting(true);
    try {
      await Order.update(order.id, {
        customer_counter_offer: parseFloat(priceData.actual_price),
        customer_negotiation_notes: priceData.price_explanation,
        status: 'price_confirmation',
        negotiation_round: (order.negotiation_round || 0) + 1
      });
      
      onStatusChange && onStatusChange();
    } catch (error) {
      console.error("Error submitting negotiation:", error);
      alert("Gagal mengirim negosiasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render untuk Driver - Submit Harga Aktual
  if (userRole === 'driver' && order.status === 'shopping') {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <DollarSign className="w-5 h-5" />
            Konfirmasi Harga Barang
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Masukkan harga sebenarnya barang yang sudah kamu beli. Jika berbeda dari budget pelanggan, mereka akan dikonfirmasi terlebih dahulu.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="actual_price">Harga Sebenarnya Barang *</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                Rp
              </span>
              <Input
                id="actual_price"
                type="number"
                placeholder="50000"
                value={priceData.actual_price}
                onChange={(e) => setPriceData(prev => ({...prev, actual_price: e.target.value}))}
                className="pl-12"
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Budget pelanggan: Rp {order.max_budget?.toLocaleString('id-ID')}</p>
              {priceData.actual_price && (
                <p className={`font-semibold ${
                  parseFloat(priceData.actual_price) > order.max_budget 
                    ? 'text-red-600' 
                    : parseFloat(priceData.actual_price) < order.max_budget 
                      ? 'text-green-600' 
                      : 'text-blue-600'
                }`}>
                  {parseFloat(priceData.actual_price) > order.max_budget 
                    ? `Lebih mahal Rp ${(parseFloat(priceData.actual_price) - order.max_budget).toLocaleString('id-ID')}`
                    : parseFloat(priceData.actual_price) < order.max_budget 
                      ? `Lebih murah Rp ${(order.max_budget - parseFloat(priceData.actual_price)).toLocaleString('id-ID')}`
                      : 'Sesuai budget'
                  }
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="price_explanation">Penjelasan Harga</Label>
            <Textarea
              id="price_explanation"
              placeholder="Jelaskan mengapa harga berbeda dari budget (misal: barang sedang naik harga, ada promo, dll)"
              value={priceData.price_explanation}
              onChange={(e) => setPriceData(prev => ({...prev, price_explanation: e.target.value}))}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Bukti Foto Struk/Harga</Label>
            <div className="mt-2 space-y-3">
              {priceData.price_evidence_urls.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`Bukti harga ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-blue-300 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="evidence-upload"
                />
                <label htmlFor="evidence-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    {imageUploading ? (
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                    <p className="text-sm text-gray-600">
                      {imageUploading ? "Mengupload..." : "Upload foto struk/harga"}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDriverSubmitPrice}
            disabled={isSubmitting || !priceData.actual_price}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Mengirim..." : "Konfirmasi Harga ke Pelanggan"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render untuk Customer - Respon Konfirmasi Harga
  if (userRole === 'customer' && order.status === 'price_confirmation') {
    const actualPrice = parseFloat(order.actual_price);
    const maxBudget = parseFloat(order.max_budget);
    const priceDifference = actualPrice - maxBudget;

    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="w-5 h-5" />
            Konfirmasi Harga dari Driver
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Budget Awal:</p>
                <p className="font-semibold text-lg">Rp {maxBudget.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-gray-600">Harga Sebenarnya:</p>
                <p className="font-semibold text-lg">Rp {actualPrice.toLocaleString('id-ID')}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className={`text-center p-3 rounded-lg ${
                priceDifference > 0 
                  ? 'bg-red-50 text-red-800 border border-red-200' 
                  : priceDifference < 0 
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                <p className="font-semibold">
                  {priceDifference > 0 
                    ? `Perlu bayar tambahan: Rp ${priceDifference.toLocaleString('id-ID')}`
                    : priceDifference < 0 
                      ? `Kamu akan dapat refund: Rp ${Math.abs(priceDifference).toLocaleString('id-ID')}`
                      : 'Harga sesuai budget!'
                  }
                </p>
              </div>
            </div>

            {order.price_explanation && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Penjelasan Driver:</strong> {order.price_explanation}
                </p>
              </div>
            )}

            {order.price_evidence_urls && order.price_evidence_urls.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Bukti Foto:</p>
                <div className="grid grid-cols-2 gap-2">
                  {order.price_evidence_urls.map((url, index) => (
                    <img 
                      key={index}
                      src={url} 
                      alt={`Bukti ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => handleCustomerResponse('approved')}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {priceDifference > 0 ? 'Setuju & Bayar Tambahan' : 'Setuju & Lanjutkan'}
            </Button>
            
            <Button
              onClick={() => handleCustomerResponse('rejected')}
              disabled={isSubmitting}
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Nego Harga
            </Button>
            
            <Button
              onClick={() => handleCustomerResponse('cancelled')}
              disabled={isSubmitting}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Batalkan Pesanan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render untuk Customer - Negosiasi Harga
  if (userRole === 'customer' && order.status === 'price_negotiation') {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <MessageSquare className="w-5 h-5" />
            Negosiasi Harga
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tawarkan counter harga yang kamu rasa wajar. Driver akan mempertimbangkan dan merespon.
            </AlertDescription>
          </Alert>

          <div className="bg-white rounded-lg p-4 border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Harga Driver:</p>
                <p className="font-semibold text-lg">Rp {order.actual_price?.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-gray-600">Budget Awalmu:</p>
                <p className="font-semibold text-lg">Rp {order.max_budget?.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="counter_offer">Tawarkan Harga</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                Rp
              </span>
              <Input
                id="counter_offer"
                type="number"
                placeholder="45000"
                value={priceData.actual_price}
                onChange={(e) => setPriceData(prev => ({...prev, actual_price: e.target.value}))}
                className="pl-12"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="negotiation_notes">Alasan Negosiasi</Label>
            <Textarea
              id="negotiation_notes"
              placeholder="Jelaskan mengapa kamu mengajukan harga ini..."
              value={priceData.price_explanation}
              onChange={(e) => setPriceData(prev => ({...prev, price_explanation: e.target.value}))}
              className="mt-2"
            />
          </div>

          <Button
            onClick={handleNegotiationSubmit}
            disabled={isSubmitting || !priceData.actual_price}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Penawaran"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}