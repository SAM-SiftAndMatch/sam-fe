# Thư mục Utils (`src/utils/`)

Thư mục này chứa các hàm tiện ích (utility helper functions) không chứa trạng thái (stateless), thực hiện các tác vụ tính toán hoặc định dạng dữ liệu cơ bản bằng TypeScript.

## Nội dung chính
- Gom các hàm thuần túy (pure functions), dễ viết unit test, nhận đầu vào và trả ra kết quả trực tiếp mà không ảnh hưởng tới state khác.

## Ví dụ cấu trúc
```text
src/utils/
├── formatDate.ts      # Định dạng hiển thị ngày tháng năm
├── formatCurrency.ts  # Định dạng tiền tệ
├── validateEmail.ts   # Kiểm tra tính hợp lệ của địa chỉ Email
└── storage.ts         # Các hàm helper nhanh để get/set localStorage
```
