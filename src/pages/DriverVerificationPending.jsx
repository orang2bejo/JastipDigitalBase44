import React, { useState, useEffect } from "react";
import { Driver } from "@/api/entities";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Shield, CheckCircle, XCircle, RefreshCw, MessageCircle } from "lucide-react";

export default function DriverVerificationPending() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDriverStatus();
    // Auto refresh setiap 30 detik
    const interval = setInterval(loadDriverStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDriverStatus = async () => {
    try {
      const user = await User.me();
      const driverData = await Driver.filter({ created_by: user.email });
      
      if (driverData.length > 0) {
        const currentDriver = driverData[0];
        setDriver(currentDriver);
        
        // Redirect jika sudah approved
        if (currentDriver.verification_status === 'approved') {
          navigate(createPageUrl("DriverDashboard"));
          return;
        }
      } else {
        // Tidak ada data driver, redirect ke registrasi
        navigate(createPageUrl("DriverRegistration"));
      }
    } catch (error) {
      console.error("Error loading driver status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!driver) return <Clock className="w-8 h-8 text-gray-400" />;
    
    switch (driver.verification_status) {
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-600" />;
      case 'approved': 
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <Clock className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    if (!driver) return "Memuat status...";
    
    switch (driver.verification_status) {
      case 'pending':
        return "KTP sedang diverifikasi oleh tim kami. Mohon tunggu hingga 24 jam.";
      case 'approved':
        return "Selamat! KTP Anda telah diverifikasi. Anda bisa mulai bekerja sebagai driver.";
      case 'rejected':
        return `Verifikasi KTP ditolak. ${driver.rejection_reason || 'Silakan hubungi admin untuk informasi lebih lanjut.'}`;
      default:
        return "Status tidak diketahui.";
    }
  };

  const handleContactAdmin = () => {
    const message = `Halo Admin JastipDigital,

Saya ${driver?.full_name} memerlukan bantuan terkait verifikasi driver.

Detail:
- Nama: ${driver?.full_name}
- No. HP: ${driver?.phone_number}
- Status: ${driver?.verification_status}
- Waktu Daftar: ${driver?.registration_time ? new Date(driver.registration_time).toLocaleString('id-ID') : '-'}

Mohon bantuannya. Terima kasih.`;

    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <RefreshCw className="w-8 h-8 text-gray-500 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Memuat status verifikasi...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl text-gray-900">
            {driver?.verification_status === 'pending' && "Verifikasi Sedang Diproses"}
            {driver?.verification_status === 'approved' && "Verifikasi Berhasil!"}
            {driver?.verification_status === 'rejected' && "Verifikasi Ditolak"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            {getStatusMessage()}
          </p>

          {driver?.verification_status === 'pending' && (
            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-left">
                <strong>Sedang Diproses:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Tim verifikasi sedang memeriksa KTP Anda</li>
                  <li>• Proses biasanya 1-24 jam</li>
                  <li>• Anda akan mendapat notifikasi via WhatsApp</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {driver?.verification_status === 'approved' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-left">
                <strong>🎉 Selamat bergabung!</strong>
                <p className="mt-2 text-sm">
                  Anda sekarang bisa mulai menerima pesanan dan mendapatkan penghasilan.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {driver?.verification_status === 'rejected' && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-left">
                <strong>Alasan Penolakan:</strong>
                <p className="mt-2 text-sm">
                  {driver.rejection_reason || 'Foto KTP tidak jelas atau data tidak sesuai.'}
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {driver?.verification_status === 'pending' && (
              <Button onClick={loadDriverStatus} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Cek Status Terbaru
              </Button>
            )}

            {driver?.verification_status === 'approved' && (
              <Button 
                onClick={() => navigate(createPageUrl("DriverDashboard"))}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mulai Bekerja
              </Button>
            )}

            {driver?.verification_status === 'rejected' && (
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate(createPageUrl("DriverRegistration"))}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Daftar Ulang
                </Button>
                <Button onClick={handleContactAdmin} variant="outline" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Hubungi Admin
                </Button>
              </div>
            )}

            <Button 
              onClick={() => navigate(createPageUrl("Dashboard"))}
              variant="ghost" 
              className="w-full"
            >
              Kembali ke Dashboard
            </Button>
          </div>

          {driver?.registration_time && (
            <p className="text-xs text-gray-500">
              Terdaftar: {new Date(driver.registration_time).toLocaleString('id-ID')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}