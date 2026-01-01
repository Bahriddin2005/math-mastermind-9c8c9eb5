import { PageBackground } from '@/components/layout/PageBackground';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MentalArithmeticPractice } from '@/components/MentalArithmeticPractice';
import { useSound } from '@/hooks/useSound';
import { Calculator, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MentalArithmetic = () => {
  const { soundEnabled, toggleSound } = useSound();
  const navigate = useNavigate();

  // Orqaga qaytish funksiyasi
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <PageBackground className="flex flex-col">
      <Navbar soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      
      <main className="flex-1">
        <div className="container px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleGoBack}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-secondary"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground">
                      Mental Arifmetika
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Abacus bilan mashq qiling
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mental Arifmetika Practice Component */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <MentalArithmeticPractice />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </PageBackground>
  );
};

export default MentalArithmetic;

