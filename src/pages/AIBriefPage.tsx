import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import aiApi from '../api/ai';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import { PATH_CLIENT_CONFIRM_PROJECT, PATH_CLIENT_POST_PROJECT } from '../routes/paths';
import type { AiChatResponse, AiQuestion, ChatMessage } from '../types/ai';

// === Tạo session ID duy nhất cho mỗi phiên làm việc ===
function generateSessionId(): string {
  return `ba-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// (Phase type unused – kept for potential future use)
// type Phase = 'BA' | 'RISK';

// === Component hiển thị câu hỏi dạng card (base-questions) ===
interface BaseQuestionCardProps {
  question: AiQuestion;
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
  onCustomInput: (text: string) => void;
  customInput: string;
}

const BaseQuestionCard: React.FC<BaseQuestionCardProps> = ({
  question,
  selectedOptions,
  onToggleOption,
  onCustomInput,
  customInput,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {question.hint && (
        <span className="inline-block text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2 bg-blue-50 px-2 py-0.5 rounded-full">
          {question.hint}
        </span>
      )}
      <p className="text-sm font-semibold text-gray-800 mb-3 leading-snug">
        {question.questionText}
      </p>

      {question.options && question.options.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {question.options.map((opt) => {
            const isSelected = selectedOptions.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggleOption(opt)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* TEXT hoặc không có options -> LUÔN hiện ô nhập (không phụ thuộc allowCustomInput) */}
      {(question.type === 'TEXT' || !question.options || question.options.length === 0) &&
        (question.type === 'TEXT' ? (
          <textarea
            value={customInput}
            onChange={(e) => onCustomInput(e.target.value)}
            placeholder="Nhập câu trả lời của bạn..."
            rows={4}
            className="w-full resize-y text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-gray-700 placeholder:text-gray-400 transition-all"
          />
        ) : (
          <input
            type="text"
            value={customInput}
            onChange={(e) => onCustomInput(e.target.value)}
            placeholder="Nhập câu trả lời của bạn..."
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-gray-700 placeholder:text-gray-400 transition-all"
          />
        ))}
    </div>
  );
};

// === Component hiển thị câu hỏi follow-up từ AI dưới dạng panel ===
interface AiQuestionPanelProps {
  questions: AiQuestion[];
  onSubmitAnswers: (summary: string) => void;
  disabled?: boolean;
}

const AiQuestionPanel: React.FC<AiQuestionPanelProps> = ({
  questions,
  onSubmitAnswers,
  disabled,
}) => {
  // Map: questionId → { selectedOptions: string[], customInput: string, showCustom: boolean }
  const [answers, setAnswers] = useState<
    Record<string, { selectedOptions: string[]; customInput: string; showCustom: boolean }>
  >(() => {
    const init: Record<
      string,
      { selectedOptions: string[]; customInput: string; showCustom: boolean }
    > = {};
    for (const q of questions) {
      init[q.id] = { selectedOptions: [], customInput: '', showCustom: false };
    }
    return init;
  });

  const toggleOption = (qId: string, opt: string) => {
    setAnswers((prev) => {
      const cur = prev[qId];
      const isSelected = cur.selectedOptions.includes(opt);
      return {
        ...prev,
        [qId]: {
          ...cur,
          selectedOptions: isSelected
            ? cur.selectedOptions.filter((o) => o !== opt)
            : [...cur.selectedOptions, opt],
        },
      };
    });
  };

  const setCustom = (qId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: { ...prev[qId], customInput: text } }));
  };

  const toggleShowCustom = (qId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], showCustom: !prev[qId].showCustom, customInput: '' },
    }));
  };

  const handleSubmit = () => {
    const lines: string[] = [];
    for (const q of questions) {
      const ans = answers[q.id];
      if (!ans) continue;
      const parts: string[] = [...ans.selectedOptions];
      if (ans.customInput.trim()) parts.push(ans.customInput.trim());
      if (parts.length > 0) {
        lines.push(`- ${q.questionText}: ${parts.join(', ')}`);
      }
    }
    const summary = lines.length > 0 ? lines.join('\n') : '(Tôi không có câu trả lời cụ thể)';
    onSubmitAnswers(summary);
  };

  return (
    <div className="mt-3 w-full space-y-3">
      {questions.map((q) => {
        const ans = answers[q.id] || { selectedOptions: [], customInput: '', showCustom: false };
        const hasOpts = (q.options || []).length > 0;
        return (
          <div key={q.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            {/* Hint badge */}
            {q.hint && (
              <span className="inline-block text-[9px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full mb-1.5">
                {q.hint}
              </span>
            )}
            {/* Question text */}
            <p className="text-xs font-semibold text-gray-800 mb-2.5 leading-snug">
              {q.questionText}
            </p>

            {/* Options */}
            {hasOpts && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {q.options!.map((opt) => {
                  const isSelected = ans.selectedOptions.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleOption(q.id, opt)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
                {/* Nút Khác */}
                {q.allowCustomInput && !ans.showCustom && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleShowCustom(q.id)}
                    className="text-xs px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-400 bg-white hover:border-gray-400 hover:text-gray-600 transition-all cursor-pointer font-medium"
                  >
                    ✏️ Khác...
                  </button>
                )}
              </div>
            )}

            {/* Custom input: type TEXT hoặc không có options thì LUÔN hiện ô nhập
                (AI hay quên set allowCustomInput=true nên không được phụ thuộc nó) */}
            {(q.type === 'TEXT' || !hasOpts || ans.showCustom) && (
              <div className="flex gap-2 items-start">
                <textarea
                  value={ans.customInput}
                  onChange={(e) => setCustom(q.id, e.target.value)}
                  placeholder={
                    q.type === 'TEXT' ? 'Nhập câu trả lời của bạn...' : 'Nhập ý kiến khác...'
                  }
                  rows={q.type === 'TEXT' ? 3 : 2}
                  disabled={disabled}
                  className="flex-1 resize-none text-xs border border-blue-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-gray-700 placeholder:text-gray-400 transition-all"
                />
                {ans.showCustom && (
                  <button
                    type="button"
                    onClick={() => toggleShowCustom(q.id)}
                    className="mt-0.5 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-0 p-0.5"
                    title="Đóng"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer border-0 shadow-md shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        Gửi câu trả lời
      </button>
    </div>
  );
};

// === Component bong bóng chat ===
interface ChatBubbleProps {
  message: ChatMessage;
  onSubmitAnswers?: (summary: string) => void;
  isSending?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onSubmitAnswers, isSending }) => {
  const isUser = message.role === 'user';
  const hasQuestions = !isUser && message.questions && message.questions.length > 0;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow-md'
        }`}
      >
        {isUser ? 'B' : 'AI'}
      </div>

      <div className={`flex flex-col ${isUser ? 'items-end max-w-[78%]' : 'items-start w-full'}`}>
        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
          }`}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => <span className="block whitespace-pre-wrap">{children}</span>,
              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              code: ({ children }) => (
                <code
                  className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                    isUser ? 'bg-blue-700 text-blue-100' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {children}
                </code>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside my-1 space-y-0.5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside my-1 space-y-0.5">{children}</ol>
              ),
              li: ({ children }) => <li className="whitespace-pre-wrap">{children}</li>,
              br: () => <br />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Follow-up question panel */}
        {hasQuestions && onSubmitAnswers && (
          <AiQuestionPanel
            questions={message.questions!}
            onSubmitAnswers={onSubmitAnswers}
            disabled={isSending}
          />
        )}

        <span className="text-[10px] text-gray-400 mt-1 px-1">
          {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

// === Typing indicator ===
const TypingIndicator: React.FC = () => (
  <div className="flex gap-3 mb-4">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0">
      AI
    </div>
    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1 items-center h-4">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
      </div>
    </div>
  </div>
);

// === SRS document preview with markdown rendering ===
interface SrsPreviewProps {
  srsContent: string | null;
  variant?: 'full' | 'compact';
  onOpenModal?: () => void;
}

const SrsPreview: React.FC<SrsPreviewProps> = ({ srsContent, variant = 'full', onOpenModal }) => {
  // Convert escaped \n to actual newlines for proper markdown rendering
  const processedContent = srsContent?.replace(/\\n/g, '\n') || '';

  return (
    <section
      className={`bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm ${
        variant === 'compact' ? '' : 'max-h-[58vh]'
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            📄
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Tài liệu SRS {variant === 'compact' ? 'hiện tại' : 'nháp'}
            </h2>
            <p className="text-[11px] text-gray-500">Được AI tạo từ yêu cầu bạn đã xác nhận</p>
          </div>
        </div>
        {onOpenModal && (
          <button
            type="button"
            onClick={onOpenModal}
            className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer bg-transparent border-0 flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            Xem toàn màn
          </button>
        )}
      </div>
      <div
        className={`prose prose-sm max-w-none p-4 overflow-y-auto ${
          variant === 'compact' ? 'max-h-56' : 'max-h-[47vh]'
        }`}
      >
        {processedContent ? (
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-lg font-bold text-gray-900 mt-4 mb-2 first:mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-bold text-gray-800 mt-3 mb-2">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-semibold text-gray-700 mt-2 mb-1.5">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-xs leading-5 text-gray-700 mb-2">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 mb-2 ml-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-xs text-gray-700 space-y-1 mb-2 ml-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="text-xs leading-5">{children}</li>,
              strong: ({ children }) => (
                <strong className="font-bold text-gray-900">{children}</strong>
              ),
              em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
              code: ({ children }) => (
                <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-[11px] font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-2 overflow-x-auto mb-2">
                  {children}
                </pre>
              ),
            }}
          >
            {processedContent}
          </ReactMarkdown>
        ) : (
          <p className="text-xs text-gray-400">Nội dung SRS chưa sẵn sàng.</p>
        )}
      </div>
    </section>
  );
};

