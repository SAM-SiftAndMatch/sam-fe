import { Link, useLocation } from 'react-router-dom';
import { PolicyButton } from '../components/PolicyLinks';
import { POLICY_VERSION, policySections, privacySections } from '../lib/participation-policy';

export default function PolicyPage() {
  const privacy = useLocation().pathname === '/privacy';
  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 font-sans">
      <main className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 md:p-10">
        <Link to="/" className="font-bold text-[#1D4ED8]">
          SAM
        </Link>
        <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
          {privacy ? 'Chính sách Bảo mật' : 'Điều khoản Dịch vụ'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Phiên bản {POLICY_VERSION} · Áp dụng cho client và freelancer
        </p>
        <div className="mt-8 space-y-7">
          {(privacy ? privacySections : policySections).map((section, index) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-slate-900">
                {index + 1}. {section.title}
              </h2>
              <p className="mt-2 leading-7 text-slate-600">{section.text}</p>
            </section>
          ))}
        </div>
        <PolicyButton
          policy={privacy ? 'terms' : 'privacy'}
          className="mt-8 inline-block text-sm font-semibold text-[#1D4ED8] hover:underline"
        >
          {privacy ? 'Xem Điều khoản Dịch vụ' : 'Xem Chính sách Bảo mật'} →
        </PolicyButton>
      </main>
    </div>
  );
}
