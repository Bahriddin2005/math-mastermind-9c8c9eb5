import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { 
  Trophy, 
  Lock,
  Sparkles,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Changed from LucideIcon to string (emoji)
  color: string; // Gradient color for border
  bgColor: string;
  glowColor: string;
  requirement: number;
  type: 'problems' | 'streak' | 'score' | 'games';
}

const achievements: Achievement[] = [
  // Problems solved
  { id: 'first10', name: 'Birinchi qadam', description: '10 ta misol yech', icon: '🎯', color: 'from-primary to-primary/80', bgColor: 'bg-primary/10', glowColor: 'shadow-glow', requirement: 10, type: 'problems' },
  { id: 'solver50', name: 'Faol o\'quvchi', description: '50 ta misol yech', icon: '⚡', color: 'from-accent to-accent/80', bgColor: 'bg-accent/10', glowColor: 'shadow-accent-glow', requirement: 50, type: 'problems' },
  { id: 'solver100', name: 'Yuz misol', description: '100 ta misol yech', icon: '⭐', color: 'from-warning to-warning/80', bgColor: 'bg-warning/10', glowColor: '', requirement: 100, type: 'problems' },
  { id: 'solver500', name: 'Matematik', description: '500 ta misol yech', icon: '🧠', color: 'from-success to-success/80', bgColor: 'bg-success/10', glowColor: '', requirement: 500, type: 'problems' },
  { id: 'solver1000', name: 'Usta', description: '1000 ta misol yech', icon: '👑', color: 'from-primary to-primary-glow', bgColor: 'gradient-primary', glowColor: 'shadow-glow', requirement: 1000, type: 'problems' },
  
  // Streak
  { id: 'streak5', name: 'Boshlang\'ich seriya', description: '5 ta ketma-ket to\'g\'ri', icon: '🔥', color: 'from-accent to-accent/80', bgColor: 'bg-accent/10', glowColor: '', requirement: 5, type: 'streak' },
  { id: 'streak10', name: 'O\'t seriyasi', description: '10 ta ketma-ket to\'g\'ri', icon: '🔥', color: 'from-warning to-warning/80', bgColor: 'bg-warning/10', glowColor: '', requirement: 10, type: 'streak' },
  { id: 'streak25', name: 'Ajoyib seriya', description: '25 ta ketma-ket to\'g\'ri', icon: '🚀', color: 'from-success to-success/80', bgColor: 'bg-success/10', glowColor: '', requirement: 25, type: 'streak' },
  { id: 'streak50', name: 'Legenda', description: '50 ta ketma-ket to\'g\'ri', icon: '👑', color: 'from-primary to-primary-glow', bgColor: 'gradient-primary', glowColor: 'shadow-glow', requirement: 50, type: 'streak' },
  
  // Score
  { id: 'score100', name: 'Yuz ball', description: '100 ball to\'pla', icon: '🏅', color: 'from-primary to-primary/80', bgColor: 'bg-primary/10', glowColor: '', requirement: 100, type: 'score' },
  { id: 'score500', name: 'Yuqori ball', description: '500 ball to\'pla', icon: '🏆', color: 'from-accent to-accent/80', bgColor: 'bg-accent/10', glowColor: '', requirement: 500, type: 'score' },
  { id: 'score1000', name: 'Ming ball', description: '1000 ball to\'pla', icon: '🌟', color: 'from-warning to-warning/80', bgColor: 'bg-warning/20', glowColor: '', requirement: 1000, type: 'score' },
];

interface AchievementsProps {
  totalProblems: number;
  bestStreak: number;
  totalScore: number;
  totalGames: number;
}

