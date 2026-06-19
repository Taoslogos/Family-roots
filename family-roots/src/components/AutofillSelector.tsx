/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Person, Language } from '../types';
import { ChevronDown, X } from 'lucide-react';

interface AutofillSelectorProps {
  candidates: Person[];
  selectedId: string;
  onSelect: (id: string | '') => void;
  placeholder: string;
  lang: Language;
}

export default function AutofillSelector({
  candidates,
  selectedId,
  onSelect,
  placeholder,
  lang,
}: AutofillSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync selectedId to represent chosen person name in query state
  useEffect(() => {
    if (selectedId) {
      const match = candidates.find((c) => c.id === selectedId);
      if (match) {
        setSearchQuery(
          lang === 'en'
            ? `${match.firstNameEnglish} ${match.lastNameEnglish}`
            : `${match.firstNameAmharic} ${match.lastNameAmharic}`
        );
      } else {
        setSearchQuery('');
      }
    } else {
      setSearchQuery('');
    }
  }, [selectedId, candidates, lang]);

  // Click outside listener for auto closing list dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset query text back to selected name if query is left raw/dirty
        if (selectedId) {
          const match = candidates.find((c) => c.id === selectedId);
          if (match) {
            setSearchQuery(
              lang === 'en'
                ? `${match.firstNameEnglish} ${match.lastNameEnglish}`
                : `${match.firstNameAmharic} ${match.lastNameAmharic}`
            );
          }
        } else {
          setSearchQuery('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedId, candidates, lang]);

  // Filter candidates matching current user keyboard inputs
  const filteredCandidates = candidates.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const nameEng = `${item.firstNameEnglish} ${item.lastNameEnglish}`.toLowerCase();
    const nameAmh = `${item.firstNameAmharic} ${item.lastNameAmharic}`.toLowerCase();

    return nameEng.includes(query) || nameAmh.includes(query);
  });

  return (
    <div ref={containerRef} className="relative w-full text-zinc-800 dark:text-zinc-200">
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // Open the suggestions while typing
            setIsOpen(true);
            // If completely cleared, trigger reset on select to parent
            if (!e.target.value) {
              onSelect('');
            }
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full text-xs pr-16 pl-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded outline-none focus:ring-1 focus:ring-orange-500 font-sans cursor-text"
        />

        {/* Clear input button */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onSelect('');
              setIsOpen(false);
            }}
            className="absolute right-7 p-1 hover:text-zinc-500 text-zinc-400 cursor-pointer focus:outline-none"
            title="Clear Selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Small arrow picker trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="absolute right-0 h-full px-2.5 flex items-center justify-center border-l border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-r cursor-pointer focus:outline-none"
          title="Open suggestions list"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg shadow-xl max-h-56 overflow-y-auto animate-fadeIn divide-y divide-zinc-50 dark:divide-zinc-900/50">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => {
              const matchesSelected = candidate.id === selectedId;
              const name =
                lang === 'en'
                  ? `${candidate.firstNameEnglish} ${candidate.lastNameEnglish}`
                  : `${candidate.firstNameAmharic} ${candidate.lastNameAmharic}`;
              const birthYear = candidate.birthDate
                ? new Date(candidate.birthDate).getFullYear()
                : (lang === 'en' ? 'Unknown' : 'ያልታወቀ');

              return (
                <div
                  key={candidate.id}
                  onClick={() => {
                    onSelect(candidate.id);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-xs text-left cursor-pointer transition-colors flex items-center justify-between ${
                    matchesSelected
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold truncate">{name}</p>
                    <p className="text-[10px] text-zinc-400">
                      {lang === 'en' ? 'Born' : 'የልደት ዓመት'}: {birthYear}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                    {candidate.gender === 'male' ? 'Male' : candidate.gender === 'female' ? 'Female' : 'Other'}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="px-3 py-3 text-xs text-zinc-400 italic text-center">
              {lang === 'en' ? 'No matching people found' : 'ምንም ወገን አልተገኘም'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
