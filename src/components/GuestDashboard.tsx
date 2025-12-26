import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Play, 
  Timer, 
  Trophy, 
  User,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';

export const GuestDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-primary p-6 md:p-8 text-primary-foreground shadow-lg opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium opacity-90">IQROMAX</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Mental Arifmetika
          </h1>
          <p className="text-sm md:text-base opacity-90 max-w-md mb-4">
            Tez hisoblash, diqqat va xotirani rivojlantirish uchun zamonaviy onlayn platforma.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/train')}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Mashqni boshlash
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="gap-2 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <User className="h-4 w-4" />
              Ro'yxatdan o'tish
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-card via-card to-primary/5 border border-border/40 opacity-0 animate-slide-up cursor-pointer hover:shadow-lg transition-all group" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }} onClick={() => navigate('/train')}>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-1">Mashqlar</h3>
              <p className="text-sm text-muted-foreground">
                4 xil bo'lim: qo'shish, ayirish, ko'paytirish, bo'lish
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-card via-card to-accent/5 border border-border/40 opacity-0 animate-slide-up cursor-pointer hover:shadow-lg transition-all group" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }} onClick={() => navigate('/train')}>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform">
              <Timer className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-1">Vaqt rejimi</h3>
              <p className="text-sm text-muted-foreground">
                Vaqtga qarshi hisoblash va tezlikni oshirish
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-card via-card to-warning/5 border border-border/40 opacity-0 animate-slide-up cursor-pointer hover:shadow-lg transition-all group" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }} onClick={() => navigate('/auth')}>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-warning/20 flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform">
              <Trophy className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-1">Reyting</h3>
              <p className="text-sm text-muted-foreground">
                Global reytingda boshqalar bilan raqobatlashing
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* CTA */}
      <Card className="p-6 text-center bg-gradient-to-br from-secondary/50 to-primary/5 border border-primary/20 opacity-0 animate-slide-up" style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}>
        <CardContent className="p-0">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-display font-bold mb-2">
            Natijalaringizni saqlang
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Ro'yxatdan o'ting va statistika, yutuqlar, kunlik maqsadlar va global reytingdan foydalaning.
          </p>
          <Button onClick={() => navigate('/auth')} className="gap-2">
            <User className="h-4 w-4" />
            Bepul ro'yxatdan o'tish
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
