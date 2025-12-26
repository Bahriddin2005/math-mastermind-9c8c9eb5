import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Send, 
  HelpCircle,
  BookOpen,
  Calculator,
  GraduationCap,
  Trophy,
  Settings,
  ChevronRight
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const faqItems: FAQItem[] = [
  {
    question: "Mashq qanday ishlaydi?",
    answer: "Dashboard'da 'Mashq qilish' bo'limiga o'ting. Qiyinlik darajasini tanlang, vaqt yoki masalalar sonini belgilang va boshlang. Har bir to'g'ri javob uchun ball olasiz!",
    icon: <Calculator className="h-4 w-4" />
  },
  {
    question: "Kurslarni qanday ko'raman?",
    answer: "Menyudan 'Kurslar' bo'limini tanlang. Video darslarni ko'ring, mashq qiling va progressingizni kuzating.",
    icon: <GraduationCap className="h-4 w-4" />
  },
  {
    question: "Leaderboard nima?",
    answer: "Leaderboard - bu haftalik eng yaxshi o'yinchilar ro'yxati. Ko'proq mashq qilsangiz, yuqori o'rinlarni egallaysiz!",
    icon: <Trophy className="h-4 w-4" />
  },
  {
    question: "Profilimni qanday o'zgartiraman?",
    answer: "Yuqori o'ng burchakdagi profil rasminni bosing va 'Sozlamalar' bo'limiga o'ting. U yerda ism, rasm va boshqa ma'lumotlarni o'zgartirishingiz mumkin.",
    icon: <Settings className="h-4 w-4" />
  },
  {
    question: "Kunlik maqsad nima?",
    answer: "Kunlik maqsad - har kuni yechishni rejalashtirgan masalalar soni. Bu sizga doimiy mashq qilishga yordam beradi.",
    icon: <BookOpen className="h-4 w-4" />
  }
];

export const HelpChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaq, setSelectedFaq] = useState<FAQItem | null>(null);

  const filteredFaqs = faqItems.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFaq(null);
    setSearchQuery('');
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className={`rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 ${
            isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Chat Widget */}
      <div 
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <Card className="w-[350px] sm:w-[400px] shadow-2xl border-border/50 overflow-hidden">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-foreground/20 rounded-full">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Yordam markazi</CardTitle>
                  <p className="text-sm text-primary-foreground/80">Savolingiz bormi?</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {selectedFaq ? (
              /* Answer View */
              <div className="p-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedFaq(null)}
                  className="mb-3 -ml-2 text-muted-foreground"
                >
                  ← Orqaga
                </Button>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      {selectedFaq.icon}
                    </div>
                    <h3 className="font-semibold text-lg">{selectedFaq.question}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-11">
                    {selectedFaq.answer}
                  </p>
                </div>
              </div>
            ) : (
              /* FAQ List View */
              <>
                {/* Search */}
                <div className="p-4 border-b">
                  <div className="relative">
                    <Input
                      placeholder="Savol qidiring..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                    <Send className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* FAQ List */}
                <ScrollArea className="h-[300px]">
                  <div className="p-2">
                    {filteredFaqs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <HelpCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>Savol topilmadi</p>
                        <p className="text-sm">Boshqa so'z bilan qidirib ko'ring</p>
                      </div>
                    ) : (
                      filteredFaqs.map((faq, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedFaq(faq)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/80 transition-colors text-left group"
                        >
                          <div className="p-2 bg-primary/10 rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors">
                            {faq.icon}
                          </div>
                          <span className="flex-1 font-medium text-sm">{faq.question}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-4 border-t bg-secondary/30">
                  <p className="text-center text-sm text-muted-foreground">
                    Javob topmadingizmi?{' '}
                    <a href="/contact" className="text-primary hover:underline font-medium">
                      Bog'laning
                    </a>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/20 backdrop-blur-sm z-40 sm:hidden"
          onClick={handleClose}
        />
      )}
    </>
  );
};
