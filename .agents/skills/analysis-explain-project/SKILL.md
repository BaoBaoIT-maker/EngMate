---
description: "Phân tích và giải thích cấu trúc dự án, stack công nghệ, luồng chức năng và các file chính của EngMate"
---

# Analysis Explain Project

Use this skill khi người dùng yêu cầu:

- phân tích tổng quan dự án
- giải thích cấu trúc thư mục
- mô tả kiến trúc hoặc luồng chức năng
- xác định file/module chính cần xem
- giải thích cách frontend/backend tương tác
- phân tích source code backend từng module, feature, route, controller, service, repository, middleware, validator
- phân tích source code frontend từng page, component, hook, api service, state flow, routing, UI interaction
- giải thích end-to-end flow từ frontend đến backend, request và response
- tóm tắt dự án bằng tiếng Việt

## Mục tiêu

- Đọc các file quan trọng để hiểu bối cảnh thực tế của repo
- Trả lời dựa trên mã nguồn hiện có, không suy đoán quá mức
- Tập trung vào những phần có giá trị cho người phát triển: stack, cấu trúc, flow chính, feature, module, file-to-file tracing, chức năng hàm, điểm mạnh và rủi ro
- Luôn dùng tiếng Việt
- Với backend, phải trả lời như một kỹ sư đọc code: từng luồng đi từ đâu đến đâu, file nào thực hiện điều gì, và chức năng của từng hàm có tác dụng gì
- Với frontend, phải trả lời như một kỹ sư UI/flow: component nào render gì, page nào gọi service nào, state nào lưu dữ liệu, request đi tới đâu và response được xử lý thế nào
- Với full-stack, phải giải thích luồng thực tế từ giao diện người dùng đến API backend, rồi để dữ liệu đi qua các layer nào

## Quy trình phân tích theo kiểu source-code review

1. Xác định loại câu hỏi:
   - overview project
   - architecture
   - module/feature breakdown
   - backend flow tracing
   - file/function explanation
   - code walk-through
2. Xác định phạm vi cần đọc theo thứ tự ưu tiên:
   - README và package.json
   - backend/src/app.js hoặc server.js
   - backend/src/routes/\*.js
   - backend/src/controllers/\*.js
   - backend/src/services/\*.js
   - backend/src/repository/\*.js
   - backend/src/middlewares/\*.js
   - backend/src/validators/\*.js
   - backend/prisma/schema.prisma
   - frontend/src/router.jsx / App.jsx / services / hooks / pages nếu cần phân tích tương tác frontend-backend
3. Với mỗi feature, phân tích theo cấu trúc sau:
   - Feature / module: tên chức năng
   - Entry point: route nào bắt đầu
   - Request path: route -> controller -> service -> repository/db
   - File-to-file flow: từ file này sang file kia như thế nào
   - Hàm quan trọng: tên hàm, nhiệm vụ, và data đi qua đâu
   - Mô tả logic nghiệp vụ: chức năng này làm gì, dữ liệu xử lý như thế nào
   - Công nghệ / thư viện được dùng trong file đó: Prisma, JWT, Redis, Cloudinary, Socket, queue, mailer, validation, middleware
   - Mức độ quan trọng: core / important / supporting
4. Khi mô tả file, không chỉ nói tên file mà còn nêu rõ nó “giữ vai trò gì” trong hệ thống.
5. Nếu thiếu dữ liệu, nói rõ đang kiểm tra tiếp file nào để xác nhận, thay vì suy đoán.
6. Kết luận phải có 3 tầng:
   - tổng quan dự án
   - luồng chức năng chính
   - cấu trúc module / file quan trọng và vai trò của nó

## Required output style khi phân tích backend và frontend

Khi người dùng yêu cầu “giải thích source code backend”, “giải thích frontend”, hoặc “giải thích end-to-end flow”, phản hồi phải theo format sau:

### 1. Tổng quan hệ thống

- Ứng dụng làm gì
- Backend stack gì, frontend stack gì
- Chia module theo chức năng
- Mỗi module thuộc frontend/backend/full-stack hay không

### 2. Luồng chức năng chính

- Mỗi feature bắt đầu từ đâu: UI event / page / route / API endpoint
- Từ request → controller/service/repository hoặc từ page → hook/service → API endpoint → response → render
- Ghi rõ file đầu vào và file kết thúc

### 3. Phân tích từng feature / module

