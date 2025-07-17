import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Order } from "@/api/entities";
import { Gift, Heart, Wallet, CheckCircle, ArrowRight } from 'lucide-react';
import DonationOption from '../payment/DonationOption';

export default function RefundDonationFlow({ 
  order, 
  refundAmount, 
  onRefundProcessed 
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);

  const handleRefundOption = async (option) => {
    setIsProcessing(true);
    
    try {
      if (option === 'keep_refund') {
        // Keep refund - no additional action needed
        await Order.update(order.id, {
          refund_status: 'processed',
          refund_processed_at: new Date().toISOString()
        });
        
        if (onRefundProcessed) {
          onRefundProcessed('kept', refundAmount);
        }
      } else if (option === 'donate_all') {
        // Show donation form for full amount
        setShowDonationForm(true);
        setSelectedOption(option);
        setIsProcessing(false);
        return;
      } else if (option === 'donate_partial') {
        // Show donation form for partial amount
        setShowDonationForm(true);
        setSelectedOption(option);
        setIsProcessing(false);
        return;
      }
      
      setSelectedOption(option);
    } catch (error) {
      console.error('Error processing refund option:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDonationSubmit = async (donatedAmount) => {
    try {
      const remainingRefund = refundAmount - donatedAmount;
      
      await Order.update(order.id, {
        refund_status: 'processed',
        refund_processed_at: new Date().toISOString(),
        donated_amount: donatedAmount,
        remaining_refund: remainingRefund
      });
      
      if (onRefundProcessed) {
        onRefundProcessed('donated', donatedAmount, remainingRefund);
      }
      
      setShowDonationForm(false);
      setSelectedOption('donation_completed');
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Terjadi kesalahan saat memproses donasi.');
    }
  };

  if (showDonationForm) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Donasi untuk Hall of Fame Driver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Terima kasih telah memilih untuk berdonasi! Dana Anda akan membantu penghargaan untuk driver terbaik.
            </p>
          </CardContent>
        </Card>

        <DonationOption
          refundAmount={selectedOption === 'donate_all' ? refundAmount : undefined}
          onDonationSubmit={handleDonationSubmit}
          showDonationOption={true}
        />

        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              setShowDonationForm(false);
              setSelectedOption(null);
            }}
          >
            Kembali ke Pilihan Refund
          </Button>
        </div>
      </div>
    );
  }

  if (selectedOption === 'keep_refund') {
    return (
      <Card className="border-0 shadow-lg bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Refund Berhasil Diproses!
          </h3>
          <p className="text-green-700 mb-4">
            Refund sebesar <strong>Rp {refundAmount.toLocaleString('id-ID')}</strong> 
            akan dikembalikan ke metode pembayaran Anda dalam 1-3 hari kerja.
          </p>
          <Badge className="bg-green-200 text-green-800">
            Status: Sedang Diproses
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (selectedOption === 'donation_completed') {
    return (
      <Card className="border-0 shadow-lg bg-purple-50">
        <CardContent className="p-8 text-center">
          <Heart className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-purple-800 mb-2">
            Terima Kasih atas Donasi Anda! 💜
          </h3>
          <p className="text-purple-700 mb-4">
            Donasi Anda telah berhasil dikirim ke pool Hall of Fame driver. 
            Anda telah membantu memberikan penghargaan untuk driver terbaik!
          </p>
          <Badge className="bg-purple-200 text-purple-800">
            Donasi Berhasil
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Refund Information */}
      <Alert className="border-green-200 bg-green-50">
        <Gift className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Good News!</strong> Harga barang lebih murah dari budget Anda. 
          Anda berhak mendapat refund sebesar <strong>Rp {refundAmount.toLocaleString('id-ID')}</strong>.
        </AlertDescription>
      </Alert>

      {/* Refund Options */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Pilih Cara Penanganan Refund</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Keep Refund */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Terima Refund</h4>
                  <p className="text-sm text-gray-600">
                    Kembalikan ke metode pembayaran saya
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleRefundOption('keep_refund')}
                disabled={isProcessing}
                variant="outline"
              >
                {isProcessing ? 'Memproses...' : 'Pilih'}
              </Button>
            </div>
          </div>

          {/* Donate All */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Donasikan Semua</h4>
                  <p className="text-sm text-gray-600">
                    Untuk Hall of Fame driver terbaik
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleRefundOption('donate_all')}
                disabled={isProcessing}
                className="bg-red-500 hover:bg-red-600"
              >
                <Heart className="w-4 h-4 mr-2" />
                Donasikan
              </Button>
            </div>
          </div>

          {/* Donate Partial */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Donasi Sebagian</h4>
                  <p className="text-sm text-gray-600">
                    Pilih jumlah donasi yang diinginkan
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleRefundOption('donate_partial')}
                disabled={isProcessing}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Pilih Jumlah
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Information */}
      <Card className="border-dashed border-2 border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <h4 className="font-semibold text-amber-800 mb-2">💡 Tentang Donasi Hall of Fame:</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Dana terkumpul untuk hadiah driver terbaik saat mencapai milestone (100, 250, 500, 1000 driver)</li>
            <li>• 1 driver dengan rating dan review terbaik akan memenangkan seluruh pool</li>
            <li>• Membantu memotivasi driver memberikan layanan terbaik</li>
            <li>• Donasi Anda akan tercatat dan diapresiasi komunitas</li>
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}