export const Achievements = ({
  totalProblems,
  bestStreak,
  totalScore,
  totalGames,
}: AchievementsProps) => {
  const checkAchievement = (achievement: Achievement): boolean => {
    switch (achievement.type) {
      case 'problems':
        return totalProblems >= achievement.requirement;
      case 'streak':
        return bestStreak >= achievement.requirement;
      case 'score':
        return totalScore >= achievement.requirement;
      case 'games':
        return totalGames >= achievement.requirement;
      default:
        return false;
    }
  };

  const getProgress = (achievement: Achievement): number => {
    let current = 0;
    switch (achievement.type) {
      case 'problems':
        current = totalProblems;
        break;
      case 'streak':
        current = bestStreak;
        break;
      case 'score':
        current = totalScore;
        break;
      case 'games':
        current = totalGames;
        break;
    }
    return Math.min((current / achievement.requirement) * 100, 100);
  };

  const earnedCount = achievements.filter(a => checkAchievement(a)).length;

  return (
    <Card className="border-2 border-primary/20 shadow-xl overflow-hidden opacity-0 animate-slide-up bg-gradient-to-br from-card via-card to-primary/5" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-warning/5 via-accent/5 to-warning/5 pointer-events-none" />
      
      <CardHeader className="pb-4 relative z-10 bg-gradient-to-r from-warning/10 via-accent/5 to-transparent border-b border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-warning/20 to-amber-500/20 flex items-center justify-center shadow-lg shadow-warning/20">
              <Trophy className="h-6 w-6 text-warning" />
            </div>
            <div>
              <span className="text-xl font-bold text-warning">Yutuqlar</span>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                Mukofotlarni yig'ing va darajangizni oshiring
              </p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-warning/20 to-amber-500/20 border border-warning/30">
            <Sparkles className="h-5 w-5 text-warning animate-pulse" />
            <span className="text-base font-bold text-foreground">
              {earnedCount}
              <span className="text-muted-foreground font-normal">/{achievements.length}</span>
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 space-y-2">
          <div className="relative h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-warning via-amber-500 to-warning transition-all duration-1000 shadow-lg shadow-warning/50"
              style={{ width: `${(earnedCount / achievements.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold text-warning">{Math.round((earnedCount / achievements.length) * 100)}% bajarildi</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 relative z-10">
        <AchievementGrid 
          achievements={achievements}
          checkAchievement={checkAchievement}
          getProgress={getProgress}
        />
      </CardContent>
    </Card>
  );
};

interface AchievementGridProps {
  achievements: Achievement[];
  checkAchievement: (a: Achievement) => boolean;
  getProgress: (a: Achievement) => number;
}

const AchievementGrid = ({ achievements, checkAchievement, getProgress }: AchievementGridProps) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<number>(0);
  const [isEarnedSelected, setIsEarnedSelected] = useState<boolean>(false);

  const handleSelect = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setSelectedProgress(getProgress(achievement));
    setIsEarnedSelected(checkAchievement(achievement));
  };

  return (
    <>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4">
        {achievements.map((achievement, index) => {
          const isEarned = checkAchievement(achievement);
          const progress = getProgress(achievement);
          
          return (
            <div
              key={achievement.id}
              className="relative group opacity-0 animate-slide-up"
              style={{ animationDelay: `${400 + index * 30}ms`, animationFillMode: 'forwards' }}
              onClick={() => handleSelect(achievement)}
              title={achievement.name}
            >
              {/* Glow effect for earned achievements */}
              {isEarned && (
                <>
                  <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${achievement.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`} />
                  <div className={`absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-br ${achievement.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-20`} />
                </>
              )}
              
              <div
                className={cn(
                  'relative aspect-square rounded-xl sm:rounded-2xl transition-all duration-500 cursor-pointer active:scale-95 overflow-hidden',
                  isEarned
                    ? 'shadow-xl hover:shadow-2xl hover:scale-105'
                    : 'bg-secondary/40 border-2 border-dashed border-border/50 grayscale opacity-70 hover:opacity-90 hover:scale-105'
                )}
              >
                {/* Earned badge with gradient border */}
                {isEarned ? (
                  <div className={cn(
                    'relative w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br p-0.5',
                    achievement.color
                  )}>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    {/* Inner container */}
                    <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-card/95 backdrop-blur-sm flex items-center justify-center relative z-10">
                      <span className="text-3xl sm:text-4xl md:text-5xl transition-transform duration-500 group-hover:scale-110">
                        {achievement.icon}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Locked badge */}
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                      <span className="text-3xl sm:text-4xl md:text-5xl opacity-50">
                        {achievement.icon}
                      </span>
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 absolute -bottom-1 -right-1 text-muted-foreground bg-background rounded-full p-0.5 shadow-sm" />
                      
                      {/* Progress indicator for locked */}
                      {progress > 0 && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="h-1.5 bg-secondary/80 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-full transition-all duration-500 shadow-sm"
                              style={{ width: `${progress}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {/* Desktop Tooltip - hidden on mobile */}
              <div className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-popover/95 backdrop-blur-sm border-2 border-border rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 transform group-hover:-translate-y-1 min-w-[160px]">
                <div className="text-xs font-bold mb-1 flex items-center gap-2">
                  <span className="text-lg">{achievement.icon}</span>
                  <span className="text-foreground">{achievement.name}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {achievement.description}
                </div>
                {!isEarned && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Jarayon</span>
                      <span className="font-semibold text-primary">{Math.round(progress)}%</span>
                    </div>
                  </div>
                )}
                {isEarned && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1 text-success">
                    <Sparkles className="h-3 w-3" />
                    <span className="font-semibold text-[10px] text-success">Qo'lga kiritildi!</span>
                  </div>
                )}
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Modal */}
      {selectedAchievement && (
        <div 
          className="sm:hidden fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedAchievement(null)}
        >
          <div 
            className="w-full bg-card border-t border-border rounded-t-3xl p-6 animate-slide-up shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'h-14 w-14 rounded-2xl flex items-center justify-center p-1 shadow-xl',
                  isEarnedSelected 
                    ? `bg-gradient-to-br ${selectedAchievement.color} border-2 border-primary/30` 
                    : 'bg-secondary/50 border-2 border-border/50 grayscale opacity-70'
                )}>
                  <div className={cn(
                    'w-full h-full rounded-xl flex items-center justify-center',
                    isEarnedSelected ? 'bg-card/95 backdrop-blur-sm' : 'bg-card/50'
                  )}>
                    <span className="text-3xl">{selectedAchievement.icon}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{selectedAchievement.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAchievement.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAchievement(null)}
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isEarnedSelected ? (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-xl border border-success/30">
                <Sparkles className="h-5 w-5 text-success" />
                <span className="font-semibold text-success">Qo'lga kiritildi!</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Jarayon</span>
                  <span className="font-bold text-primary">{Math.round(selectedProgress)}%</span>
                </div>
                <Progress value={selectedProgress} className="h-2" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};