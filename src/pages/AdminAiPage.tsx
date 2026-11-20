import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  EyeOff,
  FlaskConical,
  Info,
  KeyRound,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { type AiKeyItem, type AiModelItem, type AiTestResult, adminAiApi } from '../api/adminAi';
import { AdminCard, AdminError, AdminLoading, AdminPageHeader } from '../components/admin/AdminUI';
import {
  Field,
  Modal,
  Notice,
  inputClass,
  primaryClass,
  secondaryClass,
} from '../components/finance/FinanceUI';
import {
  SUGGESTED_GEMINI_MODELS,
  aiErrorMessage,
  buildPriorityMove,
  formatAiTestTime,
  validateApiKeyInput,
  validateModelNameInput,
  validatePriority,
} from '../lib/admin-ai';
import { useAuthStore } from '../stores/useAuthStore';

interface SessionTestRecord {
  status: 'OK' | 'FAIL';
  statusCode: number | null;
  latencyMs: number;
  message: string;
  testedAt: string;
}

function TestStatusBadge({
  record,
  isTesting,
}: {
  record?: SessionTestRecord;
  isTesting: boolean;
}) {
  if (isTesting) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
        <RefreshCw size={12} className="animate-spin" />
        Đang test...
      </span>
    );
  }

  if (!record) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
        <FlaskConical size={13} />
        Chưa test
      </span>
    );
  }

  const isOk = record.status === 'OK';
  const tone = isOk
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-red-200 bg-red-50 text-red-700';
  const Icon = isOk ? CheckCircle2 : XCircle;
  const label = isOk
    ? `OK · ${record.latencyMs}ms`
    : record.statusCode
      ? `Lỗi · HTTP ${record.statusCode}`
      : 'Lỗi';

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone}`}
        >
          <Icon size={13} />
          {label}
        </span>
        <span className="text-[11px] text-slate-500">{formatAiTestTime(record.testedAt)}</span>
      </div>
      <p
        className={`max-w-md whitespace-normal break-words text-xs leading-5 ${
          isOk ? 'text-slate-600' : 'text-red-700'
        }`}
      >
        {record.message}
      </p>
    </div>
  );
}

function DraftTestBanner({ result }: { result: AiTestResult | null }) {
  if (!result) return null;
  return (
    <output
      className={`block rounded-xl border p-3.5 text-xs leading-5 ${
        result.ok
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
        <span className="inline-flex items-center gap-1.5">
          {result.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {result.ok ? 'Test thành công' : 'Test thất bại'}
          {result.statusCode ? ` (HTTP ${result.statusCode})` : ''}
        </span>
        <span className="font-mono text-[11px]">
          {result.modelUsed} · {result.latencyMs}ms
        </span>
      </div>
      <p className="mt-1.5 whitespace-normal break-words">{result.message}</p>
    </output>
  );
}

