/**
 * Mental Arifmetika Misollar To'plami
 * Har bir formula uchun tayyor misollar
 */

import { FormulaType, DifficultyLevel } from './formulas';
import { Problem } from './problemGenerator';

/**
 * Boshlang'ich daraja misollari (5-6 yosh)
 */
export const BEGINNER_EXAMPLES: Problem[] = [
  // Oddiy qo'shish
  { id: '1', formula: FormulaType.ADD_SIMPLE, operand1: 15, operand2: 3, operator: '+', expectedResult: 18, difficulty: DifficultyLevel.BEGINNER, question: '15 + 3 = ?', hint: '3 ni 15 ga oddiy qo\'shamiz' },
  { id: '2', formula: FormulaType.ADD_SIMPLE, operand1: 28, operand2: 4, operator: '+', expectedResult: 32, difficulty: DifficultyLevel.BEGINNER, question: '28 + 4 = ?', hint: '4 ni 28 ga oddiy qo\'shamiz' },
  
  // 5 orqali qo'shish
  { id: '3', formula: FormulaType.ADD_5, operand1: 12, operand2: 5, operator: '+', expectedResult: 17, difficulty: DifficultyLevel.BEGINNER, question: '12 + 5 = ?', hint: 'Abacus\'da yuqori bead (5) ni qo\'shamiz' },
  { id: '4', formula: FormulaType.ADD_5, operand1: 34, operand2: 5, operator: '+', expectedResult: 39, difficulty: DifficultyLevel.BEGINNER, question: '34 + 5 = ?', hint: 'Abacus\'da yuqori bead (5) ni qo\'shamiz' },
  
  // 2 ga ko'paytirish
  { id: '5', formula: FormulaType.MULTIPLY_2, operand1: 7, operator: '×', expectedResult: 14, difficulty: DifficultyLevel.BEGINNER, question: '7 × 2 = ?', hint: '7 × 2 = 7 + 7' },
  { id: '6', formula: FormulaType.MULTIPLY_2, operand1: 15, operator: '×', expectedResult: 30, difficulty: DifficultyLevel.BEGINNER, question: '15 × 2 = ?', hint: '15 × 2 = 15 + 15' },
  
  // 10 ga ko'paytirish
  { id: '7', formula: FormulaType.MULTIPLY_10, operand1: 5, operator: '×', expectedResult: 50, difficulty: DifficultyLevel.BEGINNER, question: '5 × 10 = ?', hint: 'Oxiriga 0 qo\'shamiz' },
  { id: '8', formula: FormulaType.MULTIPLY_10, operand1: 23, operator: '×', expectedResult: 230, difficulty: DifficultyLevel.BEGINNER, question: '23 × 10 = ?', hint: 'Oxiriga 0 qo\'shamiz' },
  
  // 2 ga bo'lish
  { id: '9', formula: FormulaType.DIVIDE_2, operand1: 16, operator: '÷', expectedResult: 8, difficulty: DifficultyLevel.BEGINNER, question: '16 ÷ 2 = ?', hint: 'Har bir raqamni 2 ga bo\'lamiz' },
  { id: '10', formula: FormulaType.DIVIDE_2, operand1: 24, operator: '÷', expectedResult: 12, difficulty: DifficultyLevel.BEGINNER, question: '24 ÷ 2 = ?', hint: 'Har bir raqamni 2 ga bo\'lamiz' },
  
  // Oddiy ayirish
  { id: '11', formula: FormulaType.SUBTRACT_SIMPLE, operand1: 18, operand2: 3, operator: '-', expectedResult: 15, difficulty: DifficultyLevel.BEGINNER, question: '18 - 3 = ?', hint: '3 ni 18 dan oddiy ayiramiz' },
  { id: '12', formula: FormulaType.SUBTRACT_SIMPLE, operand1: 25, operand2: 4, operator: '-', expectedResult: 21, difficulty: DifficultyLevel.BEGINNER, question: '25 - 4 = ?', hint: '4 ni 25 dan oddiy ayiramiz' },
];

/**
 * O'rta daraja misollari (7-8 yosh)
 */
