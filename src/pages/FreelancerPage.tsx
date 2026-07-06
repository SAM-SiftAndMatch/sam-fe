import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FooterDashboard from '../components/FooterDashboard';
import Header from '../components/Header';
import * as paths from '../routes/paths';
import { MOCK_JOBS } from './FreelancerJobsPage';

const FreelancerPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Header />

      <section className="w-full flex flex-col items-center text-center py-24 px-4 relative overflow-hidden bg-gradient-to-b from-[#F4F7FF] to-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0047FF] opacity-5 blur-[120px] rounded-full pointer-events-none" />

        <h1 className="text-4xl md:text-[56px] font-black text-[#1A1B22] leading-tight mb-6 max-w-3xl z-10">
          Nơi kết nối công việc <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0047FF] to-[#00B2FF] italic pr-2">
            mơ ước
          </span>{' '}
          của bạn
        </h1>
        <p className="text-gray-500 text-base md:text-lg mb-10 max-w-xl z-10 leading-relaxed">
          Trải nghiệm nền tảng tuyển dụng thông minh được vận hành bởi AI, giúp bạn tìm thấy cơ hội
          phù hợp nhất với kỹ năng và đam mê.
        </p>
        <button
          type="button"
          onClick={() => navigate(paths.PATH_FREELANCER_CREATE_PROFILE)}
          className="bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:shadow-[0_8px_25px_rgba(0,178,255,0.4)] text-white font-bold px-8 py-3.5 rounded-full transition-all flex items-center gap-2 z-10 cursor-pointer border-0"
        >
          Tạo hồ sơ của bạn
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            role="img"
            aria-label="Arrow right"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </section>

      <section className="w-full max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Công việc hiện có</h2>
            <p className="text-gray-500 text-sm">Khám phá hàng ngàn cơ hội mới mỗi ngày</p>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['Tất cả', 'Lập trình', 'Thiết kế', 'Viết lách'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer border-0 ${
                  activeFilter === filter
                    ? 'bg-[#1D4ED8] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_JOBS.slice(0, 4).map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow flex flex-col h-full"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                  {job.icon}
                </div>
                <span className="text-[11px] font-bold text-gray-500 tracking-wider">
                  {job.type}
                </span>
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 leading-snug mb-3 flex-grow">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 mb-5">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  role="img"
                  aria-label="Wallet"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span className="text-sm font-bold text-[#1D4ED8]">{job.price}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate(paths.PATH_JOB_DETAIL.replace(':id', job.id.toString()))}
                className="w-full py-3 bg-[#00B2FF] hover:bg-[#009CE0] text-white text-sm font-bold rounded-xl transition-colors mt-auto cursor-pointer border-0"
              >
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-6 md:px-10 py-16 mb-10">
        <div className="bg-[#F8FAFC] rounded-[40px] p-8 md:p-14 flex flex-col md:flex-row items-center gap-12 border border-gray-100">
          <div className="flex-1 flex flex-col items-start">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sẵn sàng để tỏa sáng?
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-8 max-w-md">
              Chỉ với 3 bước đơn giản, bạn sẽ gia nhập cộng đồng hơn 50.000 freelancer tài năng nhất
              Việt Nam. Hệ thống AI của chúng tôi sẽ tự động đề xuất công việc dựa trên Portfolio
              của bạn.
            </p>

            <div className="flex flex-col gap-5 mb-10">
              {[
                'Hoàn thiện hồ sơ chuyên nghiệp',
                'Nhận đề xuất việc làm từ AI',
                'Bắt đầu làm việc & Nhận thanh toán',
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-gray-800 font-medium">{step}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate(paths.PATH_FREELANCER_JOBS)}
              className="bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:shadow-lg hover:-translate-y-0.5 text-white font-bold px-8 py-3.5 rounded-full transition-all flex items-center gap-2 cursor-pointer border-0"
            >
              Bắt đầu công việc
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                role="img"
                aria-label="Lightning"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>

          <div className="flex-1 w-full relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors z-10" />
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
              alt="Video Thumbnail"
              className="w-full h-auto aspect-[16/10] object-cover"
            />

            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center">
              <button
                type="button"
                className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform cursor-pointer"
              >
                <svg
                  className="w-8 h-8 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Play"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
              <div>
                <span className="text-white/80 text-[10px] font-bold tracking-widest uppercase mb-1 block">
                  Hướng dẫn
                </span>
                <span className="text-white font-bold text-lg">Cách hoạt động của SAM</span>
              </div>
              <span className="bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                02:45
              </span>
            </div>
          </div>
        </div>
      </section>

      <FooterDashboard />
    </div>
  );
};

export default FreelancerPage;
