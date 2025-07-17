
import React, { useState, useEffect } from "react";
import { Order } from "@/api/entities";
import { Driver } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  TruckIcon,
  Star,
  ArrowRight,
  Package,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  pending: { label: "Menunggu Driver", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  accepted: { label: "Driver Menuju Toko", color: "bg-blue-100 text-blue-800", icon: TruckIcon },
  shopping: { label: "Sedang Berbelanja", color: "bg-purple-100 text-purple-800", icon: ShoppingCart },
  price_confirmation: { label: "Menunggu Konfirmasi Harga", color: "bg-orange-100 text-orange-800", icon: Clock },
  waiting_payment: { label: "Menunggu Pembayaran", color: "bg-pink-100 text-pink-800", icon: Clock },
  delivering: { label: "Dalam Perjalanan", color: "bg-indigo-100 text-indigo-800", icon: Package },
  completed: { label: "Selesai", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800", icon: Clock }
};

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const allOrders = await Order.list("-created_date", 10);
      setOrders(allOrders);
      setActiveOrders(allOrders.filter(order => 
        ['pending', 'accepted', 'shopping', 'delivering', 'price_confirmation', 'waiting_payment'].includes(order.status)
      ));
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalSpent = () => {
    return orders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => total + (order.actual_price || 0) + (order.delivery_fee || 0) + (order.service_fee || 0), 0);
  };

  const getCompletedOrdersCount = () => {
    return orders.filter(order => order.status === 'completed').length;
  };

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Selamat Datang di JastipDigital! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Platform jasa titip beli digital - Titipkan, kami antar!
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl shadow-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Pesanan</p>
                <p className="text-3xl font-bold mt-1">{getCompletedOrdersCount()}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl shadow-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Belanja</p>
                <p className="text-3xl font-bold mt-1">Rp {getTotalSpent().toLocaleString('id-ID')}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl shadow-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Aktif Sekarang</p>
                <p className="text-3xl font-bold mt-1">{activeOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-green-600 text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold mb-2">Butuh Belanjain Sesuatu?</h3>
              <p className="text-indigo-100 text-lg">
                Dari makanan, obat, hingga barang elektronik - semuanya bisa dititipkan
              </p>
              {/* Alert for payment method */}
              <div className="mt-4 p-3 bg-white/20 rounded-lg">
                <p className="text-sm text-white">
                  💡 <strong>Info:</strong> Gunakan pembayaran cash untuk pengalaman terbaik. Pembayaran digital masih dalam tahap trial.
                </p>
              </div>
            </div>
            <Link to={createPageUrl("CreateOrder")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Pesan Sekarang
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Pesanan Aktif</h2>
            <Badge variant="secondary" className="px-3 py-1">
              {activeOrders.length} pesanan
            </Badge>
          </div>
          <div className="grid gap-4">
            {activeOrders.map((order) => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              return (
                <Card key={order.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${statusConfig[order.status]?.color} border-0 px-3 py-1`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusConfig[order.status]?.label}
                      </Badge>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">
                      {order.item_description}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>📍 {order.store_location || "Lokasi akan dicari driver"}</span>
                      <span className="font-semibold text-green-600">
                        Est. Rp {(order.confirmed_price || order.max_budget)?.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={createPageUrl(`Chat?order=${order.id}`)} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat Driver
                        </Button>
                      </Link>
                      <Link to={createPageUrl(`OrderDetail?order_id=${order.id}`)} className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Lihat Detail
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Riwayat Pesanan</h2>
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
            Lihat Semua
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        {orders.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
            <CardContent className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Belum Ada Pesanan
              </h3>
              <p className="text-gray-500 mb-6">
                Mulai pesan sekarang dan rasakan kemudahan jasa titip digital
              </p>
              <Link to={createPageUrl("CreateOrder")}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Pesanan Pertama
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.slice(0, 5).map((order) => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              return (
                <Link key={order.id} to={createPageUrl(`OrderDetail?order_id=${order.id}`)}>
                  <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-white/60 backdrop-blur-sm cursor-pointer hover:bg-white/80">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`${statusConfig[order.status]?.color} border-0 text-xs px-2 py-1`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[order.status]?.label}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(order.created_date).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            {order.item_description}
                          </h4>
                          <p className="text-sm text-gray-600">
                            📍 {order.store_location || "Lokasi fleksibel"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            Rp {(order.confirmed_price || order.actual_price || order.max_budget)?.toLocaleString('id-ID')}
                          </p>
                          {order.status === 'completed' && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-600">4.8</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
