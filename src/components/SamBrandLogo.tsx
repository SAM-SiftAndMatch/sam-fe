type SamBrandLogoProps = {
  isScrolled: boolean;
};

const SamBrandLogo = ({ isScrolled }: SamBrandLogoProps) => (
  <>
    <span
      className={`select-none bg-gradient-to-r from-[#1D4ED8] via-[#0066FF] to-[#0AAAD7] bg-clip-text font-extrabold leading-none tracking-tighter text-transparent transition-all duration-300 group-hover:from-[#0AAAD7] group-hover:to-[#1D4ED8] ${
        isScrolled ? 'text-2xl sm:text-[28px]' : 'text-3xl sm:text-[38px]'
      }`}
    >
      SAM
    </span>
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
