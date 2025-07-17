import React, { useState, useEffect } from "react";
import { Review } from "@/api/entities";
import { Order } from "@/api/entities";
import { Driver } from "@/api/entities";
import { User } from "@/api/entities";
import { 
  Star, 
  MessageSquare, 
  Calendar,
  Award,
  TrendingUp,
  Filter,
  Camera,
  CheckCircle,
  Clock,
  User as UserIcon,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const StarRating = ({ rating, onRatingChange, readOnly = false, size = "default" }) => {
  const starSize = size === "large" ? "w-10 h-10" : size === "small" ? "w-4 h-4" : "w-8 h-8";
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onRatingChange && onRatingChange(star)}
          className={`${starSize} ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          disabled={readOnly}
        >
          <Star
            className={`w-full h-full ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const DetailedRatingForm = ({ onSubmit, onCancel, order }) => {
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    service_quality: 5,
    punctuality: 5,
    communication: 5,
    politeness: 5,
    item_condition: 5,
    comment: "",
    would_recommend: true
  });

  const ratingCategories = [
    { key: "service_quality", label: "Kualitas Layanan", desc: "Seberapa baik driver menyelesaikan tugas" },
    { key: "punctuality", label: "Ketepatan Waktu", desc: "Apakah driver datang tepat waktu" },
    { key: "communication", label: "Komunikasi", desc: "Seberapa responsif dan jelas komunikasi driver" },
    { key: "politeness", label: "Keramahan", desc: "Sikap dan sopan santun driver" },
    { key: "item_condition", label: "Kondisi Barang", desc: "Apakah barang diantar dalam kondisi baik" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reviewForm);
  };

  const averageRating = (
    reviewForm.service_quality + 
    reviewForm.punctuality + 
    reviewForm.communication + 
    reviewForm.politeness + 
    reviewForm.item_condition
  ) / 5;

  // Update overall rating based on detailed ratings
  React.useEffect(() => {
    setReviewForm(prev => ({ ...prev, rating: Math.round(averageRating) }));
  }, [averageRating]);

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          Review Detailed untuk: {order.item_description}
        </CardTitle>
        <p className="text-gray-600">Bantu driver lain dengan review yang detail dan jujur</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating Display */}
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Rating Keseluruhan</h3>
            <div className="flex items-center justify-center gap-3 mb-2">
              <StarRating rating={Math.round(averageRating)} readOnly size="large" />
              <span className="text-3xl font-bold text-yellow-600">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-gray-500">Dihitung otomatis dari rating detail di bawah</p>
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Penilaian Detail:</h4>
            {ratingCategories.map((category) => (
              <div key={category.key} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <label className="font-medium text-gray-900">{category.label}</label>
                    <p className="text-sm text-gray-500">{category.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={reviewForm[category.key]}
                      onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, [category.key]: rating }))}
                    />
                    <span className="text-lg font-semibold text-gray-700 w-8">{reviewForm[category.key]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-semibold mb-2">Komentar Detail (Opsional)</label>
            <Textarea
              placeholder="Ceritakan pengalaman Anda dengan driver ini. Apa yang dilakukan dengan baik? Ada yang bisa diperbaiki? Review Anda membantu driver lain menjadi lebih baik."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
              className="min-h-[120px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tips: Sebutkan hal spesifik seperti kecepatan, komunikasi, kondisi barang, dll.
            </p>
          </div>

          {/* Recommendation */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <ThumbsUp className="w-5 h-5 text-blue-500" />
              <label className="font-medium">Apakah Anda akan merekomendasikan driver ini?</label>
            </div>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recommend"
                  checked={reviewForm.would_recommend === true}
                  onChange={() => setReviewForm(prev => ({ ...prev, would_recommend: true }))}
                  className="text-blue-600"
                />
                <span>Ya, pasti!</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recommend"
                  checked={reviewForm.would_recommend === false}
                  onChange={() => setReviewForm(prev => ({ ...prev, would_recommend: false }))}
                  className="text-blue-600"
                />
                <span>Tidak yakin</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-8"
            >
              <Star className="w-4 h-4 mr-2" />
              Kirim Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Load completed orders that haven't been reviewed
      const orders = await Order.filter({ 
        created_by: user.email, 
        status: "completed" 
      }, "-created_date");
      
      // Load existing reviews
      const userReviews = await Review.filter({ customer_id: user.id }, "-created_date");
      
      // Filter out orders that already have reviews
      const reviewedOrderIds = userReviews.map(review => review.order_id);
      const unreviewed = orders.filter(order => !reviewedOrderIds.includes(order.id));
      
      setCompletedOrders(unreviewed);
      setReviews(userReviews);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitReview = async (reviewData) => {
    if (!selectedOrder) return;
    
    try {
      const user = await User.me();
      await Review.create({
        order_id: selectedOrder.id,
        driver_id: selectedOrder.driver_id,
        customer_id: user.id,
        ...reviewData
      });
      
      setSelectedOrder(null);
      await loadData();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const getFilteredReviews = () => {
    if (filterRating === "all") return reviews;
    return reviews.filter(review => review.rating.toString() === filterRating);
  };

  const ratingDistribution = getRatingDistribution();
  const filteredReviews = getFilteredReviews();

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

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reviews & Rating ⭐
        </h1>
        <p className="text-gray-600">
          Berikan penilaian detail untuk driver dan lihat riwayat review kamu
        </p>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Rating Rata-rata</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{getAverageRating()}</p>
                  <StarRating rating={Math.round(getAverageRating())} readOnly size="small" />
                </div>
              </div>
              <Award className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Review</p>
                <p className="text-3xl font-bold">{reviews.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Belum Review</p>
                <p className="text-3xl font-bold">{completedOrders.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      {reviews.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Distribusi Rating Anda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <Progress 
                      value={reviews.length > 0 ? (ratingDistribution[rating] / reviews.length) * 100 : 0} 
                      className="h-3"
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{ratingDistribution[rating]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Reviews */}
      {completedOrders.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pesanan Selesai - Belum Direview
          </h2>
          <div className="grid gap-4">
            {completedOrders.map((order) => (
              <Card key={order.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {order.item_description}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.created_date).toLocaleDateString('id-ID')}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Rp {(order.actual_price || order.max_budget)?.toLocaleString('id-ID')}
                        </span>
                        {order.driver_id && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Selesai
                          </Badge>
                        )}
                      </div>
                      {order.delivery_address && (
                        <p className="text-sm text-gray-500 mb-2">
                          📍 {order.delivery_address.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-blue-600 hover:bg-blue-700 ml-4"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Beri Review Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-4xl my-8">
            <DetailedRatingForm
              order={selectedOrder}
              onSubmit={submitReview}
              onCancel={() => setSelectedOrder(null)}
            />
          </div>
        </div>
      )}

      {/* Review History */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Riwayat Review Anda
          </h2>
          
          {reviews.length > 0 && (
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Rating</SelectItem>
                <SelectItem value="5">5 Bintang</SelectItem>
                <SelectItem value="4">4 Bintang</SelectItem>
                <SelectItem value="3">3 Bintang</SelectItem>
                <SelectItem value="2">2 Bintang</SelectItem>
                <SelectItem value="1">1 Bintang</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        {filteredReviews.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
            <CardContent className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {reviews.length === 0 ? "Belum Ada Review" : "Tidak Ada Review dengan Filter Ini"}
              </h3>
              <p className="text-gray-500">
                {reviews.length === 0 
                  ? "Review akan muncul di sini setelah kamu menyelesaikan pesanan"
                  : "Coba ganti filter atau berikan review untuk pesanan yang sudah selesai"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <StarRating rating={review.rating} readOnly />
                      <span className="font-semibold text-lg">{review.rating}/5</span>
                      {review.would_recommend && (
                        <Badge className="bg-green-100 text-green-800">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_date).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  {/* Detailed Ratings Display */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {[
                      { key: 'service_quality', label: 'Layanan', value: review.service_quality },
                      { key: 'punctuality', label: 'Ketepatan', value: review.punctuality },
                      { key: 'communication', label: 'Komunikasi', value: review.communication },
                      { key: 'politeness', label: 'Keramahan', value: review.politeness },
                      { key: 'item_condition', label: 'Kondisi Barang', value: review.item_condition }
                    ].filter(item => item.value).map((item) => (
                      <div key={item.key} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">{item.label}</p>
                        <div className="flex justify-center mb-1">
                          <StarRating rating={item.value || 0} readOnly size="small" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{item.value}/5</p>
                      </div>
                    ))}
                  </div>

                  {review.comment && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Komentar Anda:</h4>
                      <p className="text-gray-800 italic">"{review.comment}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}