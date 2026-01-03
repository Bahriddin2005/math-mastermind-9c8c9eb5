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
    <Card className="border-border/40 dark:border-border/20 shadow-md dark:shadow-lg dark:shadow-black/20 overflow-hidden opacity-0 animate-slide-up bg-card dark:bg-card/95" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
      <CardHeader className="pb-2 bg-gradient-to-r from-accent/5 via-primary/5 to-transparent dark:from-accent/10 dark:via-primary/10 dark:to-transparent">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 dark:from-accent dark:to-accent/70 flex items-center justify-center shadow-sm dark:shadow-accent/30">
            <Award className="h-4 w-4 text-accent-foreground" />
          </div>
          <span>Rivojlanish</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {/* Daily Goal Progress */}
          <div className="flex flex-col items-center p-2 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 transition-colors">
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

          {/* Accuracy Ring */}
          <div className="flex flex-col items-center p-2 rounded-xl bg-success/5 dark:bg-success/10 border border-success/10 dark:border-success/20 transition-colors">
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

          {/* Streak Progress */}
          <div className="flex flex-col items-center p-2 rounded-xl bg-warning/5 dark:bg-warning/10 border border-warning/10 dark:border-warning/20 transition-colors">
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

          {/* Level Progress */}
          <div className="flex flex-col items-center p-2 rounded-xl bg-accent/5 dark:bg-accent/10 border border-accent/10 dark:border-accent/20 transition-colors">
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
        </div>

        {/* Progress bars below - Enhanced dark mode */}
        <div className="mt-6 space-y-3">
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
    primary: 'bg-primary',
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground dark:text-muted-foreground/80 font-medium">{label}</span>
        <span className="font-semibold text-foreground">{suffix}</span>
      </div>
      <div className="h-2 bg-secondary dark:bg-secondary/60 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClasses[color]} shadow-sm`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
};