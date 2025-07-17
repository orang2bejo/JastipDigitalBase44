import React, { useState, useEffect, useCallback } from "react";
import { Chat } from "@/api/entities";
import { Order } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import useWebSocket from "../components/hooks/useWebSocket";
import {
  ArrowLeft,
  Send,
  MapPin,
  Phone,
  Camera,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import PriceConfirmation from "../components/order/PriceConfirmation";
import CancellationPolicy from "../components/order/CancellationPolicy";
import SupportForm from "../components/support/SupportForm";
import SubstitutionRequest from "../components/order/SubstitutionRequest";
import MidtransPayment from "../components/payment/MidtransPayment";

const getOrderIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('order');
};

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setSending] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const orderId = getOrderIdFromUrl();
  const { isConnected, lastMessage, sendMessage: sendWsMessage } = useWebSocket(orderId);

  const loadMessages = useCallback(async () => {
    const orderId = getOrderIdFromUrl();
    if (!orderId) return;

    try {
      const chatMessages = await Chat.filter({ order_id: orderId }, "created_date");
      setMessages(chatMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }, []);

  const refreshOrder = useCallback(async () => {
    const orderId = getOrderIdFromUrl();
    if (orderId) {
      const orders = await Order.filter({ id: orderId });
      if (orders.length > 0) {
        setCurrentOrder(orders[0]);
      }
    }
  }, []);

  // Effect to handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'chat' && lastMessage.payload.order_id === orderId) {
        loadMessages();
      }
      if (lastMessage.type === 'status_update' && lastMessage.payload.order_id === orderId) {
        refreshOrder();
      }
    }
  }, [lastMessage, orderId, loadMessages, refreshOrder]);

  const loadChatData = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (orderId) {
        const orders = await Order.filter({ id: orderId });
        if (orders.length > 0) {
          setCurrentOrder(orders[0]);
        }
        await loadMessages();
      }
    } catch (error) {
      console.error("Error loading chat data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loadMessages, orderId]);

  useEffect(() => {
    loadChatData();
    // Polling interval for messages (since real-time WebSocket is mocked)
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadChatData, loadMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentOrder || !currentUser) return;

    setSending(true);
    try {
      const messagePayload = {
        order_id: currentOrder.id,
        sender_id: currentUser.id,
        sender_type: currentUser.id === currentOrder.created_by ? "customer" : "driver",
        message: newMessage,
        message_type: "text"
      };

      // 1. Persist message to database
      await Chat.create(messagePayload);

      // 2. Emit message via WebSocket for real-time delivery (mocked for now)
      sendWsMessage(messagePayload);

      setNewMessage("");
      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const sendImage = useCallback(async (file) => {
    if (!file || !currentOrder || !currentUser) return;

    setImageUploading(true);
    try {
      const { file_url } = await UploadFile({ file });

      const imageMessagePayload = {
        order_id: currentOrder.id,
        sender_id: currentUser.id,
        sender_type: currentUser.id === currentOrder.created_by ? "customer" : "driver",
        message: "Mengirim foto",
        message_type: "image",
        image_url: file_url
      };

      await Chat.create(imageMessagePayload);
      sendWsMessage(imageMessagePayload);

      await loadMessages();
    } catch (error) {
      console.error("Error sending image:", error);
    } finally {
      setImageUploading(false);
    }
  }, [currentOrder, currentUser, loadMessages, sendWsMessage]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      sendImage(file);
    }
  }, [sendImage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, []);

  const isCustomer = currentUser && currentOrder && currentUser.id === currentOrder.created_by;

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="h-96 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  // Show message if no order ID provided
  if (!orderId) {
    return (
      <div className="p-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Chat JastipDigital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Untuk memulai chat, silakan pilih pesanan dari dashboard Anda.
            </p>
            <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pesanan Tidak Ditemukan</h1>
        <p className="text-gray-600 mb-4">
          Pesanan dengan ID {orderId} tidak ditemukan atau tidak dapat diakses.
        </p>
        <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              Chat dengan {isCustomer ? "Driver" : "Titiper"}
            </h1>
            <p className="text-sm text-gray-600">
              {currentOrder.item_description}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-blue-100 text-blue-800">
              {currentOrder.status}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSupport(true)}
            >
              <AlertCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* WebSocket Connection Status */}
      {isConnected && (
        <div className="bg-green-100 text-green-800 text-xs text-center py-1">
          ✓ Real-time connection active
        </div>
      )}

      {/* Order Summary */}
      <Card className="mx-4 mt-4 border-0 shadow-lg bg-white/90">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>
                <strong>Beli:</strong> {currentOrder.store_location || "Fleksibel"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <span>
                <strong>Antar:</strong> {currentOrder.delivery_address}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold">
                Budget Max: Rp {currentOrder.max_budget?.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Confirmation Component */}
      <div className="mx-4 mt-4">
        <PriceConfirmation
          order={currentOrder}
          onUpdate={refreshOrder}
          userType={isCustomer ? "customer" : "driver"}
        />
      </div>

      {/* Midtrans Payment Component */}
      <div className="mx-4 mt-4">
        <MidtransPayment
          order={currentOrder}
          onPaymentUpdate={refreshOrder}
        />
      </div>

      {/* Cancellation Policy */}
      <div className="mx-4 mt-4">
        <CancellationPolicy
          order={currentOrder}
          userType={isCustomer ? "customer" : "driver"}
          onUpdate={refreshOrder}
        />
      </div>

      {/* Substitution System */}
      <div className="mx-4 mt-4">
        <SubstitutionRequest
          order={currentOrder}
          onUpdate={refreshOrder}
          userType={isCustomer ? "customer" : "driver"}
        />
      </div>

      {/* Support Form */}
      {showSupport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <SupportForm
              orderId={currentOrder.id}
              onSubmit={() => {
                setShowSupport(false);
              }}
              onClose={() => setShowSupport(false)}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">
              Belum ada pesan. Mulai percakapan dengan {isCustomer ? "driver" : "titiper"}!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUser.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 rounded-bl-sm shadow-md'
                  }`}
                >
                  {message.message_type === 'image' && message.image_url ? (
                    <div>
                      <img
                        src={message.image_url}
                        alt="Shared image"
                        className="w-full rounded-lg mb-2"
                      />
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ) : (
                    <p>{message.message}</p>
                  )}
                  <p
                    className={`text-xs mt-2 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.created_date).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {imageUploading && (
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mengirim foto...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 p-4">
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-blue-100"
              disabled={imageUploading}
              asChild
            >
              <div>
                <Camera className="w-5 h-5 text-blue-600" />
              </div>
            </Button>
          </label>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pesan..."
              className="pr-12 bg-white/50 border-white/20"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}