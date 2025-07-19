import React, { useState, useEffect } from "react";
import { MitraSpecialist, SpecialistOrder, User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Wrench,
  Zap,
  Home,
  Car,
  Smartphone,
  Laptop,
  Heart,
  Paintbrush,
  Camera,
  BookOpen,
  Star,
  MapPin,
  Clock,
  Award,
  Search,
  Filter,
  MessageCircle,
  Phone,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const serviceCategories = [
  {
    id: 1,
    name: "Reparasi Elektronik",
    icon: Zap,
    description: "Perbaikan TV, kulkas, AC, dan peralatan elektronik",
    demand: "high",
    specialists: 45
  },
  {
    id: 2,
    name: "Service Kendaraan",
    icon: Car,
    description: "Perawatan motor, mobil, dan kendaraan bermotor",
    demand: "high",
    specialists: 38
  },
  {
    id: 3,
    name: "Renovasi Rumah",
    icon: Home,
    description: "Renovasi, plumbing, listrik, dan konstruksi",
    demand: "medium",
    specialists: 32
  },
  {
    id: 4,
    name: "IT & Gadget",
    icon: Smartphone,
    description: "Perbaikan HP, laptop, instalasi software",
    demand: "high",
    specialists: 29
  },
  {
    id: 5,
    name: "Perawatan Kesehatan",
    icon: Heart,
    description: "Fisioterapi, perawat, konsultasi kesehatan",
    demand: "medium",
    specialists: 18
  },
  {
    id: 6,
    name: "Desain & Kreativ",
    icon: Paintbrush,
    description: "Desain grafis, fotografi, video editing",
    demand: "medium",
    specialists: 25
  }
];

const featuredSpecialists = [
  {
    id: 1,
    name: "Ahmad Elektronik Service",
    category: "Reparasi Elektronik",
    rating: 4.9,
    completedJobs: 234,
    location: "Jakarta Pusat",
    specialties: ["TV", "Kulkas", "AC", "Mesin Cuci"],
    verified: true,
    priceRange: "50K - 500K",
    responseTime: "< 2 jam"
  },
  {
    id: 2,
    name: "Bengkel Motor Jaya",
    category: "Service Kendaraan",
    rating: 4.8,
    completedJobs: 189,
    location: "Jakarta Selatan",
    specialties: ["Servis Rutin", "Ganti Oli", "Ban", "Rem"],
    verified: true,
    priceRange: "30K - 300K",
    responseTime: "< 1 jam"
  },
  {
    id: 3,
    name: "TechFix Solutions",
    category: "IT & Gadget",
    rating: 4.9,
    completedJobs: 156,
    location: "Jakarta Barat",
    specialties: ["iPhone", "Android", "Laptop", "PC"],
    verified: true,
    priceRange: "75K - 800K",
    responseTime: "< 3 jam"
  }
];

export default function SpecialistService() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [specialists, setSpecialists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      if (!currentUser) {
        navigate(createPageUrl("LandingPage"));
        return;
      }
      
      setUser(currentUser);
      
      // Load specialists data
      const specialistData = await MitraSpecialist.list();
      setSpecialists(specialistData || featuredSpecialists);

      // Load user's specialist orders
      const orders = await SpecialistOrder.list();
      const userOrders = orders.filter(order => order.user_id === currentUser.id);
      setMyOrders(userOrders);
      
    } catch (error) {
      console.error('Error loading specialist service data:', error);
      // Use mock data if API fails
      setSpecialists(featuredSpecialists);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestService = (specialistId) => {
    navigate(createPageUrl(`SpecialistNegotiation?specialist_id=${specialistId}`));
  };

  const filteredSpecialists = specialists.filter(specialist => {
    const matchesCategory = !selectedCategory || specialist.category === selectedCategory.name;
    const matchesSearch = !searchTerm || 
      specialist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialist.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading specialist services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Layanan <span className="text-purple-600">Spesialis</span> 🎯
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Temukan ahli berpengalaman untuk kebutuhan spesialis Anda. 
          Dari reparasi elektronik hingga konsultasi profesional.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari spesialis atau layanan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Cari Spesialis</TabsTrigger>
          <TabsTrigger value="categories">Kategori</TabsTrigger>
          <TabsTrigger value="my-orders">Pesanan Saya</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Featured Specialists */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Spesialis Terpilih</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpecialists.map((specialist) => (
                <Card key={specialist.id} className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {specialist.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{specialist.name}</h3>
                          <p className="text-sm text-gray-600">{specialist.category}</p>
                        </div>
                      </div>
                      {specialist.verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{specialist.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{specialist.completedJobs} jobs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{specialist.location}</span>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {specialist.specialties?.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {specialist.specialties?.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{specialist.specialties.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Price & Response Time */}
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                      <span>💰 {specialist.priceRange}</span>
                      <span>⚡ {specialist.responseTime}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleRequestService(specialist.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleRequestService(specialist.id)}
                      >
                        Pesan Sekarang
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Service Categories */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Kategori Layanan</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card 
                    key={category.id} 
                    className={`hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                      selectedCategory?.id === category.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-transparent hover:border-purple-200'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <Badge className={
                          category.demand === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {category.demand === 'high' ? '🔥 High Demand' : '📈 Medium Demand'}
                        </Badge>
                        <span className="text-sm text-gray-600">{category.specialists} spesialis</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pesanan Spesialis</CardTitle>
            </CardHeader>
            <CardContent>
              {myOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Belum Ada Pesanan Spesialis
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Mulai pesan layanan spesialis dan nikmati hasil kerja profesional
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Cari Spesialis
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order, index) => (
                    <div key={order.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{order.service_description || 'Specialist Service'}</h4>
                        <p className="text-sm text-gray-600">
                          Spesialis: {order.mitra?.business_name || 'Professional Service'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.created_date ? new Date(order.created_date).toLocaleDateString('id-ID') : 'Recent'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status || 'in_progress'}
                        </Badge>
                        <p className="text-sm font-medium mt-1">
                          Rp {(order.quote_amount || 150000).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}