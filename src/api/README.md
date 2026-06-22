# Thư mục API (`src/api/`)

Thư mục này chứa toàn bộ các thiết lập và định nghĩa liên quan đến việc gọi API từ phía Server (giao tiếp mạng) bằng TypeScript.

## Nội dung chính
- **Cấu hình API Client**: Khởi tạo Axios hoặc fetch client dùng chung (ví dụ: `client.ts` chứa base URL, headers, interceptor xử lý token).
- **Các hàm gọi API (Services)**: Định nghĩa các hàm để gửi request lên server (ví dụ: `auth.ts`, `vocab.ts`).
- **React Query Hooks (khuyên dùng)**: Định nghĩa các Custom Hooks kết hợp với TanStack Query để lấy/thay đổi dữ liệu (caching, mutation).

## Ví dụ cấu trúc
```text
src/api/
├── client.ts       # Cấu hình Axios instance
├── auth.ts         # Các hàm gọi API liên quan đến Authentication
└── vocab.ts        # Gọi API liên quan đến từ vựng (React Query hooks)
```
