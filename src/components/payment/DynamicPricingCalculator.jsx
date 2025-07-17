import React from "react";

/**
 * Menghitung dynamic pricing berdasarkan kota dan kondisi real-time
 * @param {number} itemPrice - Harga barang
 * @param {string} cityName - Nama kota
 * @param {object} conditions - Kondisi real-time (weather, traffic, events)
 * @returns {object} Breakdown pricing dinamis
 */
export const calculateDynamicPricing = (itemPrice, cityName, conditions = {}) => {
  // City configurations
  const cityConfigs = {
    "Jakarta": { tier: "tier_1", baseFee: 5, trafficSensitive: true, weatherSensitive: true, floodProne: true },
    "Surabaya": { tier: "tier_1", baseFee: 5, trafficSensitive: true, weatherSensitive: true, floodProne: false },
    "Medan": { tier: "tier_1", baseFee: 5, trafficSensitive: true, weatherSensitive: true, floodProne: true },
    "Bandung": { tier: "tier_2", baseFee: 5, trafficSensitive: false, weatherSensitive: true, mountainCity: true },
    "Semarang": { tier: "tier_2", baseFee: 5, trafficSensitive: true, weatherSensitive: true, floodProne: true },
    "Denpasar": { tier: "tier_2", baseFee: 6, trafficSensitive: true, weatherSensitive: false, touristCity: true },
    "Makassar": { tier: "tier_2", baseFee: 5, trafficSensitive: false, weatherSensitive: true, heatSensitive: true },
    "Balikpapan": { tier: "tier_2", baseFee: 6, trafficSensitive: false, weatherSensitive: true, premiumMarket: true },
    "Batam": { tier: "tier_2", baseFee: 6, trafficSensitive: false, weatherSensitive: true, industrialCity: true }
  };

  const cityConfig = cityConfigs[cityName] || { tier: "tier_3", baseFee: 4, trafficSensitive: true, weatherSensitive: true };
  
  // Base fee percentage
  let driverFeePercentage = cityConfig.baseFee; // Start dari 5-6%
  let multiplier = 1.0;
  
  // Weather conditions
  const weatherMultipliers = {
    "sunny": 1.0,
    "cloudy": 1.0, 
    "light_rain": 1.3,
    "heavy_rain": 1.8,
    "storm": 2.5,
    "fog": 1.5
  };
  
  if (cityConfig.weatherSensitive && conditions.weather) {
    multiplier *= weatherMultipliers[conditions.weather] || 1.0;
  }
  
  // Traffic conditions (untuk kota yang traffic sensitive)
  const trafficMultipliers = {
    "smooth": 1.0,
    "moderate": 1.2,
    "heavy": 1.5,
    "gridlock": 2.0
  };
  
  if (cityConfig.trafficSensitive && conditions.traffic) {
    multiplier *= trafficMultipliers[conditions.traffic] || 1.0;
  }
  
  // Special events
  const eventMultipliers = {
    "flood": 2.5,
    "demonstration": 1.8,
    "holiday": 1.4,
    "festival": 1.3,
    "construction": 1.2,
    "vip_visit": 1.6
  };
  
  if (conditions.events && conditions.events.length > 0) {
    conditions.events.forEach(event => {
      multiplier *= eventMultipliers[event] || 1.0;
    });
  }
  
  // Time of day surge
  const timeMultipliers = {
    "morning_rush": 1.3,
    "afternoon": 1.0,
    "evening_rush": 1.4,
    "night": 1.2,
    "late_night": 1.5
  };
  
  if (conditions.timeOfDay) {
    multiplier *= timeMultipliers[conditions.timeOfDay] || 1.0;
  }
  
  // Demand surge (supply vs demand ratio)
  if (conditions.demandSurge) {
    multiplier *= conditions.demandSurge;
  }
  
  // City-specific factors
  if (cityConfig.floodProne && conditions.weather === "heavy_rain") {
    multiplier *= 1.5; // Extra flood risk
  }
  
  if (cityConfig.mountainCity && conditions.weather === "fog") {
    multiplier *= 1.3; // Mountain fog factor
  }
  
  if (cityConfig.touristCity && conditions.timeOfDay === "evening_rush") {
    multiplier *= 1.2; // Tourist evening surge
  }
  
  // Apply multiplier with caps
  const finalDriverFeePercentage = Math.min(
    driverFeePercentage * multiplier,
    15 // Cap at 15% max
  );
  
  // Fixed company fee structure
  const companyFeeFromCustomer = 5000; // 5rb dari customer
  const companyFeeFromDriver = 3000; // 3rb dari driver  
  const totalCompanyFee = companyFeeFromCustomer + companyFeeFromDriver;
  
  // Driver calculations
  const baseDriverEarning = itemPrice < 100000 ? 10000 : 0;
  const driverServiceFee = itemPrice >= 100000 ? 
    Math.round(itemPrice * (finalDriverFeePercentage / 100)) : 0;
  
  const grossDriverEarning = baseDriverEarning + driverServiceFee;
  const netDriverEarning = grossDriverEarning - companyFeeFromDriver;
  
  // Customer calculations  
  const totalCustomerPayment = itemPrice + grossDriverEarning + companyFeeFromCustomer;
  
  return {
    cityName,
    cityTier: cityConfig.tier,
    conditions,
    
    // Fee breakdown
    baseFeePercentage: driverFeePercentage,
    finalFeePercentage: Math.round(finalDriverFeePercentage * 100) / 100,
    appliedMultiplier: Math.round(multiplier * 100) / 100,
    
    // Driver earning
    baseDriverEarning,
    driverServiceFee,
    grossDriverEarning,
    netDriverEarning,
    
    // Company fee
    companyFeeFromCustomer,
    companyFeeFromDriver, 
    totalCompanyFee,
    
    // Customer payment
    itemPrice,
    totalCustomerPayment,
    
    // Analytics
    effectiveRateForDriver: itemPrice > 0 ? Math.round((netDriverEarning / itemPrice) * 100) : 0,
    worthwhileOrder: netDriverEarning >= 7500,
    
    breakdown: {
      customer_pays: totalCustomerPayment,
      driver_gets_gross: grossDriverEarning,
      driver_gets_net: netDriverEarning,
      company_gets: totalCompanyFee,
      pricing_factors: {
        weather: conditions.weather || "unknown",
        traffic: conditions.traffic || "unknown", 
        events: conditions.events || [],
        time: conditions.timeOfDay || "unknown",
        surge: conditions.demandSurge || 1.0
      }
    }
  };
};

