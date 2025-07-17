
import React, { useState, useEffect } from "react";
import { Driver } from "@/api/entities";
import { CompanyProfile } from "@/api/entities";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, ShieldCheck, Wallet, RefreshCw } from "lucide-react";

export default function DriverActivation() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const driverData = await Driver.filter({ created_by: user.email });
      if (driverData.length > 0) {
        const currentDriver = driverData[0];
        setDriver(currentDriver);
        
        // If fully active, redirect to dashboard
        if (currentDriver.verification_status === 'approved' && currentDriver.deposit_status === 'paid') {
          navigate(createPageUrl("DriverDashboard"));
          return;
        }

        const profiles = await CompanyProfile.list();
        if (profiles.length > 0) {
          setCompanyProfile(profiles[0]);
        }
      } else {
        // No driver profile found, maybe redirect to registration
        navigate(createPageUrl("DriverRegistration"));
      }
    } catch (error) {
      console.error("Error loading activation data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendWhatsAppMessage = (driver, companyProfile) => {
    if (!companyProfile?.admin_whatsapp) return;
    
    const message = `Halo Admin JastipDrive,

Saya ${driver.full_name} telah melakukan pembayaran deposit sebesar Rp ${driver.deposit_amount?.toLocaleString('id-ID')} untuk aktivasi akun driver.

Detail:
- Nama: ${driver.full_name}
- No. HP: ${driver.phone_number}
- Kendaraan: ${driver.vehicle_type}
- Waktu Transfer: ${new Date().toLocaleString('id-ID')}

Mohon verifikasi pembayaran saya. Terima kasih.`;
    
    const whatsappUrl = `https://wa.me/${companyProfile.admin_whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-8">
          <RefreshCw className="w-8 h-8 text-gray-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Memuat status aktivasi...</p>
        </div>
      );
    }
  
    if (!driver) {
       return (
        <div className="text-center p-8">
          <p className="text-gray-600">Profil driver tidak ditemukan.</p>
          <Button onClick={() => navigate(createPageUrl("DriverRegistration"))} className="mt-4">
            Daftar Sekarang
          </Button>
        </div>
      );
    }

    // Step 1: Waiting for KTP Verification
    if (driver.verification_status === 'pending') {
      return (
        <>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Menunggu Verifikasi KTP</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Tim kami sedang memverifikasi KTP Anda. Proses ini biasanya memakan waktu 15 menit hingga 1 jam. Silakan cek kembali nanti.
            </p>
            <Button onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Cek Status Verifikasi
            </Button>
          </CardContent>
        </>
      );
    }

    // Step 2: KTP Approved, Waiting for Deposit
    if (driver.verification_status === 'approved' && driver.deposit_status !== 'paid') {
      return (
        <>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Verifikasi Berhasil!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <Wallet className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-left">
                <strong>Langkah Terakhir: Lakukan Deposit</strong>
                <p>Silakan transfer deposit sebesar <strong>Rp {driver.deposit_amount?.toLocaleString('id-ID')}</strong> untuk mengaktifkan akun Anda.</p>
              </AlertDescription>
            </Alert>

            {/* Penjelasan Deposit */}
            <div className="bg-amber-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold text-amber-800 mb-2">💡 Mengapa Perlu Deposit?</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• <strong>Jaminan Keamanan:</strong> Melindungi customer dari risiko driver kabur</li>
                <li>• <strong>Komitmen Serius:</strong> Memastikan hanya driver serius yang bergabung</li>
                <li>• <strong>Ganti Rugi:</strong> Jaminan jika terjadi masalah dengan pesanan</li>
                <li>• <strong>Dapat Dikembalikan:</strong> Deposit akan dikembalikan jika berhenti dengan rekam jejak baik</li>
              </ul>
            </div>
            
            {companyProfile?.ewallet_details && (
              <div className="text-left bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Via E-Wallet ({companyProfile.ewallet_details.name})</h4>
                <p><strong>Nomor:</strong> {companyProfile.ewallet_details.account_number}</p>
                <p><strong>Atas Nama:</strong> {companyProfile.ewallet_details.account_name}</p>
                {companyProfile.ewallet_details.qr_code_url && (
                  <img src={companyProfile.ewallet_details.qr_code_url} alt="QR Code" className="w-48 h-48 mx-auto mt-4 rounded-md border" />
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={loadData} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Cek Status
              </Button>
              
              {companyProfile?.admin_whatsapp && (
                <Button 
                  onClick={() => sendWhatsAppMessage(driver, companyProfile)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  💬 Konfirmasi via WhatsApp
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Setelah transfer, klik tombol WhatsApp untuk konfirmasi ke admin atau tunggu verifikasi otomatis.
            </p>
          </CardContent>
        </>
      );
    }
    
     // Fallback / Aneh
    return <div className="p-8 text-center">Terjadi kesalahan. Silakan hubungi support.</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        {renderContent()}
      </Card>
    </div>
  );
}
