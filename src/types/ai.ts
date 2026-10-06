// Khớp BE: AiQuestion.java
export interface AiQuestion {
  id: string;
  type: string;
  questionText: string;
  options: string[] | null;
  allowCustomInput: boolean | null;
  hint: string | null;
}

// Khớp BE: AiChatRequest.java
export interface AiChatRequest {
  sessionId: string;
  userMessage: string;
  currentSrsContent?: string | null;
  /** Toàn bộ lịch sử hội thoại risk-chat (role: "user"|"assistant", content) để AI nhớ ngữ cảnh */
  chatHistory?: { role: string; content: string }[] | null;
}

// Khớp BE: AiChatResponse.java
export type AiChatStatus = 'ASKING' | 'GENERATING' | 'COMPLETED' | 'NEGOTIATING' | 'FINALIZED';

export interface AiChatResponse {
  status: AiChatStatus;
  aiMessage: string;
  questions: AiQuestion[] | null;
  srsContent: string | null;
  currentSrsUrl: string | null;
  riskLevel: string | null;
  // Exact values populated when status = COMPLETED
  exactBudgetVnd: number | null;
  durationMonths: number | null;
}

// Dạng tin nhắn hiển thị trong UI chat
export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  /** Chỉ có ở tin nhắn của AI khi trả về câu hỏi follow-up */
  questions?: AiQuestion[] | null;
}
