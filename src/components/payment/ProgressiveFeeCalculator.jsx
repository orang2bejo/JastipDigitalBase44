import React from "react";

/**
 * Menghitung fee berdasarkan analisa cost structure yang realistis
 * @param {number} itemPrice - Harga barang  
 * @param {number} deliveryFee - Ongkos kirim
 * @param {number} tipAmount - Tip untuk driver
 * @param {string} phase - Fase bisnis: "bootstrap", "growth", "mature"
 * @returns {object} Breakdown pembayaran dengan margin sustainability
 */
export const calculateSustainableFee = (itemPrice, deliveryFee = 5000, tipAmount = 0, phase = "bootstrap") => {
  let jastipFee = 0;
  let feeToCustomer = 0;
  let feeFromDriver = 0;
  
  // Variable cost per transaksi: ~Rp 4.000
  // Target margin untuk sustainability: minimum 50%
  const minSustainableFee = 6000; // 4k cost + 2k margin
  
  switch (phase) {
    case "bootstrap":
      // Fee ke customer - sustainable rates
      if (itemPrice >= 100000) {
        feeToCustomer = Math.max(
          Math.round(itemPrice * 0.06), // 6% untuk ≥100rb
          minSustainableFee
        );
      } else {
        feeToCustomer = Math.max(7000, minSustainableFee); // Min 7rb untuk <100rb
      }
      feeFromDriver = 0;
      break;
      
    case "growth":
      // Fee split customer-driver
      if (itemPrice >= 100000) {
        feeToCustomer = Math.round(itemPrice * 0.04); // 4% ke customer
        feeFromDriver = Math.round(deliveryFee * 0.3); // 30% dari ongkir
      } else {
        feeToCustomer = 5000; // 5rb ke customer  
        feeFromDriver = 2000; // 2rb dari driver
      }
      // Ensure minimum total fee
      const totalFee = feeToCustomer + feeFromDriver;
      if (totalFee < minSustainableFee) {
        feeToCustomer += (minSustainableFee - totalFee);
      }
      break;
      
    case "mature":
      // Fee majority dari driver, tapi tetap sustainable
      feeToCustomer = 2000; // Small visible fee untuk transparency
      if (itemPrice >= 100000) {
        feeFromDriver = Math.max(
          Math.round((deliveryFee + tipAmount) * 0.25), // 25% dari earning
          4000 // Minimum 4rb
        );
      } else {
        feeFromDriver = Math.max(3000, deliveryFee * 0.4); // Min 3rb atau 40% ongkir
      }
      break;
  }
  
  jastipFee = feeToCustomer + feeFromDriver;
  const totalCustomerPayment = itemPrice + deliveryFee + tipAmount + feeToCustomer;
  const driverGrossEarning = deliveryFee + tipAmount;
  const driverNetEarning = driverGrossEarning - feeFromDriver;
  
  // Cost analysis
  const variableCost = 4000; // Per transaksi
  const grossMargin = jastipFee - variableCost;
  const marginPercentage = (grossMargin / jastipFee) * 100;
  
  return {
    phase,
    itemPrice,
    deliveryFee,
    tipAmount,
    feeToCustomer,
    feeFromDriver,
    jastipFee,
    totalCustomerPayment,
    driverGrossEarning,  
    driverNetEarning,
    companyEarning: jastipFee,
    costAnalysis: {
      variableCost,
      grossMargin,
      marginPercentage: Math.round(marginPercentage),
      isSustainable: grossMargin > 0,
      breakEvenTransactions: grossMargin > 0 ? Math.ceil(8400000 / grossMargin) : "Not possible"
    },
    breakdown: {
      customer_pays: totalCustomerPayment,
      driver_gets_gross: driverGrossEarning,
      driver_gets_net: driverNetEarning,
      company_gets: jastipFee,
      company_margin: grossMargin
    }
  };
};

export default function SustainableFeeCalculator({ itemPrice, deliveryFee, tipAmount, phase, children }) {
  const calculation = calculateSustainableFee(itemPrice, deliveryFee, tipAmount, phase);
  
  return children(calculation);
}