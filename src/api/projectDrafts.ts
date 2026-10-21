import { requireApiResult } from '../lib/api-error';
import apiClient from '../lib/axios';
import type { ApiResponse, PageResult } from '../types/api';
import type { JobCreateRequest, JobResponse } from '../types/job';
import type {
  DraftFlow,
  DraftPhase,
  ProjectDraft,
  ProjectDraftSummary,
  ProjectDraftTurn,
} from '../types/projectDraft';

const root = '/project-drafts';
const revisions = new Map<string, number>();
const saveQueues = new Map<string, Promise<unknown>>();
type DraftPatch = {
  title?: string;
  brief?: string;
  phase?: DraftPhase;
  state?: Record<string, unknown>;
  srsDocumentUrl?: string;
};

const backupKey = (id: string) => `sam:project-draft:${id}`;

function readBackup(id: string): DraftPatch | null {
  try {
    const value = window.localStorage.getItem(backupKey(id));
    return value ? (JSON.parse(value) as DraftPatch) : null;
  } catch {
    return null;
  }
}

function writeBackup(id: string, data: DraftPatch) {
  try {
    window.localStorage.setItem(backupKey(id), JSON.stringify(data));
  } catch {
    // The backend remains the durable store if browser storage is unavailable.
  }
}

function clearSavedBackup(id: string, data: DraftPatch) {
  try {
    if (window.localStorage.getItem(backupKey(id)) === JSON.stringify(data)) {
      window.localStorage.removeItem(backupKey(id));
    }
  } catch {
    // Ignore storage errors after a successful server save.
  }
}

function remember(draft: ProjectDraft): ProjectDraft {
  revisions.set(draft.id, Math.max(revisions.get(draft.id) ?? 0, draft.editRevision));
  const backup = draft.status === 'EDITING' ? readBackup(draft.id) : null;
  return backup ? { ...draft, ...backup, state: { ...draft.state, ...backup.state } } : draft;
}

export const projectDraftApi = {
  backup: writeBackup,
  create: async (data: {
    flowType: DraftFlow;
    title?: string;
    brief?: string;
  }): Promise<ProjectDraft> =>
    remember(
      requireApiResult(
        (await apiClient.post<ApiResponse<ProjectDraft>>(root, data)).data,
        'Không tạo được bản nháp'
      )
    ),
  get: async (id: string): Promise<ProjectDraft> =>
    remember(
      requireApiResult(
        (await apiClient.get<ApiResponse<ProjectDraft>>(`${root}/${id}`)).data,
        'Không tải được bản nháp'
      )
    ),
  page: async (page = 0, size = 10): Promise<PageResult<ProjectDraftSummary>> =>
    requireApiResult(
      (
        await apiClient.get<ApiResponse<PageResult<ProjectDraftSummary>>>(`${root}/page`, {
          params: { page, size },
        })
      ).data,
      'Không tải được bản nháp'
    ),
  update: async (id: string, data: DraftPatch): Promise<void> => {
    writeBackup(id, data);
    const previous = saveQueues.get(id) ?? Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(async () => {
        const expectedRevision = revisions.get(id);
        if (expectedRevision == null) throw new Error('Chưa tải bản nháp trước khi lưu');
        const saved = requireApiResult(
          (
            await apiClient.patch<ApiResponse<{ editRevision: number }>>(`${root}/${id}`, {
              ...data,
              expectedRevision,
            })
          ).data,
          'Không lưu được bản nháp'
        );
        revisions.set(id, saved.editRevision);
        clearSavedBackup(id, data);
      });
    saveQueues.set(id, next);
    try {
      await next;
    } finally {
      if (saveQueues.get(id) === next) saveQueues.delete(id);
    }
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${root}/${id}`);
    try {
      window.localStorage.removeItem(backupKey(id));
    } catch {
      /* Storage unavailable. */
    }
  },
  sendTurn: async (
    id: string,
    data: { clientMessageId: string; phase: 'BA' | 'RISK'; userMessage: string }
  ): Promise<ProjectDraftTurn> =>
    requireApiResult(
      (await apiClient.post<ApiResponse<ProjectDraftTurn>>(`${root}/${id}/ai-turns`, data)).data,
      'Không gửi được tin nhắn AI'
    ),
  publish: async (id: string, data: JobCreateRequest): Promise<JobResponse> => {
    const job = requireApiResult(
      (await apiClient.post<ApiResponse<JobResponse>>(`${root}/${id}/publish`, data)).data,
      'Không đăng được dự án'
    );
    try {
      window.localStorage.removeItem(backupKey(id));
    } catch {
      /* Storage unavailable. */
    }
    return job;
  },
};
