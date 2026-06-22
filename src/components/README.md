# Thư mục Components (`src/components/`)

Thư mục này chứa các thành phần giao diện (UI components) dùng chung, độc lập, có khả năng tái sử dụng cao trên nhiều màn hình (pages) hoặc tính năng (features).

## 🎨 Sử dụng Shadcn UI (Khuyến khích)

Dự án tích hợp **Shadcn UI** để xây dựng giao diện nhanh chóng và đồng bộ. 
- **Không tự viết lại**: Trước khi tạo bất kỳ UI component cơ bản nào (như Button, Dialog, Input, Accordion, Table,...), hãy kiểm tra xem component đó đã có trong thư viện chưa.
- **Tải từ Shadcn UI**: Bạn có thể dễ dàng tải component trực tiếp từ Shadcn UI về dự án bằng cách chạy lệnh:
  ```bash
  pnpm dlx shadcn@latest add <component-name>
  ```
  *Ví dụ:* `pnpm dlx shadcn@latest add button` hoặc `pnpm dlx shadcn@latest add dialog`
- **Thư mục lưu trữ**: Các component tải về từ Shadcn UI sẽ được đưa vào thư mục con `src/components/ui/`. Khi sử dụng trong code, chỉ cần import từ đường dẫn đó.

## 🛠️ Nguyên tắc thiết kế

- **Tính tái sử dụng**: Chỉ nên chứa các component dùng ở nhiều nơi khác nhau. Các component chỉ dùng riêng cho một tính năng nên đặt ở `src/features/` hoặc `src/pages/`.
- **Pure / Presentational**: Component ở đây nên tập trung vào phần hiển thị (UI), nhận dữ liệu qua props, hạn chế kết nối trực tiếp đến store toàn cục hoặc gọi API.

## 📁 Ví dụ cấu trúc

```text
src/components/
├── ui/                  # Chứa các component tải về từ Shadcn UI
│   ├── button.tsx
│   ├── dialog.tsx
│   └── input.tsx
├── common/              # Chứa các component dùng chung tự thiết kế (nếu Shadcn không có)
│   ├── CustomHeader.tsx
│   └── MainSidebar.tsx
└── README.md
```
