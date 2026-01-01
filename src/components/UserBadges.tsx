import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Trophy, Share2, Twitter, Facebook, Link2, Check, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserBadge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_icon: string;
  description: string | null;
  earned_at: string;
  competition_type: string | null;
}

const BADGE_DEFINITIONS = [
  // Competition badges
  { type: "daily_winner", name: "Kunlik g'olib", icon: "🥇", color: "from-yellow-500 to-amber-500", description: "Kunlik musobaqada 1-o'rin" },
  { type: "weekly_gold", name: "Haftalik oltin", icon: "🥇", color: "from-yellow-400 to-yellow-600", description: "Haftalik musobaqada 1-o'rin" },
  { type: "weekly_silver", name: "Haftalik kumush", icon: "🥈", color: "from-gray-300 to-gray-500", description: "Haftalik musobaqada 2-o'rin" },
  { type: "weekly_bronze", name: "Haftalik bronza", icon: "🥉", color: "from-amber-600 to-amber-800", description: "Haftalik musobaqada 3-o'rin" },
  { type: "weekly_winner", name: "Haftalik chempion", icon: "🏆", color: "from-purple-500 to-pink-500", description: "Haftalik musobaqada 1-o'rin" },
  
  // Streak badges
  { type: "streak_3", name: "Uch kunlik seriya", icon: "🔥", color: "from-orange-400 to-red-400", description: "3 kun ketma-ket mashq" },
  { type: "streak_5", name: "Besh kunlik seriya", icon: "🔥", color: "from-orange-500 to-red-500", description: "5 kun ketma-ket mashq" },
  { type: "streak_7", name: "Haftalik seriya", icon: "🔥", color: "from-orange-500 to-red-500", description: "7 kun ketma-ket mashq" },
  { type: "streak_14", name: "Ikki haftalik seriya", icon: "⚡", color: "from-yellow-500 to-orange-500", description: "14 kun ketma-ket mashq" },
  { type: "streak_30", name: "Oylik seriya", icon: "⭐", color: "from-amber-500 to-yellow-500", description: "30 kun ketma-ket mashq" },
  { type: "best_streak_10", name: "Seriya ustasi", icon: "⚡", color: "from-blue-500 to-cyan-500", description: "10+ ketma-ket to'g'ri javob" },
  { type: "best_streak_25", name: "Super seriya", icon: "💎", color: "from-indigo-500 to-purple-500", description: "25+ ketma-ket to'g'ri javob" },
  
  // Problem solver badges
  { type: "solver_100", name: "100 masala", icon: "💯", color: "from-green-500 to-emerald-500", description: "100 ta masala yechish" },
  { type: "solver_500", name: "500 masala", icon: "🎯", color: "from-teal-500 to-green-500", description: "500 ta masala yechish" },
  { type: "solver_1000", name: "Ming masala", icon: "🏆", color: "from-yellow-500 to-orange-500", description: "1000 ta masala yechish" },
  
  // Score badges
  { type: "score_1000", name: "Ming ball", icon: "🌟", color: "from-blue-500 to-indigo-500", description: "1000 ball to'plash" },
  { type: "score_5000", name: "Besh ming ball", icon: "👑", color: "from-amber-500 to-orange-500", description: "5000 ball to'plash" },
  { type: "daily_score_500", name: "Kunlik besh yuz", icon: "⭐", color: "from-cyan-500 to-blue-500", description: "1 kunda 500+ ball" },
  { type: "daily_score_1000", name: "Kunlik ming ball", icon: "🔥", color: "from-orange-500 to-red-500", description: "1 kunda 1000+ ball" },
  
  // Accuracy badges
  { type: "accuracy_95", name: "Super aniqlik", icon: "🎯", color: "from-emerald-500 to-green-500", description: "95%+ aniqlik" },
  { type: "perfect_game", name: "Mukammal o'yin", icon: "💎", color: "from-violet-500 to-purple-500", description: "100% aniqlik, 10+ masala" },
  
  // Game badges
  { type: "first_game", name: "Birinchi qadam", icon: "🎮", color: "from-pink-500 to-rose-500", description: "Birinchi o'yinni o'ynash" },
  { type: "games_10", name: "Faol o'yinchi", icon: "🎲", color: "from-violet-500 to-purple-500", description: "10 ta o'yin o'ynash" },
  { type: "games_50", name: "Tajribali", icon: "🎖️", color: "from-slate-500 to-zinc-500", description: "50 ta o'yin o'ynash" },
];

