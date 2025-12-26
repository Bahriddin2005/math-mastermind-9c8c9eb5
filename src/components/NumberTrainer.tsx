import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Square } from 'lucide-react';

// Formulasiz qoidalar
const RULES_BASIC: Record<number, { add: number[]; subtract: number[] }> = {
  0: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [] },
  1: { add: [1, 2, 3, 5, 6, 7, 8], subtract: [1] },
  2: { add: [1, 2, 5, 6, 7], subtract: [1, 2] },
  3: { add: [1, 5, 6], subtract: [1, 2, 3] },
  4: { add: [5], subtract: [1, 2, 3, 4] },
  5: { add: [1, 2, 3, 4], subtract: [5] },
  6: { add: [1, 2, 3], subtract: [1, 5, 6] },
  7: { add: [1, 2], subtract: [1, 2, 5, 7] },
  8: { add: [1], subtract: [1, 2, 3, 5, 8] },
  9: { add: [], subtract: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
};

// Formula 5 (kichik do'stlar)
const RULES_FORMULA_5: Record<number, { add: number[]; subtract: number[] }> = {
  0: { add: [], subtract: [] },
  1: { add: [], subtract: [] },
  2: { add: [], subtract: [] },
  3: { add: [2], subtract: [] },
  4: { add: [1, 2], subtract: [] },
  5: { add: [], subtract: [1, 2] },
  6: { add: [], subtract: [2] },
  7: { add: [], subtract: [] },
  8: { add: [], subtract: [] },
  9: { add: [], subtract: [] },
};

// Formula 10+ (katta do'stlar qo'shish)
const RULES_FORMULA_10_PLUS: Record<number, { add: number[]; subtract: number[] }> = {
  0: { add: [], subtract: [] },
  1: { add: [9], subtract: [] },
  2: { add: [8, 9], subtract: [] },
  3: { add: [7, 8, 9], subtract: [] },
  4: { add: [6, 7, 8, 9], subtract: [] },
  5: { add: [5, 6, 7, 8, 9], subtract: [] },
  6: { add: [4, 5, 6, 7, 8, 9], subtract: [] },
  7: { add: [3, 4, 5, 6, 7, 8, 9], subtract: [] },
  8: { add: [2, 3, 4, 5, 6, 7, 8, 9], subtract: [] },
  9: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [] },
};

// Formula 10- (katta do'stlar ayirish)
const RULES_FORMULA_10_MINUS: Record<number, { add: number[]; subtract: number[] }> = {
  0: { add: [], subtract: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  1: { add: [], subtract: [2, 3, 4, 5, 6, 7, 8, 9] },
  2: { add: [], subtract: [3, 4, 5, 6, 7, 8, 9] },
  3: { add: [], subtract: [4, 5, 6, 7, 8, 9] },
  4: { add: [], subtract: [5, 6, 7, 8, 9] },
  5: { add: [], subtract: [6, 7, 8, 9] },
  6: { add: [], subtract: [7, 8, 9] },
  7: { add: [], subtract: [8, 9] },
  8: { add: [], subtract: [9] },
  9: { add: [], subtract: [] },
};

// Hammasi (aralash)
const RULES_ALL: Record<number, { add: number[]; subtract: number[] }> = {
  0: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [] },
  1: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1] },
  2: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2] },
  3: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3] },
  4: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3, 4] },
  5: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3, 4, 5] },
  6: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3, 4, 5, 6] },
  7: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3, 4, 5, 6, 7] },
  8: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3, 4, 5, 6, 7, 8] },
  9: { add: [1, 2, 3, 4, 5, 6, 7, 8, 9], subtract: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
};

type FormulaType = 'oddiy' | 'formula5' | 'formula10plus' | 'formula10minus' | 'hammasi';

const FORMULA_RULES: Record<FormulaType, Record<number, { add: number[]; subtract: number[] }>> = {
  oddiy: RULES_BASIC,
  formula5: RULES_FORMULA_5,
  formula10plus: RULES_FORMULA_10_PLUS,
  formula10minus: RULES_FORMULA_10_MINUS,
  hammasi: RULES_ALL,
};

