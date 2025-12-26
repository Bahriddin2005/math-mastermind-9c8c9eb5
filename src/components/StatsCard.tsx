import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconBgColor: 'primary' | 'accent' | 'warning' | 'success' | 'destructive';
  delay?: number;
}

const iconBgStyles = {
  primary: 'gradient-primary',
  accent: 'gradient-accent',
  warning: 'bg-warning/20',
  success: 'bg-success/10',
  destructive: 'bg-destructive/10',
};

const iconStyles = {
  primary: 'text-primary-foreground',
  accent: 'text-accent-foreground',
  warning: 'text-warning',
  success: 'text-success',
  destructive: 'text-destructive',
};

const valueStyles = {
  primary: 'text-primary',
  accent: 'text-accent',
  warning: 'text-warning',
  success: 'text-success',
  destructive: 'text-destructive',
};

export const StatsCard = ({
  icon: Icon,
  label,
  value,
  iconBgColor,
  delay = 0,
}: StatsCardProps) => {
  return (
    <Card
      className="p-4 bg-gradient-to-br from-card to-secondary/20 border border-border/40 opacity-0 animate-slide-up hover:shadow-md transition-all duration-200"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center gap-3">
        <div className={`h-12 w-12 rounded-xl ${iconBgStyles[iconBgColor]} flex items-center justify-center shrink-0`}>
          <Icon className={`h-6 w-6 ${iconStyles[iconBgColor]}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
          <p className={`text-2xl font-display font-bold ${valueStyles[iconBgColor]}`}>
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
};
