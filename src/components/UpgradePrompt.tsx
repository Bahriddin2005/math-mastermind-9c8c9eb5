import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface UpgradePromptProps {
  requiredTier: 'pro' | 'premium';
  featureName: string;
  description?: string;
  className?: string;
}

export const UpgradePrompt = ({ 
  requiredTier, 
  featureName, 
  description,
  className = '' 
}: UpgradePromptProps) => {
  const navigate = useNavigate();
  const { tier, hasAccess } = useSubscription();

  if (hasAccess(requiredTier)) {
    return null;
  }

  const Icon = requiredTier === 'premium' ? Crown : Zap;
  const tierName = requiredTier === 'premium' ? 'Premium' : 'Pro';
  const tierColor = requiredTier === 'premium' 
    ? 'from-amber-500 to-orange-600' 
    : 'from-blue-500 to-blue-600';

  return (
    <Card className={`border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tierColor} mx-auto mb-4 flex items-center justify-center shadow-lg`}>
          <Lock className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-xl font-bold">
          {featureName} {tierName} rejada mavjud
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span>Bu funksiya {tierName} obuna uchun</span>
        </div>
        <Button 
          className={`w-full bg-gradient-to-r ${tierColor} text-white hover:opacity-90 shadow-lg`}
          onClick={() => navigate('/pricing')}
        >
          <Icon className="h-5 w-5 mr-2" />
          {tierName} rejaga o'tish
        </Button>
      </CardContent>
    </Card>
  );
};

