# Thư mục Hooks (`src/hooks/`)

Thư mục này chứa các **Custom Hooks** (hook tự định nghĩa) bằng TypeScript dùng chung cho toàn bộ dự án React.

## Nội dung chính
- Gom các logic trạng thái có khả năng tái sử dụng (ví dụ: tracking trạng thái window size, quản lý localStorage, debounce input, kiểm soát click outside, v.v.).

## Ví dụ cấu trúc
```text
src/hooks/
├── useLocalStorage.ts    # Đồng bộ hóa state với localStorage
├── useDebounce.ts        # Trì hoãn xử lý input (hữu ích cho ô tìm kiếm)
├── useClickOutside.ts    # Phát hiện click chuột bên ngoài một element
└── useWindowSize.ts      # Lắng nghe thay đổi kích thước màn hình
```