export const UserBadges = ({ userId }: { userId?: string }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const targetUserId = userId || user?.id;
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: badges, isLoading } = useQuery({
    queryKey: ["user-badges", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", targetUserId)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!targetUserId,
  });

  // Group badges by type and count
  const badgeCounts = badges?.reduce((acc, badge) => {
    acc[badge.badge_type] = (acc[badge.badge_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const uniqueBadgeTypes = [...new Set(badges?.map((b) => b.badge_type) || [])];

  const generateShareText = () => {
    if (!badges?.length) return "";
    const count = badges.length;
    const topBadges = uniqueBadgeTypes.slice(0, 3).map((type) => {
      const def = BADGE_DEFINITIONS.find((b) => b.type === type);
      return def?.icon || "🏆";
    }).join(" ");
    return `Men IqroMax'da ${count} ta mukofot yutib oldim! ${topBadges}\n\nSiz ham sinab ko'ring: `;
  };

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareText = generateShareText();

  const handleShare = async (platform: "twitter" | "facebook" | "copy") => {
    const text = shareText;
    const url = shareUrl;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
          "_blank"
        );
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(`${text}${url}`);
          setCopiedLink(true);
          toast.success("Havoladan nusxa olindi!");
          setTimeout(() => setCopiedLink(false), 2000);
        } catch {
          toast.error("Nusxa olishda xatolik");
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">Yuklanmoqda...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-2 border-primary/20 shadow-xl bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden h-full flex flex-col card-hover-glow">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 pointer-events-none" />
      
      <CardHeader className="pb-4 relative z-10 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-b border-border/30">
        <CardTitle className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent text-base sm:text-lg md:text-xl block truncate">
                Mukofotlar va yutuqlar
              </span>
            </div>
          </div>
          {badges && badges.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 shadow-lg text-xs sm:text-sm font-bold">
                <span className="text-amber-600 dark:text-amber-400">{badges.length}</span>
                <span className="text-muted-foreground ml-1">ta</span>
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare("twitter")} className="gap-2">
                    <Twitter className="h-4 w-4 text-sky-500" />
                    Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("facebook")} className="gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("copy")} className="gap-2">
                    {copiedLink ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                    Havoladan nusxa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col relative z-10">
        {!badges?.length ? (
          <div className="text-center py-12 flex-1 flex items-center justify-center">
            <div className="w-full">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
                  <Trophy className="h-10 w-10 text-amber-500/70" />
                </div>
                {/* Floating sparkles */}
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-yellow-400/60 blur-sm animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
                <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-orange-400/60 blur-sm animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s' }} />
              </div>
              <h3 className="font-bold text-lg mb-2">Hali mukofotlar yo'q</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Musobaqalarda qatnashing va g'olib bo'lib mukofotlar yutib oling!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Badge Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 pb-6 sm:pb-8 md:pb-10">
              {uniqueBadgeTypes.map((type, index) => {
                const definition = BADGE_DEFINITIONS.find((b) => b.type === type);
                const count = badgeCounts[type] || 0;
                const latestBadge = badges?.find((b) => b.badge_type === type);

                return (
                  <div
                    key={type}
                    className="relative group cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Glow effect on hover */}
                    <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-br ${definition?.color || "from-gray-500 to-gray-600"} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`} />
                    
                    <div
                      className={`aspect-square rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br ${
                        definition?.color || "from-gray-500 to-gray-600"
                      } p-1 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-500 relative overflow-hidden`}
                    >
                      {/* Shimmer effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${definition?.color || "from-gray-500 to-gray-600"}`} />
                      
                      <div className="w-full h-full rounded-[8px] sm:rounded-lg md:rounded-xl bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center relative z-10">
                        <span className="text-2xl sm:text-3xl md:text-4xl transition-transform duration-500 group-hover:scale-110">
                          {definition?.icon || latestBadge?.badge_icon || "🏆"}
                        </span>
                        {count > 1 && (
                          <span className="text-[10px] sm:text-xs font-bold text-foreground/80 mt-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                            ×{count}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Enhanced Tooltip - Desktop - From bottom */}
                    <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-4 px-4 py-3 bg-white dark:bg-gray-800 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 transform group-hover:translate-y-1 min-w-[200px] max-w-[280px]">
                      {/* Tooltip content with proper spacing */}
                      <div className="text-center space-y-1.5">
                        <div className="text-sm font-bold text-foreground leading-tight">
                          {definition?.name || latestBadge?.badge_name}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed px-1 break-words">
                          {definition?.description || latestBadge?.description}
                        </div>
                      </div>
                      {/* Tooltip arrow - pointing up, centered */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[1px]">
                        <div className="w-3 h-3 bg-white dark:bg-gray-800 border-l border-t border-border/50 transform rotate-45 rounded-sm" />
                      </div>
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none -z-10" />
                    </div>
                    
                  </div>
                );
              })}
            </div>

            {/* Recent Badges List */}
            {badges.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <h4 className="text-sm font-bold text-foreground">Oxirgi mukofotlar</h4>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {badges.slice(0, 5).map((badge, index) => {
                    const definition = BADGE_DEFINITIONS.find((b) => b.type === badge.badge_type);
                    return (
                      <div
                        key={badge.id}
                        className="group relative flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-secondary/40 via-secondary/30 to-secondary/40 border-2 border-border/30 hover:border-primary/40 hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-primary/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Background glow on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${definition?.color || "from-gray-500 to-gray-600"} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-500`} />
                        
                        {/* Badge icon container with enhanced design */}
                        <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${definition?.color || "from-gray-500 to-gray-600"} p-1 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-110 flex-shrink-0`}>
                          {/* Shimmer effect */}
                          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${definition?.color || "from-gray-500 to-gray-600"}`} />
                          
                          {/* Inner container */}
                          <div className="w-full h-full rounded-lg sm:rounded-xl bg-card/95 backdrop-blur-sm flex items-center justify-center relative z-10">
                            <span className="text-xl sm:text-2xl transition-transform duration-500 group-hover:scale-110">
                              {definition?.icon || badge.badge_icon}
                            </span>
                          </div>
                          
                          {/* Glow ring */}
                          <div className={`absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-br ${definition?.color || "from-gray-500 to-gray-600"} opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-500 -z-10`} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 relative z-10">
                          <div className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">
                            {definition?.name || badge.badge_name}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-2 mt-0.5 line-clamp-1">
                            <span className="font-medium truncate">
                              {badge.competition_type === "daily"
                                ? "Kunlik musobaqa"
                                : badge.competition_type === "weekly"
                                ? "Haftalik musobaqa"
                                : "Yutuq"}
                            </span>
                          </div>
                        </div>
                        
                        {/* Date badge */}
                        <div className="flex flex-col items-end flex-shrink-0 relative z-10">
                          <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30 text-primary font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 whitespace-nowrap">
                            {format(new Date(badge.earned_at), "dd.MM.yy")}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* View All Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 gap-2 h-10 rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5 hover:text-primary font-semibold transition-all duration-300 text-sm sm:text-base"
                  onClick={() => navigate("/badges")}
                >
                  <span className="truncate">Barcha badge'larni ko'rish</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
