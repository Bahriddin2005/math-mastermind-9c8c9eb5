import { useState, useEffect } from 'react';
import { PageBackground } from '@/components/layout/PageBackground';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSound } from '@/hooks/useSound';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  Medal, 
  Crown,
  Zap,
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  Brain,
  Rocket,
  Filter
} from 'lucide-react';

type AchievementType = 'all' | 'problems' | 'streak' | 'score' | 'level' | 'xp';

interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
  type: Exclude<AchievementType, 'all'>;
  icon: React.ReactNode;
  color: string;
}

const achievements: Achievement[] = [
  // Problems achievements
  { id: 'first10', name: 'Birinchi qadam', description: '10 ta misol yechildi!', requirement: 10, type: 'problems', icon: <Target className="h-6 w-6" />, color: 'from-blue-500 to-cyan-500' },
  { id: 'solver50', name: "Faol o'quvchi", description: '50 ta misol yechildi!', requirement: 50, type: 'problems', icon: <Zap className="h-6 w-6" />, color: 'from-green-500 to-emerald-500' },
  { id: 'solver100', name: 'Yuz misol', description: '100 ta misol yechildi!', requirement: 100, type: 'problems', icon: <Star className="h-6 w-6" />, color: 'from-yellow-500 to-amber-500' },
  { id: 'solver500', name: 'Matematik', description: '500 ta misol yechildi!', requirement: 500, type: 'problems', icon: <Brain className="h-6 w-6" />, color: 'from-purple-500 to-violet-500' },
  { id: 'solver1000', name: 'Usta', description: '1000 ta misol yechildi!', requirement: 1000, type: 'problems', icon: <Crown className="h-6 w-6" />, color: 'from-orange-500 to-red-500' },
  
  // Streak achievements
  { id: 'streak5', name: "Boshlang'ich seriya", description: "5 ta ketma-ket to'g'ri!", requirement: 5, type: 'streak', icon: <Flame className="h-6 w-6" />, color: 'from-orange-400 to-orange-600' },
  { id: 'streak10', name: "O't seriyasi", description: "10 ta ketma-ket to'g'ri!", requirement: 10, type: 'streak', icon: <Flame className="h-6 w-6" />, color: 'from-red-400 to-red-600' },
  { id: 'streak25', name: 'Ajoyib seriya', description: "25 ta ketma-ket to'g'ri!", requirement: 25, type: 'streak', icon: <Rocket className="h-6 w-6" />, color: 'from-pink-500 to-rose-500' },
  { id: 'streak50', name: 'Legenda', description: "50 ta ketma-ket to'g'ri!", requirement: 50, type: 'streak', icon: <Award className="h-6 w-6" />, color: 'from-fuchsia-500 to-purple-600' },
  
  // Score achievements
  { id: 'score100', name: 'Yuz ball', description: "100 ball to'plandi!", requirement: 100, type: 'score', icon: <Trophy className="h-6 w-6" />, color: 'from-amber-400 to-yellow-500' },
  { id: 'score500', name: 'Yuqori ball', description: "500 ball to'plandi!", requirement: 500, type: 'score', icon: <Trophy className="h-6 w-6" />, color: 'from-amber-500 to-orange-500' },
  { id: 'score1000', name: 'Ming ball', description: "1000 ball to'plandi!", requirement: 1000, type: 'score', icon: <Trophy className="h-6 w-6" />, color: 'from-amber-600 to-red-500' },

  // Level achievements (NEW)
  { id: 'level5', name: 'Yangi boshlovchi', description: '5-levelga yeting!', requirement: 5, type: 'level', icon: <Star className="h-6 w-6" />, color: 'from-blue-400 to-blue-600' },
  { id: 'level10', name: 'Rivojlanuvchi', description: '10-levelga yeting!', requirement: 10, type: 'level', icon: <Star className="h-6 w-6" />, color: 'from-purple-400 to-purple-600' },
  { id: 'level25', name: 'Tajribali', description: '25-levelga yeting!', requirement: 25, type: 'level', icon: <Crown className="h-6 w-6" />, color: 'from-amber-400 to-amber-600' },
  { id: 'level50', name: 'Professional', description: '50-levelga yeting!', requirement: 50, type: 'level', icon: <Crown className="h-6 w-6" />, color: 'from-pink-400 to-purple-600' },

  // XP achievements (NEW)
  { id: 'xp1000', name: 'Birinchi ming', description: "1,000 XP to'plang!", requirement: 1000, type: 'xp', icon: <Zap className="h-6 w-6" />, color: 'from-emerald-400 to-emerald-600' },
  { id: 'xp5000', name: "XP yig'uvchi", description: "5,000 XP to'plang!", requirement: 5000, type: 'xp', icon: <Zap className="h-6 w-6" />, color: 'from-cyan-400 to-cyan-600' },
  { id: 'xp10000', name: 'XP ustasi', description: "10,000 XP to'plang!", requirement: 10000, type: 'xp', icon: <Sparkles className="h-6 w-6" />, color: 'from-violet-400 to-violet-600' },
  { id: 'xp50000', name: 'XP imperatori', description: "50,000 XP to'plang!", requirement: 50000, type: 'xp', icon: <Crown className="h-6 w-6" />, color: 'from-rose-400 to-orange-600' },
];

