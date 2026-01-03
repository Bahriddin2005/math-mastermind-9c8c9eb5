import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  BookOpen, 
  Trophy, 
  Calculator,
  Flame,
  Target,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileDashboardProps {
  username?: string;
  stats?: {
    todayProblems: number;
    streak: number;
    weeklyRank?: number;
    totalScore: number;
  };
}

const quickActions = [
  { 
    icon: Dumbbell, 
    label: "Mashq", 
    path: "/train",
    gradient: "from-primary to-primary/80",
    description: "Misollar yechish"
  },
  { 
    icon: Calculator, 
    label: "Abakus", 
    path: "/mental-arithmetic",
    gradient: "from-accent to-accent/80",
    description: "Mental arifmetika"
  },
  { 
    icon: BookOpen, 
    label: "Kurslar", 
    path: "/courses",
    gradient: "from-blue-500 to-blue-400",
    description: "Video darslar"
  },
  { 
    icon: Trophy, 
    label: "Musobaqa", 
    path: "/weekly-game",
    gradient: "from-yellow-500 to-orange-400",
    description: "Haftalik bellashuv"
  },
];

export const MobileDashboard = ({ username, stats }: MobileDashboardProps) => {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Xayrli tong";
    if (hour < 18) return "Xayrli kun";
    return "Xayrli kech";
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Compact Header */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-muted-foreground text-sm">{greeting()}</p>
        <h1 className="text-xl font-bold text-foreground">
          {username ? `${username}` : "Mehmon"}
        </h1>
      </div>

      {/* Stats Cards - Horizontal Scroll */}
      <div className="px-4 pb-4">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          <Card className="flex-shrink-0 w-[120px] p-3 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Bugun</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.todayProblems || 0}</p>
            <p className="text-xs text-muted-foreground">misol</p>
          </Card>

          <Card className="flex-shrink-0 w-[120px] p-3 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.streak || 0}</p>
            <p className="text-xs text-muted-foreground">kun</p>
          </Card>

          <Card className="flex-shrink-0 w-[120px] p-3 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Reyting</span>
            </div>
            <p className="text-2xl font-bold text-foreground">#{stats?.weeklyRank || '-'}</p>
            <p className="text-xs text-muted-foreground">o'rin</p>
          </Card>

          <Card className="flex-shrink-0 w-[120px] p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Ball</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.totalScore?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground">jami</p>
          </Card>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-4 pb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Tezkor havolalar</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="group"
            >
              <Card className={cn(
                "p-4 h-full transition-all duration-150 active:scale-95",
                "bg-card hover:bg-card/80 border-border/50"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                  `bg-gradient-to-br ${action.gradient}`
                )}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-0.5">{action.label}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Davom ettirish</h2>
          <Link to="/courses" className="text-xs text-primary flex items-center gap-0.5">
            Barchasi <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">Arifmetika asoslari</h3>
              <p className="text-xs text-muted-foreground">3-dars • 15 daqiqa</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>
        </Card>
      </div>

      {/* Daily Goal */}
      <div className="px-4 pb-24">
        <Card className="p-4 bg-card border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Kunlik maqsad</span>
            <span className="text-xs text-muted-foreground">{stats?.todayProblems || 0}/20 misol</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${Math.min(((stats?.todayProblems || 0) / 20) * 100, 100)}%` }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};
