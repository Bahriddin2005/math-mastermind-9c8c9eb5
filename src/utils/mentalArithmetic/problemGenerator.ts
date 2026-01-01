/**
 * Mental Arifmetika Masalalar Generatori
 * Har bir formula va daraja uchun misollar yaratish
 */

import { 
  FormulaType, 
  DifficultyLevel, 
  FORMULAS,
  getDigitCount,
} from './formulas';

export interface Problem {
  id: string;
  formula: FormulaType;
  operand1: number;
  operand2?: number;
  operator: '+' | '-' | '×' | '÷';
  expectedResult: number;
  difficulty: DifficultyLevel;
  question: string;
  hint?: string;
}

/**
 * Raqamni berilgan xonalar sonida yaratish
 */
function generateNumberWithDigits(minDigits: number, maxDigits: number): number {
  const digits = Math.floor(Math.random() * (maxDigits - minDigits + 1)) + minDigits;
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Daraja bo'yicha raqam yaratish
 */
function generateNumberForLevel(level: DifficultyLevel): number {
  switch (level) {
    case DifficultyLevel.BEGINNER:
      return Math.floor(Math.random() * 90) + 10; // 10-99 (2 xonali)
    case DifficultyLevel.INTERMEDIATE:
      return generateNumberWithDigits(2, 3); // 2-3 xonali
    case DifficultyLevel.ADVANCED:
      return generateNumberWithDigits(3, 4); // 3-4 xonali
    case DifficultyLevel.EXPERT:
      return generateNumberWithDigits(4, 6); // 4-6 xonali
    default:
      return generateNumberWithDigits(1, 3);
  }
}

/**
 * ADD_SIMPLE misollari (n + 1,2,3,4)
 */
export function generateAddSimpleProblems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  const formula = FORMULAS[FormulaType.ADD_SIMPLE];
  
  for (let i = 0; i < count; i++) {
    const operand1 = generateNumberForLevel(difficulty);
    const operand2 = Math.floor(Math.random() * 4) + 1; // 1-4
    const expectedResult = operand1 + operand2;
    
    problems.push({
      id: `add_simple_${i}_${Date.now()}`,
      formula: FormulaType.ADD_SIMPLE,
      operand1,
      operand2,
      operator: '+',
      expectedResult,
      difficulty,
      question: `${operand1} + ${operand2} = ?`,
      hint: `${operand2} ni ${operand1} ga oddiy qo'shamiz`,
    });
  }
  
  return problems;
}

/**
 * ADD_5 misollari (n + 5)
 */
export function generateAdd5Problems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < count; i++) {
    const operand1 = generateNumberForLevel(difficulty);
    const expectedResult = operand1 + 5;
    
    problems.push({
      id: `add_5_${i}_${Date.now()}`,
      formula: FormulaType.ADD_5,
      operand1,
      operand2: 5,
      operator: '+',
      expectedResult,
      difficulty,
      question: `${operand1} + 5 = ?`,
      hint: 'Abacus\'da yuqori bead (5) ni qo\'shamiz',
    });
  }
  
  return problems;
}

/**
 * ADD_6_TO_9 misollari (n + 6/7/8/9)
 */
export function generateAdd6To9Problems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < count; i++) {
    const operand1 = generateNumberForLevel(difficulty);
    const operand2 = Math.floor(Math.random() * 4) + 6; // 6-9
    const expectedResult = operand1 + operand2;
    
    problems.push({
      id: `add_6to9_${i}_${Date.now()}`,
      formula: FormulaType.ADD_6_TO_9,
      operand1,
      operand2,
      operator: '+',
      expectedResult,
      difficulty,
      question: `${operand1} + ${operand2} = ?`,
      hint: `${operand1} + ${operand2} = ${operand1} + 5 + ${operand2 - 5}`,
    });
  }
  
  return problems;
}

/**
 * ADD_10 misollari (n + 10)
 */
export function generateAdd10Problems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < count; i++) {
    const operand1 = generateNumberForLevel(difficulty);
    const expectedResult = operand1 + 10;
    
    problems.push({
      id: `add_10_${i}_${Date.now()}`,
      formula: FormulaType.ADD_10,
      operand1,
      operand2: 10,
      operator: '+',
      expectedResult,
      difficulty,
      question: `${operand1} + 10 = ?`,
      hint: '10 qo\'sganda keyingi ustunga o\'tamiz',
    });
  }
  
  return problems;
}

