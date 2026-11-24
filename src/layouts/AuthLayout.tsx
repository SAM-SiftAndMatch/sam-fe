import { type ReactNode, useId } from 'react';
import { Link } from 'react-router-dom';
import { PolicyButton } from '../components/PolicyLinks';
import SamBrandLogo from '../components/SamBrandLogo';
import * as paths from '../routes/paths';
import './AuthPage.css';

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  const titleId = useId();

  return (
    <main className="auth-page">
      <header className="auth-header">
        <Link to={paths.PATH_HOME} className="auth-brand" aria-label="SAM — Trang chủ">
          <SamBrandLogo showTagline={false} />
          <span className="auth-brand-caption">Sift &amp; Match</span>
        </Link>
        <Link to={paths.PATH_HOME} className="auth-home-link">
          Về trang chủ
        </Link>
      </header>

      <div className="auth-stage">
        <section className="auth-card" aria-labelledby={titleId}>
          <div className="auth-intro">
            <h1 id={titleId}>{title}</h1>
            {description && <p>{description}</p>}
          </div>
          {children}
          <p className="auth-switch">{footer}</p>
        </section>
      </div>

      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} SAM</span>
        <div>
          <PolicyButton policy="privacy" className="auth-policy">
            Chính sách bảo mật
          </PolicyButton>
          <span aria-hidden="true">·</span>
          <PolicyButton policy="terms" className="auth-policy">
            Điều khoản
          </PolicyButton>
        </div>
      </footer>
    </main>
  );
}
