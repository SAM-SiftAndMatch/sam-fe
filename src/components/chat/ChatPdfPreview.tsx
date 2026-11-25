import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useEffect, useRef, useState } from 'react';

export default function ChatPdfPreview({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [renderedPage, setRenderedPage] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let closed = false;
    let task: PDFDocumentLoadingTask | undefined;
    async function load() {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      if (closed) return;
      GlobalWorkerOptions.workerSrc = workerUrl;
      const assets = `${import.meta.env.BASE_URL}pdfjs/`;
      task = getDocument({
        url,
        cMapUrl: `${assets}cmaps/`,
        standardFontDataUrl: `${assets}standard_fonts/`,
        wasmUrl: `${assets}wasm/`,
        iccUrl: `${assets}iccs/`,
      });
      const document = await task.promise;
      if (!closed) setPdf(document);
    }
    load().catch(() => {
      if (!closed) setFailed(true);
    });
    return () => {
      closed = true;
      void task?.destroy();
    };
  }, [url]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let closed = false;
    let task: RenderTask | undefined;
    pdf
      .getPage(pageNumber)
      .then(async (page) => {
        if (closed) return;
        const { width, height } = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.min(2, 2048 / width, 4096 / height) });
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        task = page.render({ canvas, viewport });
        await task.promise;
        if (!closed) setRenderedPage(pageNumber);
      })
      .catch(() => {
        if (!closed) setFailed(true);
      });
    return () => {
      closed = true;
      task?.cancel();
    };
  }, [pdf, pageNumber]);

  function changePage(page: number) {
    setFailed(false);
    setPageNumber(page);
  }

  return (
    <div className="flex h-[75dvh] flex-col bg-slate-800">
      {pdf && pdf.numPages > 1 && (
        <div className="flex items-center justify-center gap-4 p-2 text-sm">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => changePage(pageNumber - 1)}
            className="disabled:opacity-40"
          >
            Trang trước
          </button>
          <span>
            Trang {pageNumber} / {pdf.numPages}
          </span>
          <button
            type="button"
            disabled={pageNumber >= pdf.numPages}
            onClick={() => changePage(pageNumber + 1)}
            className="disabled:opacity-40"
          >
            Trang sau
          </button>
        </div>
      )}
      <div key={pageNumber} className="overflow-auto">
        {failed ? (
          <p role="alert" className="p-4">
            Không xem trước được PDF này. Bạn có thể tải tệp về để mở.
          </p>
        ) : (
          <>
            {renderedPage !== pageNumber && <output className="block p-4">Đang mở PDF…</output>}
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Trang ${pageNumber} của PDF`}
              className="mx-auto h-auto max-w-full"
              hidden={renderedPage !== pageNumber}
            />
          </>
        )}
      </div>
    </div>
  );
}
