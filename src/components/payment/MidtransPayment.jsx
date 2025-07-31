import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function MidtransPayment({ order, onPaymentUpdate }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [snapToken, setSnapToken] = useState(null);

  // Check if payment is needed for this order
  const needsPayment = order && (
    order.status === 'confirmed' || 
    order.status === 'awaiting_payment'
  ) && order.confirmed_price;

  const totalAmount = order?.confirmed_price || 0;
  const platformFee = Math.round(totalAmount * 0.05); // 5% platform fee
  const finalAmount = totalAmount + platformFee;

  useEffect(() => {
    // Load Midtrans Snap script
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', 'YOUR_MIDTRANS_CLIENT_KEY'); // Replace with actual client key
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!order || !needsPayment) return;

    setIsProcessing(true);
    try {
      // In a real implementation, you would call your backend to create the payment token
      // For now, we'll simulate the process
      
      // Simulate API call to get snap token
      const paymentRequest = {
        order_id: order.id,
        gross_amount: finalAmount,
        customer_details: {
          first_name: order.User?.full_name || 'Customer',
          email: order.User?.email || 'customer@example.com',
          phone: order.User?.phone_number || '08123456789'
        },
        item_details: [
          {
            id: 'item-1',
            price: totalAmount,
            quantity: 1,
            name: order.item_description
          },
          {
            id: 'platform-fee',
            price: platformFee,
            quantity: 1,
            name: 'Platform Fee'
          }
        ]
      };

      // Simulate token generation (in real app, call your backend)
      // const response = await fetch('/api/payment/create-midtrans-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(paymentRequest)
      // });
      // const { token } = await response.json();

      // For demo purposes, we'll simulate the token
      const simulatedToken = 'simulated-snap-token-' + Date.now();
      setSnapToken(simulatedToken);

      // In real implementation, you would use:
      // window.snap.pay(token, {
      //   onSuccess: handlePaymentSuccess,
      //   onPending: handlePaymentPending,
      //   onError: handlePaymentError,
      //   onClose: handlePaymentClose
      // });

      // For demo, we'll simulate a successful payment after 2 seconds
      setTimeout(() => {
        handlePaymentSuccess({
          order_id: order.id,
          transaction_status: 'settlement',
          payment_type: 'credit_card'
        });
      }, 2000);

    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentStatus('error');
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (result) => {
    console.log('Payment success:', result);
    setPaymentStatus('success');
    setIsProcessing(false);
    
    // Update order status
    if (onPaymentUpdate) {
      onPaymentUpdate();
    }
  };

  const handlePaymentPending = (result) => {
    console.log('Payment pending:', result);
    setPaymentStatus('pending');
    setIsProcessing(false);
  };

  const handlePaymentError = (result) => {
    console.log('Payment error:', result);
    setPaymentStatus('error');
    setIsProcessing(false);
  };

  const handlePaymentClose = () => {
    console.log('Payment popup closed');
    setIsProcessing(false);
  };

  if (!needsPayment) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CreditCard className="w-5 h-5" />
          Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Harga barang:</span>
              <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya platform (5%):</span>
              <span>Rp {platformFee.toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total pembayaran:</span>
              <span className="text-green-600">Rp {finalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {paymentStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-600 bg-green-100 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span>Pembayaran berhasil! Pesanan akan segera diproses.</span>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="flex items-center gap-2 text-red-600 bg-red-100 p-3 rounded-lg">
            <XCircle className="w-5 h-5" />
            <span>Pembayaran gagal. Silakan coba lagi.</span>
          </div>
        )}

        {paymentStatus === 'pending' && (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-100 p-3 rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Pembayaran sedang diproses...</span>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handlePayment}
            disabled={isProcessing || paymentStatus === 'success'}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : paymentStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Pembayaran Selesai
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Bayar Sekarang
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Pembayaran diamankan oleh Midtrans
          <br />
          Metode: Credit Card, Bank Transfer, E-Wallet, dan lainnya
        </div>
      </CardContent>
    </Card>
  );
}