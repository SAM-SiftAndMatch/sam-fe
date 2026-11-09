import { useQuery } from '@tanstack/react-query';
import { Filter, Search, UserRound } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/admin';
import {
  AdminCard,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminPagination,
  adminDate,
  adminInput,
  queryPage,
} from '../components/admin/AdminUI';
import { useAuthStore } from '../stores/useAuthStore';
export default function AdminUsersPage() {
  const user = useAuthStore((state) => state.user);
  const [params, setParams] = useSearchParams();
  const page = queryPage(params);
  const request = new URLSearchParams(params);
  request.set('page', String(page));
  const users = useQuery({
    queryKey: ['admin-users', user?.userId, request.toString()],
    queryFn: () => adminApi.users(request),
  });
  const apply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    for (const key of ['q', 'role', 'status']) {
      const value = String(form.get(key) || '').trim();
      if (value) next.set(key, value);
    }
    setParams(next);
  };
  const changePage = (next: number) => {
    const updated = new URLSearchParams(params);
    updated.set('page', String(next));
    setParams(updated);
  };
  return (
    <div>
      <AdminPageHeader
        title="Người dùng"
        description="Tra cứu thành viên trên nền tảng theo tên, email, vai trò và trạng thái tài khoản."
      />
      <form
        key={params.toString()}
        onSubmit={apply}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-4"
      >
        <label className="min-w-52 flex-1 space-y-1.5 text-xs text-slate-500">
          Tìm kiếm
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              name="q"
              maxLength={100}
              defaultValue={params.get('q') || ''}
              placeholder="Nhập tên hoặc email người dùng…"
              className={`${adminInput} w-full pl-9`}
            />
          </div>
        </label>
        <label className="space-y-1.5 text-xs text-slate-500">
          Vai trò
          <select
            name="role"
            defaultValue={params.get('role') || ''}
            className={`${adminInput} block min-w-40`}
          >
            <option value="">Tất cả vai trò</option>
            <option value="CLIENT">Client</option>
            <option value="FREELANCER">Freelancer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        <label className="space-y-1.5 text-xs text-slate-500">
          Trạng thái
          <select
            name="status"
            defaultValue={params.get('status') || ''}
            className={`${adminInput} block min-w-40`}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã khóa</option>
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Filter size={15} />
          Lọc người dùng
        </button>
      </form>
      {users.isPending ? (
        <AdminLoading />
      ) : users.isError ? (
        <AdminError error={users.error} retry={() => void users.refetch()} />
      ) : (
        <AdminCard
          title="Danh sách thành viên"
          action={
            <span className="text-xs text-slate-400">
              {users.data.total.toLocaleString('vi-VN')} người dùng
            </span>
          }
        >
          {users.data.items.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <UserRound className="mx-auto mb-3 text-slate-300" size={32} />
              <p className="text-sm text-slate-500">Không tìm thấy người dùng phù hợp.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[690px] text-left text-sm">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3 font-medium">Người dùng</th>
                    <th className="px-4 py-3 font-medium">Vai trò</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                    <th className="px-5 py-3 font-medium">Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.data.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                            {item.fullName.slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800">{item.fullName}</p>
                            <p className="mt-1 text-xs text-slate-400">{item.email}</p>
                            <p className="mt-1 font-mono text-[10px] text-slate-300">{item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.role === 'CLIENT' ? 'bg-blue-50 text-blue-700' : item.role === 'FREELANCER' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-700'}`}
                        >
                          {item.role === 'CLIENT'
                            ? 'Client'
                            : item.role === 'FREELANCER'
                              ? 'Freelancer'
                              : 'Admin'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs ${item.isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                          />
                          {item.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {adminDate(item.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AdminPagination
            page={page}
            size={users.data.size}
            total={users.data.total}
            onPage={changePage}
          />
        </AdminCard>
      )}
    </div>
  );
}