export const INTERMEDIATE_EXAMPLES: Problem[] = [
  // 6-9 orqali qo'shish
  { id: '13', formula: FormulaType.ADD_6_TO_9, operand1: 23, operand2: 7, operator: '+', expectedResult: 30, difficulty: DifficultyLevel.INTERMEDIATE, question: '23 + 7 = ?', hint: '23 + 7 = 23 + 5 + 2' },
  { id: '14', formula: FormulaType.ADD_6_TO_9, operand1: 45, operand2: 8, operator: '+', expectedResult: 53, difficulty: DifficultyLevel.INTERMEDIATE, question: '45 + 8 = ?', hint: '45 + 8 = 45 + 5 + 3' },
  
  // 10 orqali qo'shish
  { id: '15', formula: FormulaType.ADD_10, operand1: 37, operand2: 10, operator: '+', expectedResult: 47, difficulty: DifficultyLevel.INTERMEDIATE, question: '37 + 10 = ?', hint: '10 qo\'sganda keyingi ustunga o\'tamiz' },
  { id: '16', formula: FormulaType.ADD_10, operand1: 89, operand2: 10, operator: '+', expectedResult: 99, difficulty: DifficultyLevel.INTERMEDIATE, question: '89 + 10 = ?', hint: '10 qo\'sganda keyingi ustunga o\'tamiz' },
  
  // 5 ga ko'paytirish
  { id: '17', formula: FormulaType.MULTIPLY_5, operand1: 14, operator: '×', expectedResult: 70, difficulty: DifficultyLevel.INTERMEDIATE, question: '14 × 5 = ?', hint: '14 × 5 = (14 × 10) ÷ 2' },
  { id: '18', formula: FormulaType.MULTIPLY_5, operand1: 28, operator: '×', expectedResult: 140, difficulty: DifficultyLevel.INTERMEDIATE, question: '28 × 5 = ?', hint: '28 × 5 = (28 × 10) ÷ 2' },
  
  // 9 ga ko'paytirish
  { id: '19', formula: FormulaType.MULTIPLY_9, operand1: 12, operator: '×', expectedResult: 108, difficulty: DifficultyLevel.INTERMEDIATE, question: '12 × 9 = ?', hint: '12 × 9 = (12 × 10) - 12' },
  { id: '20', formula: FormulaType.MULTIPLY_9, operand1: 35, operator: '×', expectedResult: 315, difficulty: DifficultyLevel.INTERMEDIATE, question: '35 × 9 = ?', hint: '35 × 9 = (35 × 10) - 35' },
  
  // 5 orqali ayirish
  { id: '21', formula: FormulaType.SUBTRACT_5, operand1: 27, operand2: 5, operator: '-', expectedResult: 22, difficulty: DifficultyLevel.INTERMEDIATE, question: '27 - 5 = ?', hint: 'Abacus\'da yuqori beaddan 5 ni olib tashlaymiz' },
  { id: '22', formula: FormulaType.SUBTRACT_5, operand1: 48, operand2: 5, operator: '-', expectedResult: 43, difficulty: DifficultyLevel.INTERMEDIATE, question: '48 - 5 = ?', hint: 'Abacus\'da yuqori beaddan 5 ni olib tashlaymiz' },
  
  // 6-9 orqali ayirish
  { id: '23', formula: FormulaType.SUBTRACT_6_TO_9, operand1: 34, operand2: 7, operator: '-', expectedResult: 27, difficulty: DifficultyLevel.INTERMEDIATE, question: '34 - 7 = ?', hint: '34 - 7 = 34 - 5 - 2' },
  { id: '24', formula: FormulaType.SUBTRACT_6_TO_9, operand1: 56, operand2: 8, operator: '-', expectedResult: 48, difficulty: DifficultyLevel.INTERMEDIATE, question: '56 - 8 = ?', hint: '56 - 8 = 56 - 5 - 3' },
];

/**
 * Yuqori daraja misollari (9-10 yosh)
 */
export const ADVANCED_EXAMPLES: Problem[] = [
  // Ko'p xonali qo'shish
  { id: '25', formula: FormulaType.ADD_COMPLEMENT, operand1: 234, operand2: 567, operator: '+', expectedResult: 801, difficulty: DifficultyLevel.ADVANCED, question: '234 + 567 = ?', hint: 'Har bir ustun bo\'yicha qo\'shamiz, carry\'ni keyingi ustunga ko\'taramiz' },
  { id: '26', formula: FormulaType.ADD_COMPLEMENT, operand1: 1456, operand2: 2789, operator: '+', expectedResult: 4245, difficulty: DifficultyLevel.ADVANCED, question: '1456 + 2789 = ?', hint: 'Har bir ustun bo\'yicha qo\'shamiz, carry\'ni keyingi ustunga ko\'taramiz' },
  
  // 11 ga ko'paytirish
  { id: '27', formula: FormulaType.MULTIPLY_11, operand1: 23, operator: '×', expectedResult: 253, difficulty: DifficultyLevel.ADVANCED, question: '23 × 11 = ?', hint: '23 × 11 = (23 × 10) + 23' },
  { id: '28', formula: FormulaType.MULTIPLY_11, operand1: 47, operator: '×', expectedResult: 517, difficulty: DifficultyLevel.ADVANCED, question: '47 × 11 = ?', hint: '47 × 11 = (47 × 10) + 47' },
  
  // 4 ga bo'lish
  { id: '29', formula: FormulaType.DIVIDE_4, operand1: 48, operator: '÷', expectedResult: 12, difficulty: DifficultyLevel.ADVANCED, question: '48 ÷ 4 = ?', hint: '48 ÷ 4 = (48 ÷ 2) ÷ 2' },
  { id: '30', formula: FormulaType.DIVIDE_4, operand1: 100, operator: '÷', expectedResult: 25, difficulty: DifficultyLevel.ADVANCED, question: '100 ÷ 4 = ?', hint: '100 ÷ 4 = (100 ÷ 2) ÷ 2' },
  
  // 5 ga bo'lish
  { id: '31', formula: FormulaType.DIVIDE_5, operand1: 150, operator: '÷', expectedResult: 30, difficulty: DifficultyLevel.ADVANCED, question: '150 ÷ 5 = ?', hint: '150 ÷ 5 = (150 ÷ 10) × 2' },
  { id: '32', formula: FormulaType.DIVIDE_5, operand1: 250, operator: '÷', expectedResult: 50, difficulty: DifficultyLevel.ADVANCED, question: '250 ÷ 5 = ?', hint: '250 ÷ 5 = (250 ÷ 10) × 2' },
];

