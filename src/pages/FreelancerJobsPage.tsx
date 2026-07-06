import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/FooterDashboard';
import * as paths from '../routes/paths';

// Lấy mock data phù hợp với developer & văn phòng
const MOCK_JOBS = [
  {
    id: 1,
    type: 'KỸ SƯ PHẦN MỀM',
    title: 'Phát triển module thanh toán VNPay cho Website Next.js',
    price: '5.000.000đ - 10.000.000đ',
    tags: ['Next.js', 'Node.js', 'VNPay API'],
    postedAt: '2 giờ trước',
  },
  {
    id: 2,
    type: 'HÀNH CHÍNH VĂN PHÒNG',
    title: 'Dịch thuật bộ hợp đồng thương mại Việt - Anh (50 trang)',
    price: '3.500.000đ',
    tags: ['Dịch thuật', 'Tiếng Anh', 'Word'],
    postedAt: '4 giờ trước',
  },
  {
    id: 3,
    type: 'KỸ SƯ PHẦN MỀM',
    title: 'Viết script Python tự động crawl dữ liệu chứng khoán',
    price: '2.000.000đ',
    tags: ['Python', 'Data Crawling', 'BeautifulSoup'],
    postedAt: '1 ngày trước',
  },
  {
    id: 4,
    type: 'HÀNH CHÍNH VĂN PHÒNG',
    title: 'Nhập liệu 5000 hóa đơn VAT vào hệ thống Excel kế toán',
    price: '1.500.000đ - 2.500.000đ',
    tags: ['Excel', 'Nhập liệu', 'Kế toán'],
    postedAt: '1 ngày trước',
  },
  {
    id: 5,
    type: 'KỸ SƯ PHẦN MỀM',
    title: 'Bảo trì hệ thống Backend Microservices (Golang/Docker)',
    price: '30.000.000đ - 50.000.000đ',
    tags: ['Golang', 'Docker', 'K8s'],
    postedAt: '2 ngày trước',
  }
];

const CATEGORIES = ['Tất cả', 'Kỹ sư phần mềm', 'Hành chính văn phòng', 'Dịch thuật', 'Nhập liệu'];

const FreelancerJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  // Lọc danh sách job
  const filteredJobs = MOCK_JOBS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Tất cả' || job.type.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      {/* Hero Search Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-16 px-4 md:px-8 relative overflow-hidden border-b border-gray-100">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#00B2FF]/10 to-transparent rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#1D4ED8]/10 to-transparent rounded-full pointer-events-none translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-[#1E293B] mb-6">
            Tìm kiếm dự án phù hợp với <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7]">kỹ năng</span> của bạn
          </h1>
          
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100">
            <div className="flex-1 w-full relative flex items-center">
              <svg className="w-6 h-6 text-gray-400 absolute left-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Tìm tên dự án, kỹ năng, công nghệ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none text-gray-800 placeholder:text-gray-400 text-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-0"
              />
            </div>
            <button className="w-full sm:w-auto bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:shadow-[0_8px_25px_rgba(0,178,255,0.3)] text-white font-bold py-3 px-8 rounded-xl transition-all cursor-pointer border-0">
              Tìm việc
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Danh mục</h3>
            <div className="space-y-3">
              {CATEGORIES.map(category => (
                <label key={category} className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveCategory(category)}>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${activeCategory === category ? 'border-[#3B82F6] bg-[#3B82F6]' : 'border-gray-300 group-hover:border-[#3B82F6]'}`}>
                    {activeCategory === category && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={`text-sm font-medium ${activeCategory === category ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ngân sách</h3>
            <div className="space-y-3">
              {['Tất cả', 'Dưới 5.000.000đ', '5.000.000đ - 20.000.000đ', 'Trên 20.000.000đ'].map(budget => (
                <label key={budget} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                    {budget}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Job List */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Công việc nổi bật ({filteredJobs.length})
            </h2>
            <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#3B82F6] focus:border-[#3B82F6] block px-3 py-2 outline-none cursor-pointer">
              <option>Mới nhất</option>
              <option>Ngân sách: Cao đến Thấp</option>
              <option>Ngân sách: Thấp đến Cao</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#3B82F6] hover:shadow-md transition-all group cursor-pointer flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-[#3B82F6] bg-blue-50 px-2 py-1 rounded-md">
                        {job.type}
                      </span>
                      <span className="text-sm text-gray-400 font-medium">
                        • {job.postedAt}
                      </span>
                    </div>
                    
                    <h3 
                      onClick={() => navigate(paths.PATH_JOB_DETAIL.replace(':id', job.id.toString()))}
                      className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#3B82F6] transition-colors"
                    >
                      {job.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.map(tag => (
                        <span key={tag} className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="md:w-48 shrink-0 flex flex-col md:items-end justify-between md:h-full gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                    <div className="text-left md:text-right">
                      <p className="text-sm text-gray-500 mb-1">Ngân sách</p>
                      <p className="font-bold text-gray-900">{job.price}</p>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(paths.PATH_JOB_APPLY.replace(':id', job.id.toString()));
                      }}
                      className="w-full md:w-auto bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:shadow-[0_4px_15px_rgba(0,178,255,0.3)] text-white font-semibold py-2 px-6 rounded-full transition-all cursor-pointer border-0"
                    >
                      Ứng tuyển
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500 text-lg">Không tìm thấy công việc nào phù hợp.</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {filteredJobs.length > 0 && (
            <div className="flex justify-center mt-10">
              <nav className="flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer">
                  &lt;
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#3B82F6] text-white font-bold cursor-pointer">
                  1
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer">
                  2
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer">
                  ...
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer">
                  &gt;
                </button>
              </nav>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerJobsPage;
