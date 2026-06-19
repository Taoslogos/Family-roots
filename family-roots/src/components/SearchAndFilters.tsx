/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Person, Language, SearchFilters } from '../types';
import { getTranslation } from '../lib/sampleData';
import { Search, SlidersHorizontal, Calendar, MapPin, Sparkles, FilterX } from 'lucide-react';

interface SearchAndFiltersProps {
  people: Person[];
  lang: Language;
  onSelectPerson: (id: string) => void;
  selectedPersonId: string | null;
}

export default function SearchAndFilters({
  people,
  lang,
  onSelectPerson,
  selectedPersonId,
}: SearchAndFiltersProps) {
  const [query, setQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [birthYearStart, setBirthYearStart] = useState('');
  const [birthYearEnd, setBirthYearEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all'); // Holds ancestor ID representing branch root
  const [showCollapseFilters, setShowCollapseFilters] = useState(false);

  // Determine possible branches (children of the root ancestor, i.e Alemayehu & Tsehai)
  // Our primary root ancestors are those with no parent. Let's find their children as prime branches!
  const rootAncestors = people.filter((p) => !p.fatherId && !p.motherId);
  const rootIds = rootAncestors.map((p) => p.id);
  const primaryBranches = people.filter(
    (p) => (p.fatherId && rootIds.includes(p.fatherId)) || (p.motherId && rootIds.includes(p.motherId))
  );

  // Recursive helper to check if a person is a descendant of a branch primary ancestor
  const isDescendantOf = (personId: string, branchRootId: string): boolean => {
    if (personId === branchRootId) return true;
    const person = people.find((p) => p.id === personId);
    if (!person) return false;

    if (person.fatherId === branchRootId || person.motherId === branchRootId) return true;

    // Check upwards
    let matches = false;
    if (person.fatherId) {
      matches = matches || isDescendantOf(person.fatherId, branchRootId);
    }
    if (person.motherId) {
      matches = matches || isDescendantOf(person.motherId, branchRootId);
    }
    return matches;
  };

  // Filter Logic
  const filteredPeople = people.filter((p) => {
    // 1. Text Query (English/Amharic name & nickname match)
    const text = query.toLowerCase().trim();
    if (text) {
      const matchEng = `${p.firstNameEnglish} ${p.lastNameEnglish}`.toLowerCase().includes(text);
      const matchAmh = `${p.firstNameAmharic} ${p.lastNameAmharic}`.toLowerCase().includes(text);
      const matchNickEng = p.nicknameEnglish?.toLowerCase().includes(text);
      const matchNickAmh = p.nicknameAmharic?.toLowerCase().includes(text);
      
      if (!matchEng && !matchAmh && !matchNickEng && !matchNickAmh) {
        return false;
      }
    }

    // 2. Gender
    if (genderFilter !== 'all' && p.gender !== genderFilter) {
      return false;
    }

    // 3. Status (Living/Deceased)
    if (statusFilter === 'living' && !p.isLiving) return false;
    if (statusFilter === 'deceased' && p.isLiving) return false;

    // 4. Birth Year Limit Range
    if (p.birthDate) {
      const birthYear = new Date(p.birthDate).getFullYear();
      if (birthYearStart && birthYear < parseInt(birthYearStart, 10)) return false;
      if (birthYearEnd && birthYear > parseInt(birthYearEnd, 10)) return false;
    } else if (birthYearStart || birthYearEnd) {
      // If user wants to filter by years but person doesn't have birthdate, exclude them
      return false;
    }

    // 5. Ancestry Branch Filter
    if (branchFilter !== 'all') {
      if (!isDescendantOf(p.id, branchFilter)) return false;
    }

    return true;
  });

  const handleClearFilters = () => {
    setQuery('');
    setGenderFilter('all');
    setBirthYearStart('');
    setBirthYearEnd('');
    setStatusFilter('all');
    setBranchFilter('all');
  };

  const getCardPhoto = (p: Person) => {
    const primary = p.photos?.find((ph) => ph.isPrimary);
    if (primary) return primary.url;
    if (p.photos && p.photos.length > 0) return p.photos[0].url;

    // Fallback SVG colors
    const initials = (p.firstNameEnglish.substring(0, 2)).toUpperCase();
    let fill = '%236b7280';
    if (p.gender === 'male') fill = '%232563eb';
    if (p.gender === 'female') fill = '%23db2777';
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="${fill}"><rect width="100" height="100"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">${initials}</text></svg>`;
  };

  return (
    <div className="space-y-4">
      {/* Search Input and Collapsible toggle Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getTranslation('searchPlaceholder', lang)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 text-zinc-800 dark:text-zinc-200"
          />
        </div>

        <button
          onClick={() => setShowCollapseFilters(!showCollapseFilters)}
          className={`px-3.5 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            showCollapseFilters || genderFilter !== 'all' || statusFilter !== 'all' || branchFilter !== 'all' || birthYearStart || birthYearEnd
              ? 'border-orange-500/50 bg-orange-50/50 text-orange-660 dark:bg-orange-950/20 dark:text-orange-400'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Collapsed Detailed Parameters selectors */}
      {(showCollapseFilters || genderFilter !== 'all' || statusFilter !== 'all' || branchFilter !== 'all' || birthYearStart || birthYearEnd) && (
        <div className="border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-fadeIn">
          
          {/* Branch filtering */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{lang === 'en' ? 'Family branch filter' : 'የቤተሰብ ቅርንጫፍ'}</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full border p-1.5 text-xs rounded dark:bg-zinc-900 dark:border-zinc-800 cursor-pointer text-zinc-700 dark:text-zinc-300"
            >
              <option value="all">{getTranslation('allBranches', lang)}</option>
              {primaryBranches.map((pb) => (
                <option key={pb.id} value={pb.id}>
                  {lang === 'en' ? `${pb.firstNameEnglish}'s Branch` : `የ${pb.firstNameAmharic} ዘር ቅርንጫፍ`}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{getTranslation('genderLabel', lang)}</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full border p-1.5 text-xs rounded dark:bg-zinc-900 dark:border-zinc-800 cursor-pointer text-zinc-700 dark:text-zinc-300"
            >
              <option value="all">{lang === 'en' ? 'All Genders' : 'ሁሉም ጾታ'}</option>
              <option value="male">{getTranslation('male', lang)}</option>
              <option value="female">{getTranslation('female', lang)}</option>
              <option value="other">{getTranslation('other', lang)}</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{lang === 'en' ? 'Life Status' : 'ሁኔታ'}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border p-1.5 text-xs rounded dark:bg-zinc-900 dark:border-zinc-800 cursor-pointer text-zinc-700 dark:text-zinc-300"
            >
              <option value="all">{lang === 'en' ? 'All Statuses' : 'ყველა অবস্থা'}</option>
              <option value="living">{getTranslation('living', lang)}</option>
              <option value="deceased">{getTranslation('deceased', lang)}</option>
            </select>
          </div>

          {/* Birth year start/end bounds */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{getTranslation('birthYearRange', lang)}</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="From"
                value={birthYearStart}
                onChange={(e) => setBirthYearStart(e.target.value)}
                className="w-full border rounded p-1 text-xs dark:bg-zinc-900 dark:border-zinc-800 text-center text-zinc-850 dark:text-zinc-300"
              />
              <span className="text-zinc-400 text-xs">-</span>
              <input
                type="number"
                placeholder="To"
                value={birthYearEnd}
                onChange={(e) => setBirthYearEnd(e.target.value)}
                className="w-full border rounded p-1 text-xs dark:bg-zinc-900 dark:border-zinc-800 text-center text-zinc-850 dark:text-zinc-300"
              />
            </div>
          </div>

          {/* Clean state trigger button */}
          <div className="col-span-1 sm:col-span-2 md:col-span-4 flex justify-end pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 mt-1">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-[11px] font-semibold text-zinc-505 hover:text-red-500 px-2 py-1 select-none transition-colors border rounded"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Clear Filter constraints</span>
            </button>
          </div>

        </div>
      )}

      {/* Output Results Grid */}
      {filteredPeople.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredPeople.map((p) => {
            const isSelected = selectedPersonId === p.id;
            const bYear = p.birthDate ? new Date(p.birthDate).getFullYear() : null;
            const dYear = p.deathDate ? new Date(p.deathDate).getFullYear() : (p.isLiving ? null : 'Deceased');

            return (
              <div
                key={p.id}
                onClick={() => onSelectPerson(p.id)}
                className={`flex gap-3 bg-white dark:bg-zinc-900 border p-3 rounded-lg hover:shadow cursor-pointer transition duration-200 items-center border-zinc-200 dark:border-zinc-850 ${
                  isSelected ? 'ring-2 ring-orange-500 border-orange-500' : ''
                }`}
              >
                {/* Micro miniature avatar */}
                <div className="w-11 h-11 rounded overflow-hidden shadow-inner border dark:border-zinc-800 shrink-0 select-none">
                  <img
                    src={getCardPhoto(p)}
                    alt={p.firstNameEnglish}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="truncate flex-1">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate font-sans tracking-tight">
                    {lang === 'en' ? `${p.firstNameEnglish} ${p.lastNameEnglish}` : `${p.firstNameAmharic} ${p.lastNameAmharic}`}
                  </h4>
                  
                  {/* Lifespan */}
                  <span className="text-[10px] font-mono text-zinc-400 font-semibold block uppercase">
                    {bYear ? `${bYear} - ${dYear || (lang === 'en' ? 'Living' : 'በህይወት')}` : 'Lifespan blank'}
                  </span>
                  
                  {/* Nickname */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {p.nicknameEnglish && (
                      <span className="text-[9px] font-serif italic text-zinc-400 truncate max-w-[120px]">
                        "{lang === 'en' ? p.nicknameEnglish : p.nicknameAmharic}"
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-50 dark:bg-zinc-950/30 border border-dashed rounded-xl p-8 text-center text-zinc-450 dark:border-zinc-850 text-xs">
          {getTranslation('noResults', lang)}
        </div>
      )}
    </div>
  );
}
