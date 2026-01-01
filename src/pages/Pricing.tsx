import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackground } from '@/components/layout/PageBackground';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useSound } from '@/hooks/useSound';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Check, 
  Zap, 
  Crown, 
  Rocket,
  Star,
  Gift,
  Shield,
  Clock,
  Users,
  BarChart3,
  Loader2,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentForm } from '@/components/PaymentForm';

// Stripe price and product IDs
const STRIPE_TIERS = {
  pro: {
    price_id: "price_1Sia73HENpONntho0Y4abUeU",
    product_id: "prod_TfvzOLBhYojy4e",
  },
  premium: {
    price_id: "price_1Sia7HHENpONnthoe10Kiiht",
    product_id: "prod_Tfvz8P0qtLknhc",
  }
};

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: React.ElementType;
  color: string;
  popular?: boolean;
  features: string[];
  stripeTier?: keyof typeof STRIPE_TIERS;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Bepul',
    description: "Boshlang'ich foydalanuvchilar uchun",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Gift,
    color: 'bg-secondary text-secondary-foreground',
    features: [
      'Kunlik 20 ta mashq',
      'Asosiy statistika',
      'Leaderboard raqobat',
      'Yutuqlar tizimi',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: "Faol o'rganuvchilar uchun",
    monthlyPrice: 29000,
    yearlyPrice: 249000,
    icon: Zap,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
    popular: true,
    features: [
      'Cheksiz mashqlar',
      "Kengaytirilgan statistika",
      "Shaxsiy o'quv rejasi",
      "Reklama yo'q",
      'Priority yordam',
      'Maxsus yutuqlar',
    ],
    stripeTier: 'pro',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Professional darajaga yetish uchun',
    monthlyPrice: 49000,
    yearlyPrice: 399000,
    icon: Crown,
    color: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
    features: [
      'Pro rejadagi barcha imkoniyatlar',
      'Shaxsiy mentor yordam',
      'Video darslar',
      'Sertifikat olish',
      'Oilaviy paket (3 akkaunt)',
      'Beta funksiyalarga kirish',
    ],
    stripeTier: 'premium',
  },
];

