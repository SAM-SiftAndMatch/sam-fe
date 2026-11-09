export const POLICY_VERSION = '2026-11-09';
export const MINIMUM_PROJECT_BUDGET = 3_000_000;

export const policySections = [
  {
    title: 'Thông tin và trách nhiệm tài khoản',
    text: 'Cung cấp họ tên, số điện thoại và email liên hệ chính xác; bảo vệ tài khoản và chỉ sử dụng thông tin của người khác để phối hợp thực hiện dự án.',
  },
  {
    title: 'Đăng và tham gia dự án',
    text: 'Ngân sách dự án mới tối thiểu là 3.000.000đ. Client hoàn thiện yêu cầu và hồ sơ trước khi đăng dự án. Freelancer hoàn thiện hồ sơ trước khi ứng tuyển hoặc chấp nhận lời mời; tự kiểm tra phạm vi, giá và thời hạn trước khi ký hợp đồng.',
  },
  {
    title: 'Hợp đồng và thực hiện công việc',
    text: 'Client cung cấp yêu cầu, nạp tiền và nghiệm thu theo hợp đồng. Freelancer thực hiện đúng phạm vi, thời hạn, bảo mật dữ liệu và chỉ bàn giao nội dung có quyền sử dụng. Mọi thay đổi phạm vi, giá và thời hạn cần được hai bên xác nhận trước khi thực hiện.',
  },
  {
    title: 'Nạp tiền, cọc và bảo trì',
    text: 'Client nạp 100% giá trị hợp đồng; freelancer đóng cọc cam kết 2%. Thời hạn bảo trì là 168 giờ (7 ngày) kể từ nghiệm thu. Công nợ được giải phóng sau khi hết thời hạn bảo trì và không còn yêu cầu bảo trì hoặc tranh chấp chặn chi. Không tự động phạt hoặc tịch thu cọc chỉ vì yêu cầu bảo trì chưa được đóng.',
  },
  {
    title: 'Thanh toán, bàn giao và hỗ trợ',
    text: 'Hai bên thực hiện thanh toán, bàn giao, nghiệm thu, bảo trì và xử lý tranh chấp qua các quy trình tương ứng trên SAM. Kiểm tra số tiền và các điều kiện hiển thị trước khi xác nhận từng giao dịch.',
  },
];
export const privacySections = [
  {
    title: 'Thông tin được thu thập',
    text: 'SAM lưu thông tin tài khoản, hồ sơ nghề nghiệp hoặc khách hàng, họ tên trên hợp đồng, số điện thoại, email liên hệ và thời điểm chấp nhận điều khoản.',
  },
  {
    title: 'Mục đích sử dụng',
    text: 'Thông tin được dùng để vận hành tài khoản, kết nối công việc, lập hợp đồng và phối hợp thực hiện dự án. Thông tin liên hệ trên hợp đồng được cung cấp cho bên còn lại của hợp đồng đó.',
  },
  {
    title: 'Thông tin trong hợp đồng',
    text: 'Họ tên, số điện thoại và email được lưu tại thời điểm lập hợp đồng. Cập nhật hồ sơ về sau không làm thay đổi thông tin đã lưu trong hợp đồng.',
  },
  {
    title: 'Cập nhật hồ sơ',
    text: 'Bạn có thể xem và cập nhật thông tin tại trang hồ sơ. Không đưa mật khẩu, khóa truy cập hoặc dữ liệu không cần thiết vào nội dung hồ sơ và dự án.',
  },
];

export function isParticipationProfileComplete(profile: {
  contractName?: string | null;
  contactEmail?: string | null;
  phoneNumber?: string | null;
  policyAcceptedAt?: string | null;
  policyVersion?: string | null;
}) {
  return Boolean(
    profile.contractName?.trim() &&
      profile.contactEmail?.trim() &&
      profile.phoneNumber?.trim() &&
      profile.policyAcceptedAt &&
      profile.policyVersion === POLICY_VERSION
  );
}
