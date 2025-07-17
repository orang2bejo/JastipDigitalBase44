import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PaymentSummary({ order, paymentDetails }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const itemPrice = order.confirmed_price || order.actual_price || 0;
    const deliveryFee = paymentDetails?.delivery_fee || calculateDeliveryFee(itemPrice);
    const serviceFee = paymentDetails?.service_fee || calculateServiceFee(itemPrice);
    const totalAmount = itemPrice + deliveryFee + serviceFee;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg">Ringkasan Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Harga Barang</span>
                        <span className="font-semibold">{formatCurrency(itemPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Ongkos Kirim</span>
                        <span className="font-semibold">{formatCurrency(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Biaya Layanan</span>
                        <span className="font-semibold">{formatCurrency(serviceFee)}</span>
                    </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                    <span>Total Pembayaran</span>
                    <span className="text-green-600">{formatCurrency(totalAmount)}</span>
                </div>
                
                <div className="text-xs text-gray-500 mt-3">
                    <p>* Biaya layanan sudah termasuk fee platform dan driver</p>
                    <p>* Pembayaran aman dilindungi oleh Midtrans</p>
                </div>
            </CardContent>
        </Card>
    );
}

function calculateDeliveryFee(itemPrice) {
    const baseDeliveryFee = 8000;
    const percentageFee = Math.max(itemPrice * 0.05, 2000);
    return Math.min(baseDeliveryFee + percentageFee, 25000);
}

function calculateServiceFee(itemPrice) {
    const baseFee = 3000;
    const percentageFee = itemPrice * 0.08;
    return Math.max(baseFee, percentageFee);
}