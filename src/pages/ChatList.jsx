import React, { useState, useEffect } from "react";
import { Order } from "@/api/entities";
import { Chat } from "@/api/entities";
import { User } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
  Search,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  pending: { label: "Menunggu Driver", color: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Driver Menuju Toko", color: "bg-blue-100 text-blue-800" },
  shopping: { label: "Sedang Berbelanja", color: "bg-purple-100 text-purple-800" },
  delivering: { label: "Dalam Perjalanan", color: "bg-indigo-100 text-indigo-800" },
  completed: { label: "Selesai", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800" }
};

export default function ChatList() {
  const [orders, setOrders] = useState([]);
  const [chatSummaries, setChatSummaries] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadOrdersWithChats();
  }, []);

  const loadOrdersWithChats = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Get user's orders (both as customer and driver)
      const customerOrders = await Order.filter({ created_by: user.email });
      const driverOrders = await Order.filter({ driver_id: user.id });
      
      // Combine and remove duplicates
      const allOrders = [...customerOrders, ...driverOrders]
        .filter((order, index, self) => self.findIndex(o => o.id === order.id) === index)
        .filter(order => !['pending', 'completed', 'cancelled'].includes(order.status))
        .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));

      setOrders(allOrders);

      // Load chat summaries for each order
      const summaries = {};
      for (const order of allOrders) {
        const messages = await Chat.filter({ order_id: order.id }, "-created_date", 1);
        const unreadCount = await Chat.filter({ 
          order_id: order.id, 
          is_read: false,
          sender_id: { $ne: user.id } // Not sent by current user
        });
        
        summaries[order.id] = {
          lastMessage: messages[0] || null,
          unreadCount: unreadCount.length
        };
      }
      
      setChatSummaries(summaries);
    } catch (error) {
      console.error("Error loading orders with chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.item_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chat JastipDigital 💬
          </h1>
          <p className="text-gray-600">
            Komunikasi dengan driver dan titiper Anda
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Cari pesanan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      {filteredOrders.length === 0 && !searchTerm ? (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Belum Ada Chat Aktif
            </h3>
            <p className="text-gray-500 mb-6">
              Chat akan muncul di sini ketika Anda memiliki pesanan yang sedang berlangsung
            </p>
            <Link to={createPageUrl("CreateOrder")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Package className="w-4 h-4 mr-2" />
                Buat Pesanan Baru
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const chatSummary = chatSummaries[order.id] || {};
            const isCustomer = currentUser && order.created_by === currentUser.email;
            
            return (
              <Link key={order.id} to={createPageUrl(`Chat?order=${order.id}`)}>
                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {order.item_description}
                          </h3>
                          <Badge className={statusConfig[order.status]?.color}>
                            {statusConfig[order.status]?.label}
                          </Badge>
                          {chatSummary.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white">
                              {chatSummary.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          📍 {order.delivery_address}
                        </p>
                        
                        {chatSummary.lastMessage ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">
                              {chatSummary.lastMessage.sender_type === 'customer' ? '👤' : '🚗'}
                            </span>
                            <span className="text-gray-700 truncate flex-1">
                              {chatSummary.lastMessage.message_type === 'image' 
                                ? '📷 Mengirim foto' 
                                : chatSummary.lastMessage.message
                              }
                            </span>
                            <span className="text-gray-400 text-xs">
                              {formatLastMessageTime(chatSummary.lastMessage.created_date)}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            Belum ada pesan
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {isCustomer ? 'Anda sebagai' : 'Anda sebagai'}
                          </p>
                          <p className="font-semibold text-blue-600">
                            {isCustomer ? 'Titiper' : 'Driver'}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {filteredOrders.length === 0 && searchTerm && (
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Tidak ada chat yang cocok dengan pencarian "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}