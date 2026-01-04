import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Flame, Zap, Star, Sparkles, Crown, Skull, Rocket, Target, Trophy } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import confetti from 'canvas-confetti';

interface ComboEffectProps {
  combo: number;
  showEffect: boolean;
  onEffectComplete?: () => void;
}

// Combo tier configuration
const COMBO_TIERS = {
  nice: { min: 2, max: 4, text: 'NICE!', color: 'from-blue-500 via-cyan-500 to-teal-500', icon: Zap },
  combo: { min: 5, max: 9, text: 'COMBO!', color: 'from-green-500 via-emerald-500 to-teal-500', icon: Star },
  super: { min: 10, max: 14, text: 'SUPER!', color: 'from-amber-500 via-orange-500 to-red-500', icon: Flame },
  mega: { min: 15, max: 19, text: 'MEGA COMBO!', color: 'from-purple-500 via-pink-500 to-red-500', icon: Rocket },
  ultra: { min: 20, max: 29, text: 'ULTRA COMBO!', color: 'from-rose-500 via-red-500 to-orange-500', icon: Crown },
  godlike: { min: 30, max: 49, text: 'GODLIKE!', color: 'from-yellow-400 via-amber-500 to-orange-600', icon: Trophy },
  legendary: { min: 50, max: Infinity, text: 'LEGENDARY!', color: 'from-purple-600 via-pink-500 to-yellow-500', icon: Skull },
};

const getComboTier = (combo: number) => {
  for (const [key, tier] of Object.entries(COMBO_TIERS)) {
    if (combo >= tier.min && combo <= tier.max) {
      return { key, ...tier };
    }
  }
  return { key: 'nice', ...COMBO_TIERS.nice };
};

