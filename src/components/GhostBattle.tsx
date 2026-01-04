import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Ghost, Swords, Trophy, Clock, Zap, Play, RotateCcw, Crown, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSound } from '@/hooks/useSound';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GhostPlayer {
  id: string;
  username: string;
  avatar_url: string | null;
  score: number;
  correct: number;
  total_time: number;
  created_at: string;
}

interface Problem {
  numbers: number[];
  answer: number;
}

export const GhostBattle = () => {
  const { user } = useAuth();
  const { playSound } = useSound();
  
  const [ghostPlayers, setGhostPlayers] = useState<GhostPlayer[]>([]);
  const [selectedGhost, setSelectedGhost] = useState<GhostPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  
  // Game state
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [userScore, setUserScore] = useState(0);
  const [userCorrect, setUserCorrect] = useState(0);
  const [ghostProgress, setGhostProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showingNumbers, setShowingNumbers] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [displayedNumbers, setDisplayedNumbers] = useState<number[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const TOTAL_PROBLEMS = 5;
  const NUMBER_SPEED = 800; // ms per number
  const NUMBERS_PER_PROBLEM = 5;

  // Load ghost players
  useEffect(() => {
    const loadGhostPlayers = async () => {
      setIsLoading(true);
      try {
        // Get recent game sessions with good scores
        const { data: sessions } = await supabase
          .from('game_sessions')
          .select('user_id, score, correct, total_time, created_at')
          .eq('section', 'mental-arithmetic')
          .gte('correct', 1)
          .order('created_at', { ascending: false })
          .limit(20);

        if (sessions && sessions.length > 0) {
          // Get unique user ids
          const userIds = [...new Set(sessions.map(s => s.user_id))];
          
          // Get user profiles
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, username, avatar_url')
            .in('user_id', userIds);

          const ghostData: GhostPlayer[] = sessions
            .filter(s => s.user_id !== user?.id) // Exclude current user
            .slice(0, 5)
            .map(session => {
              const profile = profiles?.find(p => p.user_id === session.user_id);
              return {
                id: session.user_id,
                username: profile?.username || 'O\'yinchi',
                avatar_url: profile?.avatar_url,
                score: session.score || 0,
                correct: session.correct || 0,
                total_time: session.total_time || 0,
                created_at: session.created_at,
              };
            });

          setGhostPlayers(ghostData);
        }
      } catch (error) {
        console.error('Error loading ghost players:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadGhostPlayers();
    }
  }, [user]);

  // Generate problems
  const generateProblems = useCallback(() => {
    const newProblems: Problem[] = [];
    
    for (let i = 0; i < TOTAL_PROBLEMS; i++) {
      const numbers: number[] = [];
      let sum = Math.floor(Math.random() * 9) + 1; // Start with 1-9
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

  // Start battle
  const startBattle = useCallback(() => {
    if (!selectedGhost) return;
    
    playSound('start');
    const newProblems = generateProblems();
    setProblems(newProblems);
    setCurrentProblemIndex(0);
    setUserScore(0);
    setUserCorrect(0);
    setGhostProgress(0);
    setTimeElapsed(0);
    setGameStarted(true);
    setGameFinished(false);
    startTimeRef.current = Date.now();
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 0.1);
    }, 100);
    
    // Simulate ghost progress
    const ghostTime = selectedGhost.total_time || 30;
    const ghostInterval = (ghostTime * 1000) / TOTAL_PROBLEMS;
    
    let ghostIdx = 0;
    intervalRef.current = setInterval(() => {
      ghostIdx++;
      setGhostProgress((ghostIdx / TOTAL_PROBLEMS) * 100);
      
      if (ghostIdx >= TOTAL_PROBLEMS) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, ghostInterval);
    
    // Show first problem
    showProblem(newProblems[0]);
  }, [selectedGhost, generateProblems, playSound]);

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
    
    // Next problem or finish
    if (currentProblemIndex < TOTAL_PROBLEMS - 1) {
      setCurrentProblemIndex(prev => prev + 1);
      showProblem(problems[currentProblemIndex + 1]);
    } else {
      finishGame(isCorrect);
    }
  }, [currentProblemIndex, problems, userAnswer, playSound, showProblem]);

  // Save battle result to database
  const saveBattleResult = useCallback(async (
    finalScore: number,
    finalCorrect: number,
    finalTime: number,
    isWinner: boolean
  ) => {
    if (!user || !selectedGhost) return;

    try {
      await supabase.from('ghost_battle_results').insert({
        user_id: user.id,
        ghost_user_id: selectedGhost.id,
        ghost_username: selectedGhost.username,
        user_score: finalScore,
        ghost_score: selectedGhost.score,
        user_correct: finalCorrect,
        ghost_correct: selectedGhost.correct,
        user_time: finalTime,
        ghost_time: selectedGhost.total_time,
        is_winner: isWinner,
      });
    } catch (error) {
      console.error('Error saving battle result:', error);
    }
  }, [user, selectedGhost]);

  // Finish game
  const finishGame = useCallback((lastCorrect: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const finalCorrect = userCorrect + (lastCorrect ? 1 : 0);
    const finalScore = userScore + (lastCorrect ? 10 : 0);
    const finalTime = (Date.now() - startTimeRef.current) / 1000;
    const userWon = finalScore > (selectedGhost?.score || 0);
    
    playSound(userWon ? 'winner' : 'incorrect');
    setGameFinished(true);
    setUserCorrect(finalCorrect);
    setUserScore(finalScore);
    
    // Save result to database
    saveBattleResult(finalScore, finalCorrect, finalTime, userWon);
    
    if (userWon) {
      toast.success("🏆 Siz g'olib bo'ldingiz!", { duration: 3000 });
    } else {
      toast.info("Keyingi safar yutasiz! 💪", { duration: 3000 });
    }
  }, [userCorrect, userScore, selectedGhost, playSound, saveBattleResult]);

  // Reset game
  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setGameStarted(false);
    setGameFinished(false);
    setSelectedGhost(null);
    setCurrentProblemIndex(0);
    setUserAnswer('');
    setUserScore(0);
    setUserCorrect(0);
    setGhostProgress(0);
    setTimeElapsed(0);
    setShowingNumbers(false);
    setCurrentNumber(null);
    setDisplayedNumbers([]);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Ghost selection screen
  if (!gameStarted) {
    return (
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ghost className="h-5 w-5 text-purple-500" />
            Ghost Battle - Arvoh bilan Raqobat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Oldingi o'yinchilar natijalari bilan raqobatlashing! Ularning vaqtini yengib o'ting.
          </p>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : ghostPlayers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ghost className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Hozircha raqiblar yo'q</p>
              <p className="text-xs">Oldin biroz mashq qiling!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Raqib tanlang:</p>
              {ghostPlayers.map((ghost) => (
                <button
                  key={ghost.id + ghost.created_at}
                  onClick={() => setSelectedGhost(ghost)}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3",
                    selectedGhost?.id === ghost.id && selectedGhost?.created_at === ghost.created_at
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-border hover:border-purple-500/50"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={ghost.avatar_url || ''} />
                      <AvatarFallback>{ghost.username[0]}</AvatarFallback>
                    </Avatar>
                    <Ghost className="absolute -bottom-1 -right-1 h-4 w-4 text-purple-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{ghost.username}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-amber-500" />
                        {ghost.score} ball
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ghost.total_time.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                  <Swords className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
          
          {selectedGhost && (
            <Button 
              onClick={startBattle} 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              size="lg"
            >
              <Swords className="mr-2 h-5 w-5" />
              Jangga Kirish!
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Battle screen
  const userProgress = ((currentProblemIndex + (gameFinished ? 1 : 0)) / TOTAL_PROBLEMS) * 100;
  const userWon = gameFinished && userScore > (selectedGhost?.score || 0);

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
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
              <Swords className="h-8 w-8 mx-auto text-amber-500 animate-pulse" />
              <Flame className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 h-4 w-4 text-orange-500 animate-bounce" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">{timeElapsed.toFixed(1)}s</div>
          </div>
          
          {/* Ghost */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="h-12 w-12 mx-auto border-2 border-purple-500 opacity-70">
                <AvatarImage src={selectedGhost?.avatar_url || ''} />
                <AvatarFallback>{selectedGhost?.username[0]}</AvatarFallback>
              </Avatar>
              <Ghost className="absolute -bottom-1 -right-1 h-5 w-5 text-purple-500" />
              {!userWon && gameFinished && <Crown className="absolute -top-2 -right-2 h-5 w-5 text-amber-500" />}
            </div>
            <div className="text-sm font-bold mt-1 text-purple-400">{selectedGhost?.username}</div>
            <div className="text-lg font-bold text-purple-500">{selectedGhost?.score}</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs w-8">Sen</span>
            <Progress value={userProgress} className="flex-1 h-3" />
          </div>
          <div className="flex items-center gap-2">
            <Ghost className="h-4 w-4 text-purple-500" />
            <Progress value={ghostProgress} className="flex-1 h-3 [&>div]:bg-purple-500" />
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
              userWon ? "text-green-500" : "text-amber-500"
            )}>
              {userWon ? "🏆 G'alaba!" : "Yaxshi urinish!"}
            </div>
            <div className="text-lg">
              Sizning ball: <span className="font-bold text-primary">{userScore}</span>
              <br />
              Raqib ball: <span className="font-bold text-purple-500">{selectedGhost?.score}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              To'g'ri javoblar: {userCorrect}/{TOTAL_PROBLEMS}
              <br />
              Vaqt: {timeElapsed.toFixed(1)} sekund
            </div>
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Qayta o'ynash
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GhostBattle;
