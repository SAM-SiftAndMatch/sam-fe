import { ImagePlus, LoaderCircle, Paperclip, Send, X } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { type ChatAttachment, chatApi } from '../../api/chat';
import { extractApiResponse, getApiErrorMessage } from '../../lib/api-error';
import {
  CHAT_FILE_ACCEPT,
  CHAT_LIMITS_LABEL,
  chatFileSize,
  isChatImage,
  validateChatFiles,
} from '../../lib/chat-attachments';
import type { WorkspaceContext } from '../../pages/WorkspaceLayout';

type SelectedFile = { id: string; file: File; preview?: string; uploaded?: ChatAttachment };
export default memo(function ChatComposer({
  roomId,
  getDraft,
  saveDraft,
  sendMessage,
}: Pick<WorkspaceContext, 'getDraft' | 'saveDraft' | 'sendMessage'> & { roomId: string }) {
  const [input, setInput] = useState(getDraft);
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const filesRef = useRef<SelectedFile[]>([]);
  const busy = useRef(false);
  const requestId = useRef<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      controller.current?.abort();
      for (const item of filesRef.current) if (item.preview) URL.revokeObjectURL(item.preview);
    };
  }, []);

  const invalidateAttempt = () => {
    // An edited draft is a new send. The previous request may already have committed
    // despite a lost response, so do not reuse its single-use attachment IDs.
    if (requestId.current) for (const item of filesRef.current) item.uploaded = undefined;
    requestId.current = null;
  };

  const choose = (files: FileList | null) => {
    if (!files || busy.current) return;
    const nextFiles = [...filesRef.current.map((item) => item.file), ...Array.from(files)];
    const validation = validateChatFiles(nextFiles);
    if (validation) {
      setError(validation);
      return;
    }
    const added = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: isChatImage(file) ? URL.createObjectURL(file) : undefined,
    }));
    const next = [...filesRef.current, ...added];
    filesRef.current = next;
    setSelected(next);
    invalidateAttempt();
    setError(null);
  };
  const remove = (id: string) => {
    if (busy.current) return;
    const item = filesRef.current.find((file) => file.id === id);
    if (item?.preview) URL.revokeObjectURL(item.preview);
    const next = filesRef.current.filter((file) => file.id !== id);
    filesRef.current = next;
    setSelected(next);
    invalidateAttempt();
  };
  const send = async () => {
    const content = input.trim();
    if (busy.current || (!content && !filesRef.current.length)) return;
    const validation = validateChatFiles(filesRef.current.map((item) => item.file));
    if (validation) {
      setError(validation);
      return;
    }
    busy.current = true;
    setSending(true);
    setError(null);
    controller.current = new AbortController();
    requestId.current ??= crypto.randomUUID();
    try {
      for (const [index, item] of filesRef.current.entries()) {
        if (!item.uploaded) {
          setProgress(`Đang tải tệp ${index + 1}/${filesRef.current.length}...`);
          item.uploaded = await chatApi.uploadAttachment(
            roomId,
            item.file,
            controller.current.signal
          );
          if (!active.current) return;
        }
      }
      setProgress('Đang gửi...');
      await sendMessage({
        content,
        attachmentIds: filesRef.current.map((item) => item.uploaded!.id),
        clientMessageId: requestId.current,
      });
      if (!active.current) return;
      for (const item of filesRef.current) if (item.preview) URL.revokeObjectURL(item.preview);
      filesRef.current = [];
      setSelected([]);
      setInput('');
      saveDraft('');
      requestId.current = null;
    } catch (failure) {
      if (active.current)
        setError(
          getApiErrorMessage(
            extractApiResponse(failure),
            failure instanceof Error
              ? failure.message
              : 'Không gửi được tin nhắn. Nội dung và tệp đã được giữ lại để bạn thử lại.'
          )
        );
    } finally {
      busy.current = false;
      if (active.current) {
        setSending(false);
        setProgress('');
      }
    }
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
                  disabled={sending}
                  onClick={() => remove(item.id)}
                  aria-label={item.preview ? 'Bỏ ảnh' : `Bỏ ${item.file.name}`}
                  className="absolute right-1 top-1 z-10 rounded-full bg-white p-1 text-slate-600 shadow-none disabled:opacity-40"
                >
                  <X size={14} />
                </button>
                {item.preview ? (
                  <img src={item.preview} alt="Ảnh chờ gửi" className="h-24 w-full object-cover" />
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
            disabled={sending}
            onClick={() => imageInput.current?.click()}
            aria-label="Gửi hình ảnh"
            title="Chọn ảnh, tối đa 5MB/ảnh"
            className="shrink-0 rounded-full p-2 text-blue-700 hover:bg-blue-50 disabled:opacity-40"
          >
            <ImagePlus size={20} />
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={() => fileInput.current?.click()}
            aria-label="Đính kèm file"
            title="Chọn file, tối đa 10MB/file"
            className="shrink-0 rounded-full p-2 text-blue-700 hover:bg-blue-50 disabled:opacity-40"
          >
            <Paperclip size={20} />
          </button>
          <textarea
            rows={1}
            maxLength={8000}
            disabled={sending}
            aria-label="Nhập nội dung tin nhắn"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              saveDraft(event.target.value);
              invalidateAttempt();
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
            disabled={sending || (!input.trim() && !selected.length)}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[#1D4ED8] text-white shadow-none transition-colors hover:bg-blue-800 disabled:opacity-50"
            aria-label="Gửi tin nhắn"
          >
            {sending ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
      <p aria-live="polite" className="mt-2 px-2 text-[10px] text-slate-400">
        {sending ? progress : CHAT_LIMITS_LABEL}
      </p>
    </div>
  );
});
