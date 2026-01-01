/**
 * Mental Arifmetika Algoritmlari
 * Har bir formula uchun step-by-step algoritm
 */

import { FormulaType, splitIntoDigits, digitsToNumber, getDigitCount } from './formulas';

export interface CalculationStep {
  stepNumber: number;
  description: string;
  operation: string;
  currentValue: number;
  workingDigit?: number; // Qaysi raqam ustida ishlayapmiz
  carry?: number; // Carry/borrow qiymati
  explanation: string;
}

export interface CalculationResult {
  formula: FormulaType;
  operand1: number;
  operand2?: number;
  result: number;
  steps: CalculationStep[];
  formulaUsed: string;
}

/**
 * QO'SHISH ALGORITMLARI
 */

/**
 * Oddiy qo'shish: n + 1, n + 2, n + 3, n + 4
 */
export function addSimple(a: number, b: number): CalculationResult {
  const steps: CalculationStep[] = [];
  let result = a;
  const digitsA = splitIntoDigits(a);
  const digitsB = splitIntoDigits(b);
  
  // B bir xonali bo'lishi kerak (1-4)
  if (b < 1 || b > 4) {
    throw new Error('addSimple: b must be between 1 and 4');
  }
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} sonini qo'shishni boshlaymiz`,
  });
  
  // Har bir raqam ustunida ishlash (o'ngdan chapga)
  let carry = 0;
  let position = digitsA.length - 1;
  
  // Faqat oxirgi raqamga qo'shamiz
  const lastDigit = digitsA[position] || 0;
  const sum = lastDigit + b + carry;
  
  if (sum < 10) {
    digitsA[position] = sum;
    steps.push({
      stepNumber: 2,
      description: `Oxirgi raqamga ${b} qo'shamiz`,
      operation: `${lastDigit} + ${b} = ${sum}`,
      currentValue: digitsToNumber(digitsA),
      workingDigit: position,
      explanation: `${lastDigit} + ${b} = ${sum}. Carry yo'q.`,
    });
  } else {
    digitsA[position] = sum % 10;
    carry = Math.floor(sum / 10);
    steps.push({
      stepNumber: 2,
      description: `Oxirgi raqamga ${b} qo'shamiz`,
      operation: `${lastDigit} + ${b} = ${sum} = ${sum % 10} + carry ${carry}`,
      currentValue: digitsToNumber(digitsA),
      workingDigit: position,
      carry: carry,
      explanation: `${lastDigit} + ${b} = ${sum}. ${sum % 10} ni yozamiz, ${carry} ni keyingi ustunga ko'taramiz.`,
    });
    
    // Carry'ni keyingi ustunga qo'shish
    position--;
    while (carry > 0 && position >= 0) {
      const digit = digitsA[position] || 0;
      const newSum = digit + carry;
      if (newSum < 10) {
        digitsA[position] = newSum;
        carry = 0;
        steps.push({
          stepNumber: steps.length + 1,
          description: `Carry'ni keyingi ustunga qo'shamiz`,
          operation: `${digit} + ${carry} = ${newSum}`,
          currentValue: digitsToNumber(digitsA),
          workingDigit: position,
          explanation: `Carry ${carry} ni qo'shdik. Javob: ${digitsToNumber(digitsA)}`,
        });
      } else {
        digitsA[position] = newSum % 10;
        carry = Math.floor(newSum / 10);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Carry'ni keyingi ustunga qo'shamiz`,
          operation: `${digit} + 1 = ${newSum} = ${newSum % 10} + carry ${carry}`,
          currentValue: digitsToNumber(digitsA),
          workingDigit: position,
          carry: carry,
          explanation: `${digit} + 1 = ${newSum}. Yana carry bor.`,
        });
        position--;
      }
    }
    
    // Agar hali ham carry bo'lsa, yangi raqam qo'shamiz
    if (carry > 0) {
      digitsA.unshift(carry);
      steps.push({
        stepNumber: steps.length + 1,
        description: `Yangi raqam qo'shamiz`,
        operation: `Yangi raqam: ${carry}`,
        currentValue: digitsToNumber(digitsA),
        workingDigit: 0,
        explanation: `Carry ${carry} uchun yangi raqam qo'shdik.`,
      });
    }
  }
  
  result = digitsToNumber(digitsA);
  
  return {
    formula: FormulaType.ADD_SIMPLE,
    operand1: a,
    operand2: b,
    result,
    steps,
    formulaUsed: `${a} + ${b} (Oddiy qo'shish)`,
  };
}

