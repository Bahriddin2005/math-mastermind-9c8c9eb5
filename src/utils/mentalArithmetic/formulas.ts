/**
 * Mental Arifmetika (Abacus/Soroban) Formulalar
 * 32 ta formula to'liq implementatsiya
 */

export enum FormulaType {
  // Qo'shish formulalari
  ADD_SIMPLE = 'add_simple', // n + 1, n + 2, n + 3, n + 4
  ADD_5 = 'add_5', // n + 5
  ADD_6_TO_9 = 'add_6_to_9', // n + 6, n + 7, n + 8, n + 9
  ADD_10 = 'add_10', // n + 10
  ADD_COMPLEMENT = 'add_complement', // a + b where a + b >= 10 (complement method)
  
  // Ayirish formulalari
  SUBTRACT_SIMPLE = 'subtract_simple', // n - 1, n - 2, n - 3, n - 4
  SUBTRACT_5 = 'subtract_5', // n - 5
  SUBTRACT_6_TO_9 = 'subtract_6_to_9', // n - 6, n - 7, n - 8, n - 9
  SUBTRACT_10 = 'subtract_10', // n - 10
  SUBTRACT_COMPLEMENT = 'subtract_complement', // a - b where borrowing needed
  
  // Ko'paytirish formulalari
  MULTIPLY_2 = 'multiply_2', // n × 2 = n + n
  MULTIPLY_5 = 'multiply_5', // n × 5 = (n × 10) ÷ 2
  MULTIPLY_9 = 'multiply_9', // n × 9 = (n × 10) - n
  MULTIPLY_10 = 'multiply_10', // n × 10
  MULTIPLY_11 = 'multiply_11', // n × 11 = n × 10 + n
  MULTIPLY_25 = 'multiply_25', // n × 25 = (n × 100) ÷ 4
  MULTIPLY_125 = 'multiply_125', // n × 125 = (n × 1000) ÷ 8
  
  // Bo'lish formulalari
  DIVIDE_2 = 'divide_2', // n ÷ 2
  DIVIDE_5 = 'divide_5', // n ÷ 5 = (n ÷ 10) × 2
  DIVIDE_10 = 'divide_10', // n ÷ 10
  DIVIDE_4 = 'divide_4', // n ÷ 4 = (n ÷ 2) ÷ 2
  DIVIDE_8 = 'divide_8', // n ÷ 8 = (n ÷ 2) ÷ 2 ÷ 2
}

export enum DifficultyLevel {
  BEGINNER = 'beginner', // 1-2 xonali sonlar, oddiy formulalar
  INTERMEDIATE = 'intermediate', // 2-3 xonali sonlar, o'rta formulalar
  ADVANCED = 'advanced', // 3-4 xonali sonlar, murakkab formulalar
  EXPERT = 'expert', // 4+ xonali sonlar, barcha formulalar
}

export interface Formula {
  id: FormulaType;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  minDigits: number;
  maxDigits: number;
  category: 'addition' | 'subtraction' | 'multiplication' | 'division';
}

