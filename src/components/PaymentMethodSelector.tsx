import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'uzcard' | 'humo';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  className?: string;
}

const paymentMethods = [
  {
    id: 'uzcard' as PaymentMethod,
    name: 'UZCARD',
    description: 'UZCARD kartasi orqali to\'lov',
    icon: CreditCard,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'humo' as PaymentMethod,
    name: 'HUMO',
    description: 'HUMO kartasi orqali to\'lov',
    icon: CreditCard,
    color: 'from-amber-500 to-amber-600',
  },
];

export const PaymentMethodSelector = ({
  selectedMethod,
  onMethodChange,
  className = '',
}: PaymentMethodSelectorProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      <Label className="text-base font-semibold">To'lov usulini tanlang</Label>
      <RadioGroup value={selectedMethod} onValueChange={(value) => onMethodChange(value as PaymentMethod)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <Label
                key={method.id}
                htmlFor={method.id}
                className={cn(
                  "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg",
                  isSelected
                    ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                <div className={cn(
                  "mb-3 h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-300",
                  method.id === 'uzcard' 
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg"
                    : method.id === 'humo'
                    ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold text-lg"
                    : `bg-gradient-to-br ${method.color} text-white`,
                  isSelected && "scale-110"
                )}>
                  {method.id === 'uzcard' ? 'U' : method.id === 'humo' ? 'H' : <Icon className="h-6 w-6" />}
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg mb-1">{method.name}</div>
                  <div className="text-xs text-muted-foreground">{method.description}</div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                )}
              </Label>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
};