/**
 * Expert daraja misollari (11+ yosh)
 */
export const EXPERT_EXAMPLES: Problem[] = [
  // 25 ga ko'paytirish
  { id: '33', formula: FormulaType.MULTIPLY_25, operand1: 16, operator: '×', expectedResult: 400, difficulty: DifficultyLevel.EXPERT, question: '16 × 25 = ?', hint: '16 × 25 = (16 × 100) ÷ 4' },
  { id: '34', formula: FormulaType.MULTIPLY_25, operand1: 48, operator: '×', expectedResult: 1200, difficulty: DifficultyLevel.EXPERT, question: '48 × 25 = ?', hint: '48 × 25 = (48 × 100) ÷ 4' },
  
  // 125 ga ko'paytirish
  { id: '35', formula: FormulaType.MULTIPLY_125, operand1: 8, operator: '×', expectedResult: 1000, difficulty: DifficultyLevel.EXPERT, question: '8 × 125 = ?', hint: '8 × 125 = (8 × 1000) ÷ 8' },
  { id: '36', formula: FormulaType.MULTIPLY_125, operand1: 24, operator: '×', expectedResult: 3000, difficulty: DifficultyLevel.EXPERT, question: '24 × 125 = ?', hint: '24 × 125 = (24 × 1000) ÷ 8' },
  
  // 8 ga bo'lish
  { id: '37', formula: FormulaType.DIVIDE_8, operand1: 64, operator: '÷', expectedResult: 8, difficulty: DifficultyLevel.EXPERT, question: '64 ÷ 8 = ?', hint: '64 ÷ 8 = (64 ÷ 2) ÷ 2 ÷ 2' },
  { id: '38', formula: FormulaType.DIVIDE_8, operand1: 200, operator: '÷', expectedResult: 25, difficulty: DifficultyLevel.EXPERT, question: '200 ÷ 8 = ?', hint: '200 ÷ 8 = (200 ÷ 2) ÷ 2 ÷ 2' },
  
  // Ko'p xonali qo'shish (4+ xonali)
  { id: '39', formula: FormulaType.ADD_COMPLEMENT, operand1: 1234, operand2: 5678, operator: '+', expectedResult: 6912, difficulty: DifficultyLevel.EXPERT, question: '1234 + 5678 = ?', hint: 'Har bir ustun bo\'yicha qo\'shamiz, carry\'ni keyingi ustunga ko\'taramiz' },
  { id: '40', formula: FormulaType.ADD_COMPLEMENT, operand1: 9876, operand2: 5432, operator: '+', expectedResult: 15308, difficulty: DifficultyLevel.EXPERT, question: '9876 + 5432 = ?', hint: 'Har bir ustun bo\'yicha qo\'shamiz, carry\'ni keyingi ustunga ko\'taramiz' },
];

/**
 * Barcha misollar to'plami
 */
export const ALL_EXAMPLES: Problem[] = [
  ...BEGINNER_EXAMPLES,
  ...INTERMEDIATE_EXAMPLES,
  ...ADVANCED_EXAMPLES,
  ...EXPERT_EXAMPLES,
];

/**
 * Daraja bo'yicha misollar olish
 */
export function getExamplesByLevel(level: DifficultyLevel): Problem[] {
  switch (level) {
    case DifficultyLevel.BEGINNER:
      return BEGINNER_EXAMPLES;
    case DifficultyLevel.INTERMEDIATE:
      return INTERMEDIATE_EXAMPLES;
    case DifficultyLevel.ADVANCED:
      return ADVANCED_EXAMPLES;
    case DifficultyLevel.EXPERT:
      return EXPERT_EXAMPLES;
    default:
      return ALL_EXAMPLES;
  }
}

/**
 * Formula bo'yicha misollar olish
 */
export function getExamplesByFormula(formula: FormulaType): Problem[] {
  return ALL_EXAMPLES.filter(p => p.formula === formula);
}

