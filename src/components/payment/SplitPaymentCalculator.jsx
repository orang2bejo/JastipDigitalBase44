import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SplitPaymentCalculator({ orderAmount, onCalculationComplete }) {
  // Component focused on general payment splitting logic
  // Midtrans-specific code removed
  
  const calculateSplit = (amount) => {
    const platformFee = Math.max(5000, amount * 0.08);
    const driverEarning = amount - platformFee;
    
    return {
      totalAmount: amount,
      platformFee,
      driverEarning
    };
  };

  React.useEffect(() => {
    if (orderAmount && onCalculationComplete) {
      const result = calculateSplit(orderAmount);
      onCalculationComplete(result);
    }
  }, [orderAmount, onCalculationComplete]);

  const splitResult = calculateSplit(orderAmount || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pembagian Pembayaran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Pembayaran:</span>
            <span>Rp {splitResult.totalAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Fee Platform:</span>
            <span>Rp {splitResult.platformFee.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Pendapatan Driver:</span>
            <span>Rp {splitResult.driverEarning.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}