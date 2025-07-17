
import React, { useEffect, useState } from "react";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Star,
  Shield,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Truck,
  ShoppingCart,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState(null); // Added authError state

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const user = await User.me();
      if (user) {
        // User sudah login, langsung redirect ke Dashboard
        console.log('User already logged in, redirecting to Dashboard');
        navigate(createPageUrl("Dashboard"), { replace: true });
        return;
      }
    } catch (error) {
      // User belum login atau error, tampilkan landing page
      console.log('User not logged in or error occurred:', error);
      setAuthError(null); // Reset error because this is normal behavior for unauthenticated users
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    setAuthError(null); // Clear previous errors
    try {
      // Try to log in with redirect to Dashboard
      await User.loginWithRedirect(window.location.origin + createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Gagal melakukan login. Silakan coba lagi.");
      
      // Fallback: try regular login if redirect fails (e.g., due to unsupported browser feature or specific error)
      try {
        await User.login();
      } catch (fallbackError) {
        console.error("Fallback login error:", fallbackError);
        setAuthError("Tidak dapat terhubung ke sistem login. Silakan coba lagi nanti.");
      }
    }
  };

  // Tampilkan loading sementara mengecek auth status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f58518512_jastip.png" 
                alt="JastipDigital Logo" 
                className="h-10 w-auto"
                width={40}
                height={40}
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">JastipDigital</h1>
                <p className="text-xs text-gray-600">Platform Jasa Titip Digital</p>
              </div>
            </div>
            {/* Added a div to contain Button and authError message */}
            <div className="flex flex-col items-end">
              <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
                Masuk / Daftar
              </Button>
              {authError && (
                <p className="text-red-600 text-sm mt-1 text-right max-w-[200px] leading-tight">
                  {authError}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Jasa Titip Beli <span className="text-blue-600">Digital</span> 
            <br />Pertama di Indonesia 🇮🇩
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Butuh belanjain sesuatu? Dari makanan, obat, hingga barang elektronik - 
            semuanya bisa dititipkan dengan mudah dan aman!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Mulai Titip Belanja
            </Button>
            <Button 
              onClick={handleLogin}
              size="lg" 
              variant="outline" 
              className="px-8 py-4 text-lg border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Truck className="w-5 h-5 mr-2" />
              Jadi Driver Partner
            </Button>
          </div>

          {/* Payment Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-amber-800 text-sm">
              💡 <strong>Info Pembayaran:</strong> Untuk pengalaman terbaik, gunakan pembayaran cash. 
              Pembayaran digital masih dalam tahap trial dan mungkin mengalami kendala.
            </p>
          </div>

          {/* Display authError in Hero section if present */}
          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-red-800 text-sm">
                ⚠️ <strong>Perhatian:</strong> {authError}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kenapa Pilih JastipDigital?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Platform jasa titip yang aman, cepat, dan terpercaya dengan berbagai keunggulan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Aman & Terpercaya</h3>
                <p className="text-gray-600">
                  Driver terverifikasi dengan sistem keamanan berlapis dan jaminan uang kembali
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Cepat & Real-time</h3>
                <p className="text-gray-600">
                  Tracking real-time, chat langsung dengan driver, dan notifikasi setiap update
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Komunitas Aktif</h3>
                <p className="text-gray-600">
                  Ribuan driver aktif siap membantu kebutuhan belanja Anda kapan saja
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cara Kerja JastipDigital
            </h2>
            <p className="text-gray-600">
              Proses yang mudah dan transparan dalam 4 langkah sederhana
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Pesan",
                description: "Deskripsikan barang yang ingin dibeli dan tentukan budget maksimum",
                icon: ShoppingCart
              },
              {
                step: "2", 
                title: "Driver Terima",
                description: "Driver terdekat akan mengambil pesanan dan menuju ke toko",
                icon: Truck
              },
              {
                step: "3",
                title: "Konfirmasi Harga",
                description: "Driver akan konfirmasi harga sebelum pembayaran",
                icon: CheckCircle
              },
              {
                step: "4",
                title: "Terima Barang",
                description: "Barang diantar ke alamat Anda dengan aman",
                icon: Award
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mt-2">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Siap Mulai Titip Belanja? 🛒
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Bergabung dengan ribuan pengguna yang sudah merasakan kemudahan JastipDigital
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
          >
            Mulai Sekarang
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f58518512_jastip.png" 
                  alt="JastipDigital Logo" 
                  className="h-8 w-auto"
                  width={32}
                  height={32}
                />
                <span className="text-lg font-bold">JastipDigital</span>
              </div>
              <p className="text-gray-400 text-sm">
                Platform jasa titip beli digital pertama di Indonesia yang aman, cepat, dan terpercaya.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Jasa Titip Belanja</li>
                <li>Delivery Express</li>
                <li>Layanan Spesialis</li>
                <li>Driver Partnership</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Tentang Kami</li>
                <li>Cara Kerja</li>
                <li>Karir</li>
                <li>Blog</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hubungi Kami</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+62 811-1234-567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>hello@jastipdigital.id</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 JastipDigital. All rights reserved. | Dibuat dengan ❤️ di Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
