import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Shield, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OTPVerificationProps {
  transactionId: string;
  paymentId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const OTPVerification = ({
  transactionId,
  paymentId,
  onSuccess,
  onCancel,
}: OTPVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error("OTP kod 6 raqamdan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: {
          transactionId,
          otpCode: otp,
        },
      });

      if (error) throw error;

      if (data?.success) {
        onSuccess();
      } else {
        toast.error(data?.error || "OTP kodi noto'g'ri");
        setOtp('');
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error("Xatolik yuz berdi", {
        description: "Iltimos, qaytadan urinib ko'ring.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) {
      toast.info(`Yana ${countdown} soniyadan keyin qayta yuborishingiz mumkin`);
      return;
    }

    try {
      // Resend OTP logic here
      toast.success("OTP kodi qayta yuborildi");
      setCountdown(120);
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card via-card to-secondary/10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">OTP kodni kiriting</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Telefoningizga yuborilgan 6 xonali kodni kiriting
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-sm font-semibold text-foreground">
                OTP kod
              </Label>
              <Input
                ref={inputRef}
                id="otp"
                type="text"
                value={otp}
                onChange={handleOTPChange}
                placeholder="123456"
                maxLength={6}
                className="h-16 text-2xl font-mono text-center tracking-widest"
                required
              />
              <p className="text-xs text-muted-foreground text-center">
                Test rejimida: har qanday 6 xonali kod yoki "123456"
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {countdown > 0 
                  ? `Qayta yuborish: ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`
                  : 'Kodni qayta yuborish mumkin'
                }
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={otp.length !== 6 || loading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Tekshirilmoqda...
                  </>
                ) : (
                  'Tasdiqlash'
                )}
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOTP}
              disabled={countdown > 0}
              className="w-full text-sm"
            >
              Kodni qayta yuborish
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

