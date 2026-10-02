'use client';

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type SelectOption = { value: string; label: string };

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Shown when no option matches `value` */
  placeholder?: string;
  /** Accessible name when there's no visible <label> */
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  /** Extra classes for the trigger button, merged over the defaults */
  className?: string;
  /** Show a search box that filters the options */
  searchable?: boolean;
  /** Number of option rows visible before the list scrolls (default ~6.5) */
  maxVisible?: number;
}

const ROW_HEIGHT = 32; // matches the option rows (py-2 + 16px line)
const SEARCH_HEIGHT = 44;

/**
 * Custom single-choice dropdown (replaces native <select>).
 * The option list renders in a portal so it isn't clipped by scrolling tables or cards.
 */
export default function Select({ options: allOptions, value, onChange, placeholder = 'Select…', ariaLabel, id, disabled, className, searchable, maxVisible }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; up: boolean } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: '', at: 0 });
  const listId = useId();

  const q = query.trim().toLowerCase();
  const options = searchable && q ? allOptions.filter((o) => o.label.toLowerCase().includes(q)) : allOptions;
  const selected = allOptions.find((o) => o.value === value) ?? null;
  const selectedIndex = options.findIndex((o) => o.value === value);
  const listMaxHeight = maxVisible ? maxVisible * ROW_HEIGHT + 8 : 256;
  const menuMaxHeight = listMaxHeight + (searchable ? SEARCH_HEIGHT : 0);

  const place = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom;
    const up = spaceBelow < Math.min(menuMaxHeight, allOptions.length * ROW_HEIGHT + 8) && rect.top > spaceBelow;
    setPos({ top: up ? rect.top : rect.bottom, left: rect.left, width: rect.width, up });
  }, [allOptions.length, menuMaxHeight]);

  const openMenu = (index = selectedIndex) => {
    if (disabled) return;
    place();
    setQuery('');
    setActive(index >= 0 ? index : 0);
    setOpen(true);
  };

  const close = (focusButton = true) => {
    setOpen(false);
    setQuery('');
    if (focusButton) buttonRef.current?.focus();
  };

  // Searchable menus move focus into the search box when they open
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  const choose = (index: number) => {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    close();
  };

  // Keep the menu attached to the button while scrolling / resizing; close on outside click
  useLayoutEffect(() => {
    if (!open) return;
    place();
    const onMove = () => place();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !listRef.current?.contains(t)) close(false);
    };
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    document.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open, place]);

  // Scroll the highlighted option into view
  useEffect(() => {
    if (open && active >= 0) listRef.current?.querySelector(`#${CSS.escape(`${listId}-${active}`)}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, listId]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const last = options.length - 1;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openMenu(e.key === 'ArrowUp' ? (selectedIndex > 0 ? selectedIndex - 1 : 0) : selectedIndex);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(last);
        break;
      case 'Enter':
        e.preventDefault();
        choose(active);
        break;
      case ' ':
        if (searchable) break; // typing a space in the search box
        e.preventDefault();
        choose(active);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        close(false);
        break;
      default:
        // Type-ahead: jump to the first option starting with the typed text
        if (!searchable && e.key.length === 1) {
          const now = Date.now();
          const t = typeahead.current;
          t.text = now - t.at > 700 ? e.key.toLowerCase() : t.text + e.key.toLowerCase();
          t.at = now;
          const match = options.findIndex((o) => o.label.toLowerCase().startsWith(t.text));
          if (match >= 0) setActive(match);
        }
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        className={twMerge(
          'relative w-full bg-slate-900 border border-slate-700 rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-left text-white focus:outline-none focus:border-primaryCyan disabled:opacity-60 disabled:cursor-not-allowed',
          open && 'border-primaryCyan',
          className,
        )}
      >
        <span className={`block truncate ${selected ? '' : 'text-slate-400'}`}>{selected?.label ?? placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 opacity-70 absolute right-3 top-1/2 -translate-y-1/2 transition-transform pointer-events-none ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={listRef}
            style={{
              position: 'fixed',
              left: pos.left,
              width: Math.max(pos.width, 160),
              ...(pos.up ? { bottom: window.innerHeight - pos.top + 4 } : { top: pos.top + 4 }),
            }}
            className="z-[100] bg-navyDark border border-slate-600 rounded-lg shadow-2xl overflow-hidden"
          >
          {searchable && (
            <div className="p-1.5 border-b border-slate-700">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search…"
                aria-label={`Search ${ariaLabel ?? 'options'}`}
                aria-controls={listId}
                aria-activedescendant={active >= 0 && options[active] ? `${listId}-${active}` : undefined}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
              />
            </div>
          )}
          <ul
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            style={{ maxHeight: listMaxHeight }}
            className="overflow-y-auto py-1"
          >
            {options.length === 0 && <li className="px-3.5 py-2 text-xs text-slate-500">No matches</li>}
            {options.map((option, i) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                    i === active ? 'bg-slate-800 text-white' : isSelected ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primaryCyan flex-shrink-0" strokeWidth={3} />}
                </li>
              );
            })}
          </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
