# Postman Auth Flow

Tài liệu này mô tả flow test nhanh cho Auth module bằng Postman.

## 1. Environment variables nên tạo trong Postman

- `baseUrl` = `http://localhost:8080`
- `accessToken` = rỗng lúc đầu
- `refreshToken` = rỗng lúc đầu
- `testEmail` = email dùng để đăng ký / xác minh
- `testOtp` = mã OTP lấy từ email

## 2. Flow test đề xuất

### Bước 1: Register

**Request**

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/register`
- Body: raw JSON

```json
{
  "email": "test@example.com",
  "password": "Test1234",
  "username": "test-user"
}
```

**Kỳ vọng**

- API trả về `verificationRequired: true`
- Backend đã gửi OTP qua email
- Chưa có `accessToken`/`refreshToken` ở bước này

### Bước 2: Verify OTP

**Request**

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/verify-otp`
- Body: raw JSON

```json
{
  "email": "test@example.com",
  "otp": "123456"
}
```

**Kỳ vọng**

- API trả về `token`, `refreshToken`, `user`
- Tài khoản được kích hoạt trong DB
- Có thể dùng token này cho các bước tiếp theo

**Tests script nên thêm vào Postman**

```javascript
const response = pm.response.json();
pm.environment.set("accessToken", response.data.token);
pm.environment.set("refreshToken", response.data.refreshToken);
```

### Bước 3: Login

**Request**

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/login`
- Body: raw JSON

```json
{
  "email": "test@example.com",
  "password": "Test1234"
}
```

**Tests script nên thêm vào Postman**

```javascript
const response = pm.response.json();
pm.environment.set("accessToken", response.data.token);
pm.environment.set("refreshToken", response.data.refreshToken);
```

### Bước 4: Get Me

**Request**

- Method: `GET`
- URL: `{{baseUrl}}/api/auth/me`
- Headers:
  - `Authorization: Bearer {{accessToken}}`

**Kỳ vọng**

- Trả về thông tin user hiện tại

### Bước 5: Refresh Token

**Request**

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/refresh`
- Body: raw JSON

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Tests script nên thêm vào Postman**

```javascript
const response = pm.response.json();
pm.environment.set("accessToken", response.data.token);
pm.environment.set("refreshToken", response.data.refreshToken);
```

### Bước 6: Logout

**Request**

- Method: `POST`
- URL: `{{baseUrl}}/api/auth/logout`
- Body: raw JSON

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Kỳ vọng**

- Refresh token bị revoke trong Redis
- Gọi refresh lại bằng token cũ phải báo lỗi

## 3. Sequence ngắn gọn

```text
Register -> nhận OTP qua email
Verify OTP -> nhận accessToken + refreshToken
Login -> dùng email/password sau khi đã verify
Get Me -> dùng accessToken
Refresh -> dùng refreshToken, nhận cặp token mới
Logout -> xóa refreshToken khỏi Redis
```

## 4. Lưu ý khi test

- Access token hiện tại có thời hạn ngắn hơn để khớp flow refresh
- Refresh token chỉ nên test một lần cho mỗi lần refresh vì refresh cũ sẽ bị revoke
- Register local auth phải verify email trước khi login
- Nếu Redis không có kết nối, login vẫn chạy nhưng refresh/logout revoke sẽ không hoạt động đúng nghĩa
