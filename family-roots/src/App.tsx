/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Person, Language } from './types';
import { getAllPeople, savePerson, deletePerson, clearAllPeople } from './lib/db';
import { SAMPLE_PEOPLE, getTranslation } from './lib/sampleData';

// Component imports
import Dashboard from './components/Dashboard';
import AutofillSelector from './components/AutofillSelector';
import FamilyTree from './components/FamilyTree';
import PersonDetails from './components/PersonDetails';
import RelationshipFinder from './components/RelationshipFinder';
import SearchAndFilters from './components/SearchAndFilters';
import TimelineView from './components/TimelineView';
import FamilyStats from './components/FamilyStats';
import ImportExport from './components/ImportExport';
import SettingsComponent from './components/Settings';
import EthiopianDateInput from './components/EthiopianDateInput';
import appLogo from './family_tree.png';

// Icon imports
import {
  GitBranch,
  Search,
  Clock,
  BarChart3,
  Upload,
  Settings,
  Menu,
  X,
  User,
  Heart,
  Globe,
  Sun,
  Moon,
  Home,
  Star,
  BookOpen
} from 'lucide-react';

export default function App() {
  // Navigation & Page Tabs
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Database State holds all people
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Language & Dark Mode preferences
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [preferredCalendar, setPreferredCalendar] = useState<'gregorian' | 'ethiopian'>(
    (localStorage.getItem('family_roots_calendar') as 'gregorian' | 'ethiopian') || 'gregorian'
  );

  // Highlight path shared reference
  const [highlightedPath, setHighlightedPath] = useState<string[] | null>(null);
  
  const handleCalendarChange = (cal: 'gregorian' | 'ethiopian') => {
    setPreferredCalendar(cal);
    localStorage.setItem('family_roots_calendar', cal);
  };

  // New Profile Form simple controller
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFirstNameEng, setNewFirstNameEng] = useState('');
  const [newLastNameEng, setNewLastNameEng] = useState('');
  const [newFirstNameAmh, setNewFirstNameAmh] = useState('');
  const [newLastNameAmh, setNewLastNameAmh] = useState('');
  const [newGender, setNewGender] = useState<'male' | 'female' | 'other'>('male');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newJobEng, setNewJobEng] = useState('');
  const [newJobAmh, setNewJobAmh] = useState('');
  const [relLinkType, setRelLinkType] = useState<'child_of' | 'parent_of' | 'spouse_of' | 'none'>('none');
  const [relTargetId, setRelTargetId] = useState<string>('');

  // Master ME identity state
  const [meId, setMeId] = useState<string | null>(() => localStorage.getItem('family_roots_me_id'));

  const handleSetMeId = (id: string | null) => {
    setMeId(id);
    if (id) {
      localStorage.setItem('family_roots_me_id', id);
    } else {
      localStorage.removeItem('family_roots_me_id');
    }
  };

  const handleAddPersonDirectly = async (newPerson: Person): Promise<void> => {
    try {
      await savePerson(newPerson);
      const freshPeople = await getAllPeople();
      setPeople(freshPeople);
    } catch (err) {
      console.error('Failed to add person directly:', err);
    }
  };

  // 1. Initial State Loading & Auto seeding from IndexedDB (Disabled auto-seeding for clean empty startup)
  useEffect(() => {
    async function loadData() {
      try {
        const dbPeople = await getAllPeople();
        if (dbPeople && dbPeople.length > 0) {
          setPeople(dbPeople);
          // Set Alemayehu or first element as default selected if exists
          const alem = dbPeople.find((p) => p.id === 'anc_1');
          if (alem) setSelectedPersonId(alem.id);
          else setSelectedPersonId(dbPeople[0].id);
        } else {
          // Empty DB: Start fresh with no people
          console.log('IndexedDB is empty, starting fresh with clean slate...');
          setPeople([]);
          setSelectedPersonId(null);
        }
      } catch (err) {
        console.error('Failed to load offline database index', err);
        // Fallback to empty array if DB fails (no automatic sample data)
        setPeople([]);
        setSelectedPersonId(null);
      }
    }
    loadData();
  }, []);

  // 2. Sync Theme State to document markup
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Tab navigational helpers
  const handleSelectPerson = (id: string) => {
    setSelectedPersonId(id);
    // If the active tab is tree, keep the user on the tree layout to allow exploring coordinates.
    // For all other hubs (search, timeline, dashboard, etc.), auto-switch to the detailed memoir view!
    if (activeTab !== 'tree') {
      setActiveTab('details');
    }
  };

  // 3. Database operations
  const handleUpdatePerson = async (updated: Person) => {
    try {
      await savePerson(updated);
      setPeople((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const handleDeletePerson = async (id: string) => {
    try {
      await deletePerson(id);
      
      // Clean up pointer records in other profiles to preserve referential integrity!
      const updatedPeopleList = people
        .filter((p) => p.id !== id)
        .map((p) => {
          let updated = false;
          const fatherId = p.fatherId === id ? undefined : p.fatherId;
          const motherId = p.motherId === id ? undefined : p.motherId;
          
          if (fatherId !== p.fatherId || motherId !== p.motherId) updated = true;

          const spouseIds = p.spouseIds.filter((sid) => sid !== id);
          if (spouseIds.length !== p.spouseIds.length) updated = true;

          const childIds = p.childIds.filter((cid) => cid !== id);
          if (childIds.length !== p.childIds.length) updated = true;

          if (updated) {
            const up: Person = { ...p, fatherId, motherId, spouseIds, childIds };
            savePerson(up); // async sync
            return up;
          }
          return p;
        });

      setPeople(updatedPeopleList);
      if (selectedPersonId === id) {
        setSelectedPersonId(updatedPeopleList[0]?.id || null);
      }
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Deletion failed', err);
    }
  };

  const handleImportComplete = async (updatedList: Person[]) => {
    setPeople(updatedList);
    // Persist all fully to DB
    for (const p of updatedList) {
      await savePerson(p);
    }
    if (updatedList.length > 0) {
      setSelectedPersonId(updatedList[0].id);
    }
  };

  const handleClearDatabase = async () => {
    await clearAllPeople();
    setPeople([]);
    setSelectedPersonId(null);
    setActiveTab('import');
  };

  const handleLoadSampleDatabase = async () => {
    await clearAllPeople();
    for (const sp of SAMPLE_PEOPLE) {
      await savePerson(sp);
    }
    setPeople(SAMPLE_PEOPLE);
    setSelectedPersonId('anc_1');
    setActiveTab('dashboard');
  };

  // Add a clean new family member to DB and join them properly to the tree
  const handleAddNewMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstNameEng.trim() || !newLastNameEng.trim()) return;

    const newId = `p_user_${Date.now()}`;
    const newPerson: Person = {
      id: newId,
      firstNameEnglish: newFirstNameEng,
      lastNameEnglish: newLastNameEng,
      firstNameAmharic: newFirstNameAmh || (lang === 'en' ? '' : newFirstNameEng),
      lastNameAmharic: newLastNameAmh || (lang === 'en' ? '' : newLastNameEng),
      gender: newGender,
      birthDate: newBirthDate || undefined,
      isLiving: true,
      spouseIds: [],
      childIds: [],
      biographyEnglish: 'Added recently to the local workspace.',
      biographyAmharic: 'በቅርብ ጊዜ ወደ አካባቢያዊ የሥራ ቦታ ታክሏል።',
      jobEnglish: newJobEng.trim() || undefined,
      jobAmharic: newJobAmh.trim() || undefined
    };

    try {
      // Connect custom selected relationship if any
      if (relLinkType !== 'none' && relTargetId) {
        const targetPerson = people.find((p) => p.id === relTargetId);
        if (targetPerson) {
          if (relLinkType === 'child_of') {
            // New person is child of targetPerson
            if (targetPerson.gender === 'male') {
              newPerson.fatherId = targetPerson.id;
              // Link mother too if target has a female spouse
              if (targetPerson.spouseIds.length > 0) {
                const spouse = people.find((p) => targetPerson.spouseIds.includes(p.id) && p.gender === 'female');
                if (spouse) {
                  newPerson.motherId = spouse.id;
                  const updatedSpouse = { ...spouse, childIds: [...spouse.childIds.filter(id => id !== newId), newId] };
                  await savePerson(updatedSpouse);
                }
              }
            } else {
              newPerson.motherId = targetPerson.id;
              // Link father too if target has a male spouse
              if (targetPerson.spouseIds.length > 0) {
                const spouse = people.find((p) => targetPerson.spouseIds.includes(p.id) && p.gender === 'male');
                if (spouse) {
                  newPerson.fatherId = spouse.id;
                  const updatedSpouse = { ...spouse, childIds: [...spouse.childIds.filter(id => id !== newId), newId] };
                  await savePerson(updatedSpouse);
                }
              }
            }
            const updatedTarget = { ...targetPerson, childIds: [...targetPerson.childIds.filter(id => id !== newId), newId] };
            await savePerson(updatedTarget);
          } else if (relLinkType === 'parent_of') {
            // New person is parent of targetPerson
            const updatedTarget = { ...targetPerson };
            if (newGender === 'male') {
              updatedTarget.fatherId = newId;
            } else {
              updatedTarget.motherId = newId;
            }
            newPerson.childIds = [targetPerson.id];
            await savePerson(updatedTarget);
          } else if (relLinkType === 'spouse_of') {
            // New person is spouse/partner of targetPerson
            newPerson.spouseIds = [targetPerson.id];
            const updatedTarget = { ...targetPerson, spouseIds: [...targetPerson.spouseIds.filter(id => id !== newId), newId] };
            await savePerson(updatedTarget);
          }
        }
      } else if (selectedPersonId) {
        // Fallback backward-compatible/default behavior
        const activePerson = people.find((p) => p.id === selectedPersonId);
        if (activePerson) {
          if (activePerson.gender === 'male') {
            newPerson.fatherId = activePerson.id;
          } else {
            newPerson.motherId = activePerson.id;
          }
          const updatedActive = { ...activePerson, childIds: [...activePerson.childIds.filter(id => id !== newId), newId] };
          await savePerson(updatedActive);
        }
      }

      await savePerson(newPerson);
      
      // Reload entire tree listing from IndexedDB to ensure consistency
      const freshPeople = await getAllPeople();
      setPeople(freshPeople);
      setSelectedPersonId(newId);
      setShowAddModal(false);
      
      // Reset state inputs
      setNewFirstNameEng('');
      setNewLastNameEng('');
      setNewFirstNameAmh('');
      setNewLastNameAmh('');
      setNewBirthDate('');
      setNewJobEng('');
      setNewJobAmh('');
      setRelLinkType('none');
      setRelTargetId('');

      setActiveTab('details');
    } catch (err) {
      console.error('Failed to create member:', err);
    }
  };

  // Layout Selectors
  const activePerson = people.find((p) => p.id === selectedPersonId) || null;

  // Tabs labels translations dictionaries
  const navigationItems = [
    { id: 'dashboard', label: getTranslation('dashboard', lang), icon: Home },
    { id: 'tree', label: getTranslation('familyTree', lang), icon: GitBranch },
    { id: 'details', label: getTranslation('personDetails', lang), icon: User },
    { id: 'relationship', label: getTranslation('relationshipFinder', lang), icon: Heart },
    { id: 'search', label: getTranslation('search', lang), icon: Search },
    { id: 'timeline', label: getTranslation('timeline', lang), icon: Clock },
    { id: 'stats', label: getTranslation('statistics', lang), icon: BarChart3 },
    { id: 'import', label: getTranslation('importExport', lang), icon: Upload },
    { id: 'settings', label: getTranslation('settings', lang), icon: Settings },
  ];

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 w-full flex flex-col font-sans transition-colors duration-200`}>
      
      {/* 1. Header Toolbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 border-b border-zinc-200 dark:border-zinc-800/80 backdrop-blur-md px-4 py-3.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <img
            src={appLogo}
            alt={lang === 'en' ? 'Family Roots logo' : 'የቤተሰብ ዛፍ ምልክት'}
            className="h-9 w-9 rounded-xl object-cover shadow-md ring-1 ring-zinc-200/80 dark:ring-zinc-700/80 select-none"
          />
          <div>
            <span className="text-xs font-bold leading-none font-mono text-orange-600 block tracking-widest uppercase">Family Roots</span>
            <span className="text-sm font-semibold font-sans leading-none tracking-tight text-zinc-900 dark:text-zinc-100">
              {lang === 'en' ? 'የቀደምት ሥር' : 'የዘር ሐረግ ወራሽ'}
            </span>
          </div>
        </div>

        {/* Global Toolbar Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Language Selection Badge */}
          <button
            onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
            className="p-2 border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 rounded-lg text-xs font-bold flex items-center gap-1 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Change translation dialect"
          >
            <Globe className="w-4 h-4 shrink-0 text-orange-555" />
            <span className="hidden sm:inline">{lang === 'en' ? 'አማርኛ' : 'English'}</span>
          </button>

          {/* Theme selection toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 rounded-lg text-zinc-750 dark:text-zinc-300 transition-colors"
            title="Toggle contrast pallet"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5 outline-none text-amber-500" /> : <Moon className="w-4.5 h-4.5 outline-none" />}
          </button>

          {/* Add member shortcut floating button */}
          <button
            onClick={() => {
              setRelTargetId(selectedPersonId || '');
              setRelLinkType(selectedPersonId ? 'child_of' : 'none');
              setShowAddModal(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs py-2 px-3.5 rounded-lg transition shadow-sm hidden sm:block"
          >
            + {lang === 'en' ? 'Add Member' : 'አባል አክል'}
          </button>
        </div>
      </header>

      {/* 2. Main Full Screen Layout Wrapper */}
      <div className="flex-1 w-full flex relative">
        
        {/* Left Drawer Dashboard Sidebar Navigation */}
        <aside className={`fixed md:sticky top-[69px] bottom-0 left-0 z-30 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800/80 p-4 shrink-0 overflow-y-auto transform md:transform-none transition duration-200 flex flex-col justify-between ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="space-y-1">
            {navigationItems.map((nav) => {
              const Icon = nav.icon;
              const isActive = activeTab === nav.id;
              
              return (
                <button
                  key={nav.id}
                  onClick={() => {
                    setActiveTab(nav.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full py-2.5 px-3.5 text-xs font-bold font-sans rounded-lg flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-orange-50/70 text-orange-700 border-l-4 border-orange-600 dark:bg-orange-955/15 dark:text-orange-400 font-extrabold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-400'}`} />
                  <span className="truncate">{nav.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Glanced Profile widget at side footer */}
          {activePerson && (
            <div
              onClick={() => handleSelectPerson(activePerson.id)}
              className="border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 p-2.5 rounded-xl cursor-pointer hover:shadow-xs mt-6 transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-orange-500 font-serif">👤</span>
                <div className="truncate text-xs font-semibold">
                  <p className="text-zinc-400 text-[10px] uppercase font-mono font-bold tracking-wider leading-none">Focus Profile</p>
                  <p className="text-zinc-800 dark:text-zinc-300 truncate mt-0.5 font-bold font-sans">
                    {lang === 'en' ? `${activePerson.firstNameEnglish} ${activePerson.lastNameEnglish.charAt(0)}.` : activePerson.firstNameAmharic}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* 3. Primary Workspace Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          
          {/* Custom Dual-View layout for family tree */}
          {activeTab === 'tree' ? (
            <div className="space-y-6">
              {/* Family Tree component */}
              <FamilyTree
                people={people}
                selectedPersonId={selectedPersonId}
                onSelectPerson={handleSelectPerson}
                lang={lang}
                highlightedPath={highlightedPath}
                branchFilterId="all"
                meId={meId}
                preferredCalendar={preferredCalendar}
              />

              {/* Collapsed side profile panel if clicked on tree */}
              {activePerson && (
                <div className="animate-fadeIn">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-950/20 mb-3 text-xs flex justify-between items-center sm:w-auto">
                    <div>
                      <span className="bg-orange-500/10 text-orange-700 dark:text-orange-400 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold">Selected Node Profile</span>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {lang === 'en' ? `${activePerson.firstNameEnglish} ${activePerson.lastNameEnglish}` : `${activePerson.firstNameAmharic} ${activePerson.lastNameAmharic}`}
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('details')}
                      className="text-xs bg-orange-600 hover:bg-orange-750 text-white font-semibold transition px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Review Memoir Chronicles</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Standard individual tab routing loaders
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  people={people}
                  lang={lang}
                  onSelectPerson={handleSelectPerson}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onAddMember={() => {
                    setRelTargetId(selectedPersonId || '');
                    setRelLinkType(selectedPersonId ? 'child_of' : 'none');
                    setShowAddModal(true);
                  }}
                  meId={meId}
                  onSetMeId={handleSetMeId}
                  onAddPersonDirectly={handleAddPersonDirectly}
                  preferredCalendar={preferredCalendar}
                />
              )}

              {activeTab === 'details' && activePerson && (
                <div className="space-y-4">
                  <PersonDetails
                    person={activePerson}
                    people={people}
                    onSelectPerson={handleSelectPerson}
                    onUpdatePerson={handleUpdatePerson}
                    onDeletePerson={handleDeletePerson}
                    lang={lang}
                    preferredCalendar={preferredCalendar}
                  />
                  
                  {/* Select a sibling / brother selector scrollbar below */}
                  {people.length > 1 && (
                    <div className="border border-dashed border-zinc-200 dark:border-zinc-805 p-4 rounded-xl flex items-center justify-between bg-zinc-50/30 text-xs">
                      <span className="font-semibold text-zinc-500">{lang === 'en' ? 'Quick Selector:' : 'ፈጣን መራጭ፡'}</span>
                      <div className="flex gap-1.5 overflow-x-auto max-w-[280px] sm:max-w-[450px] md:max-w-xl pb-1">
                        {people.filter(p => p.id !== selectedPersonId).slice(0, 10).map((other) => (
                          <button
                            key={other.id}
                            onClick={() => setSelectedPersonId(other.id)}
                            className="bg-white dark:bg-zinc-900 border hover:bg-zinc-50 dark:hover:bg-zinc-800 transition rounded px-2.5 py-1 font-sans text-[11px] truncate shrink-0 max-w-[124px]"
                          >
                            {lang === 'en' ? other.firstNameEnglish : other.firstNameAmharic}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'details' && !activePerson && (
                <div className="text-center p-12 border-2 border-dashed rounded-xl text-zinc-400 text-xs">
                  Please seed or add a profile to review family details.
                </div>
              )}

              {activeTab === 'relationship' && (
                <RelationshipFinder
                  people={people}
                  lang={lang}
                  onHighlightPath={(path) => setHighlightedPath(path)}
                  onSelectPerson={handleSelectPerson}
                />
              )}

              {activeTab === 'search' && (
                <SearchAndFilters
                  people={people}
                  lang={lang}
                  onSelectPerson={handleSelectPerson}
                  selectedPersonId={selectedPersonId}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineView
                  people={people}
                  lang={lang}
                  onSelectPerson={handleSelectPerson}
                  preferredCalendar={preferredCalendar}
                />
              )}

              {activeTab === 'stats' && (
                <FamilyStats
                  people={people}
                  lang={lang}
                />
              )}

              {activeTab === 'import' && (
                <ImportExport
                  people={people}
                  lang={lang}
                  onImportComplete={handleImportComplete}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsComponent
                  lang={lang}
                  onLanguageChange={(newLang) => setLang(newLang)}
                  darkMode={darkMode}
                  onThemeToggle={() => setDarkMode(!darkMode)}
                  onClearDB={handleClearDatabase}
                  onLoadSample={handleLoadSampleDatabase}
                  meId={meId}
                  onSetMeId={handleSetMeId}
                  people={people}
                  preferredCalendar={preferredCalendar}
                  onCalendarChange={handleCalendarChange}
                />
              )}
            </>
          )}

        </main>
      </div>

      {/* 4. MODAL ADD NEW PROFILE POPUP */}
      {showAddModal && (
        <div style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-2">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-orange-500 fill-orange-550/10" />
                Add New Family Member
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Creates a clean new profile. If another profile is selected during additions, we will make this profile a direct child in your tree for ease of lineage mapping!
            </p>

            <form onSubmit={handleAddNewMember} className="space-y-4 text-xs text-zinc-800 dark:text-zinc-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 mb-0.5 font-semibold">First Name (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel"
                    value={newFirstNameEng}
                    onChange={(e) => setNewFirstNameEng(e.target.value)}
                    className="w-full border p-2 rounded bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-orange-500 text-sm text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 mb-0.5 font-semibold">Last Name (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yohannes"
                    value={newLastNameEng}
                    onChange={(e) => setNewLastNameEng(e.target.value)}
                    className="w-full border p-2 rounded bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-orange-500 text-sm text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-0.5 font-semibold">First Name (Amharic) [Optional]</label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ ሳሙኤል"
                    value={newFirstNameAmh}
                    onChange={(e) => setNewFirstNameAmh(e.target.value)}
                    className="w-full border p-2 rounded bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-orange-500 text-sm text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-0.5 font-semibold">Last Name (Amharic) [Optional]</label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ ዮሐንስ"
                    value={newLastNameAmh}
                    onChange={(e) => setNewLastNameAmh(e.target.value)}
                    className="w-full border p-2 rounded bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-orange-500 text-sm text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 mb-0.5 font-semibold">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full border p-2 rounded bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 outline-none cursor-pointer text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <EthiopianDateInput
                    label={lang === 'en' ? 'Birth Date [Optional]' : 'የትውልድ ቀን [አማራጭ]'}
                    value={newBirthDate}
                    onChange={setNewBirthDate}
                    lang={lang}
                    preferredCalendar={preferredCalendar}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 mb-0.5 font-semibold">Profession / Job (English)</label>
                  <input
                    type="text"
                    placeholder="e.g. Doctor, Merchant"
                    value={newJobEng}
                    onChange={(e) => setNewJobEng(e.target.value)}
                    className="w-full border p-2 rounded bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-orange-500 text-sm text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-0.5 font-semibold">ሥራ / ሙያ (Amharic) [Optional]</label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ ሐኪም, ነጋዴ"
                    value={newJobAmh}
                    onChange={(e) => setNewJobAmh(e.target.value)}
                    className="w-full border p-2 rounded bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-orange-500 text-sm text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Relationship linkage auto fillers */}
              <div className="border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Join to lineage as:</span>
                  <select
                    value={relLinkType}
                    onChange={(e) => setRelLinkType(e.target.value as any)}
                    className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 rounded font-medium text-xs text-orange-600 dark:text-orange-400 cursor-pointer outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="none">Independent profile (no link)</option>
                    <option value="child_of">Child of ...</option>
                    <option value="parent_of">Parent of ...</option>
                    <option value="spouse_of">Spouse/Partner of ...</option>
                  </select>
                </div>

                {relLinkType !== 'none' && (
                  <div className="grid grid-cols-1 gap-1 animate-fadeIn">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400">Related Family Member</label>
                    <AutofillSelector
                      candidates={people}
                      selectedId={relTargetId}
                      onSelect={(val) => setRelTargetId(val)}
                      placeholder={lang === 'en' ? '-- Search / Select related person --' : '-- ስም ጽፈው ቤተሰብ ይምረጡ --'}
                      lang={lang}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-150 hover:bg-zinc-200 rounded text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750 transition"
                >
                  {getTranslation('cancel', lang)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold transition shadow-sm"
                >
                  + Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
