import samLogo from '../assets/sam-logo-transparent.png';

type SamBrandLogoProps = {
  isScrolled?: boolean;
};

const SamBrandLogo = ({ isScrolled = false }: SamBrandLogoProps) => (
  <>
    <span
      className={`sam-brand-logo shrink-0 ${isScrolled ? 'sam-brand-logo--small' : ''}`}
      style={{ maskImage: `url(${samLogo})`, WebkitMaskImage: `url(${samLogo})` }}
      role="img"
      aria-label="SAM"
    />
    <span
      className={`hidden self-center border-l border-slate-300 pl-2 text-[10px] font-medium uppercase tracking-widest text-slate-500 transition-opacity duration-200 sm:inline-block ${
        isScrolled ? 'opacity-80' : 'opacity-100'
      }`}
    >
      Sift &amp; Match
    </span>
  </>
);

export default SamBrandLogo;
