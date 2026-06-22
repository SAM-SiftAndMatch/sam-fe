# Thư mục Providers (`src/providers/`)

Thư mục này chứa các React Context Providers hoặc Wrapper bằng TypeScript cung cấp ngữ cảnh dữ liệu và trạng thái cho toàn bộ ứng dụng.

## Nội dung chính
- Gom các provider để bọc xung quanh ứng dụng ở file entrypoint `main.tsx` hoặc `App.tsx`.

## Ví dụ cấu trúc
```text
src/providers/
├── AppProvider.tsx    # Wrapper tổng hợp tất cả các provider (Theme, Auth, QueryClient)
├── ThemeProvider.tsx  # Quản lý chế độ sáng/tối (Light/Dark mode)
└── AuthProvider.tsx   # Quản lý phiên đăng nhập và quyền truy cập của user
```
