import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Ghost, Trophy, Clock, Swords, TrendingUp, Medal, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BattleResult {
  id: string;
  ghost_username: string;
  user_score: number;
  ghost_score: number;
  user_correct: number;
  ghost_correct: number;
  user_time: number;
  ghost_time: number;
  is_winner: boolean;
  created_at: string;
}

interface BattleStats {
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  avgScore: number;
  bestScore: number;
  avgTime: number;
}

export const GhostBattleStats = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<BattleResult[]>([]);
  const [stats, setStats] = useState<BattleStats>({
    totalBattles: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    avgScore: 0,
    bestScore: 0,
    avgTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('ghost_battle_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (data && data.length > 0) {
          setResults(data);
          
          // Calculate stats
          const wins = data.filter(r => r.is_winner).length;
          const totalScore = data.reduce((sum, r) => sum + r.user_score, 0);
          const totalTime = data.reduce((sum, r) => sum + Number(r.user_time), 0);
          const bestScore = Math.max(...data.map(r => r.user_score));
          
          setStats({
            totalBattles: data.length,
            wins,
            losses: data.length - wins,
            winRate: Math.round((wins / data.length) * 100),
            avgScore: Math.round(totalScore / data.length),
            bestScore,
            avgTime: Math.round((totalTime / data.length) * 10) / 10,
          });
        }
      } catch (error) {
        console.error('Error loading battle stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="border-purple-500/20">
        <CardContent className="py-8 text-center">
          <Ghost className="h-12 w-12 mx-auto mb-2 text-purple-500/50" />
          <p className="text-muted-foreground">Hali Ghost Battle o'yinlari yo'q</p>
          <p className="text-xs text-muted-foreground mt-1">
            Ghost tab'dan birinchi jangingizni boshlang!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
          <CardContent className="p-3 text-center">
            <Swords className="h-5 w-5 mx-auto text-purple-500 mb-1" />
            <div className="text-2xl font-bold text-purple-500">{stats.totalBattles}</div>
            <div className="text-xs text-muted-foreground">Janglar</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardContent className="p-3 text-center">
            <Trophy className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <div className="text-2xl font-bold text-green-500">{stats.wins}</div>
            <div className="text-xs text-muted-foreground">G'alaba</div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <div className="text-2xl font-bold text-blue-500">{stats.winRate}%</div>
            <div className="text-xs text-muted-foreground">G'alaba %</div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
          <CardContent className="p-3 text-center">
            <Medal className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <div className="text-2xl font-bold text-amber-500">{stats.bestScore}</div>
            <div className="text-xs text-muted-foreground">Eng yaxshi</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Battles */}
      <Card className="border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Ghost className="h-5 w-5 text-purple-500" />
            So'nggi janglar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {results.slice(0, 5).map((result) => (
            <div
              key={result.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                result.is_winner
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-red-500/20 bg-red-500/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  result.is_winner ? "bg-green-500/20" : "bg-red-500/20"
                )}>
                  {result.is_winner ? (
                    <Trophy className="h-4 w-4 text-green-500" />
                  ) : (
                    <Target className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <Ghost className="h-3 w-3 text-purple-500" />
                    {result.ghost_username}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(result.created_at), 'dd.MM.yyyy HH:mm')}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold">
                  <span className={result.is_winner ? "text-green-500" : "text-foreground"}>
                    {result.user_score}
                  </span>
                  <span className="text-muted-foreground mx-1">:</span>
                  <span className="text-purple-500">{result.ghost_score}</span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                  <Clock className="h-3 w-3" />
                  {Number(result.user_time).toFixed(1)}s
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GhostBattleStats;