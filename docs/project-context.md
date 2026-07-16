# EngMate - Project Context

## 1. Mục tiêu dự án

EngMate là nền tảng học tiếng Anh thích ứng (Adaptive Learning). Dự án hiện đang được xây dựng theo hướng backend-first, ưu tiên hoàn thiện nền tảng auth, user, học tập, AI, và thanh toán trước khi làm frontend.

## 2. Tech Stack

### Backend

- Node.js
- Express.js
- Prisma ORM
- MySQL
- ESM syntax (`import/export`)

### Frontend

- React.js với Vite
- Hiện tại chưa triển khai chi tiết, sẽ làm sau

### Tích hợp ngoài

- Google Gemini API
- Sepay Webhook / VietQR
- Google OAuth
- Facebook OAuth
- Redis (Upstash URL)
- Cloudinary
- Gmail SMTP

## 3. Trạng thái hiện tại của backend

Backend đã có:

- `src/server.js`: entry point chạy server
- `src/app.js`: khởi tạo Express app
- `src/routes/`: router tổng và router auth/user
- `src/controllers/`: controller cho auth và user
- `src/services/`: service cho auth và user
- `src/repository/`: repository truy vấn Prisma
- `src/middlewares/`: auth, role, error handler
- `src/utils/`: helper password, jwt, response
- `src/config/`: Prisma client và Redis client

Backend đang dùng:

- Common routing dưới `/api`
- JWT access token + refresh token
- bcryptjs cho hash mật khẩu
- Prisma Client cho mọi thao tác DB
- Redis cache cho profile/me, OTP activation, và revoke refresh token

## 4. Cấu trúc thư mục hiện tại

```text
backend/
  prisma/
    schema.prisma
    migrations/
  src/
    app.js
    server.js
    config/
      prisma.js
      redis.js
    controllers/
      auth.controller.js
      user.controller.js
    middlewares/
      auth.middleware.js
      error.middleware.js
      role.middleware.js
    repository/
      auth.repository.js
    routes/
      index.js
      auth.routes.js
      user.routes.js
    services/
      auth.service.js
      user.service.js
    utils/
      jwt.js
      password.js
      response.js
```

## 5. Prisma Schema / Data Model

Schema hiện được thiết kế theo DDD và chuẩn hóa 3NF.

### Nhóm Identity

- `User`: tài khoản xác thực
- `UserProfile`: hồ sơ hiển thị
- `UserSetting`: cài đặt người dùng
- `UserSkill`: điểm kỹ năng
- `UserSubscription`: gói cước

### Nhóm Learning / Content

- `SystemVocabulary`: kho từ vựng chung của hệ thống
- `Flashcard`: thẻ học của user
- `StudyProgress`: trạng thái SM-2
- `ReviewLog`: log kết quả ôn tập / mini-game

### Nhóm AI Coaching

- `ChatSession`: phiên chat speaking
- `ChatMessage`: tin nhắn user và AI

### Nhóm Payment

- `Transaction`: đối soát Sepay / VietQR

### Enums chính

- `Role`: `ADMIN`, `USER`
- `AuthProvider`: `LOCAL`, `GOOGLE`, `FACEBOOK`
- `ThemeMode`: `LIGHT`, `DARK`
- `EnglishLevel`: `A1` đến `C2`
- `CategoryType`: `GENERAL`, `TOEIC`, `IELTS`
- `GameType`: `MATCHING`, `FILL_BLANK`, `SPEAKING_GAME`
- `SenderRole`: `USER`, `MODEL`
- `PlanType`: `FREE`, `PREMIUM`
- `TransactionStatus`: `PENDING`, `SUCCESS`, `FAILED`

## 6. Auth module hiện có

### Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/facebook`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `GET /api/auth/me`

### User routes

- `GET /api/users/me`
- `PATCH /api/users/me/profile`
- `PATCH /api/users/me/settings`

### Luồng đăng nhập

- Local auth: email/password + OTP email verification
- Google auth: nhận `idToken`, verify bằng Google tokeninfo
- Facebook auth: nhận `accessToken`, verify bằng Facebook graph API
- Sau khi login/verify thành công, backend trả về access token + refresh token + user payload
- Register local auth chỉ gửi OTP qua email, chưa cấp token ngay
- Verify OTP mới kích hoạt tài khoản và tạo các bảng profile/setting/skill
- Refresh token được lưu revoke-state trong Redis bằng `jti`
- Logout chỉ việc xóa `jti` refresh token khỏi Redis

