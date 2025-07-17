import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Cloud, 
  Car, 
  Clock, 
  TrendingUp, 
  Zap,
  Thermometer,
  Users
} from "lucide-react";

export default function DynamicPricingDisplay({ calculation }) {
  const getWeatherIcon = (weather) => {
    switch (weather) {
      case "sunny": return "☀️";
      case "cloudy": return "☁️";
      case "light_rain": return "🌦️";
      case "heavy_rain": return "🌧️";
      case "storm": return "⛈️";
      case "fog": return "🌫️";
      default: return "🌤️";
    }
  };
  
  const getTrafficIcon = (traffic) => {
    switch (traffic) {
      case "smooth": return "🟢";
      case "moderate": return "🟡"; 
      case "heavy": return "🟠";
      case "gridlock": return "🔴";
      default: return "⚪";
    }
  };
  
  const getMultiplierColor = (multiplier) => {
    if (multiplier >= 2.0) return "text-red-600 font-bold";
    if (multiplier >= 1.5) return "text-orange-600 font-semibold";
    if (multiplier >= 1.2) return "text-yellow-600 font-medium";
    return "text-green-600";
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            Dynamic Pricing - {calculation.cityName}
          </h4>
          <div className="flex gap-1">
            <Badge className="bg-blue-100 text-blue-800">
              <MapPin className="w-3 h-3 mr-1" />
              {calculation.cityTier.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={`${getMultiplierColor(calculation.appliedMultiplier)}`}>
              {calculation.appliedMultiplier}x
            </Badge>
          </div>
        </div>

        {/* Current Conditions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white rounded-lg p-2 text-center">
            <div className="text-lg mb-1">
              {getWeatherIcon(calculation.conditions.weather)}
            </div>
            <p className="text-gray-600">Cuaca</p>
            <p className="font-medium">{calculation.conditions.weather}</p>
          </div>
          
          <div className="bg-white rounded-lg p-2 text-center">
            <div className="text-lg mb-1">
              {getTrafficIcon(calculation.conditions.traffic)}
            </div>
            <p className="text-gray-600">Traffic</p>
            <p className="font-medium">{calculation.conditions.traffic}</p>
          </div>
          
          <div className="bg-white rounded-lg p-2 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <p className="text-gray-600">Waktu</p>
            <p className="font-medium">{calculation.conditions.timeOfDay}</p>
          </div>
          
          <div className="bg-white rounded-lg p-2 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <p className="text-gray-600">Demand</p>
            <p className="font-medium">{calculation.conditions.demandSurge}x</p>
          </div>
        </div>

        {/* Special Events Alert */}
        {calculation.conditions.events && calculation.conditions.events.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-800 text-sm">
              <strong>⚠️ Kondisi Khusus:</strong> {calculation.conditions.events.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {/* Pricing Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Customer Side */}
          <div className="bg-white rounded-lg p-3">
            <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
              👤 Customer Bayar:
            </h5>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Harga Barang:</span>
                <span>Rp {calculation.itemPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Driver Earning:</span>
                <span>Rp {calculation.grossDriverEarning.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee Platform:</span>
                <span>Rp {calculation.companyFeeFromCustomer.toLocaleString('id-ID')}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-green-600">
                <span>Total Bayar:</span>
                <span>Rp {calculation.totalCustomerPayment.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Driver Side */}
          <div className="bg-white rounded-lg p-3">
            <h5 className="font-medium text-purple-800 mb-2 flex items-center gap-1">
              🚗 Driver Earning:
            </h5>
            <div className="space-y-1">
              {calculation.baseDriverEarning > 0 && (
                <div className="flex justify-between text-xs">
                  <span>Base (flat):</span>
                  <span>Rp {calculation.baseDriverEarning.toLocaleString('id-ID')}</span>
                </div>
              )}
              {calculation.driverServiceFee > 0 && (
                <div className="flex justify-between text-xs">
                  <span>Service Fee ({calculation.finalFeePercentage}%):</span>
                  <span>Rp {calculation.driverServiceFee.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span>Gross Total:</span>
                <span className="font-medium">Rp {calculation.grossDriverEarning.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-xs text-red-600">
                <span>- Fee Platform:</span>
                <span>Rp {calculation.companyFeeFromDriver.toLocaleString('id-ID')}</span>
              </div>
              <hr className="my-1" />
              <div className="flex justify-between font-bold text-green-600">
                <span>Net Take Home:</span>
                <span>Rp {calculation.netDriverEarning.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Pricing Info */}
        <Alert className="border-green-200 bg-green-50">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-sm">
            <strong>🎯 Smart Pricing:</strong> Fee driver disesuaikan dengan kondisi real-time. 
            Base {calculation.baseFeePercentage}% → Final {calculation.finalFeePercentage}% 
            (multiplier {calculation.appliedMultiplier}x). 
            Company fee tetap split: Customer Rp 5k, Driver Rp 3k.
          </AlertDescription>
        </Alert>

        {/* Worthwhile Indicator */}
        <div className="text-center">
          <Badge className={calculation.worthwhileOrder ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
            {calculation.worthwhileOrder ? "✅ Order Menguntungkan" : "⚠️ Order Margin Kecil"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}