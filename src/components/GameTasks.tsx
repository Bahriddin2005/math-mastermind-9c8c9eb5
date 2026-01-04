import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useGameCurrency } from "@/hooks/useGameCurrency";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  CheckCircle, Coins, Zap, Calendar, 
  CalendarDays, Gift, Sparkles
} from "lucide-react";

interface GameTask {
  id: string;
  task_type: string;
  title: string;
  description: string;
  target_value: number;
  reward_coins: number;
  reward_xp: number;
  icon: string;
}

interface TaskProgress {
  id: string;
  task_id: string;
  current_value: number;
  is_completed: boolean;
  reset_date: string;
}

export const GameTasks = () => {
  const { user } = useAuth();
  const { addCoins } = useGameCurrency();
  const [tasks, setTasks] = useState<GameTask[]>([]);
  const [progress, setProgress] = useState<Map<string, TaskProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    try {
      // Load all active tasks
      const { data: tasksData } = await supabase
        .from('game_tasks')
        .select('*')
        .eq('is_active', true)
        .order('task_type', { ascending: true });

      if (tasksData) {
        setTasks(tasksData);
      }

      // Load user progress
      const today = new Date().toISOString().split('T')[0];
      const { data: progressData } = await supabase
        .from('user_task_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressData) {
        const progressMap = new Map<string, TaskProgress>();
        progressData.forEach(p => {
          // Check if task needs reset
          const isDaily = tasksData?.find(t => t.id === p.task_id)?.task_type === 'daily';
          const isWeekly = tasksData?.find(t => t.id === p.task_id)?.task_type === 'weekly';
          
          const resetDate = new Date(p.reset_date);
          const currentDate = new Date(today);
          
          // Reset daily tasks if not today
          if (isDaily && p.reset_date !== today) {
            // Reset progress
            progressMap.set(p.task_id, { ...p, current_value: 0, is_completed: false });
          } 
          // Reset weekly tasks if it's a new week
          else if (isWeekly) {
            const weekStart = getWeekStart(currentDate);
            const progressWeekStart = getWeekStart(resetDate);
            if (weekStart.getTime() !== progressWeekStart.getTime()) {
              progressMap.set(p.task_id, { ...p, current_value: 0, is_completed: false });
            } else {
              progressMap.set(p.task_id, p);
            }
          } else {
            progressMap.set(p.task_id, p);
          }
        });
        setProgress(progressMap);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const claimReward = async (task: GameTask) => {
    if (!user) return;

    const taskProgress = progress.get(task.id);
    if (!taskProgress || !taskProgress.is_completed) return;

    setClaiming(task.id);

    try {
      // Add coins
      await addCoins(task.reward_coins);

      // Add XP
      const { data: gamification } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (gamification) {
        await supabase
          .from('user_gamification')
          .update({
            total_xp: gamification.total_xp + task.reward_xp,
            current_xp: gamification.current_xp + task.reward_xp
          })
          .eq('user_id', user.id);
      }

      // Mark as claimed by resetting progress
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('user_task_progress')
        .update({
          current_value: 0,
          is_completed: false,
          reset_date: today
        })
        .eq('id', taskProgress.id);

      // Update local state
      setProgress(new Map(progress.set(task.id, {
        ...taskProgress,
        current_value: 0,
        is_completed: false
      })));

      toast.success(`${task.reward_coins} coin va ${task.reward_xp} XP olindi!`, {
        icon: '🎁'
      });
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setClaiming(null);
    }
  };

  const getTaskProgress = (task: GameTask) => {
    const taskProgress = progress.get(task.id);
    return taskProgress?.current_value || 0;
  };

  const isTaskCompleted = (task: GameTask) => {
    const taskProgress = progress.get(task.id);
    return taskProgress?.is_completed || false;
  };

  const dailyTasks = tasks.filter(t => t.task_type === 'daily');
  const weeklyTasks = tasks.filter(t => t.task_type === 'weekly');

  const completedDaily = dailyTasks.filter(t => isTaskCompleted(t)).length;
  const completedWeekly = weeklyTasks.filter(t => isTaskCompleted(t)).length;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <h3 className="font-bold flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Kunlik & Haftalik Vazifalar
        </h3>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
          <TabsTrigger value="daily" className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            <Calendar className="h-4 w-4" />
            Kunlik
            <Badge variant="secondary" className="ml-1">
              {completedDaily}/{dailyTasks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            <CalendarDays className="h-4 w-4" />
            Haftalik
            <Badge variant="secondary" className="ml-1">
              {completedWeekly}/{weeklyTasks.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="p-0 mt-0">
          <div className="divide-y">
            {dailyTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                currentValue={getTaskProgress(task)}
                isCompleted={isTaskCompleted(task)}
                onClaim={() => claimReward(task)}
                claiming={claiming === task.id}
              />
            ))}
            {dailyTasks.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Kunlik vazifalar yo'q</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="p-0 mt-0">
          <div className="divide-y">
            {weeklyTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                currentValue={getTaskProgress(task)}
                isCompleted={isTaskCompleted(task)}
                onClaim={() => claimReward(task)}
                claiming={claiming === task.id}
              />
            ))}
            {weeklyTasks.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Haftalik vazifalar yo'q</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

interface TaskItemProps {
  task: GameTask;
  currentValue: number;
  isCompleted: boolean;
  onClaim: () => void;
  claiming: boolean;
}

const TaskItem = ({ task, currentValue, isCompleted, onClaim, claiming }: TaskItemProps) => {
  const progressPercent = Math.min(100, (currentValue / task.target_value) * 100);

  return (
    <div className={`p-4 transition-colors ${isCompleted ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${
          isCompleted 
            ? 'bg-green-500 text-white' 
            : 'bg-secondary'
        }`}>
          {isCompleted ? <CheckCircle className="h-5 w-5" /> : task.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{task.title}</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{task.description}</p>

          {/* Progress bar */}
          <div className="space-y-1">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{currentValue}/{task.target_value}</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5">
                  <Coins className="h-3 w-3 text-yellow-500" />
                  +{task.reward_coins}
                </span>
                <span className="flex items-center gap-0.5">
                  <Zap className="h-3 w-3 text-purple-500" />
                  +{task.reward_xp}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Claim button */}
        {isCompleted && (
          <Button
            size="sm"
            onClick={onClaim}
            disabled={claiming}
            className="shrink-0 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {claiming ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Olish
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameTasks;
