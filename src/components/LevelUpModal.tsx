import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Star, Sparkles, Trophy, Zap, ArrowUp, Gift, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useSound } from '@/hooks/useSound';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  rewards?: {
    xp?: number;
    coins?: number;
    energy?: number;
  };
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Yangi Boshlovchi',
  2: 'O\'rganuvchi',
  3: 'Mashqchi',
  4: 'Hisobchi',
  5: 'Tez Hisobchi',
  6: 'Super Hisobchi',
  7: 'Matematik',
  8: 'Super Matematik',
  9: 'Ustoz',
  10: 'Grandmaster',
};

const getLevelTitle = (level: number): string => {
  if (level <= 10) return LEVEL_TITLES[level] || 'Ustoz';
  if (level <= 20) return 'Elite Ustoz';
  if (level <= 30) return 'Legend';
  return 'Afsonaviy Ustoz';
};

const getLevelColor = (level: number): string => {
  if (level <= 3) return 'from-green-500 to-emerald-500';
  if (level <= 6) return 'from-blue-500 to-cyan-500';
  if (level <= 9) return 'from-purple-500 to-violet-500';
  if (level <= 15) return 'from-amber-500 to-orange-500';
  if (level <= 20) return 'from-pink-500 to-rose-500';
  return 'from-yellow-400 via-amber-500 to-orange-600';
};

export const LevelUpModal = ({ isOpen, onClose, newLevel, rewards }: LevelUpModalProps) => {
  const [showContent, setShowContent] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    if (isOpen) {
      // Play sound
      playSound('levelUp');
      
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Confetti from both sides
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#FFA500', '#45B7D1', '#FF6B6B'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#4ECDC4', '#96CEB4', '#9B59B6', '#E74C3C'],
        });
      }, 250);

      // Show content with delay
      setTimeout(() => setShowContent(true), 300);

      return () => clearInterval(interval);
    } else {
      setShowContent(false);
    }
  }, [isOpen, playSound]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-0 bg-transparent p-0 shadow-none">
        <div className={cn(
          "relative rounded-3xl overflow-hidden",
          "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
          "border-2 border-amber-500/50",
          showContent ? "animate-bounce-in" : "opacity-0 scale-50"
        )}>
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Stars */}
            {[...Array(20)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "absolute text-amber-400/30 animate-star-burst",
                )}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${8 + Math.random() * 12}px`,
                  height: `${8 + Math.random() * 12}px`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
            
            {/* Glow rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-500/10 animate-ping" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-amber-500/20 animate-pulse" />
          </div>

          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Level Up Badge */}
            <div className="relative mb-6">
              <div className={cn(
                "inline-flex items-center justify-center w-28 h-28 rounded-full",
                "bg-gradient-to-br shadow-2xl",
                getLevelColor(newLevel),
                "animate-float"
              )}>
                <div className="text-center text-white">
                  <ArrowUp className="h-6 w-6 mx-auto mb-1 animate-bounce" />
                  <span className="text-4xl font-black">{newLevel}</span>
                </div>
              </div>
              
              {/* Crown for high levels */}
              {newLevel >= 5 && (
                <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 h-10 w-10 text-amber-400 animate-bounce" />
              )}
              
              {/* Side flames */}
              <Flame className="absolute top-1/2 -left-4 -translate-y-1/2 h-8 w-8 text-orange-500 animate-float" />
              <Flame className="absolute top-1/2 -right-4 -translate-y-1/2 h-8 w-8 text-orange-500 animate-float" style={{ animationDelay: '0.3s' }} />
            </div>

            {/* Title */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <Sparkles className="h-5 w-5 animate-spin-slow" />
                <span className="text-lg font-bold uppercase tracking-wider">Level Up!</span>
                <Sparkles className="h-5 w-5 animate-spin-slow" />
              </div>
              
              <h2 className="text-3xl font-black text-white">
                {getLevelTitle(newLevel)}
              </h2>
              
              <p className="text-white/60">
                Siz yangi darajaga ko'tarildingiz!
              </p>
            </div>

            {/* Rewards */}
            {rewards && (
              <div className="flex justify-center gap-4 mb-6">
                {rewards.xp && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30">
                    <Zap className="h-5 w-5 text-purple-400" />
                    <span className="text-white font-bold">+{rewards.xp} XP</span>
                  </div>
                )}
                {rewards.coins && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <span className="text-white font-bold">+{rewards.coins}</span>
                  </div>
                )}
                {rewards.energy && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                    <Gift className="h-5 w-5 text-green-400" />
                    <span className="text-white font-bold">+{rewards.energy} ⚡</span>
                  </div>
                )}
              </div>
            )}

            {/* Continue Button */}
            <Button
              onClick={onClose}
              size="lg"
              className={cn(
                "w-full h-14 text-lg font-bold rounded-2xl",
                "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500",
                "hover:from-amber-600 hover:via-orange-600 hover:to-red-600",
                "shadow-lg shadow-orange-500/30",
                "animate-glow-pulse"
              )}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Davom etish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpModal;
