/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Person, Language } from '../types';
import { calculateGenerationLevels } from '../lib/genealogyEngine';
import { getTranslation } from '../lib/sampleData';
import { Users, Heart, Milestone, ShieldCheck, PieChart, Activity, User, Award, Briefcase } from 'lucide-react';

interface FamilyStatsProps {
  people: Person[];
  lang: Language;
}

export default function FamilyStats({ people, lang }: FamilyStatsProps) {
  const total = people.length;
  const living = people.filter((p) => p.isLiving).length;
  const deceased = total - living;

  // Find oldest ancestor (earliest birthdate)
  const peopleWithBirths = people.filter((p) => p.birthDate);
  const oldestPerson = peopleWithBirths.reduce((oldest, current) => {
    if (!oldest) return current;
    return new Date(current.birthDate!) < new Date(oldest.birthDate!) ? current : oldest;
  }, null as Person | null);

  // Compute generation count based on absolute BFS traversal levels relative to the oldest person
  let generationCount = 0;
  if (oldestPerson && people.length > 0) {
    const levelsMap = calculateGenerationLevels(people, oldestPerson.id);
    const levelsValues = Array.from(levelsMap.values());
    if (levelsValues.length > 0) {
      generationCount = Math.max(...levelsValues) + 1;
    }
  }

  // Count genders
  const maleCount = people.filter((p) => p.gender === 'male').length;
  const femaleCount = people.filter((p) => p.gender === 'female').length;
  const otherCount = total - maleCount - femaleCount;

  // Birth decade bins calculation for simple responsive SVG chart representation
  const decadeBins: Record<number, number> = {};
  peopleWithBirths.forEach((p) => {
    const year = new Date(p.birthDate!).getFullYear();
    const decade = Math.floor(year / 10) * 10;
    decadeBins[decade] = (decadeBins[decade] || 0) + 1;
  });

  const sortedDecades = Object.keys(decadeBins).map(Number).sort((a, b) => a - b);
  const maxDecadeCount = sortedDecades.length > 0 ? Math.max(...Object.values(decadeBins)) : 1;

  // Job/Profession calculations to show which careers are mostly known
  const jobCounts: Record<string, number> = {};
  people.forEach((p) => {
    const job = lang === 'en' 
      ? (p.jobEnglish || p.jobAmharic || '').trim() 
      : (p.jobAmharic || p.jobEnglish || '').trim();
    if (job) {
      const normalizedJob = job.charAt(0).toUpperCase() + job.slice(1).toLowerCase();
      jobCounts[normalizedJob] = (jobCounts[normalizedJob] || 0) + 1;
    }
  });

  const sortedJobs = Object.entries(jobCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxJobCount = sortedJobs.length > 0 ? Math.max(...sortedJobs.map(([, count]) => count)) : 1;

  // Name formatting helper
  const formatPersonName = (p: Person) => {
    return lang === 'en'
      ? `${p.firstNameEnglish} ${p.lastNameEnglish}`
      : `${p.firstNameAmharic} ${p.lastNameAmharic}`;
  };

  return (
    <div className="space-y-6">
      
      {/* 2x3 Bento Grid Layout of core counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Total Members Metric Block */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">{getTranslation('totalMembers', lang)}</p>
            <h3 className="text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 font-mono tracking-tight leading-none">
              {total}
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono">Family indexes registered</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-orange-100/40 dark:bg-orange-955/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200/40">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Living / Deceased Ratio Block */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Living / Deceased</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 font-mono tracking-tight leading-none">
                {living}
              </h3>
              <span className="text-zinc-400 text-xs font-mono">/ {deceased}</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">Ratio is {((living/total)*100).toFixed(0)}% living</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-100/40 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center border border-emerald-200/40">
            <Heart className="h-5 w-5" />
          </div>
        </div>

        {/* Generation Span level depth */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">{getTranslation('generationCount', lang)}</p>
            <h3 className="text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 font-mono tracking-tight leading-none">
              {generationCount}
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono">Overall depth of the family line</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-indigo-100/40 dark:bg-indigo-955/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/40">
            <Milestone className="h-5 w-5" />
          </div>
        </div>

        {/* Oldest Patriarch / Matriarch badge */}
        {oldestPerson && (
          <div className="sm:col-span-2 lg:col-span-3 bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-200 dark:border-zinc-850 p-5 rounded-xl shadow-sm flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">{getTranslation('oldestAncestor', lang)}</p>
              <h4 className="text-base font-bold text-orange-655 dark:text-orange-400 font-sans tracking-tight">
                {formatPersonName(oldestPerson)}
              </h4>
              <p className="text-xs text-zinc-500 max-w-2xl font-sans italic leading-relaxed">
                {lang === 'en' 
                  ? `Born in ${oldestPerson.birthPlaceEnglish || 'unknown place'} on ${oldestPerson.birthDate}. Representing the oldest logged ancestor.`
                  : `በትውልድ ድልድል መሠረት፥ በ${oldestPerson.birthPlaceAmharic || 'ያልታወቀ ቦታ'} በ${oldestPerson.birthDate} ተወልደዋል። የመጀመሪያው ቀዳሚ የቤተሰብ አባት/እናት ናቸው።`}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-50 dark:bg-yellow-955/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center border border-yellow-200/40 shrink-0">
              <Award className="h-6 w-6" />
            </div>
          </div>
        )}

      </div>

      {/* SVG charts: Century Generation Balance & Gender Metrics & Profession analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Chart A: Distribution over birth years */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-orange-500" />
            Demographic Birth Timeline Chart
          </h3>

          {sortedDecades.length > 0 ? (
            <div className="space-y-3">
              {sortedDecades.map((dec) => {
                const count = decadeBins[dec];
                const percentage = (count / maxDecadeCount) * 100;
                return (
                  <div key={dec} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-3">
                    <span className="w-12 font-mono text-[10px] shrink-0 font-bold">{dec}s</span>
                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 max-w-[200px] overflow-hidden">
                      <div
                        className="bg-orange-605 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: '#ea580c' }}
                      />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-zinc-400">{count} member(s)</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 italic">No birth coordinates stored for demographic evaluation charts.</p>
          )}
        </div>

        {/* Chart B: Gender balance metrics */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono mb-4 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-orange-500" />
            {getTranslation('genderDistribution', lang)}
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-blue-700 dark:text-blue-400">{getTranslation('male', lang)}</span>
                <span className="font-bold">{maleCount} ({total > 0 ? ((maleCount/total)*100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-805 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${total > 0 ? (maleCount/total)*100 : 0}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-pink-700 dark:text-pink-400">{getTranslation('female', lang)}</span>
                <span className="font-bold">{femaleCount} ({total > 0 ? ((femaleCount/total)*100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-805 h-2 rounded-full overflow-hidden">
                <div className="bg-pink-600 h-full rounded-full" style={{ width: `${total > 0 ? (femaleCount/total)*100 : 0}%` }} />
              </div>
            </div>

            {otherCount > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-teal-700 dark:text-teal-400">{getTranslation('other', lang)}</span>
                  <span className="font-bold">{otherCount} ({((otherCount/total)*100).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-805 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: `${(otherCount/total)*100}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart C: Predominant Family Vocations / Careers */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono mb-4 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-orange-500" />
            {lang === 'en' ? 'Predominant Family Vocations' : 'የቤተሰብ ዋና ሥራዎች መቶኛ'}
          </h3>

          {sortedJobs.length > 0 ? (
            <div className="space-y-3.5">
              {sortedJobs.map(([job, count]) => {
                const percentage = (count / maxJobCount) * 100;
                return (
                  <div key={job} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[130px]">{job}</span>
                      <span className="font-bold text-zinc-500">{count} {lang === 'en' ? 'member(s)' : 'አባል(ዎች)'}</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: '#f97316' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-zinc-400 italic leading-relaxed">
              {lang === 'en' 
                ? 'No professions registered to evaluate yet. Add a job/profession to member profiles to populate.'
                : 'ሊገመገሙ የሚችሉ የሥራ ዘርፎች የሉም። ለመጀመር የአባላትን የሥራ መረጃ ያስገቡ።'}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
