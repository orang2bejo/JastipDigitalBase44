
import React, { useState, useEffect } from "react";
import { Order } from "@/api/entities";
import { Driver } from "@/api/entities";
import { User } from "@/api/entities";
import {
  Power,
  PowerOff,
  MapPin,
  Phone,
  CheckCircle,
  Clock,
  Star,
  Wallet,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Added Alert and AlertDescription
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const [driverProfile, setDriverProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      let drivers = await Driver.filter({ created_by: user.email });

      if (drivers.length === 0) {
        navigate(createPageUrl("DriverRegistration"));
        return;
      }

      const driver = drivers[0];

      // Check blacklist
      if (driver.is_blacklisted) {
        setDriverProfile(driver);
        setIsLoading(false);
        return;
      }

      // Check verification status - no deposit check needed
      if (driver.verification_status !== 'approved') {
        navigate(createPageUrl("DriverVerificationPending"));
        return;
      }

      setDriverProfile(driver);
      setIsOnline(driver.status === "available");

      // Load available orders in driver's zones
      const availableOrders = await Order.filter({
        status: "pending"
      }, "-created_date", 20);

      setOrders(availableOrders);

    } catch (error) {
      console.error("Error loading driver data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!driverProfile) return;

    const newStatus = isOnline ? "offline" : "available";
    await Driver.update(driverProfile.id, { status: newStatus });
    setIsOnline(!isOnline);
    setDriverProfile(prev => ({ ...prev, status: newStatus }));
  };

  const acceptOrder = async (orderId) => {
    if (!driverProfile) return;

    await Order.update(orderId, {
      status: "accepted",
      driver_id: driverProfile.id,
      driver_phone: driverProfile.phone_number
    });
    loadData();
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

  if (driverProfile?.is_blacklisted) {
    return (
      <div className="p-8 text-center">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Akun Dibekukan</h1>
            <p className="text-red-700 mb-4">
              Akun Anda telah dibekukan karena: {driverProfile.blacklist_reason || 'pelanggaran kebijakan'}
            </p>
            <p className="text-red-600 text-sm">
              Silakan hubungi admin untuk informasi lebih lanjut.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Driver Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel Driver 🚗
          </h1>
          <p className="text-gray-600">
            Kelola pesanan dan status ketersediaan kamu
          </p>
        </div>

        <Card className="lg:w-80 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="font-semibold">
                  {isOnline ? 'Online' : 'Offline'}
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
          <strong>🎉 Selamat!</strong> Anda telah berhasil terverifikasi dan bisa mulai menerima pesanan.
          Sistem pembayaran otomatis akan langsung transfer earning ke wallet Anda.
        </AlertDescription>
      </Alert>

      {/* Driver Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Saldo Wallet</p>
                <p className="text-2xl font-bold">Rp {(driverProfile?.wallet_balance || 0).toLocaleString('id-ID')}</p>
              </div>
              <Wallet className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Order</p>
                <p className="text-2xl font-bold">{driverProfile?.total_orders || 0}</p>
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
                <p className="text-2xl font-bold">{driverProfile?.rating || 5.0}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-200 fill-yellow-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Driver */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Kelola Wallet</h3>
                <p className="text-sm text-gray-500">Lihat saldo dan tarik earnings Anda</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to={createPageUrl("DriverWallet")} className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Buka Wallet
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Zona Operasional</h3>
                <p className="text-sm text-gray-500">Kelola area layanan Anda</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link to={createPageUrl("ZoneManagement")} className="flex-1">
                <Button variant="outline" className="w-full">Kelola Zona</Button>
              </Link>
              <Link to={createPageUrl("SuggestZone")} className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Sarankan Zona
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Orders */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pesanan Tersedia</h2>
          <Badge variant="secondary" className="px-3 py-1">
            {orders.length} pesanan
          </Badge>
        </div>

        {!isOnline && (
          <Card className="border-amber-200 bg-amber-50 mb-6">
            <CardContent className="p-6 text-center">
              <PowerOff className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Kamu Sedang Offline
              </h3>
              <p className="text-amber-700 mb-4">
                Aktifkan status online untuk melihat dan menerima pesanan baru
              </p>
              <Button
                onClick={toggleOnlineStatus}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Power className="w-4 h-4 mr-2" />
                Aktifkan Status Online
              </Button>
            </CardContent>
          </Card>
        )}

        {isOnline && orders.length === 0 && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Belum Ada Pesanan Baru
              </h3>
              <p className="text-gray-500">
                Pesanan baru akan muncul di sini. Pastikan kamu tetap online!
              </p>
            </CardContent>
          </Card>
        )}

        {isOnline && orders.length > 0 && (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Clock className="w-4 h-4 mr-1" />
                      Pesanan Baru
                    </Badge>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_date).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {order.item_description}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">
                        <strong>Beli di:</strong> {order.store_location || "Lokasi fleksibel (driver yang cari)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-sm">
                        <strong>Antar ke:</strong> {order.delivery_address}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">
                        <strong>Kontak:</strong> {order.customer_phone}
                      </span>
                    </div>
                  </div>

                  {order.customer_notes && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-blue-900 mb-2">Catatan Titiper:</h4>
                      <p className="text-blue-800 text-sm">{order.customer_notes}</p>
                    </div>
                  )}

                  {order.item_image_url && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Foto Referensi:</h4>
                      <img
                        src={order.item_image_url}
                        alt="Referensi barang"
                        className="w-full max-w-md h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Budget Maksimum</p>
                      <p className="text-2xl font-bold text-green-600">
                        Rp {order.max_budget?.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-500">+ ongkir + biaya layanan</p>
                    </div>
                    <Button
                      onClick={() => acceptOrder(order.id)}
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Terima Pesanan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