### Dữ liệu khởi tạo sau register/social login

- local register: tạo `User` trước, sau khi verify mới tạo `UserProfile` / `UserSetting` / `UserSkill`
- social login: tạo / cập nhật `UserProfile`
- social login: tạo / cập nhật `UserSetting`
- social login: tạo / cập nhật `UserSkill`

## 7. Redis đang được dùng để làm gì

Redis hiện không phải core business data store, mà là lớp cache/hỗ trợ.

Hiện tại Redis được dùng cho:

- cache kết quả `me` của user trong vài phút
- xóa cache khi update profile/settings
- lưu trạng thái refresh token để hỗ trợ refresh/logout an toàn

Có thể dùng Redis sau này cho:

- refresh token / token blacklist
- rate limit đăng nhập
- cache daily review list
- queue background job cho Gemini report
- tạm giữ trạng thái phiên chat realtime

## 8. Environment variables

File môi trường nằm ở `backend/.env`.

Các biến đang có:

- `PORT`
- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_REDIRECT_URI`
- `FACEBOOK_VERIFY_TOKEN`
- `BACKEND_BASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `PAYMENT_GATEWAY`
- `VIETQR_ACCOUNT_NO`
- `VIETQR_ACCOUNT_NAME`
- `VIETQR_ACQ_ID`
- `VIETQR_TEMPLATE`
- `SEPAY_API_KEY`
- `PAYMENT_QR_EXPIRY_MINUTES`
- `ENCRYPTION_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `AI_PROVIDER`
- `UPLOAD_STORAGE`
- `REDIS_URL`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `NODE_ENV`
- `FRONTEND_URL`

Lưu ý:

- secret thật không nên commit lên git
- nếu đổi môi trường production thì xoay lại key quan trọng

## 9. Cấu trúc code hiện tại và vai trò từng lớp

### `controllers`

- nhận request
- validate đầu vào cơ bản
- gọi service
- trả response

### `services`

- chứa business logic
- xử lý auth, profile, settings
- gọi repository và cache layer

### `repository`

- chỉ làm việc trực tiếp với Prisma
- là lớp truy cập DB

### `middlewares`

- auth middleware: verify JWT
- role middleware: bảo vệ route theo quyền
- error middleware: chuẩn hóa lỗi

### `utils`

- helper dùng chung như JWT, password, response format

### `config`

- Prisma client singleton
- Redis client / cache helper

## 10. Quy ước hiện tại

- Backend dùng ESM (`import/export`)
- Prisma dùng `backend/prisma.config.ts` để load datasource
- `schema.prisma` không đặt `url` trong datasource nữa vì đang theo Prisma 7
- Dùng `Prisma Client` cho mọi thao tác DB
- Route nên theo cấu trúc `routes -> controller -> service -> repository`
- Response thống nhất qua helper `sendSuccess` / `sendError`
- Cache Redis chỉ dùng cho dữ liệu hợp lý để giảm query lặp

## 11. Các module sẽ làm tiếp

Ưu tiên hiện tại theo thứ tự:

1. Flashcard + SM-2 (Module Auth/User đã cơ bản hoàn thiện)
2. Mini-games và ReviewLog
3. Gemini speaking chat + SSE
4. Sepay webhook + Transaction
5. Admin dashboard
6. Frontend React/Vite

## 12. Những điểm đã quyết định trong cuộc trao đổi trước

- Backend code style: ESM
- DB schema: đã tạo xong, không cần làm lại
- Auth module: đã có local login, Google login, Facebook login, quên/đặt lại/đổi mật khẩu.
  - Quên mật khẩu dùng mã OTP gửi qua email.
  - Đặt lại mật khẩu thành công yêu cầu người dùng đăng nhập lại.
  - Tài khoản Social Login không hỗ trợ đổi mật khẩu hay quên mật khẩu (báo lỗi HTTP 400).
- Profile/settings: đã có route và Redis cache
- Frontend: để sau

## 13. Ghi chú để đọc lại sau này

Nếu mất đoạn chat, chỉ cần đọc file này và nhớ:

- dự án là EngMate
- backend đã có auth + user + Redis cache
- schema Prisma đã phân tách rõ theo domain
- mọi phần mới nên bám vào cấu trúc hiện có thay vì dựng lại từ đầu
