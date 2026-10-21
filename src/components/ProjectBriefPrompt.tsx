import { useEffect, useState } from 'react';

type ProjectBriefPromptProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  className?: string;
};

export default function ProjectBriefPrompt({
  value,
  onChange,
  onSubmit,
  className = '',
}: ProjectBriefPromptProps) {
  const [placeholderText, setPlaceholderText] = useState('');

  useEffect(() => {
    const fullText = "Mô tả công việc bạn cần (ví dụ: 'Thiết kế logo hiện đại cho startup')";
    let index = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const type = () => {
      if (!isDeleting) {
        setPlaceholderText(fullText.slice(0, index + 1));
        index++;
        if (index === fullText.length) {
          isDeleting = true;
          timeoutId = setTimeout(type, 3000);
        } else {
          timeoutId = setTimeout(type, 50);
        }
      } else {
        setPlaceholderText(fullText.slice(0, index - 1));
        index--;
        if (index === 0) {
          isDeleting = false;
          timeoutId = setTimeout(type, 500);
        } else {
          timeoutId = setTimeout(type, 20);
        }
      }
    };

    timeoutId = setTimeout(type, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <h2 className="project-brief-prompt-title mb-3 text-sm font-semibold uppercase tracking-wider text-slate-700">
        Bạn cần hoàn thành công việc gì?
      </h2>
      <div
        className={`relative z-10 mb-4 flex w-full max-w-5xl flex-col items-stretch gap-2 rounded-[28px] border border-gray-100 bg-white p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full ${className}`.trim()}
      >
        <div className="flex items-center flex-1 min-w-0">
          <span className="pl-4 text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              role="img"
              aria-label="Search"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            aria-label="Mô tả sơ bộ dự án"
            placeholder={placeholderText}
            className="project-brief-prompt-input flex-1 bg-transparent border-0 focus:ring-0 outline-none text-sm px-3 text-gray-700 placeholder:text-gray-400 min-w-0"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSubmit(value);
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => onSubmit(value)}
          className="bg-[#1D4ED8] hover:bg-[#153bb5] text-white text-sm font-bold px-6 sm:px-8 py-3 rounded-full transition-colors cursor-pointer border-0 shrink-0"
        >
          Tiếp tục
        </button>
      </div>
    </>
  );
}