export const ComboEffect = ({ combo, showEffect, onEffectComplete }: ComboEffectProps) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number; delay: number }[]>([]);
  const [showCombo, setShowCombo] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const { playSound } = useSound();

  // Generate particles based on combo tier
  const generateParticles = useCallback(() => {
    const tier = getComboTier(combo);
    const baseCount = 20;
    const tierMultiplier = tier.key === 'legendary' ? 5 : 
                          tier.key === 'godlike' ? 4 :
                          tier.key === 'ultra' ? 3.5 :
                          tier.key === 'mega' ? 3 :
                          tier.key === 'super' ? 2.5 :
                          tier.key === 'combo' ? 2 : 1.5;

    const colors = tier.key === 'legendary' 
      ? ['#FFD700', '#FF69B4', '#00CED1', '#FF6B6B', '#9B59B6', '#E74C3C']
      : tier.key === 'godlike'
      ? ['#FFD700', '#FFA500', '#FF4500', '#FF6347']
      : tier.key === 'ultra'
      ? ['#FF1493', '#FF69B4', '#FF6B6B', '#DC143C']
      : tier.key === 'mega'
      ? ['#9B59B6', '#8E44AD', '#E74C3C', '#C0392B']
      : tier.key === 'super'
      ? ['#FFA500', '#FF4500', '#FF6347', '#DC143C']
      : tier.key === 'combo'
      ? ['#2ECC71', '#27AE60', '#1ABC9C', '#16A085']
      : ['#3498DB', '#2980B9', '#00CED1', '#4ECDC4'];

    const particleCount = Math.floor(baseCount * tierMultiplier);
    
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 4,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, [combo]);

  // Trigger screen shake for high combos
  const triggerScreenShake = useCallback(() => {
    const tier = getComboTier(combo);
    if (['mega', 'ultra', 'godlike', 'legendary'].includes(tier.key)) {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);
    }
  }, [combo]);

  // Trigger confetti for special combos
  const triggerSpecialConfetti = useCallback(() => {
    const tier = getComboTier(combo);
    
    if (tier.key === 'legendary') {
      // Epic rainbow explosion
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 100 };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        confetti({
          ...defaults,
          particleCount: 100,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
          colors: ['#FFD700', '#FF69B4', '#00CED1', '#FF6B6B', '#9B59B6'],
        });
      }, 100);
    } else if (tier.key === 'godlike') {
      confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FF4500'],
      });
    } else if (tier.key === 'ultra') {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FF1493', '#FF69B4', '#FF6B6B'],
      });
    } else if (tier.key === 'mega') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9B59B6', '#E74C3C'],
      });
    }
  }, [combo]);

  useEffect(() => {
    if (showEffect && combo >= 2) {
      setShowCombo(true);
      generateParticles();
      triggerScreenShake();
      
      const tier = getComboTier(combo);
      
      // Play appropriate sound
      if (['legendary', 'godlike', 'ultra'].includes(tier.key)) {
        playSound('winner');
        triggerSpecialConfetti();
      } else if (['mega', 'super'].includes(tier.key)) {
        playSound('levelUp');
        triggerSpecialConfetti();
      } else if (tier.key === 'combo') {
        playSound('combo');
      } else {
        playSound('correct');
      }
      
      // Duration based on tier
      const duration = ['legendary', 'godlike'].includes(tier.key) ? 3000 :
                       ['ultra', 'mega'].includes(tier.key) ? 2000 : 1500;
      
      const timer = setTimeout(() => {
        setShowCombo(false);
        setParticles([]);
        onEffectComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [showEffect, combo, generateParticles, triggerScreenShake, triggerSpecialConfetti, playSound, onEffectComplete]);

  if (!showCombo) return null;

  const tier = getComboTier(combo);
  const IconComponent = tier.icon;

  return (
    <div className={cn(
      "fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden",
      screenShake && "animate-shake"
    )}>
      {/* Background overlay for high combos */}
      {['ultra', 'godlike', 'legendary'].includes(tier.key) && (
        <div className={cn(
          "absolute inset-0 transition-opacity duration-300",
          tier.key === 'legendary' ? "bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-yellow-900/40" :
          tier.key === 'godlike' ? "bg-gradient-to-br from-amber-900/30 to-orange-900/30" :
          "bg-gradient-to-br from-rose-900/30 to-red-900/30"
        )} />
      )}

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-fly-up"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${0.8 + Math.random() * 0.4}s`,
          }}
        >
          <div
            className="rounded-full animate-star-burst"
            style={{ 
              backgroundColor: particle.color,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          />
        </div>
      ))}

      {/* Lightning effects for high combos */}
      {['mega', 'ultra', 'godlike', 'legendary'].includes(tier.key) && (
        <>
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-white/50 to-transparent animate-pulse" />
          <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-yellow-400/50 to-transparent animate-pulse" style={{ animationDelay: '0.2s' }} />
        </>
      )}

      {/* Main Combo Badge */}
      <div className={cn(
        "relative animate-bounce-in",
        "flex flex-col items-center gap-2"
      )}>
        {/* Multi-layer glow effect */}
        <div className={cn(
          "absolute inset-0 blur-3xl opacity-60 animate-glow-pulse",
          `bg-gradient-to-r ${tier.color}`
        )} />
        {['godlike', 'legendary'].includes(tier.key) && (
          <div className={cn(
            "absolute inset-0 blur-[100px] opacity-40 animate-pulse",
            `bg-gradient-to-r ${tier.color}`
          )} />
        )}
        
        {/* Main badge */}
        <div className={cn(
          "relative px-10 py-6 rounded-3xl",
          "bg-gradient-to-r shadow-2xl",
          tier.color,
          "animate-shake",
          ['godlike', 'legendary'].includes(tier.key) && "border-2 border-white/30"
        )}>
          <div className="flex items-center gap-4 text-white">
            {/* Left icon */}
            <div className={cn(
              "animate-spin-slow",
              tier.key === 'legendary' && "animate-bounce"
            )}>
              <IconComponent className={cn(
                "h-10 w-10",
                tier.key === 'legendary' && "h-12 w-12 text-amber-300"
              )} />
            </div>
            
            {/* Center content */}
            <div className="text-center">
              <div className={cn(
                "font-black tracking-wider animate-combo-flash",
                ['godlike', 'legendary'].includes(tier.key) ? "text-4xl" :
                ['ultra', 'mega'].includes(tier.key) ? "text-3xl" : "text-2xl"
              )}>
                {tier.text}
              </div>
              <div className={cn(
                "font-black",
                ['godlike', 'legendary'].includes(tier.key) ? "text-7xl" :
                ['ultra', 'mega'].includes(tier.key) ? "text-6xl" : "text-5xl"
              )}>
                x{combo}
              </div>
              
              {/* Multiplier display for high combos */}
              {combo >= 10 && (
                <div className="text-sm font-bold text-white/80 mt-1">
                  🔥 {(1 + combo * 0.05).toFixed(2)}x bonus
                </div>
              )}
            </div>
            
            {/* Right icon */}
            <div className={cn(
              "animate-spin-slow",
              tier.key === 'legendary' && "animate-bounce"
            )} style={{ animationDirection: 'reverse' }}>
              <IconComponent className={cn(
                "h-10 w-10",
                tier.key === 'legendary' && "h-12 w-12 text-amber-300"
              )} />
            </div>
          </div>
        </div>

        {/* Ring effects */}
        <div className={cn(
          "absolute inset-0 rounded-3xl border-4 animate-ping opacity-50",
          tier.key === 'legendary' ? "border-amber-400" :
          tier.key === 'godlike' ? "border-yellow-500" :
          tier.key === 'ultra' ? "border-pink-500" :
          tier.key === 'mega' ? "border-purple-500" :
          tier.key === 'super' ? "border-orange-500" :
          tier.key === 'combo' ? "border-green-500" :
          "border-blue-500"
        )} />
        
        {['ultra', 'godlike', 'legendary'].includes(tier.key) && (
          <div className={cn(
            "absolute inset-0 rounded-3xl border-2 animate-pulse opacity-30",
            `bg-gradient-to-r ${tier.color}`
          )} style={{ transform: 'scale(1.1)' }} />
        )}
      </div>

      {/* Side flames for high combos */}
      {combo >= 10 && (
        <>
          <div className="absolute left-10 top-1/2 -translate-y-1/2">
            <Flame className={cn(
              "animate-float",
              combo >= 50 ? "h-24 w-24 text-yellow-400" :
              combo >= 30 ? "h-20 w-20 text-amber-500" :
              combo >= 20 ? "h-18 w-18 text-rose-500" :
              combo >= 15 ? "h-16 w-16 text-purple-500" :
              "h-14 w-14 text-orange-500"
            )} />
          </div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2" style={{ animationDelay: '0.2s' }}>
            <Flame className={cn(
              "animate-float",
              combo >= 50 ? "h-24 w-24 text-yellow-400" :
              combo >= 30 ? "h-20 w-20 text-amber-500" :
              combo >= 20 ? "h-18 w-18 text-rose-500" :
              combo >= 15 ? "h-16 w-16 text-purple-500" :
              "h-14 w-14 text-orange-500"
            )} />
          </div>
        </>
      )}

      {/* Star burst for legendary */}
      {combo >= 30 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "absolute animate-star-burst",
                combo >= 50 ? "h-8 w-8 text-yellow-400" : "h-6 w-6 text-amber-400"
              )}
              style={{
                transform: `rotate(${i * 30}deg) translateY(-${100 + combo}px)`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Crown for godlike+ */}
      {combo >= 30 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2">
          <Crown className={cn(
            "animate-bounce",
            combo >= 50 ? "h-16 w-16 text-yellow-400" : "h-12 w-12 text-amber-400"
          )} />
        </div>
      )}

      {/* Additional visual elements for legendary */}
      {combo >= 50 && (
        <>
          {/* Orbiting icons */}
          {[Target, Trophy, Rocket, Sparkles].map((Icon, i) => (
            <Icon
              key={i}
              className="absolute h-8 w-8 text-white/60 animate-float"
              style={{
                left: `${20 + i * 20}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default ComboEffect;