export default function AdminAiPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [showRotationDetail, setShowRotationDetail] = useState(false);
  const [selectedTestModel, setSelectedTestModel] = useState('');
  const [selectedTestKeyId, setSelectedTestKeyId] = useState<string>('');
  const [selectedModelIds, setSelectedModelIds] = useState<number[]>([]);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  // Ephemeral test state (resets automatically to "Chưa test" on page reload)
  const [testingModelIds, setTestingModelIds] = useState<number[]>([]);
  const [testingKeyIds, setTestingKeyIds] = useState<number[]>([]);
  const [modelResults, setModelResults] = useState<Record<number, SessionTestRecord>>({});
  const [keyResults, setKeyResults] = useState<Record<number, SessionTestRecord>>({});

  // Key modal state
  const [keyModalMode, setKeyModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingKey, setEditingKey] = useState<AiKeyItem | null>(null);
  const [keyLabel, setKeyLabel] = useState('');
  const [keyRaw, setKeyRaw] = useState('');
  const [showRawKey, setShowRawKey] = useState(false);
  const [keyPriority, setKeyPriority] = useState('100');
  const [keyActive, setKeyActive] = useState(true);
  const [keyFormError, setKeyFormError] = useState('');
  const [keyDraftTest, setKeyDraftTest] = useState<AiTestResult | null>(null);
  const [keyModalBusy, setKeyModalBusy] = useState(false);
  const [keyTestingDraft, setKeyTestingDraft] = useState(false);

  // Model modal state
  const [modelModalMode, setModelModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingModel, setEditingModel] = useState<AiModelItem | null>(null);
  const [modelName, setModelName] = useState('');
  const [modelDisplayName, setModelDisplayName] = useState('');
  const [modelPriority, setModelPriority] = useState('100');
  const [modelActive, setModelActive] = useState(true);
  const [modelFormError, setModelFormError] = useState('');
  const [modelDraftTest, setModelDraftTest] = useState<AiTestResult | null>(null);
  const [modelModalBusy, setModelModalBusy] = useState(false);
  const [modelTestingDraft, setModelTestingDraft] = useState(false);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<{
    kind: 'key' | 'model';
    id: number;
    label: string;
  } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const runtimeQuery = useQuery({
    queryKey: ['admin-ai', user?.userId, 'runtime'],
    queryFn: adminAiApi.runtime,
    enabled: user?.role === 'ADMIN',
  });

  const keysQuery = useQuery({
    queryKey: ['admin-ai', user?.userId, 'keys'],
    queryFn: adminAiApi.listKeys,
    enabled: user?.role === 'ADMIN',
  });

  const modelsQuery = useQuery({
    queryKey: ['admin-ai', user?.userId, 'models'],
    queryFn: adminAiApi.listModels,
    enabled: user?.role === 'ADMIN',
  });

  const refreshAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-ai'] });
  };

  const keys = keysQuery.data ?? [];
  const models = modelsQuery.data ?? [];
  const runtime = runtimeQuery.data;

  // ---------- Selection helpers ----------
  const visibleSelectedIds = selectedModelIds.filter((id) => models.some((m) => m.id === id));
  const allModelsSelected = models.length > 0 && visibleSelectedIds.length === models.length;

  const toggleSelectAllModels = () => {
    if (allModelsSelected) setSelectedModelIds([]);
    else setSelectedModelIds(models.map((m) => m.id));
  };

  const toggleSelectModel = (id: number) => {
    setSelectedModelIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ---------- Key modal handlers ----------

  const closeKeyModal = () => {
    setKeyModalMode(null);
    setEditingKey(null);
    setKeyRaw('');
    setShowRawKey(false);
    setKeyFormError('');
    setKeyDraftTest(null);
  };

  const openCreateKey = () => {
    setKeyModalMode('create');
    setEditingKey(null);
    setKeyLabel('');
    setKeyRaw('');
    setShowRawKey(false);
    setKeyPriority('100');
    setKeyActive(true);
    setKeyFormError('');
    setKeyDraftTest(null);
  };

  const openEditKey = (item: AiKeyItem) => {
    setKeyModalMode('edit');
    setEditingKey(item);
    setKeyLabel(item.label || '');
    setKeyRaw('');
    setShowRawKey(false);
    setKeyPriority(String(item.priority));
    setKeyActive(item.active);
    setKeyFormError('');
    setKeyDraftTest(null);
  };

  const handleTestDraftKey = async () => {
    if (keyTestingDraft || keyModalBusy) return;
    const keyErr = validateApiKeyInput(keyRaw);
    if (keyErr) {
      setKeyFormError(keyErr);
      return;
    }
    setKeyFormError('');
    setKeyTestingDraft(true);
    try {
      const res = await adminAiApi.testDraftKey({
        apiKey: keyRaw.trim(),
        modelName: selectedTestModel || undefined,
      });
      setKeyDraftTest(res);
      if (res.ok) toast.success(`Test key thành công (${res.latencyMs}ms).`);
      else toast.error(res.message);
    } catch (cause) {
      toast.error(aiErrorMessage(cause, 'Không test thử được API key.'));
    } finally {
      setKeyTestingDraft(false);
    }
  };

  const handleSaveKey = async (event: React.FormEvent) => {
    event.preventDefault();
    if (keyModalBusy || keyTestingDraft) return;
    const prio = validatePriority(keyPriority);
    if (prio.error) {
      setKeyFormError(prio.error);
      return;
    }
    if (keyModalMode === 'create') {
      const keyErr = validateApiKeyInput(keyRaw);
      if (keyErr) {
        setKeyFormError(keyErr);
        return;
      }
    }
    setKeyFormError('');
    setKeyModalBusy(true);
    try {
      if (keyModalMode === 'create') {
        await adminAiApi.createKey({
          label: keyLabel.trim() || undefined,
          apiKey: keyRaw.trim(),
          priority: prio.value,
          active: keyActive,
        });
        toast.success('Đã thêm API key mới và áp dụng ngay.');
      } else if (editingKey) {
        await adminAiApi.updateKey(editingKey.id, {
          label: keyLabel.trim(),
          priority: prio.value,
          active: keyActive,
        });
        toast.success('Đã cập nhật API key.');
      }
      closeKeyModal();
      await refreshAll();
    } catch (cause) {
      const msg = aiErrorMessage(cause, 'Không lưu được API key.');
      setKeyFormError(msg);
      toast.error(msg);
    } finally {
      setKeyModalBusy(false);
    }
  };

  // ---------- Model modal handlers ----------

  const openCreateModel = () => {
    setModelModalMode('create');
    setEditingModel(null);
    setModelName('');
    setModelDisplayName('');
    setModelPriority('100');
    setModelActive(true);
    setModelFormError('');
    setModelDraftTest(null);
  };

  const openEditModel = (item: AiModelItem) => {
    setModelModalMode('edit');
    setEditingModel(item);
    setModelName(item.modelName);
    setModelDisplayName(item.displayName || '');
    setModelPriority(String(item.priority));
    setModelActive(item.active);
    setModelFormError('');
    setModelDraftTest(null);
  };

  const handleTestDraftModel = async () => {
    if (modelTestingDraft || modelModalBusy) return;
    const modelErr = validateModelNameInput(modelName);
    if (modelErr) {
      setModelFormError(modelErr);
      return;
    }
    setModelFormError('');
    setModelTestingDraft(true);
    try {
      const keyId = selectedTestKeyId ? Number(selectedTestKeyId) : undefined;
      const res = await adminAiApi.testDraftModel({
        modelName: modelName.trim(),
        keyId,
      });
      setModelDraftTest(res);
      if (res.ok) toast.success(`Model hoạt động (${res.latencyMs}ms).`);
      else toast.error(res.message);
    } catch (cause) {
      toast.error(aiErrorMessage(cause, 'Không test thử được model.'));
    } finally {
      setModelTestingDraft(false);
    }
  };

  const handleSaveModel = async (event: React.FormEvent) => {
    event.preventDefault();
    if (modelModalBusy || modelTestingDraft) return;
    const prio = validatePriority(modelPriority);
    if (prio.error) {
      setModelFormError(prio.error);
      return;
    }
    if (modelModalMode === 'create') {
      const modelErr = validateModelNameInput(modelName);
      if (modelErr) {
        setModelFormError(modelErr);
        return;
      }
    }
    setModelFormError('');
    setModelModalBusy(true);
    try {
      if (modelModalMode === 'create') {
        await adminAiApi.createModel({
          modelName: modelName.trim(),
          displayName: modelDisplayName.trim() || undefined,
          priority: prio.value,
          active: modelActive,
        });
        toast.success('Đã thêm model mới và áp dụng ngay.');
      } else if (editingModel) {
        await adminAiApi.updateModel(editingModel.id, {
          displayName: modelDisplayName.trim(),
          priority: prio.value,
          active: modelActive,
        });
        toast.success('Đã cập nhật cấu hình model.');
      }
      setModelModalMode(null);
      await refreshAll();
    } catch (cause) {
      const msg = aiErrorMessage(cause, 'Không lưu được model.');
      setModelFormError(msg);
      toast.error(msg);
    } finally {
      setModelModalBusy(false);
    }
  };

  // ---------- Parallel & Independent Row/Batch Test Actions ----------

  const runSingleKeyTest = async (item: AiKeyItem, notifyIndividual: boolean) => {
    setTestingKeyIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    try {
      const res = await adminAiApi.testSavedKey(item.id, selectedTestModel || undefined);
      setKeyResults((prev) => ({
        ...prev,
        [item.id]: {
          status: res.ok ? 'OK' : 'FAIL',
          statusCode: res.statusCode,
          latencyMs: res.latencyMs,
          message: res.message,
          testedAt: new Date().toISOString(),
        },
      }));
      if (notifyIndividual) {
        if (res.ok) toast.success(`${res.message} (${res.latencyMs}ms)`);
        else toast.error(res.message);
      }
      await refreshAll();
      return res.ok;
    } catch (cause) {
      const msg = aiErrorMessage(cause, 'Test API key thất bại.');
      setKeyResults((prev) => ({
        ...prev,
        [item.id]: {
          status: 'FAIL',
          statusCode: null,
          latencyMs: 0,
          message: msg,
          testedAt: new Date().toISOString(),
        },
      }));
      if (notifyIndividual) toast.error(msg);
      return false;
    } finally {
      setTestingKeyIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  const runSingleModelTest = async (item: AiModelItem, notifyIndividual: boolean) => {
    setTestingModelIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    try {
      const keyId = selectedTestKeyId ? Number(selectedTestKeyId) : undefined;
      const res = await adminAiApi.testSavedModel(item.id, keyId);
      setModelResults((prev) => ({
        ...prev,
        [item.id]: {
          status: res.ok ? 'OK' : 'FAIL',
          statusCode: res.statusCode,
          latencyMs: res.latencyMs,
          message: res.message,
          testedAt: new Date().toISOString(),
        },
      }));
      if (notifyIndividual) {
        if (res.ok) toast.success(`${res.message} (${res.latencyMs}ms)`);
        else toast.error(res.message);
      }
      return res.ok;
    } catch (cause) {
      const msg = aiErrorMessage(cause, 'Test model thất bại.');
      setModelResults((prev) => ({
        ...prev,
        [item.id]: {
          status: 'FAIL',
          statusCode: null,
          latencyMs: 0,
          message: msg,
          testedAt: new Date().toISOString(),
        },
      }));
      if (notifyIndividual) toast.error(msg);
      return false;
    } finally {
      setTestingModelIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  const handleBatchTestModels = async (targetIds?: number[]) => {
    const targets =
      targetIds && targetIds.length > 0 ? models.filter((m) => targetIds.includes(m.id)) : models;
    const runnable = targets.filter((m) => !testingModelIds.includes(m.id));
    if (runnable.length === 0) return;

    const results = await Promise.all(runnable.map((m) => runSingleModelTest(m, false)));
    const passed = results.filter(Boolean).length;
    const failed = results.length - passed;
    if (failed === 0) {
      toast.success(`Tất cả ${passed}/${results.length} model đều hoạt động.`);
    } else if (passed > 0) {
      toast.warning(`Đã test xong ${results.length} model: ${passed} hoạt động, ${failed} lỗi.`);
    } else {
      toast.error(`Cả ${results.length} model đều gặp lỗi khi test.`);
    }
  };

  const handleToggleKey = async (item: AiKeyItem) => {
    if (mutatingId) return;
    setMutatingId(`toggle-key-${item.id}`);
    try {
      await adminAiApi.updateKey(item.id, { active: !item.active });
      toast.success(item.active ? 'Đã tạm tắt API key.' : 'Đã bật API key.');
      await refreshAll();
    } catch (cause) {
      toast.error(aiErrorMessage(cause, 'Không đổi được trạng thái API key.'));
    } finally {
      setMutatingId(null);
    }
  };

  const handleMoveKey = async (index: number, direction: 'up' | 'down') => {
    if (mutatingId) return;
    const updates = buildPriorityMove(keys, index, direction);
    if (updates.length === 0) return;
    setMutatingId(`move-key-${keys[index].id}`);
    try {
      await Promise.all(updates.map((u) => adminAiApi.updateKey(u.id, { priority: u.priority })));
      await refreshAll();
    } catch (cause) {
      toast.error(aiErrorMessage(cause, 'Không đổi được thứ tự ưu tiên key.'));
    } finally {
      setMutatingId(null);
    }
  };

  const handleToggleModel = async (item: AiModelItem) => {
    if (mutatingId) return;
    setMutatingId(`toggle-model-${item.id}`);
    try {
      await adminAiApi.updateModel(item.id, { active: !item.active });
      toast.success(item.active ? 'Đã tạm tắt model.' : 'Đã bật model.');
      await refreshAll();
    } catch (cause) {
      toast.error(aiErrorMessage(cause, 'Không đổi được trạng thái model.'));
    } finally {
      setMutatingId(null);
    }
  };

  const handleMoveModel = async (index: number, direction: 'up' | 'down') => {
    if (mutatingId) return;
    const updates = buildPriorityMove(models, index, direction);
    if (updates.length === 0) return;
    setMutatingId(`move-model-${models[index].id}`);
    try {
      await Promise.all(updates.map((u) => adminAiApi.updateModel(u.id, { priority: u.priority })));
      await refreshAll();
    } catch (cause) {
      toast.error(aiErrorMessage(cause, 'Không đổi được thứ tự ưu tiên model.'));
    } finally {
      setMutatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteBusy) return;
    setDeleteBusy(true);
    try {
      if (deleteTarget.kind === 'key') {
        await adminAiApi.deleteKey(deleteTarget.id);
        setKeyResults((prev) => {
          const next = { ...prev };
          delete next[deleteTarget.id];
          return next;
        });
        toast.success('Đã xóa API key.');
      } else {
        await adminAiApi.deleteModel(deleteTarget.id);
        setSelectedModelIds((prev) => prev.filter((id) => id !== deleteTarget.id));
        setModelResults((prev) => {
          const next = { ...prev };
          delete next[deleteTarget.id];
          return next;
        });
        toast.success('Đã xóa model.');
      }
      setDeleteTarget(null);
      await refreshAll();
    } catch (cause) {
      toast.error(aiErrorMessage(cause, 'Không xóa được cấu hình.'));
    } finally {
      setDeleteBusy(false);
    }
  };

  const initialPending = runtimeQuery.isPending || keysQuery.isPending || modelsQuery.isPending;
  const initialError = runtimeQuery.isError || keysQuery.isError || modelsQuery.isError;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Hạ tầng AI · Google Gemini"
        title="Quản lý AI Keys & Models"
        description="Cấu hình động API Key và Model Gemini theo thứ tự ưu tiên (số nhỏ ưu tiên trước). Thay đổi có hiệu lực ngay trên cả môi trường local lẫn deploy."
        action={
          <button
            type="button"
            onClick={() => void refreshAll()}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-blue-500/10"
          >
            <RefreshCw size={14} />
            Làm mới
          </button>
        }
      />

      {initialPending ? (
        <AdminLoading />
      ) : initialError ? (
        <AdminError
          retry={() => void refreshAll()}
          error={runtimeQuery.error || keysQuery.error || modelsQuery.error}
        />
      ) : (
        <div className="space-y-6">
          {/* Status & Rotation Summary (2 clean high-contrast cards) */}
          <div className="grid gap-4 lg:grid-cols-2">
            {runtime && (
              <div
                className={`rounded-2xl border p-5 ${
                  runtime.cryptoConfigured
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {runtime.cryptoConfigured ? (
                    <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-700" />
                  ) : (
                    <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-700" />
                  )}
                  <div className="space-y-1 text-xs leading-5">
                    <p
                      className={`text-sm font-semibold ${
                        runtime.cryptoConfigured ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {runtime.cryptoConfigured
                        ? 'Bảo mật API Key sẵn sàng (AES-256-GCM)'
                        : 'Chưa cấu hình AI_CRYPTO_KEY trên server'}
                    </p>
                    <p className="text-slate-700">
                      {runtime.cryptoConfigured
                        ? 'Key lưu trong PostgreSQL được mã hóa an toàn và chỉ giải mã trong RAM khi gọi/test.'
                        : 'Cần đặt biến AI_CRYPTO_KEY trên server để thêm key mới vào DB. Khi DB chưa có key, hệ thống tự dùng key cấu hình sẵn trên server.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
                  <div className="text-xs leading-5">
                    <p className="text-sm font-semibold text-slate-900">
                      Cơ chế xoay tua thông minh
                    </p>
                    <p className="mt-1 text-slate-600">
                      Thử tuần tự theo ưu tiên <strong>Key -&gt; Model</strong>; khi lỗi tự chuyển
                      sang model hoặc key dự phòng.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-expanded={showRotationDetail}
                  onClick={() => setShowRotationDetail((v) => !v)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-500/10"
                >
                  {showRotationDetail ? 'Thu gọn' : 'Xem chi tiết'}
                  {showRotationDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {showRotationDetail && (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3.5 text-xs leading-5 text-slate-700">
                  <p>
                    <strong className="text-slate-900">1. Thứ tự ưu tiên nguồn:</strong> Luôn ưu
                    tiên danh sách Key &amp; Model lưu trong DB (theo số{' '}
                    <code className="rounded bg-slate-100 px-1 font-mono">priority</code> nhỏ đến
                    lớn; các key trùng{' '}
                    <code className="rounded bg-slate-100 px-1 font-mono">priority</code> tự chia
                    tải vòng tròn). Nếu DB trống hoặc toàn bộ key DB lỗi, hệ thống mới fallback
                    xuống cấu hình mặc định của server.
                  </p>
                  <p>
                    <strong className="text-slate-900">2. Key sai / hết hiệu lực (401/403):</strong>{' '}
                    Tạm khóa key đó 30 phút và <strong>đổi ngay sang Key tiếp theo</strong>.
                  </p>
                  <p>
                    <strong className="text-slate-900">3. Model không tồn tại (404):</strong> Bỏ qua
                    model đó cho cả lượt gọi và <strong>đổi ngay sang Model tiếp theo</strong>.
                  </p>
                  <p>
                    <strong className="text-slate-900">4. Hết hạn mức (429):</strong>{' '}
                    <strong>Đổi ngay sang Model tiếp theo</strong> trên cùng Key; chỉ khi tất cả
                    model trên Key đó đều hết hạn mức mới chuyển sang Key tiếp theo.
                  </p>
                  <p>
                    <strong className="text-slate-900">5. Quá tải / Timeout (503/5xx):</strong> Thử
                    lại tối đa <strong>2 lần</strong> trên cặp hiện tại, vẫn lỗi mới đổi Model.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Models Management Card */}
          <AdminCard
            title={`Danh sách Models Gemini (${models.length})`}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Key test:</span>
                  <select
                    value={selectedTestKeyId}
                    onChange={(e) => setSelectedTestKeyId(e.target.value)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="">Tự chọn Key #1 đang bật</option>
                    {keys.map((k) => (
                      <option key={k.id} value={String(k.id)}>
                        {k.label ? `${k.label} (${k.keyMasked})` : k.keyMasked}
                        {!k.active ? ' [đang tắt]' : ''}
                      </option>
                    ))}
                  </select>
                </label>

                {visibleSelectedIds.length > 0 && (
                  <button
                    type="button"
                    disabled={visibleSelectedIds.every((id) => testingModelIds.includes(id))}
                    onClick={() => void handleBatchTestModels(visibleSelectedIds)}
                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-500/20 disabled:opacity-50"
                  >
                    <FlaskConical size={14} />
                    {`Test đã chọn (${visibleSelectedIds.length})`}
                  </button>
                )}

                {models.length > 0 && (
                  <button
                    type="button"
                    disabled={models.every((m) => testingModelIds.includes(m.id))}
                    onClick={() => void handleBatchTestModels()}
                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-blue-500/10 disabled:opacity-50"
                  >
                    <FlaskConical size={14} />
                    {testingModelIds.length > 0
                      ? `Đang test (${testingModelIds.length}/${models.length})...`
                      : 'Test tất cả'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={openCreateModel}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={15} />
                  Thêm Model
                </button>
              </div>
            }
          >
            {models.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-600">
                <Cpu size={28} className="mx-auto mb-2 text-slate-400" />
                <p className="font-semibold text-slate-900">Chưa có model nào được lưu trong DB</p>
                <p className="mt-1 text-xs text-slate-500">
                  Thêm model tại đây để quản lý thứ tự fallback và kiểm tra kết nối.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label="Chọn tất cả models"
                          checked={allModelsSelected}
                          onChange={toggleSelectAllModels}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                      </th>
                      <th className="px-3 py-3">Ưu tiên</th>
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Kết quả test</th>
                      <th className="px-5 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {models.map((item, index) => {
                      const isRowTesting = testingModelIds.includes(item.id);
                      const isChecked = visibleSelectedIds.includes(item.id);
                      return (
                        <tr key={item.id} className="transition-colors hover:bg-blue-500/5">
                          <td className="px-4 py-3.5 align-top">
                            <input
                              type="checkbox"
                              aria-label={`Chọn model ${item.modelName}`}
                              checked={isChecked}
                              onChange={() => toggleSelectModel(item.id)}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                            />
                          </td>
                          <td className="px-3 py-3.5 align-top">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex min-w-11 justify-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs font-semibold text-slate-900">
                                {item.priority}
                              </span>
                              <button
                                type="button"
                                aria-label={`Tăng ưu tiên model ${item.modelName}`}
                                disabled={mutatingId !== null || index === 0}
                                onClick={() => void handleMoveModel(index, 'up')}
                                className="rounded-md p-1 text-slate-500 hover:bg-blue-500/10 hover:text-slate-900 disabled:opacity-30"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                aria-label={`Giảm ưu tiên model ${item.modelName}`}
                                disabled={mutatingId !== null || index === models.length - 1}
                                onClick={() => void handleMoveModel(index, 'down')}
                                className="rounded-md p-1 text-slate-500 hover:bg-blue-500/10 hover:text-slate-900 disabled:opacity-30"
                              >
                                <ArrowDown size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 align-top">
                            <p className="font-mono text-xs font-semibold text-slate-900">
                              {item.modelName}
                            </p>
                            {item.displayName && (
                              <p className="mt-0.5 text-xs text-slate-500">{item.displayName}</p>
                            )}
                          </td>
                          <td className="px-4 py-3.5 align-top">
                            <button
                              type="button"
                              disabled={mutatingId !== null}
                              onClick={() => void handleToggleModel(item)}
                              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                                item.active
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:opacity-90'
                                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:opacity-90'
                              }`}
                            >
                              <Power size={12} />
                              {item.active ? 'Đang bật' : 'Đang tắt'}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 align-top">
                            <TestStatusBadge
                              record={modelResults[item.id]}
                              isTesting={isRowTesting}
                            />
                          </td>
                          <td className="px-5 py-3.5 text-right align-top">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={isRowTesting}
                                onClick={() => void runSingleModelTest(item, true)}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-500/20 disabled:opacity-50"
                              >
                                <FlaskConical size={13} />
                                {isRowTesting ? 'Đang test...' : 'Test'}
                              </button>
                              <button
                                type="button"
                                aria-label={`Sửa model ${item.modelName}`}
                                disabled={mutatingId !== null}
                                onClick={() => openEditModel(item)}
                                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-blue-500/10 disabled:opacity-40"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                aria-label={`Xóa model ${item.modelName}`}
                                disabled={mutatingId !== null || isRowTesting}
                                onClick={() =>
                                  setDeleteTarget({
                                    kind: 'model',
                                    id: item.id,
                                    label: item.modelName,
                                  })
                                }
                                className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-500/10 disabled:opacity-40"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>

          {/* API Keys Management Card */}
          <AdminCard
            title={`Danh sách API Keys Gemini (${keys.length})`}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Model test key:</span>
                  <select
                    value={selectedTestModel}
                    onChange={(e) => setSelectedTestModel(e.target.value)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="">Tự chọn model nhẹ (flash-lite)</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.modelName}>
                        {m.modelName}
                        {!m.active ? ' [đang tắt]' : ''}
                      </option>
                    ))}
                    {SUGGESTED_GEMINI_MODELS.filter(
                      (s) => !models.some((m) => m.modelName === s)
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s} (gợi ý)
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={openCreateKey}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={15} />
                  Thêm API Key
                </button>
              </div>
            }
          >
            {keys.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-600">
                <KeyRound size={28} className="mx-auto mb-2 text-slate-400" />
                <p className="font-semibold text-slate-900">
                  Chưa có API Key nào được lưu trong DB
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Khi chưa có key trong DB, hệ thống dùng key cấu hình trên server (nếu có). Thêm
                  nhiều key tại đây để xoay tua khi hết hạn mức.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Ưu tiên</th>
                      <th className="px-4 py-3">Nhãn / Key (Masked)</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Lỗi liên tiếp</th>
                      <th className="px-4 py-3">Kết quả test</th>
                      <th className="px-5 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {keys.map((item, index) => {
                      const isKeyTesting = testingKeyIds.includes(item.id);
                      return (
                        <tr key={item.id} className="transition-colors hover:bg-blue-500/5">
                          <td className="px-5 py-3.5 align-top">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex min-w-11 justify-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs font-semibold text-slate-900">
                                {item.priority}
                              </span>
                              <button
                                type="button"
                                aria-label={`Tăng ưu tiên key ${item.keyMasked}`}
                                disabled={mutatingId !== null || index === 0}
                                onClick={() => void handleMoveKey(index, 'up')}
                                className="rounded-md p-1 text-slate-500 hover:bg-blue-500/10 hover:text-slate-900 disabled:opacity-30"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                aria-label={`Giảm ưu tiên key ${item.keyMasked}`}
                                disabled={mutatingId !== null || index === keys.length - 1}
                                onClick={() => void handleMoveKey(index, 'down')}
                                className="rounded-md p-1 text-slate-500 hover:bg-blue-500/10 hover:text-slate-900 disabled:opacity-30"
                              >
                                <ArrowDown size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 align-top">
                            <p className="font-semibold text-slate-900">
                              {item.label || `Gemini Key #${item.id}`}
                            </p>
                            <p className="mt-0.5 font-mono text-xs text-slate-500">
                              {item.keyMasked}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 align-top">
                            <button
                              type="button"
                              disabled={mutatingId !== null}
                              onClick={() => void handleToggleKey(item)}
                              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                                item.active
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:opacity-90'
                                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:opacity-90'
                              }`}
                            >
                              <Power size={12} />
                              {item.active ? 'Đang bật' : 'Đang tắt'}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 align-top font-mono text-xs text-slate-700">
                            {item.failCount}
                          </td>
                          <td className="px-4 py-3.5 align-top">
                            <TestStatusBadge
                              record={keyResults[item.id]}
                              isTesting={isKeyTesting}
                            />
                          </td>
                          <td className="px-5 py-3.5 text-right align-top">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={isKeyTesting}
                                onClick={() => void runSingleKeyTest(item, true)}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-500/20 disabled:opacity-50"
                              >
                                <FlaskConical size={13} />
                                {isKeyTesting ? 'Đang test...' : 'Test'}
                              </button>
                              <button
                                type="button"
                                aria-label={`Sửa key ${item.keyMasked}`}
                                disabled={mutatingId !== null}
                                onClick={() => openEditKey(item)}
                                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-blue-500/10 disabled:opacity-40"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                aria-label={`Xóa key ${item.keyMasked}`}
                                disabled={mutatingId !== null || isKeyTesting}
                                onClick={() =>
                                  setDeleteTarget({
                                    kind: 'key',
                                    id: item.id,
                                    label: item.label
                                      ? `${item.label} (${item.keyMasked})`
                                      : item.keyMasked,
                                  })
                                }
                                className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-500/10 disabled:opacity-40"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        </div>
      )}

      {/* Create / Edit Key Modal */}
      {keyModalMode && (
        <Modal
          title={keyModalMode === 'create' ? 'Thêm Gemini API Key' : 'Chỉnh sửa API Key'}
          onClose={closeKeyModal}
          busy={keyModalBusy || keyTestingDraft}
        >
          <form onSubmit={(e) => void handleSaveKey(e)} className="space-y-4">
            {keyModalMode === 'create' && runtime && !runtime.cryptoConfigured && (
              <Notice error>
                Server chưa cấu hình <code>AI_CRYPTO_KEY</code> nên chưa thể lưu key vào DB. Bạn vẫn
                có thể dùng nút <strong>Test thử trước khi lưu</strong>.
              </Notice>
            )}
            {keyFormError && <Notice error>{keyFormError}</Notice>}
            <Field label="Nhãn gợi nhớ (tùy chọn)">
              <input
                type="text"
                maxLength={100}
                value={keyLabel}
                onChange={(e) => setKeyLabel(e.target.value)}
                placeholder="VD: Gemini Billing #1 hoặc Free Tier Dự phòng"
                className={inputClass}
              />
            </Field>
            {keyModalMode === 'create' ? (
              <Field
                label="Google Gemini API Key"
                hint="Key sẽ được mã hóa AES-256-GCM trước khi lưu vào database."
              >
                <div className="relative">
                  <input
                    type={showRawKey ? 'text' : 'password'}
                    maxLength={2000}
                    value={keyRaw}
                    onChange={(e) => {
                      setKeyRaw(e.target.value);
                      setKeyDraftTest(null);
                    }}
                    placeholder="AIzaSy..."
                    className={`${inputClass} pr-10 font-mono`}
                  />
                  <button
                    type="button"
                    aria-label={showRawKey ? 'Ẩn API key' : 'Hiện API key'}
                    onClick={() => setShowRawKey((v) => !v)}
                    className="absolute right-2.5 top-2.5 rounded p-1 text-slate-400 hover:text-slate-700"
                  >
                    {showRawKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
            ) : (
              <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
                Key hiện tại:{' '}
                <span className="font-mono font-semibold">{editingKey?.keyMasked}</span>
              </div>
            )}
            <Field
              label="Thứ tự ưu tiên (0 – 10000)"
              hint="Số nhỏ được ưu tiên gọi trước. Các key cùng số sẽ tự xoay vòng chia tải."
            >
              <input
                type="number"
                min={0}
                max={10000}
                value={keyPriority}
                onChange={(e) => setKeyPriority(e.target.value)}
                className={inputClass}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={keyActive}
                onChange={(e) => setKeyActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              Kích hoạt ngay sau khi lưu
            </label>

            <DraftTestBanner result={keyDraftTest} />

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              {keyModalMode === 'create' && (
                <button
                  type="button"
                  disabled={keyTestingDraft || keyModalBusy}
                  onClick={() => void handleTestDraftKey()}
                  className={`${secondaryClass} gap-1.5`}
                >
                  <FlaskConical size={15} />
                  {keyTestingDraft ? 'Đang test...' : 'Test thử trước khi lưu'}
                </button>
              )}
              <button
                type="button"
                disabled={keyModalBusy || keyTestingDraft}
                onClick={closeKeyModal}
                className={secondaryClass}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={
                  keyModalBusy ||
                  keyTestingDraft ||
                  (keyModalMode === 'create' && runtime?.cryptoConfigured === false)
                }
                className={primaryClass}
              >
                {keyModalBusy ? 'Đang lưu...' : 'Lưu API Key'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create / Edit Model Modal */}
      {modelModalMode && (
        <Modal
          title={modelModalMode === 'create' ? 'Thêm Model Gemini' : 'Chỉnh sửa Model Gemini'}
          onClose={() => setModelModalMode(null)}
          busy={modelModalBusy || modelTestingDraft}
        >
          <form onSubmit={(e) => void handleSaveModel(e)} className="space-y-4">
            {modelFormError && <Notice error>{modelFormError}</Notice>}
            {modelModalMode === 'create' ? (
              <Field
                label="Tên Model ID (Google Gemini)"
                hint="Chỉ gồm chữ, số, dấu chấm, gạch ngang, gạch dưới."
              >
                <input
                  type="text"
                  maxLength={120}
                  value={modelName}
                  onChange={(e) => {
                    setModelName(e.target.value);
                    setModelDraftTest(null);
                  }}
                  placeholder="VD: gemini-3.8-flash"
                  className={`${inputClass} font-mono`}
                />
              </Field>
            ) : (
              <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
                Model ID: <span className="font-mono font-semibold">{editingModel?.modelName}</span>
              </div>
            )}

            {modelModalMode === 'create' && (
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_GEMINI_MODELS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setModelName(preset);
                      setModelDraftTest(null);
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-700 hover:border-blue-300 hover:bg-blue-500/10"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}

            <Field label="Tên hiển thị / Ghi chú (tùy chọn)">
              <input
                type="text"
                maxLength={120}
                value={modelDisplayName}
                onChange={(e) => setModelDisplayName(e.target.value)}
                placeholder="VD: Nhanh, Free Tier"
                className={inputClass}
              />
            </Field>

            <Field
              label="Thứ tự ưu tiên (0 – 10000)"
              hint="Số nhỏ được ưu tiên thử trước trên mỗi API key."
            >
              <input
                type="number"
                min={0}
                max={10000}
                value={modelPriority}
                onChange={(e) => setModelPriority(e.target.value)}
                className={inputClass}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={modelActive}
                onChange={(e) => setModelActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              Kích hoạt ngay sau khi lưu
            </label>

            <DraftTestBanner result={modelDraftTest} />

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              {modelModalMode === 'create' && (
                <button
                  type="button"
                  disabled={modelTestingDraft || modelModalBusy}
                  onClick={() => void handleTestDraftModel()}
                  className={`${secondaryClass} gap-1.5`}
                >
                  <FlaskConical size={15} />
                  {modelTestingDraft ? 'Đang test...' : 'Test thử trước khi lưu'}
                </button>
              )}
              <button
                type="button"
                disabled={modelModalBusy || modelTestingDraft}
                onClick={() => setModelModalMode(null)}
                className={secondaryClass}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={modelModalBusy || modelTestingDraft}
                className={primaryClass}
              >
                {modelModalBusy ? 'Đang lưu...' : 'Lưu Model'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <Modal
          title={deleteTarget.kind === 'key' ? 'Xóa API Key' : 'Xóa Model Gemini'}
          onClose={() => setDeleteTarget(null)}
          busy={deleteBusy}
        >
          <p className="text-sm text-slate-600">
            Bạn có chắc muốn xóa{' '}
            <strong className="font-mono text-slate-900">{deleteTarget.label}</strong> khỏi cấu
            hình? Thay đổi sẽ có hiệu lực ngay lập tức.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={deleteBusy}
              onClick={() => setDeleteTarget(null)}
              className={secondaryClass}
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={deleteBusy}
              onClick={() => void handleConfirmDelete()}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteBusy ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
