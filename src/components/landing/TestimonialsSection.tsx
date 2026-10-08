import type React from 'react';
import { MonoTag } from './LandingButtons';
import { ScrollReveal } from './ScrollReveal';

const TESTIMONIALS = [
  {
    id: 1,
    content:
      '"AI Matching của SAM thật sự đáng kinh ngạc. Tôi tìm được một Designer hiểu ý mình ngay từ lần gặp đầu tiên. Rất đáng đồng tiền gạo!"',
    name: 'Anh Tuấn',
    role: 'CEO, TechFlow Startup',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
    tag: 'STARTUP CEO',
  },
  {
    id: 2,
    content:
      '"Quy trình thanh toán an toàn và minh bạch. Tôi cảm thấy hoàn toàn yên tâm khi giao phó những dự án quan trọng của công ty cho SAM."',
    name: 'Chị Lan Phương',
    role: 'Marketing Manager, F&B Group',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    tag: 'ENTERPRISE',
  },
  {
    id: 3,
    content:
      '"Từ khi chuyển sang dùng AI Brief Assistant, việc đăng dự án trở nên nhẹ nhàng hơn hẳn. Thông tin rõ ràng nên freelancer báo giá rất sát."',
    name: 'Minh Hoàng',
    role: 'Freelance Project Lead',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    tag: 'PROJECT LEAD',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section
      id="testimonials"
      className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative"
    >
      <ScrollReveal className="text-left mb-14">
        <div className="flex items-center gap-2 mb-3">
          <MonoTag variant="primary">ĐÁNH GIÁ THỰC TẾ {'//'} FEEDBACK</MonoTag>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          Khách hàng nói về SAM
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Được tin tưởng bởi hàng nghìn nhà sáng lập startup, quản lý dự án và các kỹ sư phần mềm
          hàng đầu trên khắp Việt Nam.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {TESTIMONIALS.map((review, idx) => (
          <ScrollReveal key={review.id} delayMs={idx * 100} className="h-full">
            <div className="group h-full bg-white rounded-[12px] p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8]/60 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] text-slate-400">VERIFIED REVIEW</span>
                  <MonoTag variant="muted">{review.tag}</MonoTag>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 italic">
                  {review.content}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{review.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">{review.role}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