// Real-time condition detector
export const detectCurrentConditions = (cityName) => {
  const hour = new Date().getHours();
  
  // Time of day detection
  let timeOfDay = "afternoon";
  if (hour >= 6 && hour <= 9) timeOfDay = "morning_rush";
  else if (hour >= 17 && hour <= 20) timeOfDay = "evening_rush";
  else if (hour >= 21 || hour <= 5) timeOfDay = "night";
  else if (hour >= 1 && hour <= 5) timeOfDay = "late_night";
  
  // Simulate real-time conditions (dalam production integrate dengan API)
  const mockConditions = {
    weather: ["sunny", "cloudy", "light_rain"][Math.floor(Math.random() * 3)],
    traffic: ["smooth", "moderate", "heavy"][Math.floor(Math.random() * 3)],
    timeOfDay,
    events: Math.random() > 0.8 ? ["holiday"] : [], // 20% chance ada event
    demandSurge: 0.8 + (Math.random() * 0.8) // 0.8 - 1.6x surge
  };
  
  return {
    ...mockConditions,
    dataSource: "simulated", // In production: "real_time_api"
    lastUpdated: new Date().toISOString()
  };
};

export default function DynamicPricingCalculator({ itemPrice, cityName, conditions, children }) {
  const calculation = calculateDynamicPricing(itemPrice, cityName, conditions);
  
  return children(calculation);
}