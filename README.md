# پلتفرم پدل و تنیس

پلتفرم فارسی تنیس و پدل با Next.js/TypeScript در فرانت‌اند، NestJS در بک‌اند و PostgreSQL/Prisma برای داده‌ها.

## راه‌اندازی محلی

نیازمندی‌ها: Node.js 20+، npm و Docker Desktop.

```powershell
Copy-Item .env.example .env
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
npm install
npm run db:up
npm run db:migrate --workspace @varzesha/api -- --name init
npm run db:seed
```

در دو ترمینال جداگانه اجرا کنید:

```powershell
npm run dev:api
npm run dev:web
```

وب‌سایت روی `http://localhost:3000` و API روی `http://localhost:4000/api` در دسترس است. API فعلی فهرست زمین‌ها (`GET /api/courts`) و بازیکنان (`GET /api/players`) را ارائه می‌کند. صفحه با داده‌ی نمونه بالا می‌آید و در صورت اتصال API، زمین‌ها را از دیتابیس می‌خواند.

## مدل داده

Prisma مدل‌های کاربر و سطح بازی، مربی و مدارک، باشگاه و زمین، رزرو و سانس، دعوت بازی و نتیجه، و مسابقات را تعریف می‌کند. دیتابیس محلی با Docker Compose بالا می‌آید و داده‌های نمونه‌ی باشگاه‌ها با seed درج می‌شوند.

## محدوده‌ی نسخه‌ی فعلی

این نسخه اسکلت اجرایی و صفحه‌ی اصلی همراه با API خواندنی و مدل داده‌ی اولیه است. ورود با OTP، پرداخت، گردش‌کار تایید مربی/باشگاه، ثبت رزرو و پنل مدیریت هنوز پیاده‌سازی نشده‌اند؛ پیش از عرضه‌ی عمومی باید احراز هویت، کنترل دسترسی و تراکنش‌های رزرو به API اضافه شوند.
"# paddel-tennis" 
