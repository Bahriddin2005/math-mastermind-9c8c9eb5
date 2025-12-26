import { useAuth } from '@/hooks/useAuth';
import { Sparkles } from 'lucide-react';

interface WelcomeHeroProps {
  username?: string;
}

export const WelcomeHero = ({ username }: WelcomeHeroProps) => {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Xayrli tong';
    if (hour < 18) return 'Xayrli kun';
    return 'Xayrli kech';
  };

  return (
    <div className="relative overflow-hidden rounded-3xl gradient-primary p-6 md:p-8 text-primary-foreground shadow-lg opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium opacity-90">{greeting()}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          {username ? `Salom, ${username}!` : 'Xush kelibsiz!'}
        </h1>
        <p className="text-sm md:text-base opacity-90 max-w-md">
          Mental arifmetika bo'yicha treninglarni davom ettiring va o'z natijalaringizni kuzating.
        </p>
      </div>
    </div>
  );
};
