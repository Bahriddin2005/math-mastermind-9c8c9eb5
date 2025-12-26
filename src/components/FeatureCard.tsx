import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface FeatureCardProps {
  category: string;
  title: string;
  description: string;
  buttonText: string;
  icon: LucideIcon;
  iconBgColor: 'primary' | 'accent' | 'warning' | 'success';
  onClick?: () => void;
  delay?: number;
}

const iconBgStyles = {
  primary: 'gradient-primary',
  accent: 'gradient-accent',
  warning: 'bg-warning',
  success: 'bg-success',
};

const buttonStyles = {
  primary: 'text-primary border-primary hover:bg-primary/10',
  accent: 'text-accent border-accent hover:bg-accent/10',
  warning: 'text-warning border-warning hover:bg-warning/10',
  success: 'text-success border-success hover:bg-success/10',
};

export const FeatureCard = ({
  category,
  title,
  description,
  buttonText,
  icon: Icon,
  iconBgColor,
  onClick,
  delay = 0,
}: FeatureCardProps) => {
  return (
    <Card
      className="p-5 bg-gradient-to-br from-card via-card to-secondary/30 border border-border/40 hover:shadow-lg transition-all duration-300 opacity-0 animate-slide-up cursor-pointer group"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`h-12 w-12 rounded-xl ${iconBgStyles[iconBgColor]} flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {category}
          </p>
          <h3 className="font-display font-bold text-lg text-foreground mb-1.5">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {description}
          </p>
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full px-4 text-xs font-semibold ${buttonStyles[iconBgColor]} border-2`}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Card>
  );
};
