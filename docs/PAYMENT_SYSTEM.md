# UZCARD/HUMO To'lov Tizimi - Qo'llanma

## Umumiy ma'lumot

Bu to'lov tizimi UZCARD va HUMO kartalar orqali to'g'ridan-to'g'ri to'lov qabul qilish uchun yaratilgan. Hozirda **TEST MODE** rejimida ishlaydi va real bank API integratsiyasi keyinroq qo'shiladi.

## To'lov oqimi (Payment Flow)

```
1. Foydalanuvchi rejani tanlaydi
   ↓
2. UZCARD yoki HUMO tanlaydi
   ↓
3. Karta ma'lumotlarini kiritadi:
   - Karta raqami (16 raqam)
   - Amal qilish muddati (MM/YY)
   - Telefon raqami (fiskal chek uchun)
   ↓
4. Shartlarga rozilik beradi
   ↓
5. "Sotib olish" tugmasini bosadi
   ↓
6. Backend to'lovni yaratadi va bank API'ga so'rov yuboradi
   ↓
7. OTP kodi talab qilinadi (agar kerak bo'lsa)
   ↓
8. Foydalanuvchi OTP kodini kiritadi
   ↓
9. To'lov tasdiqlanadi
   ↓
10. Obuna faollashtiriladi
```

## Test Rejimi

### Test kartalar:

**Muvaffaqiyatli to'lovlar:**
- `8600` bilan boshlangan kartalar (UZCARD) - OTP talab qilinadi
- `9860` bilan boshlangan kartalar (HUMO) - OTP talab qilinadi

**Muvaffaqiyatsiz to'lovlar:**
- `8601` bilan boshlangan kartalar - "Insufficient funds"
- `9861` bilan boshlangan kartalar - "Card expired"
- Boshqa kartalar - "Invalid card number"

### OTP kodi:
- Test rejimida: har qanday 6 xonali kod yoki `123456`

## Database Schema

### payments jadvali:

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- plan_id: TEXT
- amount: DECIMAL(10, 2)
- currency: TEXT (default: 'UZS')
- card_type: TEXT ('UZCARD' | 'HUMO')
- card_number_masked: TEXT (masalan: "8600 **** **** 1234")
- card_last_4: TEXT (oxirgi 4 raqam)
- expiry_date: TEXT (MM/YY formatida)
- phone_number: TEXT
- status: TEXT ('pending' | 'otp_sent' | 'confirmed' | 'success' | 'failed' | 'cancelled')
- transaction_id: TEXT (unique)
- merchant_id: TEXT
- terminal_id: TEXT
- signature: TEXT (bank signature/hash)
- error_message: TEXT
- is_yearly: BOOLEAN
- subscription_end: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- confirmed_at: TIMESTAMP
```

## Backend API Endpoints

### 1. create-payment-uzcard-humo

**URL:** `/functions/v1/create-payment-uzcard-humo`

**Method:** POST

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "planId": "pro",
  "amount": 990000,
  "isYearly": false,
  "cardSystem": "uzcard",
  "cardNumber": "8600123456789012",
  "expiryDate": "12/25",
  "phoneNumber": "998935400414"
}
```

**Response (Success):**
```json
{
  "success": true,
  "requiresOtp": true,
  "transactionId": "TXN1234567890ABC",
  "paymentId": "uuid-here",
  "message": null
}
```

**Response (Failure):**
```json
{
  "success": false,
  "requiresOtp": false,
  "transactionId": null,
  "paymentId": null,
  "message": "Invalid card number"
}
```

### 2. confirm-payment

**URL:** `/functions/v1/confirm-payment`

**Method:** POST

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "transactionId": "TXN1234567890ABC",
  "otpCode": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionId": "TXN1234567890ABC",
  "paymentId": "uuid-here",
  "message": "Payment confirmed successfully"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "Invalid OTP code"
}
```

## Environment Variables

Supabase Edge Functions uchun quyidagi environment variables'lar kerak:

```bash
# Merchant credentials
MERCHANT_ID=your_merchant_id
TERMINAL_ID=your_terminal_id
SECRET_KEY=your_secret_key

