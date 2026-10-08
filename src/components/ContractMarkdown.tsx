import type React from 'react';
import ReactMarkdown from 'react-markdown';

/** Render nội dung hợp đồng Markdown đẹp — dùng chung cho màn xem và preview lúc sửa. */
const ContractMarkdown: React.FC<{ content: string }> = ({ content }) => (
  <ReactMarkdown
    components={{
      h1: ({ children }) => (
        <h1 className="text-lg font-black text-gray-900 mt-4 mb-2 first:mt-0 text-center">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-base font-black text-[#1D4ED8] mt-5 mb-2 pb-2 border-b border-blue-100">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-sm font-bold text-gray-800 mt-4 mb-1.5">{children}</h3>
      ),
      p: ({ children }) => <p className="text-sm leading-7 text-gray-700 mb-2">{children}</p>,
      ul: ({ children }) => (
        <ul className="list-disc list-outside text-sm text-gray-700 space-y-1.5 mb-3 ml-5">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="list-decimal list-outside text-sm text-gray-700 space-y-1.5 mb-3 ml-5">
          {children}
        </ol>
      ),
      li: ({ children }) => <li className="leading-7">{children}</li>,
      strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
      hr: () => <hr className="my-5 border-gray-200" />,
    }}
  >
    {content || 'Chưa có điều khoản.'}
  </ReactMarkdown>
);

export default ContractMarkdown;
