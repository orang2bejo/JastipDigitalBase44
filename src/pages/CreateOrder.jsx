import React, { useState, useEffect, useCallback } from "react";
import { Order } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  Upload,
  Camera,
  MapPin,
  DollarSign,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Package,
  Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import LocationPicker from "../components/maps/LocationPicker";
import SurgePricingCalculator from "../components/payment/SurgePricingCalculator";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [pricingData, setPricingData] = useState(null);
  const [orderData, setOrderData] = useState({
    item_description: "",
    item_image_url: "",
    store_location: "",
    delivery_address: "",
    max_budget: "",
    customer_notes: "",
    customer_phone: "",
    item_category: "",
    item_properties: [],
    urgency_level: "normal",
    delivery_location_coords: null
  });

  const itemCategories = [
    { value: "makanan", label: "Makanan & Minuman" },
    { value: "obat", label: "Obat & Kesehatan" },
    { value: "barang_elektronik", label: "Elektronik" },
    { value: "pakaian", label: "Pakaian & Aksesoris" },
    { value: "kosmetik", label: "Kosmetik & Perawatan" },
    { value: "buku", label: "Buku & Alat Tulis" },
    { value: "lainnya", label: "Lainnya" }
  ];

  const itemPropertiesOptions = [
    { value: "rapuh", label: "Barang Rapuh" },
    { value: "berat", label: "Barang Berat (>5kg)" },
    { value: "perlu_pendingin", label: "Perlu Pendingin" },
    { value: "urgent", label: "Urgent/Mendesak" },
    { value: "mudah_rusak", label: "Mudah Rusak" }
  ];

  const handleInputChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePropertyChange = (property, checked) => {
    setOrderData(prev => ({
      ...prev,
      item_properties: checked
        ? [...prev.item_properties, property]
        : prev.item_properties.filter(p => p !== property)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('item_image_url', file_url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleLocationSelected = async (location) => {
    setIsGeocoding(true);
    setOrderData(prev => ({
      ...prev,
      delivery_location_coords: {
        lat: location.lat,
        lng: location.lng
      }
    }));

    // Reverse geocoding to get address from coordinates
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        handleInputChange('delivery_address', data.display_name);
      } else {
        handleInputChange('delivery_address', `Koordinat: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      handleInputChange('delivery_address', `Koordinat: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`);
    } finally {
      setIsGeocoding(false);
      setShowMapPicker(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const user = await User.me();

      const orderPayload = {
        ...orderData,
        max_budget: parseFloat(orderData.max_budget) || 0,
        status: "pending",
        created_by: user.email,
        // Add pricing data to the order payload
        base_delivery_fee: pricingData?.originalFee || 15000,
        final_delivery_fee: pricingData?.finalFee || 15000,
        surge_multiplier: pricingData?.multiplier || 1.0,
        surge_amount: pricingData?.surgeAmount || 0
      };

      await Order.create(orderPayload);
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = orderData.item_description && orderData.delivery_address && orderData.item_category;
  const canSubmit = canProceedToStep2 && orderData.max_budget && orderData.customer_phone;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => step === 1 ? navigate(createPageUrl("Dashboard")) : setStep(1)}
          className="hover:bg-white/50"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Buat Pesanan Jastip
          </h1>
          <p className="text-gray-600">
            {step === 1 ? "Deskripsikan barang yang kamu butuhkan" : "Lengkapi detail pesanan"}
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            step >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
          }`}>
            <span className="text-sm font-semibold">1</span>
          </div>
          <div className={`w-16 h-1 rounded-full ${
            step >= 2 ? 'bg-blue-600' : 'bg-gray-300'
          }`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            step >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
          }`}>
            <span className="text-sm font-semibold">2</span>
          </div>
          <div className={`w-16 h-1 rounded-full ${
            step >= 3 ? 'bg-green-600' : 'bg-gray-300'
          }`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            step >= 3 ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-400'
          }`}>
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Apa yang Kamu Butuhkan?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="item_description" className="text-base font-semibold">
                Deskripsi Barang *
              </Label>
              <Textarea
                id="item_description"
                placeholder="Contoh: Nasi gudeg Bu Tjitro yang di Malioboro, porsi besar dengan telur dan ayam. Atau bisa juga: Obat paracetamol merek Panadol di apotek terdekat"
                value={orderData.item_description}
                onChange={(e) => handleInputChange('item_description', e.target.value)}
                className="mt-2 min-h-[120px] text-base"
              />
              <p className="text-sm text-gray-500 mt-2">
                Semakin detail, semakin mudah driver memahami pesananmu
              </p>
            </div>

            <div>
              <Label htmlFor="item_category" className="text-base font-semibold">
                Kategori Barang *
              </Label>
              <Select
                value={orderData.item_category}
                onValueChange={(value) => handleInputChange('item_category', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Pilih kategori barang" />
                </SelectTrigger>
                <SelectContent>
                  {itemCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-semibold">
                Properti Khusus Barang
              </Label>
              <div className="mt-2 space-y-2">
                {itemPropertiesOptions.map(property => (
                  <div key={property.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={property.value}
                      checked={orderData.item_properties.includes(property.value)}
                      onCheckedChange={(checked) => handlePropertyChange(property.value, checked)}
                    />
                    <label htmlFor={property.value} className="text-sm font-medium">
                      {property.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">
                Foto Referensi (Opsional)
              </Label>
              <div className="mt-2">
                {orderData.item_image_url ? (
                  <div className="relative">
                    <img
                      src={orderData.item_image_url}
                      alt="Referensi barang"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleInputChange('item_image_url', '')}
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
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        {imageUploading ? (
                          <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-12 h-12 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-700">
                            {imageUploading ? "Mengupload..." : "Upload foto barang"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Foto produk dari online shop atau foto serupa
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="delivery_address" className="text-base font-semibold">
                  Alamat Pengantaran *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className="gap-2"
                >
                  <Map className="w-4 h-4"/>
                  {showMapPicker ? 'Tutup Peta' : 'Pilih di Peta'}
                </Button>
              </div>

              {showMapPicker && (
                <div className="mt-2 border rounded-xl p-4 bg-gray-50/50">
                  <LocationPicker onLocationSelect={handleLocationSelected} />
                </div>
              )}

              <Textarea
                id="delivery_address"
                placeholder="Masukkan alamat lengkap atau pilih dari peta"
                value={orderData.delivery_address}
                onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                className="mt-2"
                disabled={isGeocoding}
              />
              {isGeocoding && <p className="text-sm text-blue-600 mt-1">Mendapatkan nama alamat...</p>}
            </div>

            <div>
              <Label htmlFor="store_location" className="text-base font-semibold">
                Lokasi Pembelian
              </Label>
              <Input
                id="store_location"
                placeholder="Contoh: Malioboro, Jogja (kosongkan jika driver yang cari lokasi terbaik)"
                value={orderData.store_location}
                onChange={(e) => handleInputChange('store_location', e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-2">
                Kosongkan jika ingin driver yang mencari lokasi terbaik
              </p>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedToStep2}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-base font-semibold"
            >
              Lanjut ke Detail Pesanan
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Surge Pricing Calculator */}
          <SurgePricingCalculator
            baseFee={15000}
            itemCategory={orderData.item_category}
            deliveryZone={null}
            onPricingCalculated={setPricingData}
          />

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
                Detail Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing Summary Display */}
              {pricingData && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Estimasi Biaya:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Budget Barang:</p>
                      <p className="font-semibold">Rp {parseInt(orderData.max_budget || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ongkir:</p>
                      <p className="font-semibold text-blue-600">
                        Rp {pricingData.finalFee.toLocaleString('id-ID')}
                        {pricingData.multiplier !== 1 && (
                          <span className="text-xs ml-1">({pricingData.multiplier.toFixed(2)}x)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {pricingData.surgeAmount > 0 && (
                    <div className="mt-3 p-2 bg-orange-100 rounded-lg">
                      <p className="text-xs text-orange-800">
                        <strong>Surge pricing aktif:</strong> +Rp {pricingData.surgeAmount.toLocaleString('id-ID')}
                        {pricingData.appliedRules.length > 0 && (
                          <span> karena {pricingData.appliedRules.map(r => r.reason).join(', ').toLowerCase()}</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Budget Maksimum:</strong> Driver akan konfirmasi dengan foto jika harga melebihi budget ini.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="max_budget" className="text-base font-semibold">
                  Budget Maksimum Barang *
                </Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    Rp
                  </span>
                  <Input
                    id="max_budget"
                    type="number"
                    placeholder="50000"
                    value={orderData.max_budget}
                    onChange={(e) => handleInputChange('max_budget', e.target.value)}
                    className="pl-12 text-base"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Belum termasuk ongkir dan biaya layanan
                </p>
              </div>

              <div>
                <Label htmlFor="urgency_level" className="text-base font-semibold">
                  Tingkat Urgensi
                </Label>
                <Select
                  value={orderData.urgency_level}
                  onValueChange={(value) => handleInputChange('urgency_level', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent (+Rp 5.000)</SelectItem>
                    <SelectItem value="express">Express (+Rp 10.000)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customer_phone" className="text-base font-semibold">
                  Nomor WhatsApp *
                </Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  placeholder="08123456789"
                  value={orderData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  className="mt-2 text-base"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Driver akan menghubungi untuk konfirmasi
                </p>
              </div>

              <div>
                <Label htmlFor="customer_notes" className="text-base font-semibold">
                  Catatan Tambahan
                </Label>
                <Textarea
                  id="customer_notes"
                  placeholder="Catatan khusus untuk driver (misalnya: jangan terlalu pedas, pilih yang fresh, dll)"
                  value={orderData.customer_notes}
                  onChange={(e) => handleInputChange('customer_notes', e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Ringkasan Pesanan:</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Barang:</strong> {orderData.item_description}</p>
                  <p><strong>Kategori:</strong> {itemCategories.find(c => c.value === orderData.item_category)?.label}</p>
                  <p><strong>Budget Max:</strong> Rp {parseInt(orderData.max_budget || 0).toLocaleString('id-ID')}</p>
                  <p><strong>Alamat:</strong> {orderData.delivery_address}</p>
                  {orderData.item_properties.length > 0 && (
                    <p><strong>Properti:</strong> {orderData.item_properties.map(p => itemPropertiesOptions.find(opt => opt.value === p)?.label || p).join(', ')}</p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 py-3 text-base font-semibold"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses Pesanan...
                  </div>
                ) : (
                  "Buat Pesanan"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}