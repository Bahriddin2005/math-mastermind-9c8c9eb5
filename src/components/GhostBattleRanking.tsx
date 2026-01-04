import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Ghost, Trophy, Medal, Crown, Star, Calendar, TrendingUp, Gift, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface RankingPlayer {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_battles: number;
  wins: number;
  win_rate: number;
  total_score: number;
  best_score: number;
}

interface Reward {
  rank: number;
  coins: number;
  xp: number;
  badge: string;
}

const WEEKLY_REWARDS: Reward[] = [
  { rank: 1, coins: 500, xp: 1000, badge: '🥇 Ghost Hunter' },
  { rank: 2, coins: 300, xp: 600, badge: '🥈 Ghost Chaser' },
  { rank: 3, coins: 200, xp: 400, badge: '🥉 Ghost Fighter' },
  { rank: 4, coins: 100, xp: 200, badge: '' },
  { rank: 5, coins: 50, xp: 100, badge: '' },
];

const MONTHLY_REWARDS: Reward[] = [
  { rank: 1, coins: 2000, xp: 5000, badge: '👻 Ghost Master' },
  { rank: 2, coins: 1200, xp: 3000, badge: '⚔️ Ghost Slayer' },
  { rank: 3, coins: 800, xp: 2000, badge: '🏆 Ghost Champion' },
  { rank: 4, coins: 400, xp: 1000, badge: '' },
  { rank: 5, coins: 200, xp: 500, badge: '' },
];

