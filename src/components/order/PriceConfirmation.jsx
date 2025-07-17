
import React, { useState } from "react";
import { Order } from "@/api/entities";
import { Notification } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function PriceConfirmation({ order, onUpdate, userType }) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handlePriceImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      await Order.update(order.id, {
        price_confirmation_image: file_url,
        status: "price_confirmation",
        price_confirmation_status: "pending"
      });

      // Send notification to titiper
      await Notification.create({
        user_id: order.created_by,
        order_id: order.id,
        type: "price_confirmation",
        title: "Konfirmasi Harga Diperlukan",
        message: `Driver telah mengirim foto harga untuk pesanan: ${order.item_description}`,
        action_url: `Chat?order=${order.id}`,
        action_label: "Lihat & Konfirmasi",
        priority: "high"
      });

      onUpdate();
    } catch (error) {
      console.error("Error uploading price image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handlePriceResponse = async (approved) => {
    setProcessing(true);
    try {
      const updateData = {
        price_confirmation_status: approved ? "approved" : "rejected",
        status: approved ? "shopping" : "cancelled"
      };

      if (!approved) {
        updateData.cancellation_reason = "Harga melebihi budget customer";
      }

      await Order.update(order.id, updateData);

      // Send notification to driver
      await Notification.create({
        user_id: order.driver_id,
        order_id: order.id,
        type: "price_confirmation",
        title: approved ? "Harga Disetujui" : "Harga Ditolak",
        message: approved 
          ? "Customer menyetujui harga, silakan lanjutkan pembelian"
          : "Customer menolak harga, pesanan dibatalkan",
        priority: "high"
      });

      onUpdate();
    } catch (error) {
      console.error("Error responding to price:", error);
    } finally {
      setProcessing(false);
    }
  };

  if (userType === "driver" && order.status === "accepted") {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Camera className="w-5 h-5" />
            Konfirmasi Harga Sebelum Beli
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Budget maksimum titiper: <strong>Rp {order.max_budget?.toLocaleString('id-ID')}</strong>
            </AlertDescription>
          </Alert>
          
          <p className="text-sm text-amber-700">
            Sebelum membeli, foto harga barang dan kirim ke titiper untuk konfirmasi jika melebihi estimasi.
          </p>
          
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePriceImageUpload}
              className="hidden"
              id="price-photo"
            />
            <label htmlFor="price-photo">
              <Button 
                disabled={uploading}
                className="w-full bg-amber-600 hover:bg-amber-700"
                asChild
              >
                <div>
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Mengirim foto...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Foto Harga Barang
                    </>
                  )}
                </div>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (userType === "customer" && order.status === "price_confirmation") {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <AlertTriangle className="w-5 h-5" />
            Konfirmasi Harga Diperlukan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Budget Maksimum:</span>
              <p className="font-semibold text-green-600">Rp {order.max_budget?.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                {order.price_confirmation_status === 'pending' ? 'Menunggu Konfirmasi' : 'Dikonfirmasi'}
              </Badge>
            </div>
          </div>

          {order.price_confirmation_image && (
            <div>
              <p className="text-sm font-medium text-blue-800 mb-2">Foto Harga dari Driver:</p>
              <img 
                src={order.price_confirmation_image} 
                alt="Konfirmasi harga"
                className="w-full max-w-sm rounded-lg border"
              />
            </div>
          )}

          {order.price_confirmation_status === 'pending' && (
            <div className="flex gap-3">
              <Button
                onClick={() => handlePriceResponse(false)}
                disabled={processing}
                variant="outline"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Tolak & Batalkan
              </Button>
              <Button
                onClick={() => handlePriceResponse(true)}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Setuju & Lanjutkan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