/**
 * 5 orqali qo'shish: n + 5
 */
export function add5(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  let result = a;
  const digitsA = splitIntoDigits(a);
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} soniga 5 qo'shamiz (abacus'da yuqori bead)`,
  });
  
  // Oxirgi raqamga 5 qo'shamiz
  let position = digitsA.length - 1;
  const lastDigit = digitsA[position];
  const sum = lastDigit + 5;
  
  if (sum < 10) {
    digitsA[position] = sum;
    steps.push({
      stepNumber: 2,
      description: `Oxirgi raqamga 5 qo'shamiz`,
      operation: `${lastDigit} + 5 = ${sum}`,
      currentValue: digitsToNumber(digitsA),
      workingDigit: position,
      explanation: `Abacus'da yuqori bead (5) ni qo'shdik. ${lastDigit} + 5 = ${sum}`,
    });
  } else {
    // Complement metod: 10 ni qo'shamiz va 5 ni ayiramiz
    digitsA[position] = sum % 10;
    const carry = Math.floor(sum / 10);
    
    steps.push({
      stepNumber: 2,
      description: `5 qo'shish (complement metod)`,
      operation: `${lastDigit} + 5 = ${sum} = ${sum % 10} + carry ${carry}`,
      currentValue: digitsToNumber(digitsA),
      workingDigit: position,
      carry: carry,
      explanation: `${lastDigit} + 5 = ${sum}. ${sum % 10} ni yozamiz, ${carry} ni keyingi ustunga ko'taramiz.`,
    });
    
    // Carry'ni qo'shish
    position--;
    if (position >= 0) {
      const digit = digitsA[position];
      digitsA[position] = digit + carry;
      steps.push({
        stepNumber: 3,
        description: `Carry'ni qo'shamiz`,
        operation: `${digit} + ${carry} = ${digitsA[position]}`,
        currentValue: digitsToNumber(digitsA),
        workingDigit: position,
        explanation: `Keyingi ustunga ${carry} qo'shdik.`,
      });
    } else if (carry > 0) {
      digitsA.unshift(carry);
      steps.push({
        stepNumber: 3,
        description: `Yangi raqam qo'shamiz`,
        operation: `Yangi raqam: ${carry}`,
        currentValue: digitsToNumber(digitsA),
        workingDigit: 0,
        explanation: `Carry ${carry} uchun yangi raqam qo'shdik.`,
      });
    }
  }
  
  result = digitsToNumber(digitsA);
  
  return {
    formula: FormulaType.ADD_5,
    operand1: a,
    result,
    steps,
    formulaUsed: `${a} + 5 (5 orqali qo'shish)`,
  };
}

/**
 * 6-9 orqali qo'shish: n + 6/7/8/9 = n + 5 + (1/2/3/4)
 */
export function add6To9(a: number, b: number): CalculationResult {
  if (b < 6 || b > 9) {
    throw new Error('add6To9: b must be between 6 and 9');
  }
  
  const steps: CalculationStep[] = [];
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} + ${b} = ${a} + 5 + ${b - 5}`,
  });
  
  // Avval 5 qo'shamiz
  const add5Result = add5(a);
  steps.push(...add5Result.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 1,
    description: `5 qo'shamiz: ${step.description}`,
  })));
  
  // Keyin qolgan qismini qo'shamiz (1, 2, 3, yoki 4)
  const remainder = b - 5;
  const addSimpleResult = addSimple(add5Result.result, remainder);
  steps.push(...addSimpleResult.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + add5Result.steps.length + 1,
    description: `${remainder} qo'shamiz: ${step.description}`,
  })));
  
  return {
    formula: FormulaType.ADD_6_TO_9,
    operand1: a,
    operand2: b,
    result: addSimpleResult.result,
    steps,
    formulaUsed: `${a} + ${b} = ${a} + 5 + ${remainder}`,
  };
}

/**
 * 10 orqali qo'shish: n + 10
 */
