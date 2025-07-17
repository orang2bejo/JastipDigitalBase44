import React from "react";

/**
 * Menghitung fee dengan model split 50-50 antara customer dan driver
 * @param {number} itemPrice - Harga barang
 * @param {number} deliveryFee - Ongkos kirim  
 * @param {number} tipAmount - Tip untuk driver
 * @returns {object} Breakdown pembayaran dengan split fee
 */
export const calculateSplitFee = (itemPrice, deliveryFee = 5000, tipAmount = 0) => {
  // Fee structure berdasarkan analisa cost
  let totalPlatformFee;
  
  if (itemPrice >= 100000) {
    // Untuk transaksi besar: 6% dengan minimum Rp 7.000
    totalPlatformFee = Math.max(
      Math.round(itemPrice * 0.06),
      7000
    );
  } else {
    // Untuk transaksi kecil: flat Rp 7.000
    totalPlatformFee = 7000;
  }
  
  // Split 50-50
  const customerFee = Math.round(totalPlatformFee / 2); // Pembulatan ke customer
  const driverFee = totalPlatformFee - customerFee; // Sisa ke driver (handle pembulatan)
  
  // Perhitungan final
  const totalCustomerPayment = itemPrice + deliveryFee + tipAmount + customerFee;
  const driverGrossEarning = deliveryFee + tipAmount;
  const driverNetEarning = driverGrossEarning - driverFee;
  const companyRevenue = totalPlatformFee;
  
  // Cost analysis
  const variableCost = 4000; // Per transaksi
  const grossMargin = companyRevenue - variableCost;
  const marginPercentage = (grossMargin / companyRevenue) * 100;
  
  return {
    itemPrice,
    deliveryFee,
    tipAmount,
    customerFee,
    driverFee,
    totalPlatformFee,
    totalCustomerPayment,
    driverGrossEarning,
    driverNetEarning,
    companyRevenue,
    costAnalysis: {
      variableCost,
      grossMargin,
      marginPercentage: Math.round(marginPercentage),
      isSustainable: grossMargin > 0,
      breakEvenTransactions: grossMargin > 0 ? Math.ceil(8400000 / grossMargin) : "Not possible"
    },
    fairnessMetrics: {
      customerFeePercentage: Math.round((customerFee / totalCustomerPayment) * 100),
      driverFeePercentage: Math.round((driverFee / driverGrossEarning) * 100),
      feeDistribution: "50% Customer, 50% Driver"
    }
  };
};

export default function SplitFeeCalculator({ itemPrice, deliveryFee, tipAmount, children }) {
  const calculation = calculateSplitFee(itemPrice, deliveryFee, tipAmount);
  
  return children(calculation);
}