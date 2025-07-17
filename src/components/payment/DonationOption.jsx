import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Donation } from "@/api/entities";
import { User } from "@/api/entities";
import { Heart, Gift, Star, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function DonationOption({ 
  refundAmount, 
  onDonationSubmit, 
  showDonationOption = false 
}) {
  const [donationAmount, setDonationAmount] = useState(refundAmount || 0);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [validationError, setValidationError] = useState('');

  const predefinedAmounts = [5000, 10000, 25000, 50000, 100000];
  const minimumDonation = 1000;

  // Client-side validation
  const validateDonation = () => {
    const amount = parseFloat(donationAmount);
    
    if (!amount || isNaN(amount)) {
      setValidationError('Jumlah donasi harus diisi');
      return false;
    }
    
    if (amount < minimumDonation) {
      setValidationError(`Minimum donasi adalah Rp ${minimumDonation.toLocaleString('id-ID')}`);
      return false;
    }
    
    if (refundAmount && amount > refundAmount) {
      setValidationError(`Donasi tidak boleh melebihi refund (Rp ${refundAmount.toLocaleString('id-ID')})`);
      return false;
    }
    
    if (donorEmail && !/\S+@\S+\.\S+/.test(donorEmail)) {
      setValidationError('Format email tidak valid');
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateDonation()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const user = await User.me();
      
      await Donation.create({
        amount: parseFloat(donationAmount),
        donor_name: donorName || user.full_name || 'Anonim',
        donor_email: donorEmail || user.email,
        message: message || 'Semangat untuk para driver hebat!',
        is_allocated: false
      });

      if (onDonationSubmit) {
        onDonationSubmit(parseFloat(donationAmount));
      }

      // Reset form
      setDonationAmount(0);
      setDonorName('');
      setMessage('');
      alert('Terima kasih! Donasi Anda telah berhasil dikirim untuk Hall of Fame driver.');
    } catch (error) {
      console.error('Error submitting donation:', error);
      setValidationError('Terjadi kesalahan saat mengirim donasi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real-time validation on amount change
  const handleAmountChange = (value) => {
    setDonationAmount(value);
    setValidationError(''); // Clear error when user changes amount
  };

  if (!showDonationOption && !refundAmount) {
    return null;
  }

  return (
    <Card className="border-2 border-dashed border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Heart className="w-6 h-6 text-red-500" />
          Donasi untuk Hall of Fame Driver
        </CardTitle>
        <p className="text-sm text-amber-700">
          {refundAmount > 0 
            ? `Anda memiliki refund Rp ${refundAmount.toLocaleString('id-ID')}. Bagikan kebahagiaan dengan mendonasikannya untuk penghargaan driver terbaik!`
            : 'Dukung para driver terbaik dengan memberikan donasi untuk pool hadiah Hall of Fame.'
          }
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDonationSubmit} className="space-y-4">
          {/* Validation Error Alert */}
          {validationError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {validationError}
              </AlertDescription>
            </Alert>
          )}

          {/* Amount Selection */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Jumlah Donasi *</Label>
            
            {refundAmount > 0 && (
              <div className="mb-3">
                <Button
                  type="button"
                  variant={donationAmount === refundAmount ? "default" : "outline"}
                  onClick={() => {
                    handleAmountChange(refundAmount);
                    setShowCustomAmount(false);
                  }}
                  className="w-full mb-2"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Donasikan Seluruh Refund: Rp {refundAmount.toLocaleString('id-ID')}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 mb-3">
              {predefinedAmounts.map(amount => (
                <Button
                  key={amount}
                  type="button"
                  variant={donationAmount === amount ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    handleAmountChange(amount);
                    setShowCustomAmount(false);
                  }}
                  className="text-xs"
                >
                  Rp {amount.toLocaleString('id-ID')}
                </Button>
              ))}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomAmount(!showCustomAmount)}
              className="w-full text-amber-700 hover:text-amber-800"
            >
              {showCustomAmount ? 'Pilih dari preset' : 'Masukkan jumlah lain'}
            </Button>

            {showCustomAmount && (
              <div className="mt-2">
                <Input
                  type="number"
                  placeholder="Masukkan jumlah donasi"
                  value={donationAmount || ''}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  min={minimumDonation}
                  max={refundAmount || undefined}
                  step="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: Rp {minimumDonation.toLocaleString('id-ID')}
                  {refundAmount && ` | Maximum: Rp ${refundAmount.toLocaleString('id-ID')}`}
                </p>
              </div>
            )}
          </div>

          {/* Donor Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="donor_name" className="text-sm">Nama (Opsional)</Label>
              <Input
                id="donor_name"
                placeholder="Atau biarkan kosong untuk 'Anonim'"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="donor_email" className="text-sm">Email (Opsional)</Label>
              <Input
                id="donor_email"
                type="email"
                placeholder="Untuk tanda terima donasi"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message" className="text-sm">Pesan untuk Para Driver</Label>
            <Textarea
              id="message"
              placeholder="Kata-kata semangat untuk para driver hebat..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-20"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 karakter
            </p>
          </div>

          {/* Impact Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Dampak Donasi Anda:</span>
            </div>
            <p className="text-xs text-blue-700">
              Donasi akan masuk ke pool hadiah Hall of Fame. Saat milestone driver tercapai (100, 250, 500, 1000 driver), 
              seluruh pool akan diberikan kepada 1 driver terbaik secara global.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!donationAmount || parseFloat(donationAmount) < minimumDonation || isSubmitting || validationError}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengirim Donasi...
              </div>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Donasikan Rp {parseFloat(donationAmount || 0).toLocaleString('id-ID')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}