export function add10(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} + 10 (keyingi ustunga o'tish)`,
  });
  
  const result = a + 10;
  
  steps.push({
    stepNumber: 2,
    description: `10 qo'shamiz`,
    operation: `${a} + 10 = ${result}`,
    currentValue: result,
    explanation: `10 qo'shganda keyingi ustunga o'tamiz. ${a} + 10 = ${result}`,
  });
  
  return {
    formula: FormulaType.ADD_10,
    operand1: a,
    result,
    steps,
    formulaUsed: `${a} + 10`,
  };
}

/**
 * Ko'p xonali sonlar qo'shish (complement metod)
 */
export function addMultiDigit(a: number, b: number): CalculationResult {
  const steps: CalculationStep[] = [];
  const digitsA = splitIntoDigits(a);
  const digitsB = splitIntoDigits(b);
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymatlar`,
    operation: `${a} + ${b}`,
    currentValue: a,
    explanation: `${a} va ${b} sonlarini qo'shamiz`,
  });
  
  // Uzunroq sonni aniqlash
  const maxLength = Math.max(digitsA.length, digitsB.length);
  const resultDigits: number[] = [];
  let carry = 0;
  
  // O'ngdan chapga qo'shamiz
  for (let i = maxLength - 1; i >= 0; i--) {
    const digitA = digitsA[i + (digitsA.length - maxLength)] || 0;
    const digitB = digitsB[i + (digitsB.length - maxLength)] || 0;
    const position = maxLength - 1 - i;
    
    const sum = digitA + digitB + carry;
    
    if (sum < 10) {
      resultDigits.unshift(sum);
      carry = 0;
      steps.push({
        stepNumber: steps.length + 1,
        description: `${position + 1}-ustun: ${digitA} + ${digitB}`,
        operation: `${digitA} + ${digitB} = ${sum}`,
        currentValue: digitsToNumber(resultDigits),
        workingDigit: position,
        explanation: `${position + 1}-ustunda: ${digitA} + ${digitB} = ${sum}. Carry yo'q.`,
      });
    } else {
      resultDigits.unshift(sum % 10);
      carry = Math.floor(sum / 10);
      steps.push({
        stepNumber: steps.length + 1,
        description: `${position + 1}-ustun: ${digitA} + ${digitB}`,
        operation: `${digitA} + ${digitB} = ${sum} = ${sum % 10} + carry ${carry}`,
        currentValue: digitsToNumber(resultDigits),
        workingDigit: position,
        carry: carry,
        explanation: `${position + 1}-ustunda: ${digitA} + ${digitB} = ${sum}. ${sum % 10} ni yozamiz, ${carry} ni keyingi ustunga ko'taramiz.`,
      });
    }
  }
  
  if (carry > 0) {
    resultDigits.unshift(carry);
    steps.push({
      stepNumber: steps.length + 1,
      description: `Yangi raqam qo'shamiz`,
      operation: `Carry: ${carry}`,
      currentValue: digitsToNumber(resultDigits),
      workingDigit: 0,
      explanation: `Oxirgi carry ${carry} uchun yangi raqam qo'shdik.`,
    });
  }
  
  const result = digitsToNumber(resultDigits);
  
  return {
    formula: FormulaType.ADD_COMPLEMENT,
    operand1: a,
    operand2: b,
    result,
    steps,
    formulaUsed: `${a} + ${b} (Ko'p xonali qo'shish)`,
  };
}

/**
 * AYIRISH ALGORITMLARI
 */

/**
 * Oddiy ayirish: n - 1, n - 2, n - 3, n - 4
 */
