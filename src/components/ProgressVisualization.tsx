import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ActivityRing } from './ActivityRing';
import { Target, Zap, TrendingUp, Award } from 'lucide-react';

interface ProgressVisualizationProps {
  dailyGoal: number;
  problemsSolved: number;
  accuracy: number;
  streak: number;
  level: number;
}

export const ProgressVisualization = ({
  dailyGoal,
  problemsSolved,
  accuracy,
  streak,
  level,
}: ProgressVisualizationProps) => {
  const goalProgress = useMemo(() => {
    return Math.min(100, Math.round((problemsSolved / dailyGoal) * 100));
  }, [problemsSolved, dailyGoal]);

  const levelProgress = useMemo(() => {
    // Simple level progression (every 1000 points = next level)
    const pointsInCurrentLevel = (level * 1000);
    const pointsForNextLevel = ((level + 1) * 1000);
    const pointsNeeded = pointsForNextLevel - pointsInCurrentLevel;
    return Math.min(100, Math.round(((problemsSolved % 1000) / pointsNeeded) * 100));
  }, [problemsSolved, level]);

  return (
    <Card className="border-2 border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden opacity-0 animate-slide-up rounded-2xl bg-gradient-to-br from-card via-card to-primary/5" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-border/50">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-md">
            <Award className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Rivojlanish ko'rsatkichlari
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6">
          {/* Daily Goal Progress */}
          <div className="flex flex-col items-center group">
            <div className="relative mb-2">
              <ActivityRing
                progress={goalProgress}
                size={100}
                strokeWidth={8}
                color="primary"
                value={problemsSolved}
                label={`/${dailyGoal} maqsad`}
                icon={<Target className="h-4 w-4" />}
              />
            </div>
            <div className="text-center mt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Kunlik maqsad
              </p>
            </div>
          </div>

          {/* Accuracy Ring */}
          <div className="flex flex-col items-center group">
            <div className="relative mb-2">
              <ActivityRing
                progress={accuracy}
                size={100}
                strokeWidth={8}
                color="success"
                value={`${accuracy}%`}
                label="aniqlik"
                icon={<TrendingUp className="h-4 w-4" />}
              />
            </div>
            <div className="text-center mt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Aniqlik
              </p>
            </div>
          </div>

          {/* Streak Progress */}
          <div className="flex flex-col items-center group">
            <div className="relative mb-2">
              <ActivityRing
                progress={Math.min(100, streak * 10)}
                size={100}
                strokeWidth={8}
                color="warning"
                value={streak}
                label="kunlik seriya"
                icon={<Zap className="h-4 w-4" />}
              />
            </div>
            <div className="text-center mt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Kunlik seriya
              </p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="flex flex-col items-center group">
            <div className="relative mb-2">
              <ActivityRing
                progress={levelProgress}
                size={100}
                strokeWidth={8}
                color="accent"
                value={`Lv.${level}`}
                label="daraja"
                icon={<Award className="h-4 w-4" />}
              />
            </div>
            <div className="text-center mt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Daraja
              </p>
            </div>
          </div>
        </div>

        {/* Progress bars below */}
        <div className="mt-6 space-y-4 pt-6 border-t border-border/50">
          <ProgressBar 
            label="Kunlik maqsad" 
            value={goalProgress} 
            color="primary" 
            suffix={`${problemsSolved}/${dailyGoal}`}
          />
          <ProgressBar 
            label="Aniqlik" 
            value={accuracy} 
            color="success" 
            suffix={`${accuracy}%`}
          />
          <ProgressBar 
            label="Keyingi darajaga" 
            value={levelProgress} 
            color="accent" 
            suffix={`${levelProgress}%`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const ProgressBar = ({ 
  label, 
  value, 
  color, 
  suffix 
}: { 
  label: string; 
  value: number; 
  color: 'primary' | 'accent' | 'success' | 'warning';
  suffix?: string;
}) => {
  const colorClasses = {
    primary: 'bg-gradient-to-r from-primary via-primary/90 to-primary/80',
    accent: 'bg-gradient-to-r from-accent via-accent/90 to-accent/80',
    success: 'bg-gradient-to-r from-green-500 via-green-400 to-green-500',
    warning: 'bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500',
  };

  const glowClasses = {
    primary: 'shadow-[0_0_10px_rgba(var(--primary),0.5)]',
    accent: 'shadow-[0_0_10px_rgba(var(--accent),0.5)]',
    success: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]',
    warning: 'shadow-[0_0_10px_rgba(249,115,22,0.5)]',
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-sm font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {suffix}
        </span>
      </div>
      <div className="relative h-3 bg-secondary/50 rounded-full overflow-hidden border border-border/30">
        <div 
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClasses[color]} ${glowClasses[color]}`}
          style={{ width: `${Math.min(100, value)}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
};