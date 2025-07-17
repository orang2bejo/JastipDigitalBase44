import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, Users, AlertTriangle, CheckCircle } from "lucide-react";

export default function FeeBreakdownDisplay({ calculation }) {
  const getPhaseInfo = (phase) => {
    switch (phase) {
      case "bootstrap":
        return {
          label: "Bootstrap Mode",
          color: "bg-blue-100 text-blue-800",
          icon: <TrendingUp className="w-3 h-3" />,
          description: "Fee sustainable ke customer, driver earning maksimal"
        };
      case "growth":
        return {
          label: "Growth Mode", 
          color: "bg-green-100 text-green-800",
          icon: <Users className="w-3 h-3" />,
          description: "Fee split antara customer dan driver"
        };
      case "mature":
        return {
          label: "Mature Mode",
          color: "bg-purple-100 text-purple-800", 
          icon: <TrendingUp className="w-3 h-3" />,
          description: "Fee majority dari driver, harga competitive"
        };
      default:
        return { label: "Unknown", color: "bg-gray-100 text-gray-800" };
    }
  };

  const phaseInfo = getPhaseInfo(calculation.phase);

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">💰 Rincian Pembayaran Sustainable</h4>
          <Badge className={phaseInfo.color}>
            {phaseInfo.icon}
            <span className="ml-1">{phaseInfo.label}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Customer Payment */}
          <div className="space-y-2">
            <h5 className="font-medium text-blue-800">Yang Customer Bayar:</h5>
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
              {calculation.feeToCustomer > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Layanan:</span>
                  <span>Rp {calculation.feeToCustomer.toLocaleString('id-ID')}</span>
                </div>
              )}
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-green-600">
                <span>Total Bayar:</span>
                <span>Rp {calculation.totalCustomerPayment.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Driver Earning */}
          <div className="space-y-2">
            <h5 className="font-medium text-purple-800">Driver Earning:</h5>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Ongkir + Tip:</span>
                <span>Rp {calculation.driverGrossEarning.toLocaleString('id-ID')}</span>
              </div>
              {calculation.feeFromDriver > 0 && (
                <div className="flex justify-between text-xs text-red-600">
                  <span>- Fee Platform:</span>
                  <span>Rp {calculation.feeFromDriver.toLocaleString('id-ID')}</span>
                </div>
              )}
              <hr className="my-1" />
              <div className="flex justify-between font-medium text-green-600">
                <span>Driver Terima:</span>
                <span>Rp {calculation.driverNetEarning.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sustainability Analysis */}
        <div className="bg-white rounded-lg p-3 border">
          <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            {calculation.costAnalysis.isSustainable ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            Analisa Sustainability
          </h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-600">Total Fee:</span>
              <p className="font-semibold">Rp {calculation.jastipFee.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <span className="text-gray-600">Variable Cost:</span>
              <p className="font-semibold text-red-600">Rp {calculation.costAnalysis.variableCost.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <span className="text-gray-600">Gross Margin:</span>
              <p className={`font-semibold ${calculation.costAnalysis.grossMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rp {calculation.costAnalysis.grossMargin.toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Margin %:</span>
              <p className={`font-semibold ${calculation.costAnalysis.marginPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {calculation.costAnalysis.marginPercentage}%
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t">
            <span className="text-gray-600 text-xs">Break Even Point:</span>
            <p className="font-semibold text-blue-600 text-xs">
              {typeof calculation.costAnalysis.breakEvenTransactions === 'number' 
                ? `${calculation.costAnalysis.breakEvenTransactions} transaksi/bulan`
                : calculation.costAnalysis.breakEvenTransactions
              }
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-100 rounded-lg">
          <Info className="w-4 h-4 text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-800">
            <strong>Realitas Bisnis:</strong> Fee minimum Rp 6.000 diperlukan untuk menutupi operational cost (Midtrans 2.9% + admin + support). Fee Rp 3.000 akan menyebabkan kerugian per transaksi.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}