import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  UtensilsCrossed, 
  ShoppingBasket, 
  Pill, 
  Smartphone, 
  Home,
  Star
} from "lucide-react";

const specializationOptions = [
  {
    value: "makanan_minuman",
    label: "Makanan & Minuman",
    icon: UtensilsCrossed,
    description: "Warteg, resto, cafe, minuman",
    color: "bg-orange-100 text-orange-800"
  },
  {
    value: "pasar_tradisional", 
    label: "Pasar Tradisional",
    icon: ShoppingBasket,
    description: "Sayur, buah, bumbu, daging",
    color: "bg-green-100 text-green-800"
  },
  {
    value: "kesehatan_obat",
    label: "Kesehatan & Obat", 
    icon: Pill,
    description: "Apotek, obat, vitamin, alkes",
    color: "bg-blue-100 text-blue-800"
  },
  {
    value: "retail_elektronik",
    label: "Retail & Elektronik",
    icon: Smartphone, 
    description: "Minimarket, elektronik, gadget",
    color: "bg-purple-100 text-purple-800"
  },
  {
    value: "kebutuhan_rumah",
    label: "Kebutuhan Rumah",
    icon: Home,
    description: "Galon, gas, deterjen, perlengkapan",
    color: "bg-indigo-100 text-indigo-800"
  },
  {
    value: "umum",
    label: "Umum (Semua Kategori)",
    icon: Star,
    description: "Berpengalaman di semua jenis barang",
    color: "bg-yellow-100 text-yellow-800"
  }
];

export default function DriverSpecialization({ 
  specializations = [], 
  onSpecializationsChange,
  onSave,
  showSaveButton = false
}) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSpecChange = (specValue, checked) => {
    const newSpecs = checked 
        ? [...specializations, specValue]
        : specializations.filter(s => s !== specValue);
    if(onSpecializationsChange) onSpecializationsChange(newSpecs);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if(onSave) await onSave(specializations);
    } catch (error) {
      console.error("Error saving specializations:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Spesialisasi Driver
        </CardTitle>
        <p className="text-sm text-gray-600">
          Pilih kategori barang yang paling Anda kuasai. Ini membantu customer mendapat layanan terbaik.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specializationOptions.map((spec) => {
            const Icon = spec.icon;
            const isSelected = specializations.includes(spec.value);
            
            return (
              <div
                key={spec.value}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSpecChange(spec.value, !isSelected)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    id={`spec-${spec.value}`}
                    onCheckedChange={(checked) => handleSpecChange(spec.value, checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <label htmlFor={`spec-${spec.value}`} className="font-semibold text-gray-900 cursor-pointer">{spec.label}</label>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{spec.description}</p>
                    <Badge className={spec.color}>
                      {isSelected ? 'Dipilih' : 'Pilih'}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {specializations.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Spesialisasi Terpilih:</h4>
            <div className="flex flex-wrap gap-2">
              {specializations.map(spec => {
                const option = specializationOptions.find(o => o.value === spec);
                return (
                  <Badge key={spec} className={option?.color}>
                    {option?.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {showSaveButton && (
          <Button 
            onClick={handleSave}
            disabled={isSaving || specializations.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Spesialisasi'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}