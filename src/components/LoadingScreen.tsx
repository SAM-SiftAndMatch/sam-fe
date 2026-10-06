import type React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-4">
        <div
          className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0047FF] to-[#00B2FF] animate-pulse"
          style={{ fontFamily: "'Quedora', sans-serif" }}
        >
          SAM
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0047FF] animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#0085FF] animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#00B2FF] animate-bounce" />
        </div>
        <p className="text-xs text-gray-400 font-medium">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
