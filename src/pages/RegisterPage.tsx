import type React from 'react';
import { useState } from 'react';

const RegisterPage: React.FC = () => {
  const [accountType, setAccountType] = useState<'client' | 'freelancer'>('client');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật!');
      return;
    }
    if (!fullName || !email || !password) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(
        `Đăng ký thành công tài khoản ${accountType === 'client' ? 'Khách Hàng' : 'Freelancer'}: ${fullName}`
      );
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans py-10 px-4">
      {/* Main Card */}
      <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-[520px] p-8 md:p-10 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            {/* Logo SAM (Gradient text mockup) */}
            <span className="text-[40px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0047FF] to-[#00B2FF]">
              SAM
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Khám phá tương lai công việc</h1>
          <p className="text-gray-500 text-sm">
            Tham gia mạng lưới nhân tài AI hàng đầu thế giới ngay hôm nay
          </p>
        </div>

        {/* Account Type Toggle */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setAccountType('client')}
            className={`py-4 px-2 flex flex-col items-center justify-center gap-2 border rounded-xl transition-all cursor-pointer ${
              accountType === 'client'
                ? 'border-[#0047FF] bg-[#F5F8FF] text-[#0047FF]'
                : 'border-gray-200 hover:bg-gray-50 text-gray-500'
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              role="img"
              aria-label="Client icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-semibold">Khách Hàng</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('freelancer')}
            className={`py-4 px-2 flex flex-col items-center justify-center gap-2 border rounded-xl transition-all cursor-pointer ${
              accountType === 'freelancer'
                ? 'border-[#0047FF] bg-[#F5F8FF] text-[#0047FF]'
                : 'border-gray-200 hover:bg-gray-50 text-gray-500'
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              role="img"
              aria-label="Freelancer icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-sm font-semibold">Freelancer</span>
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name Input */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-600 mb-1.5">
              Họ và Tên
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  role="img"
                  aria-label="User icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0047FF] focus:ring-1 focus:ring-[#0047FF] transition placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  role="img"
                  aria-label="Email icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@vi-du.com"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0047FF] focus:ring-1 focus:ring-[#0047FF] transition placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  role="img"
                  aria-label="Password icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0047FF] focus:ring-1 focus:ring-[#0047FF] transition placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {/* Terms Checkbox - Tách label và button cẩn thận để né lỗi a11y */}
          <div className="flex items-start pt-2 pb-1">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#0047FF] border-gray-300 rounded focus:ring-[#0047FF] cursor-pointer"
            />
            <div className="ml-2 text-[13px] text-gray-600">
              <label htmlFor="terms" className="cursor-pointer select-none">
                Tôi đồng ý với{' '}
              </label>
              <button
                type="button"
                className="text-[#0047FF] hover:underline cursor-pointer bg-transparent border-0 p-0 font-medium"
              >
                Điều khoản Dịch vụ
              </button>
              <span> và </span>
              <button
                type="button"
                className="text-[#0047FF] hover:underline cursor-pointer bg-transparent border-0 p-0 font-medium"
              >
                Chính sách Bảo mật
              </button>
              <label htmlFor="terms" className="cursor-pointer select-none">
                {' '}
                của SAM.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:opacity-95 text-white font-semibold py-3.5 rounded-full transition shadow-[0_8px_20px_rgba(0,178,255,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center mt-8 mb-6">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-4 text-xs text-gray-500 uppercase">Hoặc đăng ký bằng</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            className="py-2.5 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" role="img" aria-label="Google">
              <path
                fill="#EA4335"
                d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.97 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.74 2.9C5.91 7.23 8.71 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.45 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.42c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.52z"
              />
              <path
                fill="#FBBC05"
                d="M5.04 14.82c-.24-.72-.38-1.49-.38-2.32s.14-1.6.38-2.32L1.3 7.28C.47 8.94 0 10.79 0 12.72s.47 3.78 1.3 5.44l3.74-2.94z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.29 0-6.09-2.19-7.08-5.58L1.18 15.7C3.15 19.7 7.21 23 12 23z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="py-2.5 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" role="img" aria-label="Apple">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39z" />
            </svg>
          </button>
          <button
            type="button"
            className="py-2.5 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
          >
            <svg
              className="w-5 h-5 fill-[#0A66C2]"
              viewBox="0 0 24 24"
              role="img"
              aria-label="LinkedIn"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Under Card Links */}
      <div className="mt-8 text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <button
          type="button"
          className="text-[#0047FF] font-medium hover:underline cursor-pointer bg-transparent border-0 p-0"
        >
          Đăng nhập ngay
        </button>
      </div>

      {/* Trust Badges & Copyright Footer */}
      <div className="mt-12 flex flex-col items-center gap-6 w-full max-w-[520px]">
        <div className="flex items-center justify-between w-full text-xs text-gray-400">
          <span>Được tin dùng bởi:</span>
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              role="img"
              aria-label="Verified"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              role="img"
              aria-label="Secure"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              role="img"
              aria-label="Award"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
              />
            </svg>
          </div>
        </div>
        <p className="text-[11px] text-gray-400">
          © 2024 SAM AI Matching. Công nghệ kết nối nhân tài tương lai.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
