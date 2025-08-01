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
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const user = await User.me();
      if (user) {
        console.log('User already logged in, redirecting to Dashboard');
        navigate(createPageUrl("Dashboard"), { replace: true });
        return;
      }
    } catch (error) {
      console.log('User not logged in or error occurred:', error);
      setAuthError(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await User.loginWithRedirect(window.location.origin + createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Gagal melakukan login. Silakan coba lagi.");
      
      try {
        await User.login();
      } catch (fallbackError) {
        console.error("Fallback login error:", fallbackError);
        setAuthError("Tidak dapat terhubung ke sistem login. Silakan coba lagi nanti.");
      }
    }
  };

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
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">JastipDigital</h1>
              <p className="text-xs text-gray-600">Platform Jasa Titip Digital</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 shadow-lg transition-transform hover:scale-105">
              Masuk / Daftar
            </Button>
            {authError && (
              <p className="text-red-600 text-sm mt-1 text-right max-w-[200px] leading-tight animate-pulse">
                {authError}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg transition-transform hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Mulai Titip Belanja
            </Button>
            <Button 
              onClick={handleLogin}
              size="lg" 
              variant="outline" 
              className="px-8 py-4 text-lg border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold transition-transform hover:scale-105"
            >
              <Truck className="w-5 h-5 mr-2" />
              Jadi Driver Partner
            </Button>
          </div>

          {/* Payment Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-amber-800 text-sm">
              💡 <strong>Info Pembayaran:</strong> Sistem pembayaran terintegrasi dengan berbagai metode pembayaran digital untuk kemudahan transaksi.
            </p>
          </div>

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
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              Kenapa Pilih JastipDigital?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Platform jasa titip yang aman, cepat, dan terpercaya dengan berbagai keunggulan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Aman & Terpercaya</h3>
                <p className="text-gray-600">
                  Driver terverifikasi dengan sistem keamanan berlapis dan jaminan uang kembali
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Cepat & Real-time</h3>
                <p className="text-gray-600">
                  Tracking real-time, chat langsung dengan driver, dan notifikasi setiap update
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Layanan Spesialis</h3>
                <p className="text-gray-600">
                  Mitra spesialis untuk kebutuhan khusus dan layanan premium berkualitas tinggi
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
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
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mt-2 group-hover:scale-110 transition-transform">
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
          <h2 className="text-3xl font-bold mb-4 tracking-tight">
            Siap Mulai Titip Belanja? 🛒
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Bergabung dengan ribuan pengguna yang sudah merasakan kemudahan JastipDigital
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg transition-transform hover:scale-105"
          >
            Mulai Sekarang
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">JastipDigital</span>
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