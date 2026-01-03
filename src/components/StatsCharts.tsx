import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { getSectionInfo, MathSection } from '@/lib/mathGenerator';

interface GameSession {
  section: string;
  correct: number;
  incorrect: number;
  score: number;
  created_at: string;
}

interface StatsChartsProps {
  sessions: GameSession[];
}

// Dynamic colors for charts - will be updated based on theme
const COLORS = {
  primary: 'hsl(145, 80%, 42%)',
  accent: 'hsl(28, 95%, 55%)',
  warning: 'hsl(45, 95%, 55%)',
  success: 'hsl(145, 80%, 42%)',
  muted: 'hsl(160, 20%, 45%)',
  // Dark mode variations
  primaryDark: 'hsl(145, 85%, 50%)',
  accentDark: 'hsl(28, 100%, 60%)',
  warningDark: 'hsl(45, 100%, 60%)',
  successDark: 'hsl(145, 85%, 50%)',
  mutedDark: 'hsl(160, 25%, 55%)',
};

export const StatsCharts = ({ sessions }: StatsChartsProps) => {
  // Weekly data - last 7 days
  const getWeeklyData = () => {
    const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(s => 
        s.created_at.startsWith(dateStr)
      );
      
      const solved = daySessions.reduce((sum, s) => sum + s.correct + s.incorrect, 0);
      const correct = daySessions.reduce((sum, s) => sum + s.correct, 0);
      
      weekData.push({
        name: days[date.getDay()],
        solved,
        correct,
        date: date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
      });
    }

    return weekData;
  };

  // Section breakdown
  const getSectionData = () => {
    const sectionCounts: Record<string, { correct: number; incorrect: number }> = {};
    
    sessions.forEach(session => {
      if (!sectionCounts[session.section]) {
        sectionCounts[session.section] = { correct: 0, incorrect: 0 };
      }
      sectionCounts[session.section].correct += session.correct;
      sectionCounts[session.section].incorrect += session.incorrect;
    });

    return Object.entries(sectionCounts).map(([section, data]) => ({
      name: getSectionInfo(section as MathSection).name,
      value: data.correct + data.incorrect,
      correct: data.correct,
      icon: getSectionInfo(section as MathSection).icon,
    }));
  };

  // Accuracy trend
  const getAccuracyTrend = () => {
    const grouped: Record<string, { correct: number; total: number }> = {};
    
    sessions.forEach(session => {
      const date = session.created_at.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { correct: 0, total: 0 };
      }
      grouped[date].correct += session.correct;
      grouped[date].total += session.correct + session.incorrect;
    });

    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([date, data]) => ({
        name: new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      }));
  };

  const weeklyData = getWeeklyData();
  const sectionData = getSectionData();
  const accuracyData = getAccuracyTrend();

  const pieColors = [COLORS.primary, COLORS.accent, COLORS.warning, COLORS.success];
  const pieColorsDark = [COLORS.primaryDark, COLORS.accentDark, COLORS.warningDark, COLORS.successDark];

  if (sessions.length === 0) {
    return (
      <Card className="border-border/40 dark:border-border/30 shadow-sm dark:shadow-xl backdrop-blur-sm opacity-0 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
        <CardContent className="py-10 sm:py-12">
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 dark:from-secondary/60 dark:to-secondary/30 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Statistika uchun kamida bitta o'yin o'ynang
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 opacity-0 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
      {/* Weekly Progress Chart */}
      <Card className="border-border/40 dark:border-border/30 shadow-sm dark:shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-2 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            Haftalik progress
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 pb-4">
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    color: 'hsl(var(--popover-foreground))',
                    boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.2)',
                    padding: '8px 12px',
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'solved' ? 'Jami' : 'To\'g\'ri'
                  ]}
                  labelFormatter={(label) => {
                    const day = weeklyData.find(d => d.name === label);
                    return day?.date || label;
                  }}
                />
                <Bar dataKey="solved" fill={COLORS.muted} radius={[4, 4, 0, 0]} name="solved" className="dark:opacity-80" />
                <Bar dataKey="correct" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="correct" className="dark:fill-[hsl(145,85%,50%)]" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Section Breakdown */}
        <Card className="border-border/40 dark:border-border/30 shadow-sm dark:shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-accent/10 dark:bg-accent/20">
                <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
              Bo'limlar bo'yicha
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-4">
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={sectionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sectionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={pieColors[index % pieColors.length]}
                        className="dark:opacity-90"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--popover-foreground))',
                      boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.2)',
                      padding: '8px 12px',
                    }}
                    formatter={(value: number) => [`${value} ta misol`, 'Jami']}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2">
              {sectionData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[10px] sm:text-xs bg-secondary/50 dark:bg-secondary/30 px-2 py-1 rounded-full">
                  <div 
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accuracy Trend */}
        <Card className="border-border/40 dark:border-border/30 shadow-sm dark:shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-success/10 dark:bg-success/20">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              Aniqlik trendi
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-4">
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--popover-foreground))',
                      boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.2)',
                      padding: '8px 12px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Aniqlik']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke={COLORS.success}
                    strokeWidth={2.5}
                    dot={{ fill: COLORS.success, strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: COLORS.success, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                    className="dark:stroke-[hsl(145,85%,50%)]"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
