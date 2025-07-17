import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  TruckIcon, 
  Wrench, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Clock,
  MessageCircle,
  Calculator,
  CreditCard,
  Banknote,
  TrendingUp,
  CloudRain,
  Calendar,
  AlertTriangle,
  Info
} from "lucide-react";

const userTypes = [
  {
    id: "titiper",
    name: "Titiper",
    icon: ShoppingCart,
    color: "bg-blue-500",
    description: "Pengguna yang ingin jasa titip belanja",
    features: [
      "Pesan barang dari toko manapun",
      "Pilih lokasi pengantaran di peta",
      "Chat langsung dengan driver",
      "Sistem pembayaran fleksibel (digital/tunai)",
      "Konfirmasi harga transparan",
      "Beri rating dan review setelah selesai"
    ],
    howTo: [
      "Daftar dengan email/Google",
      "Klik 'Buat Pesanan'",
      "Deskripsikan barang yang diinginkan",
      "Tentukan budget maksimum",
      "Pilih lokasi pengantaran",
      "Pilih metode pembayaran (digital/tunai)",
      "Tunggu driver menerima dan konfirmasi harga"
    ]
  },
  {
    id: "driver",
    name: "Driver",
    icon: TruckIcon,
    color: "bg-green-500",
    description: "Pengemudi yang mengantarkan pesanan",
    features: [
      "Terima pesanan sesuai zona",
      "Earning dengan sistem fee dinamis",
      "Konfirmasi harga transparan",
      "Bebas pilih jam kerja",
      "Wallet otomatis, withdraw kapan saja",
      "Kesempatan masuk Hall of Fame"
    ],
    howTo: [
      "Daftar sebagai driver",
      "Upload KTP (verifikasi otomatis)",
      "Pilih zona operasional",
      "Aktifkan status 'Online'",
      "Terima pesanan yang masuk",
      "Belanja, konfirmasi harga, dan antar"
    ]
  },
  {
    id: "mitra",
    name: "Mitra Spesialis",
    icon: Wrench,
    color: "bg-purple-500",
    description: "Ahli yang memberikan layanan khusus",
    features: [
      "Layanan sesuai keahlian",
      "Earning 94% dari deal (fee hanya 6%)",
      "Tentukan harga sendiri",
      "Portfolio dan rating tinggi",
      "Klien tetap dan repeat order",
      "Sistem negosiasi langsung"
    ],
    howTo: [
      "Daftar sebagai mitra",
      "Pilih spesialisasi keahlian",
      "Upload portfolio pekerjaan",
      "Tentukan area layanan",
      "Beri penawaran ke customer",
      "Kerjakan sesuai kesepakatan"
    ]
  }
];

const paymentScenarios = [
  {
    title: "Scenario Normal",
    example: "Budget Rp 50.000, Harga Aktual Rp 48.000",
    process: [
      "Titiper bayar Rp 50.000 + ongkir + fee",
      "Driver belanja dengan uang sendiri",
      "Driver konfirmasi harga Rp 48.000 + foto struk",
      "Titiper setuju, pesanan dilanjutkan",
      "Refund Rp 2.000 diproses otomatis"
    ],
    result: "Driver dapat ongkir penuh, Titiper dapat refund Rp 2.000"
  },
  {
    title: "Scenario Harga Naik",
    example: "Budget Rp 50.000, Harga Aktual Rp 65.000",
    process: [
      "Titiper bayar Rp 50.000 + ongkir + fee",
      "Driver belanja dengan uang sendiri",
      "Driver konfirmasi harga Rp 65.000 + foto struk + penjelasan",
      "Titiper pilih: Setuju bayar tambahan Rp 15.000 (digital/tunai)",
      "Jika setuju, pesanan lanjut. Jika tidak, bisa nego atau batal"
    ],
    result: "Driver dapat ongkir + penggantian penuh, Titiper bayar sesuai harga aktual"
  },
  {
    title: "Scenario Surge Pricing",
    example: "Jam 12:00 (peak hour) + Hujan deras",
    process: [
      "Ongkir dasar Rp 15.000",
      "Peak hour multiplier: 1.3x (+30%)",
      "Bad weather multiplier: 1.4x (+40%)",
      "Final ongkir: Rp 15.000 × 1.7 = Rp 25.500"
    ],
    result: "Driver dapat kompensasi lebih tinggi karena kondisi sulit"
  }
];

