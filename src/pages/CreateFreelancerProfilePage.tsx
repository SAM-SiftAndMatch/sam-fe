import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/profile';
import {
  type FreelancerProfileFormData,
  freelancerProfileSchema,
} from '../features/profile/schemas/freelancer-profile-schema';
import * as paths from '../routes/paths';
import { useAuthStore } from '../stores/useAuthStore';
import { PREDEFINED_SKILLS, type SkillOption } from '../types/profile';

const CreateFreelancerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('');
  const [skillExperience, setSkillExperience] = useState<number>(1);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FreelancerProfileFormData>({
    resolver: zodResolver(freelancerProfileSchema),
    defaultValues: {
      headline: '',
      bio: '',
      hourlyRate: null,
      githubUrl: '',
      portfolioUrl: '',
      skills: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  });

  // Fetch current profile on mount and prefill form
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const data = await profileApi.getFreelancerProfile();
        if (isMounted && data) {
          reset({
            headline: data.headline || '',
            bio: data.bio || '',
            hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : null,
            githubUrl: data.githubUrl || '',
            portfolioUrl: data.portfolioUrl || '',
            skills: data.skills
              ? data.skills.map((s) => ({
                  skillId: s.skillId,
                  skillName: s.skillName,
                  yearsOfExperience: s.yearsOfExperience,
                }))
              : [],
          });
        }
      } catch (err: unknown) {
        // If profile doesn't exist yet, it's not a blocking error (first-time creation)
        console.warn('Profile not created yet or fetch failed:', err);
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [reset]);

  const handleAddSkill = () => {
    if (selectedSkillId === '') return;
    const numSkillId = Number(selectedSkillId);

    // Prevent duplicate skill addition
    const isAlreadyAdded = fields.some((f) => f.skillId === numSkillId);
    if (isAlreadyAdded) {
      alert('Kỹ năng này đã được thêm vào danh sách.');
      return;
    }

    const matchedSkill = PREDEFINED_SKILLS.find((s) => s.id === numSkillId);
    append({
      skillId: numSkillId,
      skillName: matchedSkill ? matchedSkill.name : `Skill #${numSkillId}`,
      yearsOfExperience: Math.max(0, skillExperience),
    });

    setSelectedSkillId('');
    setSkillExperience(1);
  };

  const onSubmit = async (data: FreelancerProfileFormData) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      await profileApi.updateFreelancerProfile({
        headline: data.headline.trim(),
        bio: data.bio?.trim() || null,
        hourlyRate:
          data.hourlyRate !== null && data.hourlyRate !== undefined
            ? Number(data.hourlyRate)
            : null,
        githubUrl: data.githubUrl?.trim() || null,
        portfolioUrl: data.portfolioUrl?.trim() || null,
        skills: data.skills.map((s) => ({
          skillId: s.skillId,
          yearsOfExperience: Number(s.yearsOfExperience),
        })),
      });

      setSuccessMessage('Hồ sơ đã được lưu và cập nhật thành công!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          'Không thể cập nhật hồ sơ. Vui lòng kiểm tra lại thông tin.';
        setServerError(message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Đã xảy ra lỗi, vui lòng thử lại sau.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full h-16 px-6 md:px-10 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
        <div
          onClick={() => navigate(paths.PATH_HOME)}
          className="flex items-center gap-1 cursor-pointer group"
        >
          <div
            className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#1D4ED8] to-[#0AAAD7] group-hover:from-[#0AAAD7] group-hover:to-[#1D4ED8] transition-all duration-300"
            style={{ fontFamily: "'Quedora', sans-serif" }}
          >
            SAM
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(paths.PATH_FREELANCER)}
            className="text-gray-500 hover:text-gray-900 font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer border-0 text-sm"
          >
            Thoát
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 md:px-8 py-8 mb-24 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto">
          {/* Notification Banners */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3 shadow-sm">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => navigate(paths.PATH_FREELANCER_JOBS)}
                className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer border-0"
              >
                Khám phá việc làm &rarr;
              </button>
            </div>
          )}

          {isLoadingProfile ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#0047FF] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Đang tải hồ sơ của bạn...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Paper CV Card */}
              <div className="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-10 space-y-8">
                {/* Section 1: User Identity Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-gray-100">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#1D4ED8] to-[#00A3FF] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md shrink-0">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'FL'}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {user?.fullName || 'Freelancer'}
                      </h1>
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-100 w-fit self-center sm:self-auto">
                        Tài khoản Freelancer
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400 pt-1">
                      Hoàn thiện hồ sơ để thuật toán AI Matching đề xuất các dự án phù hợp nhất với
                      bạn.
                    </p>
                  </div>
                </div>

                {/* Section 2: Headline & Hourly Rate */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Headline */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="headline"
                      className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
                    >
                      Tiêu đề nghề nghiệp (Headline) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="headline"
                      type="text"
                      {...register('headline')}
                      placeholder="VD: Senior Frontend React & TypeScript Developer"
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition ${
                        errors.headline
                          ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                          : 'border-gray-200 focus:border-[#0047FF] focus:ring-1 focus:ring-[#0047FF] bg-gray-50/40 focus:bg-white'
                      }`}
                    />
                    {errors.headline && (
                      <p className="mt-1.5 text-xs text-red-500">{errors.headline.message}</p>
                    )}
                  </div>

                  {/* Hourly Rate */}
                  <div>
                    <label
                      htmlFor="hourlyRate"
                      className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
                    >
                      Mức giá theo giờ ($/h)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-semibold text-sm">
                        $
                      </span>
                      <input
                        id="hourlyRate"
                        type="number"
                        step="0.5"
                        min="0"
                        {...register('hourlyRate', {
                          valueAsNumber: true,
                        })}
                        placeholder="25.00"
                        className="w-full pl-8 pr-12 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0047FF] focus:ring-1 focus:ring-[#0047FF] bg-gray-50/40 focus:bg-white transition"
                      />
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400 text-xs font-medium">
                        / giờ
                      </span>
                    </div>
                    {errors.hourlyRate && (
                      <p className="mt-1.5 text-xs text-red-500">{errors.hourlyRate.message}</p>
                    )}
                  </div>
                </div>

                {/* Section 3: Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"
                  >
                    Giới thiệu bản thân (Bio)
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    {...register('bio')}
                    placeholder="Mô tả thế mạnh, các dự án tiêu biểu và lý do khách hàng nên chọn bạn..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0047FF] focus:ring-1 focus:ring-[#0047FF] bg-gray-50/40 focus:bg-white transition resize-y"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    AI sẽ phân tích đoạn giới thiệu này để tìm kiếm dự án có yêu cầu tương ứng.
                  </p>
                </div>

                {/* Section 4: Professional Links */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                    Liên kết chuyên nghiệp
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* GitHub URL */}
                    <div>
                      <label
                        htmlFor="githubUrl"
                        className="block text-xs font-medium text-gray-500 mb-1.5"
                      >
                        GitHub Profile URL
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path
                              fillRule="evenodd"
                              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <input
                          id="githubUrl"
                          type="url"
                          {...register('githubUrl')}
                          placeholder="https://github.com/username"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0047FF] focus:ring-1 focus:ring-[#0047FF] bg-gray-50/40 focus:bg-white transition"
                        />
                      </div>
                      {errors.githubUrl && (
                        <p className="mt-1 text-xs text-red-500">{errors.githubUrl.message}</p>
                      )}
                    </div>

                    {/* Portfolio URL */}
                    <div>
                      <label
                        htmlFor="portfolioUrl"
                        className="block text-xs font-medium text-gray-500 mb-1.5"
                      >
                        Portfolio / Website Cá nhân
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                          </svg>
                        </span>
                        <input
                          id="portfolioUrl"
                          type="url"
                          {...register('portfolioUrl')}
                          placeholder="https://myportfolio.dev"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0047FF] focus:ring-1 focus:ring-[#0047FF] bg-gray-50/40 focus:bg-white transition"
                        />
                      </div>
                      {errors.portfolioUrl && (
                        <p className="mt-1 text-xs text-red-500">{errors.portfolioUrl.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 5: Skills & Experience */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Kỹ năng & Số năm kinh nghiệm
                    </h3>
                    <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 w-fit">
                      Đồng bộ ghi đè toàn bộ kỹ năng
                    </span>
                  </div>

                  {/* Add skill input row */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-7">
                        <label
                          htmlFor="skillSelect"
                          className="block text-xs font-semibold text-gray-600 mb-1"
                        >
                          Chọn kỹ năng
                        </label>
                        <select
                          id="skillSelect"
                          value={selectedSkillId}
                          onChange={(e) =>
                            setSelectedSkillId(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#0047FF]"
                        >
                          <option value="">-- Chọn kỹ năng phù hợp --</option>
                          {PREDEFINED_SKILLS.map((skill: SkillOption) => (
                            <option key={skill.id} value={skill.id}>
                              {skill.name} {skill.category ? `(${skill.category})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="skillYears"
                          className="block text-xs font-semibold text-gray-600 mb-1"
                        >
                          Số năm kinh nghiệm
                        </label>
                        <input
                          id="skillYears"
                          type="number"
                          min="0"
                          max="50"
                          value={skillExperience}
                          onChange={(e) => setSkillExperience(Math.max(0, Number(e.target.value)))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#0047FF]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          disabled={selectedSkillId === ''}
                          className="w-full bg-[#1D4ED8] hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors cursor-pointer border-0 shadow-sm"
                        >
                          + Thêm
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Skills List */}
                  {fields.length === 0 ? (
                    <div className="p-6 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-xs">
                      Chưa có kỹ năng nào được chọn. Hãy thêm ít nhất 1 kỹ năng chính để nhận dự án.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {fields.map((field, index) => {
                        const matchedSkill = PREDEFINED_SKILLS.find((s) => s.id === field.skillId);
                        return (
                          <div
                            key={field.id}
                            className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs hover:border-blue-300 transition-colors"
                          >
                            <div className="space-y-0.5">
                              <span className="text-sm font-bold text-gray-800">
                                {matchedSkill
                                  ? matchedSkill.name
                                  : field.skillName || `Skill #${field.skillId}`}
                              </span>
                              <div className="text-xs text-blue-600 font-medium">
                                {field.yearsOfExperience} năm kinh nghiệm
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent"
                              title="Xóa kỹ năng này"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Fixed Action Bar */}
              <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 md:px-10 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-40">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(paths.PATH_FREELANCER)}
                    className="flex items-center gap-2 text-gray-600 font-bold hover:text-gray-900 transition-colors px-4 py-2 cursor-pointer border-0 bg-transparent text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Quay lại
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] hover:opacity-95 text-white font-semibold text-sm px-8 py-3 rounded-full hover:shadow-[0_8px_25px_rgba(0,178,255,0.4)] transition-all disabled:opacity-50 cursor-pointer border-0 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <span>{isDirty ? 'Lưu thay đổi' : 'Cập nhật hồ sơ'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateFreelancerProfilePage;
