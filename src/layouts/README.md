# Thư mục Layouts (`src/layouts/`)

Thư mục này chứa các cấu trúc bố cục (layouts) của trang web sử dụng TypeScript, cung cấp bộ khung định dạng chung cho nhiều màn hình khác nhau.

## Nội dung chính
- Định nghĩa Header, Sidebar, Footer và khu vực hiển thị nội dung động (`<Outlet />` hoặc `children`).

## Ví dụ cấu trúc
```text
src/layouts/
├── MainLayout.tsx     # Bố cục chính của ứng dụng (bao gồm Navbar + Sidebar + Footer)
├── AuthLayout.tsx     # Bố cục cho trang đăng nhập/đăng ký (chỉ chứa form và hình nền minh họa)
└── DashboardLayout.tsx# Bố cục chuyên dụng cho màn hình quản trị
```