const pricingFactors = [
  {
    category: "Faktor Waktu",
    icon: Clock,
    factors: [
      { name: "Peak Hour (07-09, 12-14, 17-19)", multiplier: "1.2x - 1.5x", reason: "Jam sibuk, macet parah" },
      { name: "Malam Hari (22:00-05:00)", multiplier: "1.3x - 1.6x", reason: "Risiko keamanan, toko tutup" },
      { name: "Weekend/Libur", multiplier: "1.1x - 1.3x", reason: "Permintaan tinggi, driver sedikit" }
    ]
  },
  {
    category: "Faktor Cuaca",
    icon: CloudRain,
    factors: [
      { name: "Hujan Ringan", multiplier: "1.1x - 1.2x", reason: "Sedikit mengganggu perjalanan" },
      { name: "Hujan Deras/Badai", multiplier: "1.4x - 1.8x", reason: "Berbahaya, visibility rendah" },
      { name: "Banjir/Kondisi Ekstrem", multiplier: "2.0x - 3.0x", reason: "Sangat berbahaya, akses terbatas" }
    ]
  },
  {
    category: "Faktor Demand",
    icon: TrendingUp,
    factors: [
      { name: "Permintaan Tinggi", multiplier: "1.2x - 1.8x", reason: "Banyak pesanan, driver terbatas" },
      { name: "Driver Sedikit Online", multiplier: "1.3x - 2.0x", reason: "Supply-demand tidak seimbang" },
      { name: "Event Khusus (Festival, Demo)", multiplier: "1.5x - 2.5x", reason: "Akses terbatas, risiko tinggi" }
    ]
  }
];

const newFaqs = [
  {
    question: "Bagaimana sistem pembayaran terbaru bekerja?",
    answer: "Sekarang ada 3 metode: (1) Digital penuh via Duitku, (2) Tunai penuh ke driver, (3) Hybrid (bayar sebagian digital, sisanya tunai). Driver akan konfirmasi harga aktual dengan foto struk, lalu sistem otomatis hitung apakah perlu bayar tambahan atau dapat refund."
  },
  {
    question: "Mengapa ongkir bisa berubah-ubah (surge pricing)?",
    answer: "Ongkir kini dihitung real-time berdasarkan tingkat kesulitan. Faktor yang mempengaruhi: jam sibuk (+30%), cuaca buruk (+40%), permintaan tinggi (+50%), hari libur (+20%). Ini untuk memastikan driver tetap mau ambil pesanan meski kondisi sulit."
  },
  {
    question: "Apa itu konfirmasi harga dan negosiasi?",
    answer: "Setelah driver belanja, mereka wajib konfirmasi harga aktual + upload foto struk. Jika berbeda dari budget, Anda bisa: (1) Setuju dan bayar selisih, (2) Nego dengan tawaran harga lain, (3) Batalkan pesanan. Proses ini transparan dan adil untuk semua pihak."
  },
  {
    question: "Bagaimana sistem rating baru mempengaruhi driver?",
    answer: "Rating driver sekarang lebih detail: kualitas layanan, ketepatan waktu, komunikasi, dan rating keseluruhan. Driver dengan rating tinggi berpeluang masuk Hall of Fame dan mendapat hadiah dari pool donasi komunitas saat milestone tercapai."
  },
  {
    question: "Kapan pembayaran digital bisa digunakan penuh?",
    answer: "Sistem pembayaran digital via Duitku sedang dalam tahap trial. Untuk pengalaman terbaik saat ini, kami sarankan gunakan pembayaran tunai. Pembayaran digital akan semakin stabil seiring perkembangan platform."
  },
  {
    question: "Bagaimana jika harga barang lebih murah dari budget?",
    answer: "Sistem akan otomatis hitung refund untuk Anda. Misalnya budget Rp 50.000 tapi harga aktual Rp 45.000, maka Rp 5.000 akan dikembalikan. Proses refund untuk pembayaran digital diproses dalam 1-3 hari kerja."
  }
];

