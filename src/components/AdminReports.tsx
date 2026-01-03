import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  FileDown, 
  Loader2, 
  Users, 
  Target, 
  Trophy, 
  Calendar,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

interface DailyStats {
  date: string;
  users: number;
  problems: number;
  games: number;
}

interface SectionStats {
  name: string;
  count: number;
  percentage: number;
}

interface UserActivity {
  username: string;
  total_score: number;
  total_problems_solved: number;
  best_streak: number;
  last_active: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [sectionStats, setSectionStats] = useState<SectionStats[]>([]);
  const [topUsers, setTopUsers] = useState<UserActivity[]>([]);
  const [totals, setTotals] = useState({
    users: 0,
    problems: 0,
    games: 0,
    avgScore: 0
  });
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setLoading(true);
    const days = parseInt(period);
    const startDate = startOfDay(subDays(new Date(), days - 1));
    const endDate = endOfDay(new Date());

    // Fetch profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('total_score', { ascending: false });

    // Fetch game sessions
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (profiles && sessions) {
      // Calculate daily stats
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      const daily: DailyStats[] = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayUsers = profiles.filter(p => p.created_at.startsWith(dateStr)).length;
        const daySessions = sessions.filter(s => s.created_at.startsWith(dateStr));
        const dayProblems = daySessions.reduce((sum, s) => sum + (s.problems_solved || 0), 0);
        
        return {
          date: format(date, 'dd MMM'),
          users: dayUsers,
          problems: dayProblems,
          games: daySessions.length
        };
      });
      setDailyStats(daily);

      // Calculate section stats
      const sectionCounts: Record<string, number> = {};
      sessions.forEach(s => {
        sectionCounts[s.section] = (sectionCounts[s.section] || 0) + 1;
      });
      const totalSessions = sessions.length || 1;
      const sections: SectionStats[] = Object.entries(sectionCounts).map(([name, count]) => ({
        name: getSectionName(name),
        count,
        percentage: Math.round((count / totalSessions) * 100)
      })).sort((a, b) => b.count - a.count);
      setSectionStats(sections);

      // Top users
      const top = profiles.slice(0, 10).map(p => ({
        username: p.username,
        total_score: p.total_score || 0,
        total_problems_solved: p.total_problems_solved || 0,
        best_streak: p.best_streak || 0,
        last_active: p.last_active_date || p.created_at
      }));
      setTopUsers(top);

      // Totals
      const newUsers = profiles.filter(p => 
        new Date(p.created_at) >= startDate
      ).length;
      const totalProblems = sessions.reduce((sum, s) => sum + (s.problems_solved || 0), 0);
      const avgScore = sessions.length > 0 
        ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length)
        : 0;

      setTotals({
        users: newUsers,
        problems: totalProblems,
        games: sessions.length,
        avgScore
      });
    }

    setLoading(false);
  };

  const getSectionName = (section: string) => {
    const names: Record<string, string> = {
      'add': "Qo'shish",
      'subtract': 'Ayirish',
      'multiply': "Ko'paytirish",
      'divide': "Bo'lish",
      'mental': 'Mental arifmetika'
    };
    return names[section] || section;
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    // Create a printable version
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>IQroMax Hisobot - ${format(new Date(), 'dd.MM.yyyy')}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #3b82f6; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #f3f4f6; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .stat-label { color: #6b7280; margin-top: 5px; }
          .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>IQroMax Platforma Hisoboti</h1>
        <p>Davr: So'nggi ${period} kun | Sana: ${format(new Date(), 'dd.MM.yyyy HH:mm')}</p>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${totals.users}</div>
            <div class="stat-label">Yangi foydalanuvchilar</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${totals.problems.toLocaleString()}</div>
            <div class="stat-label">Yechilgan masalalar</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${totals.games.toLocaleString()}</div>
            <div class="stat-label">O'yinlar soni</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${totals.avgScore}</div>
            <div class="stat-label">O'rtacha ball</div>
          </div>
        </div>

        <h2>Top 10 Foydalanuvchilar</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Ism</th>
              <th>Ball</th>
              <th>Masalalar</th>
              <th>Eng yaxshi seriya</th>
            </tr>
          </thead>
          <tbody>
            ${topUsers.map((user, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${user.username}</td>
                <td>${user.total_score.toLocaleString()}</td>
                <td>${user.total_problems_solved.toLocaleString()}</td>
                <td>${user.best_streak}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Bo'limlar bo'yicha statistika</h2>
        <table>
          <thead>
            <tr>
              <th>Bo'lim</th>
              <th>O'yinlar soni</th>
              <th>Foiz</th>
            </tr>
          </thead>
          <tbody>
            ${sectionStats.map(s => `
              <tr>
                <td>${s.name}</td>
                <td>${s.count}</td>
                <td>${s.percentage}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Kunlik statistika</h2>
        <table>
          <thead>
            <tr>
              <th>Sana</th>
              <th>Yangi foydalanuvchilar</th>
              <th>Masalalar</th>
              <th>O'yinlar</th>
            </tr>
          </thead>
          <tbody>
            ${dailyStats.map(d => `
              <tr>
                <td>${d.date}</td>
                <td>${d.users}</td>
                <td>${d.problems}</td>
                <td>${d.games}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>IQroMax Mental Arifmetika Platformasi © ${new Date().getFullYear()}</p>
          <p>Bu hisobot avtomatik ravishda yaratildi</p>
        </div>
      </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6" ref={reportRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-display font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
            <span className="truncate">Batafsil hisobotlar</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Platforma statistikasi va tahlillari</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px] sm:w-40 h-9 sm:h-10 text-xs sm:text-sm bg-background/50 dark:bg-background/30 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">So'nggi 7 kun</SelectItem>
              <SelectItem value="14">So'nggi 14 kun</SelectItem>
              <SelectItem value="30">So'nggi 30 kun</SelectItem>
              <SelectItem value="90">So'nggi 90 kun</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportPDF} size="sm" className="gap-1.5 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm">
            <FileDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">PDF</span> eksport
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/5 border-blue-500/20 dark:border-blue-500/30 shadow-sm">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{totals.users}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Yangi foydalanuvchilar</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/5 border-green-500/20 dark:border-green-500/30 shadow-sm">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{totals.problems.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Yechilgan masalalar</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/5 border-purple-500/20 dark:border-purple-500/30 shadow-sm">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{totals.games.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">O'yinlar soni</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/5 border-amber-500/20 dark:border-amber-500/30 shadow-sm">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{totals.avgScore}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">O'rtacha ball</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Daily Activity Chart */}
        <Card className="bg-card/50 dark:bg-card/30 border-border/50">
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              Kunlik faollik
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 md:p-6 pt-0">
            <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
              <LineChart data={dailyStats} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis className="text-xs" tick={{ fontSize: 9 }} width={30} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="problems" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Masalalar"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="games" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="O'yinlar"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Section Distribution */}
        <Card className="bg-card/50 dark:bg-card/30 border-border/50">
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base">Bo'limlar taqsimoti</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 md:p-6 pt-0">
            {sectionStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={sectionStats}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={({ name, percentage }) => `${percentage}%`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {sectionStats.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px' }}
                    iconSize={10}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] sm:h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                Ma'lumot yo'q
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Users Table */}
      <Card className="bg-card/50 dark:bg-card/30 border-border/50 overflow-hidden">
        <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
            Top 10 Foydalanuvchilar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4 md:p-6 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-8 sm:w-12 text-xs sm:text-sm pl-3 sm:pl-4">#</TableHead>
                  <TableHead className="text-xs sm:text-sm">Ism</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Ball</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm hidden sm:table-cell">Masalalar</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm pr-3 sm:pr-4 hidden md:table-cell">Seriya</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers.map((user, index) => (
                  <TableRow key={user.username} className="hover:bg-muted/30 border-border/30">
                    <TableCell className="font-medium text-xs sm:text-sm pl-3 sm:pl-4 py-2 sm:py-3">
                      <span className={`${index < 3 ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm py-2 sm:py-3 max-w-[100px] sm:max-w-none truncate">{user.username}</TableCell>
                    <TableCell className="text-right font-semibold text-primary text-xs sm:text-sm py-2 sm:py-3">
                      {totals.users > 999 ? `${(user.total_score / 1000).toFixed(1)}k` : user.total_score.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm py-2 sm:py-3 hidden sm:table-cell">{user.total_problems_solved.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-xs sm:text-sm pr-3 sm:pr-4 py-2 sm:py-3 hidden md:table-cell">{user.best_streak}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Daily Stats Bar Chart */}
      <Card className="bg-card/50 dark:bg-card/30 border-border/50">
        <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base">Kunlik yangi foydalanuvchilar</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 md:p-6 pt-0">
          <ResponsiveContainer width="100%" height={160} className="sm:h-[200px]">
            <BarChart data={dailyStats} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9 }} width={30} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Foydalanuvchilar" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
