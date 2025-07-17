import React, { useState, useEffect } from "react";
import { SpecialistOrder } from "@/api/entities";
import { MitraSpecialist } from "@/api/entities";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Power,
  PowerOff,
  MapPin,
  Clock,
  Star,
  Wallet,
  CheckCircle,
  AlertTriangle,
  Send,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

export default function MitraDashboard() {
  const [jobs, setJobs] = useState([]);
  const [mitraProfile, setMitraProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      let mitras = await MitraSpecialist.filter({ created_by: user.email });

      if (mitras.length === 0) {
        navigate(createPageUrl("MitraRegistration"));
        return;
      }

      const mitra = mitras[0];
      setMitraProfile(mitra);
      setIsOnline(mitra.availability?.current_status === "available");

      // Load available jobs dalam specializations mitra
      const availableJobs = await SpecialistOrder.filter({
        status: "pending"
      }, "-created_date", 20);

      // Filter berdasarkan specializations mitra
      const relevantJobs = availableJobs.filter(job => 
        mitra.specializations && mitra.specializations.includes(job.service_type)
      );

      setJobs(relevantJobs);

    } catch (error) {
      console.error("Error loading mitra data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!mitraProfile) return;

    const newStatus = isOnline ? "offline" : "available";
    await MitraSpecialist.update(mitraProfile.id, { 
      availability: {
        ...mitraProfile.availability,
        current_status: newStatus
      }
    });
    setIsOnline(!isOnline);
    setMitraProfile(prev => ({ 
      ...prev, 
      availability: { ...prev.availability, current_status: newStatus }
    }));
  };

  const submitQuote = async (jobId, quoteData) => {
    if (!mitraProfile) return;

    try {
      const job = jobs.find(j => j.id === jobId);
      const existingQuotes = job.quotes || [];
      
      const newQuote = {
        mitra_id: mitraProfile.id,
        mitra_name: mitraProfile.full_name,
        mitra_rating: mitraProfile.rating,
        quoted_price: quoteData.price,
        estimated_duration: quoteData.duration,
        includes: quoteData.includes.split(',').map(item => item.trim()),
        notes: quoteData.notes,
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      await SpecialistOrder.update(jobId, {
        quotes: [...existingQuotes, newQuote],
        status: "quoted"
      });

      loadData();
    } catch (error) {
      console.error("Error submitting quote:", error);
    }
  };

  const urgencyColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800", 
    high: "bg-orange-100 text-orange-800",
    emergency: "bg-red-100 text-red-800"
  };

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Mitra 🔧
          </h1>
          <p className="text-gray-600">
            Kelola pekerjaan dan berikan layanan terbaik
          </p>
        </div>

        <Card className="lg:w-80 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="font-semibold">
                  {isOnline ? 'Tersedia' : 'Offline'}
                </span>
              </div>
              <Switch
                checked={isOnline}
                onCheckedChange={toggleOnlineStatus}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>🎉 Selamat!</strong> Profil Mitra Anda telah terverifikasi. 
          Mulai terima pekerjaan dan raih penghasilan!
        </AlertDescription>
      </Alert>

      {/* Mitra Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Saldo Wallet</p>
                <p className="text-2xl font-bold">Rp {(mitraProfile?.wallet_balance || 0).toLocaleString('id-ID')}</p>
              </div>
              <Wallet className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Pekerjaan</p>
                <p className="text-2xl font-bold">{mitraProfile?.total_jobs || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Rating</p>
                <p className="text-2xl font-bold">{mitraProfile?.rating || 5.0}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-200 fill-yellow-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Jobs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pekerjaan Tersedia</h2>
          <Badge variant="secondary" className="px-3 py-1">
            {jobs.length} pekerjaan
          </Badge>
        </div>

        {!isOnline && (
          <Card className="border-amber-200 bg-amber-50 mb-6">
            <CardContent className="p-6 text-center">
              <PowerOff className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Anda Sedang Offline
              </h3>
              <p className="text-amber-700 mb-4">
                Aktifkan status tersedia untuk melihat dan menerima pekerjaan baru
              </p>
              <Button
                onClick={toggleOnlineStatus}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Power className="w-4 h-4 mr-2" />
                Aktifkan Status Tersedia
              </Button>
            </CardContent>
          </Card>
        )}

        {isOnline && jobs.length === 0 && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Belum Ada Pekerjaan Baru
              </h3>
              <p className="text-gray-500">
                Pekerjaan sesuai keahlian Anda akan muncul di sini
              </p>
            </CardContent>
          </Card>
        )}

        {isOnline && jobs.length > 0 && (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onSubmitQuote={submitQuote}
                urgencyColors={urgencyColors}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Job Card Component
function JobCard({ job, onSubmitQuote, urgencyColors }) {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteData, setQuoteData] = useState({
    price: '',
    duration: '',
    includes: '',
    notes: ''
  });

  const handleSubmitQuote = () => {
    onSubmitQuote(job.id, quoteData);
    setShowQuoteForm(false);
    setQuoteData({ price: '', duration: '', includes: '', notes: '' });
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Badge className={urgencyColors[job.urgency_level]}>
            <Clock className="w-4 h-4 mr-1" />
            {job.urgency_level === 'emergency' ? 'DARURAT!' : 
             job.urgency_level === 'high' ? 'Urgent' :
             job.urgency_level === 'medium' ? 'Sedang' : 'Normal'}
          </Badge>
          <p className="text-sm text-gray-500">
            {new Date(job.created_date).toLocaleString('id-ID')}
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {job.service_type.replace(/_/g, ' ').toUpperCase()}
        </h3>

        <p className="text-gray-700 mb-4">{job.problem_description}</p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm">
              <strong>Lokasi:</strong> {job.customer_location?.address}
            </span>
          </div>
          {job.customer_location?.landmark && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-sm">
                <strong>Patokan:</strong> {job.customer_location.landmark}
              </span>
            </div>
          )}
          {job.preferred_time && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-sm">
                <strong>Waktu Diinginkan:</strong> {new Date(job.preferred_time).toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>

        {job.problem_images && job.problem_images.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Foto Masalah:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {job.problem_images.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Problem ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-600">Budget Range Titiper</p>
            <p className="text-lg font-bold text-green-600">
              Rp {job.budget_range?.min_budget?.toLocaleString('id-ID')} - 
              Rp {job.budget_range?.max_budget?.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl(`SpecialistJobDetail?id=${job.id}`)}>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Detail
              </Button>
            </Link>
            <Button
              onClick={() => setShowQuoteForm(!showQuoteForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Beri Penawaran
            </Button>
          </div>
        </div>

        {showQuoteForm && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-blue-900">Buat Penawaran:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Penawaran (Rp)
                </label>
                <input
                  type="number"
                  value={quoteData.price}
                  onChange={(e) => setQuoteData(prev => ({...prev, price: e.target.value}))}
                  className="w-full p-2 border rounded-md"
                  placeholder="150000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimasi Waktu
                </label>
                <input
                  type="text"
                  value={quoteData.duration}
                  onChange={(e) => setQuoteData(prev => ({...prev, duration: e.target.value}))}
                  className="w-full p-2 border rounded-md"
                  placeholder="2-3 jam"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yang Termasuk dalam Harga (pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={quoteData.includes}
                onChange={(e) => setQuoteData(prev => ({...prev, includes: e.target.value}))}
                className="w-full p-2 border rounded-md"
                placeholder="Material, Transport, Garansi 1 minggu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan Tambahan
              </label>
              <textarea
                value={quoteData.notes}
                onChange={(e) => setQuoteData(prev => ({...prev, notes: e.target.value}))}
                className="w-full p-2 border rounded-md h-20"
                placeholder="Penjelasan tambahan tentang pekerjaan..."
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowQuoteForm(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmitQuote}
                disabled={!quoteData.price || !quoteData.duration}
                className="bg-green-600 hover:bg-green-700"
              >
                Kirim Penawaran
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}