export function subtractSimple(a: number, b: number): CalculationResult {
  if (b < 1 || b > 4) {
    throw new Error('subtractSimple: b must be between 1 and 4');
  }
  
  const steps: CalculationStep[] = [];
  const digitsA = splitIntoDigits(a);
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} dan ${b} ni ayiramiz`,
  });
  
  let position = digitsA.length - 1;
  let lastDigit = digitsA[position];
  
  if (lastDigit >= b) {
    digitsA[position] = lastDigit - b;
    steps.push({
      stepNumber: 2,
      description: `Oxirgi raqamdan ${b} ni ayiramiz`,
      operation: `${lastDigit} - ${b} = ${digitsA[position]}`,
      currentValue: digitsToNumber(digitsA),
      workingDigit: position,
      explanation: `${lastDigit} - ${b} = ${digitsA[position]}. Borrow yo'q.`,
    });
  } else {
    // Borrow kerak
    digitsA[position] = 10 + lastDigit - b;
    let borrowPosition = position - 1;
    
    steps.push({
      stepNumber: 2,
      description: `Borrow qilamiz`,
      operation: `${lastDigit} - ${b} = ${digitsA[position]} (10 dan borrow)`,
      currentValue: digitsToNumber(digitsA),
      workingDigit: position,
      explanation: `${lastDigit} dan ${b} ni ayira olmaymiz, shuning uchun 10 dan borrow qilamiz: 10 + ${lastDigit} - ${b} = ${digitsA[position]}`,
    });
    
    // Keyingi raqamdan 1 ni ayiramiz
    while (borrowPosition >= 0 && digitsA[borrowPosition] === 0) {
      digitsA[borrowPosition] = 9;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Borrow zanjiri`,
        operation: `${borrowPosition + 1}-ustun: 0 dan 1 ayiramiz = 9 (borrow)`,
        currentValue: digitsToNumber(digitsA),
        workingDigit: borrowPosition,
        explanation: `${borrowPosition + 1}-ustunda 0 bor, yana borrow qilamiz.`,
      });
      borrowPosition--;
    }
    
    if (borrowPosition >= 0) {
      digitsA[borrowPosition]--;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Borrow'ni to'ldiramiz`,
        operation: `${borrowPosition + 1}-ustun: ${digitsA[borrowPosition] + 1} - 1 = ${digitsA[borrowPosition]}`,
        currentValue: digitsToNumber(digitsA),
        workingDigit: borrowPosition,
        explanation: `${borrowPosition + 1}-ustundan 1 ni ayirdik.`,
      });
    }
  }
  
  // Oldingi nollarni olib tashlash
  while (digitsA.length > 1 && digitsA[0] === 0) {
    digitsA.shift();
  }
  
  const result = digitsToNumber(digitsA);
  
  return {
    formula: FormulaType.SUBTRACT_SIMPLE,
    operand1: a,
    operand2: b,
    result,
    steps,
    formulaUsed: `${a} - ${b} (Oddiy ayirish)`,
  };
}

/**
 * 5 orqali ayirish: n - 5
 */
export function subtract5(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  const digitsA = splitIntoDigits(a);
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} dan 5 ni ayiramiz`,
  });
  
  let position = digitsA.length - 1;
  let lastDigit = digitsA[position];
  
  if (lastDigit >= 5) {
    digitsA[position] = lastDigit - 5;
    steps.push({
      stepNumber: 2,
      description: `Oxirgi raqamdan 5 ni ayiramiz`,
      operation: `${lastDigit} - 5 = ${digitsA[position]}`,
      currentValue: digitsToNumber(digitsA),
      workingDigit: position,
      explanation: `Abacus'da yuqori beaddan 5 ni olib tashladik. ${lastDigit} - 5 = ${digitsA[position]}`,
    });
  } else {
    // Borrow kerak
    digitsA[position] = 10 + lastDigit - 5;
    let borrowPosition = position - 1;
    
    steps.push({
      stepNumber: 2,
      description: `Borrow qilamiz`,
      operation: `${lastDigit} - 5 = ${digitsA[position]} (10 dan borrow)`,
      currentValue: digitsToNumber(digitsA),
      workingDigit: position,
      explanation: `${lastDigit} dan 5 ni ayira olmaymiz, 10 dan borrow qilamiz: 10 + ${lastDigit} - 5 = ${digitsA[position]}`,
    });
    
    // Borrow zanjiri
    while (borrowPosition >= 0 && digitsA[borrowPosition] === 0) {
      digitsA[borrowPosition] = 9;
      borrowPosition--;
    }
    
    if (borrowPosition >= 0) {
      digitsA[borrowPosition]--;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Borrow'ni to'ldiramiz`,
        operation: `${borrowPosition + 1}-ustun: ${digitsA[borrowPosition] + 1} - 1 = ${digitsA[borrowPosition]}`,
        currentValue: digitsToNumber(digitsA),
        workingDigit: borrowPosition,
        explanation: `${borrowPosition + 1}-ustundan 1 ni ayirdik.`,
      });
    }
  }
  
  while (digitsA.length > 1 && digitsA[0] === 0) {
    digitsA.shift();
  }
  
  const result = digitsToNumber(digitsA);
  
  return {
    formula: FormulaType.SUBTRACT_5,
    operand1: a,
    result,
    steps,
    formulaUsed: `${a} - 5`,
  };
}

/**
 * 6-9 orqali ayirish: n - 6/7/8/9 = n - 5 - (1/2/3/4)
 */
export function subtract6To9(a: number, b: number): CalculationResult {
  if (b < 6 || b > 9) {
    throw new Error('subtract6To9: b must be between 6 and 9');
  }
  
  const steps: CalculationStep[] = [];
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich`,
    operation: `${a} - ${b} = ${a} - 5 - ${b - 5}`,
    currentValue: a,
    explanation: `${a} - ${b} = ${a} - 5 - ${b - 5}`,
  });
  
  // Avval 5 ni ayiramiz
  const subtract5Result = subtract5(a);
  steps.push(...subtract5Result.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 1,
    description: `5 ni ayiramiz: ${step.description}`,
  })));
  
  // Keyin qolgan qismini ayiramiz
  const remainder = b - 5;
  const subtractSimpleResult = subtractSimple(subtract5Result.result, remainder);
  steps.push(...subtractSimpleResult.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + subtract5Result.steps.length + 1,
    description: `${remainder} ni ayiramiz: ${step.description}`,
  })));
  
  return {
    formula: FormulaType.SUBTRACT_6_TO_9,
    operand1: a,
    operand2: b,
    result: subtractSimpleResult.result,
    steps,
    formulaUsed: `${a} - ${b} = ${a} - 5 - ${remainder}`,
  };
}

