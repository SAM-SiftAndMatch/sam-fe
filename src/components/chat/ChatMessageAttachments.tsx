import { useQuery } from '@tanstack/react-query';
import { Download, FileText, LoaderCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type ChatAttachment, chatApi } from '../../api/chat';
import { chatFileSize } from '../../lib/chat-attachments';

function Preview({
  url,
  attachment,
  onClose,
}: { url: string; attachment: ChatAttachment; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const image = attachment.contentType.startsWith('image/');
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      aria-modal="true"
      aria-label={image ? 'Xem ảnh' : attachment.fileName}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (!ref.current?.open) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[95dvh] w-[95vw] max-w-5xl overflow-hidden rounded-2xl border-0 bg-slate-950 p-0 text-white shadow-none backdrop:bg-black/70"
    >
      <div className="flex items-center justify-end gap-3 p-4">
        {!image && <p className="mr-auto truncate text-sm">{attachment.fileName}</p>}
        <a
          href={url}
          download={attachment.fileName}
          aria-label={image ? 'Tải ảnh về' : 'Tải file về'}
          title="Tải xuống"
          className="inline-flex items-center justify-center rounded-none border-0 bg-transparent p-2 text-white shadow-none outline-none ring-0 transition-colors hover:text-white/70 focus-visible:text-sky-300 focus-visible:outline-none focus-visible:ring-0"
        >
          <Download size={20} />
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng xem trước"
          className="rounded-full p-2 hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </div>
      {image ? (
        <img
          src={url}
          alt="Ảnh trong cuộc trò chuyện"
          className="mx-auto max-h-[80dvh] max-w-full object-contain"
        />
      ) : (
        <iframe src={url} title={attachment.fileName} className="h-[75dvh] w-full bg-white" />
      )}
    </dialog>,
    document.body
  );
}

export function ChatAttachmentItem({
  roomId,
  readerId,
  attachment,
  onImageLoad,
  thumbnail = false,
}: {
  roomId: string;
  readerId: string;
  attachment: ChatAttachment;
  onImageLoad?: () => void;
  thumbnail?: boolean;
}) {
  const image = attachment.contentType.startsWith('image/');
  const pdf = attachment.contentType === 'application/pdf';
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ['chat-attachment', readerId, roomId, attachment.id],
    queryFn: ({ signal }) => chatApi.getAttachmentBlob(roomId, attachment.id, signal),
    enabled: image && visible,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 0,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (!image || !container.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [image]);
  useEffect(() => {
    if (!query.data) return;
    const objectUrl = URL.createObjectURL(new Blob([query.data], { type: attachment.contentType }));
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [query.data, attachment.contentType]);
  const download = async () => {
    const blob = query.data ?? (await query.refetch()).data;
    if (!blob) return;
    const linkUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = linkUrl;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(linkUrl), 5000);
  };
  const open = async () => {
    if (!image && !pdf) {
      await download();
      return;
    }
    if (query.data || (await query.refetch()).data) setPreview(true);
  };
  return (
    <div
      ref={container}
      className={`min-w-0 max-w-full overflow-hidden text-slate-800 ${image ? (thumbnail ? 'w-full' : 'w-fit') : 'w-full rounded-xl border border-slate-200'}`}
    >
      {image && (
        <button
          type="button"
          onClick={() => void open()}
          disabled={!url || query.isFetching}
          aria-label="Xem ảnh"
          className={`block max-w-full overflow-hidden rounded-2xl bg-transparent text-center ${thumbnail ? 'w-full' : ''}`}
        >
          {url ? (
            <img
              src={url}
              alt="Ảnh trong cuộc trò chuyện"
              loading="lazy"
              onLoad={onImageLoad}
              className={
                thumbnail
                  ? 'block h-24 w-full rounded-xl object-cover'
                  : 'block max-h-72 max-w-full rounded-2xl object-contain'
              }
            />
          ) : (
            <span className="block p-6 text-xs text-slate-500">
              {query.isError ? 'Chưa tải được ảnh' : 'Đang tải ảnh...'}
            </span>
          )}
        </button>
      )}
      {!image && (
        <div className="flex items-center gap-3 p-3">
          <FileText size={24} className="shrink-0 text-blue-600" />
          <button
            type="button"
            disabled={query.isFetching}
            onClick={() => void open()}
            className="min-w-0 flex-1 text-left"
            title={attachment.fileName}
          >
            <span className="block truncate text-xs font-semibold">{attachment.fileName}</span>
            <span className="mt-1 block text-[10px] text-slate-500">
              {chatFileSize(attachment.sizeBytes)} · {pdf ? 'Xem trước' : 'Tải file'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => void download()}
            disabled={query.isFetching}
            aria-label={`Tải ${attachment.fileName}`}
            className="shrink-0 rounded-lg p-2 text-blue-700 hover:bg-blue-50 disabled:opacity-40"
          >
            {query.isFetching ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
          </button>
        </div>
      )}
      {query.isError && (
        <p role="alert" className="px-3 pb-3 text-xs text-red-600">
          Không tải được tệp.{' '}
          <button type="button" onClick={() => void query.refetch()} className="underline">
            Thử lại
          </button>
        </p>
      )}
      {preview && url && (
        <Preview url={url} attachment={attachment} onClose={() => setPreview(false)} />
      )}
    </div>
  );
}
export default function ChatMessageAttachments({
  roomId,
  readerId,
  attachments,
  alignEnd = false,
  onImageLoad,
}: {
  roomId: string;
  readerId: string;
  attachments: ChatAttachment[];
  alignEnd?: boolean;
  onImageLoad?: () => void;
}) {
  return (
    <div
      className={`grid w-72 min-w-0 max-w-full gap-2 sm:w-80 ${alignEnd ? 'justify-items-end' : 'justify-items-start'}`}
    >
      {attachments.map((attachment) => (
        <ChatAttachmentItem
          key={attachment.id}
          roomId={roomId}
          readerId={readerId}
          attachment={attachment}
          onImageLoad={onImageLoad}
        />
      ))}
    </div>
  );
}
