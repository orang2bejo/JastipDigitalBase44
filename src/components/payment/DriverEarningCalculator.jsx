import React from "react";

/**
 * Menghitung earning driver berdasarkan harga barang dan kondisi
 * @param {number} itemPrice - Harga barang
 * @param {string} distance - Jarak: "near", "medium", "far"
 * @param {string} condition - Kondisi: "normal", "rain", "traffic", "night"
 * @param {number} tipAmount - Tip dari customer
 * @returns {object} Breakdown earning driver
 */
export const calculateDriverEarning = (itemPrice, distance = "medium", condition = "normal", tipAmount = 0) => {
  let baseEarning = 0;
  let driverFeePercentage = 0;
  let conditionMultiplier = 1;
  
  // Base earning structure
  if (itemPrice < 100000) {
    baseEarning = 10000; // Flat 10rb untuk <100rb
    driverFeePercentage = 0;
  } else {
    baseEarning = 0;
    // Percentage berdasarkan jarak
    switch (distance) {
      case "near": // < 3km
        driverFeePercentage = 0.03; // 3%
        break;
      case "medium": // 3-7km  
        driverFeePercentage = 0.04; // 4%
        break;
      case "far": // > 7km
        driverFeePercentage = 0.05; // 5%
        break;
    }
  }
  
  // Condition multiplier untuk situasi sulit
  switch (condition) {
    case "rain":
      conditionMultiplier = 1.5; // +50%
      break;
    case "traffic":
      conditionMultiplier = 1.3; // +30%
      break;
    case "night": // 22:00 - 06:00
      conditionMultiplier = 1.2; // +20%
      break;
    case "rain_night":
      conditionMultiplier = 2.0; // +100% (kombinasi terburuk)
      break;
    case "normal":
    default:
      conditionMultiplier = 1.0;
      break;
  }
  
  // Hitung earning
  let driverServiceFee = itemPrice >= 100000 ? 
    Math.round(itemPrice * driverFeePercentage * conditionMultiplier) : 0;
    
  let adjustedBaseEarning = itemPrice < 100000 ? 
    Math.round(baseEarning * conditionMultiplier) : 0;
  
  const grossEarning = adjustedBaseEarning + driverServiceFee + tipAmount;
  
  // Platform fee split 50-50 dengan customer
  const platformFeeFromDriver = Math.round(grossEarning * 0.25); // 25% dari earning driver
  const netEarning = grossEarning - platformFeeFromDriver;
  
  return {
    itemPrice,
    distance,
    condition,
    baseEarning: adjustedBaseEarning,
    driverServiceFee,
    driverFeePercentage: Math.round(driverFeePercentage * 100),
    conditionMultiplier,
    tipAmount,
    grossEarning,
    platformFeeFromDriver,
    netEarning,
    breakdown: {
      base_or_service: adjustedBaseEarning + driverServiceFee,
      tip: tipAmount,
      gross_total: grossEarning,
      platform_fee: platformFeeFromDriver,
      net_take_home: netEarning
    },
    metrics: {
      effective_rate: itemPrice > 0 ? Math.round((netEarning / itemPrice) * 100) : 0,
      earning_per_hour_estimate: Math.round(netEarning / 1.5), // Asumsi 1.5 jam per order
      is_worthwhile: netEarning >= 7500 // Minimum worthwhile earning
    }
  };
};

// Helper function untuk condition detection
export const detectCondition = () => {
  const hour = new Date().getHours();
  const isNight = hour >= 22 || hour <= 6;
  
  // Dalam implementasi nyata, ini bisa integrate dengan:
  // - Weather API untuk deteksi hujan
  // - Google Maps API untuk deteksi traffic
  // - Real-time condition dari driver app
  
  return {
    isNight,
    suggestedCondition: isNight ? "night" : "normal",
    weatherNote: "Integrate with weather API for real-time detection"
  };
};

export default function DriverEarningCalculator({ itemPrice, distance, condition, tipAmount, children }) {
  const calculation = calculateDriverEarning(itemPrice, distance, condition, tipAmount);
  
  return children(calculation);
}