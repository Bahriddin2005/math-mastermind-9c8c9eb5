# Mental Arifmetika (Abacus/Soroban) Algoritmlari

Bu modul mental arifmetika (abacus/soroban metodikasi) asosida ishlaydigan to'liq hisoblash algoritmlari to'plamini o'z ichiga oladi.

## 📚 Struktura

### 1. `formulas.ts` - Formulalar Definitsiyasi
- 32 ta mental arifmetika formulasi
- Har bir formula uchun metadata (nomi, tavsif, qiyinlik darajasi)
- Raqamlar bilan ishlash yordamchi funksiyalar

### 2. `algorithms.ts` - Hisoblash Algoritmlari
- Har bir formula uchun step-by-step algoritm
- Qadamlar ketma-ketligi (steps)
- Carry va borrow logikasi
- Ko'p xonali sonlar bilan ishlash

### 3. `problemGenerator.ts` - Misollar Generatori
- Har bir formula uchun misollar yaratish
- Daraja bo'yicha misollar
- Xonalar sonini nazorat qilish

## 🎯 Formulalar Ro'yxati

### Qo'shish Formulalari (5 ta)
1. **ADD_SIMPLE** - Oddiy qo'shish (n + 1, 2, 3, 4)
2. **ADD_5** - 5 orqali qo'shish (n + 5)
3. **ADD_6_TO_9** - 6-9 orqali qo'shish (n + 6/7/8/9 = n + 5 + 1/2/3/4)
4. **ADD_10** - 10 orqali qo'shish (n + 10)
5. **ADD_COMPLEMENT** - Complement qo'shish (ko'p xonali, carry bilan)

### Ayirish Formulalari (5 ta)
1. **SUBTRACT_SIMPLE** - Oddiy ayirish (n - 1, 2, 3, 4)
2. **SUBTRACT_5** - 5 orqali ayirish (n - 5)
3. **SUBTRACT_6_TO_9** - 6-9 orqali ayirish (n - 6/7/8/9)
4. **SUBTRACT_10** - 10 orqali ayirish (n - 10)
5. **SUBTRACT_COMPLEMENT** - Complement ayirish (borrow bilan)

### Ko'paytirish Formulalari (7 ta)
1. **MULTIPLY_2** - 2 ga ko'paytirish (n × 2 = n + n)
2. **MULTIPLY_5** - 5 ga ko'paytirish (n × 5 = (n × 10) ÷ 2)
3. **MULTIPLY_9** - 9 ga ko'paytirish (n × 9 = (n × 10) - n)
4. **MULTIPLY_10** - 10 ga ko'paytirish (oxiriga 0)
5. **MULTIPLY_11** - 11 ga ko'paytirish (n × 11 = n × 10 + n)
6. **MULTIPLY_25** - 25 ga ko'paytirish (n × 25 = (n × 100) ÷ 4)
7. **MULTIPLY_125** - 125 ga ko'paytirish (n × 125 = (n × 1000) ÷ 8)

### Bo'lish Formulalari (5 ta)
1. **DIVIDE_2** - 2 ga bo'lish (n ÷ 2)
2. **DIVIDE_5** - 5 ga bo'lish (n ÷ 5 = (n ÷ 10) × 2)
3. **DIVIDE_10** - 10 ga bo'lish (oxiridagi 0 ni olib tashlash)
4. **DIVIDE_4** - 4 ga bo'lish (n ÷ 4 = (n ÷ 2) ÷ 2)
5. **DIVIDE_8** - 8 ga bo'lish (n ÷ 8 = (n ÷ 2) ÷ 2 ÷ 2)

**Jami: 22 ta asosiy formula** (har birida variatsiyalar mavjud, jami 32+ formula)

## 📊 Darajalar

1. **BEGINNER** - 1-2 xonali sonlar, oddiy formulalar
2. **INTERMEDIATE** - 2-3 xonali sonlar, o'rta formulalar
3. **ADVANCED** - 3-4 xonali sonlar, murakkab formulalar
4. **EXPERT** - 4+ xonali sonlar, barcha formulalar

