import type React from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../../routes/paths';
import { MonoTag } from './LandingButtons';
import { ScrollReveal } from './ScrollReveal';

const CATEGORIES = [
  {
    id: 1,
    name: 'Lập trình',
    count: '1,245 Freelancers',
    code: 'DEV',
  },
  {
    id: 2,
    name: 'Kỹ sư phần mềm',
    count: '2,102 Freelancers',
    code: 'ENG',
  },
  {
    id: 3,
    name: 'Viết lách',
    count: '850 Freelancers',
    code: 'COPY',
  },
  {
    id: 4,
    name: 'Hành chính văn phòng',
    count: '420 Freelancers',
    code: 'ADMIN',
  },
  {
    id: 5,
    name: 'Marketing',
    count: '1,500 Freelancers',
    code: 'MKT',
  },
  {
    id: 6,
    name: 'Dịch thuật',
    count: '320 Freelancers',
    code: 'LANG',
  },
  {
    id: 7,
    name: 'Dữ liệu',
    count: '150 Freelancers',
    code: 'DATA',
  },
  {
    id: 8,
    name: 'Tư vấn',
    count: '640 Freelancers',
    code: 'CONSULT',
  },
];

export const CategoriesSection: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectCategory = (categoryName: string) => {
    navigate(paths.PATH_LOGIN, {
      state: { initialQuery: categoryName, returnTo: paths.PATH_CLIENT_AI_BRIEF },
    });
  };

  return (
    <section
      id="categories"
      className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative"
    >
      <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MonoTag variant="muted">LĨNH VỰC CHUYÊN SÂU {'//'} TALENT POOL</MonoTag>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Lĩnh vực phổ biến
          </h2>
          <p className="text-sm text-slate-600">Khám phá cộng đồng chuyên gia tài năng nhất</p>
        </div>

        <button
          type="button"
          onClick={() => navigate(paths.PATH_CLIENT_FIND_FREELANCER)}
          className="text-xs font-mono font-semibold text-[#1D4ED8] hover:underline cursor-pointer bg-transparent border-0 flex items-center gap-1 self-start md:self-auto"
        >
          XEM TẤT CẢ DANH MỤC →
        </button>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {CATEGORIES.map((cat, idx) => (
          <ScrollReveal key={cat.id} delayMs={idx * 40} className="h-full">
            <div
              onClick={() => handleSelectCategory(cat.name)}
              className="group h-full bg-white rounded-[12px] p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] text-slate-400 group-hover:text-[#1D4ED8] transition-colors">
                  #{cat.code}
                </span>
                <span className="font-mono text-[11px] text-[#1D4ED8] opacity-0 group-hover:opacity-100 transition-opacity">
                  CHỌN →
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1D4ED8] transition-colors mb-1">
                  {cat.name}
                </h3>
                <p className="font-mono text-[11px] text-slate-500">{cat.count}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;
