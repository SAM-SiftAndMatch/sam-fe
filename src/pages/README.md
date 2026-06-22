# Thư mục Pages (`src/pages/`)

Thư mục này chứa các thành phần đại diện cho toàn bộ một trang màn hình hoàn chỉnh bằng TypeScript, tương ứng trực tiếp với cấu hình định tuyến (routes) của React Router.

## Nguyên tắc thiết kế
- **Không tái sử dụng**: Mỗi trang là một màn hình cụ thể (Home, Login, Dashboard, v.v.).
- **Tập hợp logic**: Pages là nơi kết nối các component dùng chung (`src/components/`) hoặc tính năng (`src/features/`), gọi hooks, lấy dữ liệu và truyền xuống các component con.

## Ví dụ cấu trúc
```text
src/pages/
├── Home.tsx           # Trang chủ
├── About.tsx          # Trang giới thiệu
├── Login.tsx          # Trang đăng nhập
└── NotFound.tsx       # Trang báo lỗi 404
```
