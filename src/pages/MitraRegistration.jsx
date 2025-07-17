import React, { useState } from "react";
import { MitraSpecialist } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Phone,
  Wrench,
  CheckCircle,
  Zap,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const serviceCategories = [
  {
    category: "Emergency Services",
    services: [
      { value: "tambal_ban", label: "Tambal Ban", icon: "🛞" },
      { value: "bengkel_panggilan", label: "Bengkel Panggilan", icon: "🔧" },
      { value: "locksmith", label: "Tukang Kunci", icon: "🔑" },
      { value: "listrik_darurat", label: "Listrik Darurat", icon: "⚡" },
      { value: "ledeng_darurat", label: "Ledeng Darurat", icon: "🚰" }
    ]
  },
  {
    category: "Home Services",
    services: [
      { value: "ac_service", label: "Service AC", icon: "❄️" },
      { value: "elektronik_repair", label: "Reparasi Elektronik", icon: "📺" },
      { value: "tukang_bangunan", label: "Tukang Bangunan", icon: "🏠" },
      { value: "pest_control", label: "Pest Control", icon: "🦟" },
      { value: "cleaning_service", label: "Cleaning Service", icon: "🧹" }
    ]
  },
  {
    category: "Digital Services",
    services: [
      { value: "it_support", label: "IT Support", icon: "💻" },
      { value: "fotografer", label: "Fotografer", icon: "📸" },
      { value: "les_privat", label: "Les Privat", icon: "📚" },
      { value: "translator", label: "Translator", icon: "🗣️" },
      { value: "desain_grafis", label: "Desain Grafis", icon: "🎨" }
    ]
  },
  {
    category: "Moving & Logistics",
    services: [
      { value: "angkut_barang", label: "Angkut Barang", icon: "📦" },
      { value: "pindahan_rumah", label: "Pindahan Rumah", icon: "🏠" },
      { value: "pindahan_kost", label: "Pindahan Kost", icon: "🎒" }
    ]
  },
  {
    category: "Event & Decoration",
    services: [
      { value: "dekorasi_nikahan", label: "Dekorasi Nikahan", icon: "💍" },
      { value: "dekorasi_acara", label: "Dekorasi Acara", icon: "🎉" }
    ]
  }
];

export default function MitraRegistration() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ktpUploading, setKtpUploading] = useState(false);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    business_name: "",
    phone_number: "",
    whatsapp_number: "",
    email: "",
    specializations: [],
    service_radius: 5,
    base_location: {
      address: "",
      province: "",
      city: "",
      district: ""
    },
    pricing_structure: {
      base_call_out_fee: "",
      per_km_charge: "",
      hourly_rate: "",
      minimum_charge: ""
    },
    ktp_number: "",
    ktp_image_url: "",
    portfolio_images: []
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSpecializationToggle = (specValue) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specValue)
        ? prev.specializations.filter(s => s !== specValue)
        : [...prev.specializations, specValue]
    }));
  };

  const handleKtpUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setKtpUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('ktp_image_url', file_url);
    } catch (error) {
      console.error("Error uploading KTP:", error);
    } finally {
      setKtpUploading(false);
    }
  };

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setPortfolioUploading(true);
    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.file_url);
      
      setFormData(prev => ({
        ...prev,
        portfolio_images: [...prev.portfolio_images, ...imageUrls]
      }));
    } catch (error) {
      console.error("Error uploading portfolio:", error);
    } finally {
      setPortfolioUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const now = new Date();
      
      await MitraSpecialist.create({
        ...formData,
        pricing_structure: {
          ...formData.pricing_structure,
          base_call_out_fee: parseFloat(formData.pricing_structure.base_call_out_fee) || 0,
          per_km_charge: parseFloat(formData.pricing_structure.per_km_charge) || 0,
          hourly_rate: parseFloat(formData.pricing_structure.hourly_rate) || 0,
          minimum_charge: parseFloat(formData.pricing_structure.minimum_charge) || 0
        },
        availability: {
          working_hours: {
            monday: "08:00-17:00",
            tuesday: "08:00-17:00", 
            wednesday: "08:00-17:00",
            thursday: "08:00-17:00",
            friday: "08:00-17:00",
            saturday: "08:00-17:00",
            sunday: "08:00-17:00"
          },
          emergency_available: false,
          current_status: "offline"
        },
        rating: 5.0,
        total_jobs: 0,
        completion_rate: 100,
        wallet_balance: 0,
        is_verified: true, // Auto verified
        verification_status: "approved", // Auto approved
        auto_verified_at: now.toISOString(),
        registration_time: now.toISOString(),
        is_active: true,
        blacklisted: false
      });

      // Langsung ke dashboard mitra
      navigate(createPageUrl("MitraDashboard"));
    } catch (error) {
      console.error("Error creating mitra profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = formData.full_name && formData.phone_number && formData.specializations.length > 0 &&
                   formData.ktp_number && formData.ktp_image_url && formData.base_location.address;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Daftar Sebagai Mitra Spesialis 🔧
            </h1>
            <p className="text-gray-600">
              Bergabung sebagai mitra layanan spesialis - verifikasi otomatis & langsung aktif!
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wrench className="w-6 h-6 text-blue-600" />
              Informasi Mitra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <Zap className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>⚡ Verifikasi Otomatis!</strong> Sistem AI akan memverifikasi KTP dan portfolio Anda secara otomatis. 
                  Langsung bisa terima pekerjaan setelah registrasi!
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="full_name" className="text-base font-semibold">
                    Nama Lengkap *
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Sesuai KTP"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="business_name" className="text-base font-semibold">
                    Nama Usaha (Opsional)
                  </Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="Bengkel Jaya, Tukang AC Pro"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone_number" className="text-base font-semibold">
                    Nomor Telepon *
                  </Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="08123456789"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp_number" className="text-base font-semibold">
                    Nomor WhatsApp *
                  </Label>
                  <Input
                    id="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                    placeholder="08123456789"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="mitra@email.com"
                  className="mt-2"
                />
              </div>

              {/* Specializations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  Pilih Keahlian/Spesialisasi * (Minimal 1)
                </h3>
                
                {serviceCategories.map((category) => (
                  <div key={category.category}>
                    <h4 className="font-medium text-gray-800 mb-3">{category.category}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {category.services.map((service) => (
                        <div
                          key={service.value}
                          onClick={() => handleSpecializationToggle(service.value)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.specializations.includes(service.value)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">{service.icon}</div>
                            <p className="text-sm font-medium">{service.label}</p>
                            {formData.specializations.includes(service.value) && (
                              <CheckCircle className="w-4 h-4 text-blue-600 mx-auto mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Location & Service Area */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Lokasi Base & Area Layanan *
                </h3>
                
                <div>
                  <Label className="text-base font-semibold">
                    Alamat Lengkap Base/Workshop *
                  </Label>
                  <Textarea
                    value={formData.base_location.address}
                    onChange={(e) => handleNestedInputChange('base_location', 'address', e.target.value)}
                    placeholder="Jl. Merdeka No. 123, RT 01/RW 02, Kelurahan ABC"
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Provinsi</Label>
                    <Input
                      value={formData.base_location.province}
                      onChange={(e) => handleNestedInputChange('base_location', 'province', e.target.value)}
                      placeholder="DKI Jakarta"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Kota/Kabupaten</Label>
                    <Input
                      value={formData.base_location.city}
                      onChange={(e) => handleNestedInputChange('base_location', 'city', e.target.value)}
                      placeholder="Jakarta Selatan"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Radius Layanan (km)</Label>
                    <Input
                      type="number"
                      value={formData.service_radius}
                      onChange={(e) => handleInputChange('service_radius', parseInt(e.target.value))}
                      placeholder="5"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Structure */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">💰 Struktur Harga (Opsional)</h3>
                <p className="text-sm text-gray-600">
                  Anda bisa mengisi estimasi harga sebagai panduan, atau langsung nego per pekerjaan
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Biaya Panggilan Dasar (Rp)</Label>
                    <Input
                      type="number"
                      value={formData.pricing_structure.base_call_out_fee}
                      onChange={(e) => handleNestedInputChange('pricing_structure', 'base_call_out_fee', e.target.value)}
                      placeholder="50000"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Biaya per KM (Rp)</Label>
                    <Input
                      type="number"
                      value={formData.pricing_structure.per_km_charge}
                      onChange={(e) => handleNestedInputChange('pricing_structure', 'per_km_charge', e.target.value)}
                      placeholder="5000"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Tarif per Jam (Rp)</Label>
                    <Input
                      type="number"
                      value={formData.pricing_structure.hourly_rate}
                      onChange={(e) => handleNestedInputChange('pricing_structure', 'hourly_rate', e.target.value)}
                      placeholder="100000"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Minimum Charge (Rp)</Label>
                    <Input
                      type="number"
                      value={formData.pricing_structure.minimum_charge}
                      onChange={(e) => handleNestedInputChange('pricing_structure', 'minimum_charge', e.target.value)}
                      placeholder="75000"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Verification Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">📄 Dokumen Verifikasi</h3>
                
                <div>
                  <Label htmlFor="ktp_number" className="text-base font-semibold">
                    Nomor KTP *
                  </Label>
                  <Input
                    id="ktp_number"
                    value={formData.ktp_number}
                    onChange={(e) => handleInputChange('ktp_number', e.target.value)}
                    placeholder="16 digit nomor KTP"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold">
                    Foto KTP *
                  </Label>
                  <div className="mt-2">
                    {formData.ktp_image_url ? (
                      <div className="relative">
                        <img
                          src={formData.ktp_image_url}
                          alt="KTP"
                          className="w-full h-48 object-cover rounded-xl"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleInputChange('ktp_image_url', '')}
                          className="absolute top-2 right-2"
                        >
                          Hapus
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleKtpUpload}
                          className="hidden"
                          id="ktp-upload"
                        />
                        <label htmlFor="ktp-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-3">
                            {ktpUploading ? (
                              <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Camera className="w-12 h-12 text-gray-400" />
                            )}
                            <div>
                              <p className="font-medium text-gray-700">
                                {ktpUploading ? "Mengupload..." : "Upload foto KTP"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Akan diverifikasi otomatis dengan AI
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">
                    Portfolio Pekerjaan (Opsional)
                  </Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload foto hasil pekerjaan sebelumnya untuk meningkatkan kepercayaan
                  </p>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePortfolioUpload}
                      className="hidden"
                      id="portfolio-upload"
                    />
                    <label
                      htmlFor="portfolio-upload"
                      className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 cursor-pointer"
                    >
                      {portfolioUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Mengupload portfolio...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Camera className="w-8 h-8 text-gray-400" />
                          <span>Upload foto portfolio (max 5 foto)</span>
                        </div>
                      )}
                    </label>
                    
                    {formData.portfolio_images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                        {formData.portfolio_images.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 w-6 h-6"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  portfolio_images: prev.portfolio_images.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Keuntungan Menjadi Mitra Spesialis JastipDigital:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p>⚡ <strong>Verifikasi otomatis</strong> - langsung aktif</p>
              <p>💰 <strong>Earning tinggi</strong> - 94% dari harga deal (fee hanya 6%)</p>
              <p>🎯 <strong>Pekerjaan sesuai keahlian</strong> - job matching pintar</p>
            </div>
            <div className="space-y-2">
              <p>🏦 <strong>Pembayaran otomatis</strong> - escrow system aman</p>
              <p>💸 <strong>Pencairan mudah</strong> - withdraw kapan saja</p>
              <p>📞 <strong>Support 24/7</strong> - bantuan customer service</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-base font-semibold"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Memproses & Verifikasi Otomatis...
            </div>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Daftar & Aktif Sekarang
            </>
          )}
        </Button>
      </div>
    </div>
  );
}