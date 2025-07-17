import React, { useState, useEffect } from "react";
import { PricingRule } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  CloudRain, 
  Users, 
  MapPin,
  Calendar,
  TrendingUp
} from "lucide-react";

export default function PricingRuleManager() {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    rule_name: "",
    rule_type: "time_based",
    description: "",
    is_active: true,
    priority: 1,
    price_multiplier: 1.0,
    max_multiplier_cap: 3.0,
    time_rules: {
      start_time: "",
      end_time: "",
      days_of_week: [],
      start_date: "",
      end_date: ""
    },
    weather_rules: {
      weather_conditions: [],
      severity_threshold: "medium"
    },
    demand_rules: {
      demand_threshold: 10,
      driver_availability_threshold: 5,
      calculation_window_minutes: 30
    },
    applicable_zones: [],
    applicable_categories: []
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const allRules = await PricingRule.list("-priority");
      setRules(allRules);
    } catch (error) {
      console.error("Error loading rules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ruleData = {
        ...formData,
        price_multiplier: parseFloat(formData.price_multiplier),
        max_multiplier_cap: parseFloat(formData.max_multiplier_cap),
        priority: parseInt(formData.priority)
      };

      if (editingRule) {
        await PricingRule.update(editingRule.id, ruleData);
      } else {
        await PricingRule.create(ruleData);
      }

      setShowForm(false);
      setEditingRule(null);
      resetForm();
      loadRules();
    } catch (error) {
      console.error("Error saving rule:", error);
      alert("Gagal menyimpan aturan pricing");
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      ...rule,
      time_rules: rule.time_rules || { start_time: "", end_time: "", days_of_week: [] },
      weather_rules: rule.weather_rules || { weather_conditions: [], severity_threshold: "medium" },
      demand_rules: rule.demand_rules || { demand_threshold: 10, driver_availability_threshold: 5 }
    });
    setShowForm(true);
  };

  const handleDelete = async (ruleId) => {
    if (confirm("Yakin ingin menghapus aturan ini?")) {
      try {
        await PricingRule.delete(ruleId);
        loadRules();
      } catch (error) {
        console.error("Error deleting rule:", error);
        alert("Gagal menghapus aturan");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      rule_name: "",
      rule_type: "time_based",
      description: "",
      is_active: true,
      priority: 1,
      price_multiplier: 1.0,
      max_multiplier_cap: 3.0,
      time_rules: { start_time: "", end_time: "", days_of_week: [] },
      weather_rules: { weather_conditions: [], severity_threshold: "medium" },
      demand_rules: { demand_threshold: 10, driver_availability_threshold: 5 },
      applicable_zones: [],
      applicable_categories: []
    });
  };

  const getRuleTypeIcon = (type) => {
    switch (type) {
      case 'time_based': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'weather_based': return <CloudRain className="w-4 h-4 text-gray-500" />;
      case 'demand_based': return <Users className="w-4 h-4 text-orange-500" />;
      case 'zone_based': return <MapPin className="w-4 h-4 text-green-500" />;
      case 'holiday_based': return <Calendar className="w-4 h-4 text-purple-500" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Aturan Pricing</h1>
          <p className="text-gray-600">Kelola surge pricing dan dynamic pricing rules</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Aturan
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>
              {editingRule ? 'Edit Aturan Pricing' : 'Tambah Aturan Pricing'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nama Aturan *</Label>
                  <Input
                    value={formData.rule_name}
                    onChange={(e) => setFormData(prev => ({...prev, rule_name: e.target.value}))}
                    placeholder="Peak Hour Lunch"
                    required
                  />
                </div>
                
                <div>
                  <Label>Jenis Aturan *</Label>
                  <select
                    value={formData.rule_type}
                    onChange={(e) => setFormData(prev => ({...prev, rule_type: e.target.value}))}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="time_based">Berdasarkan Waktu</option>
                    <option value="weather_based">Berdasarkan Cuaca</option>
                    <option value="demand_based">Berdasarkan Demand</option>
                    <option value="zone_based">Berdasarkan Zona</option>
                    <option value="holiday_based">Berdasarkan Hari Libur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Multiplier Harga *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="5.0"
                    value={formData.price_multiplier}
                    onChange={(e) => setFormData(prev => ({...prev, price_multiplier: e.target.value}))}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    1.0 = normal, 1.5 = +50%, 0.8 = -20%
                  </p>
                </div>
                
                <div>
                  <Label>Prioritas</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({...prev, priority: e.target.value}))}
                  />
                </div>
                
                <div>
                  <Label>Max Cap</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="10.0"
                    value={formData.max_multiplier_cap}
                    onChange={(e) => setFormData(prev => ({...prev, max_multiplier_cap: e.target.value}))}
                  />
                </div>
              </div>

              {/* Time-based Rules */}
              {formData.rule_type === 'time_based' && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold mb-3 text-blue-800">Aturan Waktu</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Jam Mulai</Label>
                      <Input
                        type="time"
                        value={formData.time_rules.start_time}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          time_rules: {...prev.time_rules, start_time: e.target.value}
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Jam Selesai</Label>
                      <Input
                        type="time"
                        value={formData.time_rules.end_time}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          time_rules: {...prev.time_rules, end_time: e.target.value}
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label>Hari dalam Seminggu</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        {value: 1, label: 'Sen'}, {value: 2, label: 'Sel'}, 
                        {value: 3, label: 'Rab'}, {value: 4, label: 'Kam'}, 
                        {value: 5, label: 'Jum'}, {value: 6, label: 'Sab'}, 
                        {value: 0, label: 'Min'}
                      ].map(day => (
                        <label key={day.value} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={formData.time_rules.days_of_week.includes(day.value)}
                            onChange={(e) => {
                              const days = formData.time_rules.days_of_week;
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  time_rules: {...prev.time_rules, days_of_week: [...days, day.value]}
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  time_rules: {...prev.time_rules, days_of_week: days.filter(d => d !== day.value)}
                                }));
                              }
                            }}
                          />
                          <span className="text-sm">{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Demand-based Rules */}
              {formData.rule_type === 'demand_based' && (
                <div className="border rounded-lg p-4 bg-orange-50">
                  <h4 className="font-semibold mb-3 text-orange-800">Aturan Demand</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Threshold Pesanan</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.demand_rules.demand_threshold}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          demand_rules: {...prev.demand_rules, demand_threshold: parseInt(e.target.value)}
                        }))}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Jumlah pesanan dalam 30 menit untuk trigger surge
                      </p>
                    </div>
                    <div>
                      <Label>Min Driver Tersedia</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.demand_rules.driver_availability_threshold}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          demand_rules: {...prev.demand_rules, driver_availability_threshold: parseInt(e.target.value)}
                        }))}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Driver online minimum untuk trigger surge
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label>Deskripsi</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Jelaskan kapan dan mengapa aturan ini diterapkan..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, is_active: checked}))}
                />
                <Label>Aturan Aktif</Label>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingRule ? 'Update' : 'Simpan'} Aturan
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map(rule => (
          <Card key={rule.id} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getRuleTypeIcon(rule.rule_type)}
                    <h3 className="text-lg font-semibold">{rule.rule_name}</h3>
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                    <Badge variant="outline">
                      {rule.price_multiplier}x
                    </Badge>
                  </div>
                  
                  {rule.description && (
                    <p className="text-gray-600 mb-3">{rule.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Jenis:</span>
                      <p className="font-medium capitalize">{rule.rule_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Prioritas:</span>
                      <p className="font-medium">{rule.priority || 1}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Diterapkan:</span>
                      <p className="font-medium">{rule.total_applications || 0}x</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Terakhir:</span>
                      <p className="font-medium">
                        {rule.last_applied 
                          ? new Date(rule.last_applied).toLocaleDateString('id-ID')
                          : 'Belum pernah'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Rule Details */}
                  {rule.rule_type === 'time_based' && rule.time_rules && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm">
                        <span className="font-medium text-blue-800">Waktu: </span>
                        {rule.time_rules.start_time && rule.time_rules.end_time && (
                          <span>{rule.time_rules.start_time} - {rule.time_rules.end_time}</span>
                        )}
                        {rule.time_rules.days_of_week && rule.time_rules.days_of_week.length > 0 && (
                          <span className="ml-2">
                            (Hari: {rule.time_rules.days_of_week.map(d => 
                              ['Min','Sen','Sel','Rab','Kam','Jum','Sab'][d]
                            ).join(', ')})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {rule.rule_type === 'demand_based' && rule.demand_rules && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm">
                        <span className="font-medium text-orange-800">Trigger: </span>
                        {rule.demand_rules.demand_threshold && (
                          <span>≥{rule.demand_rules.demand_threshold} pesanan/30min </span>
                        )}
                        {rule.demand_rules.driver_availability_threshold && (
                          <span>atau ≤{rule.demand_rules.driver_availability_threshold} driver online</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {rules.length === 0 && (
          <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
            <CardContent className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Belum Ada Aturan Pricing
              </h3>
              <p className="text-gray-500 mb-6">
                Buat aturan pricing pertama untuk mengoptimalkan pendapatan
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Aturan Pertama
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}