/**
 * ADD_COMPLEMENT misollari (ko'p xonali qo'shish)
 */
export function generateAddComplementProblems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < count; i++) {
    const operand1 = generateNumberForLevel(difficulty);
    const operand2 = generateNumberForLevel(difficulty);
    const expectedResult = operand1 + operand2;
    
    // Faqat carry bo'ladigan misollarni qo'shamiz
    if (expectedResult > operand1 && expectedResult > operand2) {
      problems.push({
        id: `add_complement_${i}_${Date.now()}`,
        formula: FormulaType.ADD_COMPLEMENT,
        operand1,
        operand2,
        operator: '+',
        expectedResult,
        difficulty,
        question: `${operand1} + ${operand2} = ?`,
        hint: 'Har bir ustun bo\'yicha qo\'shamiz, carry\'ni keyingi ustunga ko\'taramiz',
      });
    }
  }
  
  return problems;
}

/**
 * SUBTRACT_SIMPLE misollari (n - 1,2,3,4)
 */
export function generateSubtractSimpleProblems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < count; i++) {
    const operand1 = generateNumberForLevel(difficulty);
    const operand2 = Math.floor(Math.random() * 4) + 1; // 1-4
    const expectedResult = operand1 - operand2;
    
    if (expectedResult >= 0) {
      problems.push({
        id: `subtract_simple_${i}_${Date.now()}`,
        formula: FormulaType.SUBTRACT_SIMPLE,
        operand1,
        operand2,
        operator: '-',
        expectedResult,
        difficulty,
        question: `${operand1} - ${operand2} = ?`,
        hint: `${operand2} ni ${operand1} dan oddiy ayiramiz`,
      });
    }
  }
  
  return problems;
}

/**
 * SUBTRACT_5 misollari (n - 5)
 */
export function generateSubtract5Problems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < count; i++) {
    const operand1 = generateNumberForLevel(difficulty);
    if (operand1 >= 5) {
      const expectedResult = operand1 - 5;
      
      problems.push({
        id: `subtract_5_${i}_${Date.now()}`,
        formula: FormulaType.SUBTRACT_5,
        operand1,
        operand2: 5,
        operator: '-',
        expectedResult,
        difficulty,
        question: `${operand1} - 5 = ?`,
        hint: 'Abacus\'da yuqori beaddan 5 ni olib tashlaymiz',
      });
    }
  }
  
  return problems;
}

/**
 * MULTIPLY_2 misollari (n × 2)
 */
export function generateMultiply2Problems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < count; i++) {
    const operand1 = generateNumberForLevel(difficulty);
    const expectedResult = operand1 * 2;
    
    problems.push({
      id: `multiply_2_${i}_${Date.now()}`,
      formula: FormulaType.MULTIPLY_2,
      operand1,
      operator: '×',
      expectedResult,
      difficulty,
      question: `${operand1} × 2 = ?`,
      hint: `${operand1} × 2 = ${operand1} + ${operand1}`,
    });
  }
  
  return problems;
}

/**
 * MULTIPLY_5 misollari (n × 5)
 */
export function generateMultiply5Problems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < count; i++) {
    const operand1 = generateNumberForLevel(difficulty);
    const expectedResult = operand1 * 5;
    
    problems.push({
      id: `multiply_5_${i}_${Date.now()}`,
      formula: FormulaType.MULTIPLY_5,
      operand1,
      operator: '×',
      expectedResult,
      difficulty,
      question: `${operand1} × 5 = ?`,
      hint: `${operand1} × 5 = (${operand1} × 10) ÷ 2`,
    });
  }
  
  return problems;
}

/**
 * MULTIPLY_9 misollari (n × 9)
 */
export function generateMultiply9Problems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < count; i++) {
    const operand1 = generateNumberForLevel(difficulty);
    const expectedResult = operand1 * 9;
    
    problems.push({
      id: `multiply_9_${i}_${Date.now()}`,
      formula: FormulaType.MULTIPLY_9,
      operand1,
      operator: '×',
      expectedResult,
      difficulty,
      question: `${operand1} × 9 = ?`,
      hint: `${operand1} × 9 = (${operand1} × 10) - ${operand1}`,
    });
  }
  
  return problems;
}