export const NumberTrainer = () => {
  // Sozlamalar
  const [formulaType, setFormulaType] = useState<FormulaType>('oddiy');
  const [digitCount, setDigitCount] = useState(1); // 1-4 xonali
  const [speed, setSpeed] = useState(0.5); // sekundlarda
  const [problemCount, setProblemCount] = useState(5); // misollar soni

  // O'yin holati
  const [isRunning, setIsRunning] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<string | null>(null);
  const [isAddition, setIsAddition] = useState(true);

  const runningResultRef = useRef(0);
  const countRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sonni generatsiya qilish
  const generateNextNumber = useCallback(() => {
    const currentResult = runningResultRef.current;
    const lastDigit = currentResult % 10;
    const rules = FORMULA_RULES[formulaType][lastDigit];

    if (!rules) return null;

    const possibleOperations: { number: number; isAdd: boolean }[] = [];

    rules.add.forEach(num => {
      possibleOperations.push({ number: num, isAdd: true });
    });

    rules.subtract.forEach(num => {
      possibleOperations.push({ number: num, isAdd: false });
    });

    if (possibleOperations.length === 0) return null;

    const randomOp = possibleOperations[Math.floor(Math.random() * possibleOperations.length)];

    // Ko'p xonali sonlar uchun raqamni kengaytirish
    let finalNumber = randomOp.number;
    if (digitCount > 1) {
      const multiplier = Math.pow(10, Math.floor(Math.random() * digitCount));
      finalNumber = randomOp.number * Math.min(multiplier, Math.pow(10, digitCount - 1));
    }

    if (randomOp.isAdd) {
      runningResultRef.current += finalNumber;
    } else {
      runningResultRef.current -= finalNumber;
    }

    setIsAddition(randomOp.isAdd);
    return finalNumber;
  }, [formulaType, digitCount]);

  // O'yinni boshlash
  const startGame = useCallback(() => {
    // Boshlang'ich son
    const maxInitial = Math.pow(10, digitCount) - 1;
    const minInitial = digitCount === 1 ? 1 : Math.pow(10, digitCount - 1);
    const initialResult = Math.floor(Math.random() * (maxInitial - minInitial + 1)) + minInitial;
    
    runningResultRef.current = initialResult;
    countRef.current = 1;

    setCurrentDisplay(String(initialResult));
    setIsRunning(true);
    setIsAddition(true);

    const speedMs = speed * 1000;

    intervalRef.current = setInterval(() => {
      countRef.current += 1;

      if (countRef.current > problemCount) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsRunning(false);
        setCurrentDisplay(null);
        return;
      }

      const nextNum = generateNextNumber();
      if (nextNum !== null) {
        setCurrentDisplay(String(nextNum));
      }
    }, speedMs);
  }, [digitCount, speed, problemCount, generateNextNumber]);

  // To'xtatish
  const stopGame = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setCurrentDisplay(null);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // O'yin davomida - faqat son ko'rsatish
  if (isRunning && currentDisplay !== null) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <div 
          className="text-[180px] md:text-[250px] font-light text-foreground transition-all duration-100"
          key={countRef.current}
        >
          {!isAddition && countRef.current > 1 ? '-' : ''}{currentDisplay}
        </div>
        <Button
          onClick={stopGame}
          variant="destructive"
          size="lg"
          className="absolute bottom-10 gap-2"
        >
          <Square className="h-5 w-5" />
          To'xtatish
        </Button>
      </div>
    );
  }

  // Sozlamalar sahifasi
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Test turini sozlang</h1>

      {/* Misol turi */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Misol turi</Label>
        <RadioGroup
          value={formulaType}
          onValueChange={(v) => setFormulaType(v as FormulaType)}
          className="flex flex-wrap gap-2"
        >
          {[
            { value: 'oddiy', label: 'Oddiy' },
            { value: 'formula5', label: 'Formula 5' },
            { value: 'formula10plus', label: 'Formula 10+' },
            { value: 'formula10minus', label: 'Formula 10-' },
            { value: 'hammasi', label: 'hammasi' },
          ].map((item) => (
            <div key={item.value} className="flex items-center">
              <RadioGroupItem
                value={item.value}
                id={`formula-${item.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`formula-${item.value}`}
                className="flex items-center gap-2 px-4 py-2 border rounded-full cursor-pointer transition-colors peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary hover:bg-muted"
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formulaType === item.value ? 'border-primary-foreground bg-primary-foreground' : 'border-muted-foreground'}`}>
                  {formulaType === item.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                {item.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Son xonasi */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Son xonasi</Label>
        <RadioGroup
          value={String(digitCount)}
          onValueChange={(v) => setDigitCount(Number(v))}
          className="flex flex-wrap gap-2"
        >
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <RadioGroupItem
                value={String(num)}
                id={`digit-${num}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`digit-${num}`}
                className="flex items-center gap-2 px-4 py-2 border rounded-full cursor-pointer transition-colors peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary hover:bg-muted"
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${digitCount === num ? 'border-primary-foreground bg-primary-foreground' : 'border-muted-foreground'}`}>
                  {digitCount === num && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                {num} xonali
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Tezligi */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Tezligi</Label>
        <RadioGroup
          value={String(speed)}
          onValueChange={(v) => setSpeed(Number(v))}
          className="flex flex-wrap gap-2"
        >
          {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((s) => (
            <div key={s} className="flex items-center">
              <RadioGroupItem
                value={String(s)}
                id={`speed-${s}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`speed-${s}`}
                className="flex items-center gap-2 px-3 py-2 border rounded-full cursor-pointer transition-colors peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary hover:bg-muted text-sm"
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${speed === s ? 'border-primary-foreground bg-primary-foreground' : 'border-muted-foreground'}`}>
                  {speed === s && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
                {s}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Misollar soni */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Misollar soni</Label>
        <RadioGroup
          value={String(problemCount)}
          onValueChange={(v) => setProblemCount(Number(v))}
          className="flex flex-wrap gap-2"
        >
          {Array.from({ length: 18 }, (_, i) => i + 3).map((num) => (
            <div key={num} className="flex items-center">
              <RadioGroupItem
                value={String(num)}
                id={`count-${num}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`count-${num}`}
                className="flex items-center gap-2 px-3 py-2 border rounded-full cursor-pointer transition-colors peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary hover:bg-muted text-sm"
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${problemCount === num ? 'border-primary-foreground bg-primary-foreground' : 'border-muted-foreground'}`}>
                  {problemCount === num && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
                {num}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Boshlash tugmasi */}
      <Button
        onClick={startGame}
        size="lg"
        className="bg-red-600 hover:bg-red-700 text-white px-8"
      >
        Boshlash
      </Button>
    </div>
  );
};

export default NumberTrainer;
