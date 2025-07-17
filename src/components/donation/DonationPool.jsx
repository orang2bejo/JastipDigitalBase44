import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Donation } from "@/api/entities";
import { Driver } from "@/api/entities";
import { 
  Gift, 
  Heart, 
  DollarSign, 
  Users, 
  Trophy, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function DonationPool({ showFullStats = true }) {
  const [totalPool, setTotalPool] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [recentDonations, setRecentDonations] = useState([]);
  const [nextMilestone, setNextMilestone] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const milestones = [100, 250, 500, 1000];

  useEffect(() => {
    loadDonationData();
  }, []);

  const loadDonationData = async () => {
    try {
      const [donations, drivers] = await Promise.all([
        Donation.filter({ is_allocated: false }),
        Driver.list()
      ]);

      // Calculate total unallocated donation pool
      const pool = donations.reduce((total, donation) => total + donation.amount, 0);
      setTotalPool(pool);

      // Count verified active drivers
      const verifiedDrivers = drivers.filter(d => d.is_verified && !d.is_blacklisted);
      setTotalDrivers(verifiedDrivers.length);

      // Get recent donations (last 5)
      const recent = donations
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 5);
      setRecentDonations(recent);

      // Find next milestone
      const next = milestones.find(m => verifiedDrivers.length < m);
      setNextMilestone(next);

    } catch (error) {
      console.error('Error loading donation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMilestoneProgress = () => {
    if (!nextMilestone) return 100;
    return (totalDrivers / nextMilestone) * 100;
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Main Pool Display */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-teal-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Gift className="w-8 h-8" />
            Pool Hadiah Hall of Fame
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-5xl font-bold tracking-tight mb-2">
              {new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(totalPool)}
            </div>
            <p className="text-green-100 text-lg">
              Terkumpul untuk pemenang milestone berikutnya
            </p>
            
            {nextMilestone && (
              <div className="mt-6 bg-white/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-100">Progress menuju {nextMilestone} driver:</span>
                  <span className="font-bold">{totalDrivers}/{nextMilestone}</span>
                </div>
                <Progress 
                  value={getMilestoneProgress()} 
                  className="h-3 bg-white/20"
                />
                <p className="text-xs text-green-100 mt-2">
                  {nextMilestone - totalDrivers} driver lagi untuk mencapai milestone!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showFullStats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{totalDrivers}</div>
                <p className="text-sm text-gray-600">Driver Terverifikasi</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{recentDonations.length}</div>
                <p className="text-sm text-gray-600">Donasi Aktif</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {nextMilestone ? `${Math.round(getMilestoneProgress())}%` : '🎯'}
                </div>
                <p className="text-sm text-gray-600">
                  {nextMilestone ? 'Menuju Milestone' : 'Target Tercapai'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Donations */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Donasi Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentDonations.length > 0 ? (
                <div className="space-y-4">
                  {recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {donation.donor_name || 'Donatur Anonim'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {donation.message ? `"${donation.message.substring(0, 50)}..."` : 'Semangat untuk para driver!'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(donation.created_date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 font-semibold">
                        +Rp {donation.amount.toLocaleString('id-ID')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada donasi. Jadilah yang pertama!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <TrendingUp className="w-5 h-5" />
                Cara Kerja Donasi Hall of Fame
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
                <div>
                  <h4 className="font-semibold mb-2">💰 Sumber Donasi:</h4>
                  <ul className="space-y-1">
                    <li>• Refund dari pelanggan yang barang lebih murah</li>
                    <li>• Donasi sukarela dari komunitas</li>
                    <li>• Kontribusi perusahaan</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🏆 Sistem Pemenang:</h4>
                  <ul className="space-y-1">
                    <li>• Milestone: 100, 250, 500, 1000 driver</li>
                    <li>• 1 driver terbaik global menang semua</li>
                    <li>• Berdasarkan rating dan review pelanggan</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}