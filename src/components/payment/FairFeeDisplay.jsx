import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Heart, CheckCircle, Info } from "lucide-react";

export default function FairFeeDisplay({ calculation }) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Fair Fee System - Split 50/50
          </h4>
          <Badge className="bg-green-100 text-green-800">
            <Users className="w-3 h-3 mr-1" />
            Fair Partnership
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Customer Side */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
              👤 Customer Bayar:
            </h5>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Harga Barang:</span>
                <span>Rp {calculation.itemPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim:</span>
                <span>Rp {calculation.deliveryFee.toLocaleString('id-ID')}</span>
              </div>
              {calculation.tipAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tip Driver:</span>
                  <span>Rp {calculation.tipAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-blue-700">
                <span>Biaya Layanan (50%):</span>
                <span>Rp {calculation.customerFee.toLocaleString('id-ID')}</span>
              </div>
              <hr className="my-1 border-blue-200" />
              <div className="flex justify-between font-bold text-blue-800">
                <span>Total Bayar:</span>
                <span>Rp {calculation.totalCustomerPayment.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Driver Side */}
          <div className="bg-purple-50 rounded-lg p-3">
            <h5 className="font-medium text-purple-800 mb-2 flex items-center gap-1">
              🚗 Driver Earning:
            </h5>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Ongkir + Tip:</span>
                <span>Rp {calculation.driverGrossEarning.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-purple-700">
                <span>- Biaya Platform (50%):</span>
                <span>Rp {calculation.driverFee.toLocaleString('id-ID')}</span>
              </div>
              <hr className="my-1 border-purple-200" />
              <div className="flex justify-between font-bold text-purple-800">
                <span>Driver Terima:</span>
                <span>Rp {calculation.driverNetEarning.toLocaleString('id-ID')}</span>
              </div>
              <div className="text-xs text-purple-600 mt-1">
                Fee burden: {calculation.fairnessMetrics.driverFeePercentage}% dari earning
              </div>
            </div>
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Platform Revenue & Sustainability
          </h5>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <span className="text-gray-600">Total Fee</span>
              <p className="font-semibold text-green-600">Rp {calculation.totalPlatformFee.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Gross Margin</span>
              <p className="font-semibold text-green-600">Rp {calculation.costAnalysis.grossMargin.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-center">
              <span className="text-gray-600">Margin %</span>
              <p className="font-semibold text-green-600">{calculation.costAnalysis.marginPercentage}%</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-green-100">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Break Even:</span>
              <span className="font-medium text-green-700">
                {calculation.costAnalysis.breakEvenTransactions} transaksi/bulan
              </span>
            </div>
          </div>
        </div>

        {/* Fairness Indicator */}
        <div className="flex items-start gap-2 p-3 bg-green-100 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
          <div className="text-xs text-green-800">
            <strong>Why This is Fair:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Customer: Hanya bayar 50% biaya layanan yang mereka gunakan</li>
              <li>Driver: Ikut invest di platform yang memberikan mereka income</li>
              <li>Platform: Revenue sustainable untuk operational & growth</li>
              <li>Partnership model, bukan exploitative model</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-100 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <strong>Competitive Positioning:</strong> Customer bayar fee lebih rendah dari platform lain (Rp 3.500 vs Rp 5.000+), driver tetap profit decent. Win-win untuk semua pihak!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}