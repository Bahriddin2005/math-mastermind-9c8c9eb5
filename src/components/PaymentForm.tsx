import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Info, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OTPVerification } from './OTPVerification';

interface PaymentFormProps {
  planName: string;
  planDescription?: string;
  instructorName?: string;
  planId?: string;
  isYearly?: boolean;
  amount: number;
  discount?: number;
  onPaymentSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export interface PaymentData {
  cardSystem: 'uzcard' | 'humo';
  cardNumber: string;
  expiryDate: string;
  phoneNumber: string;
  agreeToTerms: boolean;
}

export const PaymentForm = ({
  planName,
  planDescription,
  instructorName,
  planId = 'pro',
  isYearly = false,
  amount,
  discount = 0,
  onPaymentSuccess,
  onCancel,
  className = '',
}: PaymentFormProps) => {
  const [cardSystem, setCardSystem] = useState<'uzcard' | 'humo'>('uzcard');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('93 540 04 14');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const total = amount - discount;

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('998')) {
      const rest = cleaned.slice(3);
      return `998 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 7)} ${rest.slice(7, 9)}`.trim();
    }
    if (cleaned.startsWith('93')) {
      const rest = cleaned.slice(2);
      return `93 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 8)} ${rest.slice(8, 10)}`.trim();
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast.error("Shartlarga rozilik berish majburiy");
      return;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error("Karta raqami noto'g'ri");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      toast.error("Amal qilish muddati noto'g'ri");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-uzcard-humo', {
        body: {
          planId: planId,
          amount: total,
          isYearly: isYearly,
          cardSystem,
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryDate,
          phoneNumber: phoneNumber.replace(/\s/g, ''),
        },
      });

      if (error) throw error;

      if (data?.success) {
        if (data.requiresOtp) {
          // Show OTP verification
          setTransactionId(data.transactionId);
          setPaymentId(data.paymentId);
          setShowOTP(true);
        } else {
          // Payment successful without OTP
          toast.success("To'lov muvaffaqiyatli!");
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
        }
      } else {
        toast.error(data?.message || "To'lov amalga oshirilmadi");
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Xatolik yuz berdi", {
        description: "Iltimos, qaytadan urinib ko'ring.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = () => {
    toast.success("To'lov muvaffaqiyatli tasdiqlandi!");
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  const handleOTPCancel = () => {
    setShowOTP(false);
    setTransactionId(null);
    setPaymentId(null);
  };

  // OTP verification step
  if (showOTP && transactionId) {
    return (
      <OTPVerification
        transactionId={transactionId}
        paymentId={paymentId}
        onSuccess={handleOTPSuccess}
        onCancel={handleOTPCancel}
      />
    );
  }

  return (
    <div className={cn('max-w-5xl mx-auto', className)}>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left side - Payment system selection */}
        <div className="md:col-span-1 space-y-4">
          <Label className="text-sm font-semibold text-muted-foreground">To'lov tizimi</Label>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setCardSystem('uzcard')}
              className={cn(
                "w-full p-5 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg",
                cardSystem === 'uzcard'
                  ? "border-primary bg-primary/10 shadow-lg scale-[1.02]"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-14 w-14 rounded-lg flex items-center justify-center font-bold text-white text-xl transition-all shadow-lg",
                  cardSystem === 'uzcard' 
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 scale-110" 
                    : "bg-gradient-to-br from-blue-500 to-blue-600"
                )}>
                  U
                </div>
                <div>
                  <div className="font-bold text-lg text-foreground">UZCARD</div>
                  <div className="text-xs text-muted-foreground">Karta orqali to'lov</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCardSystem('humo')}
              className={cn(
                "w-full p-5 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg",
                cardSystem === 'humo'
                  ? "border-primary bg-primary/10 shadow-lg scale-[1.02]"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-14 w-14 rounded-lg flex items-center justify-center font-bold text-white text-xl transition-all shadow-lg",
                  cardSystem === 'humo'
                    ? "bg-gradient-to-br from-amber-600 to-amber-700 scale-110"
                    : "bg-gradient-to-br from-amber-500 to-amber-600"
                )}>
                  H
                </div>
                <div>
                  <div className="font-bold text-lg text-foreground">HUMO</div>
                  <div className="text-xs text-muted-foreground">Karta orqali to'lov</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Right side - Payment form */}
        <div className="md:col-span-2">
          <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card via-card to-secondary/10">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-primary">{planName}</CardTitle>
                {instructorName && (
                  <p className="text-sm text-muted-foreground">{instructorName}</p>
                )}
                {planDescription && (
                  <p className="text-sm text-muted-foreground">{planDescription}</p>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Price breakdown */}
              <div className="space-y-3 pb-4 border-b border-border/50">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Kurs narxi</span>
                  <span className="font-semibold text-foreground">{new Intl.NumberFormat('uz-UZ').format(amount)} so'm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Chegirma</span>
                  <span className="font-semibold text-foreground">{new Intl.NumberFormat('uz-UZ').format(discount)} so'm</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-foreground">Jami</span>
                  <span className="text-2xl font-bold text-primary">{new Intl.NumberFormat('uz-UZ').format(total)} so'm</span>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline font-medium"
                  onClick={() => {
                    // Promo code logic here
                    toast.info("Promokod funksiyasi tez orada qo'shiladi");
                  }}
                >
                  Promokod ishlatish
                </button>
              </div>

              {/* Payment form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Card Number */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-sm font-semibold text-foreground">
                    Karta raqamini kiriting
                  </Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="h-14 text-lg font-mono tracking-wider"
                    required
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="text-sm font-semibold text-foreground">
                    Karta amal qilish muddatini kiriting
                  </Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="01/22"
                    maxLength={5}
                    className="h-14 text-lg font-mono"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Fiskal chek uchun telefon raqam
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-4 border border-border rounded-lg bg-secondary/50 min-w-[100px]">
                      <span className="text-2xl">🇺🇿</span>
                      <span className="font-semibold text-foreground">+998</span>
                    </div>
                    <Input
                      id="phoneNumber"
                      type="text"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="93 540 04 14"
                      className="flex-1 h-14 text-lg"
                      required
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm leading-relaxed cursor-pointer flex-1 text-foreground"
                  >
                    Ommaviy oferta bilan{' '}
                    <a href="/terms" target="_blank" className="text-primary hover:underline font-medium">
                      tanishib chiqdim
                    </a>{' '}
                    va shartlariga roziman *
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!agreeToTerms || loading}
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      To'lov amalga oshirilmoqda...
                    </>
                  ) : (
                    'Sotib olish'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
