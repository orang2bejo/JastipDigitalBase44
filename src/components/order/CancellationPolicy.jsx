import React, { useState } from "react";
import { Order } from "@/api/entities";
import { Notification } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, AlertTriangle, Info } from "lucide-react";

export default function CancellationPolicy({ order, userType, onUpdate }) {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const getCancellationFee = () => {
    if (order.status === "pending") return 0;
    if (order.status === "accepted") return 5000; // Fee jika driver sudah berangkat
    if (order.status === "shopping") return 10000; // Fee lebih besar jika sudah belanja
    return 15000; // Fee tertinggi jika sudah delivering
  };

  const canCancel = () => {
    return ["pending", "accepted", "price_confirmation"].includes(order.status);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    
    setProcessing(true);
    try {
      const cancellationFee = getCancellationFee();
      
      await Order.update(order.id, {
        status: "cancelled",
        cancellation_reason: cancelReason,
        cancellation_fee: cancellationFee
      });

      // Send notification
      const notificationTarget = userType === "customer" ? order.driver_id : order.created_by;
      if (notificationTarget) {
        await Notification.create({
          user_id: notificationTarget,
          order_id: order.id,
          type: "order_status",
          title: "Pesanan Dibatalkan",
          message: `Pesanan dibatalkan oleh ${userType}. Alasan: ${cancelReason}`,
          priority: "high"
        });
      }

      onUpdate();
      setShowCancelForm(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setProcessing(false);
    }
  };

  if (!canCancel()) {
    return null;
  }

  if (showCancelForm) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <XCircle className="w-5 h-5" />
            Batalkan Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Biaya pembatalan: <strong>Rp {getCancellationFee().toLocaleString('id-ID')}</strong>
              {getCancellationFee() > 0 && (
                <span className="block text-sm mt-1">
                  Driver sudah {order.status === "accepted" ? "dalam perjalanan" : "mulai berbelanja"}
                </span>
              )}
            </AlertDescription>
          </Alert>

          <div>
            <label className="block text-sm font-medium text-red-800 mb-2">
              Alasan Pembatalan *
            </label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Jelaskan alasan pembatalan..."
              className="border-red-200"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelForm(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleCancel}
              disabled={!cancelReason.trim() || processing}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {processing ? "Memproses..." : "Ya, Batalkan"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Butuh Batalkan Pesanan?</p>
            <p className="text-sm text-gray-600">
              {getCancellationFee() > 0 
                ? `Biaya pembatalan: Rp ${getCancellationFee().toLocaleString('id-ID')}`
                : "Gratis pembatalan"
              }
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowCancelForm(true)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Batalkan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}