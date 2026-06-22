# Thư mục Stores (`src/stores/`)

Thư mục này quản lý trạng thái toàn cục (global state) của ứng dụng bằng các công cụ quản lý state viết bằng TypeScript (khuyên dùng **Zustand**).

## Quy tắc sử dụng
- Chia nhỏ các store theo nghiệp vụ rõ ràng thay vì gộp tất cả state vào một store lớn.
- Sử dụng tiền tố `use` khi định nghĩa các store hook (ví dụ: `useAuthStore`).

## Ví dụ cấu trúc
```text
src/stores/
├── useAuthStore.ts    # Store lưu thông tin người dùng và token đăng nhập
├── useThemeStore.ts   # Store lưu chế độ sáng/tối
└── useCartStore.ts    # Store quản lý giỏ hàng (nếu có)
```