# Test mode (default: true)
PAYMENT_TEST_MODE=true
```

## Real Bank Integration (Keyinroq)

Real bank API bilan integratsiya qilish uchun:

1. **Bank API hujjatlarini olish:**
   - Bankdan rasmiy API hujjatlarini oling
   - Merchant ID, Terminal ID, Secret Key oling
   - API endpoint URL'larini oling

2. **create-payment-uzcard-humo funksiyasini yangilash:**
   ```typescript
   // TEST_MODE o'rniga real bank API chaqirish
   const bankResponse = await fetch('https://bank-api.example.com/payment/create', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${bankToken}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       merchant_id: merchantId,
       terminal_id: terminalId,
       amount: amount,
       card_number: cardNumber,
       expiry_date: expiryDate,
       transaction_id: transactionId,
       signature: signature,
     }),
   });
   ```

3. **confirm-payment funksiyasini yangilash:**
   ```typescript
   const otpResponse = await fetch('https://bank-api.example.com/payment/verify-otp', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${bankToken}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       transaction_id: transactionId,
       otp_code: otpCode,
     }),
   });
   ```

4. **Environment variables'ni yangilash:**
   ```bash
   PAYMENT_TEST_MODE=false
   BANK_API_URL=https://bank-api.example.com
   BANK_API_TOKEN=your_bank_api_token
   ```

## Xavfsizlik

1. **Karta raqami:**
   - To'liq karta raqami hech qachon saqlanmaydi
   - Faqat oxirgi 4 raqam va maskalangan versiya saqlanadi
   - Masalan: `8600 **** **** 1234`

2. **Signature/Hash:**
   - Har bir to'lov uchun unique signature yaratiladi
   - SHA-256 algoritmi ishlatiladi
   - Secret key hech qachon frontend'ga yuborilmaydi

3. **HTTPS:**
   - Barcha API so'rovlar HTTPS orqali amalga oshiriladi
   - Supabase avtomatik HTTPS qo'llab-quvvatlaydi

## Admin Panel

Admin panel orqali:
- Barcha to'lovlarni ko'rish
- Holat bo'yicha filtrlash
- Qidirish (transaction ID, karta raqami, email)
- To'lov tafsilotlarini ko'rish
- Qo'lda tasdiqlash (kerak bo'lsa)

## Frontend Komponentlar

1. **PaymentForm:**
   - To'lov formasi
   - Karta ma'lumotlarini kiritish
   - Validatsiya

2. **OTPVerification:**
   - OTP kodini kiritish
   - Countdown timer
   - Qayta yuborish funksiyasi

3. **AdminPayments:**
   - Admin panel uchun to'lovlar ro'yxati
   - Filtrlash va qidirish
   - Tafsilotlarni ko'rish

## Xatolar va Yechimlar

### Xatolik: "Invalid card number"
- **Sabab:** Karta raqami 16 raqamdan iborat emas
- **Yechim:** To'g'ri formatda karta raqamini kiriting

### Xatolik: "Invalid OTP code"
- **Sabab:** OTP kodi noto'g'ri yoki muddati o'tgan
- **Yechim:** Yangi OTP kodini so'rang va kiriting

### Xatolik: "Payment not found"
- **Sabab:** Transaction ID topilmadi
- **Yechim:** To'lovni qayta boshlang

## Test Qilish

1. **Test kartasi bilan to'lov:**
   - Karta raqami: `8600123456789012` (UZCARD)
   - Amal qilish muddati: `12/25`
   - Telefon: `998935400414`
   - OTP: `123456`

2. **Muvaffaqiyatsiz to'lov:**
   - Karta raqami: `8601123456789012`
   - Xatolik xabari ko'rinishi kerak

## Keyingi Qadamlar

1. Real bank API integratsiyasi
2. Webhook'lar orqali to'lov holatini avtomatik yangilash
3. To'lov tarixini foydalanuvchiga ko'rsatish
4. Qaytarib berish (refund) funksiyasi
5. To'lov statistikasi va hisobotlar