/**
 * KO'PAYTIRISH ALGORITMLARI
 */

/**
 * 2 ga ko'paytirish: n × 2 = n + n
 */
export function multiply2(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} × 2 = ${a} + ${a}`,
  });
  
  const result = addMultiDigit(a, a);
  steps.push(...result.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 1,
    description: `${a} ni qo'shamiz: ${step.description}`,
  })));
  
  return {
    formula: FormulaType.MULTIPLY_2,
    operand1: a,
    result: result.result,
    steps,
    formulaUsed: `${a} × 2 = ${a} + ${a}`,
  };
}

/**
 * 10 ga ko'paytirish: n × 10 (oxiriga 0 qo'shish)
 */
export function multiply10(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} × 10`,
  });
  
  const result = a * 10;
  
  steps.push({
    stepNumber: 2,
    description: `Oxiriga 0 qo'shamiz`,
    operation: `${a} × 10 = ${result}`,
    currentValue: result,
    explanation: `10 ga ko'paytirganda oxiriga 0 qo'shamiz: ${a} × 10 = ${result}`,
  });
  
  return {
    formula: FormulaType.MULTIPLY_10,
    operand1: a,
    result,
    steps,
    formulaUsed: `${a} × 10`,
  };
}

/**
 * 5 ga ko'paytirish: n × 5 = (n × 10) ÷ 2
 */
export function multiply5(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} × 5 = (${a} × 10) ÷ 2`,
  });
  
  const multiply10Result = multiply10(a);
  steps.push(...multiply10Result.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 1,
    description: `10 ga ko'paytiramiz: ${step.description}`,
  })));
  
  const result = multiply10Result.result / 2;
  
  steps.push({
    stepNumber: steps.length + 1,
    description: `2 ga bo'lamiz`,
    operation: `${multiply10Result.result} ÷ 2 = ${result}`,
    currentValue: result,
    explanation: `10 ga ko'paytirgandan keyin 2 ga bo'lamiz: ${multiply10Result.result} ÷ 2 = ${result}`,
  });
  
  return {
    formula: FormulaType.MULTIPLY_5,
    operand1: a,
    result,
    steps,
    formulaUsed: `${a} × 5 = (${a} × 10) ÷ 2`,
  };
}

/**
 * 9 ga ko'paytirish: n × 9 = (n × 10) - n
 */
