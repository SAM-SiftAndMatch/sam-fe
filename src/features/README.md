# Thư mục Features (`src/features/`)

Thư mục này áp dụng kiến trúc **Feature-driven Development** (Phát triển hướng tính năng) bằng TypeScript, đóng gói mọi thành phần của một tính năng cụ thể vào chung một thư mục.

## Mục tiêu
Tránh tình trạng phình to các thư mục chung như `components`, `hooks` khi dự án phát triển lớn. Mỗi tính năng là một module độc lập.

## Ví dụ cấu trúc của một Feature (`src/features/auth/`)
```text
src/features/auth/
├── components/       # Các component chỉ dùng riêng cho Auth (ví dụ: LoginForm.tsx, RegisterForm.tsx)
├── hooks/            # Custom hooks chỉ liên quan đến Auth (ví dụ: useAuthSession.ts)
├── services/         # Gọi API liên quan đến Auth (ví dụ: authService.ts)
└── index.ts          # Export các API/components công khai cho phần còn lại của ứng dụng
```
