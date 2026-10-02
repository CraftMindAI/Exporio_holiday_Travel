'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  invalid?: boolean;
  /** Extra classes for the trigger box, merged over the defaults */
  className?: string;
  /** Open the option list above the box (for fields near the bottom of a clipped container) */
  dropUp?: boolean;
}

export default function MultiSelect({ options, value, onChange, placeholder, invalid, className, dropUp }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (option: string) => {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={twMerge(
          'w-full min-h-[42px] sm:min-h-[46px] bg-slate-800/80 border border-slate-600 rounded-lg pl-3 sm:pl-4 pr-9 py-1.5 text-left text-sm focus:outline-none focus:border-primaryCyan flex flex-wrap items-center gap-1.5 relative',
          className,
          open && 'border-primaryCyan',
          invalid && 'border-red-500'
        )}
      >
        {value.length === 0 ? (
          <span className="text-slate-200 py-1">{placeholder}</span>
        ) : (
          value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 bg-primaryCyan/15 text-primaryCyan border border-primaryCyan/30 text-xs font-semibold pl-2 pr-1 py-0.5 rounded-md"
            >
              {v}
              <span
                role="button"
                tabIndex={-1}
                aria-label={`Remove ${v}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(v);
                }}
                className="rounded hover:bg-primaryCyan/20 p-0.5"
              >
                <X className="w-3 h-3" />
              </span>
            </span>
          ))
        )}
        <ChevronDown
          className={`w-4 h-4 text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          className={`absolute z-30 left-0 right-0 ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'} max-h-56 overflow-y-auto bg-navyDark border border-slate-600 rounded-lg shadow-2xl py-1`}
        >
          {options.map((option) => {
            const selected = value.includes(option);
            return (
              <li key={option} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => toggle(option)}
                  className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 text-sm text-left transition-colors hover:bg-slate-800 ${
                    selected ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      selected ? 'bg-primaryCyan border-primaryCyan' : 'border-slate-500'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </span>
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
