import React, { useState } from "react";
import { SupportTicket } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, Send, AlertCircle } from "lucide-react";

export default function SupportForm({ orderId, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    issue_type: "",
    title: "",
    description: "",
    priority: "medium"
  });
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const issueTypes = [
    { value: "barang_rusak", label: "Barang Rusak/Tidak Sesuai" },
    { value: "driver_tidak_responsif", label: "Driver Tidak Responsif" },
    { value: "customer_tidak_responsif", label: "Customer Tidak Responsif" },
    { value: "harga_tidak_sesuai", label: "Harga Tidak Sesuai" },
    { value: "keterlambatan", label: "Keterlambatan Pengantaran" },
    { value: "pembatalan_sepihak", label: "Pembatalan Sepihak" },
    { value: "lainnya", label: "Masalah Lainnya" }
  ];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(result => result.file_url);
      
      setEvidenceFiles(prev => [...prev, ...urls]);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.issue_type || !formData.title || !formData.description) return;

    setSubmitting(true);
    try {
      await SupportTicket.create({
        order_id: orderId,
        ...formData,
        evidence_urls: evidenceFiles
      });
      
      onSubmit();
    } catch (error) {
      console.error("Error submitting support ticket:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Laporkan Masalah
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="issue_type">Jenis Masalah *</Label>
            <Select
              value={formData.issue_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, issue_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis masalah" />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Judul Masalah *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ringkasan singkat masalah"
            />
          </div>

          <div>
            <Label htmlFor="description">Detail Masalah *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Jelaskan masalah secara detail..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="priority">Prioritas</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Rendah</SelectItem>
                <SelectItem value="medium">Sedang</SelectItem>
                <SelectItem value="high">Tinggi</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Bukti Foto (Opsional)</Label>
            <div className="mt-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="w-full"
                  asChild
                >
                  <div>
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Upload Foto Bukti
                      </>
                    )}
                  </div>
                </Button>
              </label>
            </div>
            
            {evidenceFiles.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {evidenceFiles.map((url, index) => (
                  <Badge key={index} variant="secondary">
                    Foto {index + 1}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!formData.issue_type || !formData.title || !formData.description || submitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Laporan
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}