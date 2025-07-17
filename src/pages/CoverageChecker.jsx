import React, { useState, useEffect } from "react";
import { DeliveryZone } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Search, PlusCircle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CoverageChecker() {
  const [zones, setZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredZones, setFilteredZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredZones(zones);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = zones.filter(zone =>
        zone.zone_name.toLowerCase().includes(lowercasedFilter) ||
        zone.city_regency.toLowerCase().includes(lowercasedFilter) ||
        zone.province.toLowerCase().includes(lowercasedFilter) ||
        (zone.districts && zone.districts.join(', ').toLowerCase().includes(lowercasedFilter))
      );
      setFilteredZones(filtered);
    }
  }, [searchTerm, zones]);

  const loadZones = async () => {
    try {
      const activeZones = await DeliveryZone.filter({ is_active: true });
      setZones(activeZones);
      setFilteredZones(activeZones);
    } catch (error) {
      console.error("Error loading zones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Cek Area Layanan JastipDigital
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Lihat area mana saja yang sudah aktif dilayani driver kami dan area mana yang masih membutuhkan driver baru
          </p>
        </div>

        <div className="relative mb-8">
          <Input
            type="text"
            placeholder="Cari provinsi, kota, atau kecamatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 text-lg rounded-full shadow-lg"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-12 text-center text-white">
          <Rocket className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Ingin Area Anda Aktif? 🚀</h2>
          <p className="mb-6">
            Bergabunglah sebagai driver dan aktifkan area operasional baru! Setiap driver baru akan membuka layanan di kecamatan pilihannya.
          </p>
          <div className="flex justify-center gap-4">
            <Link to={createPageUrl("DriverRegistration")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-200">
                <PlusCircle className="w-5 h-5 mr-2" />
                Daftar Jadi Driver
              </Button>
            </Link>
             <Link to={createPageUrl("SuggestZone")}>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
                Sarankan Zona Baru
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Area Aktif</h3>
          {isLoading ? (
            <div className="text-center">Memuat area...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredZones.length > 0 ? (
                filteredZones.map((zone) => (
                  <Card key={zone.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-lg text-gray-900">{zone.zone_name}</h4>
                      <p className="text-gray-600">{zone.city_regency}, {zone.province}</p>
                      {zone.districts && zone.districts.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Kecamatan:</p>
                          <div className="flex flex-wrap gap-2">
                            {zone.districts.map(d => (
                              <span key={d} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{d}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 py-8">
                  Area yang Anda cari belum tersedia. Jadilah driver pertama di sana!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}