import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { type BankOption, VIETNAM_BANKS, normalizeBankCode } from '../../lib/banks';
import { inputClass } from './FinanceUI';

const searchText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export default function BankSelect({
  value,
  onChange,
  id,
  'aria-describedby': describedBy,
}: {
  value: string;
  onChange: (code: string) => void;
  id?: string;
  'aria-describedby'?: string;
}) {
  const listId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const canonicalValue = normalizeBankCode(value);
  const selected = VIETNAM_BANKS.find((bank) => bank.code === canonicalValue);
  const keyword = searchText(normalizeBankCode(query));
  const rank = (bank: BankOption) => {
    const code = searchText(bank.code);
    if (code === keyword) return 0;
    return code.startsWith(keyword) || searchText(bank.name).startsWith(keyword) ? 1 : 2;
  };
  const matches = VIETNAM_BANKS.filter((bank) =>
    searchText(`${bank.name} ${bank.code}`).includes(keyword)
  ).sort((first, second) => rank(first) - rank(second));
  const activeBank = matches[activeIndex];

  useEffect(() => {
    if (open) search.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open && activeBank) {
      document.getElementById(`${listId}-${activeBank.code}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, activeBank, listId]);

  const show = () => {
    setQuery('');
    setActiveIndex(
      Math.max(
        0,
        VIETNAM_BANKS.findIndex((bank) => bank.code === canonicalValue)
      )
    );
    setOpen(true);
  };
  const choose = (code: string) => {
    onChange(code);
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        id={id}
        type="button"
        aria-describedby={describedBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            show();
          }
        }}
        className={`${inputClass} flex cursor-pointer items-center justify-between gap-3 text-left`}
      >
        <span>{selected ? `${selected.name} (${selected.code})` : `${value} (đang lưu)`}</span>
        <ChevronDown size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="relative border-b border-slate-100 p-2">
            <Search
              size={16}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              ref={search}
              type="text"
              role="combobox"
              aria-label="Tìm ngân hàng"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listId}
              aria-activedescendant={activeBank ? `${listId}-${activeBank.code}` : undefined}
              autoComplete="off"
              placeholder="Nhập tên hoặc mã ngân hàng…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  setOpen(false);
                  trigger.current?.focus();
                } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  if (matches.length) {
                    const direction = event.key === 'ArrowDown' ? 1 : -1;
                    setActiveIndex(
                      (index) => (index + direction + matches.length) % matches.length
                    );
                  }
                } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  const bank = matches[activeIndex];
                  if (bank) choose(bank.code);
                }
              }}
              className={`${inputClass} pl-9`}
            />
          </div>
          <div
            id={listId}
            // biome-ignore lint/a11y/useSemanticElements: Custom combobox keeps keyboard focus in the search input.
            role="listbox"
            tabIndex={-1}
            aria-label="Ngân hàng nhận tiền"
            className="max-h-52 overflow-y-auto p-1"
          >
            {matches.map((bank, index) => (
              <div key={bank.code} role="presentation">
                <button
                  id={`${listId}-${bank.code}`}
                  type="button"
                  // biome-ignore lint/a11y/useSemanticElements: Native options require a select, which cannot host the search input.
                  role="option"
                  aria-selected={canonicalValue === bank.code}
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(bank.code)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-blue-50 ${index === activeIndex ? 'bg-blue-50 text-blue-800' : 'text-slate-700'}`}
                >
                  <span>
                    {bank.name} ({bank.code})
                  </span>
                  {canonicalValue === bank.code && (
                    <Check size={16} className="shrink-0 text-blue-700" aria-hidden="true" />
                  )}
                </button>
              </div>
            ))}
          </div>
          {matches.length === 0 && (
            <output className="block px-4 py-3 text-sm text-slate-500">
              Không tìm thấy ngân hàng phù hợp.
            </output>
          )}
        </div>
      )}
    </div>
  );
}
