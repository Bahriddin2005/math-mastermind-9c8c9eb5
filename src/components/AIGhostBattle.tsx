import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Swords, Trophy, Clock, Zap, Play, RotateCcw, Crown, Flame, Brain, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSound } from '@/hooks/useSound';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Problem {
  numbers: number[];
  answer: number;
}

type AILevel = 'easy' | 'medium' | 'hard' | 'expert' | 'impossible';

interface AIConfig {
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  avgSpeed: number; // ms per problem
  accuracy: number; // 0-1
  mistakeChance: number; // 0-1
}

const AI_LEVELS: Record<AILevel, AIConfig> = {
  easy: {
    name: 'Yangi Robot',
    description: 'Sekin hisoblaydigan robot',
    icon: <Bot className="h-6 w-6" />,
    gradient: 'from-green-500 to-emerald-500',
    avgSpeed: 8000,
    accuracy: 0.6,
    mistakeChance: 0.4,
  },
  medium: {
    name: 'O\'rta Robot',
    description: 'O\'rtacha tezlikdagi robot',
    icon: <Bot className="h-6 w-6" />,
    gradient: 'from-blue-500 to-cyan-500',
    avgSpeed: 5000,
    accuracy: 0.75,
    mistakeChance: 0.25,
  },
  hard: {
    name: 'Kuchli Robot',
    description: 'Tez va aniq hisoblovchi',
    icon: <Brain className="h-6 w-6" />,
    gradient: 'from-purple-500 to-violet-500',
    avgSpeed: 3000,
    accuracy: 0.85,
    mistakeChance: 0.15,
  },
  expert: {
    name: 'Super Robot',
    description: 'Juda tez va deyarli xatosiz',
    icon: <Target className="h-6 w-6" />,
    gradient: 'from-orange-500 to-red-500',
    avgSpeed: 2000,
    accuracy: 0.95,
    mistakeChance: 0.05,
  },
  impossible: {
    name: 'Mega AI',
    description: 'Yengib bo\'lmaydigan sun\'iy aql',
    icon: <Flame className="h-6 w-6" />,
    gradient: 'from-rose-500 to-pink-500',
    avgSpeed: 1200,
    accuracy: 0.99,
    mistakeChance: 0.01,
  },
};

const TOTAL_PROBLEMS = 5;
const NUMBER_SPEED = 800;
const NUMBERS_PER_PROBLEM = 5;

