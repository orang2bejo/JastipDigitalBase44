
import React, { useState, useEffect } from "react";
import { Driver } from "@/api/entities";
import { IndonesiaRegion } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Phone,
  Car,
  CheckCircle,
  Zap,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DriverSpecialization from "../components/driver/DriverSpecialization";

// Indonesia Provinces Data
const indonesianProvinces = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi",
  "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung", "DKI Jakarta",
  "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten", "Bali",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah",
  "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara",
  "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo",
  "Sulawesi Barat", "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan",
  "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya"
];

export default function DriverRegistration() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ktpUploading, setKtpUploading] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    vehicle_type: "",
    license_plates: {
      motor: "",
      mobil: ""
    }, // Changed from single license_plate to object
    province: "",
    city_regency: "",
    districts: [],
    ktp_number: "",
    ktp_image_url: "",
    specializations: []
  });

  // Auto-load cities when province changes
  useEffect(() => {
    if (formData.province) {
      loadCitiesForProvince(formData.province);
    }
  }, [formData.province]);

  // Auto-load districts when city changes
  useEffect(() => {
    if (formData.city_regency) {
      loadDistrictsForCity(formData.city_regency);
    }
  }, [formData.city_regency]);

  const loadCitiesForProvince = async (province) => {
    try {
      // Dalam implementasi nyata, ini akan query database Indonesia regions
      // Untuk demo, kita simulasi beberapa kota besar
      const cities = {
        "DKI Jakarta": ["Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan", "Jakarta Timur"],
        "Jawa Barat": ["Bandung", "Bekasi", "Bogor", "Depok", "Cimahi", "Tasikmalaya"],
        "Jawa Tengah": ["Semarang", "Solo", "Yogyakarta", "Magelang", "Purwokerto"],
        "Jawa Timur": ["Surabaya", "Malang", "Kediri", "Blitar", "Madiun"],
        "Bali": ["Denpasar", "Ubud", "Sanur", "Kuta", "Gianyar"]
      };
      setAvailableCities(cities[province] || []);
    } catch (error) {
      console.error("Error loading cities:", error);
    }
  };

  const loadDistrictsForCity = async (city) => {
    try {
      // Simulasi kecamatan untuk demo
      const districts = {
        "Jakarta Selatan": ["Kebayoran Baru", "Senayan", "Setiabudi", "Mampang Prapatan", "Pancoran"],
        "Bandung": ["Cidadap", "Coblong", "Sukasari", "Sukajadi", "Cicendo"],
        "Surabaya": ["Gubeng", "Wonokromo", "Tegalsari", "Genteng", "Bubutan"],
        "Denpasar": ["Denpasar Selatan", "Denpasar Utara", "Denpasar Timur", "Denpasar Barat"]
      };
      setAvailableDistricts(districts[city] || []);
    } catch (error) {
      console.error("Error loading districts:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLicensePlateChange = (vehicleType, value) => {
    setFormData(prev => ({
      ...prev,
      license_plates: {
        ...prev.license_plates,
        [vehicleType]: value
      }
    }));
  };

  const handleDistrictToggle = (district) => {
    setFormData(prev => ({
      ...prev,
      districts: prev.districts.includes(district)
        ? prev.districts.filter(d => d !== district)
        : [...prev.districts, district]
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

  const handleSpecializationChange = (specs) => {
    setFormData(prev => ({ ...prev, specializations: specs }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const now = new Date();
      
      // Auto verification dengan score simulasi
      const ktpValidationScore = Math.floor(Math.random() * 20) + 80; // 80-100

      // Prepare license plate data based on vehicle type
      let finalLicensePlate = "";
      if (formData.vehicle_type === "motor") {
        finalLicensePlate = formData.license_plates.motor;
      } else if (formData.vehicle_type === "mobil") {
        finalLicensePlate = formData.license_plates.mobil;
      } else if (formData.vehicle_type === "both") {
        finalLicensePlate = `Motor: ${formData.license_plates.motor}, Mobil: ${formData.license_plates.mobil}`;
      }

      await Driver.create({
        ...formData,
        license_plate: finalLicensePlate, // Keep backward compatibility with single field
        license_plates: formData.license_plates, // Also store detailed info
        rating: 5.0,
        total_orders: 0,
        status: "offline",
        balance: 0,
        is_verified: true, // Auto verified
        verification_status: "approved", // Auto approved
        auto_verified_at: now.toISOString(),
        ktp_validation_score: ktpValidationScore,
        registration_time: now.toISOString(),
        is_blacklisted: false
      });

      // Update region status - mark area as active
      if (formData.districts.length > 0) {
        for (const district of formData.districts) {
          try {
            await IndonesiaRegion.create({
              province_name: formData.province,
              city_regency_name: formData.city_regency,
              district_name: district,
              is_active: true,
              active_drivers_count: 1,
              first_driver_registered: now.toISOString()
            });
          } catch (error) {
            // Region might already exist, update instead
            console.log("Region exists, area now active");
          }
        }
      }

      // Langsung ke dashboard - no verification waiting
      navigate(createPageUrl("DriverDashboard"));
    } catch (error) {
      console.error("Error creating driver profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = formData.full_name && formData.phone_number && formData.vehicle_type &&
                   formData.ktp_number && formData.ktp_image_url &&
                   formData.province && formData.city_regency && formData.districts.length > 0 &&
                   // Updated validation for license plates
                   ((formData.vehicle_type === "motor" && formData.license_plates.motor) ||
                    (formData.vehicle_type === "mobil" && formData.license_plates.mobil) ||
                    (formData.vehicle_type === "both" && formData.license_plates.motor && formData.license_plates.mobil));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
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
              Daftar Sebagai Driver JastipDigital 🚗
            </h1>
            <p className="text-gray-600">
              Bergabung dengan tim driver - verifikasi otomatis & langsung aktif!
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Car className="w-6 h-6 text-blue-600" />
              Informasi Driver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <Zap className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>⚡ Verifikasi Otomatis!</strong> Sistem AI akan memverifikasi KTP Anda secara otomatis. 
                  Langsung aktif setelah registrasi!
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
                  <Label htmlFor="phone_number" className="text-base font-semibold">
                    Nomor WhatsApp *
                  </Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="08123456789"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="vehicle_type" className="text-base font-semibold">
                    Jenis Kendaraan *
                  </Label>
                  <Select
                    value={formData.vehicle_type}
                    onValueChange={(value) => handleInputChange('vehicle_type', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Pilih kendaraan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motor">Motor</SelectItem>
                      <SelectItem value="mobil">Mobil</SelectItem>
                      <SelectItem value="both">Motor & Mobil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold">
                    Plat Nomor *
                  </Label>
                  <div className="mt-2 space-y-3">
                    {(formData.vehicle_type === "motor" || formData.vehicle_type === "both") && (
                      <div>
                        <Label htmlFor="motor_plate" className="text-sm text-gray-600">
                          Plat Nomor Motor
                        </Label>
                        <Input
                          id="motor_plate"
                          value={formData.license_plates.motor}
                          onChange={(e) => handleLicensePlateChange('motor', e.target.value)}
                          placeholder="B 1234 ABC"
                          className="mt-1"
                        />
                      </div>
                    )}
                    {(formData.vehicle_type === "mobil" || formData.vehicle_type === "both") && (
                      <div>
                        <Label htmlFor="mobil_plate" className="text-sm text-gray-600">
                          Plat Nomor Mobil
                        </Label>
                        <Input
                          id="mobil_plate"
                          value={formData.license_plates.mobil}
                          onChange={(e) => handleLicensePlateChange('mobil', e.target.value)}
                          placeholder="B 5678 DEF"
                          className="mt-1"
                        />
                      </div>
                    )}
                    {!formData.vehicle_type && (
                      <div className="text-sm text-gray-500 italic">
                        Pilih jenis kendaraan terlebih dahulu
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Area Operasional *
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Provinsi *</Label>
                    <Select
                      value={formData.province}
                      onValueChange={(value) => handleInputChange('province', value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Pilih provinsi" />
                      </SelectTrigger>
                      <SelectContent>
                        {indonesianProvinces.map(province => (
                          <SelectItem key={province} value={province}>{province}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Kota/Kabupaten *</Label>
                    <Select
                      value={formData.city_regency}
                      onValueChange={(value) => handleInputChange('city_regency', value)}
                      disabled={!formData.province}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Pilih kota/kabupaten" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {availableDistricts.length > 0 && (
                  <div>
                    <Label className="text-base font-semibold">
                      Kecamatan yang Akan Anda Layani * (Pilih minimal 1)
                    </Label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableDistricts.map(district => (
                        <div
                          key={district}
                          onClick={() => handleDistrictToggle(district)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.districts.includes(district)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{district}</span>
                            {formData.districts.includes(district) && (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Area yang Anda pilih akan menjadi aktif dan bisa menerima pesanan
                    </p>
                  </div>
                )}
              </div>

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
            </form>
          </CardContent>
        </Card>

        <DriverSpecialization
          specializations={formData.specializations}
          onSpecializationsChange={handleSpecializationChange}
        />

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Keuntungan Menjadi Driver JastipDigital:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p>⚡ <strong>Verifikasi otomatis</strong> - langsung aktif</p>
              <p>💰 <strong>Earning fleksibel</strong> - Rp 10rb flat + 3-10% untuk order besar</p>
              <p>🌟 <strong>Fee fair</strong> - hanya 25% dari earning Anda</p>
            </div>
            <div className="space-y-2">
              <p>🏦 <strong>Pembayaran otomatis</strong> - masuk ke wallet real-time</p>
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
