import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Flame, Zap, Star, Sparkles } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

interface ComboEffectProps {
  combo: number;
  showEffect: boolean;
  onEffectComplete?: () => void;
}

export const ComboEffect = ({ combo, showEffect, onEffectComplete }: ComboEffectProps) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [showCombo, setShowCombo] = useState(false);
  const { playSound } = useSound();

  // Generate particles
  const generateParticles = useCallback(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF69B4', '#9B59B6'];
    const newParticles = Array.from({ length: 20 + combo * 5 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, [combo]);

  useEffect(() => {
    if (showEffect && combo >= 2) {
      setShowCombo(true);
      generateParticles();
      
      // Play combo sound
      if (combo >= 5) {
        playSound('levelUp');
      } else if (combo >= 3) {
        playSound('combo');
      }
      
      // Clear effect after animation
      const timer = setTimeout(() => {
        setShowCombo(false);
        setParticles([]);
        onEffectComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [showEffect, combo, generateParticles, playSound, onEffectComplete]);

  if (!showCombo) return null;

  const getComboColor = () => {
    if (combo >= 10) return 'from-purple-500 via-pink-500 to-red-500';
    if (combo >= 7) return 'from-amber-500 via-orange-500 to-red-500';
    if (combo >= 5) return 'from-green-500 via-emerald-500 to-teal-500';
    if (combo >= 3) return 'from-blue-500 via-cyan-500 to-teal-500';
    return 'from-primary via-primary to-primary';
  };

  const getComboIcon = () => {
    if (combo >= 10) return <Sparkles className="h-8 w-8" />;
    if (combo >= 7) return <Flame className="h-8 w-8" />;
    if (combo >= 5) return <Star className="h-8 w-8" />;
    return <Zap className="h-8 w-8" />;
  };

  const getComboText = () => {
    if (combo >= 10) return 'LEGENDARY!';
    if (combo >= 7) return 'AMAZING!';
    if (combo >= 5) return 'ON FIRE!';
    if (combo >= 3) return 'COMBO!';
    return 'NICE!';
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-fly-up"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${Math.random() * 0.3}s`,
            animationDuration: `${0.8 + Math.random() * 0.4}s`,
          }}
        >
          <div
            className="w-3 h-3 rounded-full animate-star-burst"
            style={{ backgroundColor: particle.color }}
          />
        </div>
      ))}

      {/* Combo Badge */}
      <div className={cn(
        "relative animate-bounce-in",
        "flex flex-col items-center gap-2"
      )}>
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 blur-3xl opacity-50 animate-glow-pulse",
          `bg-gradient-to-r ${getComboColor()}`
        )} />
        
        {/* Main badge */}
        <div className={cn(
          "relative px-8 py-4 rounded-2xl",
          "bg-gradient-to-r shadow-2xl",
          getComboColor(),
          "animate-shake"
        )}>
          <div className="flex items-center gap-3 text-white">
            <div className="animate-spin-slow">
              {getComboIcon()}
            </div>
            <div className="text-center">
              <div className="text-3xl font-black tracking-wider animate-combo-flash">
                {getComboText()}
              </div>
              <div className="text-5xl font-black">
                x{combo}
              </div>
            </div>
            <div className="animate-spin-slow" style={{ animationDirection: 'reverse' }}>
              {getComboIcon()}
            </div>
          </div>
        </div>

        {/* Ring effect */}
        <div className={cn(
          "absolute inset-0 rounded-2xl border-4 animate-ping opacity-50",
          combo >= 10 ? "border-pink-500" :
          combo >= 7 ? "border-orange-500" :
          combo >= 5 ? "border-green-500" :
          "border-blue-500"
        )} />
      </div>

      {/* Side flames for high combos */}
      {combo >= 5 && (
        <>
          <div className="absolute left-10 top-1/2 -translate-y-1/2 animate-float">
            <Flame className={cn(
              "h-16 w-16",
              combo >= 10 ? "text-pink-500" :
              combo >= 7 ? "text-orange-500" :
              "text-amber-500"
            )} />
          </div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '0.2s' }}>
            <Flame className={cn(
              "h-16 w-16",
              combo >= 10 ? "text-pink-500" :
              combo >= 7 ? "text-orange-500" :
              "text-amber-500"
            )} />
          </div>
        </>
      )}

      {/* Star burst for legendary */}
      {combo >= 10 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <Star
              key={i}
              className="absolute h-6 w-6 text-amber-400 animate-star-burst"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-100px)`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ComboEffect;
