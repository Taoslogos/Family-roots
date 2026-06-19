/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Person, Language } from '../types';
import { getTranslation } from '../lib/sampleData';
import { Users, Heart, GitBranch, ArrowRight, Star, Calendar, Plus, UserCheck, Sparkles } from 'lucide-react';
import AutofillSelector from './AutofillSelector';
import EthiopianDateInput from './EthiopianDateInput';

interface DashboardProps {
  people: Person[];
  lang: Language;
  onSelectPerson: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
  onAddMember: () => void;
  meId: string | null;
  onSetMeId: (id: string | null) => void;
  onAddPersonDirectly: (newPerson: Person) => Promise<void>;
  preferredCalendar: 'gregorian' | 'ethiopian';
}

export default function Dashboard({
  people,
  lang,
  onSelectPerson,
  onNavigateToTab,
  onAddMember,
  meId,
  onSetMeId,
  onAddPersonDirectly,
  preferredCalendar,
}: DashboardProps) {
  const totalCount = people.length;
  const livingCount = people.filter((p) => p.isLiving).length;
  const deceasedCount = totalCount - livingCount;

  // Recent profiles added (sort by updatedAt/createdAt, pick top 4)
  const recentAdditions = [...people]
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 4);

  // States for user claiming flow
  const [claimMode, setClaimMode] = useState<'none' | 'select' | 'create'>('none');
  const [claimedId, setClaimedId] = useState<string | null>(null);

  // Create ME Form inputs
  const [meFirstEng, setMeFirstEng] = useState('');
  const [meLastEng, setMeLastEng] = useState('');
  const [meFirstAmh, setMeFirstAmh] = useState('');
  const [meLastAmh, setMeLastAmh] = useState('');
  const [meGender, setMeGender] = useState<'male' | 'female' | 'other'>('male');
  const [meBirthDate, setMeBirthDate] = useState('');

  const mePerson = meId ? people.find((p) => p.id === meId) : null;
  const meName = mePerson
    ? (lang === 'en' ? `${mePerson.firstNameEnglish} ${mePerson.lastNameEnglish}` : `${mePerson.firstNameAmharic} ${mePerson.lastNameAmharic}`)
    : null;

  const handleCreateMe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meFirstEng.trim() || !meLastEng.trim()) return;

    const newId = `p_user_me_${Date.now()}`;
    const newMe: Person = {
      id: newId,
      firstNameEnglish: meFirstEng.trim(),
      lastNameEnglish: meLastEng.trim(),
      firstNameAmharic: meFirstAmh.trim() || (lang === 'en' ? '' : meFirstEng.trim()),
      lastNameAmharic: meLastAmh.trim() || (lang === 'en' ? '' : meLastEng.trim()),
      gender: meGender,
      birthDate: meBirthDate || undefined,
      isLiving: true,
      spouseIds: [],
      childIds: [],
      biographyEnglish: 'Created as the master user profile representing ME.',
      biographyAmharic: 'የኔን ዋና መገለጫ ለመወከል የተፈጠረ።',
    };

    await onAddPersonDirectly(newMe);
    onSetMeId(newId);
    
    // Reset form states
    setMeFirstEng('');
    setMeLastEng('');
    setMeFirstAmh('');
    setMeLastAmh('');
    setMeBirthDate('');
    setClaimMode('none');
  };

  const getThumbnail = (p: Person) => {
    const primary = p.photos?.find((ph) => ph.isPrimary);
    if (primary) return primary.url;
    if (p.photos && p.photos.length > 0) return p.photos[0].url;

    // Fallback
    const initials = (p.firstNameEnglish.substring(0, 2)).toUpperCase();
    let fill = '%236b7280';
    if (p.gender === 'male') fill = '%232563eb';
    if (p.gender === 'female') fill = '%23db2777';
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="${fill}"><rect width="100" height="100"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">${initials}</text></svg>`;
  };

  return (
    <div className="space-y-6">
      
      {/* Welcoming Top banner with Custom styled greetings */}
      <div className="bg-zinc-900 border border-zinc-805 text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
        {/* Abstract beautiful golden gradient circles */}
        <div className="absolute right-[-40px] top-[-40px] w-48 h-48 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 opacity-20 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Genealogy Portal Active
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Family Roots — {lang === 'en' ? 'Oral Records & Pedigree Index' : 'የቤተሰብ ስር አባት መዝገብ'}
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
              {meName ? (
                <>
                  {lang === 'en' ? 'Welcome back, ' : 'እንኳን ደህና መጡ፥ '}
                  <strong className="text-orange-400">{meName}</strong>. {lang === 'en' ? 'Securely explore, coordinate, map relationships, and preserve multigenerational lineage values offline.' : 'የቤተሰብዎን ትውልድ ስር፤ ታሪክ እና ዝምድናዎችን ከመስመር ውጭ ደህንነቱ በተጠበቀ ሁኔታ ያስሱ።'}
                </>
              ) : (
                lang === 'en'
                  ? 'Welcome to the offline Genealogy Portal. Discover, coordinate, map relationships, and preserve multigenerational lineage values.'
                  : 'የቤተሰብዎን ትውልድ ስር፤ ታሪክ እና ዝምድናዎችን ከመስመር ውጭ ደህንነቱ በተጠበቀ ሁኔታ ያስሱ።'
              )}
            </p>

            {mePerson && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 border border-orange-500/35 text-[9px] font-mono rounded font-bold uppercase tracking-wider">
                  {lang === 'en' ? 'My Profile Linked' : 'የእኔ መገለጫ ተያይዟል'}
                </span>
                <button
                  onClick={() => onSetMeId(null)}
                  className="text-[9px] text-zinc-400 hover:text-red-450 transition cursor-pointer select-none underline"
                >
                  {lang === 'en' ? '[Unlink / Reset]' : '[መገለጫዬን ቀይር/አውጣ]'}
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={onAddMember}
            className="self-start md:self-center shrink-0 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-3 px-5 rounded-xl transition duration-150 flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'en' ? 'Add Member Meet Today' : 'ዛሬ ያገኙትን አባል ያክሉ'}</span>
          </button>
        </div>
      </div>

      {/* 📥 'WHO ARE YOU?' CLAIM / INITIALIZATION FLOW */}
      {!mePerson && (
        <div className="bg-white dark:bg-zinc-900/90 border-l-4 border-l-orange-500 border-y border-r border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-orange-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500 dark:text-orange-450 animate-pulse shrink-0" />
                {lang === 'en' ? 'Who are you on this Family Tree?' : 'በዚህ የቤተሰብ ዛፍ ላይ እርስዎ ማን ነዎት?'}
              </h3>
              <p className="text-xs text-zinc-650 dark:text-zinc-350 font-bold mt-1.5 leading-relaxed font-sans leading-relaxed">
                {lang === 'en'
                  ? 'Tell us who you are so the system can highlight you as "ME" on the tree, and personalize the welcome greetings.'
                  : 'ማንነትዎን ለእኛ ይንገሩን እና ስርዓቱ በቤተሰብ ዛፍ ላይ "እኔ" ብሎ ምልክት ያደርግልዎታል፤ እንዲሁም መገለጫዎን ልዩ ያደርገዋል።'}
              </p>
            </div>
            <div className="flex gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => setClaimMode(claimMode === 'select' ? 'none' : 'select')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer select-none ${
                   claimMode === 'select'
                     ? 'bg-orange-600 text-white border-orange-655 hover:bg-orange-700'
                     : 'bg-zinc-100 text-zinc-800 border-zinc-205 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-750 dark:hover:bg-zinc-700'
                }`}
              >
                {lang === 'en' ? 'Select Existing Profile' : 'ካሉት መገለጫዎች ምረጥ'}
              </button>
              <button
                type="button"
                onClick={() => setClaimMode(claimMode === 'create' ? 'none' : 'create')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer select-none ${
                   claimMode === 'create'
                     ? 'bg-orange-600 text-white border-orange-655 hover:bg-orange-700'
                     : 'bg-zinc-100 text-zinc-800 border-zinc-205 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-750 dark:hover:bg-zinc-700'
                }`}
              >
                {lang === 'en' ? 'Create New For Me' : 'ለእኔ አዲስ ፍጠር'}
              </button>
            </div>
          </div>

          {/* Select from existing */}
          {claimMode === 'select' && (
            <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850 space-y-3 max-w-xl animate-fadeIn">
              <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-zinc-700 dark:text-zinc-300">
                {lang === 'en' ? 'Search and select your profile name:' : 'ፈልገው የእርስዎን ስም ይምረጡ:'}
              </label>
              <div className="flex gap-2 items-center w-full">
                <div className="flex-1">
                  <AutofillSelector
                    candidates={people}
                    selectedId={claimedId || ''}
                    onSelect={(val) => setClaimedId(val)}
                    placeholder={lang === 'en' ? '-- Find your name in the tree --' : '-- ስምዎን ጽፈው ይምረጡ --'}
                    lang={lang}
                  />
                </div>
                <button
                  type="button"
                  disabled={!claimedId}
                  onClick={() => {
                    if (claimedId) {
                      onSetMeId(claimedId);
                      setClaimMode('none');
                    }
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white cursor-pointer select-none text-xs font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {lang === 'en' ? 'Set As Me' : 'ይሄ እኔ ነኝ'}
                </button>
              </div>
            </div>
          )}

          {/* Create a brand new profile representing Me */}
          {claimMode === 'create' && (
            <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850 space-y-4 max-w-2xl animate-fadeIn">
              <h4 className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider">
                {lang === 'en' ? 'Create Your Profile & Link As Me' : 'ለራስዎ አዲስ መገለጫ ፈጥረው ያገናኙ'}
              </h4>
              <form onSubmit={handleCreateMe} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-zinc-400 font-mono">First Name (English) *</label>
                    <input
                      required
                      type="text"
                      value={meFirstEng}
                      onChange={(e) => setMeFirstEng(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-800 p-2 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 outline-none text-xs"
                      placeholder="e.g. Dawit"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-zinc-400 font-mono">Last Name (English) *</label>
                    <input
                      required
                      type="text"
                      value={meLastEng}
                      onChange={(e) => setMeLastEng(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-800 p-2 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 outline-none text-xs"
                      placeholder="e.g. Solomon"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-zinc-400 font-mono">First Name (Amharic)</label>
                    <input
                      type="text"
                      value={meFirstAmh}
                      onChange={(e) => setMeFirstAmh(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-800 p-2 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 outline-none text-xs"
                      placeholder="ምሳሌ፡ ዳዊት"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-zinc-400 font-mono">Last Name (Amharic)</label>
                    <input
                      type="text"
                      value={meLastAmh}
                      onChange={(e) => setMeLastAmh(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-800 p-2 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 outline-none text-xs"
                      placeholder="ምሳሌ፡ ሰለሞን"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-zinc-400 font-mono">Gender *</label>
                    <select
                      value={meGender}
                      onChange={(e) => setMeGender(e.target.value as 'male' | 'female' | 'other')}
                      className="w-full border border-zinc-200 dark:border-zinc-800 p-2 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 outline-none text-xs"
                    >
                      <option value="male">{lang === 'en' ? 'Male' : 'ወንድ'}</option>
                      <option value="female">{lang === 'en' ? 'Female' : 'ሴት'}</option>
                      <option value="other">{lang === 'en' ? 'Other' : 'ሌላ'}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <EthiopianDateInput
                      label={lang === 'en' ? 'Birth Date' : 'የትውልድ ቀን'}
                      value={meBirthDate}
                      onChange={setMeBirthDate}
                      lang={lang}
                      preferredCalendar={preferredCalendar}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-855">
                  <button
                    type="button"
                    onClick={() => setClaimMode('none')}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-650 dark:text-zinc-300 rounded font-semibold cursor-pointer select-none text-xs animate-none"
                  >
                    {lang === 'en' ? 'Cancel' : 'ሰርዝ'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded cursor-pointer select-none text-xs"
                  >
                    {lang === 'en' ? 'Create & Link Profile' : 'መገለጫዬ አድርግና መዝግብ'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Quick stats grid rows */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-4 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Members Registered</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100 font-mono">{totalCount}</span>
            <span className="text-xs text-zinc-400">individuals in database</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-4 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">{lang === 'en' ? 'Living Members' : 'በህይወት ያሉ አባላት'}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 font-mono">{livingCount}</span>
            <span className="text-xs text-zinc-400">currently block-synced</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-4 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">{lang === 'en' ? 'Deceased Members' : 'ያለፉ አባላት'}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-zinc-500 font-mono">{deceasedCount}</span>
            <span className="text-xs text-zinc-400">ancestors recorded</span>
          </div>
        </div>

      </div>

      <div className="max-w-4xl">
        
        {/* Recent Additions list */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-2">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
              <Star className="w-4.5 h-4.5 text-orange-500 fill-orange-500/10" />
              Recent Updates & Edits
            </h3>
            <button
              onClick={() => onNavigateToTab('search')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 font-mono flex items-center gap-0.5 pointer-events-auto"
            >
              <span>Explore Indexes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentAdditions.length === 0 ? (
              <div className="py-8 text-center bg-zinc-50/50 dark:bg-zinc-950/25 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                <Users className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  {lang === 'en' ? 'No family members recorded yet.' : 'ገና ምንም የቤተሰብ አባል አልተመዘገበም።'}
                </p>
                <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
                  {lang === 'en' 
                    ? 'Use the button above to add your first member, or claim your profile to kickstart your lineage registry!' 
                    : 'የመጀመሪያውን አባል ለመጨመር ከላይ ያለውን ቁልፍ ይጠቀሙ፥ ወይም የራስዎን መገለጫ በመፍጠር ይጀምሩ!'}
                </p>
              </div>
            ) : (
              recentAdditions.map((p) => {
                const bYear = p.birthDate ? new Date(p.birthDate).getFullYear() : 'No Date';
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPerson(p.id)}
                    className="flex items-center justify-between p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-950/30 rounded-lg cursor-pointer border border-zinc-100 dark:border-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded overflow-hidden shadow-inner shrink-0 border dark:border-zinc-805">
                        <img src={getThumbnail(p)} alt={p.firstNameEnglish} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <span>{lang === 'en' ? `${p.firstNameEnglish} ${p.lastNameEnglish}` : `${p.firstNameAmharic} ${p.lastNameAmharic}`}</span>
                          {p.id === meId && (
                            <span className="px-1.5 py-0.5 bg-orange-600 text-white font-mono text-[7px] font-black uppercase tracking-widest rounded">
                              {lang === 'en' ? 'ME' : 'እኔ'}
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Birth year: {bYear} | {p.gender}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-bold text-zinc-400 font-mono bg-zinc-150 dark:bg-zinc-800 px-1.5 py-0.5 rounded">View</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
