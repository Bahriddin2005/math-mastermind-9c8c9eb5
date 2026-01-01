import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageBackground } from '@/components/layout/PageBackground';
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSound } from "@/hooks/useSound";
import { useNavigate } from "react-router-dom";
import { 
  Award, 
  Trophy, 
  Lock, 
  Check, 
  ArrowLeft,
  Flame,
  Target,
  Star,
  Crown,
  Medal,
  Zap,
  Gamepad2,
  TrendingUp
} from "lucide-react";

interface UserBadge {
  id: string;
  badge_type: string;
  badge_name: string;
  earned_at: string;
}

// All available badges in the system
const ALL_BADGES = [
  // Competition badges
  { type: "daily_winner", name: "Kunlik g'olib", icon: "🥇", color: "from-yellow-500 to-amber-500", description: "Kunlik musobaqada 1-o'rin", category: "Musobaqalar" },
  { type: "weekly_gold", name: "Haftalik oltin", icon: "🥇", color: "from-yellow-400 to-yellow-600", description: "Haftalik musobaqada 1-o'rin", category: "Musobaqalar" },
  { type: "weekly_silver", name: "Haftalik kumush", icon: "🥈", color: "from-gray-300 to-gray-500", description: "Haftalik musobaqada 2-o'rin", category: "Musobaqalar" },
  { type: "weekly_bronze", name: "Haftalik bronza", icon: "🥉", color: "from-amber-600 to-amber-800", description: "Haftalik musobaqada 3-o'rin", category: "Musobaqalar" },
  { type: "weekly_winner", name: "Haftalik chempion", icon: "🏆", color: "from-purple-500 to-pink-500", description: "Haftalik musobaqada g'olib", category: "Musobaqalar" },
  
  // Streak badges
  { type: "streak_3", name: "Uch kunlik seriya", icon: "🔥", color: "from-orange-400 to-red-400", description: "3 kun ketma-ket mashq", category: "Seriyalar" },
  { type: "streak_5", name: "Besh kunlik seriya", icon: "🔥", color: "from-orange-500 to-red-500", description: "5 kun ketma-ket mashq", category: "Seriyalar" },
  { type: "streak_7", name: "Haftalik seriya", icon: "🔥", color: "from-orange-500 to-red-500", description: "7 kun ketma-ket mashq", category: "Seriyalar" },
  { type: "streak_14", name: "Ikki haftalik seriya", icon: "⚡", color: "from-yellow-500 to-orange-500", description: "14 kun ketma-ket mashq", category: "Seriyalar" },
  { type: "streak_30", name: "Oylik seriya", icon: "⭐", color: "from-amber-500 to-yellow-500", description: "30 kun ketma-ket mashq", category: "Seriyalar" },
  
  // Best streak badges
  { type: "best_streak_10", name: "Seriya ustasi", icon: "⚡", color: "from-blue-500 to-cyan-500", description: "10+ ketma-ket to'g'ri javob", category: "Seriyalar" },
  { type: "best_streak_25", name: "Super seriya", icon: "💎", color: "from-indigo-500 to-purple-500", description: "25+ ketma-ket to'g'ri javob", category: "Seriyalar" },
  
  // Problem solver badges
  { type: "solver_100", name: "100 masala", icon: "💯", color: "from-green-500 to-emerald-500", description: "100 ta masala yechish", category: "Masalalar" },
  { type: "solver_500", name: "500 masala", icon: "🎯", color: "from-teal-500 to-green-500", description: "500 ta masala yechish", category: "Masalalar" },
  { type: "solver_1000", name: "Ming masala", icon: "🏆", color: "from-yellow-500 to-orange-500", description: "1000 ta masala yechish", category: "Masalalar" },
  
  // Score badges
  { type: "score_1000", name: "Ming ball", icon: "🌟", color: "from-blue-500 to-indigo-500", description: "1000 ball to'plash", category: "Ball" },
  { type: "score_5000", name: "Besh ming ball", icon: "👑", color: "from-amber-500 to-orange-500", description: "5000 ball to'plash", category: "Ball" },
  { type: "daily_score_500", name: "Kunlik besh yuz", icon: "⭐", color: "from-cyan-500 to-blue-500", description: "1 kunda 500+ ball", category: "Ball" },
  { type: "daily_score_1000", name: "Kunlik ming ball", icon: "🔥", color: "from-orange-500 to-red-500", description: "1 kunda 1000+ ball", category: "Ball" },
  
  // Accuracy badges
  { type: "accuracy_95", name: "Super aniqlik", icon: "🎯", color: "from-emerald-500 to-green-500", description: "95%+ aniqlik bilan o'yin", category: "Aniqlik" },
  { type: "perfect_game", name: "Mukammal o'yin", icon: "💎", color: "from-violet-500 to-purple-500", description: "100% aniqlik, 10+ masala", category: "Aniqlik" },
  
  // Game badges
  { type: "first_game", name: "Birinchi qadam", icon: "🎮", color: "from-pink-500 to-rose-500", description: "Birinchi o'yinni o'ynash", category: "O'yinlar" },
  { type: "games_10", name: "Faol o'yinchi", icon: "🎲", color: "from-violet-500 to-purple-500", description: "10 ta o'yin o'ynash", category: "O'yinlar" },
  { type: "games_50", name: "Tajribali", icon: "🎖️", color: "from-slate-500 to-zinc-500", description: "50 ta o'yin o'ynash", category: "O'yinlar" },
];

