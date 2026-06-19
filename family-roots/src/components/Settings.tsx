/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, Person } from '../types';
import { getTranslation } from '../lib/sampleData';
import { Settings, Globe, Moon, Sun, AlertOctagon, RefreshCw, User } from 'lucide-react';
import AutofillSelector from './AutofillSelector';

interface SettingsProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  onThemeToggle: () => void;
  onClearDB: () => void;
  onLoadSample: () => void;
  meId: string | null;
  onSetMeId: (id: string | null) => void;
  people: Person[];
  preferredCalendar: 'gregorian' | 'ethiopian';
  onCalendarChange: (cal: 'gregorian' | 'ethiopian') => void;
}

export default function SettingsComponent({
  lang,
  onLanguageChange,
  darkMode,
  onThemeToggle,
  onClearDB,
  onLoadSample,
  meId,
  onSetMeId,
  people,
  preferredCalendar,
  onCalendarChange,
}: SettingsProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      
      {/* Header section */}
      <div className="flex gap-3 border-b border-zinc-100 dark:border-zinc-850 pb-3">
        <Settings className="h-6 w-6 text-orange-550 shrink-0" />
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {getTranslation('settings', lang)}
          </h2>
          <p className="text-xs text-zinc-400">
            Customize your bilingual visual workspace preferences, language dictionaries, and manage secure local storage.
          </p>
        </div>
      </div>

      {/* Grid: Settings Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel 1: Language and Workspace Theme Settings */}
        <div className="space-y-4">
          
          {/* Language Selection */}
          <div className="p-4 border rounded-xl bg-zinc-50/10 dark:bg-zinc-950/15 border-zinc-200 dark:border-zinc-800 space-y-3.5">
            <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-orange-500" />
              Bilingual Dictionary Language
            </h4>
            
            <p className="text-[11px] text-zinc-500 leading-relaxed leading-tight">
              Switch the workspace text language. Family Roots includes first-tier translations for English and Amharic.
            </p>

            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => onLanguageChange('en')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition ${
                  lang === 'en'
                    ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
                }`}
              >
                English (AD)
              </button>
              <button
                onClick={() => onLanguageChange('am')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition ${
                  lang === 'am'
                    ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
                }`}
              >
                አማርኛ (Amharic)
              </button>
            </div>
          </div>

          {/* Theme selection */}
          <div className="p-4 border rounded-xl bg-zinc-50/10 dark:bg-zinc-950/15 border-zinc-200 dark:border-zinc-800 space-y-3.5">
            <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-orange-500" />
              {getTranslation('theme', lang)}
            </h4>
            
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans leading-tight">
              Select your preferred workspace visual contrast mode. Keep elements soft for eyes or high contrast for readability.
            </p>

            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => { if (darkMode) onThemeToggle(); }}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  !darkMode
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{getTranslation('lightMode', lang)}</span>
              </button>
              <button
                onClick={() => { if (!darkMode) onThemeToggle(); }}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  darkMode
                    ? 'bg-zinc-900 text-orange-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{getTranslation('darkMode', lang)}</span>
              </button>
            </div>
          </div>

          {/* Identity Link Selection */}
          <div className="p-4 border rounded-xl bg-zinc-50/10 dark:bg-zinc-950/15 border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-orange-500" />
              {lang === 'en' ? 'My Identification Claim' : 'የእኔ መገለጫ ማንነት'}
            </h4>
            
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans leading-tight">
              {lang === 'en' 
                ? 'Claim a profile on this family tree representing yourself. This highlights your node dynamically on the map and personalizes greetings.'
                : 'እራስዎን በቤተሰብ ዛፉ ላይ የሚወክል መገለጫ ይምረጡ። ይህም በካርታው ላይ የእርስዎን ስም ለይቶ የሚያሳይ እና ሰላምታዎችን የሚቀይር ነው።'}
            </p>

            <div className="flex gap-2 items-center text-xs w-full">
              <div className="flex-1 min-w-0">
                <AutofillSelector
                  candidates={people}
                  selectedId={meId || ''}
                  onSelect={(val) => onSetMeId(val)}
                  placeholder={lang === 'en' ? '-- Select Your Name --' : '-- ስምዎን ይምረጡ --'}
                  lang={lang}
                />
              </div>
              {meId && (
                <button
                  type="button"
                  onClick={() => onSetMeId(null)}
                  className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-955/15 dark:hover:bg-red-955/35 text-red-650 dark:text-red-400 border border-red-200/40 dark:border-red-900/30 rounded text-xs font-bold transition shrink-0 cursor-pointer"
                >
                  {lang === 'en' ? 'Unlink' : 'አውጣ'}
                </button>
              )}
            </div>
          </div>

          {/* Preferred Calendar Selection */}
          <div className="p-4 border rounded-xl bg-zinc-50/10 dark:bg-zinc-950/15 border-zinc-200 dark:border-zinc-800 space-y-3.5">
            <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-orange-500" />
              {lang === 'en' ? 'Preferred Calendar System' : 'ተመራጭ የዘመን አቆጣጠር'}
            </h4>
            
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans leading-tight">
              {lang === 'en' 
                ? 'Choose the default calendar system for date entries. You can still toggle this individually on any date field.'
                : 'ለቀን መረጃዎች የሚጠቀሙትን የዘመን አቆጣጠር ይምረጡ። በእያንዳንዱ የdate ፊልድ ላይ መቀያየርም ይችላሉ።'}
            </p>

            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => onCalendarChange('gregorian')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition ${
                  preferredCalendar === 'gregorian'
                    ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
                }`}
              >
                Gregorian
              </button>
              <button
                onClick={() => onCalendarChange('ethiopian')}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition ${
                  preferredCalendar === 'ethiopian'
                    ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
                }`}
              >
                Ethiopian (EC)
              </button>
            </div>
          </div>

        </div>

        {/* Panel 2: Danger Zone DB Management */}
        <div className="space-y-4">
          
          <div className="p-5 border border-red-200/50 dark:border-red-950/20 rounded-xl bg-red-50/5 dark:bg-red-955/5 space-y-4">
            <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-red-500 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-red-500 fill-red-500/10" />
              {getTranslation('dangerZone', lang)}
            </h4>
            
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans leading-tight">
              These commands irreversibly alter the offline database file. Take precautions (download JSON backups) before trigger resets.
            </p>

            <div className="space-y-3.5 pt-1">
              {/* Wipe All Database */}
              <button
                onClick={() => {
                  if (confirm('Warning! This will purge all profiles and photos. This action is irreversible. Proceed?')) {
                    onClearDB();
                  }
                }}
                className="w-full py-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-220 dark:border-rose-900/30 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                {getTranslation('clearDatabase', lang)}
              </button>

              {/* Reset to sample data */}
              <button
                onClick={() => {
                  if (confirm('Proceed with loading default Amharic multigenerational family tree? This will merge them with any current entries.')) {
                    onLoadSample();
                  }
                }}
                className="w-full py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 border rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync/Refill True Sample Records</span>
              </button>
            </div>
          </div>
          
          {/* About Developer Section */}
          <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/10 dark:bg-zinc-950/20 space-y-3">
            <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-orange-500" />
              {lang === 'en' ? 'About the Developer' : 'ስለ መተግበሪያው አበልጻጊ'}
            </h4>
            
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans leading-tight italic">
              {lang === 'en' 
                ? 'Developed by Taos Fseha, this application is designed to help families preserve their heritage and navigate complex relationships during family gatherings.'
                : 'ይህ መተግበሪያ በታኦስ ፍስሃ (Taos Fseha) የበለፀገ ሲሆን፥ ቤተሰቦች ታሪካቸውን እንዲመዘግቡ እና በቤተሰብ ስብሰባዎች ወቅት ውስብስብ ዝምድናዎችን በቀላሉ እንዲረዱ ለመርዳት የታለመ ነው።'}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