const filterOptions: { type: AchievementType; label: string; icon: React.ReactNode }[] = [
  { type: 'all', label: 'Barchasi', icon: <Filter className="h-4 w-4" /> },
  { type: 'problems', label: 'Misollar', icon: <Target className="h-4 w-4" /> },
  { type: 'streak', label: 'Seriya', icon: <Flame className="h-4 w-4" /> },
  { type: 'score', label: 'Ball', icon: <Trophy className="h-4 w-4" /> },
  { type: 'level', label: 'Level', icon: <Star className="h-4 w-4" /> },
  { type: 'xp', label: 'XP', icon: <Zap className="h-4 w-4" /> },
];

const Achievements = () => {
  const { user } = useAuth();
  const { soundEnabled, toggleSound } = useSound();
  const [profile, setProfile] = useState<{
    total_problems_solved: number;
    best_streak: number;
    total_score: number;
  } | null>(null);
  const [gamification, setGamification] = useState<{
    level: number;
    total_xp: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<AchievementType>('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const [profileRes, gamificationRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('total_problems_solved, best_streak, total_score')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('user_gamification')
          .select('level, total_xp')
          .eq('user_id', user.id)
          .single()
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
      }
      if (gamificationRes.data) {
        setGamification(gamificationRes.data);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const getCurrentValue = (type: Exclude<AchievementType, 'all'>): number => {
    switch (type) {
      case 'problems': return profile?.total_problems_solved || 0;
      case 'streak': return profile?.best_streak || 0;
      case 'score': return profile?.total_score || 0;
      case 'level': return gamification?.level || 1;
      case 'xp': return gamification?.total_xp || 0;
    }
  };

  const getProgress = (achievement: Achievement): number => {
    const current = getCurrentValue(achievement.type);
    return Math.min((current / achievement.requirement) * 100, 100);
  };

  const isUnlocked = (achievement: Achievement): boolean => {
    return getCurrentValue(achievement.type) >= achievement.requirement;
  };

  const filteredAchievements = activeFilter === 'all' 
    ? achievements 
    : achievements.filter(a => a.type === activeFilter);

  const unlockedCount = achievements.filter(a => isUnlocked(a)).length;
  const filteredUnlockedCount = filteredAchievements.filter(a => isUnlocked(a)).length;

  const groupedAchievements = {
    problems: achievements.filter(a => a.type === 'problems'),
    streak: achievements.filter(a => a.type === 'streak'),
    score: achievements.filter(a => a.type === 'score'),
    level: achievements.filter(a => a.type === 'level'),
    xp: achievements.filter(a => a.type === 'xp'),
  };

  return (
    <PageBackground className="flex flex-col min-h-screen">
      <Navbar soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      
      <main className="flex-1 container px-3 sm:px-6 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 animate-fade-in">
            <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 mb-2">
              <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              <span className="text-gradient-primary">Yutuqlar</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
              O'z yutuqlaringizni kuzating va yangi maqsadlarga erishing
            </p>
          </div>

          {/* Stats Summary */}
          <Card className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-lg border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="text-center p-3 rounded-xl bg-primary/10">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{unlockedCount}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Ochilgan</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-2xl sm:text-3xl font-bold">{achievements.length - unlockedCount}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Qolgan</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-500/10">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-500">{profile?.total_problems_solved || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Misollar</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-orange-500/10">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-500">{profile?.best_streak || 0}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Eng yaxshi seriya</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-purple-500/10">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-500">Lv.{gamification?.level || 1}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Level</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-500/10">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-500">{(gamification?.total_xp || 0).toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Jami XP</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            {filterOptions.map((option) => (
              <Button
                key={option.type}
                variant={activeFilter === option.type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(option.type)}
                className={cn(
                  'gap-1.5 transition-all',
                  activeFilter === option.type && 'shadow-lg'
                )}
              >
                {option.icon}
                <span className="hidden sm:inline">{option.label}</span>
                {option.type !== 'all' && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'ml-1 h-5 min-w-5 px-1 text-xs',
                      activeFilter === option.type && 'bg-primary-foreground/20 text-primary-foreground'
                    )}
                  >
                    {groupedAchievements[option.type as keyof typeof groupedAchievements]?.filter(a => isUnlocked(a)).length || 0}/
                    {groupedAchievements[option.type as keyof typeof groupedAchievements]?.length || 0}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Filtered Results Info */}
          {activeFilter !== 'all' && (
            <div className="text-center text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredUnlockedCount}</span> / {filteredAchievements.length} yutuq ochilgan
            </div>
          )}

          {/* Achievement Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {filteredAchievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  progress={getProgress(achievement)}
                  currentValue={getCurrentValue(achievement.type)}
                  isUnlocked={isUnlocked(achievement)}
                  delay={index * 50}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredAchievements.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Bu kategoriyada yutuqlar topilmadi
            </div>
          )}
        </div>
      </main>
    </PageBackground>
  );
};

interface AchievementCardProps {
  achievement: Achievement;
  progress: number;
  currentValue: number;
  isUnlocked: boolean;
  delay?: number;
}

const AchievementCard = ({ achievement, progress, currentValue, isUnlocked, delay = 0 }: AchievementCardProps) => {
  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all duration-300 opacity-0 animate-slide-up',
        isUnlocked 
          ? 'bg-gradient-to-br from-card to-card/80 border-primary/30 shadow-lg' 
          : 'bg-card/50 border-border/30 opacity-80'
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={cn(
            'relative p-3 sm:p-4 rounded-xl transition-transform duration-300',
            isUnlocked 
              ? `bg-gradient-to-br ${achievement.color} text-white shadow-lg hover:scale-110` 
              : 'bg-muted text-muted-foreground'
          )}>
            {achievement.icon}
            {isUnlocked && (
              <div className="absolute -top-1 -right-1">
                <CheckCircle2 className="h-4 w-4 text-white bg-green-500 rounded-full" />
              </div>
            )}
            {!isUnlocked && (
              <div className="absolute -top-1 -right-1">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                'font-semibold text-sm sm:text-base',
                isUnlocked ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {achievement.name}
              </h3>
              {isUnlocked && (
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              )}
              <Badge 
                variant="outline" 
                className={cn(
                  'ml-auto text-xs',
                  achievement.type === 'problems' && 'border-blue-500/50 text-blue-500',
                  achievement.type === 'streak' && 'border-orange-500/50 text-orange-500',
                  achievement.type === 'score' && 'border-amber-500/50 text-amber-500',
                  achievement.type === 'level' && 'border-purple-500/50 text-purple-500',
                  achievement.type === 'xp' && 'border-emerald-500/50 text-emerald-500',
                )}
              >
                {achievement.type === 'problems' && 'Misol'}
                {achievement.type === 'streak' && 'Seriya'}
                {achievement.type === 'score' && 'Ball'}
                {achievement.type === 'level' && 'Level'}
                {achievement.type === 'xp' && 'XP'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              {achievement.description}
            </p>
            
            {/* Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {currentValue.toLocaleString()} / {achievement.requirement.toLocaleString()}
                </span>
                <span className={isUnlocked ? 'text-primary font-medium' : 'text-muted-foreground'}>
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress 
                value={progress} 
                className={cn('h-2', isUnlocked ? '' : 'opacity-50')}
              />
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Unlocked glow effect */}
      {isUnlocked && (
        <div className={`absolute inset-0 bg-gradient-to-r ${achievement.color} opacity-5 pointer-events-none`} />
      )}
    </Card>
  );
};

export default Achievements;