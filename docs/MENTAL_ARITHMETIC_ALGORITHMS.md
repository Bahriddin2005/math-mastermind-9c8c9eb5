# Mental Arifmetika (Abacus/Soroban) Algoritmlari

Bu dokumentatsiya mental arifmetika algoritmlari, formulalar, misollar va foydalanish qo'llanmasini o'z ichiga oladi.

## 📋 Mundarija

1. [Formulalar Ro'yxati](#formulalar-royxati)
2. [Algoritm Tushuntirishlari](#algoritm-tushuntirishlari)
3. [Misollar](#misollar)
4. [Darajalar va Tavsiyalar](#darajalar-va-tavsiyalar)
5. [Pseudocode](#pseudocode)
6. [Foydalanish](#foydalanish)

---

## 📚 Formulalar Ro'yxati

### Qo'shish Formulalari (5 ta)

| Formula | Nomi | Tavsif | Qiyinlik |
|---------|------|--------|----------|
| `ADD_SIMPLE` | Oddiy qo'shish | n + 1, 2, 3, 4 | Boshlang'ich |
| `ADD_5` | 5 orqali qo'shish | n + 5 (abacus yuqori bead) | Boshlang'ich |
| `ADD_6_TO_9` | 6-9 orqali qo'shish | n + 6/7/8/9 = n + 5 + (1/2/3/4) | O'rta |
| `ADD_10` | 10 orqali qo'shish | n + 10 (keyingi ustun) | O'rta |
| `ADD_COMPLEMENT` | Complement qo'shish | Ko'p xonali, carry bilan | Yuqori |

### Ayirish Formulalari (5 ta)

| Formula | Nomi | Tavsif | Qiyinlik |
|---------|------|--------|----------|
| `SUBTRACT_SIMPLE` | Oddiy ayirish | n - 1, 2, 3, 4 | Boshlang'ich |
| `SUBTRACT_5` | 5 orqali ayirish | n - 5 | Boshlang'ich |
| `SUBTRACT_6_TO_9` | 6-9 orqali ayirish | n - 6/7/8/9 = n - 5 - (1/2/3/4) | O'rta |
| `SUBTRACT_10` | 10 orqali ayirish | n - 10 | O'rta |
| `SUBTRACT_COMPLEMENT` | Complement ayirish | Borrow bilan | Yuqori |

### Ko'paytirish Formulalari (7 ta)

| Formula | Nomi | Tavsif | Qiyinlik |
|---------|------|--------|----------|
| `MULTIPLY_2` | 2 ga ko'paytirish | n × 2 = n + n | Boshlang'ich |
| `MULTIPLY_5` | 5 ga ko'paytirish | n × 5 = (n × 10) ÷ 2 | O'rta |
| `MULTIPLY_9` | 9 ga ko'paytirish | n × 9 = (n × 10) - n | O'rta |
| `MULTIPLY_10` | 10 ga ko'paytirish | n × 10 (oxiriga 0) | Boshlang'ich |
| `MULTIPLY_11` | 11 ga ko'paytirish | n × 11 = (n × 10) + n | Yuqori |
| `MULTIPLY_25` | 25 ga ko'paytirish | n × 25 = (n × 100) ÷ 4 | Expert |
| `MULTIPLY_125` | 125 ga ko'paytirish | n × 125 = (n × 1000) ÷ 8 | Expert |

### Bo'lish Formulalari (5 ta)

| Formula | Nomi | Tavsif | Qiyinlik |
|---------|------|--------|----------|
| `DIVIDE_2` | 2 ga bo'lish | n ÷ 2 | Boshlang'ich |
| `DIVIDE_5` | 5 ga bo'lish | n ÷ 5 = (n ÷ 10) × 2 | O'rta |
| `DIVIDE_10` | 10 ga bo'lish | n ÷ 10 (oxiridagi 0 ni olib tashlash) | Boshlang'ich |
| `DIVIDE_4` | 4 ga bo'lish | n ÷ 4 = (n ÷ 2) ÷ 2 | Yuqori |
| `DIVIDE_8` | 8 ga bo'lish | n ÷ 8 = (n ÷ 2) ÷ 2 ÷ 2 | Expert |

**Jami: 22 ta asosiy formula** (har birida variatsiyalar mavjud)

---

## 🔄 Algoritm Tushuntirishlari

### 1. Oddiy Qo'shish (n + 1, 2, 3, 4)

```
Masala: 47 + 3 = ?

Qadamlar:
1. Boshlang'ich: 47
2. Oxirgi raqamga 3 qo'shamiz: 7 + 3 = 10
3. 10 >= 10, shuning uchun: 10 % 10 = 0 (yozamiz)
4. Carry = 10 / 10 = 1
5. Keyingi ustun: 4 + 1 = 5
6. Javob: 50
```

**Keyingi qadamlar:**
- Agar sum < 10: to'g'ridan-to'g'ri yozamiz
- Agar sum >= 10: sum % 10 ni yozamiz, carry = sum / 10
- Carry'ni keyingi ustunga ko'taramiz

### 2. 5 orqali Qo'shish (n + 5)

```
Masala: 23 + 5 = ?

Qadamlar:
1. Boshlang'ich: 23
2. Oxirgi raqamga 5 qo'shamiz (abacus'da yuqori bead)
3. 3 + 5 = 8 < 10, shuning uchun javob: 28
```

**Abacus'da:** Yuqori bead (5) ni ishlatamiz, pastki beadlardan kerakli qismini qo'shamiz.

### 3. Complement Qo'shish (Ko'p xonali)

```
Masala: 1234 + 5678 = ?

Qadamlar (o'ngdan chapga):
1. 4 + 8 = 12 → yozamiz 2, carry 1
2. 3 + 7 + 1(carry) = 11 → yozamiz 1, carry 1
3. 2 + 6 + 1(carry) = 9 → yozamiz 9, carry 0
4. 1 + 5 + 0(carry) = 6 → yozamiz 6
5. Javob: 6912
```

### 4. Borrow bilan Ayirish

```
Masala: 234 - 156 = ?

Qadamlar (o'ngdan chapga):
1. 4 - 6: 4 < 6, borrow kerak
   - 10 dan borrow: 10 + 4 - 6 = 8
   - Keyingi raqamdan 1 ayiramiz: 3 → 2
2. 2 - 5: 2 < 5, yana borrow
   - 10 dan borrow: 10 + 2 - 5 = 7
   - Keyingi raqamdan 1: 2 → 1
3. 1 - 1 = 0
4. Javob: 78
```

### 5. 2 ga Ko'paytirish (n × 2 = n + n)

```
Masala: 47 × 2 = ?

Qadamlar:
1. 47 × 2 = 47 + 47
2. addMultiDigit(47, 47) algoritmini qo'llaymiz
3. Javob: 94
```

### 6. 5 ga Ko'paytirish (n × 5 = (n × 10) ÷ 2)

```
Masala: 24 × 5 = ?

Qadamlar:
1. 24 × 10 = 240
2. 240 ÷ 2 = 120
3. Javob: 120
```

### 7. Long Division (Bo'lish)

```
Masala: 234 ÷ 2 = ?

Qadamlar:
1. 2 ÷ 2 = 1, qoldiq 0
2. 3 ÷ 2 = 1, qoldiq 1 (keyingi raqamga o'tadi)
3. (1×10 + 4) ÷ 2 = 14 ÷ 2 = 7, qoldiq 0
4. Javob: 117
```

---

## 💡 Misollar

### Boshlang'ich Daraja (5-6 yosh)

```typescript
// Oddiy qo'shish
15 + 3 = 18
28 + 4 = 32

// 5 orqali qo'shish
12 + 5 = 17
34 + 5 = 39

// 2 ga ko'paytirish
7 × 2 = 14
15 × 2 = 30

// 10 ga ko'paytirish
5 × 10 = 50
23 × 10 = 230

// 2 ga bo'lish
16 ÷ 2 = 8
24 ÷ 2 = 12
```

### O'rta Daraja (7-8 yosh)

```typescript
// 6-9 orqali qo'shish
23 + 7 = 30  (23 + 5 + 2)
45 + 8 = 53  (45 + 5 + 3)

// 5 ga ko'paytirish
14 × 5 = 70   ((14 × 10) ÷ 2)
28 × 5 = 140  ((28 × 10) ÷ 2)

// 9 ga ko'paytirish
12 × 9 = 108  ((12 × 10) - 12)
35 × 9 = 315  ((35 × 10) - 35)
```

### Yuqori Daraja (9-10 yosh)

```typescript
// Ko'p xonali qo'shish
234 + 567 = 801
1456 + 2789 = 4245

// 11 ga ko'paytirish
23 × 11 = 253  ((23 × 10) + 23)
47 × 11 = 517  ((47 × 10) + 47)

// 4 ga bo'lish
48 ÷ 4 = 12   ((48 ÷ 2) ÷ 2)
100 ÷ 4 = 25  ((100 ÷ 2) ÷ 2)
```

### Expert Daraja (11+ yosh)

```typescript
// 25 ga ko'paytirish
16 × 25 = 400   ((16 × 100) ÷ 4)
48 × 25 = 1200  ((48 × 100) ÷ 4)

// 125 ga ko'paytirish
8 × 125 = 1000   ((8 × 1000) ÷ 8)
24 × 125 = 3000  ((24 × 1000) ÷ 8)

// 8 ga bo'lish
64 ÷ 8 = 8    ((64 ÷ 2) ÷ 2 ÷ 2)
200 ÷ 8 = 25  ((200 ÷ 2) ÷ 2 ÷ 2)
```

---

## 📊 Darajalar va Tavsiyalar

### Boshlang'ich Daraja (5-6 yosh)

**Formulalar:**
- ADD_SIMPLE (n + 1,2,3,4)
- ADD_5 (n + 5)
- SUBTRACT_SIMPLE (n - 1,2,3,4)
- SUBTRACT_5 (n - 5)
- MULTIPLY_2 (n × 2)
- MULTIPLY_10 (n × 10)
- DIVIDE_2 (n ÷ 2)
- DIVIDE_10 (n ÷ 10)

**Xonalar soni:** 1-2 xonali sonlar (10-99)

**Mashqlar:**
- Kuniga 10-15 ta misol
- Oddiy formulalardan boshlash
- Abacus bilan vizual o'rganish

### O'rta Daraja (7-8 yosh)

**Formulalar:**
- Barcha qo'shish formulalari
- Barcha ayirish formulalari
- MULTIPLY_5 (n × 5)
- MULTIPLY_9 (n × 9)
- DIVIDE_5 (n ÷ 5)

**Xonalar soni:** 2-3 xonali sonlar (10-999)

**Mashqlar:**
- Kuniga 20-30 ta misol
- Murakkab formulalarni o'rganish
- Tezlikni oshirish

### Yuqori Daraja (9-10 yosh)

**Formulalar:**
- Barcha ko'paytirish formulalari (11 gacha)
- Barcha bo'lish formulalari (4 gacha)
- Ko'p xonali qo'shish/ayirish

**Xonalar soni:** 3-4 xonali sonlar (100-9999)

**Mashqlar:**
- Kuniga 30-50 ta misol
- Kombinatsiyalangan misollar
- Mental hisoblash (abacus'siz)

### Expert Daraja (11+ yosh)

**Formulalar:**
- Barcha formulalar
- 25, 125 ga ko'paytirish
- 8 ga bo'lish
- Murakkab kombinatsiyalar

**Xonalar soni:** 4+ xonali sonlar (1000+)

**Mashqlar:**
- Kuniga 50+ ta misol
- Rivojlangan formulalar
- Professional darajaga yetish

---

## 💻 Pseudocode

### Ko'p xonali qo'shish

```
FUNCTION addMultiDigit(a, b):
  digitsA = splitIntoDigits(a)
  digitsB = splitIntoDigits(b)
  result = []
  carry = 0
  maxLength = MAX(length(digitsA), length(digitsB))
  
  FOR i = maxLength - 1 DOWNTO 0:
    digitA = digitsA[i] OR 0
    digitB = digitsB[i] OR 0
    sum = digitA + digitB + carry
    
    IF sum < 10:
      result[i] = sum
      carry = 0
    ELSE:
      result[i] = sum % 10
      carry = sum / 10
    END IF
  END FOR
  
  IF carry > 0:
    result.unshift(carry)
  END IF
  
  RETURN digitsToNumber(result)
END FUNCTION
```

### Borrow bilan ayirish

```
FUNCTION subtractWithBorrow(a, b):
  digitsA = splitIntoDigits(a)
  digitsB = splitIntoDigits(b)
  result = []
  
  FOR i = length(digitsA) - 1 DOWNTO 0:
    digitA = digitsA[i]
    digitB = digitsB[i] OR 0
    
    IF digitA >= digitB:
      result[i] = digitA - digitB
    ELSE:
      // Borrow kerak
      result[i] = 10 + digitA - digitB
      j = i - 1
      
      // Borrow zanjiri
      WHILE j >= 0 AND digitsA[j] == 0:
        digitsA[j] = 9
        j--
      END WHILE
      
      IF j >= 0:
        digitsA[j]--
      END IF
    END IF
  END FOR
  
  // Oldingi nollarni olib tashlash
  WHILE result[0] == 0 AND length(result) > 1:
    result.shift()
  END WHILE
  
  RETURN digitsToNumber(result)
END FUNCTION
```

### Long Division

```
FUNCTION divide(a, divisor):
  digitsA = splitIntoDigits(a)
  result = []
  remainder = 0
  
  FOR i = 0 TO length(digitsA) - 1:
    current = remainder * 10 + digitsA[i]
    quotient = current / divisor
    remainder = current % divisor
    
    result.push(quotient)
  END FOR
  
  // Oldingi nollarni olib tashlash
  WHILE result[0] == 0 AND length(result) > 1:
    result.shift()
  END WHILE
  
  RETURN digitsToNumber(result)
END FUNCTION
```

---

## 🚀 Foydalanish

### TypeScript/JavaScript

```typescript
import {
  calculateByFormula,
  FormulaType,
  generateProblemsByLevel,
  DifficultyLevel,
} from '@/utils/mentalArithmetic';

// Hisoblash
const result = calculateByFormula(FormulaType.ADD_SIMPLE, 47, 3);
console.log(result.steps); // Qadamlar ketma-ketligi
console.log(result.result); // Javob: 50

// Misollar yaratish
const problems = generateProblemsByLevel(DifficultyLevel.INTERMEDIATE, 10);

// Har bir masala uchun
problems.forEach(problem => {
  const solution = calculateByFormula(problem.formula, problem.operand1, problem.operand2);
  console.log(`${problem.question} = ${solution.result}`);
});
```

### React Komponentida

```tsx
import { useState } from 'react';
import { calculateByFormula, FormulaType, Problem } from '@/utils/mentalArithmetic';

function MentalArithmeticTrainer({ problem }: { problem: Problem }) {
  const [showSteps, setShowSteps] = useState(false);
  const [solution, setSolution] = useState(null);
  
  const handleSolve = () => {
    const result = calculateByFormula(
      problem.formula,
      problem.operand1,
      problem.operand2
    );
    setSolution(result);
    setShowSteps(true);
  };
  
  return (
    <div>
      <h2>{problem.question}</h2>
      <button onClick={handleSolve}>Yechish</button>
      
      {showSteps && solution && (
        <div>
          <h3>Qadamlar:</h3>
          {solution.steps.map((step, idx) => (
            <div key={idx}>
              <p>{step.stepNumber}. {step.description}</p>
              <p>{step.explanation}</p>
              <p>Joriy qiymat: {step.currentValue}</p>
            </div>
          ))}
          <h3>Javob: {solution.result}</h3>
        </div>
      )}
    </div>
  );
}
```

---

## 📝 Xulosa

Bu algoritmlar to'plami mental arifmetika o'qitish uchun to'liq yechimni ta'minlaydi:

✅ 22 ta asosiy formula (32+ variatsiya)
✅ Step-by-step algoritmlar
✅ Carry va borrow logikasi
✅ Ko'p xonali sonlar bilan ishlash
✅ Misollar generatori
✅ Darajalar bo'yicha tavsiyalar
✅ To'liq dokumentatsiya

Barcha kodlar production-ready va to'g'ridan-to'g'ri ishlatishga tayyor!

