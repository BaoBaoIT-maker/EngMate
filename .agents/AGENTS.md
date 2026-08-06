# EngMate - Project Guidelines cho AI Agent

## 1. Tổng quan dự án
- **Tên dự án:** EngMate
- **Mô tả:** Ứng dụng học tiếng Anh qua Flashcard, trò chơi (Matching, Fill-in-the-blank, Speaking) và hệ thống thi đua học tập. Có tích hợp AI để sinh từ vựng và chấm điểm phát âm.
- **Ngôn ngữ giao tiếp của Agent:** Luôn trả lời và giải thích bằng Tiếng Việt.

## 2. Tech Stack
- **Frontend:** React, Vite, Tailwind CSS (cho giao diện người dùng chính), Ant Design (độc quyền cho giao diện Admin Dashboard), Zustand (State Management), React Router.
- **Backend:** Node.js, Express.js.
- **Database:** MariaDB, ORM: Prisma.

## 3. Quy chuẩn viết Code (Coding Conventions)

### 3.1. Frontend
- Dùng Functional Component và Hooks. Không dùng Class Component.
- **Giao diện User (`/` hoặc `/dashboard`):** Sử dụng **Tailwind CSS**. Ưu tiên thiết kế hiện đại, có animation mượt mà, dùng màu chủ đạo là Vàng Gold (ví dụ: `#F0B429`) và phong cách thiết kế sang trọng, dark/light theme (Glassmorphism).
- **Giao diện Admin (`/admin`):** BẮT BUỘC sử dụng thư viện **Ant Design**. Màu chủ đạo là Tím (`#6C63FF`). Mọi component như Table, Modal, Drawer, Button trong phân hệ Admin đều phải import từ `antd`.
- Gọi API thông qua thư mục `src/services/` (dùng `axios` interceptor tại `api.js`).

### 3.2. Backend
- Cấu trúc thư mục: `routes` -> `controllers` -> `services` (chứa logic chính) -> `repository` (nếu có, để tương tác DB).
- **Phản hồi API:** Luôn trả về dữ liệu qua 2 hàm helper `sendSuccess(res, data, message, statusCode)` và `sendError(res, message, statusCode)` đặt tại `utils/response.js`.
- Bất cứ thao tác nào thay đổi cấu trúc database đều phải dùng `schema.prisma`.

### 3.3. Form & Data Validation (BẮT BUỘC)
- **Tại Frontend:** Tất cả các Form khi người dùng nhập liệu (cả trang User và Admin) BẮT BUỘC phải có validation đầy đủ trước khi submit (bắt lỗi bỏ trống, sai định dạng, độ dài, v.v.). Nếu dùng Ant Design thì dùng thuộc tính `rules` của `Form.Item`.
- **Tại Backend:** Mọi request gửi lên (POST/PATCH/PUT) đều phải đi qua bước kiểm tra hợp lệ (Validator) trước khi xử lý logic trong Controller. Xử lý lỗi validation phải trả về HTTP code 400 kèm thông báo rõ ràng bằng tiếng Việt.

### 3.4. Trải nghiệm người dùng (UX) & Xử lý lỗi
- **Loading State:** Luôn hiển thị trạng thái loading (hiệu ứng xoay vòng, disable nút bấm) trong lúc chờ API phản hồi để tránh người dùng click nhiều lần.
- **Error Handling:** Luôn catch (bắt) lỗi khi gọi API và hiển thị thông báo lỗi rõ ràng ra UI (dùng `message.error` của antd hoặc toast của ứng dụng) cho người dùng biết, không được để lỗi ẩn trong console.
- **Responsive Design:** Giao diện BẮT BUỘC phải responsive, hiển thị đẹp và hoạt động tốt trên mọi thiết bị (Mobile, Tablet, Desktop). Dùng hệ thống lưới và breakpoint của Tailwind CSS hoặc Ant Design hợp lý.

### 3.5. Quy tắc chung cho Agent
- **KHÔNG XÓA CODE CŨ:** Không tự ý xóa các dòng comment, docstring, hoặc logic cũ không liên quan trực tiếp đến task đang làm.
- Trước khi cài đặt thư viện NPM mới (npm install), hãy luôn kiểm tra xem dự án đã có sẵn thư viện tương đương chưa hoặc có thể giải quyết bằng code thuần hay không. Hạn chế thêm dependency rác.
- **Git Commits:** Nếu yêu cầu tạo commit, hãy sử dụng chuẩn Conventional Commits (feat:, fix:, chore:, docs: ...) bằng tiếng Việt.
