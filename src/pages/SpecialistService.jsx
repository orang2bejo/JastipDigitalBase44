
import React, { useState, useEffect } from "react";
import { SpecialistOrder } from "@/api/entities";
import { MitraSpecialist } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { 
  Wrench, 
  Zap, 
  Key, 
  Car, 
  Home,
  Laptop,
  Camera,
  MapPin,
  Clock,
  DollarSign,
  Upload,
  Plus,
  TruckIcon, 
  Star,
  Heart,
  MessageCircle, // Added MessageCircle import
  Send // Added Send icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const serviceCategories = [
  {
    category: "Emergency Services",
    icon: Zap,
    color: "bg-red-100 text-red-800",
    services: [
      { value: "tambal_ban", label: "Tambal Ban", icon: "🛞", description: "Motor/mobil ban bocor" },
      { value: "bengkel_panggilan", label: "Bengkel Panggilan", icon: "🔧", description: "Servis kendaraan di lokasi" },
      { value: "locksmith", label: "Tukang Kunci", icon: "🔑", description: "Kunci hilang/rusak/terkunci" },
      { value: "listrik_darurat", label: "Listrik Darurat", icon: "⚡", description: "MCB trip, korsleting, mati lampu" },
      { value: "ledeng_darurat", label: "Ledeng Darurat", icon: "🚰", description: "Pipa bocor, WC mampet, keran rusak" }
    ]
  },
  {
    category: "Perbaikan & Instalasi", 
    icon: Home,
    color: "bg-blue-100 text-blue-800",
    services: [
      { value: "tukang_listrik", label: "Tukang Listrik", icon: "⚡", description: "Instalasi, perbaikan stop kontak, MCB" },
      { value: "tukang_ledeng", label: "Tukang Ledeng", icon: "🚰", description: "Saluran mampet, kebocoran pipa" },
      { value: "teknisi_elektronik", label: "Teknisi Elektronik", icon: "📺", description: "TV, kulkas, mesin cuci, AC" },
      { value: "tukang_bangunan", label: "Tukang Bangunan Ringan", icon: "🏠", description: "Perbaikan genteng, dinding retak, cat" },
      { value: "pemesanan_bahan_bangunan", label: "Pemesanan Bahan Bangunan", icon: "🧱", description: "Pasir, bata, koral, semen, material" }
    ]
  },
  {
    category: "Kebersihan & Perawatan",
    icon: Home,
    color: "bg-green-100 text-green-800", 
    services: [
      { value: "cleaning_service", label: "Cleaning Service", icon: "🧹", description: "Bersih-bersih rumah/apartemen" },
      { value: "cuci_ac", label: "Cuci AC & Perawatan", icon: "❄️", description: "Service AC berkala, isi freon" },
      { value: "fogging_disinfeksi", label: "Fogging & Disinfeksi", icon: "🦠", description: "Sterilisasi rumah/kantor" },
      { value: "laundry_kiloan", label: "Laundry Kiloan/Ekspres", icon: "👕", description: "Pickup & delivery laundry" },
      { value: "pest_control", label: "Pest Control", icon: "🦟", description: "Rayap, tikus, kecoa, semut" }
    ]
  },
  {
    category: "Logistik & Pemindahan",
    icon: TruckIcon,
    color: "bg-purple-100 text-purple-800",
    services: [
      { value: "angkut_barang", label: "Jasa Angkut Barang", icon: "📦", description: "Pickup motor, mobil box, barang berat" },
      { value: "pindahan_rumah", label: "Pindahan Rumah/Kos", icon: "🏠", description: "Jasa pindahan lengkap" },
      { value: "kurir_instan", label: "Kurir Instan", icon: "📫", description: "Dokumen, barang kecil, express" },
      { value: "antar_hewan", label: "Antar Hewan Peliharaan", icon: "🐕", description: "Transport hewan ke vet/grooming" }
    ]
  },
  {
    category: "Jasa Kurir & Pengantaran",
    icon: Send,
    color: "bg-teal-100 text-teal-800",
    comingSoon: true,
    services: [
        { value: "kurir_multistop", label: "Kurir Multi-Stop", icon: "🚚", description: "Antar barang/dokumen ke banyak lokasi", comingSoon: true },
        { value: "kurir_cod", label: "Jasa Kurir COD", icon: "💰", description: "Ambil barang dan tagih pembayaran di tujuan", comingSoon: true },
    ]
  },
  {
    category: "Event & Dekorasi",
    icon: Star,
    color: "bg-pink-100 text-pink-800",
    services: [
      { value: "dekorasi_acara", label: "Dekorasi Acara", icon: "🎉", description: "Ultah, lamaran, aqiqah, nikahan" },
      { value: "sewa_perlengkapan", label: "Sewa Perlengkapan", icon: "🪑", description: "Tenda, kursi, sound system" },
      { value: "fotografer", label: "Fotografer/Videografer", icon: "📸", description: "Dokumentasi event panggilan" },
      { value: "mc_hiburan", label: "MC & Hiburan", icon: "🎤", description: "Badut, musik akustik, presenter" }
    ]
  },
  {
    category: "Digital & Teknologi",
    icon: Laptop,
    color: "bg-indigo-100 text-indigo-800", 
    services: [
      { value: "setting_wifi_cctv", label: "Setting Wi-Fi & CCTV", icon: "📡", description: "Install router, CCTV, printer" },
      { value: "servis_laptop", label: "Servis Laptop/PC", icon: "💻", description: "Perbaikan hardware/software panggilan" },
      { value: "desain_grafis", label: "Desain Grafis Cepat", icon: "🎨", description: "CV, undangan, brosur, logo" },
      { value: "admin_freelance", label: "Admin Freelance", icon: "📊", description: "Input data, administrasi" }
    ]
  },
  {
    category: "Hewan Peliharaan",
    icon: Heart,
    color: "bg-yellow-100 text-yellow-800",
    services: [
      { value: "grooming_panggilan", label: "Grooming Panggilan", icon: "🐶", description: "Potong bulu, mandi hewan di rumah" },
      { value: "vaksinasi_hewan", label: "Vaksinasi Hewan", icon: "💉", description: "Suntik vaksin di rumah" },
      { value: "pet_hotel", label: "Penitipan Hewan", icon: "🏨", description: "Pet hotel sementara" },
      { value: "dokter_hewan", label: "Dokter Hewan On-Call", icon: "👨‍⚕️", description: "Konsultasi & pemeriksaan di rumah" }
    ]
  },
  {
    category: "Gaya Hidup & Kesehatan",
    icon: Heart,
    color: "bg-orange-100 text-orange-800",
    services: [
      { value: "pijat_panggilan", label: "Pijat Tradisional/Refleksi", icon: "🤲", description: "Terapi pijat di rumah" },
      { value: "terapi_bekam", label: "Terapi Bekam/Akupuntur", icon: "🩺", description: "Pengobatan tradisional" },
      { value: "personal_trainer", label: "Yoga/Personal Trainer", icon: "🧘", description: "Pelatih kebugaran ke rumah" },
      { value: "konsultan_diet", label: "Konsultan Diet/Kebugaran", icon: "🥗", description: "Konsultasi nutrisi & fitness" }
    ]
  },
  {
    category: "Healthcare On-Call 🚨",
    icon: Heart,
    color: "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-200",
    comingSoon: true,
    services: [
      { value: "perawat_oncall", label: "Perawat On-Call", icon: "👩‍⚕️", description: "Perawatan di rumah, injeksi, infus", comingSoon: true },
      { value: "bidan_oncall", label: "Bidan On-Call", icon: "🤱", description: "Perawatan ibu hamil & bayi", comingSoon: true },
      { value: "ahli_gizi", label: "Ahli Gizi", icon: "🥗", description: "Konsultasi diet & nutrisi", comingSoon: true },
      { value: "apoteker_oncall", label: "Apoteker On-Call", icon: "💊", description: "Konsultasi obat & pengiriman", comingSoon: true },
      { value: "psc_119_emt", label: "Petugas PSC 119 / EMT", icon: "🚑", description: "Emergency Medical Technician", comingSoon: true },
      { value: "terapis", label: "Terapis Wicara/Okupasi/Fisio", icon: "🤲", description: "Terapi rehabilitasi di rumah", comingSoon: true },
      { value: "radiografer", label: "Radiografer", icon: "📡", description: "Pemeriksaan radiologi mobile", comingSoon: true },
      { value: "analis_kesehatan", label: "Analis Kesehatan (ATLM)", icon: "🔬", description: "Lab test di rumah", comingSoon: true },
      { value: "psikolog_klinis", label: "Psikolog Klinis", icon: "🧠", description: "Konseling & terapi psikologi", comingSoon: true },
      { value: "perawat_gigi", label: "Perawat Gigi", icon: "🦷", description: "Perawatan gigi & mulut", comingSoon: true },
      { value: "sanitarian", label: "Sanitarian", icon: "🌿", description: "Inspeksi sanitasi rumah/kantor", comingSoon: true }
    ]
  }
];

