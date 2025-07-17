import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Truck, 
  Clock, 
  Star,
  MapPin,
  Phone,
  Mail,
  Building
} from 'lucide-react';

export default function PricingInfo() {
  const servicePricing = [
    {
      category: "Makanan & Minuman",
      basePrice: "15.000",
      serviceFee: "8%",
      deliveryFee: "10.000 - 25.000",
      description: "Jasa titip beli makanan, minuman, dan cemilan dari restoran, warung, atau toko",
      features: ["Tersedia 24/7", "Konfirmasi foto", "Garansi fresh"]
    },
    {
      category: "Obat & Kesehatan", 
      basePrice: "20.000",
      serviceFee: "10%",
      deliveryFee: "15.000 - 30.000",
      description: "Pembelian obat-obatan, vitamin, dan produk kesehatan dari apotek terdekat",
      features: ["Tersedia resep", "Konsultasi farmasi", "Pengantaran cepat"]
    },
    {
      category: "Kebutuhan Harian",
      basePrice: "12.000", 
      serviceFee: "6%",
      deliveryFee: "8.000 - 20.000",
      description: "Belanja kebutuhan sehari-hari seperti sabun, detergen, dan perlengkapan rumah",
      features: ["Bulk order", "Pilihan merek", "Harga terjangkau"]
    },
    {
      category: "Elektronik & Gadget",
      basePrice: "25.000",
      serviceFee: "5%", 
      deliveryFee: "20.000 - 50.000",
      description: "Pembelian elektronik, aksesoris gadget, dan perangkat teknologi",
      features: ["Garansi toko", "Pengecekan kondisi", "Asuransi pengiriman"]
    }
  ];

  const zonePricing = [
    { zone: "Jakarta Pusat", baseDelivery: "12.000", surge: "1.2x saat rush hour" },
    { zone: "Jakarta Selatan", baseDelivery: "15.000", surge: "1.3x saat weekend" },
    { zone: "Jakarta Timur", baseDelivery: "18.000", surge: "1.1x normal" },
    { zone: "Jakarta Barat", baseDelivery: "16.000", surge: "1.2x saat hujan" },
    { zone: "Jakarta Utara", baseDelivery: "20.000", surge: "1.4x area terpencil" },
    { zone: "Bekasi/Tangerang", baseDelivery: "25.000", surge: "1.5x jarak jauh" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Paket Layanan JastipDigital
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Layanan jasa titip beli terpercaya dengan harga transparan dan driver terverifikasi
          </p>
        </div>

        {/* Service Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {servicePricing.map((service, index) => (
            <Card key={index} className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-gray-900">
                    {service.category}
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-800">
                    Mulai Rp {service.basePrice}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{service.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Biaya Layanan:</span>
                    <p className="font-semibold text-blue-600">{service.serviceFee}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ongkir:</span>
                    <p className="font-semibold text-orange-600">Rp {service.deliveryFee}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fitur Termasuk:</h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Zone Pricing */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              Tarif Ongkir Per Zona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zonePricing.map((zone, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">{zone.zone}</h4>
                    <Badge variant="outline">Rp {zone.baseDelivery}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{zone.surge}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Kontak & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Email Support</p>
                  <p className="text-blue-100">support@jastipdigital.id</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6" />
                <div>
                  <p className="font-semibold">WhatsApp</p>
                  <p className="text-blue-100">+62 821-9999-8888</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Alamat Kantor</p>
                  <p className="text-blue-100">Jl. Sudirman No. 123<br/>Jakarta Pusat 10220</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Mengapa Pilih JastipDigital?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <ShoppingCart className="w-12 h-12 text-blue-600 mx-auto" />
                <h4 className="font-semibold">Beragam Produk</h4>
                <p className="text-gray-600 text-sm">Dari makanan hingga elektronik, semua bisa dititipkan</p>
              </div>
              <div className="space-y-2">
                <Truck className="w-12 h-12 text-green-600 mx-auto" />
                <h4 className="font-semibold">Driver Terverifikasi</h4>
                <p className="text-gray-600 text-sm">Semua driver telah melalui proses verifikasi ketat</p>
              </div>
              <div className="space-y-2">
                <Clock className="w-12 h-12 text-orange-600 mx-auto" />
                <h4 className="font-semibold">Layanan 24/7</h4>
                <p className="text-gray-600 text-sm">Tersedia kapan saja sesuai kebutuhan Anda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}