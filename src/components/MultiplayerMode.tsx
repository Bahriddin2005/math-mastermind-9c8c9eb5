import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Crown, Play, Copy, Check, Clock, Trophy, ArrowLeft, Loader2, Settings, Zap, Calculator, Target, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useConfetti } from '@/hooks/useConfetti';

type FormulaType = 'oddiy' | 'formula5' | 'formula10plus' | 'formula10minus' | 'hammasi';

interface Room {
  id: string;
  room_code: string;
  host_id: string;
  status: 'waiting' | 'playing' | 'finished';
  formula_type: string;
  digit_count: number;
  speed: number;
  problem_count: number;
  current_problem: number;
}

interface Participant {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  answer: number | null;
  is_correct: boolean | null;
  answer_time: number | null;
  score: number;
  is_ready: boolean;
}

// Formula qoidalari
const RULES_ALL: Record<number, { add: number[]; subtract: number[] }> = {
  0: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [] },
  1: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1] },
  2: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2] },
  3: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3] },
  4: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3, 4] },
  5: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3, 4, 5] },
  6: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3, 4, 5, 6] },
  7: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3, 4, 5, 6, 7] },
  8: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3, 4, 5, 6, 7, 8] },
  9: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
};

interface MultiplayerModeProps {
  onBack: () => void;
}

