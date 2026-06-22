# SAM Frontend

Dự án Frontend cho hệ thống **SAM**, được xây dựng dựa trên **React 18.3**, **Vite 6** và **TypeScript**. Dự án áp dụng bộ công cụ hiện đại và hiệu năng cao như **Biome** (thay thế cho ESLint/Prettier) và **Commitlint** để kiểm soát chất lượng mã nguồn cũng như lịch sử commit.

---

## 🛠️ Công nghệ & Thư viện Core (Tech Stack)

Để đảm bảo tính nhất quán và tránh việc cài đặt trùng lặp các thư viện, dự án thống nhất sử dụng các công nghệ cốt lõi sau:

### 1. Nền tảng (Core Stack)
- **React 18.3**: Phiên bản ổn định cao, tương thích tốt nhất với hệ sinh thái thư viện hiện tại.
- **Vite 6**: Công cụ build siêu nhanh, hỗ trợ Hot Module Replacement (HMR) tối ưu.
- **TypeScript**: Đảm bảo chặt chẽ kiểu dữ liệu cho toàn bộ dự án.

### 2. Định dạng & Giao diện (Styling & UI)
- **Tailwind CSS v4**: Xử lý compile-time siêu nhanh, tối ưu hóa CSS cho ứng dụng.
- **Shadcn UI**: Thư viện component mẫu, tải trực tiếp các thành phần giao diện dùng chung thông qua CLI.
- **Lucide React**: Bộ icon SVG nhẹ, đồng bộ và đẹp mắt.
- **tw-animate-css**: Thư viện hỗ trợ chuyển động (animations) mượt mà cho Tailwind.

### 3. Điều hướng & Quản lý State
- **React Router v7**: Quản lý định tuyến (routing) cho Single Page Application (SPA).
- **Zustand v5**: Quản lý state toàn cục gọn nhẹ, thay thế Redux/Context cho các state phức tạp cần chia sẻ chéo.

### 4. Truy vấn dữ liệu & Form
- **TanStack React Query v5**: Quản lý gọi API, tự động lưu bộ nhớ đệm (caching) và đồng bộ trạng thái server.
- **React Hook Form**: Quản lý form hiệu năng cao, hạn chế re-render.
- **Zod**: Khai báo và xác thực (validate) schema dữ liệu đầu vào của biểu mẫu.

### 5. Kiểm soát chất lượng (Quality Assurance)
- **Biome**: Công cụ "tất cả trong một" chạy siêu nhanh bằng Rust, thay thế hoàn toàn cho cả ESLint và Prettier để đảm bảo linting & formatting.
- **Husky & lint-staged**: Tự động chạy kiểm tra chất lượng code trước khi commit.
- **Commitlint**: Bắt buộc viết tin nhắn commit đúng chuẩn.

---

## 🧑‍💻 Quy tắc làm việc nhóm (Team Workflow Guidelines)

### 1. Quy chuẩn thông điệp Commit (Conventional Commits)
Dự án áp dụng bộ luật **Conventional Commits** để tự động kiểm tra cú pháp khi commit. Mọi commit bắt buộc phải viết theo cấu trúc sau:

```text
<loại tác vụ>(<phạm vi - tùy chọn>): <mô tả ngắn bằng chữ thường>
```

**Ví dụ viết ĐÚNG:**
- `feat(auth): add google sign-in method`
- `fix(ui): correct padding for primary button`
- `docs(readme): update git commit guidelines`
- `chore: update dependencies in package.json`

**Các loại tác vụ (`type`) hợp lệ:**
- `feat`: Thêm tính năng mới.
- `fix`: Sửa một lỗi (bug).
- `docs`: Thay đổi hoặc bổ sung tài liệu.
- `style`: Thay đổi định dạng code (khoảng trắng, dấu phẩy...) không ảnh hưởng logic.
- `refactor`: Tối ưu hóa code (không sửa lỗi, không thêm tính năng).
- `chore`: Việc lặt vặt như cấu hình, cập nhật package...

*Lưu ý:* Nếu bạn viết sai định dạng (ví dụ: `git commit -m "xong code"`), Husky và Commitlint sẽ tự động chặn và từ chối commit đó.

### 2. Tự động kiểm tra chất lượng code (Git Hooks)
Mỗi khi bạn chạy lệnh `git commit`, dự án sẽ tự động chạy:
- **Biome check**: Tự động kiểm tra lỗi cú pháp, định dạng lại code và sắp xếp lại các câu lệnh import đối với các file có thay đổi.
- **Commitlint**: Kiểm tra cú pháp tin nhắn commit.

> [!IMPORTANT]
> **Kích hoạt Husky**: Sau khi bạn chạy lệnh `git init` lần đầu tiên, hãy chạy lệnh sau để kích hoạt hoàn toàn hệ thống Git Hooks:
> ```bash
> pnpm exec husky
> ```

### 3. Đồng bộ hóa thư viện & môi trường
- Sử dụng **pnpm** thay vì npm hay yarn: Khi tải code mới từ Git về, hãy chạy lệnh dưới đây để đồng bộ phiên bản thư viện chính xác từ file `pnpm-lock.yaml`:
  ```bash
  pnpm install --frozen-lockfile
  ```
- Khuyến nghị Node.js phiên bản **`>= 20.0.0`** và pnpm **`>= 9.0.0`**.

---

## 🚀 Các lệnh chạy dự án (Commands)

| Lệnh | Chức năng |
| :--- | :--- |
| `pnpm dev` | Khởi chạy môi trường phát triển (Development server tại `localhost:5173`) |
| `pnpm build` | Biên dịch tối ưu hóa dự án cho production vào thư mục `dist/` |
| `pnpm check` | Chạy Biome để kiểm tra lỗi, định dạng code và tối ưu hóa imports trên toàn dự án |
| `pnpm format` | Chỉ chạy riêng định dạng lại code bằng Biome |
| `pnpm lint` | Chỉ chạy riêng quét lỗi cú pháp bằng Biome |
| `pnpm preview` | Chạy thử bản build production tại máy cục bộ |