export function multiply9(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} × 9 = (${a} × 10) - ${a}`,
  });
  
  const multiply10Result = multiply10(a);
  steps.push(...multiply10Result.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 1,
    description: `10 ga ko'paytiramiz: ${step.description}`,
  })));
  
  const subtractResult = subtractSimple(multiply10Result.result, a);
  steps.push(...subtractResult.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + multiply10Result.steps.length + 1,
    description: `${a} ni ayiramiz: ${step.description}`,
  })));
  
  return {
    formula: FormulaType.MULTIPLY_9,
    operand1: a,
    result: subtractResult.result,
    steps,
    formulaUsed: `${a} × 9 = (${a} × 10) - ${a}`,
  };
}

/**
 * 11 ga ko'paytirish: n × 11 = n × 10 + n
 */
export function multiply11(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} × 11 = (${a} × 10) + ${a}`,
  });
  
  const multiply10Result = multiply10(a);
  steps.push(...multiply10Result.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 1,
    description: `10 ga ko'paytiramiz: ${step.description}`,
  })));
  
  const addResult = addMultiDigit(multiply10Result.result, a);
  steps.push(...addResult.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + multiply10Result.steps.length + 1,
    description: `${a} ni qo'shamiz: ${step.description}`,
  })));
  
  return {
    formula: FormulaType.MULTIPLY_11,
    operand1: a,
    result: addResult.result,
    steps,
    formulaUsed: `${a} × 11 = (${a} × 10) + ${a}`,
  };
}

/**
 * 25 ga ko'paytirish: n × 25 = (n × 100) ÷ 4
 */
export function multiply25(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} × 25 = (${a} × 100) ÷ 4`,
  });
  
  const multiply100Result = multiply10(multiply10(a).result);
  steps.push({
    stepNumber: 2,
    description: `100 ga ko'paytiramiz`,
    operation: `${a} × 100 = ${multiply100Result.result}`,
    currentValue: multiply100Result.result,
    explanation: `${a} × 100 = ${multiply100Result.result} (oxiriga 2 ta 0 qo'shamiz)`,
  });
  
  const divide4Result = divide2(divide2(multiply100Result.result).result);
  steps.push(...divide4Result.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 2,
    description: `4 ga bo'lamiz (2 marta 2 ga): ${step.description}`,
  })));
  
  return {
    formula: FormulaType.MULTIPLY_25,
    operand1: a,
    result: divide4Result.result,
    steps,
    formulaUsed: `${a} × 25 = (${a} × 100) ÷ 4`,
  };
}

/**
 * 125 ga ko'paytirish: n × 125 = (n × 1000) ÷ 8
 */
export function multiply125(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} × 125 = (${a} × 1000) ÷ 8`,
  });
  
  const multiply1000Result = multiply10(multiply10(multiply10(a).result).result);
  steps.push({
    stepNumber: 2,
    description: `1000 ga ko'paytiramiz`,
    operation: `${a} × 1000 = ${multiply1000Result.result}`,
    currentValue: multiply1000Result.result,
    explanation: `${a} × 1000 = ${multiply1000Result.result} (oxiriga 3 ta 0 qo'shamiz)`,
  });
  
  // 8 ga bo'lish = 3 marta 2 ga bo'lish
  let temp = multiply1000Result.result;
  let divideResult = divide2(temp);
  steps.push(...divideResult.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 2,
    description: `1-marta 2 ga bo'lamiz: ${step.description}`,
  })));
  
  temp = divideResult.result;
  divideResult = divide2(temp);
  steps.push(...divideResult.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 2 + divideResult.steps.length,
    description: `2-marta 2 ga bo'lamiz: ${step.description}`,
  })));
  
  temp = divideResult.result;
  divideResult = divide2(temp);
  steps.push(...divideResult.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 2 + divideResult.steps.length * 2,
    description: `3-marta 2 ga bo'lamiz: ${step.description}`,
  })));
  
  return {
    formula: FormulaType.MULTIPLY_125,
    operand1: a,
    result: divideResult.result,
    steps,
    formulaUsed: `${a} × 125 = (${a} × 1000) ÷ 8`,
  };
}

/**
 * BO'LISH ALGORITMLARI
 */

/**
 * 2 ga bo'lish: n ÷ 2
 */