export const AIGhostBattle = () => {
  const { user } = useAuth();
  const { playSound } = useSound();
  
  const [selectedLevel, setSelectedLevel] = useState<AILevel>('medium');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  
  // Game state
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [userScore, setUserScore] = useState(0);
  const [userCorrect, setUserCorrect] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showingNumbers, setShowingNumbers] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [displayedNumbers, setDisplayedNumbers] = useState<number[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Generate problems
  const generateProblems = useCallback(() => {
    const newProblems: Problem[] = [];
    
    for (let i = 0; i < TOTAL_PROBLEMS; i++) {
      const numbers: number[] = [];
      let sum = Math.floor(Math.random() * 9) + 1;
      numbers.push(sum);
      
      for (let j = 1; j < NUMBERS_PER_PROBLEM; j++) {
        const isAdd = Math.random() > 0.5 || sum < 3;
        const maxChange = isAdd ? Math.min(9, 15 - sum) : Math.min(sum - 1, 9);
        const change = Math.floor(Math.random() * maxChange) + 1;
        
        if (isAdd) {
          numbers.push(change);
          sum += change;
        } else {
          numbers.push(-change);
          sum -= change;
        }
      }
      
      newProblems.push({ numbers, answer: sum });
    }
    
    return newProblems;
  }, []);

  // Simulate AI solving
  const simulateAI = useCallback((aiConfig: AIConfig) => {
    let aiProblemIndex = 0;
    let aiPoints = 0;
    
    const solveNext = () => {
      if (aiProblemIndex >= TOTAL_PROBLEMS) return;
      
      const timeVariation = 0.5 + Math.random(); // 0.5x to 1.5x speed variation
      const solveTime = aiConfig.avgSpeed * timeVariation;
      
      aiIntervalRef.current = setTimeout(() => {
        aiProblemIndex++;
        const isCorrect = Math.random() < aiConfig.accuracy;
        
        if (isCorrect) {
          aiPoints += 10;
          setAiScore(aiPoints);
        }
        
        setAiProgress((aiProblemIndex / TOTAL_PROBLEMS) * 100);
        
        if (aiProblemIndex < TOTAL_PROBLEMS) {
          solveNext();
        }
      }, solveTime);
    };
    
    solveNext();
  }, []);

  // Start battle
  const startBattle = useCallback(() => {
    playSound('start');
    const newProblems = generateProblems();
    setProblems(newProblems);
    setCurrentProblemIndex(0);
    setUserScore(0);
    setUserCorrect(0);
    setAiScore(0);
    setAiProgress(0);
    setTimeElapsed(0);
    setGameStarted(true);
    setGameFinished(false);
    startTimeRef.current = Date.now();
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 0.1);
    }, 100);
    
    // Start AI simulation
    simulateAI(AI_LEVELS[selectedLevel]);
    
    // Show first problem
    showProblem(newProblems[0]);
  }, [selectedLevel, generateProblems, playSound, simulateAI]);

  // Show problem animation
  const showProblem = useCallback((problem: Problem) => {
    setShowingNumbers(true);
    setDisplayedNumbers([]);
    let idx = 0;
    
    const showNext = () => {
      if (idx < problem.numbers.length) {
        setCurrentNumber(problem.numbers[idx]);
        setDisplayedNumbers(prev => [...prev, problem.numbers[idx]]);
        idx++;
        setTimeout(showNext, NUMBER_SPEED);
      } else {
        setCurrentNumber(null);
        setShowingNumbers(false);
      }
    };
    
    showNext();
  }, []);

  // Check answer
  const checkAnswer = useCallback(() => {
    const currentProblem = problems[currentProblemIndex];
    const userNum = parseInt(userAnswer, 10);
    const isCorrect = userNum === currentProblem.answer;
    
    playSound(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setUserCorrect(prev => prev + 1);
      setUserScore(prev => prev + 10);
      toast.success("To'g'ri! 🎉", { duration: 1000 });
    } else {
      toast.error(`Noto'g'ri! Javob: ${currentProblem.answer}`, { duration: 1500 });
    }
    
    setUserAnswer('');
    
    if (currentProblemIndex < TOTAL_PROBLEMS - 1) {
      setCurrentProblemIndex(prev => prev + 1);
      showProblem(problems[currentProblemIndex + 1]);
    } else {
      finishGame(isCorrect);
    }
  }, [currentProblemIndex, problems, userAnswer, playSound, showProblem]);

  // Finish game
  const finishGame = useCallback(async (lastCorrect: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (aiIntervalRef.current) clearTimeout(aiIntervalRef.current);
    
    const finalCorrect = userCorrect + (lastCorrect ? 1 : 0);
    const finalScore = userScore + (lastCorrect ? 10 : 0);
    const finalTime = (Date.now() - startTimeRef.current) / 1000;
    
    // Wait a bit for AI to potentially finish
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userWon = finalScore > aiScore;
    
    playSound(userWon ? 'winner' : 'incorrect');
    setGameFinished(true);
    setUserCorrect(finalCorrect);
    setUserScore(finalScore);
    
    // Save result
    if (user) {
      try {
        await supabase.from('ghost_battle_results').insert({
          user_id: user.id,
          ghost_user_id: `ai-${selectedLevel}`,
          ghost_username: AI_LEVELS[selectedLevel].name,
          user_score: finalScore,
          ghost_score: aiScore,
          user_correct: finalCorrect,
          ghost_correct: Math.floor(aiScore / 10),
          user_time: finalTime,
          ghost_time: AI_LEVELS[selectedLevel].avgSpeed * TOTAL_PROBLEMS / 1000,
          is_winner: userWon,
        });
      } catch (error) {
        console.error('Error saving result:', error);
      }
    }
    
    if (userWon) {
      toast.success("🏆 Siz AI ni yengdingiz!", { duration: 3000 });
    } else {
      toast.info("AI g'olib bo'ldi. Qayta urinib ko'ring! 💪", { duration: 3000 });
    }
  }, [userCorrect, userScore, aiScore, selectedLevel, user, playSound]);

  // Reset game
  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (aiIntervalRef.current) clearTimeout(aiIntervalRef.current);
    
    setGameStarted(false);
    setGameFinished(false);
    setCurrentProblemIndex(0);
    setUserAnswer('');
    setUserScore(0);
    setUserCorrect(0);
    setAiScore(0);
    setAiProgress(0);
    setTimeElapsed(0);
    setShowingNumbers(false);
    setCurrentNumber(null);
    setDisplayedNumbers([]);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (aiIntervalRef.current) clearTimeout(aiIntervalRef.current);
    };
  }, []);

  const aiConfig = AI_LEVELS[selectedLevel];

  // Level selection screen
  if (!gameStarted) {
    return (
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-cyan-500" />
            AI Battle - Sun'iy Aql bilan Raqobat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sun'iy aql raqibini tanlang va unga qarshi o'ynang!
          </p>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Qiyinlik darajasini tanlang:</p>
            {(Object.keys(AI_LEVELS) as AILevel[]).map((level) => {
              const config = AI_LEVELS[level];
              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3",
                    selectedLevel === level
                      ? `border-transparent bg-gradient-to-r ${config.gradient} text-white`
                      : "border-border hover:border-cyan-500/50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-full",
                    selectedLevel === level ? "bg-white/20" : `bg-gradient-to-r ${config.gradient} text-white`
                  )}>
                    {config.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{config.name}</div>
                    <div className={cn(
                      "text-xs",
                      selectedLevel === level ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {config.description}
                    </div>
                  </div>
                  <div className={cn(
                    "text-xs",
                    selectedLevel === level ? "text-white/80" : "text-muted-foreground"
                  )}>
                    {Math.round(config.accuracy * 100)}% aniqlik
                  </div>
                </button>
              );
            })}
          </div>
          
          <Button 
            onClick={startBattle} 
            className={cn(
              "w-full bg-gradient-to-r",
              aiConfig.gradient
            )}
            size="lg"
          >
            <Swords className="mr-2 h-5 w-5" />
            {aiConfig.name} bilan Jangga Kirish!
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Battle screen
  const userProgress = ((currentProblemIndex + (gameFinished ? 1 : 0)) / TOTAL_PROBLEMS) * 100;
  const userWon = gameFinished && userScore > aiScore;

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
      <CardContent className="pt-6 space-y-4">
        {/* Battle Header */}
        <div className="grid grid-cols-3 gap-2 items-center">
          {/* User */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="h-12 w-12 mx-auto border-2 border-primary">
                <AvatarFallback className="bg-primary/20">Sen</AvatarFallback>
              </Avatar>
              {userWon && <Crown className="absolute -top-2 -right-2 h-5 w-5 text-amber-500 animate-bounce" />}
            </div>
            <div className="text-sm font-bold mt-1">Sen</div>
            <div className="text-lg font-bold text-primary">{userScore}</div>
          </div>
          
          {/* VS */}
          <div className="text-center">
            <div className="relative">
              <Swords className="h-8 w-8 mx-auto text-cyan-500 animate-pulse" />
              <Flame className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 h-4 w-4 text-orange-500 animate-bounce" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">{timeElapsed.toFixed(1)}s</div>
          </div>
          
          {/* AI */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className={cn(
                "h-12 w-12 mx-auto border-2",
                `border-cyan-500`
              )}>
                <AvatarFallback className={cn(
                  "bg-gradient-to-br",
                  aiConfig.gradient,
                  "text-white"
                )}>
                  {aiConfig.icon}
                </AvatarFallback>
              </Avatar>
              {!userWon && gameFinished && <Crown className="absolute -top-2 -right-2 h-5 w-5 text-amber-500" />}
            </div>
            <div className="text-sm font-bold mt-1 text-cyan-400">{aiConfig.name}</div>
            <div className="text-lg font-bold text-cyan-500">{aiScore}</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs w-8">Sen</span>
            <Progress value={userProgress} className="flex-1 h-3" />
          </div>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-cyan-500" />
            <Progress value={aiProgress} className="flex-1 h-3 [&>div]:bg-cyan-500" />
          </div>
        </div>

        {/* Game Area */}
        {!gameFinished ? (
          <div className="text-center space-y-4">
            {showingNumbers ? (
              <div className="py-8">
                <div className={cn(
                  "text-6xl font-bold transition-all duration-200",
                  currentNumber && currentNumber > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {currentNumber !== null && (
                    currentNumber > 0 ? `+${currentNumber}` : currentNumber
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {displayedNumbers.map((n, i) => (
                    <span key={i} className={cn("mx-1", n > 0 ? "text-green-500" : "text-red-500")}>
                      {n > 0 ? `+${n}` : n}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-lg font-medium">Javobni kiriting:</div>
                <Input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && userAnswer && checkAnswer()}
                  placeholder="?"
                  className="text-center text-2xl font-bold h-16 max-w-32 mx-auto"
                  autoFocus
                />
                <Button 
                  onClick={checkAnswer} 
                  disabled={!userAnswer}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Tekshirish
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className={cn(
              "text-4xl font-bold",
              userWon ? "text-green-500" : "text-cyan-500"
            )}>
              {userWon ? "🏆 G'alaba!" : `${aiConfig.name} g'olib!`}
            </div>
            <div className="text-lg">
              Sizning ball: <span className="font-bold text-primary">{userScore}</span>
              <br />
              AI ball: <span className="font-bold text-cyan-500">{aiScore}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              To'g'ri javoblar: {userCorrect}/{TOTAL_PROBLEMS} • Vaqt: {timeElapsed.toFixed(1)}s
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button onClick={startBattle} size="lg">
                <Play className="mr-2 h-4 w-4" />
                Qayta o'ynash
              </Button>
              <Button onClick={resetGame} variant="outline" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Boshqa AI
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIGhostBattle;