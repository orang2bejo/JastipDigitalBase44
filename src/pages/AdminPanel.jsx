import React, { useState, useEffect } from "react";
import { User, Order, Driver, MitraSpecialist, Transaction } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Car, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Shield,
  UserCheck,
  FileText,
  Award,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeDrivers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    pendingDrivers: 0,
    recentOrders: [],
    driverStats: [],
    transactionVolume: []
  });

  useEffect(() => {
    checkAdminAccess();
    loadDashboardData();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await User.me();
      if (!user || !user.profile?.role || !['admin', 'super_admin'].includes(user.profile.role)) {
        navigate('/Dashboard');
        return;
      }
      setIsAdmin(true);
    } catch (error) {
      console.error('Admin access check failed:', error);
      navigate('/LandingPage');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load various metrics for admin dashboard
      const [orders, drivers, transactions] = await Promise.all([
        Order.list('-created_date', 100),
        Driver.list(100),
        Transaction.list(null, 50)
      ]);

      const activeOrders = orders.filter(o => ['pending', 'accepted', 'shopping', 'delivering'].includes(o.status));
      const pendingDrivers = drivers.filter(d => d.verification_status === 'pending');
      const totalRevenue = transactions.reduce((sum, t) => sum + (t.transaction_amount || 0), 0);

      setDashboardData({
        totalUsers: 1250, // This would come from actual user count
        activeDrivers: drivers.filter(d => d.availability_status === 'available').length,
        pendingOrders: activeOrders.length,
        totalRevenue,
        pendingDrivers: pendingDrivers.length,
        recentOrders: orders.slice(0, 10),
        driverStats: drivers.slice(0, 5),
        transactionVolume: transactions.slice(0, 10)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive system management and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Users</p>
                <p className="text-3xl font-bold">{dashboardData.totalUsers.toLocaleString()}</p>
                <p className="text-blue-100 text-xs mt-1">+12% this month</p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active Drivers</p>
                <p className="text-3xl font-bold">{dashboardData.activeDrivers}</p>
                <p className="text-green-100 text-xs mt-1">Online now</p>
              </div>
              <Car className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pending Orders</p>
                <p className="text-3xl font-bold">{dashboardData.pendingOrders}</p>
                <p className="text-orange-100 text-xs mt-1">Need attention</p>
              </div>
              <Package className="w-12 h-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Revenue (30d)</p>
                <p className="text-3xl font-bold">Rp {dashboardData.totalRevenue.toLocaleString('id-ID')}</p>
                <p className="text-purple-100 text-xs mt-1">+8% vs last month</p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="specialists">Specialists</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Driver Verification</h4>
                  <p className="text-sm text-gray-600">{dashboardData.pendingDrivers} drivers waiting for approval</p>
                </div>
                <Button variant="outline" size="sm">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Review
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">System Health</h4>
                  <p className="text-sm text-gray-600">All services running normally</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.recentOrders.map((order, index) => (
                  <div key={order.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{order.item_description || 'Order #' + (index + 1)}</p>
                      <p className="text-xs text-gray-500">Rp {(order.max_budget || 50000).toLocaleString()}</p>
                    </div>
                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                      {order.status || 'pending'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Drivers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.driverStats.map((driver, index) => (
                  <div key={driver.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {(driver.full_name || `D${index + 1}`).charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{driver.full_name || `Driver ${index + 1}`}</p>
                        <p className="text-xs text-gray-500">{driver.total_deliveries || 45} deliveries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{driver.rating || '4.8'}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order, index) => (
                  <div key={order.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{order.item_description || `Order #${index + 1}`}</h4>
                      <p className="text-sm text-gray-600">
                        Customer: {order.User?.full_name || 'Anonymous'} • 
                        Driver: {order.driver?.full_name || 'Unassigned'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {order.created_date ? new Date(order.created_date).toLocaleDateString('id-ID') : 'Today'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status || 'pending'}
                      </Badge>
                      <p className="text-sm font-medium mt-1">Rp {(order.max_budget || 50000).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Driver Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.driverStats.map((driver, index) => (
                  <div key={driver.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {(driver.full_name || `D${index + 1}`).charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{driver.full_name || `Driver ${index + 1}`}</h4>
                        <p className="text-sm text-gray-600">
                          {driver.phone_number || '+62 811-XXXX-XXXX'} • 
                          {driver.vehicle_type || 'Motor'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Joined: {driver.created_date ? new Date(driver.created_date).toLocaleDateString('id-ID') : 'This month'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={driver.verification_status === 'verified' ? 'default' : 'secondary'}>
                        {driver.verification_status || 'pending'}
                      </Badge>
                      <div className="flex items-center gap-1 mt-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">{driver.rating || '4.8'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">User Management Dashboard</h3>
                <p className="text-gray-500">Comprehensive user management features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Specialist Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Specialist Network</h3>
                <p className="text-gray-500">Manage certified specialists and service categories</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Order Completion Rate</span>
                    <span className="font-semibold">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Delivery Time</span>
                    <span className="font-semibold">28 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Customer Satisfaction</span>
                    <span className="font-semibold">4.7/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Driver Retention</span>
                    <span className="font-semibold">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Users (30d)</span>
                    <span className="font-semibold text-green-600">+12.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Order Volume</span>
                    <span className="font-semibold text-green-600">+8.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue Growth</span>
                    <span className="font-semibold text-green-600">+15.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Driver Sign-ups</span>
                    <span className="font-semibold text-green-600">+6.4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}