const CATEGORIES = [
  { id: "all", name: "Hammasi", icon: Award },
  { id: "Musobaqalar", name: "Musobaqalar", icon: Trophy },
  { id: "Seriyalar", name: "Seriyalar", icon: Flame },
  { id: "Masalalar", name: "Masalalar", icon: Target },
  { id: "Ball", name: "Ball", icon: Star },
  { id: "Aniqlik", name: "Aniqlik", icon: TrendingUp },
  { id: "O'yinlar", name: "O'yinlar", icon: Gamepad2 },
];

const Badges = () => {
  const { user } = useAuth();
  const { soundEnabled, toggleSound } = useSound();
  const navigate = useNavigate();

  const { data: userBadges, isLoading } = useQuery({
    queryKey: ["user-badges-all", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_badges")
        .select("id, badge_type, badge_name, earned_at")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!user,
  });

  const [selectedCategory, setSelectedCategory] = React.useState("all");

  const earnedBadgeTypes = new Set(userBadges?.map((b) => b.badge_type) || []);
  const earnedCount = earnedBadgeTypes.size;
  const totalCount = ALL_BADGES.length;
  const progressPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  const filteredBadges = selectedCategory === "all" 
    ? ALL_BADGES 
    : ALL_BADGES.filter((b) => b.category === selectedCategory);

  const getBadgeEarnedInfo = (badgeType: string) => {
    const badge = userBadges?.find((b) => b.badge_type === badgeType);
    return badge || null;
  };

  return (
    <PageBackground className="flex flex-col">
      <Navbar soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      
      <main className="flex-1 container px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="opacity-0 animate-fade-in"
            style={{ animationFillMode: 'forwards' }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>

          {/* Header */}
          <div className="text-center space-y-4 opacity-0 animate-slide-up relative" style={{ animationFillMode: 'forwards' }}>
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <div className="relative inline-block">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-400 to-orange-500 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/50 animate-pulse-slow">
                  <Award className="h-12 w-12 md:h-14 md:w-14 text-white" />
                </div>
                {/* Floating sparkles */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400/80 blur-sm animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-orange-400/80 blur-sm animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s' }} />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 sm:mt-6 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent px-2">
                Mukofotlar va Yutuqlar
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-2 px-2">Barcha mavjud mukofotlar va yutuqlar kolleksiyasi</p>
            </div>
          </div>

          {/* Progress Card */}
          <Card className="overflow-hidden opacity-0 animate-slide-up border-2 border-primary/20 shadow-xl bg-gradient-to-br from-card via-card to-primary/5" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5" />
            <CardContent className="p-4 sm:p-6 md:p-8 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/50">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-base sm:text-lg">Sizning yutuqlaringiz</span>
                    <p className="text-xs sm:text-sm text-muted-foreground">Kolleksiyangizdagi badge'lar</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-base sm:text-xl px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30">
                  <span className="font-bold text-amber-600 dark:text-amber-400">{earnedCount}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className="font-semibold">{totalCount}</span>
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="relative h-4 bg-secondary rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 transition-all duration-1000 shadow-lg shadow-amber-500/50"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {Math.round(progressPercent)}% bajarildi
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {totalCount - earnedCount} ta badge yutib olish qoldi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center opacity-0 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`gap-2 px-4 py-2 h-auto rounded-xl font-medium transition-all duration-300 ${
                    isActive 
                      ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/50 scale-105" 
                      : "hover:bg-secondary/80 hover:scale-105 border-2"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "animate-pulse" : ""}`} />
                  <span>{cat.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 opacity-0 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            {filteredBadges.map((badge, index) => {
              const earnedInfo = getBadgeEarnedInfo(badge.type);
              const isEarned = !!earnedInfo;

              return (
                <div
                  key={badge.type}
                  className={`relative group ${!isEarned ? "opacity-70" : ""}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card className={`overflow-visible transition-all duration-500 hover:scale-110 hover:-translate-y-2 cursor-pointer border-2 ${
                    isEarned 
                      ? `border-primary/50 shadow-xl shadow-primary/20 bg-gradient-to-br from-card via-card to-primary/5` 
                      : "border-border/50 bg-card/50 backdrop-blur-sm"
                  }`}>
                    {/* Animated gradient border for earned badges */}
                    {isEarned && (
                      <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${badge.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`} />
                    )}
                    
                    {/* Top gradient line */}
                    <div className={`h-2 bg-gradient-to-r ${badge.color} ${!isEarned ? "opacity-50" : ""}`} />
                    
                    <CardContent className="p-4 md:p-5 text-center">
                      <div className="relative mb-4">
                        <div
                          className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-2xl bg-gradient-to-br ${badge.color} p-1 transition-all duration-500 ${
                            isEarned 
                              ? "shadow-2xl shadow-amber-500/50 group-hover:shadow-amber-500/70 group-hover:scale-110" 
                              : "grayscale opacity-60 shadow-md"
                          }`}
                        >
                          <div className="w-full h-full rounded-xl bg-card/95 backdrop-blur-sm flex items-center justify-center">
                            <span className={`text-4xl md:text-5xl transition-transform duration-500 ${isEarned ? "group-hover:scale-110" : ""}`}>
                              {badge.icon}
                            </span>
                          </div>
                        </div>
                        
                        {/* Status badge */}
                        {isEarned ? (
                          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/50 animate-pulse">
                            <Check className="h-4 w-4 text-white" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-muted/80 backdrop-blur-sm border-2 border-border flex items-center justify-center shadow-md">
                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Shimmer effect for earned badges */}
                        {isEarned && (
                          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${badge.color}`} />
                        )}
                      </div>
                      
                      <h3 className={`font-bold text-sm md:text-base mb-2 transition-colors ${
                        isEarned 
                          ? "text-foreground group-hover:text-primary" 
                          : "text-muted-foreground"
                      }`}>
                        {badge.name}
                      </h3>
                      <p className={`text-xs md:text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] ${
                        isEarned ? "" : "opacity-70"
                      }`}>
                        {badge.description}
                      </p>
                      {isEarned && earnedInfo && (
                        <Badge 
                          variant="secondary" 
                          className="mt-3 text-xs px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-700 dark:text-green-400"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {new Date(earnedInfo.earned_at).toLocaleDateString("uz-UZ", { 
                            day: 'numeric', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Empty state for non-logged in users */}
          {!user && (
            <Card className="text-center py-12">
              <CardContent>
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Tizimga kiring</h3>
                <p className="text-muted-foreground mb-4">
                  Badge'laringizni ko'rish uchun tizimga kiring
                </p>
                <Button onClick={() => navigate("/auth")}>
                  Kirish
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </PageBackground>
  );
};

// Need to import React for useState
import React from "react";

export default Badges;
