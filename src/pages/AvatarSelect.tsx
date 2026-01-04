import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, Crown, Sparkles, Wand2, Bot, Zap, Shield, Rocket, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PageBackground } from '@/components/layout/PageBackground';
import confetti from 'canvas-confetti';

interface AvatarOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
  bgColor: string;
}

const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'ninja',
    name: 'Matematik Ninja',
    icon: <Zap className="h-10 w-10" />,
    gradient: 'from-purple-600 via-indigo-600 to-blue-600',
    description: 'Tez va aniq hisoblaydi',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    id: 'wizard',
    name: 'Sehrgar',
    icon: <Wand2 className="h-10 w-10" />,
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    description: 'Sehrli formulalar ustasi',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
  },
  {
    id: 'robot',
    name: 'Super Robot',
    icon: <Bot className="h-10 w-10" />,
    gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    description: 'Xatosiz hisoblash mashinasi',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  {
    id: 'superhero',
    name: 'Super Qahramon',
    icon: <Shield className="h-10 w-10" />,
    gradient: 'from-red-600 via-orange-600 to-amber-600',
    description: 'Har qanday muammoni yechadi',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  {
    id: 'astronaut',
    name: 'Kosmonavt',
    icon: <Rocket className="h-10 w-10" />,
    gradient: 'from-slate-600 via-gray-600 to-zinc-600',
    description: 'Koinot sirlarini ochadi',
    bgColor: 'bg-slate-100 dark:bg-slate-900/30',
  },
  {
    id: 'star',
    name: 'Yulduz',
    icon: <Star className="h-10 w-10" />,
    gradient: 'from-amber-500 via-yellow-500 to-orange-500',
    description: 'Eng yorqin o\'quvchi',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
];

export const AvatarSelect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState<string>('ninja');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setCurrentProfile(data);
        setUsername(data.username || '');
        // Extract avatar type from avatar_url if it exists
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

  const handleSelectAvatar = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    // Small confetti on selection
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FF6B6B'],
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
      
      // Big celebration
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#4ECDC4', '#FF6B6B', '#45B7D1', '#96CEB4'],
      });
      
      toast.success(`${selectedAvatarData?.name} tanlandi! 🎉`);
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAvatarData = AVATAR_OPTIONS.find(a => a.id === selectedAvatar);

  return (
    <PageBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Qahramoningizni tanlang!</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Avatar Tanlash
            </h1>
            <p className="text-muted-foreground">
              O'zingizga mos qahramoni tanlang va nomini kiriting
            </p>
          </div>

          {/* Username Input */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base font-medium">
                  Sizning ismingiz
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masalan: Ali"
                  className="text-lg h-12"
                  maxLength={20}
                />
              </div>
            </CardContent>
          </Card>

          {/* Avatar Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleSelectAvatar(avatar.id)}
                className={cn(
                  "relative p-4 rounded-2xl border-2 transition-all duration-300",
                  "hover:scale-105 hover:shadow-lg",
                  selectedAvatar === avatar.id
                    ? `border-transparent bg-gradient-to-br ${avatar.gradient} text-white shadow-xl`
                    : `border-border ${avatar.bgColor} hover:border-primary/50`
                )}
              >
                {/* Selected indicator */}
                {selectedAvatar === avatar.id && (
                  <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 rounded-full p-1 shadow-lg">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                )}
                
                {/* Avatar icon */}
                <div className={cn(
                  "mx-auto mb-3 p-3 rounded-full",
                  selectedAvatar === avatar.id
                    ? "bg-white/20"
                    : `bg-gradient-to-br ${avatar.gradient} text-white`
                )}>
                  {avatar.icon}
                </div>
                
                {/* Name */}
                <div className={cn(
                  "font-bold text-sm mb-1",
                  selectedAvatar !== avatar.id && "text-foreground"
                )}>
                  {avatar.name}
                </div>
                
                {/* Description */}
                <div className={cn(
                  "text-xs",
                  selectedAvatar === avatar.id
                    ? "text-white/80"
                    : "text-muted-foreground"
                )}>
                  {avatar.description}
                </div>
              </button>
            ))}
          </div>

          {/* Preview */}
          {selectedAvatarData && (
            <Card className="border-primary/20 overflow-hidden">
              <div className={cn(
                "p-6 bg-gradient-to-br",
                selectedAvatarData.gradient
              )}>
                <div className="flex items-center gap-4 text-white">
                  <div className="p-4 bg-white/20 rounded-2xl animate-float">
                    {selectedAvatarData.icon}
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Siz tanlagan qahramon:</div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      {username || 'Ismingiz'}
                      <Crown className="h-5 w-5 text-amber-300" />
                    </div>
                    <div className="text-sm opacity-80">
                      {selectedAvatarData.name}
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
              "w-full h-14 text-lg font-bold",
              "bg-gradient-to-r from-primary via-purple-600 to-pink-600",
              "hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90",
              "shadow-lg hover:shadow-xl transition-all"
            )}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Saqlash va Boshlash
              </>
            )}
          </Button>
        </div>
      </div>
    </PageBackground>
  );
};

export default AvatarSelect;
