

import React, { useEffect } from "react"; // Added useEffect
import { useLocation, Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Driver } from "@/api/entities";
import { MitraSpecialist } from "@/api/entities";
import { Order } from "@/api/entities";
import { Chat } from "@/api/entities";
import { Notification } from "@/api/entities"; 
import {
  Home,
  ShoppingCart,
  TruckIcon,
  MessageSquare,
  Bell,
  Menu,
  X,
  Star,
  MapPin,
  Users,
  Settings,
  HelpCircle,
  Award,
  Briefcase,
  Wallet,
  User as UserIcon,
  LogOut,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import FeedbackForm from "@/components/support/FeedbackForm";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [unreadChats, setUnreadChats] = React.useState(0);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isDriver, setIsDriver] = React.useState(false);
  const [isMitra, setIsMitra] = React.useState(false);
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  // Effect for PWA manifest and meta tags
  useEffect(() => {
    const addManifestMeta = () => {
      // Remove existing manifest if any
      const existingManifest = document.querySelector('link[rel="manifest"]');
      if (existingManifest) {
        existingManifest.remove();
      }

      // Create manifest JSON
      const manifest = {
        name: "JastipDigital - Jasa Titip Beli Digital",
        short_name: "JastipDigital",
        description: "Platform jasa titip beli digital pertama di Indonesia - Titipkan, kami antar!",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2563eb",
        orientation: "portrait-primary",
        categories: ["shopping", "business", "lifestyle"],
        lang: "id",
        dir: "ltr",
        icons: [
          {
            src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f58518512_jastip.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f58518512_jastip.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        shortcuts: [
          {
            name: "Buat Pesanan",
            short_name: "Pesan",
            description: "Buat pesanan jastip baru",
            url: "/CreateOrder",
            icons: [
              {
                src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f58518512_jastip.png",
                sizes: "96x96",
                type: "image/png"
              }
            ]
          }
        ],
        prefer_related_applications: false,
        launch_handler: {
          client_mode: "navigate-existing"
        }
      };

      // Create blob URL for manifest
      const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(manifestBlob);

      // Add manifest link
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = manifestUrl;
      document.head.appendChild(manifestLink);

      // Add meta tags for PWA
      const metaTags = [
        { name: 'theme-color', content: '#2563eb' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'JastipDigital' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'application-name', content: 'JastipDigital' }
      ];

      metaTags.forEach(tag => {
        const existingTag = document.querySelector(`meta[name="${tag.name}"]`);
        if (existingTag) {
          existingTag.setAttribute('content', tag.content);
        } else {
          const metaTag = document.createElement('meta');
          metaTag.name = tag.name;
          metaTag.content = tag.content;
          document.head.appendChild(metaTag);
        }
      });

      // Add apple touch icon
      const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (!existingAppleIcon) {
        const appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        appleIcon.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f58518512_jastip.png';
        document.head.appendChild(appleIcon);
      }
    };

    addManifestMeta();
  }, []); // Empty dependency array means this effect runs once on mount

  // Effect for initial data loading
  React.useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Try to get current user with better error handling
      let user = null;
      try {
        user = await User.me();
        setCurrentUser(user);
        console.log('✅ User loaded successfully:', user);
      } catch (userError) {
        console.log('ℹ️ User not authenticated or unavailable');
        setCurrentUser(null);
        setIsLoading(false);
        return; // Exit early if no user
      }

      // Load user roles with individual error handling
      try {
        const [driverData, mitraData] = await Promise.allSettled([
          Driver.filter({ created_by: user.email }).catch(() => []),
          MitraSpecialist.filter({ created_by: user.email }).catch(() => [])
        ]);
        
        setIsDriver(driverData.status === 'fulfilled' && driverData.value.length > 0);
        setIsMitra(mitraData.status === 'fulfilled' && mitraData.value.length > 0);
        
        console.log('✅ Roles loaded - Driver:', driverData.status === 'fulfilled' && driverData.value.length > 0, 'Mitra:', mitraData.status === 'fulfilled' && mitraData.value.length > 0);
      } catch (roleError) {
        console.warn('⚠️ Error loading user roles:', roleError);
        setIsDriver(false);
        setIsMitra(false);
      }
      
      // Load unread chats with error handling
      try {
        const userOrders = await Order.filter({ created_by: user.email }).catch(() => []);
        let totalUnreadChats = 0;
        
        for (const order of userOrders) {
          if (order.status !== 'pending' && order.status !== 'completed' && order.status !== 'cancelled') {
            try {
              const messages = await Chat.filter({ order_id: order.id, is_read: false }).catch(() => []);
              const unreadForThisOrder = messages.filter(msg => msg.sender_id !== user.id).length;
              totalUnreadChats += unreadForThisOrder;
            } catch (chatError) {
              console.warn('⚠️ Error loading chats for order:', order.id);
            }
          }
        }
        setUnreadChats(totalUnreadChats);
        console.log('✅ Unread chats loaded:', totalUnreadChats);
      } catch (chatError) {
        console.warn('⚠️ Error loading chats:', chatError);
        setUnreadChats(0);
      }
      
      // Load unread notifications with error handling
      try {
        const notifications = await Notification.filter({ user_id: user.id, is_read: false }).catch(() => []);
        setUnreadNotifications(notifications.length);
        console.log('✅ Notifications loaded:', notifications.length);
      } catch (notificationError) {
        console.warn('⚠️ Error loading notifications:', notificationError);
        setUnreadNotifications(0);
      }

    } catch (error) {
      console.error("❌ Error loading layout data:", error);
      // Set safe defaults on error
      setCurrentUser(null);
      setUnreadChats(0);
      setIsDriver(false);
      setIsMitra(false);
      setUnreadNotifications(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = "/"; // Force full reload to clear state
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };
  
  const handleLogin = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const allNavigationItems = [
    { name: "Beranda", href: createPageUrl("Dashboard"), icon: Home, current: currentPageName === "Dashboard" },
    { name: "Buat Pesanan", href: createPageUrl("CreateOrder"), icon: ShoppingCart, current: currentPageName === "CreateOrder" },
    { name: "Cek Area", href: createPageUrl("CoverageChecker"), icon: MapPin, current: currentPageName === "CoverageChecker" },
    { name: "Layanan Spesialis", href: createPageUrl("SpecialistService"), icon: Briefcase, current: currentPageName === "SpecialistService" },
    
    { name: "Driver Panel", href: createPageUrl("DriverDashboard"), icon: TruckIcon, current: currentPageName === "DriverDashboard", 
      driverOnly: true 
    },
    
    { name: "Mitra Panel", href: createPageUrl("MitraDashboard"), icon: Users, current: currentPageName === "MitraDashboard", 
      mitraOnly: true
    },
    
    { name: "Chat", href: createPageUrl("ChatList"), icon: MessageSquare, current: currentPageName === "ChatList" },
    { name: "Review", href: createPageUrl("Reviews"), icon: Star, current: currentPageName === "Reviews" },
    { name: "Wallet", href: createPageUrl("Wallet"), icon: Wallet, current: currentPageName === "Wallet" },
    { name: "Panduan", href: createPageUrl("UserGuide"), icon: HelpCircle, current: currentPageName === "UserGuide" },
    { name: "Hall of Fame", href: createPageUrl("HallOfFame"), icon: Award, current: currentPageName === "HallOfFame" },
    { name: "Admin Panel", href: createPageUrl("AdminPanel"), icon: Settings, current: currentPageName === "AdminPanel", adminOnly: true },
  ];

  const navigationItems = allNavigationItems.filter(item => {
    if (item.adminOnly) return currentUser?.role === 'admin';
    if (item.driverOnly) return isDriver;
    if (item.mitraOnly) return isMitra;
    return true;
  });

  const UserProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          <span className="hidden md:inline">{currentUser?.full_name || currentUser?.email}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to={createPageUrl("UserProfile")}>
          <DropdownMenuItem>Profil</DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={() => setShowFeedback(true)}>Beri Feedback</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Show loading state for critical layout components
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style jsx>{`
        .glass-nav {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .nav-item-active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%);
          border-left: 4px solid #3B82F6;
        }
        .nav-item:hover {
          background: rgba(59, 130, 246, 0.05);
          transform: translateX(4px);
          transition: all 0.2s ease;
        }
      `}</style>

      {/* Check if this is home page - show without sidebar */}
      {currentPageName === "Home" ? (
        children
      ) : (
        <>
          {/* Mobile Header */}
          <div className="lg:hidden">
            <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-4 py-3 sticky top-0 z-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f58518512_jastip.png" 
                    alt="JastipDigital Logo" 
                    className="h-8 w-auto"
                    width={32}
                    height={32}
                  />
                </div>

                <div className="flex items-center gap-2">
                   {currentUser ? (
                     <>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {unreadNotifications > 0 && (
                               <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                 <span className="text-xs text-white font-medium">{unreadNotifications}</span>
                               </div>
                            )}
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-80">
                          <NotificationCenter />
                        </SheetContent>
                      </Sheet>
                      <UserProfileDropdown />
                     </>
                   ) : (
                      <Button onClick={handleLogin}>Masuk / Daftar</Button>
                   )}
                </div>
              </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                <div className="fixed top-0 left-0 bottom-0 w-80 bg-white/90 backdrop-blur-xl border-r border-white/20">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f58518512_jastip.png" 
                        alt="JastipDigital Logo" 
                        className="h-10 w-auto"
                        width={40}
                        height={40}
                      />
                      <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-6 w-6" />
                      </Button>
                    </div>

                    <nav className="space-y-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            item.current 
                              ? 'nav-item-active text-blue-700 font-semibold' 
                              : 'nav-item text-gray-700 hover:bg-blue-50'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.name}</span>
                          {item.name === "Chat" && unreadChats > 0 && (
                            <Badge className="ml-auto bg-red-500 text-white">{unreadChats}</Badge>
                          )}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex">
            {/* Desktop Sidebar */}        
            <div className="hidden lg:block">
              <aside className="w-80 h-screen bg-white/40 backdrop-blur-xl border-r border-white/20 sticky top-0 overflow-y-auto">
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-12">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f58518512_jastip.png" 
                      alt="JastipDigital Logo" 
                      className="h-12 w-auto"
                      width={48}
                      height={48}
                    />
                  </div>

                  {/* Navigation */}
                  <nav className="space-y-2 mb-8">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                          item.current 
                            ? 'nav-item-active text-blue-700 font-semibold shadow-lg' 
                            : 'nav-item text-gray-700 hover:bg-blue-50'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1">{item.name}</span>
                        {item.name === "Chat" && unreadChats > 0 && (
                          <Badge className="bg-red-500 text-white group-hover:scale-110 transition-transform">{unreadChats}</Badge>
                        )}
                      </Link>
                    ))}
                  </nav>

                  {/* User Profile Card */}
                  {currentUser ? (
                    <div className="mt-16 p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-200/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 truncate">{currentUser.full_name}</p>
                          <p className="text-sm text-gray-600 truncate">{currentUser.email}</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full mt-2 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                     <Button onClick={handleLogin} className="w-full">Masuk / Daftar</Button>
                  )}
                </div>
              </aside>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>

          {/* Feedback Form Modal */}
          {showFeedback && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-md">
                <FeedbackForm
                  onSubmit={() => setShowFeedback(false)}
                  onClose={() => setShowFeedback(false)}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