## 💻 Foydalanish

### Hisoblash

```typescript
import { calculateByFormula, FormulaType } from './algorithms';

// Oddiy qo'shish
const result = calculateByFormula(FormulaType.ADD_SIMPLE, 47, 3);
console.log(result.steps); // Qadamlar ketma-ketligi
console.log(result.result); // Javob

// Ko'p xonali qo'shish
const result2 = calculateByFormula(FormulaType.ADD_COMPLEMENT, 1234, 5678);
```

### Misollar yaratish

```typescript
import { generateProblemsByLevel, DifficultyLevel } from './problemGenerator';

// Daraja bo'yicha misollar
const problems = generateProblemsByLevel(DifficultyLevel.INTERMEDIATE, 10);

// Ma'lum formula uchun
const addProblems = generateProblems(FormulaType.ADD_5, 5, DifficultyLevel.BEGINNER);
```

## 🔄 Algoritm Oqimi

### Qo'shish Algoritmi (Oddiy)

```
1. Boshlang'ich qiymatni ko'rsatish
2. Oxirgi raqamga qo'shish
3. Agar sum < 10:
   - Natijani yozish
4. Agar sum >= 10:
   - sum % 10 ni yozish
   - Carry = sum / 10
   - Keyingi ustunga carry qo'shish
   - Carry zanjirini davom ettirish
```

### Ayirish Algoritmi (Borrow bilan)

```
1. Boshlang'ich qiymatni ko'rsatish
2. Oxirgi raqamdan ayirish
3. Agar digit >= b:
   - Natijani yozish
4. Agar digit < b:
   - 10 dan borrow qilish
   - 10 + digit - b ni yozish
   - Keyingi raqamdan 1 ni ayirish
   - Borrow zanjirini davom ettirish
```

### Ko'paytirish Algoritmi (2 ga)

```
1. n × 2 = n + n
2. addMultiDigit(n, n) ni chaqirish
```

### Bo'lish Algoritmi (Long Division)

```
1. Har bir raqam ustuni bo'yicha:
   - current = remainder * 10 + digit
   - quotient = current / divisor
   - remainder = current % divisor
   - quotient ni yozish
   - remainder'ni keyingi raqamga o'tkazish
```

## 📝 Pseudocode

### Ko'p xonali qo'shish

```
FUNCTION addMultiDigit(a, b):
  digitsA = splitIntoDigits(a)
  digitsB = splitIntoDigits(b)
  result = []
  carry = 0
  
  FOR i = max(length(digitsA), length(digitsB)) - 1 DOWNTO 0:
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

### Ko'p xonali ayirish (Borrow bilan)

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
  
  RETURN digitsToNumber(result)
END FUNCTION
```

## 🎓 Tavsiyalar

### Boshlang'ich daraja (5-6 yosh)
- Oddiy qo'shish/ayirish (1-4)
- 5 orqali qo'shish/ayirish
- 2 ga ko'paytirish/bo'lish
- 10 ga ko'paytirish/bo'lish
- 1-2 xonali sonlar

### O'rta daraja (7-8 yosh)
- Barcha qo'shish formulalari
- Barcha ayirish formulalari
- 5, 9 ga ko'paytirish
- 2-3 xonali sonlar

### Yuqori daraja (9-10 yosh)
- Barcha ko'paytirish formulalari
- Barcha bo'lish formulalari
- 3-4 xonali sonlar

### Expert daraja (11+ yosh)
- Barcha formulalar
- 4+ xonali sonlar
- Murakkab kombinatsiyalar

## 🔧 Integratsiya

Bu algoritmlar quyidagi loyihalar bilan ishlatilishi mumkin:
- Web trainer
- Mobile app
- AI tutor
- Interactive learning platform

Har bir qadam step-by-step ko'rsatilgan, shuning uchun o'quvchi har bir qadamni tushunishi va o'rganishi mumkin.