// === Full screen SRS modal ===
interface SrsModalProps {
  isOpen: boolean;
  onClose: () => void;
  srsContent: string | null;
}

const SrsModal: React.FC<SrsModalProps> = ({ isOpen, onClose, srsContent }) => {
  if (!isOpen) return null;

  // Convert escaped \n to actual newlines for proper markdown rendering
  const processedContent = srsContent?.replace(/\\n/g, '\n') || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
              📄
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Tài liệu SRS nháp</h2>
              <p className="text-xs text-gray-500">Được AI tạo từ yêu cầu của bạn</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer bg-transparent border-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="prose prose-sm max-w-none">
            {processedContent ? (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3 first:mt-0 border-b border-gray-200 pb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-gray-800 mt-5 mb-2.5">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm leading-6 text-gray-700 mb-3">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1.5 mb-3 ml-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1.5 mb-3 ml-4">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="text-sm leading-6">{children}</li>,
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
                  code: ({ children }) => (
                    <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto mb-3 text-xs">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-3">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {processedContent}
              </ReactMarkdown>
            ) : (
              <p className="text-sm text-gray-400">Nội dung SRS chưa sẵn sàng.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer border-0"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Main Page Component
// =============================================================================
type PageState =
  | 'loading-questions'
  | 'answering-base'
  | 'ba-chat'
  | 'srs-review'
  | 'risk-chat'
  | 'completed';

const AIBriefPage: React.FC = () => {
  const navigate = useNavigate();

  // --- Session ---
  const sessionId = useRef<string>(generateSessionId());

  // --- Page state ---
  const [pageState, setPageState] = useState<PageState>('loading-questions');
  const [error, setError] = useState<string | null>(null);

  // --- Phase 1: Base questions ---
  const [baseQuestions, setBaseQuestions] = useState<AiQuestion[]>([]);
  // Map: questionId → { selectedOptions: string[], customInput: string }
  const [baseAnswers, setBaseAnswers] = useState<
    Record<string, { selectedOptions: string[]; customInput: string }>
  >({});

  // --- Phase 2: BA Chat ---
  const [baMessages, setBaMessages] = useState<ChatMessage[]>([]);
  const [baInput, setBaInput] = useState('');
  const [isBaSending, setIsBaSending] = useState(false);
  const [latestSrsContent, setLatestSrsContent] = useState<string | null>(null);
  const [latestSrsUrl, setLatestSrsUrl] = useState<string | null>(null);
  const [exactBudgetVnd, setExactBudgetVnd] = useState<number | null>(null);
  const [durationMonths, setDurationMonths] = useState<number | null>(null);

  // --- Phase 3: Risk Chat ---
  const [riskMessages, setRiskMessages] = useState<ChatMessage[]>([]);
  const [riskInput, setRiskInput] = useState('');
  const [isRiskSending, setIsRiskSending] = useState(false);

  // --- SRS Modal ---
  const [isSrsModalOpen, setIsSrsModalOpen] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll xuống cuối chat
  const scrollToBottom = useCallback(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [baMessages, riskMessages, isBaSending, isRiskSending, scrollToBottom]);

  // =========================================
  // Load base questions khi mount
  // =========================================
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questions = await aiApi.getBaseQuestions();
        setBaseQuestions(questions);
        // Khởi tạo trạng thái trả lời cho mỗi câu hỏi
        const initialAnswers: Record<string, { selectedOptions: string[]; customInput: string }> =
          {};
        for (const q of questions) {
          initialAnswers[q.id] = { selectedOptions: [], customInput: '' };
        }
        setBaseAnswers(initialAnswers);
        setPageState('answering-base');
      } catch (err) {
        console.error('Failed to load base questions:', err);
        setError('Không thể tải câu hỏi khởi động. Vui lòng thử lại.');
        setPageState('answering-base'); // vẫn cho vào để user có thể bỏ qua
      }
    };

    fetchQuestions();
  }, []);

  // =========================================
  // Toggle option trong base question
  // =========================================
  const handleToggleOption = useCallback((questionId: string, option: string) => {
    setBaseAnswers((prev) => {
      const current = prev[questionId] || { selectedOptions: [], customInput: '' };
      const isSelected = current.selectedOptions.includes(option);
      return {
        ...prev,
        [questionId]: {
          ...current,
          selectedOptions: isSelected
            ? current.selectedOptions.filter((o) => o !== option)
            : [...current.selectedOptions, option],
        },
      };
    });
  }, []);

  const handleCustomInput = useCallback((questionId: string, text: string) => {
    setBaseAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || { selectedOptions: [] }), customInput: text },
    }));
  }, []);

  // =========================================
  // Bắt đầu BA Chat sau khi trả lời base questions
  // =========================================
  const handleStartBaChat = useCallback(async () => {
    // Tổng hợp câu trả lời thành 1 message gửi lên
    const summaryLines: string[] = [];
    for (const q of baseQuestions) {
      const answer = baseAnswers[q.id];
      if (!answer) continue;
      const parts: string[] = [];
      if (answer.selectedOptions.length > 0) {
        parts.push(answer.selectedOptions.join(', '));
      }
      if (answer.customInput.trim()) {
        parts.push(answer.customInput.trim());
      }
      if (parts.length > 0) {
        summaryLines.push(`- ${q.questionText}: ${parts.join('; ')}`);
      }
    }

    const userMessage =
      summaryLines.length > 0
        ? `Đây là thông tin ban đầu về dự án của tôi:\n${summaryLines.join('\n')}`
        : 'Tôi muốn bắt đầu phân tích yêu cầu dự án với AI.';

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setBaMessages([userMsg]);
    setPageState('ba-chat');
    setIsBaSending(true);
    setError(null);

    try {
      const response = await aiApi.chatWithAiBa({
        sessionId: sessionId.current,
        userMessage,
      });

      handleBaResponse(response);
    } catch (err) {
      console.error('BA chat error:', err);
      setError('Không thể kết nối với AI BA. Vui lòng thử lại.');
    } finally {
      setIsBaSending(false);
    }
  }, [baseQuestions, baseAnswers]);

  // =========================================
  // Xử lý response từ BA chat
  // =========================================
  const handleBaResponse = useCallback((response: AiChatResponse) => {
    const aiMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: response.aiMessage || '',
      timestamp: new Date(),
      questions: response.questions,
    };
    setBaMessages((prev) => [...prev, aiMsg]);

    if (response.status === 'COMPLETED') {
      if (response.srsContent) {
        setLatestSrsContent(response.srsContent);
      }
      if (response.currentSrsUrl) {
        setLatestSrsUrl(response.currentSrsUrl);
      }
      if (response.exactBudgetVnd) {
        setExactBudgetVnd(response.exactBudgetVnd);
      }
      if (response.durationMonths) {
        setDurationMonths(response.durationMonths);
      }
    }
  }, []);

  // =========================================
  // Gửi message trong BA Chat
  // =========================================
  const handleSendBaMessage = useCallback(
    async (overrideMessage?: string) => {
      const msg = overrideMessage ?? baInput.trim();
      if (!msg || isBaSending) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: msg,
        timestamp: new Date(),
      };
      setBaMessages((prev) => [...prev, userMsg]);
      setBaInput('');
      setIsBaSending(true);
      setError(null);

      try {
        const response = await aiApi.chatWithAiBa({
          sessionId: sessionId.current,
          userMessage: msg,
        });
        handleBaResponse(response);
        // BA đã hoàn tất: đưa khách sang màn review SRS, không tự động vào Risk Chat.
        if (response.status === 'COMPLETED') {
          setPageState('srs-review');
        }
      } catch (err) {
        console.error('BA send error:', err);
        setError('Gửi tin nhắn thất bại. Vui lòng thử lại.');
      } finally {
        setIsBaSending(false);
      }
    },
    [baInput, isBaSending, handleBaResponse, latestSrsContent]
  );

  // =========================================
  // Bắt đầu Risk Chat
  // =========================================
  const handleStartRiskChat = useCallback(async (srsContent: string) => {
    const userMessage = 'Hãy đánh giá rủi ro và đề xuất ngân sách, thời hạn phù hợp cho dự án này.';
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setRiskMessages([userMsg]);
    setIsRiskSending(true);
    setError(null);

    try {
      const response = await aiApi.chatWithAiRisk({
        sessionId: sessionId.current,
        userMessage,
        currentSrsContent: srsContent,
      });

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.aiMessage || '',
        timestamp: new Date(),
        questions: response.questions,
      };
      setRiskMessages([userMsg, aiMsg]);

      if (response.srsContent) setLatestSrsContent(response.srsContent);
      if (response.currentSrsUrl) setLatestSrsUrl(response.currentSrsUrl);
      if (response.exactBudgetVnd) setExactBudgetVnd(response.exactBudgetVnd);
      if (response.durationMonths) setDurationMonths(response.durationMonths);
      if (response.status === 'FINALIZED') setPageState('completed');
    } catch (err) {
      console.error('Risk init error:', err);
      setError('Không thể kết nối với AI Risk Assessor.');
    } finally {
      setIsRiskSending(false);
    }
  }, []);

  // =========================================
  // Gửi message trong Risk Chat
  // =========================================
  const handleSendRiskMessage = useCallback(
    async (overrideMessage?: string) => {
      const msg = overrideMessage ?? riskInput.trim();
      if (!msg || isRiskSending) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: msg,
        timestamp: new Date(),
      };
      setRiskMessages((prev) => [...prev, userMsg]);
      setRiskInput('');
      setIsRiskSending(true);
      setError(null);

      try {
        const response = await aiApi.chatWithAiRisk({
          sessionId: sessionId.current,
          userMessage: msg,
          currentSrsContent: latestSrsContent ?? '',
          // Gửi kèm toàn bộ lịch sử chat để AI nhớ đã đề xuất Option 1/2 với con số gì
          chatHistory: riskMessages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        });

        const aiMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: response.aiMessage || '',
          timestamp: new Date(),
          questions: response.questions,
        };
        setRiskMessages((prev) => [...prev, aiMsg]);

        if (response.srsContent) setLatestSrsContent(response.srsContent);
        if (response.currentSrsUrl) setLatestSrsUrl(response.currentSrsUrl);
        if (response.exactBudgetVnd) setExactBudgetVnd(response.exactBudgetVnd);
        if (response.durationMonths) setDurationMonths(response.durationMonths);

        // Risk prompt returns FINALIZED after the client accepts the final SRS.
        if (response.status === 'FINALIZED') {
          setPageState('completed');
        }
      } catch (err) {
        console.error('Risk send error:', err);
        setError('Gửi tin nhắn thất bại. Vui lòng thử lại.');
      } finally {
        setIsRiskSending(false);
      }
    },
    // QUAN TRỌNG: phải có riskMessages trong deps, nếu không callback bị stale
    // closure, chatHistory gửi lên AI sẽ rỗng/thiếu tin AI đã đề xuất option
    // => AI không nhớ con số mình từng đề nghị => trả về "giữ nguyên" sai lầm.
    [riskInput, isRiskSending, latestSrsContent, riskMessages]
  );

  // =========================================
  // Hoàn thành → sang PostProjectPage với SRS URL
  // =========================================
  const handleRequestSrsRevision = useCallback(() => {
    setPageState('ba-chat');
    setBaInput('Tôi muốn chỉnh sửa tài liệu SRS. ');
  }, []);

  const handleContinueToRisk = useCallback(() => {
    if (!latestSrsContent) {
      setError('Chưa có nội dung SRS để chuyển sang bước đánh giá rủi ro.');
      return;
    }
    setPageState('risk-chat');
    handleStartRiskChat(latestSrsContent);
  }, [handleStartRiskChat, latestSrsContent]);

  const handleComplete = useCallback(() => {
    navigate(PATH_CLIENT_CONFIRM_PROJECT, {
      state: {
        srsDocumentUrl: latestSrsUrl ?? '',
        srsContent: latestSrsContent ?? '',
        exactBudgetVnd: exactBudgetVnd,
        durationMonths: durationMonths,
        fromAiBrief: true,
      },
    });
  }, [navigate, latestSrsUrl, latestSrsContent, exactBudgetVnd, durationMonths]);

  const handleSkip = useCallback(() => {
    navigate(PATH_CLIENT_POST_PROJECT);
  }, [navigate]);

  // =========================================
  // Keyboard handler cho chat input
  // =========================================
  const handleBaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendBaMessage();
    }
  };

  const handleRiskKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendRiskMessage();
    }
  };

  // =========================================
  // Render
  // =========================================
  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans flex flex-col">
      <ClientDashboardHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 flex flex-col">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-6">
          {(['answering-base', 'ba-chat', 'srs-review', 'risk-chat', 'completed'] as const).map(
            (step, idx) => {
              const stepLabels = [
                'Câu hỏi khởi động',
                'Phân tích BA',
                'Duyệt SRS',
                'Đánh giá rủi ro',
                'Hoàn thành',
              ];
              const stepOrder = [
                'answering-base',
                'ba-chat',
                'srs-review',
                'risk-chat',
                'completed',
              ];
              const currentIndex = stepOrder.indexOf(pageState);
              const stepIndex = stepOrder.indexOf(step);
              const isActive =
                pageState === step ||
                (pageState === 'loading-questions' && step === 'answering-base');
              const isDone = currentIndex > stepIndex;
              return (
                <div key={step} className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-all ${
                      isDone
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold truncate hidden sm:block ${
                      isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {stepLabels[idx]}
                  </span>
                  {idx < stepOrder.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-200 hidden sm:block" />
                  )}
                </div>
              );
            }
          )}
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden flex-1">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-md">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">
                  {pageState === 'loading-questions' && 'Đang tải câu hỏi...'}
                  {pageState === 'answering-base' && 'Câu hỏi khởi động'}
                  {pageState === 'ba-chat' && 'AI Business Analyst'}
                  {pageState === 'srs-review' && 'Duyệt tài liệu SRS'}
                  {pageState === 'risk-chat' && 'AI Risk Assessor'}
                  {pageState === 'completed' && 'Phân tích hoàn tất!'}
                </h1>
                <p className="text-xs text-gray-500">
                  {pageState === 'answering-base' && 'Trả lời để AI hiểu rõ hơn về dự án của bạn'}
                  {pageState === 'ba-chat' && 'Mô tả chi tiết yêu cầu – AI sẽ sinh tài liệu SRS'}
                  {pageState === 'srs-review' && 'Kiểm tra SRS nháp trước khi đánh giá rủi ro'}
                  {pageState === 'risk-chat' && 'AI đánh giá rủi ro & đề xuất ngân sách, thời hạn'}
                  {pageState === 'completed' && 'SRS đã được tạo, sẵn sàng đăng dự án'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 font-medium cursor-pointer bg-transparent border-0 underline underline-offset-2"
              >
                Bỏ qua
              </button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* === PHASE: Loading === */}
          {pageState === 'loading-questions' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center animate-pulse">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">Đang kết nối với SAM AI...</p>
            </div>
          )}

          {/* === PHASE: Answering base questions === */}
          {pageState === 'answering-base' && (
            <div className="flex-1 overflow-y-auto p-6">
              {baseQuestions.length === 0 && !error ? (
                <div className="text-center text-sm text-gray-400 py-8">
                  Không có câu hỏi khởi động.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {baseQuestions.map((q) => (
                    <BaseQuestionCard
                      key={q.id}
                      question={q}
                      selectedOptions={baseAnswers[q.id]?.selectedOptions ?? []}
                      onToggleOption={(opt) => handleToggleOption(q.id, opt)}
                      onCustomInput={(text) => handleCustomInput(q.id, text)}
                      customInput={baseAnswers[q.id]?.customInput ?? ''}
                    />
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-sm text-gray-400 hover:text-gray-600 font-medium cursor-pointer bg-transparent border-0"
                >
                  Bỏ qua, tự nhập
                </button>
                <button
                  type="button"
                  onClick={handleStartBaChat}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-8 py-3 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg transition-all cursor-pointer border-0 flex items-center gap-2"
                >
                  Bắt đầu phân tích
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* === PHASE: BA Chat === */}
          {pageState === 'ba-chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* SRS URL badge */}
              {latestSrsUrl && (
                <div className="mx-6 mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-xs text-green-700 font-medium">
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Tài liệu SRS đã được tạo
                  <a
                    href={latestSrsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-green-800 ml-1"
                  >
                    Xem file
                  </a>
                </div>
              )}

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {baMessages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    onSubmitAnswers={(summary) => handleSendBaMessage(summary)}
                    isSending={isBaSending}
                  />
                ))}
                {isBaSending && <TypingIndicator />}
                <div ref={chatBottomRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-gray-100 px-4 py-3">
                <div className="flex gap-3 items-end">
                  <textarea
                    value={baInput}
                    onChange={(e) => setBaInput(e.target.value)}
                    onKeyDown={handleBaKeyDown}
                    placeholder="Nhập mô tả yêu cầu dự án... (Enter để gửi, Shift+Enter xuống dòng)"
                    rows={2}
                    disabled={isBaSending}
                    className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-gray-700 placeholder:text-gray-400 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendBaMessage()}
                    disabled={isBaSending || !baInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all cursor-pointer border-0 shadow-md shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">
                  AI sẽ tự động chuyển sang đánh giá rủi ro khi tài liệu SRS hoàn chỉnh.
                </p>
              </div>
            </div>
          )}

          {/* === PHASE: Review generated SRS before starting risk assessment === */}
          {pageState === 'srs-review' && (
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="text-lg leading-none">✨</div>
                  <div>
                    <h2 className="text-sm font-bold text-blue-900">SRS nháp đã sẵn sàng</h2>
                    <p className="text-xs leading-5 text-blue-700 mt-0.5">
                      Hãy đọc lại phạm vi, tính năng, ngân sách và thời hạn. Bạn có thể yêu cầu AI
                      chỉnh sửa trước khi chuyển qua phần đánh giá rủi ro.
                    </p>
                  </div>
                </div>

                <SrsPreview
                  srsContent={latestSrsContent}
                  variant="full"
                  onOpenModal={() => setIsSrsModalOpen(true)}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleRequestSrsRevision}
                    className="text-sm font-semibold text-gray-600 hover:text-blue-700 px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer bg-white"
                  >
                    ← Yêu cầu chỉnh sửa SRS
                  </button>
                  <button
                    type="button"
                    onClick={handleContinueToRisk}
                    disabled={!latestSrsContent}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md shadow-amber-200 transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    SRS ổn, đánh giá rủi ro
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* === PHASE: Risk Chat === */}
          {pageState === 'risk-chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="mx-6 mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-semibold flex-1">
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                  Giai đoạn đánh giá rủi ro – AI đề xuất ngân sách &amp; thời hạn
                </div>
                <button
                  type="button"
                  onClick={() => setIsSrsModalOpen(true)}
                  className="lg:hidden shrink-0 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-600 hover:bg-blue-100 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Xem SRS
                </button>
              </div>

              {/* Messages + live SRS preview */}
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-4 px-6 py-4 overflow-y-auto">
                <div className="min-w-0">
                  {riskMessages.map((msg) => (
                    <ChatBubble
                      key={msg.id}
                      message={msg}
                      onSubmitAnswers={(summary) => handleSendRiskMessage(summary)}
                      isSending={isRiskSending}
                    />
                  ))}
                  {isRiskSending && <TypingIndicator />}
                  <div ref={chatBottomRef} />
                </div>
                <aside className="hidden lg:block sticky top-0 self-start">
                  <SrsPreview
                    srsContent={latestSrsContent}
                    variant="compact"
                    onOpenModal={() => setIsSrsModalOpen(true)}
                  />
                </aside>
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 px-4 py-3">
                <div className="flex gap-3 items-end">
                  <textarea
                    value={riskInput}
                    onChange={(e) => setRiskInput(e.target.value)}
                    onKeyDown={handleRiskKeyDown}
                    placeholder="Nhập câu hỏi về rủi ro, ngân sách, thời hạn..."
                    rows={2}
                    disabled={isRiskSending}
                    className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 text-gray-700 placeholder:text-gray-400 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendRiskMessage()}
                    disabled={isRiskSending || !riskInput.trim()}
                    className="bg-amber-500 hover:bg-amber-600 text-white p-2.5 rounded-xl transition-all cursor-pointer border-0 shadow-md shadow-amber-100 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">
                  Khi AI xác nhận hoàn tất đánh giá, bạn có thể tiến hành đăng dự án.
                </p>
              </div>
            </div>
          )}

          {/* === PHASE: Completed === */}
          {pageState === 'completed' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Phân tích hoàn tất!</h2>
                <p className="text-sm text-gray-500 max-w-sm">
                  Tài liệu SRS và đánh giá rủi ro đã được AI tạo xong. Bạn có thể tiến hành đăng dự
                  án.
                </p>
              </div>

              {latestSrsContent && (
                <button
                  type="button"
                  onClick={() => setIsSrsModalOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer bg-transparent border-0 flex items-center gap-2 underline underline-offset-2"
                >
                  📄 Xem tài liệu SRS đã tạo
                </button>
              )}

              <button
                type="button"
                onClick={handleComplete}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-10 py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all cursor-pointer border-0 flex items-center gap-2"
              >
                Đăng dự án ngay
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* SRS Full Screen Modal */}
      <SrsModal
        isOpen={isSrsModalOpen}
        onClose={() => setIsSrsModalOpen(false)}
        srsContent={latestSrsContent}
      />
    </div>
  );
};

export default AIBriefPage;