export function divide2(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  const digitsA = splitIntoDigits(a);
  const resultDigits: number[] = [];
  let remainder = 0;
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a} ÷ 2`,
    currentValue: a,
    explanation: `${a} ni 2 ga bo'lamiz`,
  });
  
  // Long division algoritmi
  for (let i = 0; i < digitsA.length; i++) {
    const current = remainder * 10 + digitsA[i];
    const quotient = Math.floor(current / 2);
    remainder = current % 2;
    
    resultDigits.push(quotient);
    
    steps.push({
      stepNumber: steps.length + 1,
      description: `${i + 1}-ustun: ${current} ÷ 2`,
      operation: `${current} ÷ 2 = ${quotient} (qoldiq: ${remainder})`,
      currentValue: digitsToNumber(resultDigits),
      workingDigit: i,
      explanation: `${current} ÷ 2 = ${quotient} (qoldiq ${remainder} keyingi raqamga o'tadi)`,
    });
  }
  
  // Oldingi nollarni olib tashlash
  while (resultDigits.length > 1 && resultDigits[0] === 0) {
    resultDigits.shift();
  }
  
  const result = digitsToNumber(resultDigits);
  
  return {
    formula: FormulaType.DIVIDE_2,
    operand1: a,
    result,
    steps,
    formulaUsed: `${a} ÷ 2`,
  };
}

/**
 * 10 ga bo'lish: n ÷ 10 (oxiridagi 0 ni olib tashlash)
 */
export function divide10(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} ÷ 10`,
  });
  
  if (a % 10 !== 0) {
    const result = Math.floor(a / 10);
    steps.push({
      stepNumber: 2,
      description: `10 ga bo'lamiz`,
      operation: `${a} ÷ 10 = ${result} (qoldiq: ${a % 10})`,
      currentValue: result,
      explanation: `${a} ÷ 10 = ${result} (qoldiq ${a % 10})`,
    });
    
    return {
      formula: FormulaType.DIVIDE_10,
      operand1: a,
      result,
      steps,
      formulaUsed: `${a} ÷ 10`,
    };
  }
  
  const result = a / 10;
  steps.push({
    stepNumber: 2,
    description: `Oxiridagi 0 ni olib tashlaymiz`,
    operation: `${a} ÷ 10 = ${result}`,
    currentValue: result,
    explanation: `10 ga bo'lganda oxiridagi 0 ni olib tashlaymiz: ${a} ÷ 10 = ${result}`,
  });
  
  return {
    formula: FormulaType.DIVIDE_10,
    operand1: a,
    result,
    steps,
    formulaUsed: `${a} ÷ 10`,
  };
}

/**
 * 4 ga bo'lish: n ÷ 4 = (n ÷ 2) ÷ 2
 */
export function divide4(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} ÷ 4 = (${a} ÷ 2) ÷ 2`,
  });
  
  const divide2Result1 = divide2(a);
  steps.push(...divide2Result1.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 1,
    description: `1-marta 2 ga bo'lamiz: ${step.description}`,
  })));
  
  const divide2Result2 = divide2(divide2Result1.result);
  steps.push(...divide2Result2.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + divide2Result1.steps.length + 1,
    description: `2-marta 2 ga bo'lamiz: ${step.description}`,
  })));
  
  return {
    formula: FormulaType.DIVIDE_4,
    operand1: a,
    result: divide2Result2.result,
    steps,
    formulaUsed: `${a} ÷ 4 = (${a} ÷ 2) ÷ 2`,
  };
}

/**
 * 8 ga bo'lish: n ÷ 8 = (n ÷ 2) ÷ 2 ÷ 2
 */
export function divide8(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} ÷ 8 = (${a} ÷ 2) ÷ 2 ÷ 2`,
  });
  
  let temp = a;
  let divideResult = divide2(temp);
  steps.push(...divideResult.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 1,
    description: `1-marta 2 ga bo'lamiz: ${step.description}`,
  })));
  
  temp = divideResult.result;
  divideResult = divide2(temp);
  steps.push(...divideResult.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 1 + divideResult.steps.length,
    description: `2-marta 2 ga bo'lamiz: ${step.description}`,
  })));
  
  temp = divideResult.result;
  divideResult = divide2(temp);
  steps.push(...divideResult.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 1 + divideResult.steps.length * 2,
    description: `3-marta 2 ga bo'lamiz: ${step.description}`,
  })));
  
  return {
    formula: FormulaType.DIVIDE_8,
    operand1: a,
    result: divideResult.result,
    steps,
    formulaUsed: `${a} ÷ 8 = (${a} ÷ 2) ÷ 2 ÷ 2`,
  };
}