export const MultiplayerMode = ({ onBack }: MultiplayerModeProps) => {
  const { user } = useAuth();
  const { triggerAchievementConfetti } = useConfetti();
  const [view, setView] = useState<'menu' | 'create' | 'join' | 'lobby' | 'playing' | 'results'>('menu');
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null } | null>(null);
  const [answeredParticipants, setAnsweredParticipants] = useState<Set<string>>(new Set());
  
  // O'yin sozlamalari
  const [formulaType, setFormulaType] = useState<FormulaType>('oddiy');
  const [digitCount, setDigitCount] = useState(1);
  const [speed, setSpeed] = useState(0.5);
  const [problemCount, setProblemCount] = useState(5);
  
  // O'yin holati
  const [currentDisplay, setCurrentDisplay] = useState<string | null>(null);
  const [isAddition, setIsAddition] = useState(true);
  const [displayedNumbers, setDisplayedNumbers] = useState<{ num: string; isAdd: boolean }[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  
  const runningResultRef = useRef(0);
  const countRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Profilni yuklash
  useEffect(() => {
    if (!user) return;
    
    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    };
    
    loadProfile();
  }, [user]);

  // Realtime obunalar
  useEffect(() => {
    if (!room) return;

    // Xona yangilanishlarini kuzatish
    const roomChannel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'multiplayer_rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          console.log('Room update:', payload);
          if (payload.eventType === 'UPDATE') {
            const newRoom = payload.new as Room;
            setRoom(newRoom);
            
            if (newRoom.status === 'playing' && view === 'lobby') {
              setView('playing');
              startGameSequence(newRoom);
            }
          }
          if (payload.eventType === 'DELETE') {
            toast.error('Xona yopildi');
            resetState();
          }
        }
      )
      .subscribe();

    // Ishtirokchilar yangilanishlarini kuzatish
    const participantsChannel = supabase
      .channel(`participants-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'multiplayer_participants',
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          // Ishtirokchilarni qayta yuklash
          const { data } = await supabase
            .from('multiplayer_participants')
            .select('*')
            .eq('room_id', room.id)
            .order('score', { ascending: false });
          
          if (data) {
            setParticipants(data as Participant[]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [room?.id, view]);

  // Boshqa o'yinchilar javob berganini kuzatish (o'yin davomida)
  useEffect(() => {
    if (!room || !user || view !== 'playing' || currentDisplay !== null || hasAnswered) return;
    
    const checkAnswers = async () => {
      const { data } = await supabase
        .from('multiplayer_participants')
        .select('user_id, answer')
        .eq('room_id', room.id)
        .not('answer', 'is', null);
      
      if (data) {
        const answered = new Set(data.map(p => p.user_id));
        setAnsweredParticipants(answered);
      }
    };
    
    const interval = setInterval(checkAnswers, 500);
    return () => clearInterval(interval);
  }, [room?.id, user?.id, view, currentDisplay, hasAnswered]);

  // Confetti animatsiyasini natijalar sahifasida ishga tushirish
  useEffect(() => {
    if (view === 'results' && participants.length > 0) {
      const sorted = [...participants].sort((a, b) => {
        if (a.is_correct && !b.is_correct) return -1;
        if (!a.is_correct && b.is_correct) return 1;
        return (a.answer_time || 999) - (b.answer_time || 999);
      });
      
      if (sorted.length > 0 && sorted[0].is_correct) {
        triggerAchievementConfetti();
      }
    }
  }, [view, participants, triggerAchievementConfetti]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const resetState = () => {
    setRoom(null);
    setParticipants([]);
    setRoomCode('');
    setView('menu');
    setCurrentDisplay(null);
    setDisplayedNumbers([]);
    setUserAnswer('');
    setHasAnswered(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Xona yaratish
  const createRoom = async () => {
    if (!user || !profile) return;
    
    setLoading(true);
    try {
      const code = generateRoomCode();
      
      const { data: roomData, error: roomError } = await supabase
        .from('multiplayer_rooms')
        .insert({
          host_id: user.id,
          room_code: code,
          formula_type: formulaType,
          digit_count: digitCount,
          speed,
          problem_count: problemCount,
        })
        .select()
        .single();
      
      if (roomError) throw roomError;
      
      // Xonaga qo'shilish
      const { error: participantError } = await supabase
        .from('multiplayer_participants')
        .insert({
          room_id: roomData.id,
          user_id: user.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
        });
      
      if (participantError) throw participantError;
      
      setRoom(roomData as Room);
      setRoomCode(code);
      setView('lobby');
      
      // Ishtirokchilarni yuklash
      const { data: participantsData } = await supabase
        .from('multiplayer_participants')
        .select('*')
        .eq('room_id', roomData.id);
      
      if (participantsData) {
        setParticipants(participantsData as Participant[]);
      }
      
      toast.success('Xona yaratildi!');
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Xona yaratishda xato');
    } finally {
      setLoading(false);
    }
  };

  // Xonaga qo'shilish
  const joinRoom = async () => {
    if (!user || !profile || !roomCode.trim()) return;
    
    setLoading(true);
    try {
      const { data: roomData, error: roomError } = await supabase
        .from('multiplayer_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .single();
      
      if (roomError || !roomData) {
        toast.error('Xona topilmadi yoki o\'yin boshlangan');
        return;
      }
      
      const { error: participantError } = await supabase
        .from('multiplayer_participants')
        .insert({
          room_id: roomData.id,
          user_id: user.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
        });
      
      if (participantError) {
        if (participantError.code === '23505') {
          toast.error('Siz allaqachon bu xonadasiz');
        } else {
          throw participantError;
        }
        return;
      }
      
      setRoom(roomData as Room);
      setView('lobby');
      
      // Ishtirokchilarni yuklash
      const { data: participantsData } = await supabase
        .from('multiplayer_participants')
        .select('*')
        .eq('room_id', roomData.id);
      
      if (participantsData) {
        setParticipants(participantsData as Participant[]);
      }
      
      toast.success('Xonaga qo\'shildingiz!');
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Xonaga qo\'shilishda xato');
    } finally {
      setLoading(false);
    }
  };

  // O'yinni boshlash (faqat host)
  const startGame = async () => {
    if (!room || room.host_id !== user?.id) return;
    
    await supabase
      .from('multiplayer_rooms')
      .update({ 
        status: 'playing',
        started_at: new Date().toISOString(),
      })
      .eq('id', room.id);
  };

  // O'yin ketma-ketligini boshlash
  const startGameSequence = useCallback((gameRoom: Room) => {
    const maxInitial = Math.pow(10, gameRoom.digit_count) - 1;
    const minInitial = gameRoom.digit_count === 1 ? 1 : Math.pow(10, gameRoom.digit_count - 1);
    const initialResult = Math.floor(Math.random() * (maxInitial - minInitial + 1)) + minInitial;
    
    runningResultRef.current = initialResult;
    countRef.current = 1;
    startTimeRef.current = Date.now();
    
    setCurrentDisplay(String(initialResult));
    setDisplayedNumbers([{ num: String(initialResult), isAdd: true }]);
    setIsAddition(true);
    setUserAnswer('');
    setHasAnswered(false);
    setElapsedTime(0);
    
    // Taymer
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 100) / 10);
    }, 100);
    
    const speedMs = gameRoom.speed * 1000;
    
    intervalRef.current = setInterval(() => {
      countRef.current += 1;
      
      if (countRef.current > gameRoom.problem_count) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setCurrentDisplay(null);
        return;
      }
      
      const result = generateNextNumber(gameRoom.digit_count);
      if (result !== null) {
        setCurrentDisplay(String(result.num));
        setDisplayedNumbers(prev => [...prev, { num: String(result.num), isAdd: result.isAdd }]);
        setIsAddition(result.isAdd);
      }
    }, speedMs);
  }, []);

  const generateNextNumber = (digits: number) => {
    const currentResult = runningResultRef.current;
    const lastDigit = Math.abs(currentResult) % 10;
    const rules = RULES_ALL[lastDigit];
    
    if (!rules) return null;
    
    const possibleOperations: { number: number; isAdd: boolean }[] = [];
    
    rules.add.forEach(num => {
      possibleOperations.push({ number: num, isAdd: true });
    });
    
    rules.subtract.forEach(num => {
      possibleOperations.push({ number: num, isAdd: false });
    });
    
    if (possibleOperations.length === 0) return null;
    
    const randomOp = possibleOperations[Math.floor(Math.random() * possibleOperations.length)];
    
    let finalNumber = randomOp.number;
    if (digits > 1) {
      const multiplier = Math.pow(10, Math.floor(Math.random() * digits));
      finalNumber = randomOp.number * Math.min(multiplier, Math.pow(10, digits - 1));
    }
    
    if (randomOp.isAdd) {
      runningResultRef.current += finalNumber;
    } else {
      runningResultRef.current -= finalNumber;
    }
    
    return { num: finalNumber, isAdd: randomOp.isAdd };
  };

  // Javobni yuborish
  const submitAnswer = async () => {
    if (!user || !room || hasAnswered) return;
    
    const userNum = parseInt(userAnswer, 10);
    const correctAnswer = runningResultRef.current;
    const isCorrect = userNum === correctAnswer;
    const answerTime = (Date.now() - startTimeRef.current) / 1000;
    
    setHasAnswered(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Javobni saqlash
    await supabase
      .from('multiplayer_participants')
      .update({
        answer: userNum,
        is_correct: isCorrect,
        answer_time: answerTime,
        score: isCorrect ? 10 : 0,
      })
      .eq('room_id', room.id)
      .eq('user_id', user.id);
    
    toast(isCorrect ? "To'g'ri javob!" : "Noto'g'ri", {
      description: `To'g'ri javob: ${correctAnswer}`,
    });
    
    // Natijalarni ko'rsatish
    setTimeout(() => {
      setView('results');
    }, 2000);
  };

  // Xonadan chiqish
  const leaveRoom = async () => {
    if (!room || !user) return;
    
    await supabase
      .from('multiplayer_participants')
      .delete()
      .eq('room_id', room.id)
      .eq('user_id', user.id);
    
    // Agar host bo'lsa, xonani o'chirish
    if (room.host_id === user.id) {
      await supabase
        .from('multiplayer_rooms')
        .delete()
        .eq('id', room.id);
    }
    
    resetState();
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode || room?.room_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Kod nusxalandi!');
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <Users className="h-16 w-16 mx-auto text-muted-foreground" />
        <h2 className="text-xl font-bold">Multiplayer rejimi</h2>
        <p className="text-muted-foreground">Multiplayer o'yinida qatnashish uchun tizimga kiring</p>
        <Button onClick={onBack} variant="outline">Orqaga</Button>
      </div>
    );
  }

  // O'yin davomida - sonlar pastroqda alohida oynada
  if (view === 'playing' && currentDisplay !== null) {
    const displayNumber = !isAddition && countRef.current > 1 
      ? `-${currentDisplay}` 
      : `+${currentDisplay}`;
    
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
        {/* Yuqori qism - timer va o'yinchilar */}
        <div className="flex-1 flex items-start justify-between p-4 md:p-6">
          <div className="flex gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-border/50 shadow-lg">
            {participants.map((p) => (
              <Avatar key={p.id} className="h-10 w-10 border-2 border-primary shadow-md">
                <AvatarImage src={p.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold">
                  {p.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-2xl font-mono text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 shadow-lg">
            <Clock className="h-6 w-6 text-primary" />
            <span className="font-bold">{elapsedTime.toFixed(1)}s</span>
          </div>
        </div>
        
        {/* Pastki qism - sonlar oynasi */}
        <div className="w-full pb-20 md:pb-24">
          <div className="container max-w-4xl mx-auto px-4">
            {/* Alohida oyna */}
            <div 
              key={currentDisplay}
              className="relative bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20 rounded-3xl shadow-2xl p-8 md:p-12 animate-fade-in overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              </div>
              
              {/* Son ko'rsatish */}
              <div className="relative z-10 text-center">
                <span 
                  className="text-[120px] sm:text-[150px] md:text-[180px] lg:text-[220px] font-light text-foreground tracking-tight inline-block"
                  style={{ 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    textShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    animation: 'numberPop 0.4s ease-out',
                  }}
                >
                  <span className={!isAddition && countRef.current > 1 ? 'text-red-500' : 'text-green-500'}>
                    {!isAddition && countRef.current > 1 ? '-' : '+'}
                  </span>
                  <span className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    {currentDisplay}
                  </span>
                </span>
              </div>
              
              {/* Progress indicator */}
              {room && (
                <div className="relative z-10 mt-6 flex items-center justify-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: room.problem_count }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i < countRef.current
                            ? 'bg-primary w-8'
                            : 'bg-muted w-2'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes numberPop {
            0% {
              transform: scale(0.5);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  // Javob kiritish - pastroqda alohida oynada
  if (view === 'playing' && currentDisplay === null && !hasAnswered) {
    const otherAnswered = participants.filter(p => 
      p.user_id !== user?.id && answeredParticipants.has(p.user_id)
    );

    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
        {/* Yuqori qism - bo'sh */}
        <div className="flex-1" />
        
        {/* Pastki qism - javob kiritish oynasi */}
        <div className="w-full pb-20 md:pb-24">
          <div className="container max-w-2xl mx-auto px-4">
            {/* Alohida oyna */}
            <div className="relative bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20 rounded-3xl shadow-2xl p-6 md:p-8 animate-fade-in overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              </div>
              
              <div className="relative z-10 space-y-6">
                {/* Sarlavha */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Javobingizni kiriting!
                  </h2>
                  <p className="text-sm text-muted-foreground">Vaqtingiz tugayapti, tezroq javob bering</p>
                </div>
                
                {/* Boshqa o'yinchilar javob berganini ko'rsatish */}
                {otherAnswered.length > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <p className="text-sm font-medium text-primary">
                        {otherAnswered.length} o'yinchi javob berdi
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {otherAnswered.map((p) => (
                        <div key={p.id} className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-full border border-primary/20">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={p.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">{p.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{p.username}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Kuting animatsiyasi */}
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Boshqa o'yinchilar javob berayapti...</span>
                </div>
                
                {/* Input */}
                <Input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && userAnswer && submitAnswer()}
                  placeholder="Javobingizni kiriting"
                  className="text-center text-3xl md:text-4xl h-16 md:h-20 font-bold border-2 focus:border-primary transition-all rounded-2xl"
                  autoFocus
                />
                
                {/* Tugma */}
                <Button 
                  onClick={submitAnswer} 
                  disabled={!userAnswer} 
                  size="lg" 
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all rounded-2xl"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Javobni yuborish
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Natijalar
  if (view === 'results') {
    const sortedParticipants = [...participants].sort((a, b) => {
      if (a.is_correct && !b.is_correct) return -1;
      if (!a.is_correct && b.is_correct) return 1;
      return (a.answer_time || 999) - (b.answer_time || 999);
    });

    const getPodiumHeight = (position: number) => {
      if (position === 0) return 'h-32'; // 1-o'rin - eng baland
      if (position === 1) return 'h-24'; // 2-o'rin - o'rtacha
      if (position === 2) return 'h-16'; // 3-o'rin - past
      return 'h-12'; // Qolganlar
    };

    const getPodiumColor = (position: number) => {
      if (position === 0) return 'from-amber-400 to-amber-600 border-amber-500';
      if (position === 1) return 'from-slate-300 to-slate-500 border-slate-400';
      if (position === 2) return 'from-orange-300 to-orange-500 border-orange-400';
      return 'from-muted to-muted border-border';
    };

    const getMedal = (position: number) => {
      if (position === 0) return '🥇';
      if (position === 1) return '🥈';
      if (position === 2) return '🥉';
      return null;
    };
    
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4 shadow-lg">
            <Trophy className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-clip-text text-transparent">
            O'yin natijalari
          </h2>
          <p className="text-muted-foreground">G'oliblarni tabriklaymiz! 🎉</p>
        </div>
        
        {/* Podyum dizayni */}
        <div className="flex items-end justify-center gap-4 mb-8">
          {sortedParticipants.slice(0, 3).map((p, index) => {
            const isWinner = index === 0 && p.is_correct;
            return (
              <div
                key={p.id}
                className={`
                  flex flex-col items-center justify-end
                  ${getPodiumHeight(index)}
                  w-full max-w-[200px]
                  bg-gradient-to-t ${getPodiumColor(index)}
                  border-2 rounded-t-2xl
                  shadow-xl
                  animate-in fade-in slide-in-from-bottom-8
                  transition-all duration-500
                  ${isWinner ? 'ring-4 ring-amber-300/50 scale-105' : ''}
                `}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="mb-2 -mt-8">
                  <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
                    <AvatarImage src={p.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-xl">
                      {p.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {getMedal(index) && (
                  <div className="text-4xl mb-2 animate-bounce">
                    {getMedal(index)}
                  </div>
                )}
                <div className="text-center mb-2 px-2">
                  <p className="font-bold text-white text-sm sm:text-base truncate w-full">
                    {p.username}
                  </p>
                  {p.is_correct && (
                    <p className="text-xs text-white/90 mt-1">
                      {p.answer_time?.toFixed(1)}s
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Qolgan o'yinchilar ro'yxati */}
        {sortedParticipants.length > 3 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Qolgan o'yinchilar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedParticipants.slice(3).map((p, index) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-all animate-in fade-in slide-in-from-left-4"
                    style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  >
                    <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                      {index + 4}
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={p.avatar_url || undefined} />
                      <AvatarFallback>{p.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{p.username}</p>
                      <p className="text-sm text-muted-foreground">
                        Javob: {p.answer ?? '-'} | {p.answer_time?.toFixed(1) ?? '-'}s
                      </p>
                    </div>
                    <Badge variant={p.is_correct ? 'default' : 'destructive'} className="text-sm">
                      {p.is_correct ? "To'g'ri" : "Noto'g'ri"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Barcha o'yinchilar ro'yxati (3 tadan kam bo'lsa) */}
        {sortedParticipants.length <= 3 && sortedParticipants.length > 0 && (
          <div className="space-y-3">
            {sortedParticipants.map((p, index) => (
              <Card
                key={p.id}
                className={`
                  border-2 transition-all
                  ${index === 0 && p.is_correct ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' : ''}
                  ${index === 1 ? 'border-slate-400 bg-slate-50/50 dark:bg-slate-950/20' : ''}
                  ${index === 2 ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-950/20' : ''}
                `}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-2xl font-bold text-muted-foreground w-8">
                    {index + 1}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={p.avatar_url || undefined} />
                    <AvatarFallback>{p.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{p.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Javob: {p.answer ?? '-'} | {p.answer_time?.toFixed(1) ?? '-'}s
                    </p>
                  </div>
                  <Badge variant={p.is_correct ? 'default' : 'destructive'}>
                    {p.is_correct ? "To'g'ri" : "Noto'g'ri"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="flex gap-4 pt-4">
          <Button 
            onClick={resetState} 
            variant="outline" 
            className="flex-1 h-12 text-base font-semibold"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Menyuga qaytish
          </Button>
        </div>
      </div>
    );
  }

  // Lobby
  if (view === 'lobby' && room) {
    const isHost = room.host_id === user.id;
    
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={leaveRoom} variant="ghost" size="sm" className="hover:bg-destructive/10 hover:text-destructive">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Chiqish
          </Button>
          <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
            <Users className="h-4 w-4 mr-1.5" />
            {participants.length} o'yinchi
          </Badge>
        </div>
        
        {/* Xona kodi kartasi */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader className="text-center pb-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
              <Copy className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Xona kodi</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="px-6 py-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
                <span className="text-5xl font-mono font-bold tracking-[0.2em] bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {room.room_code}
                </span>
              </div>
              <Button 
                onClick={copyRoomCode} 
                variant="outline" 
                size="icon"
                className="h-12 w-12 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
              >
                {copied ? <Check className="h-6 w-6 text-green-500" /> : <Copy className="h-6 w-6" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Kodni do'stlaringizga yuboring va ularni taklif qiling
            </p>
          </CardContent>
        </Card>
        
        {/* O'yinchilar ro'yxati */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">O'yinchilar</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {participants.map((p, index) => {
                const isParticipantHost = p.user_id === room.host_id;
                return (
                  <div 
                    key={p.id} 
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300
                      ${isParticipantHost 
                        ? 'bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-300/50 shadow-md' 
                        : 'bg-muted/30 hover:bg-muted/50 border-border/50 hover:border-primary/30'
                      }
                      animate-in fade-in slide-in-from-left-4
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                        <AvatarImage src={p.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg">
                          {p.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isParticipantHost && (
                        <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-background">
                          <Crown className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base truncate">{p.username}</span>
                        {isParticipantHost && (
                          <Badge variant="default" className="bg-amber-500 text-white text-xs px-2 py-0.5">
                            Host
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isParticipantHost ? 'Xona egasi' : 'O\'yinchi'}
                      </p>
                    </div>
                    {p.is_ready && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">
                        <Check className="h-3 w-3 mr-1" />
                        Tayyor
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* O'yinni boshlash tugmasi */}
        {isHost && (
          <Button 
            onClick={startGame} 
            size="lg" 
            className={`
              w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300
              ${participants.length >= 2 
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
              }
            `}
            disabled={participants.length < 2}
          >
            <Play className="h-5 w-5 mr-2" />
            {participants.length < 2 
              ? `Yana ${2 - participants.length} o'yinchi kerak` 
              : 'O\'yinni boshlash'
            }
          </Button>
        )}
        
        {!isHost && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5 animate-pulse" />
                <p className="font-medium">
                  Host o'yinni boshlashini kuting...
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Xona yaratish
  if (view === 'create') {
    const formulaLabels: Record<string, string> = {
      'oddiy': 'Oddiy',
      'formula5': 'Formula 5',
      'formula10plus': 'Formula 10+',
      'formula10minus': 'Formula 10-',
      'hammasi': 'Hammasi'
    };

    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => setView('menu')} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
        </div>
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-2">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Xona sozlamalari
          </h2>
          <p className="text-muted-foreground">O'yin parametrlarini tanlang</p>
        </div>
        
        <div className="grid gap-6">
          {/* Misol turi */}
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Misol turi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup value={formulaType} onValueChange={(v) => setFormulaType(v as FormulaType)} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['oddiy', 'formula5', 'formula10plus', 'formula10minus', 'hammasi'].map((type) => (
                  <div key={type} className="flex items-center">
                    <RadioGroupItem value={type} id={`create-${type}`} className="peer sr-only" />
                    <Label
                      htmlFor={`create-${type}`}
                      className="flex-1 px-4 py-3 border-2 rounded-xl cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-primary/5 hover:border-primary/30 peer-data-[state=checked]:bg-gradient-to-r peer-data-[state=checked]:from-primary peer-data-[state=checked]:to-primary/80 peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-md"
                    >
                      {formulaLabels[type]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
          
          {/* Son xonasi */}
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Son xonasi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup value={String(digitCount)} onValueChange={(v) => setDigitCount(Number(v))} className="flex gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="flex-1">
                    <RadioGroupItem value={String(num)} id={`digit-create-${num}`} className="peer sr-only" />
                    <Label
                      htmlFor={`digit-create-${num}`}
                      className="flex flex-col items-center justify-center px-6 py-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-primary/5 hover:border-primary/30 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-primary peer-data-[state=checked]:to-primary/80 peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-lg"
                    >
                      <span className="text-2xl font-bold">{num}</span>
                      <span className="text-xs mt-1">xonali</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
          
          {/* Tezlik */}
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Tezlik</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup value={String(speed)} onValueChange={(v) => setSpeed(Number(v))} className="grid grid-cols-4 gap-3">
                {[0.3, 0.5, 0.7, 1].map((s) => (
                  <div key={s}>
                    <RadioGroupItem value={String(s)} id={`speed-create-${s}`} className="peer sr-only" />
                    <Label
                      htmlFor={`speed-create-${s}`}
                      className="flex flex-col items-center justify-center px-4 py-3 border-2 rounded-xl cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-primary/5 hover:border-primary/30 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-primary peer-data-[state=checked]:to-primary/80 peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-md"
                    >
                      <span className="text-lg font-bold">{s}</span>
                      <span className="text-xs">soniya</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
          
          {/* Sonlar soni */}
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Masalalar soni</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup value={String(problemCount)} onValueChange={(v) => setProblemCount(Number(v))} className="grid grid-cols-4 gap-3">
                {[3, 5, 7, 10].map((num) => (
                  <div key={num}>
                    <RadioGroupItem value={String(num)} id={`count-create-${num}`} className="peer sr-only" />
                    <Label
                      htmlFor={`count-create-${num}`}
                      className="flex flex-col items-center justify-center px-4 py-3 border-2 rounded-xl cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-primary/5 hover:border-primary/30 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-primary peer-data-[state=checked]:to-primary/80 peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-md"
                    >
                      <span className="text-lg font-bold">{num}</span>
                      <span className="text-xs">ta</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
        
        <Button 
          onClick={createRoom} 
          size="lg" 
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg font-semibold h-14 shadow-lg hover:shadow-xl transition-all duration-300" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Yaratilmoqda...
            </>
          ) : (
            <>
              <Crown className="h-5 w-5 mr-2" />
              Xona yaratish
            </>
          )}
        </Button>
      </div>
    );
  }

  // Xonaga qo'shilish
  if (view === 'join') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <Button onClick={() => setView('menu')} variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Orqaga
        </Button>
        
        <h2 className="text-2xl font-bold">Xonaga qo'shilish</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Xona kodi</Label>
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABCDEF"
              className="text-center text-2xl font-mono uppercase tracking-widest"
              maxLength={6}
            />
          </div>
        </div>
        
        <Button 
          onClick={joinRoom} 
          size="lg" 
          className="w-full" 
          disabled={loading || roomCode.length < 6}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Qo'shilish
        </Button>
      </div>
    );
  }

  // Asosiy menyu
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <Button onClick={onBack} variant="ghost" size="sm">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Orqaga
      </Button>
      
      <div className="text-center space-y-2">
        <Users className="h-16 w-16 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Multiplayer</h2>
        <p className="text-muted-foreground">
          Do'stlaringiz bilan raqobatlashing!
        </p>
      </div>
      
      <div className="grid gap-4">
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setView('create')}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Xona yaratish</h3>
              <p className="text-sm text-muted-foreground">Yangi o'yin xonasi oching</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setView('join')}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Xonaga qo'shilish</h3>
              <p className="text-sm text-muted-foreground">Kod orqali o'yinga qo'shiling</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};