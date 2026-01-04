import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Crown, Sparkles, Wand2, Bot, Zap, Shield, Rocket, Star, Sword, Brain, Flame, Ghost, Heart, Diamond, Moon, Sun, Gamepad2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PageBackground } from '@/components/layout/PageBackground';
import confetti from 'canvas-confetti';
import { useSound } from '@/hooks/useSound';

interface AvatarOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
  bgColor: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  specialEffect?: string;
}

const AVATAR_OPTIONS: AvatarOption[] = [
  // Common
  {
    id: 'ninja',
    name: 'Matematik Ninja',
    icon: <Zap className="h-10 w-10" />,
    gradient: 'from-purple-600 via-indigo-600 to-blue-600',
    description: 'Tez va aniq hisoblaydi',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    rarity: 'common',
  },
  {
    id: 'robot',
    name: 'Super Robot',
    icon: <Bot className="h-10 w-10" />,
    gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    description: 'Xatosiz hisoblash mashinasi',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    rarity: 'common',
  },
  {
    id: 'star',
    name: 'Yulduz',
    icon: <Star className="h-10 w-10" />,
    gradient: 'from-amber-500 via-yellow-500 to-orange-500',
    description: 'Eng yorqin o\'quvchi',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    rarity: 'common',
  },
  {
    id: 'gamer',
    name: 'Pro Gamer',
    icon: <Gamepad2 className="h-10 w-10" />,
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    description: 'O\'yin ustasi',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    rarity: 'common',
  },
  // Rare
  {
    id: 'wizard',
    name: 'Sehrgar',
    icon: <Wand2 className="h-10 w-10" />,
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    description: 'Sehrli formulalar ustasi',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    rarity: 'rare',
    specialEffect: 'sparkle',
  },
  {
    id: 'superhero',
    name: 'Super Qahramon',
    icon: <Shield className="h-10 w-10" />,
    gradient: 'from-red-600 via-orange-600 to-amber-600',
    description: 'Har qanday muammoni yechadi',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    rarity: 'rare',
    specialEffect: 'glow',
  },
  {
    id: 'astronaut',
    name: 'Kosmonavt',
    icon: <Rocket className="h-10 w-10" />,
    gradient: 'from-slate-600 via-gray-600 to-zinc-600',
    description: 'Koinot sirlarini ochadi',
    bgColor: 'bg-slate-100 dark:bg-slate-900/30',
    rarity: 'rare',
    specialEffect: 'float',
  },
  {
    id: 'warrior',
    name: 'Matematik Jangchi',
    icon: <Sword className="h-10 w-10" />,
    gradient: 'from-rose-600 via-red-600 to-orange-600',
    description: 'Qiyinchilikni yengadi',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    rarity: 'rare',
    specialEffect: 'shake',
  },
  // Epic
  {
    id: 'genius',
    name: 'Super Genius',
    icon: <Brain className="h-10 w-10" />,
    gradient: 'from-pink-600 via-rose-600 to-red-600',
    description: 'Aql zakovat ustasi',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    rarity: 'epic',
    specialEffect: 'pulse',
  },
  {
    id: 'phoenix',
    name: 'Feniks',
    icon: <Flame className="h-10 w-10" />,
    gradient: 'from-orange-500 via-red-500 to-rose-500',
    description: 'Kuldan qayta tug\'iladi',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    rarity: 'epic',
    specialEffect: 'fire',
  },
  {
    id: 'shadow',
    name: 'Soya Master',
    icon: <Ghost className="h-10 w-10" />,
    gradient: 'from-gray-800 via-slate-700 to-zinc-600',
    description: 'Sirli va tez',
    bgColor: 'bg-gray-200 dark:bg-gray-800/50',
    rarity: 'epic',
    specialEffect: 'shadow',
  },
  // Legendary
  {
    id: 'diamond',
    name: 'Olmos Ustoz',
    icon: <Diamond className="h-10 w-10" />,
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    description: 'Eng noyob qahramon',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    rarity: 'legendary',
    specialEffect: 'rainbow',
  },
  {
    id: 'moonknight',
    name: 'Oy Ritsari',
    icon: <Moon className="h-10 w-10" />,
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    description: 'Tun kuchlarini boshqaradi',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    rarity: 'legendary',
    specialEffect: 'moon',
  },
  {
    id: 'sunknight',
    name: 'Quyosh Qiroli',
    icon: <Sun className="h-10 w-10" />,
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    description: 'Yorug\'lik keltiruvchi',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    rarity: 'legendary',
    specialEffect: 'sun',
  },
  {
    id: 'loveheart',
    name: 'Sevgi Qahramoni',
    icon: <Heart className="h-10 w-10" />,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    description: 'Mehribonlik kuchi',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    rarity: 'legendary',
    specialEffect: 'hearts',
  },
];

