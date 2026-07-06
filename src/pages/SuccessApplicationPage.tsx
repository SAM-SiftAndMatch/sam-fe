import type React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { PATH_FREELANCER_APPLICATIONS, PATH_FREELANCER_JOBS } from '../routes/paths';

const SuccessApplicationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-100 w-full max-w-lg flex flex-col items-center text-center px-7">
          {/* Icon Success */}
          <div className="relative mb-8 mt-4">
            {/* Glow background */}
            <div className="absolute inset-0 bg-[#0AAAD7] rounded-full opacity-20 blur-lg scale-[1.2]" />
            {/* Main Icon Container */}
            <div className="relative w-20 h-20 rounded-full bg-white border-[1px] border-cyan-400 flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="url(#samGradient)"
                strokeWidth={3}
                role="img"
                aria-label="Success"
              >
                <defs>
                  <linearGradient id="samGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1D4ED8" />
                    <stop offset="100%" stopColor="#0AAAD7" />
                  </linearGradient>
                </defs>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] mb-3">
            Gửi hồ sơ ứng tuyển thành công
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-10">
            Hồ sơ của bạn đã được gửi đến khách hàng. Khách hàng sẽ xem xét và phản hồi trong thời
            gian sớm nhất.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={() => navigate(PATH_FREELANCER_APPLICATIONS)}
              className="w-full bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] hover:opacity-90 text-white font-bold py-3.5 px-6 rounded-2xl shadow-[0_4px_15px_rgba(10,170,215,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              Xem trạng thái chờ phản hồi
            </button>

            <button
              type="button"
              onClick={() => navigate(PATH_FREELANCER_JOBS)}
              className="w-full bg-white border-2 border-gray-100 text-gray-700 hover:border-[#0AAAD7] hover:text-[#0AAAD7] font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Tiếp tục tìm việc
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SuccessApplicationPage;
