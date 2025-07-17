
import React, { useState, useEffect } from "react";
import { DeliveryZone } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Edit, Trash2 } from "lucide-react";

export default function ZoneManagement() {
  const [zones, setZones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    zone_name: "",
    province: "",
    city_regency: "",
    districts: "",
    base_delivery_fee: "5000",
    service_fee_percentage: "10",
    min_deposit_driver: "50000",
    special_notes: "",
    is_active: true
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const allZones = await DeliveryZone.list("-created_date");
      setZones(allZones);
    } catch (error) {
      console.error("Error loading zones:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const zoneData = {
        ...formData,
        districts: formData.districts.split(',').map(d => d.trim()).filter(d => d),
        base_delivery_fee: parseFloat(formData.base_delivery_fee),
        service_fee_percentage: parseFloat(formData.service_fee_percentage),
        min_deposit_driver: parseFloat(formData.min_deposit_driver),
        is_active: formData.is_active
      };

      if (editingZone) {
        await DeliveryZone.update(editingZone.id, zoneData);
      } else {
        await DeliveryZone.create(zoneData);
      }

      setShowForm(false);
      setEditingZone(null);
      setFormData({
        zone_name: "", province: "", city_regency: "", districts: "",
        base_delivery_fee: "5000", service_fee_percentage: "10", 
        min_deposit_driver: "50000", special_notes: "", is_active: true
      });
      loadZones();
    } catch (error) {
      console.error("Error saving zone:", error);
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      ...zone,
      districts: zone.districts ? zone.districts.join(', ') : "",
      is_active: zone.is_active || false
    });
    setShowForm(true);
  };

  const indonesianProvinces = [
    "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "DI Yogyakarta",
    "Banten", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat",
    "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
    "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara",
    "Gorontalo", "Sulawesi Barat", "Maluku", "Maluku Utara", "Papua", "Papua Barat",
    "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi",
    "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung", "Aceh"
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Zona Delivery</h1>
          <p className="text-gray-600">Kelola zona pengantaran untuk mengoptimalkan layanan per wilayah</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Zona
        </Button>
      </div>

      {showForm && (
        <Card className="border-0 shadow-xl bg-white/90">
          <CardHeader>
            <CardTitle>{editingZone ? 'Edit Zona' : 'Tambah Zona Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nama Zona *</Label>
                  <Input
                    value={formData.zone_name}
                    onChange={(e) => setFormData(prev => ({...prev, zone_name: e.target.value}))}
                    placeholder="Jakarta Selatan, Bandung Kota, dll"
                    required
                  />
                </div>
                <div>
                  <Label>Provinsi *</Label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData(prev => ({...prev, province: e.target.value}))}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Pilih Provinsi</option>
                    {indonesianProvinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kota/Kabupaten *</Label>
                  <Input
                    value={formData.city_regency}
                    onChange={(e) => setFormData(prev => ({...prev, city_regency: e.target.value}))}
                    placeholder="Jakarta Selatan, Bandung, dll"
                    required
                  />
                </div>
                <div>
                  <Label>Ongkir Dasar (Rp) *</Label>
                  <Input
                    type="number"
                    value={formData.base_delivery_fee}
                    onChange={(e) => setFormData(prev => ({...prev, base_delivery_fee: e.target.value}))}
                    placeholder="15000"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Kecamatan yang Dilayani</Label>
                <Input
                  value={formData.districts}
                  onChange={(e) => setFormData(prev => ({...prev, districts: e.target.value}))}
                  placeholder="Kebayoran Baru, Senayan, Setiabudi (pisahkan dengan koma)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Service Fee (%)</Label>
                  <Input
                    type="number"
                    value={formData.service_fee_percentage}
                    onChange={(e) => setFormData(prev => ({...prev, service_fee_percentage: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Min. Deposit Driver (Rp)</Label>
                  <Input
                    type="number"
                    value={formData.min_deposit_driver}
                    onChange={(e) => setFormData(prev => ({...prev, min_deposit_driver: e.target.value}))}
                  />
                </div>
              </div>

              <div>
                <Label>Catatan Khusus</Label>
                <Input
                  value={formData.special_notes}
                  onChange={(e) => setFormData(prev => ({...prev, special_notes: e.target.value}))}
                  placeholder="Contoh: Akses terbatas saat hujan, biaya tambahan untuk area pegunungan"
                />
              </div>

              <div className="flex items-center space-x-2">
                 <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <Label htmlFor="is_active">Aktifkan Zona</Label>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingZone ? 'Update Zona' : 'Simpan Zona'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {zones.map((zone) => (
          <Card key={zone.id} className="border-0 shadow-lg bg-white/90">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {zone.zone_name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{zone.city_regency}, {zone.province}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(zone)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Badge className={zone.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {zone.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Ongkir Dasar</span>
                  <p className="font-semibold text-green-600">Rp {zone.base_delivery_fee?.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Service Fee</span>
                  <p className="font-semibold">{zone.service_fee_percentage}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Min. Deposit</span>
                  <p className="font-semibold">Rp {zone.min_deposit_driver?.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Kecamatan</span>
                  <p className="font-semibold">{zone.districts?.length || 0} area</p>
                </div>
              </div>

              {zone.districts && zone.districts.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Kecamatan yang dilayani:</p>
                  <div className="flex flex-wrap gap-2">
                    {zone.districts.map((district, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {district}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {zone.special_notes && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Catatan:</strong> {zone.special_notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {zones.length === 0 && (
          <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
            <CardContent className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Belum Ada Zona Delivery
              </h3>
              <p className="text-gray-500 mb-6">
                Mulai dengan menambahkan zona delivery pertama untuk area operasional Anda
              </p>
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Zona Pertama
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
