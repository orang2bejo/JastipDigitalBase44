import React, { useState } from "react";
import { DeliveryZone } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SuggestZone() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    zone_name: "",
    province: "",
    city_regency: "",
    districts: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const indonesianProvinces = [
    "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "DI Yogyakarta",
    "Banten", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat",
    "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
    "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara",
    "Gorontalo", "Sulawesi Barat", "Maluku", "Maluku Utara", "Papua", "Papua Barat",
    "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi",
    "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung", "Aceh"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.zone_name || !formData.province || !formData.city_regency) return;

    setIsSubmitting(true);
    try {
      await DeliveryZone.create({
        ...formData,
        districts: formData.districts.split(',').map(d => d.trim()).filter(d => d),
        base_delivery_fee: 5000,
        min_deposit_driver: 50000,
        is_active: false, // Disarankan sebagai tidak aktif, admin yang mengaktifkan
        special_notes: "Disarankan oleh driver"
      });
      navigate(createPageUrl("DriverDashboard"));
    } catch (error) {
      console.error("Error suggesting zone:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("DriverDashboard"))}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Sarankan Zona Baru</h1>
                <p className="text-gray-600">Bantu kami memperluas area layanan JastipDrive.</p>
            </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/90">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600"/>
                    Detail Zona
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            Setelah Anda sarankan, zona akan direview oleh Admin untuk diaktifkan dan ditentukan ongkirnya.
                        </AlertDescription>
                    </Alert>
                    
                    <div>
                        <Label>Nama Zona *</Label>
                        <Input
                            value={formData.zone_name}
                            onChange={(e) => setFormData(prev => ({...prev, zone_name: e.target.value}))}
                            placeholder="Contoh: Denpasar Selatan, Medan Baru"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Provinsi *</Label>
                            <select
                                value={formData.province}
                                onChange={(e) => setFormData(prev => ({...prev, province: e.target.value}))}
                                className="w-full p-2 border rounded-md mt-1"
                                required
                            >
                                <option value="">Pilih Provinsi</option>
                                {indonesianProvinces.map(province => (
                                <option key={province} value={province}>{province}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Kota/Kabupaten *</Label>
                            <Input
                                value={formData.city_regency}
                                onChange={(e) => setFormData(prev => ({...prev, city_regency: e.target.value}))}
                                placeholder="Contoh: Kota Denpasar, Kota Medan"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Area Kecamatan (Opsional)</Label>
                        <Input
                            value={formData.districts}
                            onChange={(e) => setFormData(prev => ({...prev, districts: e.target.value}))}
                            placeholder="Kec. Denpasar Selatan, Kec. Renon (pisahkan koma)"
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? 'Mengirim...' : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Kirim Saran Zona
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}