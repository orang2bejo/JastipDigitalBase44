
import React, { useState } from "react";
import { Order } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, Trash2, Send } from "lucide-react";

export default function SubstitutionRequest({ order, onUpdate, userType }) {
  const [substitutionOptions, setSubstitutionOptions] = useState([]);
  const [newOption, setNewOption] = useState({
    item_name: "",
    price: "",
    description: "",
    image_url: ""
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setNewOption(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const addOption = () => {
    if (!newOption.item_name || !newOption.price) return;
    
    setSubstitutionOptions(prev => [...prev, { 
      ...newOption, 
      price: parseFloat(newOption.price) 
    }]);
    setNewOption({ item_name: "", price: "", description: "", image_url: "" });
  };

  const removeOption = (index) => {
    setSubstitutionOptions(prev => prev.filter((_, i) => i !== index));
  };

  const submitSubstitution = async () => {
    setSubmitting(true);
    try {
      await Order.update(order.id, {
        substitution_options: substitutionOptions,
        substitution_status: "pending",
        status: "substitution_pending"
      });
      onUpdate();
    } catch (error) {
      console.error("Error submitting substitution:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomerChoice = async (choice) => {
    setSubmitting(true);
    try {
      const updateData = {
        substitution_choice: choice,
        substitution_status: choice === "cancel" ? "rejected" : "approved",
        status: choice === "cancel" ? "cancelled" : "shopping"
      };

      if (choice !== "cancel" && choice !== "original") {
        const selectedOption = substitutionOptions.find(opt => opt.item_name === choice);
        if (selectedOption) {
          updateData.confirmed_price = selectedOption.price;
        }
      }

      await Order.update(order.id, updateData);
      onUpdate();
    } catch (error) {
      console.error("Error processing choice:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Driver Interface - Create Substitution Options
  if (userType === "driver" && order.status === "accepted") {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Send className="w-5 h-5" />
            Barang Tidak Tersedia?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-orange-700">
            Jika barang yang diminta titiper tidak tersedia, tawarkan alternatif berikut:
          </p>

          {/* Add New Option Form */}
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Nama barang pengganti"
                value={newOption.item_name}
                onChange={(e) => setNewOption(prev => ({ ...prev, item_name: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Harga (Rp)"
                value={newOption.price}
                onChange={(e) => setNewOption(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <Textarea
              placeholder="Deskripsi singkat (opsional)"
              value={newOption.description}
              onChange={(e) => setNewOption(prev => ({ ...prev, description: e.target.value }))}
              className="h-20"
            />
            
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="substitution-image"
              />
              <label htmlFor="substitution-image">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  asChild
                >
                  <div>
                    <Camera className="w-4 h-4 mr-2" />
                    {uploading ? 'Upload...' : 'Foto'}
                  </div>
                </Button>
              </label>
              <Button onClick={addOption} disabled={!newOption.item_name || !newOption.price}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Opsi
              </Button>
            </div>
          </div>

          {/* Current Options */}
          {substitutionOptions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-800">Opsi Pengganti:</h4>
              {substitutionOptions.map((option, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{option.item_name}</p>
                    <p className="text-sm text-gray-600">
                      Rp {option.price.toLocaleString('id-ID')}
                      {option.description && ` - ${option.description}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {substitutionOptions.length > 0 && (
            <Button
              onClick={submitSubstitution}
              disabled={submitting}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {submitting ? 'Mengirim...' : 'Kirim Opsi ke Titiper'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Customer Interface - Choose Substitution
  if (userType === "customer" && order.status === "substitution_pending") {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Send className="w-5 h-5" />
            Barang Tidak Tersedia - Pilih Alternatif
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-700">
            <strong>"{order.item_description}"</strong> tidak tersedia. Driver menawarkan alternatif berikut:
          </p>

          <div className="space-y-3">
            {order.substitution_options?.map((option, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{option.item_name}</h4>
                    <p className="text-lg font-bold text-green-600">
                      Rp {option.price.toLocaleString('id-ID')}
                    </p>
                    {option.description && (
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    )}
                  </div>
                  {option.image_url && (
                    <img 
                      src={option.image_url} 
                      alt={option.item_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </div>
                <Button
                  onClick={() => handleCustomerChoice(option.item_name)}
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Pilih Ini
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => handleCustomerChoice("cancel")}
              disabled={submitting}
              variant="outline"
              className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
            >
              Batalkan Pesanan
            </Button>
            <Button
              onClick={() => handleCustomerChoice("original")}
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Cari di Tempat Lain
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
