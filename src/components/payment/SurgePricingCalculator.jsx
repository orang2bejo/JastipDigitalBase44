import React, { useState, useEffect } from "react";
import { PricingRule } from "@/api/entities";
import { Order } from "@/api/entities";
import { Driver } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  TrendingUp, 
  CloudRain, 
  Users, 
  AlertTriangle,
  Info,
  Zap
} from "lucide-react";

export default function SurgePricingCalculator({ 
  baseFee = 15000, 
  itemCategory = "lainnya",
  deliveryZone = null,
  onPricingCalculated 
}) {
  const [pricingData, setPricingData] = useState({
    finalFee: baseFee,
    multiplier: 1.0,
    appliedRules: [],
    surgeReason: "",
    isLoading: true
  });

  useEffect(() => {
    calculateSurgePricing();
  }, [baseFee, itemCategory, deliveryZone]);

  const calculateSurgePricing = async () => {
    try {
      setPricingData(prev => ({ ...prev, isLoading: true }));

      // 1. Ambil semua pricing rules yang aktif
      const allRules = await PricingRule.filter({ is_active: true }, "priority", 20);
      
      // 2. Dapatkan faktor-faktor saat ini
      const currentFactors = await getCurrentFactors();
      
      // 3. Filter rules yang applicable
      const applicableRules = filterApplicableRules(allRules, currentFactors);
      
      // 4. Hitung multiplier final
      const calculation = calculateFinalPricing(applicableRules, currentFactors);
      
      // 5. Update state
      setPricingData({
        finalFee: Math.round(baseFee * calculation.finalMultiplier),
        multiplier: calculation.finalMultiplier,
        appliedRules: calculation.appliedRules,
        surgeReason: calculation.surgeReason,
        factors: currentFactors,
        isLoading: false
      });

      // 6. Callback ke parent component
      if (onPricingCalculated) {
        onPricingCalculated({
          originalFee: baseFee,
          finalFee: Math.round(baseFee * calculation.finalMultiplier),
          multiplier: calculation.finalMultiplier,
          appliedRules: calculation.appliedRules,
          surgeAmount: Math.round(baseFee * calculation.finalMultiplier) - baseFee
        });
      }

    } catch (error) {
      console.error("Error calculating surge pricing:", error);
      setPricingData(prev => ({ 
        ...prev, 
        isLoading: false,
        finalFee: baseFee,
        multiplier: 1.0,
        appliedRules: [],
        surgeReason: "Error in calculation"
      }));
    }
  };

  const getCurrentFactors = async () => {
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
    
    // Faktor waktu
    const timeFactors = {
      currentTime: jakartaTime,
      hour: jakartaTime.getHours(),
      dayOfWeek: jakartaTime.getDay(), // 0 = Sunday
      isWeekend: jakartaTime.getDay() === 0 || jakartaTime.getDay() === 6,
      isPeakHour: isPeakHour(jakartaTime.getHours()),
      isLateNight: jakartaTime.getHours() >= 22 || jakartaTime.getHours() <= 5
    };

    // Faktor demand (simplified - dalam production bisa lebih complex)
    const demandFactors = await calculateDemandFactors();
    
    // Faktor cuaca (mock data - dalam production integrate dengan weather API)
    const weatherFactors = getWeatherFactors();

    return {
      time: timeFactors,
      demand: demandFactors,
      weather: weatherFactors
    };
  };

  const isPeakHour = (hour) => {
    // Peak hours: 7-9 (pagi), 12-14 (siang), 17-19 (sore)
    return (hour >= 7 && hour <= 9) || 
           (hour >= 12 && hour <= 14) || 
           (hour >= 17 && hour <= 19);
  };

  const calculateDemandFactors = async () => {
    try {
      // Hitung pesanan aktif dalam 30 menit terakhir
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const recentOrders = await Order.filter({
        status: ["pending", "accepted", "shopping", "delivering"]
      }, "-created_date", 50);
      
      const recentActiveOrders = recentOrders.filter(order => 
        new Date(order.created_date) > new Date(thirtyMinutesAgo)
      );

      // Hitung driver yang tersedia
      const availableDrivers = await Driver.filter({
        status: "available"
      }, "", 100);

      const demandRatio = availableDrivers.length > 0 
        ? recentActiveOrders.length / availableDrivers.length 
        : 5; // Jika tidak ada driver, set ratio tinggi

      return {
        activeOrdersLast30Min: recentActiveOrders.length,
        availableDrivers: availableDrivers.length,
        demandRatio: demandRatio,
        isHighDemand: demandRatio > 2,
        isCriticalDemand: demandRatio > 5
      };
    } catch (error) {
      console.error("Error calculating demand:", error);
      return {
        activeOrdersLast30Min: 0,
        availableDrivers: 10,
        demandRatio: 0,
        isHighDemand: false,
        isCriticalDemand: false
      };
    }
  };

  const getWeatherFactors = () => {
    // Mock weather data - dalam production integrate dengan OpenWeatherMap API
    const weatherConditions = ['sunny', 'cloudy', 'light_rain', 'heavy_rain'];
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    return {
      condition: randomWeather,
      isBadWeather: ['heavy_rain', 'storm'].includes(randomWeather),
      severity: randomWeather === 'heavy_rain' ? 'high' : 'low'
    };
  };

  const filterApplicableRules = (allRules, factors) => {
    return allRules.filter(rule => {
      // Filter berdasarkan kategori
      if (rule.applicable_categories && rule.applicable_categories.length > 0) {
        if (!rule.applicable_categories.includes(itemCategory)) {
          return false;
        }
      }

      // Filter berdasarkan zona
      if (rule.applicable_zones && rule.applicable_zones.length > 0 && deliveryZone) {
        if (!rule.applicable_zones.includes(deliveryZone)) {
          return false;
        }
      }

      // Filter berdasarkan jenis rule
      if (rule.rule_type === 'time_based' && rule.time_rules) {
        return isTimeRuleApplicable(rule.time_rules, factors.time);
      }

      if (rule.rule_type === 'weather_based' && rule.weather_rules) {
        return isWeatherRuleApplicable(rule.weather_rules, factors.weather);
      }

      if (rule.rule_type === 'demand_based' && rule.demand_rules) {
        return isDemandRuleApplicable(rule.demand_rules, factors.demand);
      }

      return true;
    });
  };

  const isTimeRuleApplicable = (timeRules, timeFactors) => {
    // Check day of week
    if (timeRules.days_of_week && timeRules.days_of_week.length > 0) {
      if (!timeRules.days_of_week.includes(timeFactors.dayOfWeek)) {
        return false;
      }
    }

    // Check time range
    if (timeRules.start_time && timeRules.end_time) {
      const currentHour = timeFactors.hour;
      const startHour = parseInt(timeRules.start_time.split(':')[0]);
      const endHour = parseInt(timeRules.end_time.split(':')[0]);
      
      if (startHour <= endHour) {
        // Normal range (e.g., 9-17)
        if (currentHour < startHour || currentHour > endHour) {
          return false;
        }
      } else {
        // Overnight range (e.g., 22-6)
        if (currentHour < startHour && currentHour > endHour) {
          return false;
        }
      }
    }

    return true;
  };

  const isWeatherRuleApplicable = (weatherRules, weatherFactors) => {
    if (weatherRules.weather_conditions && weatherRules.weather_conditions.length > 0) {
      return weatherRules.weather_conditions.includes(weatherFactors.condition);
    }
    return weatherFactors.isBadWeather;
  };

  const isDemandRuleApplicable = (demandRules, demandFactors) => {
    if (demandRules.demand_threshold) {
      return demandFactors.activeOrdersLast30Min >= demandRules.demand_threshold;
    }
    if (demandRules.driver_availability_threshold) {
      return demandFactors.availableDrivers <= demandRules.driver_availability_threshold;
    }
    return demandFactors.isHighDemand;
  };

  const calculateFinalPricing = (applicableRules, factors) => {
    let finalMultiplier = 1.0;
    let appliedRules = [];
    let surgeReasons = [];

    // Sort rules by priority (highest first)
    const sortedRules = applicableRules.sort((a, b) => (b.priority || 1) - (a.priority || 1));

    for (const rule of sortedRules) {
      const ruleMultiplier = rule.price_multiplier || 1.0;
      
      // Apply multiplier (bisa additive atau multiplicative tergantung strategy)
      if (rule.rule_type === 'demand_based') {
        // Demand multiplier bersifat multiplicative
        finalMultiplier *= ruleMultiplier;
      } else {
        // Time dan weather multiplier bersifat additive
        finalMultiplier += (ruleMultiplier - 1.0);
      }

      // Cap maximum multiplier
      const maxCap = rule.max_multiplier_cap || 3.0;
      finalMultiplier = Math.min(finalMultiplier, maxCap);

      appliedRules.push({
        id: rule.id,
        name: rule.rule_name,
        type: rule.rule_type,
        multiplier: ruleMultiplier,
        reason: getRuleReason(rule, factors)
      });

      surgeReasons.push(getRuleReason(rule, factors));
    }

    // Ensure minimum multiplier
    finalMultiplier = Math.max(finalMultiplier, 0.5);

    return {
      finalMultiplier: Math.round(finalMultiplier * 100) / 100, // Round to 2 decimal places
      appliedRules,
      surgeReason: surgeReasons.join(', ') || 'Normal pricing'
    };
  };

  const getRuleReason = (rule, factors) => {
    switch (rule.rule_type) {
      case 'time_based':
        if (factors.time.isPeakHour) return 'Jam sibuk';
        if (factors.time.isLateNight) return 'Malam hari';
        if (factors.time.isWeekend) return 'Akhir pekan';
        return 'Waktu khusus';
      case 'weather_based':
        if (factors.weather.isBadWeather) return 'Cuaca buruk';
        return 'Kondisi cuaca';
      case 'demand_based':
        if (factors.demand.isCriticalDemand) return 'Permintaan sangat tinggi';
        if (factors.demand.isHighDemand) return 'Permintaan tinggi';
        return 'Ketersediaan driver terbatas';
      default:
        return rule.rule_name;
    }
  };

  if (pricingData.isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Menghitung harga...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const surgeAmount = pricingData.finalFee - baseFee;
  const isDiscounted = pricingData.multiplier < 1.0;
  const isSurge = pricingData.multiplier > 1.0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Kalkulasi Harga
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Harga Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Harga Dasar</p>
              <p className="text-lg font-semibold">Rp {baseFee.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Harga Final</p>
              <p className="text-2xl font-bold text-blue-600">
                Rp {pricingData.finalFee.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          
          {(isSurge || isDiscounted) && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {isDiscounted ? 'Diskon' : 'Surge Pricing'}
                </span>
                <span className={`font-semibold ${
                  isDiscounted ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {isDiscounted ? '-' : '+'}Rp {Math.abs(surgeAmount).toLocaleString('id-ID')}
                  <span className="ml-1 text-sm">
                    ({pricingData.multiplier}x)
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Applied Rules */}
        {pricingData.appliedRules.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Faktor Harga Aktif
            </h4>
            <div className="space-y-2">
              {pricingData.appliedRules.map((rule, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {rule.type === 'time_based' && <Clock className="w-4 h-4 text-blue-500" />}
                    {rule.type === 'weather_based' && <CloudRain className="w-4 h-4 text-gray-500" />}
                    {rule.type === 'demand_based' && <Users className="w-4 h-4 text-orange-500" />}
                    <span className="text-sm font-medium">{rule.reason}</span>
                  </div>
                  <Badge variant={rule.multiplier > 1 ? "destructive" : "secondary"}>
                    {rule.multiplier}x
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Factors Info */}
        {pricingData.factors && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-700">Info Waktu</h5>
              <div className="space-y-1 text-gray-600">
                <p>• Jam: {pricingData.factors.time.hour}:00</p>
                <p>• {pricingData.factors.time.isWeekend ? 'Akhir pekan' : 'Hari kerja'}</p>
                {pricingData.factors.time.isPeakHour && <p>• Jam sibuk</p>}
                {pricingData.factors.time.isLateNight && <p>• Malam hari</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-700">Info Demand</h5>
              <div className="space-y-1 text-gray-600">
                <p>• Pesanan aktif: {pricingData.factors.demand.activeOrdersLast30Min}</p>
                <p>• Driver tersedia: {pricingData.factors.demand.availableDrivers}</p>
                {pricingData.factors.demand.isHighDemand && (
                  <p className="text-orange-600 font-medium">• Permintaan tinggi</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Surge Alert */}
        {isSurge && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Surge Pricing Aktif!</strong> Harga naik karena: {pricingData.surgeReason}.
              Kamu bisa menunggu beberapa saat untuk harga yang lebih normal.
            </AlertDescription>
          </Alert>
        )}

        {/* Discount Alert */}
        {isDiscounted && (
          <Alert className="border-green-200 bg-green-50">
            <Info className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Harga Spesial!</strong> Kamu mendapat diskon karena: {pricingData.surgeReason}.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}