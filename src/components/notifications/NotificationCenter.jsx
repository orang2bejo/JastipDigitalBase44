import React, { useState, useEffect } from 'react';
import { Notification } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Star,
  DollarSign,
  Package,
  MessageSquare,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const userNotifications = await Notification.filter(
        { user_id: user.id }, 
        '-created_date', 
        50
      );
      
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { is_read: true });
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      for (const notif of unreadNotifications) {
        await Notification.update(notif.id, { is_read: true });
      }
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await Notification.delete(notificationId);
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type, priority) => {
    const baseClasses = "w-5 h-5";
    
    switch (type) {
      case 'order_status':
        return <Package className={`${baseClasses} text-blue-500`} />;
      case 'price_confirmation':
        return <DollarSign className={`${baseClasses} text-green-500`} />;
      case 'payment':
        return <DollarSign className={`${baseClasses} text-purple-500`} />;
      case 'support':
        return <MessageSquare className={`${baseClasses} text-orange-500`} />;
      case 'general':
        if (priority === 'high' || priority === 'urgent') {
          return <Star className={`${baseClasses} text-yellow-500`} />;
        }
        return <Info className={`${baseClasses} text-gray-500`} />;
      default:
        return <Bell className={`${baseClasses} text-gray-500`} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Baru saja' : `${diffInMinutes} menit lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} jam lalu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} hari lalu`;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat notifikasi...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifikasi
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Tandai Semua Dibaca
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="text-center py-12 px-6">
              <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Belum Ada Notifikasi
              </h3>
              <p className="text-gray-500">
                Notifikasi akan muncul di sini saat ada update pesanan atau aktivitas penting.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className={`text-sm font-semibold ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            !notification.is_read ? 'text-gray-800' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.created_date)}
                            </span>
                            
                            {notification.priority !== 'normal' && (
                              <Badge 
                                size="sm" 
                                className={getPriorityColor(notification.priority)}
                              >
                                {notification.priority === 'urgent' ? 'Urgent' : 
                                 notification.priority === 'high' ? 'Penting' : 'Normal'}
                              </Badge>
                            )}
                            
                            {!notification.is_read && (
                              <Badge size="sm" className="bg-blue-500 text-white">
                                Baru
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {notification.action_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                markAsRead(notification.id);
                                if (notification.action_url.startsWith('http')) {
                                  window.open(notification.action_url, '_blank');
                                } else {
                                  window.location.href = notification.action_url;
                                }
                              }}
                              className="text-blue-600 hover:text-blue-700 h-8 px-2"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {notification.action_label || 'Lihat'}
                            </Button>
                          )}
                          
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 px-2"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-500 hover:text-red-700 h-8 px-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}