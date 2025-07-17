import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TruckIcon, MapPin, Cloud, Clock, Wallet, TrendingUp } from "lucide-react";

export default function EarningBreakdownDisplay({ calculation }) {
  const getDistanceIcon = (distance) => {
    switch (distance) {
      case "near": return "🚶‍♂️ Dekat";
      case "medium": return "🚗 Sedang";  
      case "far": return "🛣️ Jauh";
      default: return "📍";
    }
  };
  
  const getConditionIcon = (condition) => {
    switch (condition) {
      case "rain": return "🌧️ Hujan";
      case "traffic": return "🚦 Macet";
      case "night": return "🌙 Malam";
      case "rain_night": return "⛈️ Hujan Malam";
      default: return "☀️ Normal";
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <TruckIcon className="w-4 h-4 text-purple-600" />
            Driver Earning Breakdown
          </h4>
          <Badge className={`${calculation.metrics.is_worthwhile ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {calculation.metrics.is_worthwhile ? 'Worth It!' : 'Low Earning'}
          </Badge>
        </div>

        {/* Condition Indicators */}
        <div className="flex gap-2 text-sm">
          <Badge variant="outline">
            <MapPin className="w-3 h-3 mr-1" />
            {getDistanceIcon(calculation.distance)}
          </Badge>
          <Badge variant="outline">
            <Cloud className="w-3 h-3 mr-1" />
            {getConditionIcon(calculation.condition)}
          </Badge>
          {calculation.conditionMultiplier > 1 && (
            <Badge className="bg-amber-100 text-amber-800">
              +{Math.round((calculation.conditionMultiplier - 1) * 100)}% Bonus
            </Badge>
          )}
        </div>

        {/* Earning Breakdown */}
        <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
          <h5 className="font-medium text-purple-800 mb-2">💰 Earning Structure:</h5>
          
          {calculation.itemPrice < 100000 ? (
            <div className="flex justify-between">
              <span>Base Earning (Flat):</span>
              <span className="font-semibold">Rp {calculation.baseEarning.toLocaleString('id-ID')}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Service Fee ({calculation.driverFeePercentage}%):</span>
                <span>Rp {calculation.driverServiceFee.toLocaleString('id-ID')}</span>
              </div>
              {calculation.conditionMultiplier > 1 && (
                <div className="flex justify-between text-xs text-amber-600">
                  <span>Condition Bonus:</span>
                  <span>+Rp {Math.round(calculation.driverServiceFee * (calculation.conditionMultiplier - 1)).toLocaleString('id-ID')}</span>
                </div>
              )}
            </>
          )}

          {calculation.tipAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Tip dari Customer:</span>
              <span>Rp {calculation.tipAmount.toLocaleString('id-ID')}</span>
            </div>
          )}

          <hr className="my-2" />
          
          <div className="flex justify-between font-medium">
            <span>Gross Earning:</span>
            <span>Rp {calculation.grossEarning.toLocaleString('id-ID')}</span>
          </div>
          
          <div className="flex justify-between text-red-600 text-xs">
            <span>- Platform Fee (25%):</span>
            <span>Rp {calculation.platformFeeFromDriver.toLocaleString('id-ID')}</span>
          </div>
          
          <hr className="my-2" />
          
          <div className="flex justify-between font-bold text-green-600">
            <span>Net Take Home:</span>
            <span>Rp {calculation.netEarning.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-blue-50 rounded p-2 text-center">
            <div className="font-semibold text-blue-800">{calculation.metrics.effective_rate}%</div>
            <div className="text-blue-600">Effective Rate</div>
          </div>
          <div className="bg-green-50 rounded p-2 text-center">
            <div className="font-semibold text-green-800">Rp {calculation.metrics.earning_per_hour_estimate.toLocaleString('id-ID')}</div>
            <div className="text-green-600">Est/Hour</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}