/**
 * MULTIPLY_10 misollari (n × 10)
 */
export function generateMultiply10Problems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < count; i++) {
    const operand1 = generateNumberForLevel(difficulty);
    const expectedResult = operand1 * 10;
    
    problems.push({
      id: `multiply_10_${i}_${Date.now()}`,
      formula: FormulaType.MULTIPLY_10,
      operand1,
      operator: '×',
      expectedResult,
      difficulty,
      question: `${operand1} × 10 = ?`,
      hint: 'Oxiriga 0 qo\'shamiz',
    });
  }
  
  return problems;
}

/**
 * DIVIDE_2 misollari (n ÷ 2)
 */
export function generateDivide2Problems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < count; i++) {
    // Javob butun bo'lishi uchun juft son yaratamiz
    const result = generateNumberForLevel(difficulty);
    const operand1 = result * 2;
    
    problems.push({
      id: `divide_2_${i}_${Date.now()}`,
      formula: FormulaType.DIVIDE_2,
      operand1,
      operator: '÷',
      expectedResult: result,
      difficulty,
      question: `${operand1} ÷ 2 = ?`,
      hint: 'Har bir raqamni 2 ga bo\'lamiz',
    });
  }
  
  return problems;
}

/**
 * DIVIDE_10 misollari (n ÷ 10)
 */
export function generateDivide10Problems(count: number, difficulty: DifficultyLevel): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < count; i++) {
    const result = generateNumberForLevel(difficulty);
    const operand1 = result * 10;
    
    problems.push({
      id: `divide_10_${i}_${Date.now()}`,
      formula: FormulaType.DIVIDE_10,
      operand1,
      operator: '÷',
      expectedResult: result,
      difficulty,
      question: `${operand1} ÷ 10 = ?`,
      hint: 'Oxiridagi 0 ni olib tashlaymiz',
    });
  }
  
  return problems;
}

/**
 * Universal problem generator - formula va daraja bo'yicha
 */
export function generateProblems(
  formula: FormulaType,
  count: number,
  difficulty: DifficultyLevel
): Problem[] {
  switch (formula) {
    case FormulaType.ADD_SIMPLE:
      return generateAddSimpleProblems(count, difficulty);
    case FormulaType.ADD_5:
      return generateAdd5Problems(count, difficulty);
    case FormulaType.ADD_6_TO_9:
      return generateAdd6To9Problems(count, difficulty);
    case FormulaType.ADD_10:
      return generateAdd10Problems(count, difficulty);
    case FormulaType.ADD_COMPLEMENT:
      return generateAddComplementProblems(count, difficulty);
    case FormulaType.SUBTRACT_SIMPLE:
      return generateSubtractSimpleProblems(count, difficulty);
    case FormulaType.SUBTRACT_5:
      return generateSubtract5Problems(count, difficulty);
    case FormulaType.MULTIPLY_2:
      return generateMultiply2Problems(count, difficulty);
    case FormulaType.MULTIPLY_5:
      return generateMultiply5Problems(count, difficulty);
    case FormulaType.MULTIPLY_9:
      return generateMultiply9Problems(count, difficulty);
    case FormulaType.MULTIPLY_10:
      return generateMultiply10Problems(count, difficulty);
    case FormulaType.DIVIDE_2:
      return generateDivide2Problems(count, difficulty);
    case FormulaType.DIVIDE_10:
      return generateDivide10Problems(count, difficulty);
    default:
      return [];
  }
}

/**
 * Daraja bo'yicha barcha formulalar uchun misollar yaratish
 */
export function generateProblemsByLevel(
  difficulty: DifficultyLevel,
  problemsPerFormula: number = 5
): Problem[] {
  const allProblems: Problem[] = [];
  const formulasForLevel = Object.values(FormulaType).filter(
    formula => FORMULAS[formula].difficulty <= difficulty
  );
  
  for (const formula of formulasForLevel) {
    try {
      const problems = generateProblems(formula, problemsPerFormula, difficulty);
      allProblems.push(...problems);
    } catch (error) {
      console.warn(`Failed to generate problems for ${formula}:`, error);
    }
  }
  
  // Aralashtirish
  return allProblems.sort(() => Math.random() - 0.5);
}