const Pricing = () => {
  const { soundEnabled, toggleSound } = useSound();
  const { user } = useAuth();
  const { subscription, tier, refresh: refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  useEffect(() => {
    // Check URL params for success/cancel
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const method = params.get('method');

    if (payment === 'success') {
      // To'lov holatini tekshirish
      const verifyPayment = async () => {
        try {
          const paymentId = params.get('payment_id');
          const merchantTransId = params.get('merchant_trans_id');
          
          if (paymentId || merchantTransId) {
            const { data, error } = await supabase.functions.invoke('verify-payment', {
              body: {
                paymentMethod: method || 'uzcard',
                paymentId,
                merchantTransId,
              },
            });

            if (!error && data?.verified) {
              toast.success("Obuna muvaffaqiyatli amalga oshirildi!", {
                description: "Premium imkoniyatlardan foydalanishingiz mumkin.",
              });
              refreshSubscription();
            } else {
              toast.info("To'lov tekshirilmoqda...", {
                description: "Iltimos, bir necha daqiqa kutib turing.",
              });
            }
          } else {
            toast.success("To'lov muvaffaqiyatli!", {
              description: "Obuna tekshirilmoqda...",
            });
            refreshSubscription();
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast.info("To'lov qabul qilindi", {
            description: "Obuna tekshirilmoqda, iltimos biroz kutib turing.",
          });
        }
      };

      verifyPayment();
      // Clear URL params
      window.history.replaceState({}, '', '/pricing');
    } else if (payment === 'canceled') {
      toast.info("To'lov bekor qilindi");
      window.history.replaceState({}, '', '/pricing');
    } else if (params.get('success') === 'true') {
      // Stripe success
      toast.success("Obuna muvaffaqiyatli amalga oshirildi!", {
        description: "Premium imkoniyatlardan foydalanishingiz mumkin.",
      });
      refreshSubscription();
      window.history.replaceState({}, '', '/pricing');
    } else if (params.get('canceled') === 'true') {
      toast.info("To'lov bekor qilindi");
      window.history.replaceState({}, '', '/pricing');
    }
  }, [refreshSubscription]);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Bepul';
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user) {
      toast.info("Avval tizimga kiring", {
        description: "Obuna bo'lish uchun ro'yxatdan o'ting yoki tizimga kiring.",
        action: {
          label: "Kirish",
          onClick: () => navigate('/auth'),
        },
      });
      return;
    }

    if (plan.id === 'free') {
      toast.success("Siz allaqachon bepul rejada foydalanmoqdasiz!");
      return;
    }

    // To'g'ridan-to'g'ri to'lov formasi sahifasini ochish (faqat UZCARD va HUMO mavjud)
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };


  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error("Xatolik yuz berdi");
    }
  };

  const currentTier = tier;

  // To'lov formasi sahifasi
  if (showPaymentForm && selectedPlan) {
    const price = isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;

  return (
    <PageBackground className="flex flex-col">
      <Navbar soundEnabled={soundEnabled} onToggleSound={toggleSound} />

      <main className="flex-1 container px-3 sm:px-4 py-6 sm:py-8 md:py-12">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => {
                setShowPaymentForm(false);
                setSelectedPlan(null);
              }}
              className="mb-4"
            >
              ← Orqaga
            </Button>
          </div>
          
          <PaymentForm
            planName={selectedPlan.name}
            planDescription={selectedPlan.description}
            planId={selectedPlan.id}
            isYearly={isYearly}
            amount={price}
            discount={isYearly ? Math.round(price * 0.3) : 0}
            onPaymentSuccess={() => {
              setShowPaymentForm(false);
              setSelectedPlan(null);
              refreshSubscription();
              toast.success("Obuna muvaffaqiyatli amalga oshirildi!", {
                description: "Premium imkoniyatlardan foydalanishingiz mumkin.",
              });
            }}
            onCancel={() => {
              setShowPaymentForm(false);
              setSelectedPlan(null);
            }}
          />
        </main>
        
        <Footer />
      </PageBackground>
    );
  }

  return (
    <PageBackground className="flex flex-col">
      <Navbar soundEnabled={soundEnabled} onToggleSound={toggleSound} />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden py-16 md:py-24">
          {/* Animated background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-accent/15 to-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          <div className="container px-3 sm:px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/10 text-primary mb-8 opacity-0 animate-slide-up border border-primary/20 shadow-lg shadow-primary/5" style={{ animationFillMode: 'forwards' }}>
                <Rocket className="h-4 w-4" />
                <span className="text-sm font-semibold">Tariflar</span>
              </div>
              
              {/* Main title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 opacity-0 animate-slide-up leading-tight" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                O'zingizga mos
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">rejani tanlang</span>
            </h1>
              
              {/* Subtitle */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-slide-up leading-relaxed" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              Mental arifmetika bo'yicha professional darajaga yeting. 
              Har bir reja sizning maqsadlaringizga mos keladi.
            </p>

            {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 opacity-0 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              <Label 
                htmlFor="billing-toggle" 
                  className={cn("cursor-pointer text-base font-semibold transition-colors", !isYearly && "text-foreground")}
              >
                Oylik
              </Label>
                <div className="relative">
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
                    className="data-[state=checked]:bg-primary"
              />
                </div>
              <Label 
                htmlFor="billing-toggle" 
                  className={cn("cursor-pointer text-base font-semibold transition-colors flex items-center gap-2", isYearly && "text-foreground")}
              >
                Yillik
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/30">
                  -30%
                </Badge>
              </Label>
            </div>
          </div>
          </div>
        </div>

        {/* Pricing Content */}
        <div className="container px-3 sm:px-4 py-6 sm:py-8 md:py-12">
          <div className="max-w-7xl mx-auto">

          {/* Subscription Status */}
          {subscription?.subscribed && (
            <div className="mb-12 p-6 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/30 rounded-2xl text-center shadow-lg shadow-green-500/10 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <p className="text-green-600 font-bold text-lg">
                  Siz hozirda {currentTier === 'premium' ? 'Premium' : 'Pro'} rejada obuna bo'lgansiz
                </p>
              </div>
              {subscription.subscription_end && (
                <p className="text-sm text-muted-foreground mb-4">
                  Keyingi to'lov: {new Date(subscription.subscription_end).toLocaleDateString('uz-UZ')}
                </p>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-500/30 hover:bg-green-500/10"
                onClick={handleManageSubscription}
              >
                <Settings className="h-4 w-4 mr-2" />
                Obunani boshqarish
              </Button>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
            {pricingPlans.map((plan, index) => {
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const Icon = plan.icon;
              const isCurrentPlan = plan.id === currentTier;

              return (
                <Card 
                  key={plan.id}
                  className={cn(
                    "group relative border border-border/50 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col bg-gradient-to-br from-card via-card to-secondary/20 backdrop-blur-sm overflow-visible",
                    plan.popular && !isCurrentPlan && "ring-2 ring-primary/50 scale-105 z-10",
                    isCurrentPlan && "ring-2 ring-green-500/50",
                    "opacity-0 animate-slide-up"
                  )}
                  style={{ animationDelay: `${400 + index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  {/* Background layer */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-card via-card to-secondary/20 z-0" />
                  
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 blur-xl pointer-events-none" />
                  
                  {/* Glow effect */}
                  {plan.popular && (
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl z-0 pointer-events-none" />
                  )}
                  
                  {/* Content wrapper with z-index */}
                  <div className="relative z-10 flex flex-col flex-1">

                  {plan.popular && !isCurrentPlan && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-2">
                        <Badge className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground px-5 py-1.5 shadow-xl shadow-primary/40 border-0">
                          <Star className="h-4 w-4 mr-1.5 fill-current" />
                          <span className="font-bold">Eng ommabop</span>
                      </Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-2">
                        <Badge className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white px-5 py-1.5 shadow-xl shadow-green-500/40 border-0">
                          <Check className="h-4 w-4 mr-1.5" />
                          <span className="font-bold">Joriy reja</span>
                      </Badge>
                    </div>
                  )}

                    <CardHeader className="text-center pt-10 pb-6 flex-shrink-0 px-6 relative z-10">
                    <div className={cn(
                      "w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                      plan.color
                    )}>
                      <Icon className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-bold mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>

                    <CardContent className="text-center flex-1 flex flex-col px-6 pb-6 relative z-10">
                      <div className="mb-8">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-5xl font-bold text-foreground">
                            {formatPrice(price)}
                          </span>
                      {price > 0 && (
                            <span className="text-muted-foreground text-lg">/{isYearly ? 'yil' : 'oy'}</span>
                          )}
                        </div>
                        {isYearly && price > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Oylik: {formatPrice(Math.round(plan.monthlyPrice * 0.7))}
                          </p>
                      )}
                    </div>

                      <ul className="space-y-4 text-left flex-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-green-500/30">
                              <Check className="h-4 w-4 text-white" strokeWidth={3} />
                          </div>
                            <span className="text-sm leading-relaxed text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                    <CardFooter className="flex-shrink-0 px-6 pb-6 relative z-10">
                    <Button 
                      className={cn(
                        "w-full h-12 text-base font-bold shadow-lg transition-all duration-300",
                        isCurrentPlan 
                          ? 'bg-secondary hover:bg-secondary/80 text-foreground border border-border' 
                          : plan.popular 
                            ? 'bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary/90 text-primary-foreground shadow-primary/30 hover:shadow-primary/50 hover:scale-105' 
                            : 'bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/80 hover:to-secondary text-foreground border border-border hover:border-primary/50'
                      )}
                      variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(plan)}
                      disabled={loadingPlan === plan.id || isCurrentPlan}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Yuklanmoqda...
                        </>
                      ) : isCurrentPlan ? (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Joriy reja
                        </>
                      ) : plan.id === 'free' ? (
                        'Hozirgi reja'
                      ) : (
                        <>
                          <Rocket className="h-5 w-5 mr-2" />
                          Obuna bo'lish
                        </>
                      )}
                    </Button>
                  </CardFooter>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Features Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-secondary/40 via-secondary/30 to-secondary/40 rounded-3xl p-8 md:p-12 border border-border/50 shadow-xl">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Barcha rejalarda mavjud
            </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {[
                  { icon: Shield, title: 'Xavfsiz', desc: "Ma'lumotlaringiz himoyalangan", color: 'from-blue-500 to-blue-600' },
                  { icon: Clock, title: '24/7 kirish', desc: "Istalgan vaqtda mashq qiling", color: 'from-primary to-primary/80' },
                  { icon: Users, title: 'Jamoa raqobati', desc: 'Leaderboardda bahslashing', color: 'from-accent to-accent/80' },
                  { icon: BarChart3, title: 'Statistika', desc: "Rivojlanishingizni kuzating", color: 'from-green-500 to-emerald-500' },
                ].map((item, index) => (
                  <div 
                    key={item.title} 
                    className="text-center group opacity-0 animate-slide-up"
                    style={{ animationDelay: `${600 + index * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br mx-auto mb-4 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                      `bg-gradient-to-br ${item.color}`
                    )}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
                </div>
            </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

    </PageBackground>
  );
};

export default Pricing;
