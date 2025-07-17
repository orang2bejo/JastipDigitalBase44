
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { Driver } from "@/api/entities";
import { Review } from "@/api/entities"; // <-- Import Review Entity
import { SupportTicket } from "@/api/entities";
import { DriverWallet } from "@/api/entities";
import { WithdrawalRequest } from "@/api/entities";
import PricingRuleManager from "../components/admin/PricingRuleManager"; // <-- Added for pricing rules
import {
  Users,
  ShoppingCart,
  DollarSign,
  TruckIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Ban,
  UserCheck,
  UserX,
  CreditCard,
  Send, // <-- Import Send icon
  MoreVertical // <-- Import MoreVertical icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"; // <-- Import Input
import { Textarea } from "@/components/ui/textarea"; // <-- Import Textarea
import { Label } from "@/components/ui/label"; // <-- Import Label for forms
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // <-- Import Dropdown

export default function AdminPanel() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]); // <-- Tambahkan state untuk menyimpan data user
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalDrivers: 0,
    totalRevenue: 0,
    pendingTickets: 0,
    pendingWithdrawals: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priceInputs, setPriceInputs] = useState({}); // State for price confirmation
  const [reviewingOrder, setReviewingOrder] = useState(null); // State for review modal
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' }); // State for review data

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await User.me();

      if (user.role !== 'admin') {
        // Redirect non-admin users
        window.location.href = '/';
        return;
      }

      setCurrentUser(user);
      loadAdminData();
    } catch (error) {
      console.error("Admin access check failed:", error);
      window.location.href = '/';
    }
  };

  const loadAdminData = async () => {
    try {
      // Load statistics
      const [usersData, orders, drivers, tickets, withdrawals] = await Promise.all([
        User.list(),
        Order.list('-created_date', 20), // Reduced for performance
        Driver.list(),
        SupportTicket.filter({ status: 'open' }),
        WithdrawalRequest.filter({ status: 'pending' })
      ]);

      const completedOrders = orders.filter(order => order.status === 'completed');
      const totalRevenue = completedOrders.reduce((sum, order) => {
        return sum + (order.service_fee || 0);
      }, 0);

      setUsers(usersData); // <-- Simpan data user ke state

      setStats({
        totalUsers: usersData.length, // <-- Gunakan panjang data user dari sini
        totalOrders: orders.length,
        totalDrivers: drivers.length,
        totalRevenue,
        pendingTickets: tickets.length,
        pendingWithdrawals: withdrawals.length
      });

      setRecentOrders(orders.slice(0, 20)); // Ensure we display up to 20 orders
      setPendingDrivers(drivers.filter(driver => driver.verification_status === 'pending'));
      setSupportTickets(tickets.slice(0, 10));
      setWithdrawalRequests(withdrawals.slice(0, 10));

    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDriverVerification = async (driverId, action) => {
    try {
      const newStatus = action === 'approve' ? 'verified' : 'rejected';
      await Driver.update(driverId, { verification_status: newStatus });
      loadAdminData(); // Refresh data
    } catch (error) {
      console.error(`Error ${action}ing driver:`, error);
    }
  };

  const handleWithdrawalAction = async (withdrawalId, action) => {
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await WithdrawalRequest.update(withdrawalId, { status: newStatus });
      loadAdminData(); // Refresh data
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
    }
  };

  // REMOVED: handleOrderAction function as per outline. Status changes are now handled automatically via webhooks for production stability.

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      price_confirmation: "bg-purple-100 text-purple-800",
      waiting_payment: "bg-orange-100 text-orange-800",
      shopping: "bg-indigo-100 text-indigo-800",
      delivering: "bg-pink-100 text-pink-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // --- SUPER ADMIN ACTIONS ---
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await Order.update(orderId, { status: newStatus });
      loadAdminData();
    } catch (error) {
      console.error(`Error updating status for order ${orderId}:`, error);
      alert(`Failed to update status for order ${orderId}: ${error.message}`);
    }
  };
  
  const handlePriceInputChange = (orderId, value) => {
    setPriceInputs(prev => ({ ...prev, [orderId]: value }));
  };

  const handleConfirmPrice = async (orderId) => {
    const price = parseFloat(priceInputs[orderId]);
    if (!price || isNaN(price) || price <= 0) {
      alert("Please enter a valid positive price.");
      return;
    }
    try {
      await Order.update(orderId, {
        actual_price: price,
        status: 'waiting_payment' // Changed from 'price_confirmation' as per typical flow
      });
      loadAdminData();
      setPriceInputs(prev => { // Clear the input after successful update
        const newInputs = { ...prev };
        delete newInputs[orderId];
        return newInputs;
      });
    } catch (error) {
      console.error(`Error confirming price for order ${orderId}:`, error);
      alert(`Failed to confirm price for order ${orderId}: ${error.message}`);
    }
  };

  const handleSimulatePayment = async (orderId) => {
    try {
      await Order.update(orderId, {
        payment_status: 'paid',
        status: 'delivering' // Langsung ke delivering setelah bayar
      });
      loadAdminData();
    } catch (error) {
      console.error(`Error simulating payment for order ${orderId}:`, error);
      alert(`Failed to simulate payment for order ${orderId}: ${error.message}`);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingOrder) return;
    
    // PERBAIKAN: Temukan data customer berdasarkan email `created_by` dari order
    const customer = users.find(u => u.email === reviewingOrder.created_by);

    if (!customer) {
      alert("Gagal mengirim review: Data pelanggan tidak ditemukan.");
      return;
    }

    try {
      await Review.create({
        order_id: reviewingOrder.id,
        driver_id: reviewingOrder.driver_id || 'admin_test_driver', // Fallback driver_id
        customer_id: customer.id, // <-- Gunakan ID customer yang ditemukan
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      setReviewingOrder(null);
      setReviewData({ rating: 5, comment: '' });
      alert("Review submitted successfully!");
      // Optionally, mark order as reviewed if there's a field for it, though not directly in Order entity.
      // For now, just refresh data to ensure consistency.
      loadAdminData(); 
    } catch (error) {
      console.error(`Error submitting review for order ${reviewingOrder.id}:`, error);
      alert(`Failed to submit review: ${error.message}`);
    }
  };


  if (isLoading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard 👑
          </h1>
          <p className="text-gray-600">
            Kelola platform JastipDigital
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Total Pengguna</h3>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Total Pesanan</h3>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Total Driver</h3>
                  <p className="text-3xl font-bold">{stats.totalDrivers}</p>
                </div>
                <TruckIcon className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Total Revenue</h3>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Section */}
        {(stats.pendingTickets > 0 || stats.pendingWithdrawals > 0) && (
          <div className="space-y-4">
            {stats.pendingTickets > 0 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Ada {stats.pendingTickets} tiket support yang menunggu respon
                </AlertDescription>
              </Alert>
            )}

            {stats.pendingWithdrawals > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Ada {stats.pendingWithdrawals} permintaan penarikan yang menunggu approval
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Tabs Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5"> {/* Changed grid-cols-4 to grid-cols-5 */}
            <TabsTrigger value="orders">Pesanan Terbaru</TabsTrigger>
            <TabsTrigger value="drivers">Verifikasi Driver</TabsTrigger>
            <TabsTrigger value="support">Support Tickets</TabsTrigger>
            <TabsTrigger value="withdrawals">Penarikan Dana</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Rules</TabsTrigger> {/* Added new tab trigger */}
          </TabsList>

          {/* Recent Orders */}
          <TabsContent value="orders">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Alur Pesanan (Super Admin View)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {order.item_description}
                        </h4>
                        <p className="text-sm text-gray-600">
                          ID: {order.id.slice(0, 8)} | Budget: {formatCurrency(order.max_budget)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_date).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        
                        {/* --- SUPER ADMIN ACTION BUTTONS --- */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi Super Admin</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {order.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'accepted')}>
                                <TruckIcon className="mr-2 h-4 w-4" />
                                Terima Order (Simulasi Driver)
                              </DropdownMenuItem>
                            )}

                            {order.status === 'accepted' && (
                              <>
                                <div className="p-2">
                                  <Label htmlFor={`price-${order.id}`} className="sr-only">Harga Aktual</Label>
                                  <Input 
                                    id={`price-${order.id}`}
                                    type="number" 
                                    placeholder="Harga Aktual" 
                                    value={priceInputs[order.id] || ''}
                                    onChange={(e) => handlePriceInputChange(order.id, e.target.value)}
                                    className="h-8"
                                  />
                                  <Button size="sm" className="w-full mt-1" onClick={() => handleConfirmPrice(order.id)}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Konfirmasi Harga
                                  </Button>
                                </div>
                                <DropdownMenuSeparator />
                              </>
                            )}

                            {order.status === 'waiting_payment' && (
                              <DropdownMenuItem onClick={() => handleSimulatePayment(order.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Tandai Lunas (Simulasi Bayar)
                              </DropdownMenuItem>
                            )}
                            
                            {order.status === 'delivering' && (
                               <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'completed')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Selesaikan Order
                              </DropdownMenuItem>
                            )}
                            
                            {order.status === 'completed' && (
                               <DropdownMenuItem onClick={() => setReviewingOrder(order)}>
                                <Star className="mr-2 h-4 w-4" />
                                Beri Review
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'cancelled')} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                                <Ban className="mr-2 h-4 w-4" />
                                Batalkan Order
                            </DropdownMenuItem>
                            
                          </DropdownMenuContent>
                        </DropdownMenu>

                      </div>
                    </div>
                  ))}

                  {recentOrders.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Belum ada pesanan
                    </p>
                  )}
                </div>

                {/* --- Review Modal --- */}
                {reviewingOrder && (
                  <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                      <CardHeader>
                        <CardTitle>Beri Review untuk Order #{reviewingOrder.id.slice(0,8)}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="rating">Rating (1-5)</Label>
                            <Input 
                              id="rating"
                              type="number" 
                              min="1" 
                              max="5" 
                              value={reviewData.rating}
                              onChange={(e) => setReviewData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="comment">Komentar</Label>
                            <Textarea 
                              id="comment"
                              placeholder="Bagaimana pengalaman Anda?"
                              value={reviewData.comment}
                              onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button type="button" variant="ghost" onClick={() => setReviewingOrder(null)}>Batal</Button>
                            <Button type="submit">Kirim Review</Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          {/* Driver Verification */}
          <TabsContent value="drivers">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Driver Menunggu Verifikasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDrivers.map((driver) => (
                    <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {driver.full_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {driver.vehicle_type} | {driver.phone}
                        </p>
                        <p className="text-xs text-gray-500">
                          Daftar: {new Date(driver.created_date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleDriverVerification(driver.id, 'approve')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDriverVerification(driver.id, 'reject')}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}

                  {pendingDrivers.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Tidak ada driver yang menunggu verifikasi
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tickets */}
          <TabsContent value="support">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {ticket.subject}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {ticket.description?.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          Dari: {ticket.created_by} | {new Date(ticket.created_date).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {ticket.priority}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {supportTickets.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Tidak ada tiket support terbuka
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawal Requests */}
          <TabsContent value="withdrawals">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Permintaan Penarikan Dana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {withdrawalRequests.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {formatCurrency(withdrawal.amount)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Bank: {withdrawal.bank_details?.bank_name} - {withdrawal.bank_details?.account_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          Driver: {withdrawal.owner_id} | {new Date(withdrawal.created_date).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleWithdrawalAction(withdrawal.id, 'reject')}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}

                  {withdrawalRequests.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Tidak ada permintaan penarikan pending
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Rules Management */}
          <TabsContent value="pricing">
            <PricingRuleManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
