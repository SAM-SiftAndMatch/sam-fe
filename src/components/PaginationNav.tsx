type PaginationNavProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label: string;
  className?: string;
};

function pageItems(page: number, totalPages: number): Array<number | string> {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 3) return [1, 2, 3, 4, 'start-ellipsis', totalPages];
  if (page >= totalPages - 2) {
    return [1, 'start-ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'start-ellipsis', page - 1, page, page + 1, 'end-ellipsis', totalPages];
}

export default function PaginationNav({
  page,
  totalPages,
  onPageChange,
  label,
  className = '',
}: PaginationNavProps) {
  if (totalPages < 1) return null;

  const currentPage = Math.max(1, Math.min(page, totalPages));
  const items = pageItems(currentPage, totalPages);
  const buttonClass =
    'h-10 min-w-10 cursor-pointer rounded-xl border px-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`.trim()}
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${buttonClass} border-slate-200 bg-white text-slate-600 hover:border-[#1D4ED8]/50 hover:text-[#1D4ED8]`}
        aria-label="Trang trước"
      >
        Trước
      </button>
      {items.map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            onClick={() => {
              if (item !== currentPage) onPageChange(item);
            }}
            className={`${buttonClass} ${
              item === currentPage
                ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-[#1D4ED8]/50 hover:text-[#1D4ED8]'
            }`}
            aria-current={item === currentPage ? 'page' : undefined}
            aria-label={`Trang ${item}`}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="px-1 text-sm text-gray-400" aria-hidden="true">
            …
          </span>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${buttonClass} border-slate-200 bg-white text-slate-600 hover:border-[#1D4ED8]/50 hover:text-[#1D4ED8]`}
        aria-label="Trang sau"
      >
        Sau
      </button>
    </nav>
  );
}
