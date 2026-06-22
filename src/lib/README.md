# Thư mục Lib (`src/lib/`)

Thư mục này chứa các thiết lập cấu hình, khởi tạo, hoặc wrap lại các thư viện của bên thứ ba bằng TypeScript trước khi sử dụng trong ứng dụng.

## Nội dung chính
- Việc cấu hình trực tiếp ở đây giúp dễ bảo trì khi thư viện nâng cấp hoặc thay đổi API.

## Ví dụ cấu trúc
```text
src/lib/
├── queryClient.ts    # Khởi tạo QueryClient của TanStack Query
├── axios.ts          # Cấu hình Axios instance cơ bản
└── firebase.ts       # Khởi tạo Firebase SDK
```
```typescript
// Ví dụ queryClient.ts
import { QueryClient } from '@tanstack/react-query'
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
```
