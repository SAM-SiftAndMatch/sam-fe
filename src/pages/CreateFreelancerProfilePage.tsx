import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../routes/paths';

const CreateFreelancerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    displayName: '',
    title: '',
    about: '',
    skills: '',
    experience: '',
    education: '',
    certifications: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));

    if (e.target.tagName.toLowerCase() === 'textarea') {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="w-full h-14 px-6 md:px-10 flex items-center justify-between border-b border-gray-200 bg-white sticky top-0 z-50">
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
        <button
          type="button"
          onClick={() => navigate(paths.PATH_FREELANCER)}
          className="text-gray-500 hover:text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-0"
        >
          Exit
        </button>
      </header>

      {/* Main Content - CV A4 Format */}
      <main className="flex-1 w-full px-4 md:px-8 py-8 mb-24 overflow-y-auto">
        <div className="w-[90%] max-w-3xl mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8">
          {/* Section 1: Header (Avatar, Name, Title) */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 mb-6">
            <div className="relative group cursor-pointer w-20 h-20 md:w-24 md:h-24 shrink-0">
              <div className="w-full h-full rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-500 transition-all overflow-hidden">
                <svg
                  className="w-8 h-8 mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-xs font-medium">Add Photo</span>
              </div>
            </div>
            <div className="flex-1 w-full space-y-4 pt-2">
              <input
                type="text"
                name="displayName"
                value={profile.displayName}
                onChange={handleChange}
                placeholder="Tên hiển thị của bạn..."
                className="w-full text-2xl font-black text-gray-900 placeholder:text-gray-300 border-0 border-b-2 border-transparent hover:border-gray-200 focus:border-[#1D4ED8] focus:ring-0 px-0 py-1 transition-colors bg-transparent outline-none"
              />
              <input
                type="text"
                name="title"
                value={profile.title}
                onChange={handleChange}
                placeholder="Chức danh (VD: Senior Frontend Developer)..."
                className="w-full text-base font-medium text-gray-600 placeholder:text-gray-300 border-0 border-b-2 border-transparent hover:border-gray-200 focus:border-[#1D4ED8] focus:ring-0 px-0 py-1 transition-colors bg-transparent outline-none"
              />
            </div>
          </div>

          <hr className="border-gray-200 mb-8" />

          {/* Section 2: About */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
              Giới thiệu bản thân (About)
            </h2>
            <textarea
              name="about"
              value={profile.about}
              onChange={handleChange}
              rows={1}
              placeholder="Chia sẻ một vài điều về bản thân, kinh nghiệm và mục tiêu nghề nghiệp của bạn..."
              className="w-full text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 border border-transparent hover:border-gray-200 focus:border-[#1D4ED8] focus:bg-white rounded-xl p-4 overflow-hidden resize-none outline-none transition-all"
            />
          </div>

          {/* Section 3: Skills and expertise */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Kỹ năng & Chuyên môn
              </h2>
              <button className="text-[#1D4ED8] text-sm font-semibold flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0">
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
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                Add File
              </button>
            </div>
            <textarea
              name="skills"
              value={profile.skills}
              onChange={handleChange}
              rows={1}
              placeholder="Liệt kê các kỹ năng chính của bạn (VD: React, Node.js, UI/UX Design...)"
              className="w-full text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 border border-transparent hover:border-gray-200 focus:border-[#1D4ED8] focus:bg-white rounded-xl p-4 overflow-hidden resize-none outline-none transition-all"
            />
          </div>

          {/* Section 4: Work experience */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Kinh nghiệm làm việc
              </h2>
              <button className="text-[#1D4ED8] text-sm font-semibold flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0">
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
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                Add File
              </button>
            </div>
            <textarea
              name="experience"
              value={profile.experience}
              onChange={handleChange}
              rows={1}
              placeholder="Mô tả các dự án hoặc công ty bạn đã từng làm việc..."
              className="w-full text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 border border-transparent hover:border-gray-200 focus:border-[#1D4ED8] focus:bg-white rounded-xl p-4 overflow-hidden resize-none outline-none transition-all"
            />
          </div>

          {/* Section 5: Education and Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Education */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  Học vấn
                </h2>
                <button className="text-[#1D4ED8] text-sm font-semibold flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0">
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
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  Add File
                </button>
              </div>
              <textarea
                name="education"
                value={profile.education}
                onChange={handleChange}
                rows={1}
                placeholder="Trường đại học, chuyên ngành..."
                className="w-full text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 border border-transparent hover:border-gray-200 focus:border-[#1D4ED8] focus:bg-white rounded-xl p-4 overflow-hidden resize-none outline-none transition-all"
              />
            </div>

            {/* Certifications */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  Chứng chỉ
                </h2>
                <button className="text-[#1D4ED8] text-sm font-semibold flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0">
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
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  Add File
                </button>
              </div>
              <textarea
                name="certifications"
                value={profile.certifications}
                onChange={handleChange}
                rows={1}
                placeholder="Các chứng chỉ chuyên môn (IELTS, AWS,...)"
                className="w-full text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 border border-transparent hover:border-gray-200 focus:border-[#1D4ED8] focus:bg-white rounded-xl p-4 overflow-hidden resize-none outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 md:px-10 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-40">
        <div className="w-full flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(paths.PATH_FREELANCER)}
            className="flex items-center gap-2 text-gray-600 font-bold hover:text-gray-900 transition-colors px-4 py-2 cursor-pointer border-0 bg-transparent"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          <button
            type="button"
            className="bg-gradient-to-r from-[#1D4ED8] to-[#00B2FF] text-white font-semibold text-sm md:text-base px-6 py-2.5 rounded-full hover:shadow-[0_8px_25px_rgba(0,178,255,0.4)] transition-all cursor-pointer border-0"
          >
            Upload profile
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CreateFreelancerProfilePage;
