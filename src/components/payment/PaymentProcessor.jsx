import React, { useState } from "react";
import { Transaction } from "@/api/entities";
import { PaymentSplit } from "@/api/entities";
import { DriverWallet } from "@/api/entities";
import { Order } from "@/api/entities";
import { CompanyProfile } from "@/api/entities";
import { calculateSplitFee } from "./SplitFeeCalculator";

/**
 * Complete Payment Processing Component
 * Handles: Midtrans integration, fee splitting, wallet management
 */
export default function PaymentProcessor({ order, onPaymentSuccess, onPaymentError }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('midtrans_snap');

  // Generate payment payload
  const generatePaymentPayload = async (order) => {
    const calculation = calculateSplitFee(
      order.confirmed_price || order.actual_price,
      order.delivery_fee,
      order.tip_amount || 0
    );

    return {
      order_id: order.id,
      gross_amount: calculation.totalCustomerPayment,
      customer_details: {
        first_name: order.customer_name || "Customer",
        email: order.customer_email || "customer@jastipdigital.com",
        phone: order.customer_phone
      },
      item_details: [
        {
          id: "item_1",
          price: calculation.itemPrice,
          quantity: 1,
          name: order.item_description.substring(0, 50)
        },
        {
          id: "delivery_fee",
          price: calculation.deliveryFee,
          quantity: 1, 
          name: "Ongkos Kirim"
        },
        ...(calculation.tipAmount > 0 ? [{
          id: "tip",
          price: calculation.tipAmount,
          quantity: 1,
          name: "Tip Driver"
        }] : []),
        {
          id: "platform_fee",
          price: calculation.customerFee,
          quantity: 1,
          name: "Biaya Layanan Platform"
        }
      ],
      split_payment: {
        company_account: calculation.customerFee + calculation.driverFee,
        driver_account: {
          driver_id: order.driver_id,
          amount: calculation.driverNetEarning
        }
      },
      calculation_details: calculation
    };
  };

  // Create transaction record
  const createTransactionRecord = async (paymentData, status = 'pending') => {
    const transaction = await Transaction.create({
      order_id: order.id,
      customer_id: order.created_by,
      driver_id: order.driver_id,
      transaction_type: 'order_payment',
      amount: paymentData.gross_amount,
      fee_amount: paymentData.calculation_details.totalPlatformFee,
      net_amount: paymentData.calculation_details.driverNetEarning,
      status: status,
      payment_method: paymentMethod,
      split_details: paymentData.split_payment,
      processed_at: new Date().toISOString()
    });

    // Create payment split record
    await PaymentSplit.create({
      transaction_id: transaction.id,
      order_id: order.id,
      total_amount: paymentData.gross_amount,
      item_price: paymentData.calculation_details.itemPrice,
      delivery_fee: paymentData.calculation_details.deliveryFee,
      tip_amount: paymentData.calculation_details.tipAmount,
      platform_fee_total: paymentData.calculation_details.totalPlatformFee,
      customer_fee: paymentData.calculation_details.customerFee,
      driver_fee: paymentData.calculation_details.driverFee,
      driver_gross_earning: paymentData.calculation_details.driverGrossEarning,
      driver_net_earning: paymentData.calculation_details.driverNetEarning,
      company_earning: paymentData.calculation_details.totalPlatformFee,
      split_method: '50_50',
      calculation_details: paymentData.calculation_details
    });

    return transaction;
  };

  // Process Midtrans payment
  const processMidtransPayment = async () => {
    try {
      setIsProcessing(true);
      
      const paymentData = await generatePaymentPayload(order);
      const transaction = await createTransactionRecord(paymentData);
      
      // In real implementation, this would call backend to generate Snap token
      const mockSnapResponse = {
        token: `snap_token_${Date.now()}`,
        redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${Date.now()}`
      };
      
      // Update transaction with Midtrans data
      await Transaction.update(transaction.id, {
        external_reference: mockSnapResponse.token,
        status: 'processing'
      });
      
      // Open Midtrans Snap (mock)
      simulateMidtransPayment(transaction.id, paymentData);
      
    } catch (error) {
      console.error('Payment processing error:', error);
      onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate Midtrans payment for demo
  const simulateMidtransPayment = async (transactionId, paymentData) => {
    // Simulate 3 second processing
    setTimeout(async () => {
      try {
        // Mock successful payment
        await handlePaymentSuccess(transactionId, {
          transaction_status: 'settlement',
          payment_type: 'bank_transfer',
          transaction_id: `midtrans_${Date.now()}`,
          gross_amount: paymentData.gross_amount.toString()
        });
      } catch (error) {
        await handlePaymentFailure(transactionId, error.message);
      }
    }, 3000);
  };

  // Handle successful payment
  const handlePaymentSuccess = async (transactionId, midtransData) => {
    try {
      // Update transaction status
      await Transaction.update(transactionId, {
        status: 'completed',
        midtrans_transaction_id: midtransData.transaction_id,
        midtrans_payment_type: midtransData.payment_type,
        webhook_data: midtransData,
        settlement_date: new Date().toISOString()
      });

      // Update order payment status
      await Order.update(order.id, {
        payment_status: 'paid',
        status: 'shopping'
      });

      // Update driver wallet
      await updateDriverWallet(order.driver_id, transactionId);

      // Update payment split status
      const splits = await PaymentSplit.filter({ transaction_id: transactionId });
      if (splits.length > 0) {
        await PaymentSplit.update(splits[0].id, {
          settlement_status: 'completed',
          midtrans_split_payment_id: midtransData.transaction_id
        });
      }

      onPaymentSuccess({
        transactionId,
        amount: midtransData.gross_amount,
        status: 'completed'
      });

    } catch (error) {
      console.error('Error handling payment success:', error);
      onPaymentError(error);
    }
  };

  // Handle payment failure
  const handlePaymentFailure = async (transactionId, reason) => {
    await Transaction.update(transactionId, {
      status: 'failed',
      failure_reason: reason
    });

    await Order.update(order.id, {
      payment_status: 'failed'
    });

    onPaymentError(new Error(reason));
  };

  // Update driver wallet after successful payment
  const updateDriverWallet = async (driverId, transactionId) => {
    try {
      // Get or create driver wallet
      let wallets = await DriverWallet.filter({ driver_id: driverId });
      let wallet;
      
      if (wallets.length === 0) {
        wallet = await DriverWallet.create({
          driver_id: driverId,
          available_balance: 0,
          pending_balance: 0,
          total_earnings: 0
        });
      } else {
        wallet = wallets[0];
      }

      // Get payment split details
      const splits = await PaymentSplit.filter({ transaction_id: transactionId });
      if (splits.length === 0) return;

      const split = splits[0];
      
      // Update wallet balances
      await DriverWallet.update(wallet.id, {
        pending_balance: wallet.pending_balance + split.driver_net_earning,
        total_earnings: wallet.total_earnings + split.driver_net_earning,
        last_payout_date: new Date().toISOString()
      });

      // Create wallet transaction record
      await Transaction.create({
        order_id: order.id,
        driver_id: driverId,
        transaction_type: 'driver_payout',
        amount: split.driver_net_earning,
        status: 'completed',
        payment_method: 'wallet_balance'
      });

    } catch (error) {
      console.error('Error updating driver wallet:', error);
    }
  };

  // Process manual transfer payment
  const processManualPayment = async () => {
    try {
      setIsProcessing(true);
      
      const paymentData = await generatePaymentPayload(order);
      const transaction = await createTransactionRecord(paymentData, 'pending');
      
      // Update order to waiting payment
      await Order.update(order.id, {
        payment_status: 'waiting_payment'
      });

      onPaymentSuccess({
        transactionId: transaction.id,
        amount: paymentData.gross_amount,
        status: 'waiting_confirmation',
        message: 'Pembayaran menunggu konfirmasi admin'
      });

    } catch (error) {
      onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <h4 className="font-semibold">Pilih Metode Pembayaran:</h4>
        
        <div className="space-y-2">
          <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              value="midtrans_snap"
              checked={paymentMethod === 'midtrans_snap'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-blue-600"
            />
            <div>
              <p className="font-medium">Midtrans (Kartu Kredit, Transfer Bank, E-Wallet)</p>
              <p className="text-sm text-gray-600">Pembayaran otomatis dengan split fee</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              value="manual_transfer"
              checked={paymentMethod === 'manual_transfer'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-blue-600"
            />
            <div>
              <p className="font-medium">Transfer Manual</p>
              <p className="text-sm text-gray-600">Transfer ke rekening perusahaan, butuh konfirmasi admin</p>
            </div>
          </label>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={paymentMethod === 'midtrans_snap' ? processMidtransPayment : processManualPayment}
        disabled={isProcessing}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Memproses Pembayaran...
          </span>
        ) : (
          `Bayar Rp ${calculateSplitFee(order.confirmed_price || order.actual_price, order.delivery_fee, order.tip_amount || 0).totalCustomerPayment.toLocaleString('id-ID')}`
        )}
      </button>
    </div>
  );
}