export default function UserGuide() {
  const [activeTab, setActiveTab] = useState("titiper");
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null);

  const activeUser = userTypes.find(user => user.id === activeTab);

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Panduan Pengguna JastipDigital
          </h1>
          <p className="text-xl text-gray-600">
            Platform jasa titip digital dengan sistem pembayaran & pricing terbaru
          </p>
        </div>

        {/* User Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-2xl p-2 shadow-lg">
            {userTypes.map((user) => {
              const Icon = user.icon;
              return (
                <button
                  key={user.id}
                  onClick={() => setActiveTab(user.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                    activeTab === user.id
                      ? `${user.color} text-white shadow-lg`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{user.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active User Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Features */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-12 h-12 ${activeUser.color} rounded-xl flex items-center justify-center`}>
                  <activeUser.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl">Apa itu {activeUser.name}?</h3>
                  <p className="text-gray-600 font-normal">{activeUser.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-4">Keunggulan Terbaru:</h4>
              <div className="space-y-3">
                {activeUser.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How To */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-blue-500" />
                Cara Memulai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeUser.howTo.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment System Explanation */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              💳 Sistem Pembayaran Terbaru
            </h2>
            <p className="text-gray-600">
              Lebih fleksibel, transparan, dan adil untuk semua pihak
            </p>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  Pembayaran Digital
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">Via Duitku (Kartu Kredit, Debit, E-wallet, Virtual Account)</p>
                  <Badge className="bg-orange-100 text-orange-800">Status: Trial Mode</Badge>
                  <div className="text-xs text-gray-600">
                    <p>✅ Praktis dan aman</p>
                    <p>✅ Riwayat transaksi jelas</p>
                    <p>⚠️ Masih dalam pengembangan</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-6 h-6 text-green-600" />
                  Pembayaran Tunai
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">Bayar langsung ke driver saat barang diantar</p>
                  <Badge className="bg-green-100 text-green-800">Status: Direkomendasikan</Badge>
                  <div className="text-xs text-gray-600">
                    <p>✅ Paling stabil dan mudah</p>
                    <p>✅ Interaksi langsung dengan driver</p>
                    <p>✅ Tidak perlu khawatir teknis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Scenarios */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Skenario Pembayaran</h3>
            <div className="grid gap-6">
              {paymentScenarios.map((scenario, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900">{scenario.title}</CardTitle>
                    <p className="text-gray-600">{scenario.example}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {scenario.process.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {stepIndex + 1}
                          </div>
                          <p className="text-sm text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                      <p className="text-sm font-semibold text-green-800">Hasil: {scenario.result}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Pricing Explanation */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Sistem Ongkir Dinamis (Surge Pricing)
            </h2>
            <p className="text-gray-600">
              Ongkir yang adil berdasarkan kondisi real-time
            </p>
          </div>

          <div className="grid gap-6">
            {pricingFactors.map((category, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="w-6 h-6 text-blue-600" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.factors.map((factor, factorIndex) => (
                      <div key={factorIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{factor.name}</p>
                          <p className="text-sm text-gray-600">{factor.reason}</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800 font-bold">
                          {factor.multiplier}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pricing Example */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-orange-50 to-red-50 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-6 h-6 text-orange-600" />
                Contoh Perhitungan Ongkir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">Kondisi Normal:</p>
                    <p>• Ongkir dasar: Rp 15.000</p>
                    <p>• Tidak ada faktor tambahan</p>
                    <p className="font-bold text-green-600">Total: Rp 15.000</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">Kondisi Sulit:</p>
                    <p>• Ongkir dasar: Rp 15.000</p>
                    <p>• Peak hour: +30% (Rp 4.500)</p>
                    <p>• Hujan deras: +40% (Rp 6.000)</p>
                    <p className="font-bold text-orange-600">Total: Rp 25.500</p>
                  </div>
                </div>
                <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Catatan:</strong> Sistem secara otomatis menghitung dan menampilkan alasan kenapa ongkir berubah. Driver mendapat kompensasi lebih tinggi untuk kondisi yang lebih sulit.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Updated FAQ */}
        <Card className="border-0 shadow-xl mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Pertanyaan Umum (FAQ) - Update Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {newFaqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-semibold text-lg text-gray-900 mb-2 flex items-start gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    {faq.question}
                  </h4>
                  <p className="text-gray-700 ml-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Konfirmasi Harga Transparan</h3>
              <p className="opacity-90">
                Driver wajib konfirmasi harga aktual dengan foto struk. Sistem otomatis hitung selisih untuk refund atau bayar tambahan.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Ongkir Dinamis</h3>
              <p className="opacity-90">
                Ongkir menyesuaikan kondisi real-time: jam sibuk, cuaca, permintaan. Driver dapat earning yang adil.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Rating & Hall of Fame</h3>
              <p className="opacity-90">
                Sistem rating detail untuk driver terbaik. Peluang masuk Hall of Fame dengan hadiah dari donasi komunitas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Siap Mencoba Sistem Terbaru?
          </h3>
          <p className="text-gray-600 mb-6">
            Nikmati pengalaman jastip yang lebih transparan, adil, dan menguntungkan
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Mulai Pesan
            </Button>
            <Button size="lg" variant="outline">
              <TruckIcon className="w-5 h-5 mr-2" />
              Jadi Driver
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}