- Tên feature
- Frontend entry point hoặc backend route
- File liên quan
- Hàm chính trong mỗi file
- File nào “gọi” file nào
- Logic nghiệp vụ / UI interaction chủ chốt
- Mức độ quan trọng của module

### 4. Phân tích file quan trọng

Với mỗi file đáng chú ý:

- chức năng của file
- class/function chính trong file
- data / dependency / thư viện mà file dùng
- tại sao file này quan trọng
- nó thuộc layer nào: route/controller/service/repository/middleware/validator/config, hoặc page/component/hook/store/service

### 5. Full-stack tracing

Khi phân tích feature end-to-end, phải có phần:

- Frontend trigger: user click / submit / route change / effect
- Frontend service call: axios / fetch / custom api
- Backend route: URL, method, middleware, validator
- Backend controller: validate/input, orchestrate
- Backend service: business logic
- Repository / DB: Prisma query hoặc external service call
- Response handling: success / error / loading / state update
- UI render: page state updated, component re-render

### 6. Công nghệ nổi bật trong từng file

- Prisma / schema / migrations
- JWT auth
- Redis / queue
- Cloudinary / upload
- Socket.IO / real-time
- Email / OTP / mailer
- Validation / middleware
- AI / RAG / chat / vocabulary generation
- Axios / API layer
- React Router / Zustand / hooks / form state / UI libs

### 7. Đánh giá thực tế

- module nào là cốt lõi
- module nào dễ mở rộng
- module nào đang phức tạp hoặc rủi ro
- điểm mạnh / điểm cần cải thiện
- frontend-to-backend coupling nào rõ nhất

## Mẫu câu hỏi phù hợp

- "Dự án này làm gì?"
- "Giải thích cấu trúc frontend/backend cho mình"
- "Nói rõ luồng đăng nhập và học từ vựng"
- "File nào là entry point của frontend/backend?"
- "Phân tích architecture hiện tại của EngMate"
- "Giải thích source code backend cho từng feature như auth, vocabulary, flashcard, payment, chat"
- "Mỗi feature bắt đầu từ route nào, đi qua controller/service/repository nào, và hàm nào làm gì?"
- "Hãy phân tích file theo file, từ route tới service tới DB, và cho biết module nào quan trọng nhất"
- "Mỗi file backend có công nghệ nào đặc biệt, và file đó có vai trò gì?"
- "Giải thích frontend page Login, form submit, gọi API nào, backend trả về gì, UI cập nhật như thế nào"
- "Luồng feature từ frontend đến backend request/response như nào?"
- "Hỏi từng feature của frontend hay backend đều được, và phải nói rõ file nào xử lý gì"

## Quy tắc trả lời bắt buộc

- Không được trả lời chung chung như “app này có backend và frontend”. Phải đi vào luồng thực tế.
- Phải mô tả ít nhất một feature/phân hệ cụ thể theo hướng request → route → controller → service → repository → DB hoặc external service, hoặc frontend page/component → service/api → backend request/response → UI state update.
- Phải nêu file-to-file flow rõ ràng: “route auth gọi controller auth, controller gọi auth service, auth service gọi repository/auth.repository, repository tương tác Prisma”. Hoặc “Login page gọi api login, service gửi POST /auth/login, backend validate và trả response, UI set user state và redirect”.
- Khi mô tả file, phải nói rõ nó thuộc layer nào và vai trò gì.
- Phải gọi tên hàm hoặc module nổi bật nếu có trong file, chẳng hạn: createUser, login, getProfile, generateFlashcard, sendOTP, processPayment, syncProgress, fetchUser, submitForm, updateProfile, getFlashcards.
- Khi thấy có công nghệ đặc trưng như Redis, Prisma, JWT, Cloudinary, Socket.IO, queue, AI, RAG, axios, Zustand, react-router, phải nhấn mạnh công nghệ đó trong context file tương ứng.
- Với mỗi feature, phải cho thấy cái gì là trigger, cái gì là request, cái gì là response, và phần UI/logic nào consume response.
- Chỉ kết luận khi có căn cứ trong code; nếu chưa chắc, phải nói “đang kiểm tra thêm” và nêu file sẽ đọc tiếp.

## Lưu ý

- Không nói rằng mình đã nhìn thấy mọi thứ nếu chưa kiểm tra code.
- Không được giả định framework hoặc tính năng không có căn cứ trong repo.
- Ưu tiên trả lời bằng những điểm có thể tìm thấy trực tiếp trong project.
- Khi phân tích, ưu tiên “đọc code như một kỹ sư” hơn là “đọc như một người lướt qua project”.