/**
 * SUBTRACT_10: n - 10
 */
export function subtract10(a: number): CalculationResult {
  return subtractSimple(a, 10);
}

/**
 * 5 ga bo'lish: n ÷ 5 = (n ÷ 10) × 2
 */
export function divide5(a: number): CalculationResult {
  const steps: CalculationStep[] = [];
  
  steps.push({
    stepNumber: 1,
    description: `Boshlang'ich qiymat`,
    operation: `${a}`,
    currentValue: a,
    explanation: `${a} ÷ 5 = (${a} ÷ 10) × 2`,
  });
  
  const divide10Result = divide10(a);
  steps.push(...divide10Result.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + 1,
    description: `10 ga bo'lamiz: ${step.description}`,
  })));
  
  const multiply2Result = multiply2(divide10Result.result);
  steps.push(...multiply2Result.steps.map(step => ({
    ...step,
    stepNumber: step.stepNumber + divide10Result.steps.length + 1,
    description: `2 ga ko'paytiramiz: ${step.description}`,
  })));
  
  return {
    formula: FormulaType.DIVIDE_5,
    operand1: a,
    result: multiply2Result.result,
    steps,
    formulaUsed: `${a} ÷ 5 = (${a} ÷ 10) × 2`,
  };
}

/**
 * Formula bo'yicha hisoblash funksiyasi (universal)
 */
export function calculateByFormula(
  formula: FormulaType,
  operand1: number,
  operand2?: number
): CalculationResult {
  switch (formula) {
    case FormulaType.ADD_SIMPLE:
      if (operand2 === undefined || operand2 < 1 || operand2 > 4) {
        throw new Error('ADD_SIMPLE requires operand2 between 1 and 4');
      }
      return addSimple(operand1, operand2);
    
    case FormulaType.ADD_5:
      return add5(operand1);
    
    case FormulaType.ADD_6_TO_9:
      if (operand2 === undefined || operand2 < 6 || operand2 > 9) {
        throw new Error('ADD_6_TO_9 requires operand2 between 6 and 9');
      }
      return add6To9(operand1, operand2);
    
    case FormulaType.ADD_10:
      return add10(operand1);
    
    case FormulaType.ADD_COMPLEMENT:
      if (operand2 === undefined) {
        throw new Error('ADD_COMPLEMENT requires operand2');
      }
      return addMultiDigit(operand1, operand2);
    
    case FormulaType.SUBTRACT_SIMPLE:
      if (operand2 === undefined || operand2 < 1 || operand2 > 4) {
        throw new Error('SUBTRACT_SIMPLE requires operand2 between 1 and 4');
      }
      return subtractSimple(operand1, operand2);
    
    case FormulaType.SUBTRACT_5:
      return subtract5(operand1);
    
    case FormulaType.SUBTRACT_6_TO_9:
      if (operand2 === undefined || operand2 < 6 || operand2 > 9) {
        throw new Error('SUBTRACT_6_TO_9 requires operand2 between 6 and 9');
      }
      return subtract6To9(operand1, operand2);
    
    case FormulaType.SUBTRACT_10:
      return subtract10(operand1);
    
    case FormulaType.MULTIPLY_2:
      return multiply2(operand1);
    
    case FormulaType.MULTIPLY_5:
      return multiply5(operand1);
    
    case FormulaType.MULTIPLY_9:
      return multiply9(operand1);
    
    case FormulaType.MULTIPLY_10:
      return multiply10(operand1);
    
    case FormulaType.MULTIPLY_11:
      return multiply11(operand1);
    
    case FormulaType.MULTIPLY_25:
      return multiply25(operand1);
    
    case FormulaType.MULTIPLY_125:
      return multiply125(operand1);
    
    case FormulaType.DIVIDE_2:
      return divide2(operand1);
    
    case FormulaType.DIVIDE_5:
      return divide5(operand1);
    
    case FormulaType.DIVIDE_10:
      return divide10(operand1);
    
    case FormulaType.DIVIDE_4:
      return divide4(operand1);
    
    case FormulaType.DIVIDE_8:
      return divide8(operand1);
    
    default:
      throw new Error(`Unsupported formula: ${formula}`);
  }
}

