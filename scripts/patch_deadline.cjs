const fs = require('node:fs');
let content = fs.readFileSync('src/pages/PostProjectPage.tsx', 'utf8');

const deadlineBlock = [
  '',
  '',
  '              {/* H\u1ea1n ch\u00f3t nh\u1eadn \u1ee9ng tuy\u1ec3n */}',
  '              <div className="border-t border-gray-100 pt-6">',
  '                <div className="flex items-center gap-2 mb-1">',
  '                  <svg className="w-4 h-4 text-[#1D4ED8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>',
  '                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />',
  '                  </svg>',
  '                  <label htmlFor="project-deadline" className="text-sm font-bold text-gray-900">',
  '                    H\u1ea1n ch\u00f3t nh\u1eadn \u1ee9ng tuy\u1ec3n',
  '                    <span className="text-gray-400 font-normal ml-2 text-xs">(kh\u00f4ng b\u1eaft bu\u1ed9c)</span>',
  '                  </label>',
  '                </div>',
  '                <p className="text-xs text-gray-500 mb-3 ml-6">',
  '                  Sau ng\u00e0y n\u00e0y, d\u1ef1 \u00e1n s\u1ebd t\u1ef1 \u0111\u1ed9ng ng\u01b0ng nh\u1eadn h\u1ed3 s\u01a1. T\u1ed1i \u0111a 30 ng\u00e0y k\u1ec3 t\u1eeb h\u00f4m nay.',
  '                </p>',
  '                <input',
  '                  type="date"',
  '                  id="project-deadline"',
  '                  value={deadline}',
  "                  min={new Date().toISOString().split('T')[0]}",
  "                  max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}",
  '                  onChange={(e) => setDeadline(e.target.value)}',
  '                  className="ml-6 w-full md:w-64 px-4 py-2.5 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all"',
  '                />',
  '              </div>',
].join('\n');

const firstIdx = content.indexOf(deadlineBlock);
if (firstIdx === -1) {
  console.log('Block NOT FOUND');
  process.exit(1);
}
const secondIdx = content.indexOf(deadlineBlock, firstIdx + 1);
if (secondIdx === -1) {
  console.log('No duplicate - OK');
  process.exit(0);
}

content = content.slice(0, secondIdx) + content.slice(secondIdx + deadlineBlock.length);
fs.writeFileSync('src/pages/PostProjectPage.tsx', content, 'utf8');
console.log('Removed duplicate');
