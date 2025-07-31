
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  TruckIcon, 
  Star, 
  MessageSquare, // Added MessageSquare for WhatsApp
  MapPin, 
  Wrench, 
  CreditCard, 
  Smartphone, 
  Building, 
  DollarSign, 
  Mail, 
  Phone, 
  Shield 
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(createPageUrl("Dashboard"));
  };

  const handleRegisterDriver = () => {
    navigate(createPageUrl("DriverRegistration"));
  };

  const handleRegisterMitra = () => {
    navigate(createPageUrl("MitraRegistration"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-blue-100 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f58518512_jastip.png" 
                alt="JastipDigital Logo" 
                className="h-10 w-auto drop-shadow-lg"
                width={40}
                height={40}
              />
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">JastipDigital</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("LandingPage")}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Fitur
              </Link>
              <Link to={createPageUrl("UserGuide")}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Cara Kerja
              </Link>
              <Link to={createPageUrl("Dashboard")}
                className="">
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg transition-transform hover:scale-105">Masuk</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Titip Apa Aja, <span className="text-blue-600">Beres Seketika.</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              Platform jasa titip modern yang menghubungkan Anda dengan driver terpercaya. 
              Dari makanan, belanjaan, hingga layanan darurat, semua ada.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("Dashboard")}
                className="w-full sm:w-auto">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto font-semibold shadow-lg transition-transform hover:scale-105">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Pesan Sekarang
                </Button>
              </Link>
              <Link to={createPageUrl("Dashboard")}
                className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold border-blue-600 text-blue-600 hover:bg-blue-50 transition-transform hover:scale-105">
                  <TruckIcon className="w-5 h-5 mr-2" />
                  Jadi Driver
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">JastipDigital Dashboard</h3>
                  <p className="text-gray-600 mt-2">Interface yang mudah digunakan</p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/80 rounded-xl p-4 text-center">
                    <TruckIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-sm">Driver Terverifikasi</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 text-center">
                    <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-sm">Chat Real-time</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 text-center">
                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="font-semibold text-sm">Rating & Review</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 text-center">
                    <Wrench className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-semibold text-sm">Layanan Spesialis</p>
                  </div>
                </div>

                {/* Mock UI Elements */}
                <div className="bg-white/60 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Pesanan Selesai</p>
                      <p className="text-xs text-gray-500">Nasi gudeg Bu Tjitro</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <TruckIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Dalam Perjalanan</p>
                      <p className="text-xs text-gray-500">Obat dari apotek K24</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quick Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Kenapa Pilih JastipDigital?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-blue-50">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <TruckIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Driver Terpercaya</h4>
              <p className="text-gray-600">Semua driver telah terverifikasi dengan sistem keamanan berlapis</p>
            </div>
            <div className="text-center p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-green-50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Jangkauan Luas</h4>
              <p className="text-gray-600">Melayani berbagai kota dengan area coverage yang terus berkembang</p>
            </div>
            <div className="text-center p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-purple-50">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Wrench className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Layanan Spesialis</h4>
              <p className="text-gray-600">Tidak hanya jastip, tapi juga layanan darurat dan spesialis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Paket Layanan & Harga
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tarif transparan untuk semua layanan JastipDigital
            </p>
          </div>

          {/* Service Packages */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Jasa Titip Beli */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Jasa Titip Beli</h3>
                <p className="text-gray-600">Belanjakan apa saja untuk Anda</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Biaya Layanan</span>
                  <span className="font-semibold text-blue-600">5% - 8%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Ongkos Kirim</span>
                  <span className="font-semibold text-blue-600">Rp 8.000 - 25.000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Minimum Order</span>
                  <span className="font-semibold text-blue-600">Rp 10.000</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Contoh Total*</span>
                  <span className="font-bold text-green-600 text-lg">Rp 65.500</span>
                </div>
              </div>
              <div className="text-center">
                <button 
                  onClick={handleGetStarted}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg transition-transform hover:scale-105"
                >
                  Pesan Sekarang
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                *Contoh: Barang Rp 50.000 + Ongkir Rp 10.000 + Biaya Layanan Rp 5.500
              </p>
            </div>
            {/* Mitra Spesialis */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100 hover:shadow-2xl transition-all duration-300 transform scale-105 relative hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  POPULER
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mitra Spesialis</h3>
                <p className="text-gray-600">Layanan ahli ke rumah Anda</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Fee Platform</span>
                  <span className="font-semibold text-purple-600">6% saja</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Panggilan Darurat</span>
                  <span className="font-semibold text-purple-600">Rp 50.000 - 150.000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Perbaikan Ringan</span>
                  <span className="font-semibold text-purple-600">Rp 75.000 - 300.000</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Layanan Premium</span>
                  <span className="font-bold text-green-600 text-lg">Rp 200.000+</span>
                </div>
              </div>
              <div className="text-center">
                <button 
                  onClick={handleRegisterMitra}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg transition-transform hover:scale-105"
                >
                  Daftar Mitra
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Mitra mendapat 94% dari harga yang disepakati
              </p>
            </div>
            {/* Driver Partner */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TruckIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Driver Partner</h3>
                <p className="text-gray-600">Gabung sebagai driver dan dapatkan penghasilan tambahan</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Fee Platform</span>
                  <span className="font-semibold text-green-600">5% saja</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Bonus Mingguan</span>
                  <span className="font-semibold text-green-600">Up to Rp 500.000</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Insentif Order</span>
                  <span className="font-semibold text-green-600">Setiap 10 order</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Pendapatan</span>
                  <span className="font-bold text-green-600 text-lg">90%+ dari order</span>
                </div>
              </div>
              <div className="text-center">
                <button 
                  onClick={handleRegisterDriver}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg transition-transform hover:scale-105"
                >
                  Daftar Driver
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Driver mendapat 90%+ dari harga order
              </p>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl p-6 max-w-4xl mx-auto shadow-lg border border-gray-100">
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                💳 Metode Pembayaran yang Diterima
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Kartu Kredit/Debit</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>GoPay, OVO, Dana</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>Transfer Bank</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Bayar di Tempat (COD)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Siap Merasakan Kemudahan JastipDigital?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Bergabung dengan ribuan pengguna yang sudah merasakan kemudahan layanan kami
          </p>
          <Link to={createPageUrl("Dashboard")}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Mulai Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f58518512_jastip.png" 
                  alt="JastipDigital" 
                  className="h-10 w-auto"
                  width={40}
                  height={40}
                />
                <span className="text-xl font-bold">JastipDigital</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Platform jasa titip digital terpercaya di Indonesia. Menghubungkan customer dengan driver dan mitra ahli untuk memenuhi kebutuhan sehari-hari.
              </p>
              
              {/* Contact Support */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold mb-4">Kontak Support</h4>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">orangbejo@jastipdigital.id</span>
                </div>
                <a
                  href="https://wa.me/6282340042948?text=Halo%20JastipDigital,%20saya%20butuh%20bantuan."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  <span>Hubungi via WhatsApp</span>
                </a>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">Jakarta, Indonesia</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Layanan Kami</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">Jasa Titip Beli</a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">Mitra Spesialis</a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">Driver Partner</a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">Layanan Darurat</a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Perusahaan</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link to={createPageUrl("UserGuide")} className="hover:text-blue-400 transition-colors">
                    Panduan Pengguna
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("PricingInfo")} className="hover:text-blue-400 transition-colors">
                    Info Harga
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("TermsAndConditions")} className="hover:text-blue-400 transition-colors">
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("HallOfFame")} className="hover:text-blue-400 transition-colors">
                    Hall of Fame
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} JastipDigital. Platform jasa titip digital terpercaya di Indonesia.
              </p>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">Powered by Duitku Payment Gateway</span>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">Transaksi Aman</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
