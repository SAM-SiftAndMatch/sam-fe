# Thư mục Routes (`src/routes/`)

Thư mục này quản lý toàn bộ hệ thống định tuyến (Routing) của ứng dụng bằng TypeScript, sử dụng thư viện `react-router-dom`.

## Nội dung chính
- **Cấu hình Router**: Định nghĩa danh sách các Route và layout bọc tương ứng.
- **Hằng số đường dẫn (Paths)**: Lưu trữ các path URL dưới dạng hằng số để dễ quản lý và import.
- **Bảo mật tuyến đường (Route Guards)**: Định nghĩa các Private/Public Route ngăn chặn truy cập trái phép.

## Ví dụ cấu trúc
```text
src/routes/
├── index.tsx          # File xuất chính của router (chứa cấu hình `<Routes>`)
├── paths.ts           # Định nghĩa hằng số (ví dụ: `PATH_HOME = '/'`, `PATH_LOGIN = '/login'`)
└── ProtectedRoute.tsx # Route kiểm tra đăng nhập trước khi cho phép vào
```
