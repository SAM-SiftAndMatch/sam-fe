import type React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as paths from '../routes/paths';

const LoginPage: React.FC = () => {
  // States để làm Prototype tương tác luồng dữ liệu giả lập (Mock data)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ Email và Mật khẩu để test prototype!');
      return;
    }

    setIsLoading(true);
    // Giả lập luồng xử lý mất 1 giây trước khi đăng nhập thành công
    setTimeout(() => {
      setIsLoading(false);

      // 2 Mock data: client@sam.com và freelancer@sam.com
      if (email === 'client@sam.com') {
        navigate(paths.PATH_CLIENT_DASHBOARD);
      } else if (email === 'freelancer@sam.com') {
        navigate(paths.PATH_FREELANCER);
      } else {
        alert(
          `[Mock Auth] Đăng nhập thành công: ${email}\n\nGợi ý Prototype:\n- Dùng "client@sam.com" để vào Dashboard Khách Hàng.\n- Dùng "freelancer@sam.com" để vào trang Freelancer.`
        );
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between items-center font-sans py-6 px-4 select-none relative">
      <Link
        to={paths.PATH_HOME}
        className="absolute top-6 left-6 md:top-10 md:left-10 text-sm font-bold text-gray-500 hover:text-[#1D4ED8] transition-colors flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Về trang chủ
      </Link>

      {/* Đã sửa <div></div> thành thẻ tự đóng */}
      <div />

      {/* Main Login Card */}
      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 flex max-w-5xl w-full overflow-hidden min-h-[600px]">
        {/* Left Pane: Gradient Banner */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#00A3FF] via-[#1A83FF] to-[#1D4ED8] p-12 flex-col justify-start text-white relative">
          <div className="text-4xl font-black tracking-tighter mb-6">SAM</div>
          <p className="text-lg font-medium leading-relaxed opacity-90 max-w-xs">
            Kiến tạo tương lai cho việc kết nối khách hàng và freelancer
          </p>
          {/* Đã sửa thẻ tự đóng */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-tl-full pointer-events-none" />
        </div>

        {/* Right Pane: Form Đăng Nhập */}
        <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center bg-white">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Chào mừng quay trở lại
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-md">
            Đăng nhập vào không gian làm việc SAM của bạn để tiếp tục kết nối.
          </p>

          {/* Social Logins - Tạm ẩn */}
          {false && (
            <>
              {/* Social Logins */}
              <div className="space-y-3 mb-6">
                {/* Google */}
                <button
                  type="button"
                  className="w-full border border-gray-200 hover:bg-gray-50 transition font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-700 cursor-pointer"
                >
                  {/* Thêm role và aria-label cho SVG */}
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
                  Tiếp tục với Google
                </button>

                {/* Apple & LinkedIn */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="border border-gray-200 hover:bg-gray-50 transition font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-700 cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label="Apple"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39z" />
                    </svg>
                    Apple
                  </button>
                  <button
                    type="button"
                    className="border border-gray-200 hover:bg-gray-50 transition font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-700 cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4 fill-[#0A66C2]"
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label="LinkedIn"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    LinkedIn
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center my-5">
                {/* Đã sửa thẻ tự đóng */}
                <div className="flex-grow border-t border-gray-200" />
                <span className="mx-4 text-xs font-bold text-gray-400 tracking-widest uppercase">
                  HOẶC EMAIL
                </span>
                <div className="flex-grow border-t border-gray-200" />
              </div>
            </>
          )}

          {/* Form Fields */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              {/* Thêm htmlFor="email" */}
              <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">
                Email công việc
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                  placeholder="ten@congty.com"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                {/* Thêm htmlFor="password" */}
                <label htmlFor="password" className="block text-xs font-semibold text-gray-600">
                  Mật khẩu
                </label>
                {/* Đổi a thành button để né useValidAnchor */}
                <button
                  type="button"
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer bg-transparent border-0 p-0"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  required
                />
                {/* Toggle Password Visibility Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-0"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      role="img"
                      aria-label="Hide password"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      role="img"
                      aria-label="Show password"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center pt-1">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="remember_me"
                className="ml-2 text-xs font-semibold text-gray-500 cursor-pointer select-none"
              >
                Duy trì đăng nhập trong 30 ngày
              </label>
            </div>

            {/* Test Shortcut Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(paths.PATH_CLIENT_DASHBOARD)}
                className="flex-1 text-[11px] font-bold py-2 rounded-lg border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Đăng nhập với tư cách Khách hàng
              </button>
              <button
                type="button"
                onClick={() => navigate(paths.PATH_FREELANCER)}
                className="flex-1 text-[11px] font-bold py-2 rounded-lg border border-cyan-200 text-cyan-700 bg-cyan-50 hover:bg-cyan-100 transition-colors cursor-pointer"
              >
                Đăng nhập với tư cách Freelancer
              </button>
            </div>

            {/* Login Button with Pill Shape & Gradient matching design */}
            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="w-8/12 bg-gradient-to-r from-[#1D4ED8] to-[#00A3FF] hover:opacity-95 text-white font-bold py-3.5 rounded-full transition shadow-lg text-center disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          {/* Footer inside Card */}
          <div className="mt-8 text-center text-xs text-gray-500 font-medium">
            Mới sử dụng NỀN TẢNG SAM?{' '}
            <Link
              to={paths.PATH_REGISTER}
              className="text-blue-600 font-bold hover:underline ml-1 cursor-pointer bg-transparent border-0 p-0"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </div>

      {/* External Page Footer */}
      <footer className="flex space-x-6 text-xs text-gray-500 font-semibold mt-6">
        <button
          type="button"
          className="hover:text-gray-800 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Chính sách bảo mật
        </button>
        <button
          type="button"
          className="hover:text-gray-800 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Điều khoản dịch vụ
        </button>
        <button
          type="button"
          className="hover:text-gray-800 transition cursor-pointer bg-transparent border-0 p-0"
        >
          Trung tâm trợ giúp
        </button>
      </footer>
    </div>
  );
};

export default LoginPage;