const RARITY_CONFIG = {
  common: { label: 'Oddiy', color: 'text-gray-500', border: 'border-gray-300' },
  rare: { label: 'Kam uchraydigan', color: 'text-blue-500', border: 'border-blue-500' },
  epic: { label: 'Epic', color: 'text-purple-500', border: 'border-purple-500' },
  legendary: { label: 'Afsonaviy', color: 'text-amber-500', border: 'border-amber-500' },
};

export const AvatarSelect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playSound } = useSound();
  const [selectedAvatar, setSelectedAvatar] = useState<string>('ninja');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setCurrentProfile(data);
        setUsername(data.username || '');
        if (data.avatar_url) {
          const avatarType = AVATAR_OPTIONS.find(a => 
            data.avatar_url?.includes(a.id)
          );
          if (avatarType) {
            setSelectedAvatar(avatarType.id);
          }
        }
      }
    };
    
    loadProfile();
  }, [user]);

  const handleSelectAvatar = (avatar: AvatarOption) => {
    setSelectedAvatar(avatar.id);
    playSound?.('correct');
    
    // Different confetti based on rarity
    const particleCount = avatar.rarity === 'legendary' ? 100 : 
                          avatar.rarity === 'epic' ? 60 : 
                          avatar.rarity === 'rare' ? 40 : 30;
    
    const colors = avatar.rarity === 'legendary' ? ['#FFD700', '#FFA500', '#FF69B4', '#00CED1'] :
                   avatar.rarity === 'epic' ? ['#9B59B6', '#8E44AD', '#E74C3C'] :
                   avatar.rarity === 'rare' ? ['#3498DB', '#2980B9', '#1ABC9C'] :
                   ['#95A5A6', '#7F8C8D', '#BDC3C7'];
    
    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });
  };

  const handleSave = async () => {
    if (!user || !username.trim()) {
      toast.error("Ism kiriting");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const selectedAvatarData = AVATAR_OPTIONS.find(a => a.id === selectedAvatar);
      const avatarUrl = `avatar:${selectedAvatar}`;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      playSound?.('levelUp');
      
      // Epic celebration
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        confetti({
          ...defaults,
          particleCount: 50 * (timeLeft / duration),
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#4ECDC4', '#FF6B6B', '#45B7D1', '#96CEB4', '#9B59B6'],
        });
      }, 150);
      
      toast.success(`${selectedAvatarData?.name} tanlandi! 🎉`);
      
      setTimeout(() => {
        clearInterval(interval);
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAvatarData = AVATAR_OPTIONS.find(a => a.id === selectedAvatar);

  // Group avatars by rarity
  const groupedAvatars = {
    legendary: AVATAR_OPTIONS.filter(a => a.rarity === 'legendary'),
    epic: AVATAR_OPTIONS.filter(a => a.rarity === 'epic'),
    rare: AVATAR_OPTIONS.filter(a => a.rarity === 'rare'),
    common: AVATAR_OPTIONS.filter(a => a.rarity === 'common'),
  };

  const getSpecialEffectClass = (effect?: string) => {
    switch (effect) {
      case 'sparkle': return 'animate-pulse';
      case 'glow': return 'animate-glow-pulse';
      case 'float': return 'animate-float';
      case 'shake': return 'hover:animate-shake';
      case 'pulse': return 'animate-pulse';
      case 'fire': return 'animate-float';
      case 'shadow': return 'hover:shadow-2xl hover:shadow-purple-500/50';
      case 'rainbow': return 'animate-spin-slow';
      case 'moon': return 'animate-float';
      case 'sun': return 'animate-glow-pulse';
      case 'hearts': return 'animate-pulse';
      default: return '';
    }
  };

  return (
    <PageBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 animate-bounce-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary animate-pulse">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Qahramoningizni tanlang!</span>
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Avatar Tanlash
            </h1>
            <p className="text-muted-foreground">
              O'zingizga mos qahramoni tanlang va sarguzashtni boshlang
            </p>
          </div>

          {/* Username Input */}
          <Card className="border-primary/20 animate-fade-in">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base font-medium flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  Sizning ismingiz
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masalan: Ali"
                  className="text-lg h-12 border-2 focus:border-primary"
                  maxLength={20}
                />
              </div>
            </CardContent>
          </Card>

          {/* Avatar Groups */}
          {Object.entries(groupedAvatars).map(([rarity, avatars]) => (
            <div key={rarity} className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-1 flex-1 rounded-full",
                  rarity === 'legendary' ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500' :
                  rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                  rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                  'bg-gradient-to-r from-gray-400 to-gray-500'
                )} />
                <span className={cn(
                  "font-bold text-sm uppercase tracking-wider",
                  RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG].color
                )}>
                  {rarity === 'legendary' && '⭐ '}{RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG].label}
                </span>
                <div className={cn(
                  "h-1 flex-1 rounded-full",
                  rarity === 'legendary' ? 'bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500' :
                  rarity === 'epic' ? 'bg-gradient-to-r from-pink-500 to-purple-500' :
                  rarity === 'rare' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                  'bg-gradient-to-r from-gray-500 to-gray-400'
                )} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleSelectAvatar(avatar)}
                    onMouseEnter={() => setHoveredAvatar(avatar.id)}
                    onMouseLeave={() => setHoveredAvatar(null)}
                    className={cn(
                      "relative p-4 rounded-2xl border-2 transition-all duration-300",
                      "hover:scale-105 hover:shadow-xl",
                      selectedAvatar === avatar.id
                        ? `border-transparent bg-gradient-to-br ${avatar.gradient} text-white shadow-xl scale-105`
                        : `${RARITY_CONFIG[avatar.rarity].border} ${avatar.bgColor} hover:border-primary/50`,
                      getSpecialEffectClass(avatar.specialEffect)
                    )}
                  >
                    {/* Rarity glow for legendary */}
                    {avatar.rarity === 'legendary' && selectedAvatar === avatar.id && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/30 via-yellow-500/30 to-orange-500/30 animate-pulse blur-xl" />
                    )}

                    {/* Selected indicator */}
                    {selectedAvatar === avatar.id && (
                      <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 rounded-full p-1 shadow-lg z-10 animate-bounce-in">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                    
                    {/* Avatar icon */}
                    <div className={cn(
                      "relative mx-auto mb-2 p-3 rounded-full transition-transform",
                      selectedAvatar === avatar.id
                        ? "bg-white/20"
                        : `bg-gradient-to-br ${avatar.gradient} text-white`,
                      hoveredAvatar === avatar.id && "scale-110"
                    )}>
                      {avatar.icon}
                      
                      {/* Special particle effects for legendary */}
                      {avatar.rarity === 'legendary' && (
                        <>
                          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-pulse" />
                          <Star className="absolute -bottom-1 -left-1 h-3 w-3 text-yellow-400 animate-spin-slow" />
                        </>
                      )}
                    </div>
                    
                    {/* Name */}
                    <div className={cn(
                      "font-bold text-xs mb-0.5",
                      selectedAvatar !== avatar.id && "text-foreground"
                    )}>
                      {avatar.name}
                    </div>
                    
                    {/* Description */}
                    <div className={cn(
                      "text-[10px] line-clamp-1",
                      selectedAvatar === avatar.id
                        ? "text-white/80"
                        : "text-muted-foreground"
                    )}>
                      {avatar.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Preview */}
          {selectedAvatarData && (
            <Card className="border-primary/20 overflow-hidden animate-scale-in">
              <div className={cn(
                "relative p-6 bg-gradient-to-br",
                selectedAvatarData.gradient
              )}>
                {/* Background particles */}
                {selectedAvatarData.rarity === 'legendary' && (
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(10)].map((_, i) => (
                      <Star
                        key={i}
                        className="absolute text-white/30 animate-float"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          width: `${10 + Math.random() * 10}px`,
                          animationDelay: `${Math.random() * 2}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="relative flex items-center gap-4 text-white">
                  <div className={cn(
                    "p-4 bg-white/20 rounded-2xl",
                    getSpecialEffectClass(selectedAvatarData.specialEffect)
                  )}>
                    {selectedAvatarData.icon}
                  </div>
                  <div>
                    <div className="text-sm opacity-80 flex items-center gap-1">
                      <span className={RARITY_CONFIG[selectedAvatarData.rarity].color}>
                        {RARITY_CONFIG[selectedAvatarData.rarity].label}
                      </span>
                      qahramon:
                    </div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      {username || 'Ismingiz'}
                      {selectedAvatarData.rarity === 'legendary' && (
                        <Crown className="h-5 w-5 text-amber-300 animate-bounce" />
                      )}
                    </div>
                    <div className="text-sm opacity-80">
                      {selectedAvatarData.name} - {selectedAvatarData.description}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isLoading || !username.trim()}
            size="lg"
            className={cn(
              "w-full h-16 text-xl font-bold",
              "bg-gradient-to-r from-primary via-purple-600 to-pink-600",
              "hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90",
              "shadow-lg hover:shadow-xl transition-all",
              "animate-glow-pulse"
            )}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            ) : (
              <>
                <Rocket className="mr-2 h-6 w-6 animate-float" />
                Sarguzashtni Boshlash!
              </>
            )}
          </Button>
        </div>
      </div>
    </PageBackground>
  );
};

export default AvatarSelect;