import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Star, Lightbulb, Bug } from "lucide-react";

export default function FeedbackForm({ onSubmit, onClose }) {
  const [feedbackData, setFeedbackData] = useState({
    type: "",
    subject: "",
    message: "",
    rating: 5
  });
  const [submitting, setSubmitting] = useState(false);

  const feedbackTypes = [
    { value: "suggestion", label: "Saran Perbaikan", icon: "💡" },
    { value: "bug_report", label: "Laporkan Bug", icon: "🐛" },
    { value: "feature_request", label: "Request Fitur Baru", icon: "⭐" },
    { value: "general_feedback", label: "Feedback Umum", icon: "💬" },
    { value: "compliment", label: "Pujian/Apresiasi", icon: "👏" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackData.type || !feedbackData.subject || !feedbackData.message) return;

    setSubmitting(true);
    try {
      // Untuk sementara, kita kirim ke WhatsApp juga
      const message = encodeURIComponent(
        `*Feedback JastipDigital*\n\n` +
        `*Jenis:* ${feedbackTypes.find(t => t.value === feedbackData.type)?.label}\n` +
        `*Subjek:* ${feedbackData.subject}\n` +
        `*Rating:* ${feedbackData.rating}/5 ⭐\n\n` +
        `*Pesan:*\n${feedbackData.message}`
      );
      
      const whatsappUrl = `https://wa.me/6282340042948?text=${message}`;
      window.open(whatsappUrl, '_blank');
      
      onSubmit();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          Feedback & Saran
        </CardTitle>
        <p className="text-sm text-gray-600">
          Bantuan Anda sangat berharga untuk pengembangan JastipDigital
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="feedback_type">Jenis Feedback *</Label>
            <Select
              value={feedbackData.type}
              onValueChange={(value) => setFeedbackData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis feedback" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subjek *</Label>
            <Input
              id="subject"
              value={feedbackData.subject}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Ringkasan singkat feedback Anda"
            />
          </div>

          <div>
            <Label>Rating Pengalaman Anda</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                  className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-full h-full ${
                      star <= feedbackData.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="message">Detail Feedback *</Label>
            <Textarea
              id="message"
              value={feedbackData.message}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Jelaskan feedback Anda secara detail..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!feedbackData.type || !feedbackData.subject || !feedbackData.message || submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}