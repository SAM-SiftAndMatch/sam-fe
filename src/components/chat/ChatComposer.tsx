import { ImagePlus, Paperclip, Send, X } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import {
  CHAT_FILE_ACCEPT,
  CHAT_LIMITS_LABEL,
  chatFileSize,
  isChatImage,
  validateChatFiles,
} from '../../lib/chat-attachments';
import { enqueueChatMessage } from '../../lib/chat-outbox';
import type { WorkspaceContext } from '../../pages/WorkspaceLayout';
import { useAuthStore } from '../../stores/useAuthStore';

type SelectedFile = { id: string; file: File; preview?: string };
export default memo(function ChatComposer({
  roomId,
  getDraft,
  saveDraft,
  sendMessage,
}: Pick<WorkspaceContext, 'getDraft' | 'saveDraft' | 'sendMessage'> & { roomId: string }) {
  const [input, setInput] = useState(getDraft);
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const userId = useAuthStore((state) => state.user?.userId) ?? '';
  const fileInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const filesRef = useRef<SelectedFile[]>([]);

  useEffect(() => {
    return () => {
      for (const item of filesRef.current) if (item.preview) URL.revokeObjectURL(item.preview);
    };
  }, []);

  const choose = (files: FileList | null) => {
    if (!files) return;
    const nextFiles = [...filesRef.current.map((item) => item.file), ...Array.from(files)];
    const validation = validateChatFiles(nextFiles);
    if (validation) {
      setError(validation);
      return;
    }
    const added = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview:
        isChatImage(file) || file.type.startsWith('video/') ? URL.createObjectURL(file) : undefined,
    }));
    const next = [...filesRef.current, ...added];
    filesRef.current = next;
    setSelected(next);
    setError(null);
  };
  const remove = (id: string) => {
    const item = filesRef.current.find((file) => file.id === id);
    if (item?.preview) URL.revokeObjectURL(item.preview);
    const next = filesRef.current.filter((file) => file.id !== id);
    filesRef.current = next;
    setSelected(next);
  };
  const send = () => {
    const content = input.trim();
    if (!userId || (!content && !filesRef.current.length)) return;
    const validation = validateChatFiles(filesRef.current.map((item) => item.file));
    if (validation) {
      setError(validation);
      return;
    }
    enqueueChatMessage({
      roomId,
      userId,
      content,
      files: filesRef.current.map((item) => item.file),
      send: sendMessage,
    });
    for (const item of filesRef.current) if (item.preview) URL.revokeObjectURL(item.preview);
    filesRef.current = [];
    setSelected([]);
    setInput('');
    saveDraft('');
    setError(null);
  };
  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:px-6 sm:py-4">
      {error && (
        <p role="alert" className="mb-2 text-xs text-red-600">
          {error}
        </p>
      )}
      <div className="rounded-3xl border border-slate-300 bg-white p-2 focus-within:border-[#1D4ED8]">
        {selected.length > 0 && (
          <div className="flex gap-3 overflow-x-auto px-3 pb-2 pt-2">
            {selected.map((item) => (
              <div
                key={item.id}
                className={`relative w-32 shrink-0 overflow-hidden rounded-xl ${item.preview ? '' : 'border border-slate-200 bg-slate-50 p-2'}`}
              >
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Bỏ ${item.file.name}`}
                  className="absolute right-1 top-1 z-10 rounded-full bg-white p-1 text-slate-600 shadow-none disabled:opacity-40"
                >
                  <X size={14} />
                </button>
                {item.preview ? (
                  item.file.type.startsWith('video/') ? (
                    <video
                      src={item.preview}
                      controls
                      playsInline
                      preload="metadata"
                      className="h-24 w-full object-cover"
                    >
                      <track kind="captions" />
                    </video>
                  ) : (
                    <img
                      src={item.preview}
                      alt="Ảnh chờ gửi"
                      className="h-24 w-full object-cover"
                    />
                  )
                ) : (
                  <>
                    <Paperclip className="mx-auto my-4 text-blue-600" size={24} />
                    <p
                      className="mt-2 truncate text-xs font-medium text-slate-700"
                      title={item.file.name}
                    >
                      {item.file.name}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {chatFileSize(item.file.size)}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 px-1 pb-1 pt-1 sm:px-3">
          <input
            ref={imageInput}
            hidden
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            multiple
            onChange={(event) => {
              choose(event.target.files);
              event.target.value = '';
            }}
          />
          <input
            ref={fileInput}
            hidden
            type="file"
            accept={CHAT_FILE_ACCEPT}
            multiple
            onChange={(event) => {
              choose(event.target.files);
              event.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => imageInput.current?.click()}
            aria-label="Gửi hình ảnh"
            title="Chọn ảnh, tối đa 5MB/ảnh"
            className="shrink-0 rounded-full p-2 text-blue-700 hover:bg-blue-50 disabled:opacity-40"
          >
            <ImagePlus size={20} />
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            aria-label="Đính kèm file"
            title="Chọn tệp hoặc video"
            className="shrink-0 rounded-full p-2 text-blue-700 hover:bg-blue-50 disabled:opacity-40"
          >
            <Paperclip size={20} />
          </button>
          <textarea
            rows={1}
            maxLength={8000}
            aria-label="Nhập nội dung tin nhắn"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              saveDraft(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void send();
              }
            }}
            onPaste={(event) => {
              const files = event.clipboardData.files;
              if (files.length) {
                event.preventDefault();
                choose(files);
              }
            }}
            className="max-h-36 min-w-0 flex-1 resize-y border-0 bg-transparent py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:ring-0"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!input.trim() && !selected.length}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[#1D4ED8] text-white shadow-none transition-colors hover:bg-blue-800 disabled:opacity-50"
            aria-label="Gửi tin nhắn"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      <p aria-live="polite" className="mt-2 px-2 text-[10px] text-slate-400">
        {CHAT_LIMITS_LABEL}
      </p>
    </div>
  );
});
