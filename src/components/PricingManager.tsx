import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  DollarSign, 
  Save, 
  Loader2, 
  Plus, 
  X,
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PricingPlan {
  id: string;
  name: string;
  description: string | null;
  monthly_price: number;
  yearly_price: number;
  stripe_monthly_price_id: string | null;
  stripe_yearly_price_id: string | null;
  stripe_product_id: string | null;
  is_active: boolean;
  features: string[];
  popular: boolean;
  sort_order: number;
}

export const PricingManager = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        
        // Check for specific error codes
        const errorCode = error.code || '';
        const errorMessage = error.message || '';
        
        // Table doesn't exist
        if (errorCode === 'PGRST116' || errorMessage.includes('does not exist') || errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
          console.warn('pricing_plans table not found, using default plans');
          // Set default plans as fallback
          setPlans([
            {
              id: 'free',
              name: 'Bepul',
              description: "Boshlang'ich foydalanuvchilar uchun",
              monthly_price: 0,
              yearly_price: 0,
              stripe_monthly_price_id: null,
              stripe_yearly_price_id: null,
              stripe_product_id: null,
              is_active: true,
              features: ['Kunlik 20 ta mashq', 'Asosiy statistika', 'Leaderboard raqobat', 'Yutuqlar tizimi'],
              popular: false,
              sort_order: 0,
            },
            {
              id: 'pro',
              name: 'Pro',
              description: "Faol o'rganuvchilar uchun",
              monthly_price: 29000,
              yearly_price: 249000,
              stripe_monthly_price_id: null,
              stripe_yearly_price_id: null,
              stripe_product_id: null,
              is_active: true,
              features: ['Cheksiz mashqlar', 'Kengaytirilgan statistika', "Shaxsiy o'quv rejasi", "Reklama yo'q", 'Priority yordam', 'Maxsus yutuqlar'],
              popular: true,
              sort_order: 1,
            },
            {
              id: 'premium',
              name: 'Premium',
              description: 'Professional darajaga yetish uchun',
              monthly_price: 49000,
              yearly_price: 399000,
              stripe_monthly_price_id: null,
              stripe_yearly_price_id: null,
              stripe_product_id: null,
              is_active: true,
              features: ['Pro rejadagi barcha imkoniyatlar', 'Shaxsiy mentor yordam', 'Video darslar', 'Sertifikat olish', 'Oilaviy paket (3 akkaunt)', 'Beta funksiyalarga kirish'],
              popular: false,
              sort_order: 2,
            },
          ]);
          toast.warning("Database jadvali topilmadi. Default rejalar ko'rsatilmoqda. Migration'ni ishga tushiring.", {
            description: "supabase/migrations/20250101000002_create_pricing_plans_table.sql",
            duration: 10000,
          });
          setLoading(false);
          return;
        }
        
        // RLS policy error
        if (errorCode === '42501' || errorMessage.includes('permission denied') || errorMessage.includes('policy')) {
          toast.error("Ruxsat yo'q. Admin huquqlarini tekshiring.", {
            description: errorMessage,
          });
          setLoading(false);
          return;
        }
        
        // Other errors
        throw error;
      }

      // Convert features from JSONB to array
      const plansWithFeatures = data?.map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? JSON.parse(plan.features) : []),
      })) || [];

      if (plansWithFeatures.length === 0) {
        toast.info("Rejalar topilmadi. Iltimos, database migration'ni ishga tushiring.");
      }

      setPlans(plansWithFeatures);
    } catch (error) {
      console.error('Error fetching plans:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error(`Rejalarni yuklashda xatolik: ${errorMsg}`, {
        description: "Iltimos, browser console'ni tekshiring yoki database migration'ni ishga tushiring.",
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (plan: PricingPlan) => {
    setSaving(plan.id);
    try {
      // Check if table exists first
      const { error: checkError } = await supabase
        .from('pricing_plans')
        .select('id')
        .eq('id', plan.id)
        .limit(1);

      if (checkError) {
        if (checkError.code === 'PGRST116' || checkError.message?.includes('does not exist')) {
          toast.error("Database jadvali topilmadi. Iltimos, migration'ni ishga tushiring.", {
            description: "supabase/migrations/20250101000002_create_pricing_plans_table.sql",
          });
          setSaving(null);
          return;
        }
        throw checkError;
      }

      const { error } = await supabase
        .from('pricing_plans')
        .update({
          name: plan.name,
          description: plan.description,
          monthly_price: plan.monthly_price,
          yearly_price: plan.yearly_price,
          is_active: plan.is_active,
          popular: plan.popular,
          features: plan.features,
          stripe_monthly_price_id: plan.stripe_monthly_price_id || null,
          stripe_yearly_price_id: plan.stripe_yearly_price_id || null,
          stripe_product_id: plan.stripe_product_id || null,
        })
        .eq('id', plan.id);

      if (error) throw error;

      toast.success(`${plan.name} rejasi yangilandi`);
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error(`Xatolik: ${error instanceof Error ? error.message : 'Noma\'lum xatolik'}`);
    } finally {
      setSaving(null);
    }
  };

  const handleFeatureChange = (planId: string, index: number, value: string) => {
    setEditingPlan(prev => {
      if (!prev || prev.id !== planId) return prev;
      const newFeatures = [...prev.features];
      newFeatures[index] = value;
      return { ...prev, features: newFeatures };
    });
  };

  const handleAddFeature = (planId: string) => {
    setEditingPlan(prev => {
      if (!prev || prev.id !== planId) return prev;
      return { ...prev, features: [...prev.features, ''] };
    });
  };

  const handleRemoveFeature = (planId: string, index: number) => {
    setEditingPlan(prev => {
      if (!prev || prev.id !== planId) return prev;
      const newFeatures = prev.features.filter((_, i) => i !== index);
      return { ...prev, features: newFeatures };
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (plans.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Narxlar boshqaruvi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Rejalar topilmadi</h3>
            <p className="text-muted-foreground mb-4">
              Database jadvali topilmadi yoki rejalar mavjud emas.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Iltimos, quyidagi migration'ni ishga tushiring:
            </p>
            <code className="block p-4 bg-secondary rounded-lg text-left text-sm mb-4">
              supabase/migrations/20250101000002_create_pricing_plans_table.sql
            </code>
            <Button onClick={fetchPlans} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Qayta yuklash
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Narxlar boshqaruvi
          </CardTitle>
          <CardDescription>
            Rejalar narxlarini va xususiyatlarini boshqaring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {plans.map((plan) => {
              const isEditing = editingPlan?.id === plan.id;
              const displayPlan = isEditing ? editingPlan! : plan;

              return (
                <Card key={plan.id} className="border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{displayPlan.name}</CardTitle>
                        {displayPlan.popular && (
                          <Badge className="bg-primary text-primary-foreground">
                            Ommabop
                          </Badge>
                        )}
                        {!displayPlan.is_active && (
                          <Badge variant="secondary">Nofaol</Badge>
                        )}
                      </div>
                      {!isEditing ? (
                        <Button
                          variant="outline"
                          onClick={() => setEditingPlan({ ...plan })}
                        >
                          Tahrirlash
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditingPlan(null)}
                            disabled={saving === plan.id}
                          >
                            Bekor qilish
                          </Button>
                          <Button
                            onClick={() => handleSave(displayPlan)}
                            disabled={saving === plan.id}
                          >
                            {saving === plan.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saqlanmoqda...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Saqlash
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Description */}
                    <div className="space-y-2">
                      <Label>Tavsif</Label>
                      {isEditing ? (
                        <Textarea
                          value={displayPlan.description || ''}
                          onChange={(e) =>
                            setEditingPlan(prev => prev ? { ...prev, description: e.target.value } : null)
                          }
                          placeholder="Reja tavsifi"
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {displayPlan.description || 'Tavsif kiritilmagan'}
                        </p>
                      )}
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Oylik narx (so'm)</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={displayPlan.monthly_price}
                            onChange={(e) =>
                              setEditingPlan(prev => prev ? { ...prev, monthly_price: parseFloat(e.target.value) || 0 } : null)
                            }
                            min="0"
                            step="1000"
                          />
                        ) : (
                          <p className="text-lg font-bold">
                            {formatPrice(displayPlan.monthly_price)} so'm
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Yillik narx (so'm)</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={displayPlan.yearly_price}
                            onChange={(e) =>
                              setEditingPlan(prev => prev ? { ...prev, yearly_price: parseFloat(e.target.value) || 0 } : null)
                            }
                            min="0"
                            step="1000"
                          />
                        ) : (
                          <p className="text-lg font-bold">
                            {formatPrice(displayPlan.yearly_price)} so'm
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stripe IDs */}
                    {isEditing && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Stripe Monthly Price ID</Label>
                          <Input
                            type="text"
                            value={displayPlan.stripe_monthly_price_id || ''}
                            onChange={(e) =>
                              setEditingPlan(prev => prev ? { ...prev, stripe_monthly_price_id: e.target.value } : null)
                            }
                            placeholder="price_xxx"
                            className="text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Stripe Yearly Price ID</Label>
                          <Input
                            type="text"
                            value={displayPlan.stripe_yearly_price_id || ''}
                            onChange={(e) =>
                              setEditingPlan(prev => prev ? { ...prev, stripe_yearly_price_id: e.target.value } : null)
                            }
                            placeholder="price_xxx"
                            className="text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Stripe Product ID</Label>
                          <Input
                            type="text"
                            value={displayPlan.stripe_product_id || ''}
                            onChange={(e) =>
                              setEditingPlan(prev => prev ? { ...prev, stripe_product_id: e.target.value } : null)
                            }
                            placeholder="prod_xxx"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="space-y-2">
                      <Label>Xususiyatlar</Label>
                      {isEditing ? (
                        <div className="space-y-2">
                          {displayPlan.features.map((feature, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={feature}
                                onChange={(e) => handleFeatureChange(plan.id, index, e.target.value)}
                                placeholder={`Xususiyat ${index + 1}`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveFeature(plan.id, index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddFeature(plan.id)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Xususiyat qo'shish
                          </Button>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {displayPlan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Settings */}
                    {isEditing && (
                      <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                        <div className="space-y-1">
                          <Label>Faol</Label>
                          <p className="text-xs text-muted-foreground">
                            Reja foydalanuvchilar uchun ko'rinadimi?
                          </p>
                        </div>
                        <Switch
                          checked={displayPlan.is_active}
                          onCheckedChange={(checked) =>
                            setEditingPlan(prev => prev ? { ...prev, is_active: checked } : null)
                          }
                        />
                      </div>
                    )}

                    {isEditing && (
                      <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                        <div className="space-y-1">
                          <Label>Ommabop</Label>
                          <p className="text-xs text-muted-foreground">
                            "Ommabop" badge ko'rsatilsinmi?
                          </p>
                        </div>
                        <Switch
                          checked={displayPlan.popular}
                          onCheckedChange={(checked) =>
                            setEditingPlan(prev => prev ? { ...prev, popular: checked } : null)
                          }
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

