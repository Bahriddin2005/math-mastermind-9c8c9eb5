import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { 
  BarChart3, Crown, Trophy, Target, Flame, Star, Users, Loader2
} from "lucide-react";

interface FriendStats {
  user_id: string;
  username: string;
  avatar_url: string | null;
  vip_expires_at: string | null;
  total_score: number;
  total_problems: number;
  best_streak: number;
  games_played: number;
  accuracy: number;
}

interface FriendsStatsComparisonProps {
  friendIds: string[];
}

export const FriendsStatsComparison = ({ friendIds }: FriendsStatsComparisonProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<FriendStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'radar'>('bar');

  useEffect(() => {
    if (user && friendIds.length > 0) {
      loadStats();
    }
  }, [user, friendIds]);

  const loadStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const allUserIds = [user.id, ...friendIds];

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url, vip_expires_at, total_score, total_problems_solved, best_streak')
        .in('user_id', allUserIds);

      // Get game sessions for accuracy calculation
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('user_id, correct, incorrect, score')
        .in('user_id', allUserIds);

      if (!profiles) return;

      // Calculate stats for each user
      const userStats: FriendStats[] = profiles.map(profile => {
        const userSessions = sessions?.filter(s => s.user_id === profile.user_id) || [];
        const totalCorrect = userSessions.reduce((sum, s) => sum + (s.correct || 0), 0);
        const totalIncorrect = userSessions.reduce((sum, s) => sum + (s.incorrect || 0), 0);
        const totalAttempts = totalCorrect + totalIncorrect;
        const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

        return {
          user_id: profile.user_id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          vip_expires_at: profile.vip_expires_at,
          total_score: profile.total_score || 0,
          total_problems: profile.total_problems_solved || 0,
          best_streak: profile.best_streak || 0,
          games_played: userSessions.length,
          accuracy,
        };
      });

      // Sort by total score
      userStats.sort((a, b) => b.total_score - a.total_score);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const isVip = (vipExpires: string | null | undefined) => {
    return vipExpires && new Date(vipExpires) > new Date();
  };

  const barChartData = stats.map(s => ({
    name: s.username.length > 8 ? s.username.substring(0, 8) + '...' : s.username,
    'Ball': s.total_score,
    'Masalalar': s.total_problems,
    'Aniqlik': s.accuracy,
  }));

  const radarChartData = [
    { subject: 'Ball', ...Object.fromEntries(stats.map(s => [s.username, Math.min(s.total_score / 100, 100)])) },
    { subject: 'Masalalar', ...Object.fromEntries(stats.map(s => [s.username, Math.min(s.total_problems / 10, 100)])) },
    { subject: 'Seriya', ...Object.fromEntries(stats.map(s => [s.username, Math.min(s.best_streak * 5, 100)])) },
    { subject: "O'yinlar", ...Object.fromEntries(stats.map(s => [s.username, Math.min(s.games_played * 2, 100)])) },
    { subject: 'Aniqlik', ...Object.fromEntries(stats.map(s => [s.username, s.accuracy])) },
  ];

  const colors = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (stats.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>Taqqoslash uchun do'stlar yo'q</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Statistika Taqqoslash
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              Ustunlar
            </Button>
            <Button
              variant={chartType === 'radar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('radar')}
            >
              Radar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {stats.map((stat, index) => (
            <div 
              key={stat.user_id} 
              className={`p-3 rounded-lg text-center ${
                stat.user_id === user?.id 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'bg-secondary/30'
              }`}
            >
              <div className="relative inline-block mb-2">
                <Avatar className="h-12 w-12 mx-auto border-2" style={{ borderColor: colors[index % colors.length] }}>
                  <AvatarImage src={stat.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10">
                    {stat.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {index === 0 && (
                  <Trophy className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
                )}
              </div>
              <div className="flex items-center justify-center gap-1">
                <p className="text-sm font-medium truncate">{stat.username}</p>
                {isVip(stat.vip_expires_at) && (
                  <Crown className="h-3 w-3 text-amber-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.total_score} ball</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-[300px] w-full">
          {chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="Ball" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Masalalar" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Aniqlik" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="subject" className="text-xs" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                {stats.map((stat, index) => (
                  <Radar
                    key={stat.user_id}
                    name={stat.username}
                    dataKey={stat.username}
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.2}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stats table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">Foydalanuvchi</th>
                <th className="text-right py-2 px-2">
                  <div className="flex items-center justify-end gap-1">
                    <Star className="h-3 w-3" /> Ball
                  </div>
                </th>
                <th className="text-right py-2 px-2">
                  <div className="flex items-center justify-end gap-1">
                    <Target className="h-3 w-3" /> Masala
                  </div>
                </th>
                <th className="text-right py-2 px-2">
                  <div className="flex items-center justify-end gap-1">
                    <Flame className="h-3 w-3" /> Seriya
                  </div>
                </th>
                <th className="text-right py-2 px-2">Aniqlik</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, index) => (
                <tr 
                  key={stat.user_id} 
                  className={`border-b ${stat.user_id === user?.id ? 'bg-primary/5' : ''}`}
                >
                  <td className="py-2 px-2 font-medium">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={stat.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10">
                          {stat.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className={stat.user_id === user?.id ? 'font-medium' : ''}>
                        {stat.username}
                        {stat.user_id === user?.id && ' (siz)'}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right font-medium">{stat.total_score}</td>
                  <td className="py-2 px-2 text-right">{stat.total_problems}</td>
                  <td className="py-2 px-2 text-right">{stat.best_streak}</td>
                  <td className="py-2 px-2 text-right">
                    <Badge variant={stat.accuracy >= 80 ? 'default' : 'secondary'}>
                      {stat.accuracy}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendsStatsComparison;
