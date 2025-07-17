
import React, { useState, useEffect } from "react";
import { Driver } from "@/api/entities";
import { Donation } from "@/api/entities";
import { Review } from "@/api/entities";
import { Transaction } from "@/api/entities"; // New import for Transaction entity
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Star, Award, MapPin, Rocket, Trophy, Gift, Users, DollarSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DonationPool from "../components/donation/DonationPool";

// Removed dummyWinners constant as winners are now loaded dynamically from transactions.

const milestoneGoals = [
  { drivers: 100, title: "Milestone 100 Driver" },
  { drivers: 250, title: "Milestone 250 Driver" },
  { drivers: 500, title: "Milestone 500 Driver" },
  { drivers: 1000, title: "Milestone 1000 Driver" }
];

export default function HallOfFame() {
  const [winners, setWinners] = useState([]);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [donationPool, setDonationPool] = useState(0);
  const [topDrivers, setTopDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [driversPerPage] = useState(5);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allDrivers, allDonations, allReviews] = await Promise.all([
        Driver.list(),
        Donation.filter({ is_allocated: false }),
        Review.list()
      ]);

      const verifiedDrivers = allDrivers.filter(d => d.is_verified && !d.is_blacklisted);
      setTotalDrivers(verifiedDrivers.length);
      
      const currentPool = allDonations.reduce((sum, donation) => sum + donation.amount, 0);
      setDonationPool(currentPool);

      // Calculate top drivers with improved base score
      const driverStats = verifiedDrivers.map(driver => {
        const driverReviews = allReviews.filter(review => review.driver_id === driver.id);
        
        // Improved base score - higher starting point for new drivers
        const baseScore = driver.base_score || 75; // Increased from 50 to 75
        
        if (driverReviews.length === 0) {
          return {
            ...driver,
            avgRating: 5.0, // Default if no reviews, for consistent data structure
            totalReviews: 0,
            avgServiceQuality: 5.0,
            avgPunctuality: 5.0,
            avgCommunication: 5.0,
            avgPoliteness: 5.0,
            avgItemCondition: 5.0,
            recommendationRate: 100,
            score: baseScore // Use base score for new drivers
          };
        }

        const avgRating = driverReviews.reduce((sum, r) => sum + r.rating, 0) / driverReviews.length;
        const avgServiceQuality = driverReviews.reduce((sum, r) => sum + (r.service_quality || r.rating), 0) / driverReviews.length;
        const avgPunctuality = driverReviews.reduce((sum, r) => sum + (r.punctuality || r.rating), 0) / driverReviews.length;
        const avgCommunication = driverReviews.reduce((sum, r) => sum + (r.communication || r.rating), 0) / driverReviews.length;
        const avgPoliteness = driverReviews.reduce((sum, r) => sum + (r.politeness || r.rating), 0) / driverReviews.length;
        const avgItemCondition = driverReviews.reduce((sum, r) => sum + (r.item_condition || r.rating), 0) / driverReviews.length;
        
        const recommendedCount = driverReviews.filter(r => r.would_recommend !== false).length;
        const recommendationRate = (recommendedCount / driverReviews.length) * 100;

        // Enhanced scoring algorithm with better balance
        const reviewBasedScore = (
          avgRating * 0.25 + 
          avgServiceQuality * 0.20 + 
          avgPunctuality * 0.15 + 
          avgCommunication * 0.15 + 
          avgPoliteness * 0.10 + 
          avgItemCondition * 0.15
        ) * 20; // Scale to 100 (since ratings are 1-5, max sum is 5, multiply by 20 to get 100)

        // More generous review count multiplier
        const reviewCountMultiplier = Math.min(1 + (driverReviews.length / 20), 1.8); // Max 1.8x bonus for 20+ reviews
        
        // Recommendation rate bonus
        const recommendationMultiplier = Math.max(recommendationRate / 100, 0.5); // Min 0.5 to avoid penalizing too much for lower recommendation rates
        
        // Total orders bonus - more generous
        const orderCountBonus = Math.min((driver.total_orders || 0) / 50, 1.0) * 15; // Max 15 bonus points for 50+ orders

        // Better balance between base score and performance
        const finalScore = (baseScore * 0.4) + (reviewBasedScore * reviewCountMultiplier * recommendationMultiplier * 0.6) + orderCountBonus;

        return {
          ...driver,
          avgRating: Math.round(avgRating * 10) / 10,
          totalReviews: driverReviews.length,
          avgServiceQuality: Math.round(avgServiceQuality * 10) / 10,
          avgPunctuality: Math.round(avgPunctuality * 10) / 10,
          avgCommunication: Math.round(avgCommunication * 10) / 10,
          avgPoliteness: Math.round(avgPoliteness * 10) / 10, // Corrected from 'politeness' to 'avgPoliteness'
          avgItemCondition: Math.round(avgItemCondition * 10) / 10,
          recommendationRate: Math.round(recommendationRate),
          score: Math.round(finalScore * 100) / 100
        };
      });

      // Sort by score (now includes new drivers with base scores) and take top 50 for pagination
      const sortedDrivers = driverStats
        .sort((a, b) => b.score - a.score)
        .slice(0, 50); // Show top 50 for pagination

      setTopDrivers(sortedDrivers);

      // Load past winners from hall of fame transactions
      const hallOfFameTransactions = await Transaction.filter({ 
        transaction_type: 'hall_of_fame_award' 
      }, '-created_date', 10); // Limit to last 10 winners by creation date descending
      
      const winnersData = [];
      for (const transaction of hallOfFameTransactions) {
        if (transaction.driver_id) {
          try {
            const driver = await Driver.get(transaction.driver_id);
            if (driver) {
              winnersData.push({
                ...driver, // Includes id, full_name, city_regency, avatar from Driver entity
                hall_of_fame_earnings: transaction.amount,
                won_at: transaction.processed_at, // When the award was processed
                milestone: transaction.admin_notes?.match(/Milestone (\d+)/)?.[1] || 'Unknown' // Extract milestone from admin_notes
              });
            }
          } catch (error) {
            console.warn('Could not load driver for transaction:', transaction.id);
          }
        }
      }

      setWinners(winnersData);
    } catch (error) {
      console.error("Error loading Hall of Fame data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastDriver = currentPage * driversPerPage;
  const indexOfFirstDriver = indexOfLastDriver - driversPerPage;
  const currentDrivers = topDrivers.slice(indexOfFirstDriver, indexOfLastDriver);
  const totalPages = Math.ceil(topDrivers.length / driversPerPage);

  const nextMilestone = milestoneGoals.find(m => totalDrivers < m.drivers);
  const progressToNext = nextMilestone ? (totalDrivers / nextMilestone.drivers) * 100 : 100;

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Crown className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3">
            Hall of Fame Driver
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sistem apresiasi berbasis milestone untuk driver terbaik global. Hadiah didukung oleh donasi komunitas.
          </p>
        </div>
        
        {/* Donation Pool Component */}
        <DonationPool showFullStats={true} />

        {/* Current Top Drivers Leaderboard */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🏆 Top Drivers Saat Ini
            </h2>
            <p className="text-gray-600">
              Driver terbaik berdasarkan algoritma penilaian komprehensif
            </p>
            <div className="text-sm text-gray-500 mt-2">
              Penilaian berdasarkan: Base Score 🎯 | Rating ⭐ | Review Count 📊 | Recommendation Rate 👍 | Total Orders 📦
            </div>
          </div>

          {topDrivers.length > 0 ? (
            <>
              <div className="grid gap-4">
                {currentDrivers.map((driver, index) => {
                  const actualIndex = indexOfFirstDriver + index;
                  return (
                    <Card key={driver.id} className={`border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                      actualIndex === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 ring-2 ring-yellow-400' :
                      actualIndex === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 ring-2 ring-gray-400' :
                      actualIndex === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 ring-2 ring-orange-400' :
                      'bg-white'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                              actualIndex === 0 ? 'bg-yellow-500 text-white' :
                              actualIndex === 1 ? 'bg-gray-500 text-white' :
                              actualIndex === 2 ? 'bg-orange-500 text-white' :
                              'bg-blue-500 text-white'
                            }`}>
                              {actualIndex === 0 ? '🥇' : actualIndex === 1 ? '🥈' : actualIndex === 2 ? '🥉' : actualIndex + 1}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{driver.full_name}</h3>
                              <p className="text-gray-600">{driver.city_regency}</p>
                              <div className="flex items-center gap-4 mt-2 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  <span className="font-semibold">{driver.avgRating}</span>
                                  <span className="text-sm text-gray-500">({driver.totalReviews} reviews)</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                  {driver.recommendationRate}% recommend
                                </Badge>
                                <Badge variant="outline">
                                  {driver.total_orders || 0} orders
                                </Badge>
                                {driver.totalReviews === 0 && (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    Driver Baru
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600 mb-1">
                              {driver.score}
                            </div>
                            <p className="text-xs text-gray-500">Overall Score</p>
                            
                            {driver.totalReviews > 0 && ( // Only show detailed ratings if there are reviews
                              <div className="grid grid-cols-3 gap-1 mt-3 text-xs">
                                <div className="text-center p-1 bg-white/50 rounded">
                                  <p className="font-medium">{driver.avgServiceQuality}</p>
                                  <p className="text-gray-600">Service</p>
                                </div>
                                <div className="text-center p-1 bg-white/50 rounded">
                                  <p className="font-medium">{driver.avgPunctuality}</p>
                                  <p className="text-gray-600">Punctual</p>
                                </div>
                                <div className="text-center p-1 bg-white/50 rounded">
                                  <p className="font-medium">{driver.avgCommunication}</p>
                                  <p className="text-gray-600">Comm</p>
                                </div>
                              </div>
                            )}

                            {/* Potential earning if they win */}
                            {actualIndex < 3 && donationPool > 0 && (
                              <div className="mt-2 p-2 bg-green-100 rounded text-xs">
                                <p className="text-green-800 font-semibold">
                                  🎯 Potensi Hadiah: Rp {donationPool.toLocaleString('id-ID')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className="w-10 h-10"
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
              <CardContent className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Belum Ada Driver yang Memenuhi Kriteria
                </h3>
                <p className="text-gray-500">
                  Pastikan driver terdaftar dan terverifikasi untuk masuk ke Hall of Fame
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Past Winners */}
        {winners.length > 0 && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🏆 Pemenang Milestone Sebelumnya
              </h2>
              <p className="text-gray-600">
                Para driver luar biasa yang telah memenangkan Hall of Fame
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {winners.map((winner, index) => (
                <Card key={winner.id} className={`border-0 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 bg-gradient-to-br from-yellow-300 to-amber-400`}>
                  <CardHeader className="bg-black/10 p-4 flex justify-between items-center">
                    <Badge variant="destructive">
                      🏆 Pemenang Milestone {winner.milestone}
                    </Badge>
                    {winner.won_at && (
                      <span className="text-sm text-gray-700">
                        {new Date(winner.won_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="p-8 text-center relative">
                    <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white shadow-lg">
                      <AvatarImage src={winner.avatar} alt={winner.full_name} />
                      <AvatarFallback>{winner.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-2xl font-bold text-gray-900">{winner.full_name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1 text-gray-700">
                      <MapPin className="w-4 h-4"/>
                      <span>{winner.city_regency}</span>
                    </div>

                    {/* Removed rating, total order, and review quote display as these are not available from Transaction entity for past winners */}
                    
                    {/* Hall of Fame Earnings */}
                    <div className="mt-4 bg-green-100 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-green-800">💰 Hadiah Hall of Fame:</p>
                      <p className="text-xl font-bold text-green-900">
                        Rp {winner.hall_of_fame_earnings?.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Milestone Goals */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Target Milestone Berikutnya
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestoneGoals.map((milestone, index) => (
              <Card key={milestone.drivers} className={`border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                totalDrivers >= milestone.drivers ? 'bg-green-100 ring-2 ring-green-500' : 'bg-white'
              }`}>
                <CardHeader>
                  <CardTitle className="text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-xl font-bold text-gray-900">{milestone.title}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">Hadiah:</h4>
                  <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-xl">
                     <Gift className="w-6 h-6" />
                     <span>100% Pool Donasi</span>
                  </div>
                   <Badge className={`mt-6 w-full justify-center ${
                    totalDrivers >= milestone.drivers
                      ? 'bg-green-500'
                      : milestone.drivers === nextMilestone?.drivers
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                  }`}>
                    {totalDrivers >= milestone.drivers
                      ? '✅ Tercapai'
                      : milestone.drivers === nextMilestone?.drivers
                      ? '⏳ Target Berikutnya'
                      : '🔒 Terkunci'
                    }
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Rocket className="w-6 h-6"/> 
                    Jadi Juara Berikutnya?
                  </h3>
                  <p className="text-blue-100">
                    Berikan layanan terbaik, dapatkan rating tinggi, dan jadilah pahlawan di kotamu!
                  </p>
              </div>
              <Button variant="secondary" size="lg" className="bg-white text-blue-600 font-semibold hover:bg-gray-100">
                  Lihat Tips Menjadi Driver Terbaik
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
