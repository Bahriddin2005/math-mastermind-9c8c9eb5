/**
 * Mental Arifmetika (Abacus/Soroban) - Asosiy Eksportlar
 * 
 * Bu modul mental arifmetika algoritmlari, formulalar, misollar generatori
 * va barcha yordamchi funksiyalarni eksport qiladi.
 */

// Formulalar va turlar
export {
  FormulaType,
  DifficultyLevel,
  FORMULAS,
  type Formula,
  splitIntoDigits,
  digitsToNumber,
  getDigitCount,
} from './formulas';

// Algoritmlar va hisoblash
export {
  type CalculationStep,
  type CalculationResult,
  calculateByFormula,
  addSimple,
  add5,
  add6To9,
  add10,
  addMultiDigit,
  subtractSimple,
  subtract5,
  subtract6To9,
  subtract10,
  multiply2,
  multiply5,
  multiply9,
  multiply10,
  multiply11,
  multiply25,
  multiply125,
  divide2,
  divide5,
  divide10,
  divide4,
  divide8,
} from './algorithms';

// Misollar generatori
export {
  type Problem,
  generateProblems,
  generateProblemsByLevel,
  generateAddSimpleProblems,
  generateAdd5Problems,
  generateAdd6To9Problems,
  generateAdd10Problems,
  generateAddComplementProblems,
  generateSubtractSimpleProblems,
  generateSubtract5Problems,
  generateMultiply2Problems,
  generateMultiply5Problems,
  generateMultiply9Problems,
  generateMultiply10Problems,
  generateDivide2Problems,
  generateDivide10Problems,
} from './problemGenerator';

// Tayyor misollar
export {
  BEGINNER_EXAMPLES,
  INTERMEDIATE_EXAMPLES,
  ADVANCED_EXAMPLES,
  EXPERT_EXAMPLES,
  ALL_EXAMPLES,
  getExamplesByLevel,
  getExamplesByFormula,
} from './examples';

