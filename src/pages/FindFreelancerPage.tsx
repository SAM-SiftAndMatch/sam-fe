import type React from 'react';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';

// === MOCK DATA ===
const FREELANCERS = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    title: 'Fullstack Developer (React/Node)',
    rating: 4.9,
    reviews: 124,
    hourlyRate: '250.000 VND',
    skills: ['React', 'Node.js', 'Next.js', 'TypeScript'],
    location: 'Hồ Chí Minh',
    description: 'Chuyên gia phát triển ứng dụng Web với 5 năm kinh nghiệm. Từng làm việc tại VNG, FPT Software.',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    title: 'Senior UI/UX Designer',
    rating: 4.8,
    reviews: 89,
    hourlyRate: '200.000 VND',
    skills: ['Figma', 'Prototyping', 'User Research', 'Web Design'],
    location: 'Hà Nội',
    description: 'Thiết kế giao diện người dùng thân thiện, hiện đại. Tập trung vào trải nghiệm và tối ưu tỷ lệ chuyển đổi.',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    title: 'Data Engineer / Python Expert',
    rating: 5.0,
    reviews: 45,
    hourlyRate: '350.000 VND',
    skills: ['Python', 'SQL', 'Airflow', 'AWS'],
    location: 'Đà Nẵng',
    description: 'Có kinh nghiệm xây dựng hệ thống dữ liệu lớn, ETL pipelines và tối ưu hóa truy vấn CSDL.',
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    avatar: 'https://i.pravatar.cc/150?img=47',
    title: 'Chuyên viên SEO & Content Marketing',
    rating: 4.7,
    reviews: 210,
    hourlyRate: '150.000 VND',
    skills: ['SEO', 'Content Writing', 'Copywriting', 'Google Analytics'],
    location: 'Hồ Chí Minh',
    description: 'Đã đưa hơn 20 website lên top 1 Google. Viết bài chuẩn SEO, tăng traffic tự nhiên bền vững.',
  },
];

const FindFreelancerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <ClientDashboardHeader />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Tìm kiếm Freelancer</h1>
            <p className="text-gray-500">Tìm kiếm nhân tài phù hợp cho dự án của bạn từ hàng ngàn chuyên gia.</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Tìm kỹ năng, tên..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Lọc
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {FREELANCERS.map((freelancer) => (
            <div key={freelancer.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={freelancer.avatar}
                  alt={freelancer.name}
                  className="w-16 h-16 rounded-full object-cover border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 mb-1">{freelancer.title}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-gray-900">{freelancer.rating}</span>
                      <span>({freelancer.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {freelancer.location}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {freelancer.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {freelancer.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-full border border-gray-100">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-white border-2 border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EEF2FF] font-bold py-2 rounded-xl transition-colors cursor-pointer text-sm">
                  Xem hồ sơ
                </button>
                <button className="flex-1 bg-[#1D4ED8] hover:bg-[#153bb5] text-white font-bold py-2 rounded-xl transition-colors cursor-pointer text-sm shadow-sm">
                  Mời làm việc
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FindFreelancerPage;