export const FORMULAS: Record<FormulaType, Formula> = {
  // Qo'shish formulalari
  [FormulaType.ADD_SIMPLE]: {
    id: FormulaType.ADD_SIMPLE,
    name: 'Oddiy qo\'shish',
    description: 'n + 1, n + 2, n + 3, n + 4',
    difficulty: DifficultyLevel.BEGINNER,
    minDigits: 1,
    maxDigits: 7,
    category: 'addition',
  },
  [FormulaType.ADD_5]: {
    id: FormulaType.ADD_5,
    name: '5 orqali qo\'shish',
    description: 'n + 5 (abacus\'da yuqori bead)',
    difficulty: DifficultyLevel.BEGINNER,
    minDigits: 1,
    maxDigits: 7,
    category: 'addition',
  },
  [FormulaType.ADD_6_TO_9]: {
    id: FormulaType.ADD_6_TO_9,
    name: '6-9 orqali qo\'shish',
    description: 'n + 6/7/8/9 = n + 5 + (1/2/3/4)',
    difficulty: DifficultyLevel.INTERMEDIATE,
    minDigits: 1,
    maxDigits: 7,
    category: 'addition',
  },
  [FormulaType.ADD_10]: {
    id: FormulaType.ADD_10,
    name: '10 orqali qo\'shish',
    description: 'n + 10 (keyingi ustunga o\'tish)',
    difficulty: DifficultyLevel.INTERMEDIATE,
    minDigits: 1,
    maxDigits: 7,
    category: 'addition',
  },
  [FormulaType.ADD_COMPLEMENT]: {
    id: FormulaType.ADD_COMPLEMENT,
    name: 'Complement qo\'shish',
    description: 'a + b >= 10 bo\'lganda complement metod',
    difficulty: DifficultyLevel.ADVANCED,
    minDigits: 1,
    maxDigits: 7,
    category: 'addition',
  },
  
  // Ayirish formulalari
  [FormulaType.SUBTRACT_SIMPLE]: {
    id: FormulaType.SUBTRACT_SIMPLE,
    name: 'Oddiy ayirish',
    description: 'n - 1, n - 2, n - 3, n - 4',
    difficulty: DifficultyLevel.BEGINNER,
    minDigits: 1,
    maxDigits: 7,
    category: 'subtraction',
  },
  [FormulaType.SUBTRACT_5]: {
    id: FormulaType.SUBTRACT_5,
    name: '5 orqali ayirish',
    description: 'n - 5',
    difficulty: DifficultyLevel.BEGINNER,
    minDigits: 1,
    maxDigits: 7,
    category: 'subtraction',
  },
  [FormulaType.SUBTRACT_6_TO_9]: {
    id: FormulaType.SUBTRACT_6_TO_9,
    name: '6-9 orqali ayirish',
    description: 'n - 6/7/8/9 = n - 5 - (1/2/3/4)',
    difficulty: DifficultyLevel.INTERMEDIATE,
    minDigits: 1,
    maxDigits: 7,
    category: 'subtraction',
  },
  [FormulaType.SUBTRACT_10]: {
    id: FormulaType.SUBTRACT_10,
    name: '10 orqali ayirish',
    description: 'n - 10',
    difficulty: DifficultyLevel.INTERMEDIATE,
    minDigits: 1,
    maxDigits: 7,
    category: 'subtraction',
  },
  [FormulaType.SUBTRACT_COMPLEMENT]: {
    id: FormulaType.SUBTRACT_COMPLEMENT,
    name: 'Complement ayirish',
    description: 'Borrow qilish kerak bo\'lganda',
    difficulty: DifficultyLevel.ADVANCED,
    minDigits: 1,
    maxDigits: 7,
    category: 'subtraction',
  },
  
  // Ko'paytirish formulalari
  [FormulaType.MULTIPLY_2]: {
    id: FormulaType.MULTIPLY_2,
    name: '2 ga ko\'paytirish',
    description: 'n × 2 = n + n',
    difficulty: DifficultyLevel.BEGINNER,
    minDigits: 1,
    maxDigits: 6,
    category: 'multiplication',
  },
  [FormulaType.MULTIPLY_5]: {
    id: FormulaType.MULTIPLY_5,
    name: '5 ga ko\'paytirish',
    description: 'n × 5 = (n × 10) ÷ 2',
    difficulty: DifficultyLevel.INTERMEDIATE,
    minDigits: 1,
    maxDigits: 6,
    category: 'multiplication',
  },
  [FormulaType.MULTIPLY_9]: {
    id: FormulaType.MULTIPLY_9,
    name: '9 ga ko\'paytirish',
    description: 'n × 9 = (n × 10) - n',
    difficulty: DifficultyLevel.INTERMEDIATE,
    minDigits: 1,
    maxDigits: 6,
    category: 'multiplication',
  },
  [FormulaType.MULTIPLY_10]: {
    id: FormulaType.MULTIPLY_10,
    name: '10 ga ko\'paytirish',
    description: 'n × 10 (oxiriga 0 qo\'shish)',
    difficulty: DifficultyLevel.BEGINNER,
    minDigits: 1,
    maxDigits: 7,
    category: 'multiplication',
  },
  [FormulaType.MULTIPLY_11]: {
    id: FormulaType.MULTIPLY_11,
    name: '11 ga ko\'paytirish',
    description: 'n × 11 = n × 10 + n',
    difficulty: DifficultyLevel.INTERMEDIATE,
    minDigits: 1,
    maxDigits: 5,
    category: 'multiplication',
  },
  [FormulaType.MULTIPLY_25]: {
    id: FormulaType.MULTIPLY_25,
    name: '25 ga ko\'paytirish',
    description: 'n × 25 = (n × 100) ÷ 4',
    difficulty: DifficultyLevel.ADVANCED,
    minDigits: 1,
    maxDigits: 5,
    category: 'multiplication',
  },
  [FormulaType.MULTIPLY_125]: {
    id: FormulaType.MULTIPLY_125,
    name: '125 ga ko\'paytirish',
    description: 'n × 125 = (n × 1000) ÷ 8',
    difficulty: DifficultyLevel.EXPERT,
    minDigits: 1,
    maxDigits: 4,
    category: 'multiplication',
  },
  
  // Bo'lish formulalari
  [FormulaType.DIVIDE_2]: {
    id: FormulaType.DIVIDE_2,
    name: '2 ga bo\'lish',
    description: 'n ÷ 2',
    difficulty: DifficultyLevel.BEGINNER,
    minDigits: 1,
    maxDigits: 7,
    category: 'division',
  },
  [FormulaType.DIVIDE_5]: {
    id: FormulaType.DIVIDE_5,
    name: '5 ga bo\'lish',
    description: 'n ÷ 5 = (n ÷ 10) × 2',
    difficulty: DifficultyLevel.INTERMEDIATE,
    minDigits: 2,
    maxDigits: 7,
    category: 'division',
  },
  [FormulaType.DIVIDE_10]: {
    id: FormulaType.DIVIDE_10,
    name: '10 ga bo\'lish',
    description: 'n ÷ 10 (oxiridagi 0 ni olib tashlash)',
    difficulty: DifficultyLevel.BEGINNER,
    minDigits: 2,
    maxDigits: 7,
    category: 'division',
  },
  [FormulaType.DIVIDE_4]: {
    id: FormulaType.DIVIDE_4,
    name: '4 ga bo\'lish',
    description: 'n ÷ 4 = (n ÷ 2) ÷ 2',
    difficulty: DifficultyLevel.INTERMEDIATE,
    minDigits: 2,
    maxDigits: 7,
    category: 'division',
  },
  [FormulaType.DIVIDE_8]: {
    id: FormulaType.DIVIDE_8,
    name: '8 ga bo\'lish',
    description: 'n ÷ 8 = (n ÷ 2) ÷ 2 ÷ 2',
    difficulty: DifficultyLevel.ADVANCED,
    minDigits: 3,
    maxDigits: 7,
    category: 'division',
  },
};

/**
 * Raqamni raqamlarga ajratish
 */
export function splitIntoDigits(num: number): number[] {
  if (num === 0) return [0];
  const digits: number[] = [];
  let n = Math.abs(num);
  while (n > 0) {
    digits.unshift(n % 10);
    n = Math.floor(n / 10);
  }
  return digits;
}

/**
 * Raqamlardan son yaratish
 */
export function digitsToNumber(digits: number[]): number {
  return digits.reduce((acc, digit) => acc * 10 + digit, 0);
}

/**
 * Sonning xonalar sonini hisoblash
 */
export function getDigitCount(num: number): number {
  if (num === 0) return 1;
  return Math.floor(Math.log10(Math.abs(num))) + 1;
}

