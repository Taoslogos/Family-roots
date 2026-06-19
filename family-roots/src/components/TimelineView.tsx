/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Person, Language } from '../types';
import { getTranslation } from '../lib/sampleData';
import { toEthiopic, parseIsoDateLocal } from '../lib/calendarUtils';
import { Clock, History, Gift, Milestone, Sparkles } from 'lucide-react';

interface TimelineViewProps {
  people: Person[];
  lang: Language;
  onSelectPerson: (id: string) => void;
  preferredCalendar: 'gregorian' | 'ethiopian';
}

interface TimelineEvent {
  year: number;
  type: 'birth' | 'death' | 'history';
  titleEnglish: string;
  titleAmharic: string;
  descriptionEnglish: string;
  descriptionAmharic: string;
  personId?: string;
}

// Fixed historical contextual markers to anchor genealogy
const ETHIOPIAN_HISTORY_EVENTS: TimelineEvent[] = [
  {
    year: 1896,
    type: 'history',
    titleEnglish: 'Victory of Adwa',
    titleAmharic: 'የዓድዋ ድል',
    descriptionEnglish: 'Ethiopian forces under Emperor Menelik II defeated colonialism, preserving Ethiopia’s sovereignty.',
    descriptionAmharic: 'የዓድዋ ድል በዳግማዊ አፄ ምኒልክ መሪነት ኢትዮጵያውያን ቅኝ ገዥውን ጦር ያሸነፉበት ታላቅ ክስተት።'
  },
  {
    year: 1930,
    type: 'history',
    titleEnglish: 'Coronation of Emperor Haile Selassie I',
    titleAmharic: 'የቀዳማዊ ኃይለ ሥላሴ ንግሥና',
    descriptionEnglish: 'Emperor Haile Selassie I is crowned, introducing modern educational developments.',
    descriptionAmharic: 'ቀዳማዊ ኃይለ ሥላሴ የኢትዮጵያ ንጉሠ ነገሥት በመሆን ዘመናዊ የሥልጣኔ ሥራዎችን ያስጀመሩበት።'
  },
  {
    year: 1941,
    type: 'history',
    titleEnglish: 'Liberation of Addis Ababa',
    titleAmharic: 'የአዲስ አበባ ነጻነት',
    descriptionEnglish: 'Allied and Ethiopian patriot forces liberated the capital, ending five years of fascist presence.',
    descriptionAmharic: 'የኢትዮጵያ ጀግኖች አገር ወዳዶች ዋና ከተማዋን አዲስ አበባን ከፋሺስት ወረራ ነጻ ያወጡበት።'
  },
  {
    year: 1974,
    type: 'history',
    titleEnglish: 'Ethiopian Revolution',
    titleAmharic: 'የ፲፱፻፷፯ ዓ.ም አብዮት',
    descriptionEnglish: 'The imperial reign is abolished, leading to major socio-political restructure and land acts.',
    descriptionAmharic: 'የኢትዮጵያ ንጉሠ ነገሥት አገዛዝ አብቅቶ ትልቅ የፖለቲካዊና የማህበረሰብ ለውጥ የመጣበት ታሪክ።'
  },
  {
    year: 1991,
    type: 'history',
    titleEnglish: 'Establishment of Transitional State',
    titleAmharic: 'ሽግግር መንግሥት ምሥረታ',
    descriptionEnglish: 'The governing structure transitioned, marking new directions for regional state definitions.',
    descriptionAmharic: 'አዲስ የሀገሪቱ የሽግግር ወቅት የተጀመረበትና የፌደራል አስተዳደር የተወለደበት ዓመት።'
  },
  {
    year: 2007,
    type: 'history',
    titleEnglish: 'Ethiopian Millennium Celebration',
    titleAmharic: 'የኢትዮጵያ ሚሊኒየም ተድላ',
    descriptionEnglish: 'Following the Ethiopian Calendar, the country celebrated entering the third millennium (seven years offset).',
    descriptionAmharic: 'በኢትዮጵያ የዘመን አቆጣጠር መሠረት አገሪቱ ሦስተኛውን ሺህ ዓመት በደስታ የተቀበለችበት።'
  }
];

