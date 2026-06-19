/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Person, Language } from '../types';
import { findRelationshipPath, describeRelationshipPath } from '../lib/genealogyEngine';
import { getTranslation } from '../lib/sampleData';
import { ArrowRight, Sparkles, Footprints, Eye, GitCommit } from 'lucide-react';

interface RelationshipFinderProps {
  people: Person[];
  lang: Language;
  onHighlightPath: (path: string[] | null) => void;
  onSelectPerson: (id: string) => void;
}

export default function RelationshipFinder({
  people,
  lang,
  onHighlightPath,
  onSelectPerson,
}: RelationshipFinderProps) {
  const [startId, setStartId] = useState<string>('');
  const [endId, setEndId] = useState<string>('');
  
  // Results
  const [calculatedPath, setCalculatedPath] = useState<string[] | null>(null);
  const [relationLabel, setRelationLabel] = useState<string>('');
  const [steps, setSteps] = useState<string[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Auto-sorted people list for selection dropdown
  const sortedPeople = [...people].sort((a, b) => {
    const nameA = `${a.firstNameEnglish} ${a.lastNameEnglish}`.toUpperCase();
    const nameB = `${b.firstNameEnglish} ${b.lastNameEnglish}`.toUpperCase();
    return nameA.localeCompare(nameB);
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startId || !endId) return;

    if (startId === endId) {
      setCalculatedPath([startId]);
      setRelationLabel(lang === 'en' ? 'Self / Same person' : 'እራሱ ግለሰብ');
      setSteps([]);
      setHasCalculated(true);
      onHighlightPath([startId]);
      return;
    }

    const path = findRelationshipPath(people, startId, endId);
    setCalculatedPath(path);

    if (path) {
      const { relationLabel: label, steps: pathsSteps } = describeRelationshipPath(people, path, lang);
      setRelationLabel(label);
      setSteps(pathsSteps);
      onHighlightPath(path); // Auto trigger tree visualizer highlights!
    } else {
      setRelationLabel(lang === 'en' ? 'No direct relational connection found' : 'ቀጥተኛ ዝምድና አልተገኘም');
      setSteps([]);
      onHighlightPath(null);
    }
    setHasCalculated(true);
  };

  const handleClear = () => {
    setStartId('');
    setEndId('');
    setCalculatedPath(null);
    setRelationLabel('');
    setSteps([]);
    setHasCalculated(false);
    onHighlightPath(null);
  };

  const formatFullName = (p: Person) => {
    const name = lang === 'en'
      ? `${p.firstNameEnglish} ${p.lastNameEnglish}`
      : `${p.firstNameAmharic} ${p.lastNameAmharic}`;
    const nickname = lang === 'en' ? p.nicknameEnglish : p.nicknameAmharic;
    return nickname ? `${name} ("${nickname}")` : name;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      
      {/* Description header */}
      <div className="flex gap-3 border-b border-zinc-100 dark:border-zinc-850 pb-3">
        <Sparkles className="h-6 w-6 text-orange-550 shrink-0" />
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {getTranslation('relationshipFinder', lang)}
          </h2>
          <p className="text-xs text-zinc-400">
            {lang === 'en' 
              ? 'Select two family members to calculate their biological/marital ties, trace their lineage connection, and animate the path on the family tree!' 
              : 'በማንኛውም ሁለት አባላት መካከል ያለውን ዝምድና ለማገናኘት እና በዛፉ ላይ ያለውን የአያት ሐረግ ለማሳየት የመጀመሪያውንና ሁለተኛውን ሰው ይምረጡ።'}
          </p>
        </div>
      </div>

      {/* Select Members forms */}
      <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6 items-end">
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{getTranslation('startPerson', lang)}</label>
          <select
            required
            value={startId}
            onChange={(e) => setStartId(e.target.value)}
            className="w-full border border-zinc-205 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2.5 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer text-zinc-800 dark:text-zinc-200 font-medium"
          >
            <option value="">{lang === 'en' ? '-- Select First Member --' : '-- መግቢያ ሰው ይምረጡ --'}</option>
            {sortedPeople.map((p) => (
              <option key={p.id} value={p.id}>{formatFullName(p)}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-center shrink-0 py-2 md:py-0">
          <div className="h-9 w-9 rounded-full bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200/50 dark:border-orange-900/10 rotate-90 md:rotate-0">
            <ArrowRight className="h-4.5 w-4.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{getTranslation('endPerson', lang)}</label>
          <select
            required
            value={endId}
            onChange={(e) => setEndId(e.target.value)}
            className="w-full border border-zinc-205 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2.5 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer text-zinc-800 dark:text-zinc-200 font-medium"
          >
            <option value="">{lang === 'en' ? '-- Select Second Member --' : '-- ሁለተኛ ሰው ይምረጡ --'}</option>
            {sortedPeople.filter(p => p.id !== startId).map((p) => (
              <option key={p.id} value={p.id}>{formatFullName(p)}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-850 pt-4 mt-2">
          {hasCalculated && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-sm bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition rounded font-semibold"
            >
              Clear calculation
            </button>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-orange-600 font-semibold hover:bg-orange-700 text-white rounded text-sm transition flex items-center gap-1.5 shadow-sm"
          >
            {getTranslation('calculateRelationship', lang)}
          </button>
        </div>
      </form>

      {/* Results output section if calculated */}
      {hasCalculated && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-4 animate-fadeIn">
          
          {/* Main relation outcome badge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 gap-2">
            <div>
              <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-400">{getTranslation('relationshipResult', lang)}</p>
              <h3 className="text-lg font-bold text-orange-650 dark:text-orange-400 mt-0.5 font-sans leading-none">
                {relationLabel}
              </h3>
            </div>

            {calculatedPath && (
              <div className="inline-flex items-center gap-1.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/10 text-amber-800 dark:text-amber-400 rounded-full px-3.5 py-1 text-xs font-mono font-bold">
                <Footprints className="w-3.5 h-3.5" />
                <span>
                  {getTranslation('generationDistance', lang)}: {calculatedPath.length - 1} {lang === 'en' ? 'link(s)' : 'ትስስሮች'}
                </span>
              </div>
            )}
          </div>

          {/* Sequential Step Timeline */}
          {calculatedPath && steps.length > 0 ? (
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <GitCommit className="w-4 h-4 text-orange-500" />
                Lineage Pathway Explanation
              </h4>

              <div className="relative border-l-2 border-zinc-220 dark:border-zinc-800 ml-4 pl-6 py-1.5 space-y-4">
                {steps.map((st, idx) => (
                  <div key={idx} className="relative text-xs">
                    {/* Circle Node Dot marker */}
                    <div className="absolute top-1 left-[-30px] w-2.5 h-2.5 bg-orange-600 border-2 border-white dark:border-zinc-900 rounded-full" />
                    
                    <p className="text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed tracking-tight">
                      {st}
                    </p>
                  </div>
                ))}
              </div>

              {/* Direct Highlight actions */}
              <div className="pt-2 flex justify-start">
                <div className="text-emerald-600 dark:text-emerald-400 font-medium text-xs flex items-center gap-1.5 bg-emerald-50/50 dark:bg-emerald-950/10 px-3 py-1.5 rounded border border-emerald-100/30">
                  <Eye className="w-4 h-4" />
                  <span>Interactive path matches highlighted in orange gold on the family tree diagram above.</span>
                </div>
              </div>
            </div>
          ) : (
            calculatedPath && calculatedPath.length === 1 ? (
              <p className="text-zinc-500 text-xs italic">{lang === 'en' ? 'This represents the same individual profile.' : 'ይህ አንድ አይነት ግለሰብን ይወክላል።'}</p>
            ) : (
              <p className="text-zinc-500 text-xs italic">{getTranslation('noPathFound', lang)}</p>
            )
          )}

        </div>
      )}

    </div>
  );
}
