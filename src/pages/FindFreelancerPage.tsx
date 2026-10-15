import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  type ClientInvitationStatus,
  type PublicFreelancer,
  invitationsApi,
} from '../api/invitations';
import { jobApi } from '../api/job';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import PaginationNav from '../components/PaginationNav';

const FindFreelancerPage = () => {
  const [params, setParams] = useSearchParams();
  const page = Math.max(0, (Number(params.get('page')) || 1) - 1);
  const search = params.get('search') || '';
  const presetJobId = params.get('jobId') || '';
  const [draftSearch, setDraftSearch] = useState(search);
  const [profile, setProfile] = useState<PublicFreelancer | null>(null);
  const [candidate, setCandidate] = useState<PublicFreelancer | null>(null);
  const [projectId, setProjectId] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();

  const freelancers = useQuery({
    queryKey: ['freelancers-directory', page, search],
    queryFn: () => invitationsApi.freelancers({ page, size: 10, search: search || undefined }),
  });
  const freelancerIds = freelancers.data?.items.map((freelancer) => freelancer.userId) ?? [];
  const invitationStatuses = useQuery({
    queryKey: ['client-open-invitation-statuses', freelancerIds],
    queryFn: () => invitationsApi.clientFreelancerStatuses(freelancerIds),
    enabled: freelancerIds.length > 0,
  });
  const projects = useQuery({
    queryKey: ['invite-open-projects'],
    queryFn: () => jobApi.getMyJobsPage({ status: 'OPEN', page: 0, size: 100 }),
    enabled: !!candidate,
  });
  const presetJob = useQuery({
    queryKey: ['invite-preset-project', presetJobId],
    queryFn: () => jobApi.getJobById(presetJobId),
    enabled: !!candidate && !!presetJobId,
  });
  const invite = useMutation({
    mutationFn: () => invitationsApi.invite(projectId, candidate!.userId, message.trim()),
    onSuccess: (invitation) => {
      void queryClient.invalidateQueries({ queryKey: ['job-invitations', invitation.jobId] });
      queryClient.setQueryData<ClientInvitationStatus[]>(
        ['client-open-invitation-statuses', freelancerIds],
        (current) => [
          ...(current ?? []).filter(
            (item) =>
              item.jobId !== invitation.jobId || item.freelancerId !== invitation.freelancerId
          ),
          {
            jobId: invitation.jobId,
            freelancerId: invitation.freelancerId,
            status: invitation.status,
          },
        ]
      );
      setFeedback(
        `Đã gửi lời mời cho ${invitation.freelancerName} ở dự án “${invitation.jobTitle}”.`
      );
      setCandidate(null);
      setProjectId('');
      setMessage('');
    },
  });
  const candidateProjectInvitation = invitationStatuses.data?.find(
    (item) => item.freelancerId === candidate?.userId && item.jobId === projectId
  );
  const projectIsSelectable =
    invitationStatuses.isSuccess &&
    !candidateProjectInvitation &&
    (projects.data?.items.some((job) => job.id === projectId) ||
      (presetJobId === projectId && presetJob.data?.status === 'OPEN'));

  const changePage = (nextPage: number) => {
    const next = new URLSearchParams(params);
    next.set('page', String(nextPage));
    setParams(next);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams(params);
    if (draftSearch.trim()) next.set('search', draftSearch.trim());
    else next.delete('search');
    next.set('page', '1');
    setParams(next);
  };

  return (
    <div className="client-route min-h-screen bg-[#F8FAFC] flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tìm freelancer</h1>
            <p className="text-gray-600 mt-2">
              Chọn người phù hợp, sau đó chọn đúng dự án để gửi lời mời.
            </p>
          </div>
          <form onSubmit={submitSearch} className="flex gap-2 w-full md:w-auto">
            <input
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder="Tên, chuyên môn hoặc kỹ năng"
              className="w-full md:w-72 rounded-xl border border-gray-300 px-4 py-2.5 bg-white text-gray-900"
            />
            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-5 py-2.5 text-white font-semibold"
            >
              Tìm
            </button>
          </form>
        </div>

        {feedback && (
          <output
            aria-live="polite"
            className="mb-5 block rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-800"
          >
            {feedback}
          </output>
        )}
        {freelancers.isLoading && <p className="text-gray-600">Đang tải danh sách freelancer...</p>}
        {freelancers.isError && (
          <p role="alert" className="text-red-700">
            Không tải được danh sách. Vui lòng thử lại.
          </p>
        )}
        {!freelancers.isLoading && freelancers.data?.items.length === 0 && (
          <p className="rounded-2xl border bg-white p-8 text-gray-600">
            Chưa tìm thấy freelancer phù hợp.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {freelancers.data?.items.map((freelancer) => (
            <article
              key={freelancer.userId}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-gray-900">{freelancer.fullName}</h2>
              <p className="mt-1 text-sm text-gray-600">{freelancer.headline || 'Freelancer'}</p>
              <p className="mt-4 line-clamp-3 text-sm text-gray-700">
                {freelancer.bio || 'Chưa có phần giới thiệu.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {freelancer.skills.map((skill) => (
                  <span
                    key={skill.skillId}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
                  >
                    {skill.skillName}
                  </span>
                ))}
              </div>
              {freelancer.hourlyRate != null && (
                <p className="mt-4 text-sm text-gray-700">
                  Mức phí: {new Intl.NumberFormat('vi-VN').format(freelancer.hourlyRate)} / giờ
                </p>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setProfile(freelancer)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800"
                >
                  Xem hồ sơ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCandidate(freelancer);
                    setProjectId(presetJobId);
                    setMessage('');
                    invite.reset();
                  }}
                  className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  {invitationStatuses.data?.some((item) => item.freelancerId === freelancer.userId)
                    ? 'Đã mời'
                    : 'Mời làm việc'}
                </button>
              </div>
            </article>
          ))}
        </div>
        <PaginationNav
          page={page + 1}
          totalPages={freelancers.data?.totalPages ?? 0}
          onPageChange={changePage}
          label="Phân trang freelancer"
          className="mt-6"
        />
      </main>
      <Footer />

      {profile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setProfile(null);
          }}
        >
          <dialog
            open
            aria-modal="true"
            aria-label="Hồ sơ freelancer"
            className="static m-0 w-full max-w-xl rounded-2xl border-0 bg-white p-6 text-left text-gray-900 shadow-xl"
          >
            <h2 className="text-2xl font-bold">{profile.fullName}</h2>
            <p className="mt-1 text-gray-600">{profile.headline}</p>
            <p className="mt-5 whitespace-pre-wrap text-gray-700">
              {profile.bio || 'Chưa có phần giới thiệu.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill.skillId}
                  className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800"
                >
                  {skill.skillName}
                </span>
              ))}
            </div>
            <div className="mt-5 flex gap-4 text-sm">
              {profile.portfolioUrl?.startsWith('https://') && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 underline"
                >
                  Portfolio
                </a>
              )}
              {profile.githubUrl?.startsWith('https://') && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 underline"
                >
                  GitHub
                </a>
              )}
            </div>
            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setProfile(null)}
                className="cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setCandidate(profile);
                  setProjectId(presetJobId);
                  setMessage('');
                  setProfile(null);
                }}
                className="cursor-pointer rounded-xl bg-blue-700 px-4 py-2 text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Mời làm việc
              </button>
            </div>
          </dialog>
        </div>
      )}

      {candidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !invite.isPending) setCandidate(null);
          }}
        >
          <dialog
            open
            aria-modal="true"
            aria-label="Mời freelancer làm việc"
            className="static m-0 w-full max-w-lg rounded-2xl border-0 bg-white p-6 text-left text-gray-900 shadow-xl"
          >
            <h2 className="text-xl font-bold">Mời {candidate.fullName}</h2>
            <p className="mt-2 text-sm text-gray-600">
              Lời mời luôn gắn với một dự án cụ thể. Freelancer đồng ý thì hai bên mới mở phòng
              chat.
            </p>
            <label className="mt-6 block text-sm font-semibold" htmlFor="invite-project">
              Dự án đang tuyển
            </label>
            <select
              id="invite-project"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5"
            >
              <option value="">Chọn dự án</option>
              {presetJob.data?.status === 'OPEN' &&
                !projects.data?.items.some((job) => job.id === presetJobId) && (
                  <option
                    value={presetJobId}
                    disabled={invitationStatuses.data?.some(
                      (item) => item.jobId === presetJobId && item.freelancerId === candidate.userId
                    )}
                  >
                    {presetJob.data.title}
                    {invitationStatuses.data?.some(
                      (item) => item.jobId === presetJobId && item.freelancerId === candidate.userId
                    )
                      ? ' — Đã mời'
                      : ''}
                  </option>
                )}
              {projects.data?.items.map((job) => {
                const alreadyInvited = invitationStatuses.data?.some(
                  (item) => item.jobId === job.id && item.freelancerId === candidate.userId
                );
                return (
                  <option key={job.id} value={job.id} disabled={alreadyInvited}>
                    {job.title}
                    {alreadyInvited ? ' — Đã mời' : ''}
                  </option>
                );
              })}
            </select>
            {projects.isLoading && <p className="mt-2 text-sm text-gray-500">Đang tải dự án...</p>}
            {projects.isError && (
              <p role="alert" className="mt-2 text-sm text-red-700">
                Không tải được dự án.
              </p>
            )}
            {invitationStatuses.isLoading && (
              <p className="mt-2 text-sm text-gray-500">Đang kiểm tra lời mời đã gửi...</p>
            )}
            {invitationStatuses.isError && (
              <p role="alert" className="mt-2 text-sm text-red-700">
                Không kiểm tra được lời mời đã gửi. Vui lòng thử lại.
              </p>
            )}
            {projects.data?.totalElements === 0 && (
              <p className="mt-2 text-sm text-gray-600">Bạn chưa có dự án đang tuyển.</p>
            )}
            {candidateProjectInvitation && (
              <p className="mt-2 text-sm text-amber-700">
                Bạn đã gửi lời mời cho freelancer này ở dự án đã chọn.
              </p>
            )}
            <label className="mt-5 block text-sm font-semibold" htmlFor="invite-message">
              Lời nhắn (không bắt buộc)
            </label>
            <textarea
              id="invite-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={2000}
              rows={3}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2"
            />
            {invite.isError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {invite.error instanceof Error ? invite.error.message : 'Không gửi được lời mời.'}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCandidate(null)}
                disabled={invite.isPending}
                className="cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!projectIsSelectable || invite.isPending}
                onClick={() => invite.mutate()}
                className="cursor-pointer rounded-xl bg-blue-700 px-4 py-2 text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-700"
              >
                {invite.isPending ? 'Đang gửi...' : 'Gửi lời mời'}
              </button>
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
};

export default FindFreelancerPage;
