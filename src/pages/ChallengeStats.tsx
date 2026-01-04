import { useState, useEffect } from 'react';
import { PageBackground } from '@/components/layout/PageBackground';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, CalendarDays, CalendarRange, Clock, Target, 
  Flame, Star, TrendingUp, Award, Zap, Medal, Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

interface DailyChallengeResult {
  id: string;
  challenge_id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  score: number;
  is_correct: boolean;
  completion_time: number;
  created_at: string;
}

interface WeeklyChallengeResult {
  id: string;
  challenge_id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_score: number;
  correct_answers: number;
  games_played: number;
  best_time: number | null;
}

interface UserStats {
  dailyParticipation: number;
  weeklyParticipation: number;
  dailyWins: number;
  weeklyWins: number;
  totalXpFromChallenges: number;
  bestDailyRank: number;
  bestWeeklyRank: number;
}

const ChallengeStats = () => {
  const { user } = useAuth();
  const { soundEnabled, toggleSound } = useSound();
  const [loading, setLoading] = useState(true);
  const [dailyResults, setDailyResults] = useState<DailyChallengeResult[]>([]);
  const [weeklyResults, setWeeklyResults] = useState<WeeklyChallengeResult[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    dailyParticipation: 0,
    weeklyParticipation: 0,
    dailyWins: 0,
    weeklyWins: 0,
    totalXpFromChallenges: 0,
    bestDailyRank: 0,
    bestWeeklyRank: 0,
  });
  const [todayLeaderboard, setTodayLeaderboard] = useState<DailyChallengeResult[]>([]);
  const [thisWeekLeaderboard, setThisWeekLeaderboard] = useState<WeeklyChallengeResult[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch today's daily challenge leaderboard
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: todayChallenge } = await supabase
        .from('daily_challenges')
        .select('id')
        .eq('challenge_date', today)
        .single();

      if (todayChallenge) {
        const { data: todayResults } = await supabase
          .from('daily_challenge_results')
          .select('*')
          .eq('challenge_id', todayChallenge.id)
          .order('score', { ascending: false })
          .limit(20);

        if (todayResults) {
          setTodayLeaderboard(todayResults);
        }
      }

      // Fetch this week's weekly challenge leaderboard
      const now = new Date();
      const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');

      const { data: thisWeekChallenge } = await supabase
        .from('weekly_challenges')
        .select('id')
        .lte('week_start', weekEnd)
        .gte('week_end', weekStart)
        .single();

      if (thisWeekChallenge) {
        const { data: weekResults } = await supabase
          .from('weekly_challenge_results')
          .select('*')
          .eq('challenge_id', thisWeekChallenge.id)
          .order('total_score', { ascending: false })
          .limit(20);

        if (weekResults) {
          setThisWeekLeaderboard(weekResults);
        }
      }

      // Fetch user's personal stats
      if (user) {
        // Daily participation count
        const { count: dailyCount } = await supabase
          .from('daily_challenge_results')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Weekly participation count
        const { count: weeklyCount } = await supabase
          .from('weekly_challenge_results')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // User's daily results for history
        const { data: userDailyResults } = await supabase
          .from('daily_challenge_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30);

        if (userDailyResults) {
          setDailyResults(userDailyResults);
        }

        // User's weekly results for history
        const { data: userWeeklyResults } = await supabase
          .from('weekly_challenge_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (userWeeklyResults) {
          setWeeklyResults(userWeeklyResults);
        }

        setUserStats({
          dailyParticipation: dailyCount || 0,
          weeklyParticipation: weeklyCount || 0,
          dailyWins: userDailyResults?.filter(r => r.is_correct).length || 0,
          weeklyWins: 0,
          totalXpFromChallenges: (userDailyResults?.reduce((sum, r) => sum + r.score, 0) || 0) + 
            (userWeeklyResults?.reduce((sum, r) => sum + r.total_score, 0) || 0),
          bestDailyRank: 1,
          bestWeeklyRank: 1,
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
  };

  if (loading) {
    return (
      <PageBackground className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground className="flex flex-col min-h-screen">
      <Navbar soundEnabled={soundEnabled} onToggleSound={toggleSound} />

      <main className="flex-1 container px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-warning" />
              Challenge Statistikasi
            </h1>
            <p className="text-muted-foreground">Kunlik va haftalik musobaqalar natijalari</p>
          </div>

          {/* User Stats Cards */}
          {user && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <CalendarDays className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{userStats.dailyParticipation}</p>
                  <p className="text-xs text-muted-foreground">Kunlik ishtirok</p>
                </CardContent>
              </Card>
              <Card className="border-accent/20 bg-accent/5">
                <CardContent className="p-4 text-center">
                  <CalendarRange className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">{userStats.weeklyParticipation}</p>
                  <p className="text-xs text-muted-foreground">Haftalik ishtirok</p>
                </CardContent>
              </Card>
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{userStats.dailyWins}</p>
                  <p className="text-xs text-muted-foreground">To'g'ri javoblar</p>
                </CardContent>
              </Card>
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="p-4 text-center">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-warning" />
                  <p className="text-2xl font-bold">{userStats.totalXpFromChallenges.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Jami XP</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs for Daily and Weekly */}
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="daily" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Kunlik
              </TabsTrigger>
              <TabsTrigger value="weekly" className="gap-2">
                <CalendarRange className="h-4 w-4" />
                Haftalik
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-6 mt-6">
              {/* Today's Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-warning" />
                    Bugungi reyting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayLeaderboard.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Bugun hali natijalar yo'q</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {todayLeaderboard.map((result, index) => (
                        <div
                          key={result.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl transition-all",
                            result.user_id === user?.id
                              ? "bg-primary/10 border border-primary/30"
                              : "bg-secondary/50 hover:bg-secondary"
                          )}
                        >
                          <div className="w-8 flex justify-center">
                            {getRankBadge(index + 1)}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={result.avatar_url || undefined} />
                            <AvatarFallback>{result.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{result.username}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {result.completion_time.toFixed(1)}s
                              {result.is_correct && (
                                <Badge variant="secondary" className="bg-green-500/20 text-green-500 text-xs">
                                  To'g'ri
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{result.score}</p>
                            <p className="text-xs text-muted-foreground">ball</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User's Daily History */}
              {user && dailyResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      Sizning kunlik natijalari
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {dailyResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {format(new Date(result.created_at), 'dd MMM yyyy')}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {result.completion_time.toFixed(1)}s
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={result.is_correct ? "default" : "secondary"}>
                              {result.is_correct ? "To'g'ri" : "Noto'g'ri"}
                            </Badge>
                            <span className="font-bold text-primary">{result.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="weekly" className="space-y-6 mt-6">
              {/* This Week's Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-warning" />
                    Bu haftaning reytingi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {thisWeekLeaderboard.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarRange className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Bu hafta hali natijalar yo'q</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {thisWeekLeaderboard.map((result, index) => (
                        <div
                          key={result.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl transition-all",
                            result.user_id === user?.id
                              ? "bg-primary/10 border border-primary/30"
                              : "bg-secondary/50 hover:bg-secondary"
                          )}
                        >
                          <div className="w-8 flex justify-center">
                            {getRankBadge(index + 1)}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={result.avatar_url || undefined} />
                            <AvatarFallback>{result.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{result.username}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Target className="h-3 w-3" />
                              {result.games_played} o'yin • {result.correct_answers} to'g'ri
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{result.total_score.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">ball</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User's Weekly History */}
              {user && weeklyResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      Sizning haftalik natijalari
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {weeklyResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                        >
                          <div>
                            <p className="text-sm font-medium">Haftalik musobaqa</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Target className="h-3 w-3" />
                              {result.games_played} o'yin • {result.correct_answers} to'g'ri
                            </div>
                          </div>
                          <span className="font-bold text-primary text-lg">{result.total_score.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </PageBackground>
  );
};

export default ChallengeStats;