export default function TimelineView({
  people,
  lang,
  onSelectPerson,
  preferredCalendar,
}: TimelineViewProps) {
  const getDisplayYear = (year: number) => {
    if (preferredCalendar === 'ethiopian') {
      // Approximate conversion for year display only
      // 1 Meskerem 1900 EC = 11 Sep 1907 GC
      // So Jan-Sep GC Year X => EC Year X-8
      // Sep-Dec GC Year X => EC Year X-7
      // Since we only have the year as a number here, we'll subtract 7-8.
      // Usually, people referring to a Gregorian year in Ethiopia subtract 7 or 8.
      // For historical events, we'll use a simple offset or better, a proper conversion if we had a date.
      // Since events like "1896" are Gregorian, 1896 GC = 1888 EC.
      // 1900 GC = 1892 EC.
      // Let's use Year - 8 for simplicity in this view if no exact date is present, 
      // or better, if it's a person event, use their birthDate/deathDate to get the exact EC year.
      return year - 8; // Simplified offset for display
    }
    return year;
  };

  const getFullDisplayDate = (isoDate: string | undefined) => {
    if (!isoDate) return '';
    const date = parseIsoDateLocal(isoDate) ?? new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    if (preferredCalendar === 'ethiopian') {
      const eth = toEthiopic(date);
      return `${eth.year}`;
    }
    return `${date.getFullYear()}`;
  };
  const [filterType, setFilterType] = useState<'all' | 'milestones' | 'history'>('all');

  // Compute all timeline events dynamically from people array
  const dynamicEvents: TimelineEvent[] = [];

  people.forEach((p) => {
    const fullNameEng = `${p.firstNameEnglish} ${p.lastNameEnglish}`;
    const fullNameAmh = `${p.firstNameAmharic} ${p.lastNameAmharic}`;

    if (p.birthDate) {
      const bYear = new Date(p.birthDate).getFullYear();
      dynamicEvents.push({
        year: bYear,
        type: 'birth',
        titleEnglish: `Birth of ${fullNameEng}`,
        titleAmharic: `የ${fullNameAmh} ልደት`,
        descriptionEnglish: p.birthPlaceEnglish ? `Born in ${p.birthPlaceEnglish}.` : 'Birth milestone logged.',
        descriptionAmharic: p.birthPlaceAmharic ? `በ${p.birthPlaceAmharic} ተወለዱ።` : 'የልደት ታሪክ ተመዝግቧል።',
        personId: p.id,
      });
    }

    if (p.deathDate) {
      const dYear = new Date(p.deathDate).getFullYear();
      dynamicEvents.push({
        year: dYear,
        type: 'death',
        titleEnglish: `Rest in Peace: ${fullNameEng}`,
        titleAmharic: `የ${fullNameAmh} እረፍት (ተሰናበቱ)`,
        descriptionEnglish: 'Passed on peacefully into ancestral history.',
        descriptionAmharic: 'በታላቅ ክብር ወደ ቀደሙት አባቶች ተሰባሰቡ።',
        personId: p.id,
      });
    }
  });

  // Dynamically resolve Marriages/Partnerships
  const processedSpousePairs = new Set<string>();
  people.forEach((p) => {
    p.spouseIds.forEach((spouseId) => {
      const parentPairKey = [p.id, spouseId].sort().join('_');
      if (!processedSpousePairs.has(parentPairKey)) {
        processedSpousePairs.add(parentPairKey);
        
        const spouse = people.find((item) => item.id === spouseId);
        if (spouse) {
          // Estimate year of Marriage/Union
          let unionYear = 0;
          
          // Oldest child birth year minus 1
          const jointChildren = people.filter((child) => 
            (child.fatherId === p.id && child.motherId === spouseId) ||
            (child.fatherId === spouseId && child.motherId === p.id)
          );
          
          const childYears = jointChildren
            .map((c) => c.birthDate ? new Date(c.birthDate).getFullYear() : null)
            .filter((y): y is number => y !== null);
            
          if (childYears.length > 0) {
            unionYear = Math.min(...childYears) - 1;
          } else {
            // Estimate based on birth year
            const y1 = p.birthDate ? new Date(p.birthDate).getFullYear() : null;
            const y2 = spouse.birthDate ? new Date(spouse.birthDate).getFullYear() : null;
            if (y1 && y2) {
              unionYear = Math.max(y1, y2) + 23;
            } else if (y1) {
              unionYear = y1 + 23;
            } else if (y2) {
              unionYear = y2 + 23;
            }
          }
          
          if (unionYear > 0) {
            const name1Eng = `${p.firstNameEnglish} ${p.lastNameEnglish}`;
            const name1Amh = `${p.firstNameAmharic} ${p.lastNameAmharic}`;
            const name2Eng = `${spouse.firstNameEnglish} ${spouse.lastNameEnglish}`;
            const name2Amh = `${spouse.firstNameAmharic} ${spouse.lastNameAmharic}`;
            
            dynamicEvents.push({
              year: unionYear,
              type: 'union' as any,
              titleEnglish: `Marriage of ${name1Eng} & ${name2Eng}`,
              titleAmharic: `የ${name1Amh} እና የ${name2Amh} ጋብቻ`,
              descriptionEnglish: `United in lifetime matrimony. Logged partnership union in the genealogical records.`,
              descriptionAmharic: `በትዳር በዕድሜ ዘመናቸው የተጣመሩበት ታሪካዊ ጋብቻ ተመዝግቧል።`,
              personId: p.id,
            });
          }
        }
      }
    });
  });

  // Combine and sort chronologically
  const allCombinedEvents = [...dynamicEvents, ...ETHIOPIAN_HISTORY_EVENTS].sort((a, b) => a.year - b.year);

  // Filter based on state selection
  const filteredEvents = allCombinedEvents.filter((ev) => {
    if (filterType === 'milestones') return ev.type === 'birth' || ev.type === 'death' || (ev.type as string) === 'union';
    if (filterType === 'history') return ev.type === 'history';
    return true;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      
      {/* Description header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-850 pb-4">
        <div className="flex gap-2.5">
          <Clock className="h-6 w-6 text-orange-550 shrink-0" />
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {getTranslation('timeline', lang)}
            </h2>
            <p className="text-xs text-zinc-400">
              {lang === 'en' 
                ? 'Chronological view connecting family milestones (births, deaths) with landmark historical milestones.' 
                : 'የቤተሰብ ግንኙነቶችን (ልደትና እረፍትን) ከታላላቅ የሃገሪቱ ታሪካዊ ወቅቶች ጋር በማገናኘት በቅደም ተከተል የሚያሳይ የጊዜ ገበታ።'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-950 p-0.5 self-start text-xs font-semibold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded transition ${
              filterType === 'all'
                ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800'
            }`}
          >
            Show All
          </button>
          <button
            onClick={() => setFilterType('milestones')}
            className={`px-3 py-1 rounded transition ${
              filterType === 'milestones'
                ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800'
            }`}
          >
            Family Only
          </button>
          <button
            onClick={() => setFilterType('history')}
            className={`px-3 py-1 rounded transition ${
              filterType === 'history'
                ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800'
            }`}
          >
            Historical Contexts
          </button>
        </div>
      </div>

      {/* Main vertical chain diagram */}
      {(() => {
        // Group filtered events by year
        const groupedByYear: Record<number, TimelineEvent[]> = {};
        filteredEvents.forEach((ev) => {
          if (!groupedByYear[ev.year]) {
            groupedByYear[ev.year] = [];
          }
          groupedByYear[ev.year].push(ev);
        });

        const sortedYears = Object.keys(groupedByYear).map(Number).sort((a, b) => a - b);

        if (sortedYears.length > 0) {
          return (
            <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-8 pl-8 space-y-8 py-4">
              {sortedYears.map((year, yearIndex) => {
                const yearEvents = groupedByYear[year];
                return (
                  <div key={year} className="relative group animate-fadeIn" style={{ animationDelay: `${yearIndex * 40}ms` }}>
                    
                    {/* Floating tree-trunk root marker for the Year */}
                    <div className="absolute top-1.5 left-[-48px] w-10 h-10 rounded-full border border-orange-200 dark:border-orange-950 bg-orange-50 dark:bg-orange-950 flex flex-col items-center justify-center font-bold font-mono text-orange-650 dark:text-orange-400 shadow-sm z-15 group-hover:scale-105 transition-transform">
                      <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-sans leading-none font-semibold">
                        {preferredCalendar === 'ethiopian' ? (lang === 'en' ? 'EC' : 'ዓ.ም') : 'AD'}
                      </span>
                      <span className="text-[11px] leading-none mt-0.5">{getDisplayYear(year)}</span>
                    </div>

                    {/* Left border container mimicking family tree connectors for multiple events in one year */}
                    <div className="relative pl-4 space-y-3 before:absolute before:left-[-1px] before:top-3 before:bottom-3 before:w-[2px] before:bg-zinc-150 dark:before:bg-zinc-800 animate-slideUp">
                      {yearEvents.map((ev, evIdx) => {
                        let leafIcon = '📜';
                        let leafLabel = 'Chronicle';
                        let badgeColor = 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400 border-zinc-200/50 dark:border-zinc-800';
                        let borderHov = 'hover:border-zinc-350 dark:hover:border-zinc-800';

                        if (ev.type === 'birth') {
                          leafIcon = '👶';
                          leafLabel = lang === 'en' ? 'Birth' : 'ልደት';
                          badgeColor = 'bg-blue-50 text-blue-700 dark:bg-blue-955/40 dark:text-blue-405 border-blue-100 dark:border-blue-900/20';
                          borderHov = 'hover:border-blue-400 dark:hover:border-blue-900/50';
                        } else if (ev.type === 'death') {
                          leafIcon = '🕊️';
                          leafLabel = lang === 'en' ? 'Deceased' : 'ዕረፍት';
                          badgeColor = 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300/40';
                          borderHov = 'hover:border-zinc-400 dark:hover:border-zinc-700';
                        } else if ((ev.type as string) === 'union') {
                          leafIcon = '💖';
                          leafLabel = lang === 'en' ? 'Union / Wedding' : 'ጋብቻ';
                          badgeColor = 'bg-pink-50 text-pink-700 dark:bg-pink-955/40 dark:text-pink-400 border-pink-100 dark:border-pink-900/20';
                          borderHov = 'hover:border-pink-400 dark:hover:border-pink-900/50';
                        } else if (ev.type === 'history') {
                          leafIcon = '🇪🇹';
                          leafLabel = lang === 'en' ? 'History Context' : 'ታሪክ';
                          badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-955/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/20';
                          borderHov = 'hover:border-amber-400 dark:hover:border-amber-900/50';
                        }

                        return (
                          <div key={evIdx} className={`relative p-3.5 bg-white dark:bg-zinc-900/95 border border-zinc-150 dark:border-zinc-850/80 rounded-lg shadow-2xs hover:shadow-xs transition-all ${borderHov}`}>
                            
                            {/* Horizontal connector line linking timeline leaf to year trunk connector */}
                            <span className="absolute left-[-20px] top-[18px] w-[21px] h-[2px] bg-zinc-200 dark:bg-zinc-800 z-10" />
                            {/* Joint node dot */}
                            <span className="absolute left-[-21.5px] top-[14.5px] w-[9px] h-[9px] rounded-full bg-zinc-250 dark:bg-zinc-755 border-2 border-white dark:border-zinc-900 z-15" />

                            <div className="flex items-center gap-1.5 mb-1 bg-white/10 p-0.5 rounded">
                              <span className="text-xs">{leafIcon}</span>
                              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColor}`}>
                                {leafLabel}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">
                              {lang === 'en' ? ev.titleEnglish : ev.titleAmharic}
                            </h4>

                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans mt-1">
                              {lang === 'en' ? ev.descriptionEnglish : ev.descriptionAmharic}
                            </p>

                            {ev.personId && (
                              <button
                                onClick={() => onSelectPerson(ev.personId!)}
                                className="text-[9px] font-bold text-orange-600 hover:text-orange-750 transition font-mono mt-1.5 flex items-center gap-1 bg-orange-50/50 dark:bg-orange-950/15 p-0.5 px-2 rounded border border-orange-100/30 dark:border-orange-900/10 cursor-pointer"
                              >
                                <span>{lang === 'en' ? 'View Profile' : 'መገለጫ ይመልከቱ'}</span>
                                <span>→</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          );
        } else {
          return (
            <div className="bg-zinc-50 dark:bg-zinc-950/30 text-center text-xs border border-dashed rounded-xl p-8 text-zinc-400">
              No records found in this category.
            </div>
          );
        }
      })()}

    </div>
  );
}