export default function SpecialistService() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [orderData, setOrderData] = useState({
    service_type: "",
    problem_description: "",
    problem_images: [],
    urgency_level: "medium",
    customer_location: {
      address: "",
      landmark: ""
    },
    preferred_time: "",
    budget_range: {
      min_budget: 0,
      max_budget: 0
    }
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleServiceSelect = (serviceValue) => {
    setSelectedService(serviceValue);
    setOrderData(prev => ({ ...prev, service_type: serviceValue }));
    setStep(2);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageUploading(true);
    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.file_url);
      
      setOrderData(prev => ({
        ...prev,
        problem_images: [...prev.problem_images, ...imageUrls]
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setImageUploading(false);
    }
  };

  const submitOrder = async () => {
    setIsSubmitting(true);
    try {
      await SpecialistOrder.create({
        ...orderData,
        status: "pending"
      });
      
      // Redirect to order tracking atau specialist dashboard
      setStep(3); // Success page
    } catch (error) {
      console.error("Error creating specialist order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedServiceInfo = () => {
    for (const category of serviceCategories) {
      const service = category.services.find(s => s.value === selectedService);
      if (service) return { ...service, category: category.category };
    }
    return null;
  };

  const handleSuggestService = () => {
    const message = encodeURIComponent("Halo, saya ingin mengusulkan penambahan layanan baru untuk JastipDigital:");
    const whatsappUrl = `https://wa.me/6282340042948?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mitra Spesialis 🔧
          </h1>
          <p className="text-gray-600 text-lg">
            Solusi cepat untuk masalah darurat & kebutuhan khusus Anda
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-8">
            {serviceCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <Card key={category.category} className={`border-0 shadow-xl bg-white/90 backdrop-blur-sm ${category.comingSoon ? 'relative overflow-hidden' : ''}`}>
                  {category.comingSoon && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-red-500 to-pink-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                      COMING SOON
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <CategoryIcon className="w-6 h-6 text-blue-600" />
                      {category.category}
                      <Badge className={category.color}>
                        {category.services.length} layanan
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.services.map((service) => (
                        <div
                          key={service.value}
                          onClick={() => service.comingSoon ? null : handleServiceSelect(service.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 group ${
                            service.comingSoon 
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-75' 
                              : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                          }`}
                        >
                          <div className="text-center relative">
                            {service.comingSoon && (
                              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                                SOON
                              </div>
                            )}
                            <div className="text-3xl mb-2">{service.icon}</div>
                            <h3 className={`font-semibold mb-1 ${
                              service.comingSoon 
                                ? 'text-gray-600' 
                                : 'text-gray-900 group-hover:text-blue-700'
                            }`}>
                              {service.label}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {service.description}
                            </p>
                            {service.comingSoon && (
                              <p className="text-xs text-red-600 font-semibold mt-2">
                                Segera Hadir! 🔥
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {category.comingSoon && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                        <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                          <Heart className="w-5 h-5" />
                          Revolusi Layanan Kesehatan Indonesia! 🚀
                        </h4>
                        <p className="text-red-700 text-sm mb-3">
                          Kami sedang mempersiapkan layanan kesehatan on-call pertama di Indonesia! 
                          Tenaga kesehatan profesional siap datang ke rumah Anda.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-red-100 text-red-800">✅ Tenaga Kesehatan Tersertifikasi</Badge>
                          <Badge className="bg-red-100 text-red-800">✅ Layanan 24/7</Badge>
                          <Badge className="bg-red-100 text-red-800">✅ Harga Transparan</Badge>
                        </div>
                        <p className="text-xs text-red-600 mt-3 font-semibold">
                          📅 Target Launch: Q4 2025 | Stay tuned! 
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Section Saran Layanan Baru */}
            <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Tidak Menemukan Layanan yang Anda Butuhkan?
                </h3>
                <p className="text-gray-600 mb-6">
                  Bantu kami berkembang dengan memberikan saran layanan baru untuk JastipDigital
                </p>
                <Button
                  onClick={handleSuggestService}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Masukkan Saran Layanan Baru
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && (
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                {getSelectedServiceInfo()?.icon} {getSelectedServiceInfo()?.label}
              </CardTitle>
              <p className="text-gray-600">{getSelectedServiceInfo()?.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-semibold">
                  Jelaskan Masalah/Kebutuhan Anda *
                </Label>
                <Textarea
                  placeholder="Contoh: Ban motor depan bocor di depan Alfamart Jl. Sudirman, butuh tambal segera karena ada meeting penting..."
                  value={orderData.problem_description}
                  onChange={(e) => setOrderData(prev => ({ ...prev, problem_description: e.target.value }))}
                  className="mt-2 min-h-[120px]"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">
                  Foto Masalah (Opsional)
                </Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="problem-images"
                  />
                  <label
                    htmlFor="problem-images"
                    className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 cursor-pointer"
                  >
                    {imageUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>Mengupload foto...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span>Upload foto masalah untuk memperjelas</span>
                      </div>
                    )}
                  </label>
                  
                  {orderData.problem_images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {orderData.problem_images.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Problem ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-semibold">
                    Tingkat Urgensi
                  </Label>
                  <Select
                    value={orderData.urgency_level}
                    onValueChange={(value) => setOrderData(prev => ({ ...prev, urgency_level: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">⚪ Normal - Tidak terburu-buru</SelectItem>
                      <SelectItem value="medium">🟡 Sedang - Hari ini juga</SelectItem>
                      <SelectItem value="high">🟠 Tinggi - Beberapa jam</SelectItem>
                      <SelectItem value="emergency">🔴 Darurat - Sekarang juga!</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold">
                    Waktu Diinginkan
                  </Label>
                  <Input
                    type="datetime-local"
                    value={orderData.preferred_time}
                    onChange={(e) => setOrderData(prev => ({ ...prev, preferred_time: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">
                  Lokasi *
                </Label>
                <div className="mt-2 space-y-3">
                  <Textarea
                    placeholder="Alamat lengkap lokasi masalah..."
                    value={orderData.customer_location.address}
                    onChange={(e) => setOrderData(prev => ({ 
                      ...prev, 
                      customer_location: { ...prev.customer_location, address: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="Patokan/landmark (Dekat Alfamart, sebelah warung Pak Budi, dll)"
                    value={orderData.customer_location.landmark}
                    onChange={(e) => setOrderData(prev => ({ 
                      ...prev, 
                      customer_location: { ...prev.customer_location, landmark: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">
                  Estimasi Budget (Range)
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-gray-600">Minimum</Label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={orderData.budget_range.min_budget}
                      onChange={(e) => setOrderData(prev => ({ 
                        ...prev, 
                        budget_range: { ...prev.budget_range, min_budget: parseInt(e.target.value) || 0 }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Maksimum</Label>
                    <Input
                      type="number"
                      placeholder="200000"
                      value={orderData.budget_range.max_budget}
                      onChange={(e) => setOrderData(prev => ({ 
                        ...prev, 
                        budget_range: { ...prev.budget_range, max_budget: parseInt(e.target.value) || 0 }
                      }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Mitra akan memberikan penawaran dalam range ini
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Yang Akan Terjadi Selanjutnya:</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>1. 📡 Sistem mencari mitra terdekat sesuai keahlian</p>
                  <p>2. 💬 Mitra tertarik akan memberikan penawaran & negosiasi</p>
                  <p>3. 🤝 Anda pilih penawaran terbaik</p>
                  <p>4. 🔧 Mitra datang dan menyelesaikan masalah</p>
                  <p>5. 💳 Pembayaran otomatis (Fee platform: 5-8%)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Kembali
                </Button>
                <Button
                  onClick={submitOrder}
                  disabled={!orderData.problem_description || !orderData.customer_location.address || isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Kirim Permintaan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-0 shadow-2xl bg-green-50">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Permintaan Berhasil Dikirim! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                Kami sedang mencari mitra terbaik di sekitar Anda. 
                Tunggu penawaran masuk dalam 5-15 menit.
              </p>
              <div className="space-y-3">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Lihat Status Permintaan
                </Button>
                <Button variant="outline">
                  Buat Permintaan Lain
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