export const GhostBattleRanking = () => {
  const { user } = useAuth();
  const [weeklyRanking, setWeeklyRanking] = useState<RankingPlayer[]>([]);
  const [monthlyRanking, setMonthlyRanking] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userWeeklyRank, setUserWeeklyRank] = useState<number | null>(null);
  const [userMonthlyRank, setUserMonthlyRank] = useState<number | null>(null);

  useEffect(() => {
    const loadRankings = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        // Weekly ranking
        const { data: weeklyData } = await supabase
          .from('ghost_battle_results')
          .select('user_id, user_score, is_winner')
          .gte('created_at', weekStart.toISOString())
          .lte('created_at', weekEnd.toISOString());

        // Monthly ranking
        const { data: monthlyData } = await supabase
          .from('ghost_battle_results')
          .select('user_id, user_score, is_winner')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        // Process weekly data
        const weeklyStats = processRankingData(weeklyData || []);
        const monthlyStats = processRankingData(monthlyData || []);

        // Get profiles for users
        const allUserIds = [...new Set([
          ...weeklyStats.map(s => s.user_id),
          ...monthlyStats.map(s => s.user_id)
        ])];

        if (allUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, username, avatar_url')
            .in('user_id', allUserIds);

          const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

          const weeklyWithProfiles = weeklyStats.map(s => ({
            ...s,
            username: profileMap.get(s.user_id)?.username || 'O\'yinchi',
            avatar_url: profileMap.get(s.user_id)?.avatar_url || null,
          }));

          const monthlyWithProfiles = monthlyStats.map(s => ({
            ...s,
            username: profileMap.get(s.user_id)?.username || 'O\'yinchi',
            avatar_url: profileMap.get(s.user_id)?.avatar_url || null,
          }));

          setWeeklyRanking(weeklyWithProfiles);
          setMonthlyRanking(monthlyWithProfiles);

          // Find user's rank
          if (user) {
            const weeklyIdx = weeklyWithProfiles.findIndex(p => p.user_id === user.id);
            const monthlyIdx = monthlyWithProfiles.findIndex(p => p.user_id === user.id);
            setUserWeeklyRank(weeklyIdx >= 0 ? weeklyIdx + 1 : null);
            setUserMonthlyRank(monthlyIdx >= 0 ? monthlyIdx + 1 : null);
          }
        }
      } catch (error) {
        console.error('Error loading rankings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRankings();
  }, [user]);

  const processRankingData = (data: any[]): Omit<RankingPlayer, 'username' | 'avatar_url'>[] => {
    const userStats = new Map<string, { battles: number; wins: number; totalScore: number; bestScore: number }>();

    data.forEach(row => {
      const existing = userStats.get(row.user_id) || { battles: 0, wins: 0, totalScore: 0, bestScore: 0 };
      userStats.set(row.user_id, {
        battles: existing.battles + 1,
        wins: existing.wins + (row.is_winner ? 1 : 0),
        totalScore: existing.totalScore + row.user_score,
        bestScore: Math.max(existing.bestScore, row.user_score),
      });
    });

    return Array.from(userStats.entries())
      .map(([user_id, stats]) => ({
        user_id,
        total_battles: stats.battles,
        wins: stats.wins,
        win_rate: Math.round((stats.wins / stats.battles) * 100),
        total_score: stats.totalScore,
        best_score: stats.bestScore,
      }))
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 20);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-700/20 to-orange-700/20 border-amber-700/30';
    return 'bg-card/50 border-border/50';
  };

  const RankingList = ({ 
    ranking, 
    rewards, 
    userRank 
  }: { 
    ranking: RankingPlayer[]; 
    rewards: Reward[];
    userRank: number | null;
  }) => (
    <div className="space-y-2">
      {ranking.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Ghost className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Hali natijalar yo'q</p>
        </div>
      ) : (
        ranking.map((player, index) => {
          const rank = index + 1;
          const reward = rewards.find(r => r.rank === rank);
          const isCurrentUser = player.user_id === user?.id;

          return (
            <div
              key={player.user_id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                getRankBg(rank),
                isCurrentUser && "ring-2 ring-primary"
              )}
            >
              {/* Rank */}
              <div className="w-8 h-8 flex items-center justify-center">
                {getRankIcon(rank)}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                <AvatarImage src={player.avatar_url || ''} />
                <AvatarFallback className="bg-purple-500/20">
                  {player.username[0]}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {player.username}
                    {isCurrentUser && <span className="text-primary ml-1">(siz)</span>}
                  </span>
                  {rank <= 3 && (
                    <Flame className={cn(
                      "h-4 w-4",
                      rank === 1 ? "text-amber-500" :
                      rank === 2 ? "text-gray-400" :
                      "text-amber-700"
                    )} />
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{player.wins}/{player.total_battles} g'alaba</span>
                  <span>•</span>
                  <span>{player.win_rate}%</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="font-bold text-purple-500">{player.total_score}</div>
                <div className="text-xs text-muted-foreground">ball</div>
              </div>

              {/* Reward preview */}
              {reward && (
                <div className="hidden sm:flex items-center gap-1 text-xs">
                  <Gift className="h-3 w-3 text-amber-500" />
                  <span className="text-amber-500">+{reward.coins}</span>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* User rank if not in top */}
      {userRank && userRank > ranking.length && (
        <div className="pt-4 border-t border-dashed">
          <div className="text-center text-muted-foreground text-sm">
            Sizning o'rningiz: <span className="font-bold text-primary">{userRank}</span>
          </div>
        </div>
      )}
    </div>
  );

  const RewardsInfo = ({ rewards, type }: { rewards: Reward[]; type: 'weekly' | 'monthly' }) => (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Gift className="h-4 w-4 text-amber-500" />
          {type === 'weekly' ? 'Haftalik' : 'Oylik'} Mukofotlar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rewards.slice(0, 3).map((reward) => (
          <div key={reward.rank} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getRankIcon(reward.rank)}
              <span className="text-muted-foreground">#{reward.rank}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-500">🪙 {reward.coins}</span>
              <span className="text-purple-500">⚡ {reward.xp} XP</span>
              {reward.badge && (
                <Badge variant="secondary" className="text-xs">
                  {reward.badge}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-amber-500" />
            Ghost Battle Reytingi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="weekly" className="flex-1 gap-1">
                <Calendar className="h-4 w-4" />
                Haftalik
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex-1 gap-1">
                <TrendingUp className="h-4 w-4" />
                Oylik
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-4">
              <RewardsInfo rewards={WEEKLY_REWARDS} type="weekly" />
              <RankingList 
                ranking={weeklyRanking} 
                rewards={WEEKLY_REWARDS}
                userRank={userWeeklyRank}
              />
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <RewardsInfo rewards={MONTHLY_REWARDS} type="monthly" />
              <RankingList 
                ranking={monthlyRanking} 
                rewards={MONTHLY_REWARDS}
                userRank={userMonthlyRank}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GhostBattleRanking;