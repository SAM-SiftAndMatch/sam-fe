// ID gói dịch vụ seed sẵn từ BE (V4/V12) — định danh ổn định, không phải secret.
// Dùng để gọi purchase mà không cần thêm API list-packages.
export const PACKAGE_FEATURED_ID = 'f0000000-0000-0000-0000-000000000001';
export const PACKAGE_URGENT_ID = 'f0000000-0000-0000-0000-000000000002';
export const PACKAGE_AI_QA_SINGLE_ID = 'f0000000-0000-0000-0000-000000000003';
export const PACKAGE_BUSINESS_ID = 'f0000000-0000-0000-0000-000000000005';
export const PACKAGE_PRO_DEV_ID = 'f0000000-0000-0000-0000-000000000006';
export const PACKAGE_AI_QA_ADVANCED_ID = 'f0000000-0000-0000-0000-000000000007';

export interface PackageMeta {
  name: string;
  price: string;
  kind: 'monthly' | 'single';
  blurb: string;
}

// Mô tả hiển thị theo đúng business SYSTEM_SPEC (giữ đồng bộ với BE khi đổi gói).
export const PACKAGE_META: Record<string, PackageMeta> = {
  [PACKAGE_FEATURED_ID]: {
    name: 'Ghim Nổi bật',
    price: '59.000đ/lượt',
    kind: 'single',
    blurb: 'Ghim 1 dự án lên đầu tìm kiếm trong suốt vòng đời dự án.',
  },
  [PACKAGE_URGENT_ID]: {
    name: 'Tuyển gấp (AI Headhunter)',
    price: '99.000đ/lượt',
    kind: 'single',
    blurb: 'AI quét và đẩy thông báo tới đúng 5 Dev khớp nhất cho 1 dự án.',
  },
  [PACKAGE_AI_QA_SINGLE_ID]: {
    name: 'Trọng tài Code AI QA',
    price: '59.000đ/lượt',
    kind: 'single',
    blurb: 'AI quét lỗi, bảo mật cho code bàn giao của 1 dự án.',
  },
  [PACKAGE_BUSINESS_ID]: {
    name: 'Gói BUSINESS',
    price: '249.000đ/tháng',
    kind: 'monthly',
    blurb: 'Dùng Nổi bật + Tuyển gấp không giới hạn cho mọi dự án trong tháng.',
  },
  [PACKAGE_PRO_DEV_ID]: {
    name: 'Gói PRO DEV',
    price: '149.000đ/tháng',
    kind: 'monthly',
    blurb: 'Nhận việc 1 chạm trước 5 phút + lá chắn Scope Shield chống phát sinh.',
  },
  [PACKAGE_AI_QA_ADVANCED_ID]: {
    name: 'AI QA Nâng cao',
    price: '299.000đ/tháng',
    kind: 'monthly',
    blurb: 'Bảo hành AI QA cho mọi dự án trong tháng (bản tháng của gói lẻ 59k).',
  },
};
