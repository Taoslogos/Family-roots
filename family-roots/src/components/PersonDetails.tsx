/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Person, Language, PhotoAsset, DocumentAsset, AudioMemoryAsset } from '../types';
import { SAMPLE_PEOPLE, getTranslation } from '../lib/sampleData';
import EthiopianDateInput from './EthiopianDateInput';
import { toEthiopic, parseIsoDateLocal, AT_MONTHS_EN, AT_MONTHS_AM } from '../lib/calendarUtils';
import { User, Calendar, MapPin, Heart, BookOpen, Clock, Award, Plus, FolderKanban, AudioLines, FileText, Trash2, CheckCircle2, Star, Edit2, Link2, X, Users } from 'lucide-react';
import AutofillSelector from './AutofillSelector';
import { savePerson } from '../lib/db';

interface PersonDetailsProps {
  person: Person;
  people: Person[];
  onSelectPerson: (id: string) => void;
  onUpdatePerson: (updated: Person) => void;
  onDeletePerson: (id: string) => Promise<void>;
  lang: Language;
  preferredCalendar: 'gregorian' | 'ethiopian';
}

export default function PersonDetails({
  person,
  people,
  onSelectPerson,
  onUpdatePerson,
  onDeletePerson,
  lang,
  preferredCalendar,
}: PersonDetailsProps) {
  const formatDate = (isoDate: string | undefined) => {
    if (!isoDate) return 'Unknown';
    const date = parseIsoDateLocal(isoDate) ?? new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;

    if (preferredCalendar === 'ethiopian') {
      const eth = toEthiopic(date);
      const months = lang === 'en' ? AT_MONTHS_EN : AT_MONTHS_AM;
      // Show full date in Ethiopian or just year? 
      // The user seems to like the simple year display.
      // But for Ethiopian, they might want the month too.
      // Let's stick to year for now to be safe, or Month Year.
      return `${months[eth.month - 1]} ${eth.year} ${lang === 'en' ? 'EC' : 'ዓ.ም'}`;
    }

    return `${date.getFullYear()}`; // Revert to year-only display for Gregorian
  };

  const [activeTab, setActiveTab] = useState<'bio' | 'relations' | 'media'>('bio');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form states for personal details editing
  const [firstNameEng, setFirstNameEng] = useState(person.firstNameEnglish);
  const [lastNameEng, setLastNameEng] = useState(person.lastNameEnglish);
  const [firstNameAmh, setFirstNameAmh] = useState(person.firstNameAmharic);
  const [lastNameAmh, setLastNameAmh] = useState(person.lastNameAmharic);
  const [nicknameEng, setNicknameEng] = useState(person.nicknameEnglish || '');
  const [nicknameAmh, setNicknameAmh] = useState(person.nicknameAmharic || '');
  const [gender, setGender] = useState<any>(person.gender);
  const [editBirthDate, setEditBirthDate] = useState(person.birthDate || '');
  const [birthPlaceEng, setBirthPlaceEng] = useState(person.birthPlaceEnglish || '');
  const [birthPlaceAmh, setBirthPlaceAmh] = useState(person.birthPlaceAmharic || '');
  const [editDeathDate, setEditDeathDate] = useState(person.deathDate || '');
  const [isLiving, setIsLiving] = useState(person.isLiving);
  const [bioEng, setBioEng] = useState(person.biographyEnglish || '');
  const [bioAmh, setBioAmh] = useState(person.biographyAmharic || '');
  const [jobEng, setJobEng] = useState(person.jobEnglish || '');
  const [jobAmh, setJobAmh] = useState(person.jobAmharic || '');

  // Inline edit states for Biography
  const [isEditingBioEng, setIsEditingBioEng] = useState(false);
  const [isEditingBioAmh, setIsEditingBioAmh] = useState(false);
  const [tempBioEng, setTempBioEng] = useState(person.biographyEnglish || '');
  const [tempBioAmh, setTempBioAmh] = useState(person.biographyAmharic || '');

  // Relations inline selectors
  const [selectedFatherId, setSelectedFatherId] = useState(person.fatherId || '');
  const [selectedMotherId, setSelectedMotherId] = useState(person.motherId || '');
  const [selectedSpouseId, setSelectedSpouseId] = useState('');
  
  // Dynamic new partner inline creation form states
  const [createPartnerOpen, setCreatePartnerOpen] = useState(false);
  const [partnerFirstEng, setPartnerFirstEng] = useState('');
  const [partnerLastEng, setPartnerLastEng] = useState('');
  const [partnerFirstAmh, setPartnerFirstAmh] = useState('');
  const [partnerLastAmh, setPartnerLastAmh] = useState('');
  const [partnerGender, setPartnerGender] = useState<'male' | 'female' | 'other'>(person.gender === 'male' ? 'female' : 'male');
  const [partnerBirthDate, setPartnerBirthDate] = useState('');

  // Dynamic new Father inline creation form states
  const [createFatherOpen, setCreateFatherOpen] = useState(false);
  const [fatherFirstEng, setFatherFirstEng] = useState('');
  const [fatherLastEng, setFatherLastEng] = useState('');
  const [fatherFirstAmh, setFatherFirstAmh] = useState('');
  const [fatherLastAmh, setFatherLastAmh] = useState('');
  const [fatherBirthDate, setFatherBirthDate] = useState('');

  // Dynamic new Mother inline creation form states
  const [createMotherOpen, setCreateMotherOpen] = useState(false);
  const [motherFirstEng, setMotherFirstEng] = useState('');
  const [motherLastEng, setMotherLastEng] = useState('');
  const [motherFirstAmh, setMotherFirstAmh] = useState('');
  const [motherLastAmh, setMotherLastAmh] = useState('');
  const [motherBirthDate, setMotherBirthDate] = useState('');
  
  // Audio/Attachment inline forms

  // New photo attachment simulation
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showPhotoForm, setShowPhotoForm] = useState(false);

  // Sync state when person switches
  React.useEffect(() => {
    setFirstNameEng(person.firstNameEnglish);
    setLastNameEng(person.lastNameEnglish);
    setFirstNameAmh(person.firstNameAmharic);
    setLastNameAmh(person.lastNameAmharic);
    setNicknameEng(person.nicknameEnglish || '');
    setNicknameAmh(person.nicknameAmharic || '');
    setGender(person.gender);
    setEditBirthDate(person.birthDate || '');
    setBirthPlaceEng(person.birthPlaceEnglish || '');
    setBirthPlaceAmh(person.birthPlaceAmharic || '');
    setEditDeathDate(person.deathDate || '');
    setIsLiving(person.isLiving);
    setBioEng(person.biographyEnglish || '');
    setBioAmh(person.biographyAmharic || '');
    setJobEng(person.jobEnglish || '');
    setJobAmh(person.jobAmharic || '');
    
    // Reset dynamic partner forms
    setCreatePartnerOpen(false);
    setPartnerFirstEng('');
    setPartnerLastEng('');
    setPartnerFirstAmh('');
    setPartnerLastAmh('');
    setPartnerBirthDate('');
    setPartnerGender(person.gender === 'male' ? 'female' : 'male');

    // Reset dynamic father forms
    setCreateFatherOpen(false);
    setFatherFirstEng('');
    setFatherLastEng('');
    setFatherFirstAmh('');
    setFatherLastAmh('');
    setFatherBirthDate('');

    // Reset dynamic mother forms
    setCreateMotherOpen(false);
    setMotherFirstEng('');
    setMotherLastEng('');
    setMotherFirstAmh('');
    setMotherLastAmh('');
    setMotherBirthDate('');
    
    // Sync inline values
    setTempBioEng(person.biographyEnglish || '');
    setTempBioAmh(person.biographyAmharic || '');
    setIsEditingBioEng(false);
    setIsEditingBioAmh(false);
    setSelectedFatherId(person.fatherId || '');
    setSelectedMotherId(person.motherId || '');
    setSelectedSpouseId('');

    setIsEditing(false);
    setShowPhotoForm(false);
  }, [person]);

  const handleSaveBasicDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Person = {
      ...person,
      firstNameEnglish: firstNameEng,
      lastNameEnglish: lastNameEng,
      firstNameAmharic: firstNameAmh,
      lastNameAmharic: lastNameAmh,
      nicknameEnglish: nicknameEng || undefined,
      nicknameAmharic: nicknameAmh || undefined,
      gender,
      birthDate: editBirthDate || undefined,
      birthPlaceEnglish: birthPlaceEng || undefined,
      birthPlaceAmharic: birthPlaceAmh || undefined,
      deathDate: isLiving ? undefined : (editDeathDate || undefined),
      isLiving,
      biographyEnglish: bioEng || undefined,
      biographyAmharic: bioAmh || undefined,
      jobEnglish: jobEng || undefined,
      jobAmharic: jobAmh || undefined,
    };
    onUpdatePerson(updated);
    setIsEditing(false);
  };



  const simulateAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    const fallbackColors = ['%23f97316', '%23075985', '%236d28d9', '%2315803d', '%23be185d'];
    const randomColor = fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
    const initials = (person.firstNameEnglish.substring(0,2)).toUpperCase();
    
    // Simulate SVG base avatar or given URL
    const url = newPhotoUrl.trim() || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="${randomColor}"><rect width="100" height="100"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">${initials}</text></svg>`;

    const newPhoto: PhotoAsset = {
      id: `p_user_${Date.now()}`,
      url,
      caption: newPhotoCaption || 'Family Snapshot',
      isPrimary: !(person.photos && person.photos.length > 0)
    };

    const updated: Person = {
      ...person,
      photos: [...(person.photos || []), newPhoto]
    };

    onUpdatePerson(updated);
    setNewPhotoCaption('');
    setNewPhotoUrl('');
    setShowPhotoForm(false);
  };

  // Safe relationships resolvers
  const father = people.find((p) => p.id === person.fatherId);
  const mother = people.find((p) => p.id === person.motherId);
  const spousesList = people.filter((p) => person.spouseIds.includes(p.id));
  const childrenList = people.filter((p) => p.fatherId === person.id || p.motherId === person.id);
  const siblingsList = people.filter((p) => {
    if (p.id === person.id) return false;
    const sharesFather = person.fatherId && p.fatherId === person.fatherId;
    const sharesMother = person.motherId && p.motherId === person.motherId;
    return sharesFather || sharesMother;
  });

  const formatName = (p: Person) => {
    return lang === 'en'
      ? `${p.firstNameEnglish} ${p.lastNameEnglish}`
      : `${p.firstNameAmharic} ${p.lastNameAmharic}`;
  };

  const getPrimaryPhoto = () => {
    const primary = person.photos?.find((ph) => ph.isPrimary);
    if (primary) return primary.url;
    if (person.photos && person.photos.length > 0) return person.photos[0].url;

    // Elegant fallback SVG avatar SVG
    const initials = (person.firstNameEnglish.substring(0, 2)).toUpperCase();
    let fill = '%236b7280'; // gray
    if (person.gender === 'male') fill = '%231d4ed8'; // blue
    if (person.gender === 'female') fill = '%23db2777'; // pink
    if (person.gender === 'other') fill = '%230d9488'; // teal

    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="${fill}"><rect width="100" height="100" rx="10"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">${initials}</text></svg>`;
  };

  // Helper function to save English and Amharic biographies inline
  const handleSaveInlineBio = (languageType: 'en' | 'am') => {
    if (languageType === 'en') {
      const updated: Person = {
        ...person,
        biographyEnglish: tempBioEng || undefined,
      };
      onUpdatePerson(updated);
      setIsEditingBioEng(false);
    } else {
      const updated: Person = {
        ...person,
        biographyAmharic: tempBioAmh || undefined,
      };
      onUpdatePerson(updated);
      setIsEditingBioAmh(false);
    }
  };

  // Bidirectional parent linking helpers
  const handleLinkFather = async (fId: string) => {
    if (!fId) return;
    
    // 1. Unlink previous father if any
    if (person.fatherId && person.fatherId !== fId) {
      const prevFather = people.find(p => p.id === person.fatherId);
      if (prevFather) {
        const uPrev = { ...prevFather, childIds: prevFather.childIds.filter(id => id !== person.id) };
        onUpdatePerson(uPrev);
      }
    }

    // 2. Link new father
    const newFather = people.find(p => p.id === fId);
    if (newFather) {
      const uFather = { ...newFather, childIds: [...newFather.childIds.filter(id => id !== person.id), person.id] };
      onUpdatePerson(uFather);
    }

    // 3. Update current person
    const updatedSelf = { ...person, fatherId: fId };
    onUpdatePerson(updatedSelf);
  };

  const handleUnlinkFather = () => {
    if (!person.fatherId) return;
    const currentFather = people.find(p => p.id === person.fatherId);
    if (currentFather) {
      const uFather = { ...currentFather, childIds: currentFather.childIds.filter(id => id !== person.id) };
      onUpdatePerson(uFather);
    }
    const updatedSelf = { ...person, fatherId: undefined };
    onUpdatePerson(updatedSelf);
    setSelectedFatherId('');
  };

  const handleLinkMother = async (mId: string) => {
    if (!mId) return;

    // 1. Unlink previous mother if any
    if (person.motherId && person.motherId !== mId) {
      const prevMother = people.find(p => p.id === person.motherId);
      if (prevMother) {
        const uPrev = { ...prevMother, childIds: prevMother.childIds.filter(id => id !== person.id) };
        onUpdatePerson(uPrev);
      }
    }

    // 2. Link new mother
    const newMother = people.find(p => p.id === mId);
    if (newMother) {
      const uMother = { ...newMother, childIds: [...newMother.childIds.filter(id => id !== person.id), person.id] };
      onUpdatePerson(uMother);
    }

    // 3. Update current person
    const updatedSelf = { ...person, motherId: mId };
    onUpdatePerson(updatedSelf);
  };

  const handleUnlinkMother = () => {
    if (!person.motherId) return;
    const currentMother = people.find(p => p.id === person.motherId);
    if (currentMother) {
      const uMother = { ...currentMother, childIds: currentMother.childIds.filter(id => id !== person.id) };
      onUpdatePerson(uMother);
    }
    const updatedSelf = { ...person, motherId: undefined };
    onUpdatePerson(updatedSelf);
    setSelectedMotherId('');
  };

  const handleCreateAndLinkFather = async () => {
    if (!fatherFirstEng.trim() || !fatherLastEng.trim()) {
      alert(lang === 'en' ? "Please fill in Father's First and Last Name (English)" : "እባክዎ የአባትን ስምና የአያት ስም በእንግሊዝኛ ይሙሉ");
      return;
    }

    const newFatherId = `p_father_dynamic_${Date.now()}`;
    const newFather: Person = {
      id: newFatherId,
      firstNameEnglish: fatherFirstEng.trim(),
      lastNameEnglish: fatherLastEng.trim(),
      firstNameAmharic: fatherFirstAmh.trim() || (lang === 'en' ? '' : fatherFirstEng.trim()),
      lastNameAmharic: fatherLastAmh.trim() || (lang === 'en' ? '' : fatherLastEng.trim()),
      gender: 'male',
      birthDate: fatherBirthDate || undefined,
      isLiving: true,
      spouseIds: person.motherId ? [person.motherId] : [],
      childIds: [person.id],
      biographyEnglish: 'Created inline as biological father.',
      biographyAmharic: 'በቀጥታ እንደ አባት ተፈጥሮ የተገናኘ።'
    };

    try {
      await savePerson(newFather);
      
      const uSelf = {
        ...person,
        fatherId: newFatherId,
      };

      if (person.motherId) {
        const currentMother = people.find(p => p.id === person.motherId);
        if (currentMother) {
          const uMother = {
            ...currentMother,
            spouseIds: [...currentMother.spouseIds.filter(id => id !== newFatherId), newFatherId]
          };
          onUpdatePerson(uMother);
        }
      }

      onUpdatePerson(uSelf);

      setFatherFirstEng('');
      setFatherLastEng('');
      setFatherFirstAmh('');
      setFatherLastAmh('');
      setFatherBirthDate('');
      setCreateFatherOpen(false);
      setSelectedFatherId(newFatherId);
    } catch (err) {
      console.error('Failed to save dynamic father', err);
    }
  };

  const handleCreateAndLinkMother = async () => {
    if (!motherFirstEng.trim() || !motherLastEng.trim()) {
      alert(lang === 'en' ? "Please fill in Mother's First and Last Name (English)" : "እባክዎ የእናትን ስምና የአያት ስም በእንግሊዝኛ ይሙሉ");
      return;
    }

    const newMotherId = `p_mother_dynamic_${Date.now()}`;
    const newMother: Person = {
      id: newMotherId,
      firstNameEnglish: motherFirstEng.trim(),
      lastNameEnglish: motherLastEng.trim(),
      firstNameAmharic: motherFirstAmh.trim() || (lang === 'en' ? '' : motherFirstEng.trim()),
      lastNameAmharic: motherLastAmh.trim() || (lang === 'en' ? '' : motherLastEng.trim()),
      gender: 'female',
      birthDate: motherBirthDate || undefined,
      isLiving: true,
      spouseIds: person.fatherId ? [person.fatherId] : [],
      childIds: [person.id],
      biographyEnglish: 'Created inline as biological mother.',
      biographyAmharic: 'በቀጥታ እንደ እናት ተፈጥሮ የተገናኘ።'
    };

    try {
      await savePerson(newMother);

      const uSelf = {
        ...person,
        motherId: newMotherId,
      };

      if (person.fatherId) {
        const currentFather = people.find(p => p.id === person.fatherId);
        if (currentFather) {
          const uFather = {
            ...currentFather,
            spouseIds: [...currentFather.spouseIds.filter(id => id !== newMotherId), newMotherId]
          };
          onUpdatePerson(uFather);
        }
      }

      onUpdatePerson(uSelf);

      setMotherFirstEng('');
      setMotherLastEng('');
      setMotherFirstAmh('');
      setMotherLastAmh('');
      setMotherBirthDate('');
      setCreateMotherOpen(false);
      setSelectedMotherId(newMotherId);
    } catch (err) {
      console.error('Failed to save dynamic mother', err);
    }
  };

  const handleLinkSpouse = async (sId: string) => {
    if (!sId) return;
    const targetSpouse = people.find(p => p.id === sId);
    if (targetSpouse) {
      const uSpouse = { ...targetSpouse, spouseIds: [...targetSpouse.spouseIds.filter(id => id !== person.id), person.id] };
      const uSelf = { ...person, spouseIds: [...person.spouseIds.filter(id => id !== sId), sId] };
      onUpdatePerson(uSpouse);
      onUpdatePerson(uSelf);
      setSelectedSpouseId('');
    }
  };

  const handleCreateAndLinkPartner = async () => {
    if (!partnerFirstEng.trim() || !partnerLastEng.trim()) {
      alert(lang === 'en' ? 'Please fill in First and Last Name (English)' : 'እባክዎ ስምና የአያት ስም በእንግሊዝኛ ይሙሉ');
      return;
    }

    const newPartnerId = `p_spouse_dynamic_${Date.now()}`;
    const newPartner: Person = {
      id: newPartnerId,
      firstNameEnglish: partnerFirstEng.trim(),
      lastNameEnglish: partnerLastEng.trim(),
      firstNameAmharic: partnerFirstAmh.trim() || (lang === 'en' ? '' : partnerFirstEng.trim()),
      lastNameAmharic: partnerLastAmh.trim() || (lang === 'en' ? '' : partnerLastEng.trim()),
      gender: partnerGender,
      birthDate: partnerBirthDate || undefined,
      isLiving: true,
      spouseIds: [person.id],
      childIds: [],
      biographyEnglish: 'Registered directly as a partner in relation logs.',
      biographyAmharic: 'በትዳር አጋርነት ከመገለጫ ጋር በቀጥታ የተመዘገበ።'
    };

    try {
      // 1. Save new partner to offline IndexedDB store
      await savePerson(newPartner);
      
      // 2. Add as spouse to CURRENT person
      const uSelf = { 
        ...person, 
        spouseIds: [...person.spouseIds.filter(id => id !== newPartnerId), newPartnerId] 
      };

      // 3. Trigger parent update that saves current profile and re-syncs state lists
      onUpdatePerson(uSelf);

      // Reset dynamic partner forms
      setPartnerFirstEng('');
      setPartnerLastEng('');
      setPartnerFirstAmh('');
      setPartnerLastAmh('');
      setPartnerBirthDate('');
      setPartnerGender(person.gender === 'male' ? 'female' : 'male');
      setCreatePartnerOpen(false);
    } catch (err) {
      console.error('Failed to save dynamic new spouse', err);
    }
  };

  const handleUnlinkSpouse = async (sId: string) => {
    if (!sId) return;
    const targetSpouse = people.find(p => p.id === sId);
    if (targetSpouse) {
      const uSpouse = { ...targetSpouse, spouseIds: targetSpouse.spouseIds.filter(id => id !== person.id) };
      const uSelf = { ...person, spouseIds: person.spouseIds.filter(id => id !== sId) };
      onUpdatePerson(uSpouse);
      onUpdatePerson(uSelf);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      {/* Sidebar Profile Glance */}
      <div className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 gap-4">
        {/* Big Rounded Avatar with primary status ring */}
        <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-md border-4 border-white dark:border-zinc-900 ring-4 ring-orange-500/10">
          <img
            src={getPrimaryPhoto()}
            alt={person.firstNameEnglish}
            className="w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />

        </div>

        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
            {lang === 'en' ? person.firstNameEnglish : person.firstNameAmharic}
          </h2>
          <p className="text-sm font-sans tracking-tight text-zinc-700 dark:text-zinc-400 font-semibold mb-1">
            {lang === 'en' ? person.lastNameEnglish : person.lastNameAmharic}
          </p>
          {(person.nicknameEnglish || person.nicknameAmharic) && (
            <span className="inline-block bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 font-serif italic text-xs px-2 py-0.5 rounded border border-yellow-200/55 dark:border-yellow-900/20">
              "{lang === 'en' ? (person.nicknameEnglish || person.nicknameAmharic) : (person.nicknameAmharic || person.nicknameEnglish)}"
            </span>
          )}
        </div>

        {/* Life summaries */}
        <div className="w-full text-xs space-y-2 font-medium text-zinc-650 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-3">
          <div className="flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 p-1.5 rounded">
            <span className="font-mono text-[10px] text-zinc-400">{getTranslation('genderLabel', lang)}</span>
            <span className="font-sans capitalize">{getTranslation(person.gender, lang)}</span>
          </div>

          <div className="flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 p-1.5 rounded">
            <span className="font-mono text-[10px] text-zinc-400">{lang === 'en' ? 'Lifespan' : 'ዕድሜ'}</span>
            <span className="font-mono text-[11px]">
              {formatDate(person.birthDate)}
              {' - '}
              {person.isLiving ? (lang === 'en' ? 'Living' : 'በህይወት') : formatDate(person.deathDate)}
            </span>
          </div>

          {(person.jobEnglish || person.jobAmharic) && (
            <div className="flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 p-1.5 rounded bg-orange-50/10 dark:bg-orange-950/5">
              <span className="font-mono text-[10px] text-orange-600 dark:text-orange-400">{lang === 'en' ? 'Job / Profession' : 'ሥራ / ሙያ'}</span>
              <span className="font-sans font-semibold text-[11px] text-orange-700 dark:text-orange-300">
                {lang === 'en' ? (person.jobEnglish || person.jobAmharic) : (person.jobAmharic || person.jobEnglish)}
              </span>
            </div>
          )}

          {person.birthPlaceEnglish && (
            <div className="text-center bg-white/50 dark:bg-zinc-900/50 p-2 rounded">
              <span className="block font-mono text-[10px] text-zinc-400 mb-0.5">{getTranslation('birthPlace', lang)}</span>
              <span className="font-sans italic text-[11px] line-clamp-1">
                {lang === 'en' ? person.birthPlaceEnglish : person.birthPlaceAmharic}
              </span>
            </div>
          )}
        </div>

        {/* Direct Action Drawer buttons */}
        <div className="w-full pt-2 flex flex-col gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {getTranslation('edit', lang)}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="w-full py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel Edit
            </button>
          )}

          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this profile? All relationships of this profile will be unlinked.')) {
                onDeletePerson(person.id);
              }
            }}
            className="w-full py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md text-xs font-semibold transition-colors border border-rose-200/50 dark:border-rose-900/50 mt-1 flex justify-center items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Member
          </button>
        </div>
      </div>

      {/* Main Details Panel Tabs and Layout */}
      <div className="flex-1 flex flex-col">
        {/* Tab Headers */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
          <button
            onClick={() => setActiveTab('bio')}
            className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'bio'
                ? 'border-orange-600 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {getTranslation('biography', lang)}
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'relations'
                ? 'border-orange-600 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            {getTranslation('relationships', lang)}
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'media'
                ? 'border-orange-600 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <AudioLines className="w-4 h-4" />
            {getTranslation('attachments', lang)}
          </button>

        </div>

        {/* Tab Body Contents */}
        <div className="p-6 flex-1 overflow-y-auto">
          {isEditing ? (
            /* Personal Details Editing Form */
            <form onSubmit={handleSaveBasicDetails} className="space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-850 pb-2 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                Edit Profile Attributes
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">First Name (English)</label>
                  <input
                    type="text"
                    required
                    value={firstNameEng}
                    onChange={(e) => setFirstNameEng(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Last Name (English)</label>
                  <input
                    type="text"
                    required
                    value={lastNameEng}
                    onChange={(e) => setLastNameEng(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">First Name (Amharic - አማርኛ) [Optional]</label>
                  <input
                    type="text"
                    value={firstNameAmh}
                    onChange={(e) => setFirstNameAmh(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Last Name (Amharic - አማርኛ) [Optional]</label>
                  <input
                    type="text"
                    value={lastNameAmh}
                    onChange={(e) => setLastNameAmh(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Nickname / Title (English) [Optional]</label>
                  <input
                    type="text"
                    value={nicknameEng}
                    onChange={(e) => setNicknameEng(e.target.value)}
                    placeholder="e.g. Teddy, Priest, Fitaurari"
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Nickname / Title (Amharic) [Optional]</label>
                  <input
                    type="text"
                    value={nicknameAmh}
                    onChange={(e) => setNicknameAmh(e.target.value)}
                    placeholder="ለምሳሌ፡ ቴዲ፥ መምሬ፥ ፊትአውራሪ"
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="male">Male / ወንድ</option>
                    <option value="female">Female / ሴት</option>
                    <option value="other">Other / ሌላ</option>
                  </select>
                </div>
                <div>
                  <EthiopianDateInput
                    label={lang === 'en' ? 'Birth Date' : 'የትውልድ ቀን'}
                    value={editBirthDate}
                    onChange={setEditBirthDate}
                    lang={lang}
                    preferredCalendar={preferredCalendar}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-550 mb-1">Status</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        checked={isLiving}
                        onChange={() => setIsLiving(true)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span>Living</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        checked={!isLiving}
                        onChange={() => setIsLiving(false)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span>Deceased</span>
                    </label>
                  </div>
                </div>
              </div>

              {!isLiving && (
                <div>
                  <EthiopianDateInput
                    label={lang === 'en' ? 'Death Date' : 'የእረፍት ቀን'}
                    value={editDeathDate}
                    onChange={setEditDeathDate}
                    lang={lang}
                    preferredCalendar={preferredCalendar}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Birth Place (English)</label>
                  <input
                    type="text"
                    value={birthPlaceEng}
                    onChange={(e) => setBirthPlaceEng(e.target.value)}
                    placeholder="e.g. Gondar, Addis Ababa"
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Birth Place (Amharic - አማርኛ)</label>
                  <input
                    type="text"
                    value={birthPlaceAmh}
                    onChange={(e) => setBirthPlaceAmh(e.target.value)}
                    placeholder="ለምሳሌ፡ ጎንደር፥ አዲስ አበባ"
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Profession / Job (English)</label>
                  <input
                    type="text"
                    value={jobEng}
                    onChange={(e) => setJobEng(e.target.value)}
                    placeholder="e.g. Engineer, Farmer, Teacher"
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">ሥራ / ሙያ (Amharic - አማርኛ)</label>
                  <input
                    type="text"
                    value={jobAmh}
                    onChange={(e) => setJobAmh(e.target.value)}
                    placeholder="ለምሳሌ፡ መሃንዲስ፥ ገበሬ፥ መምህር"
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Biography Story (English)</label>
                <textarea
                  value={bioEng}
                  onChange={(e) => setBioEng(e.target.value)}
                  rows={3}
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Biography Story (Amharic - አማርኛ)</label>
                <textarea
                  value={bioAmh}
                  onChange={(e) => setBioAmh(e.target.value)}
                  rows={3}
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors text-zinc-800 dark:text-zinc-200"
                >
                  {getTranslation('cancel', lang)}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors font-semibold"
                >
                  {getTranslation('save', lang)}
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Tab BIO Content */}
              {activeTab === 'bio' && (
                <div className="space-y-6">
                  {/* Detailed Biographic narrative blocks */}
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-orange-50/20 dark:bg-orange-950/10 border-l-4 border-orange-500 p-4 rounded-r-lg">
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          English Memoir
                        </h4>
                        {!isEditingBioEng ? (
                          <button
                            onClick={() => {
                              setTempBioEng(person.biographyEnglish || '');
                              setIsEditingBioEng(true);
                            }}
                            className="bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded text-[10px] font-bold text-orange-655 dark:text-orange-400 tracking-tight transition cursor-pointer"
                          >
                            {lang === 'en' ? 'Edit Memoir' : 'ታሪክ አስተካክል'}
                          </button>
                        ) : null}
                      </div>

                      {isEditingBioEng ? (
                        <div className="space-y-2 mt-2">
                          <textarea
                            value={tempBioEng}
                            onChange={(e) => setTempBioEng(e.target.value)}
                            rows={5}
                            className="w-full text-xs p-2.5 rounded border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-orange-500 outline-none leading-relaxed"
                            placeholder="Type biography history registered..."
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setIsEditingBioEng(false)}
                              className="text-[10px] px-2.5 py-1.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-755 rounded font-extrabold text-zinc-700 dark:text-zinc-300 transition"
                            >
                              {lang === 'en' ? 'Cancel' : 'ተው'}
                            </button>
                            <button
                              onClick={() => handleSaveInlineBio('en')}
                              className="text-[10px] px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded font-bold text-white transition shadow-xs"
                            >
                              {lang === 'en' ? 'Save Changes' : 'አስቀምጥ'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-750 dark:text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                          {person.biographyEnglish || 'No biographical history registered yet for this member.'}
                        </p>
                      )}
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950/45 border-l-4 border-zinc-450 dark:border-zinc-750 p-4 rounded-r-lg">
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-zinc-650 dark:text-zinc-450 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          አማርኛ ታሪክ (Amharic Story)
                        </h4>
                        {!isEditingBioAmh ? (
                          <button
                            onClick={() => {
                              setTempBioAmh(person.biographyAmharic || '');
                              setIsEditingBioAmh(true);
                            }}
                            className="bg-white hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded text-[10px] font-bold text-zinc-600 dark:text-zinc-300 tracking-tight transition cursor-pointer"
                          >
                            {lang === 'en' ? 'Edit Amharic Story' : 'አማርኛ ታሪክ አስተካክል'}
                          </button>
                        ) : null}
                      </div>

                      {isEditingBioAmh ? (
                        <div className="space-y-2 mt-2">
                          <textarea
                            value={tempBioAmh}
                            onChange={(e) => setTempBioAmh(e.target.value)}
                            rows={5}
                            className="w-full text-xs p-2.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-orange-500 outline-none leading-relaxed"
                            placeholder="የህይወት ታሪክ እዚህ ይጻፉ..."
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setIsEditingBioAmh(false)}
                              className="text-[10px] px-2.5 py-1.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-755 rounded font-extrabold text-zinc-700 dark:text-zinc-300 transition"
                            >
                              {lang === 'en' ? 'Cancel' : 'ተው'}
                            </button>
                            <button
                              onClick={() => handleSaveInlineBio('am')}
                              className="text-[10px] px-3 py-1.5 bg-zinc-600 hover:bg-zinc-700 rounded font-bold text-white transition shadow-xs"
                            >
                              {lang === 'en' ? 'Save Changes' : 'አስቀምጥ'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                          {person.biographyAmharic || 'ለዚህ የቤተሰብ አባል የህይወት ታሪክ ገና አልተጻፈም።'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab RELATIONSHIPS Content */}
              {activeTab === 'relations' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Parent level link-backs with interactive dropdown edit & auto fillers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* FATHER COLUMN */}
                    <div className="border border-zinc-200 dark:border-zinc-805 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono mb-3">
                          {getTranslation('father', lang)}
                        </h4>
                        {father ? (
                          <div
                            onClick={() => onSelectPerson(father.id)}
                            className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-2.5 rounded-lg hover:shadow-xs cursor-pointer transition-shadow"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {father.firstNameEnglish.substring(0,2).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide">Biological Father</p>
                              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 truncate">{formatName(father)}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 italic my-1">{getTranslation('noFather', lang)}</p>
                        )}
                      </div>

                      {/* Father Inline Auto Filler Setup */}
                      <div className="mt-3.5 border-t border-dashed border-zinc-200 dark:border-zinc-800/80 pt-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400">
                            {person.fatherId ? 'Change Father Link:' : 'Link Father:'}
                          </label>
                          <button
                            type="button"
                            onClick={() => setCreateFatherOpen(!createFatherOpen)}
                            className="text-[9px] text-orange-650 dark:text-orange-400 hover:underline font-bold cursor-pointer"
                          >
                            {createFatherOpen ? 'Cancel' : 'Create & Link New'}
                          </button>
                        </div>

                        {!createFatherOpen ? (
                          <div className="flex gap-1 items-center w-full">
                            <AutofillSelector
                              candidates={people.filter(p => p.id !== person.id && p.gender === 'male' && !person.childIds.includes(p.id))}
                              selectedId={selectedFatherId}
                              onSelect={(val) => {
                                setSelectedFatherId(val);
                                if (val) {
                                  handleLinkFather(val);
                                }
                              }}
                              placeholder={lang === 'en' ? '-- Search / Select Father --' : '-- ስም ጽፈው አባት ይምረጡ --'}
                              lang={lang}
                            />
                            {person.fatherId && (
                              <button
                                onClick={handleUnlinkFather}
                                className="px-2 py-1.5 bg-red-50 text-red-650 hover:bg-red-100 border border-red-200/40 dark:bg-red-955/15 dark:border-red-900/30 dark:text-red-400 rounded text-xs transition font-semibold shrink-0 cursor-pointer"
                                title="Delete Link"
                              >
                                Unlink
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-850 space-y-2.5 text-xs">
                            <p className="font-bold text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Create Brand New Father</p>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="text"
                                  placeholder="First Name (Eng) *"
                                  value={fatherFirstEng}
                                  onChange={(e) => setFatherFirstEng(e.target.value)}
                                  className="border border-zinc-200 dark:border-zinc-800 p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Last Name (Eng) *"
                                  value={fatherLastEng}
                                  onChange={(e) => setFatherLastEng(e.target.value)}
                                  className="border border-zinc-200 dark:border-zinc-800 p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="text"
                                  placeholder="First Name (Amh)"
                                  value={fatherFirstAmh}
                                  onChange={(e) => setFatherFirstAmh(e.target.value)}
                                  className="border border-zinc-200 dark:border-zinc-800 p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Last Name (Amh)"
                                  value={fatherLastAmh}
                                  onChange={(e) => setFatherLastAmh(e.target.value)}
                                  className="border border-zinc-200 dark:border-zinc-800 p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                                />
                              </div>
                              <div className="flex items-center gap-2 justify-between">
                                <span className="text-[10px] text-zinc-400 font-mono">Birth Date:</span>
                                <input
                                  type="date"
                                  value={fatherBirthDate}
                                  onChange={(e) => setFatherBirthDate(e.target.value)}
                                  className="border border-zinc-200 dark:border-zinc-800 p-1 rounded bg-zinc-50 dark:bg-zinc-900 text-[10px] outline-none text-zinc-750 dark:text-zinc-200"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-850">
                              <button
                                type="button"
                                onClick={() => setCreateFatherOpen(false)}
                                className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 rounded text-[10px] text-zinc-600 dark:text-zinc-300 font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleCreateAndLinkFather}
                                className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded text-[10px] cursor-pointer"
                              >
                                Save Father
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* MOTHER COLUMN */}
                    <div className="border border-zinc-200 dark:border-zinc-805 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono mb-3">
                          {getTranslation('mother', lang)}
                        </h4>
                        {mother ? (
                          <div
                            onClick={() => onSelectPerson(mother.id)}
                            className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-2.5 rounded-lg hover:shadow-xs cursor-pointer transition-shadow"
                          >
                            <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {mother.firstNameEnglish.substring(0,2).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide">Biological Mother</p>
                              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 truncate">{formatName(mother)}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 italic my-1">{getTranslation('noMother', lang)}</p>
                        )}
                      </div>

                      {/* Mother Inline Auto Filler Setup */}
                      <div className="mt-3.5 border-t border-dashed border-zinc-200 dark:border-zinc-800/80 pt-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400">
                            {person.motherId ? 'Change Mother Link:' : 'Link Mother:'}
                          </label>
                          <button
                            type="button"
                            onClick={() => setCreateMotherOpen(!createMotherOpen)}
                            className="text-[9px] text-orange-650 dark:text-orange-400 hover:underline font-bold cursor-pointer"
                          >
                            {createMotherOpen ? 'Cancel' : 'Create & Link New'}
                          </button>
                        </div>

                        {!createMotherOpen ? (
                          <div className="flex gap-1 items-center w-full">
                            <AutofillSelector
                              candidates={people.filter(p => p.id !== person.id && p.gender === 'female' && !person.childIds.includes(p.id))}
                              selectedId={selectedMotherId}
                              onSelect={(val) => {
                                setSelectedMotherId(val);
                                if (val) {
                                  handleLinkMother(val);
                                }
                              }}
                              placeholder={lang === 'en' ? '-- Search / Select Mother --' : '-- ስም ጽፈው እናት ይምረጡ --'}
                              lang={lang}
                            />
                            {person.motherId && (
                              <button
                                onClick={handleUnlinkMother}
                                className="px-2 py-1.5 bg-red-50 text-red-650 hover:bg-red-100 border border-red-200/40 dark:bg-red-955/15 dark:border-red-900/30 dark:text-red-400 rounded text-xs transition font-semibold shrink-0 cursor-pointer"
                                title="Delete Link"
                              >
                                Unlink
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-850 space-y-2.5 text-xs">
                            <p className="font-bold text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Create Brand New Mother</p>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="text"
                                  placeholder="First Name (Eng) *"
                                  value={motherFirstEng}
                                  onChange={(e) => setMotherFirstEng(e.target.value)}
                                  className="border border-zinc-200 dark:border-zinc-800 p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Last Name (Eng) *"
                                  value={motherLastEng}
                                  onChange={(e) => setMotherLastEng(e.target.value)}
                                  className="border border-zinc-200 dark:border-zinc-800 p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="text"
                                  placeholder="First Name (Amh)"
                                  value={motherFirstAmh}
                                  onChange={(e) => setMotherFirstAmh(e.target.value)}
                                  className="border border-zinc-200 dark:border-zinc-800 p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Last Name (Amh)"
                                  value={motherLastAmh}
                                  onChange={(e) => setMotherLastAmh(e.target.value)}
                                  className="border border-zinc-200 dark:border-zinc-800 p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-100 outline-none"
                                />
                              </div>
                              <div className="flex items-center gap-2 justify-between">
                                <span className="text-[10px] text-zinc-400 font-mono">Birth Date:</span>
                                <input
                                  type="date"
                                  value={motherBirthDate}
                                  onChange={(e) => setMotherBirthDate(e.target.value)}
                                  className="border border-zinc-200 dark:border-zinc-800 p-1 rounded bg-zinc-50 dark:bg-zinc-900 text-[10px] outline-none text-zinc-750 dark:text-zinc-200"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-850">
                              <button
                                type="button"
                                onClick={() => setCreateMotherOpen(false)}
                                className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 rounded text-[10px] text-zinc-600 dark:text-zinc-300 font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleCreateAndLinkMother}
                                className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded text-[10px] cursor-pointer"
                              >
                                Save Mother
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Registered Partners / Spouses with inline add & remove linking button options */}
                  <div className="border border-zinc-200 dark:border-zinc-805 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono mb-3">
                      {getTranslation('spouses', lang)}
                    </h4>
                    {spousesList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {spousesList.map((sp) => (
                          <div
                            key={sp.id}
                            className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-2.5 rounded-lg hover:shadow-xs transition"
                          >
                            <div
                              onClick={() => onSelectPerson(sp.id)}
                              className="flex items-center gap-3 cursor-pointer truncate"
                            >
                              <span className="text-rose-500">❤️</span>
                              <div className="truncate">
                                <p className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Linked Partner</p>
                                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 truncate">{formatName(sp)}</p>
                              </div>
                            </div>

                            {/* Unlink partner button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlinkSpouse(sp.id);
                              }}
                              className="p-1 px-2 text-[10px] font-extrabold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-955/15 dark:text-red-400 rounded border border-red-200/30 cursor-pointer ml-2 transition"
                              title="Unlink Partner"
                            >
                              Unlink
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic mt-1 mb-4">{getTranslation('noSpouse', lang)}</p>
                    )}

                    {/* Inline Autofill linking option for Partners */}
                    <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3.5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono shrink-0">Link New Partner (Autofill Selection):</span>
                        <div className="w-full sm:max-w-md flex flex-col sm:flex-row gap-2">
                          <div className="flex-1">
                            <AutofillSelector
                              candidates={people.filter(p => p.id !== person.id && !person.spouseIds.includes(p.id) && !person.childIds.includes(p.id))}
                              selectedId={selectedSpouseId}
                              onSelect={(val) => {
                                setSelectedSpouseId(val);
                                if (val) {
                                  handleLinkSpouse(val);
                                }
                              }}
                              placeholder={lang === 'en' ? '-- Search / Select Partner --' : '-- ስም ጽፈው ጓደኛ ይምረጡ --'}
                              lang={lang}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCreatePartnerOpen(!createPartnerOpen);
                            }}
                            className="text-[10px] whitespace-nowrap bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            {createPartnerOpen ? (lang === 'en' ? 'Use Select' : 'ለመምረጥ') : (lang === 'en' ? 'Create & Link New' : 'አዲስ ፈጥረህ አገናኝ')}
                          </button>
                        </div>
                      </div>

                      {createPartnerOpen && (
                        <div className="border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3.5 animate-fadeIn">
                          <h5 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono flex items-center justify-between">
                            <span>Create &amp; Link Brand New Partner Profile</span>
                            <button
                              type="button"
                              onClick={() => setCreatePartnerOpen(false)}
                              className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-300 mb-1 font-semibold">First Name (English) *</label>
                              <input
                                type="text"
                                required
                                value={partnerFirstEng}
                                onChange={(e) => setPartnerFirstEng(e.target.value)}
                                className="w-full border border-zinc-200 dark:border-zinc-800 p-2 rounded bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="First Name in English"
                              />
                            </div>
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-300 mb-1 font-semibold">Last Name (English) *</label>
                              <input
                                type="text"
                                required
                                value={partnerLastEng}
                                onChange={(e) => setPartnerLastEng(e.target.value)}
                                className="w-full border border-zinc-200 dark:border-zinc-800 p-2 rounded bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="Last Name in English"
                              />
                            </div>
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-300 mb-1 font-semibold">First Name (Amharic) [Optional]</label>
                              <input
                                type="text"
                                value={partnerFirstAmh}
                                onChange={(e) => setPartnerFirstAmh(e.target.value)}
                                className="w-full border border-zinc-200 dark:border-zinc-800 p-2 rounded bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="የመጀመሪያ ስም በአማርኛ"
                              />
                            </div>
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-300 mb-1 font-semibold">Last Name (Amharic) [Optional]</label>
                              <input
                                type="text"
                                value={partnerLastAmh}
                                onChange={(e) => setPartnerLastAmh(e.target.value)}
                                className="w-full border border-zinc-200 dark:border-zinc-800 p-2 rounded bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="የአያት ስም በአማርኛ"
                              />
                            </div>
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-300 mb-1 font-semibold">Gender</label>
                              <select
                                value={partnerGender}
                                onChange={(e) => setPartnerGender(e.target.value as any)}
                                className="w-full border border-zinc-200 dark:border-zinc-800 p-2 rounded bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 outline-none cursor-pointer"
                              >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-300 mb-1 font-semibold">Birth Date [Optional]</label>
                              <input
                                type="date"
                                value={partnerBirthDate}
                                onChange={(e) => setPartnerBirthDate(e.target.value)}
                                className="w-full border border-zinc-200 dark:border-zinc-800 p-2 rounded bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-orange-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-850/50">
                            <button
                              type="button"
                              onClick={() => {
                                setCreatePartnerOpen(false);
                              }}
                              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750/90 rounded text-xs text-zinc-600 dark:text-zinc-300 font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleCreateAndLinkPartner}
                              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold text-xs shadow-xs cursor-pointer"
                            >
                              Save &amp; Link Partner
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Registered Children descendants */}
                  <div className="border border-zinc-200 dark:border-zinc-805 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono mb-3">
                      {getTranslation('children', lang)}
                    </h4>
                    {childrenList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {childrenList.map((ch) => (
                          <div
                            key={ch.id}
                            onClick={() => onSelectPerson(ch.id)}
                            className="flex items-center gap-2.5 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-2.5 rounded-lg hover:shadow-xs cursor-pointer transition-shadow"
                          >
                            <span className="w-2 h-2 rounded-full bg-orange-400 mr-1" />
                            <div className="truncate">
                              <p className="text-sm font-semibold text-orange-650 dark:text-orange-400 truncate">{formatName(ch)}</p>
                              <p className="text-[10px] text-zinc-400 font-mono">
                                {ch.birthDate ? `${new Date(ch.birthDate).getFullYear()}` : 'No date'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic mt-1">{getTranslation('noChildren', lang)}</p>
                    )}
                  </div>

                  {/* SIBLINGS SECTION */}
                  <div className="border border-zinc-200 dark:border-zinc-805 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono mb-3 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-orange-500" />
                      {lang === 'en' ? 'Siblings & Half-Siblings' : 'ወንድሞች እና እህቶች'}
                    </h4>
                    {siblingsList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {siblingsList.map((sib) => {
                          const isFullSibling = person.fatherId && sib.fatherId === person.fatherId &&
                                                person.motherId && sib.motherId === person.motherId;
                          let relLabel = '';
                          if (isFullSibling) {
                            relLabel = lang === 'en' ? 'Full Sibling' : 'ሙሉ ወንድም/እህት';
                          } else if (person.fatherId && sib.fatherId === person.fatherId) {
                            relLabel = lang === 'en' ? 'Paternal Half-Sibling' : 'የአባት ወገን ወንድም/እህት';
                          } else if (person.motherId && sib.motherId === person.motherId) {
                            relLabel = lang === 'en' ? 'Maternal Half-Sibling' : 'የእናት ወገን ወንድም/እህት';
                          } else {
                            relLabel = lang === 'en' ? 'Half-Sibling' : 'ከፊል ወንድም/እህት';
                          }

                          return (
                            <div
                              key={sib.id}
                              onClick={() => onSelectPerson(sib.id)}
                              className="flex items-center gap-2.5 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-2.5 rounded-lg hover:shadow-xs cursor-pointer transition-shadow"
                            >
                              <span className="w-2 h-2 rounded-full bg-blue-400 mr-1" />
                              <div className="truncate">
                                <p className="text-sm font-semibold text-orange-650 dark:text-orange-400 truncate">{formatName(sib)}</p>
                                <p className="text-[10px] text-zinc-400 font-mono">
                                  {relLabel} {sib.birthDate ? `(b. ${new Date(sib.birthDate).getFullYear()})` : ''}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic mt-1">
                        {lang === 'en' ? 'No siblings recorded for this profile.' : 'ለዚህ መገለጫ የተመዘገቡ ወንድሞች ወይም እህቶች የሉም።'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab MEDIA ATTACHMENTS Content */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  {/* Photo Gallery with simulation upload form */}
                  <div>
                    <div className="flex justify-between items-center mb-3 pb-1 border-b border-zinc-100 dark:border-zinc-850">
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                        <FolderKanban className="w-4 h-4 text-orange-500" />
                        Photos Captured
                      </h4>
                      <button
                        onClick={() => setShowPhotoForm(!showPhotoForm)}
                        className="text-xs bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition px-2 py-1 rounded text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Photo</span>
                      </button>
                    </div>

                    {showPhotoForm && (
                      <form onSubmit={simulateAddPhoto} className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-lg mb-4 text-xs space-y-3 border border-zinc-200/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-zinc-500 mb-0.5">Caption Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Grandma cooking"
                              value={newPhotoCaption}
                              onChange={(e) => setNewPhotoCaption(e.target.value)}
                              className="w-full border p-1.5 rounded dark:bg-zinc-900"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-zinc-500 mb-0.5">Custom Image URL (Optional)</label>
                            <input
                              type="url"
                              placeholder="Leave empty for stylized avatar asset"
                              value={newPhotoUrl}
                              onChange={(e) => setNewPhotoUrl(e.target.value)}
                              className="w-full border p-1.5 rounded dark:bg-zinc-900"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowPhotoForm(false)}
                            className="bg-zinc-200 text-zinc-800 px-3 py-1.5 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-orange-600 text-white px-3 py-1.5 rounded font-semibold"
                          >
                            Save Photo asset
                          </button>
                        </div>
                      </form>
                    )}

                    {person.photos && person.photos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {person.photos.map((ph) => (
                          <div key={ph.id} className="border border-zinc-150 dark:border-zinc-850 p-2 rounded-lg bg-zinc-50/30 dark:bg-zinc-950/10 flex flex-col gap-1">
                            <div className="w-full h-24 rounded overflow-hidden shadow-inner border border-zinc-200 dark:border-zinc-850">
                              <img
                                src={ph.url}
                                alt={ph.caption}
                                className="w-full h-full object-cover select-none"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="text-[10px] text-zinc-500 truncate text-center block mt-1 font-sans italic">{ph.caption || 'No caption'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">No historical photos uploaded.</p>
                    )}
                  </div>

                  {/* Documents registry */}
                  <div>
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-3 pb-1 border-b border-zinc-100 dark:border-zinc-850 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-orange-500" />
                      Deeds & Written parish documents
                    </h4>
                    <p className="text-xs text-zinc-500 mb-2">Simulated integration with IndexedDB file reader for legal/heritage document proofing.</p>
                    <div className="border border-dashed border-zinc-300 dark:border-zinc-850 p-6 rounded-lg text-center text-xs text-zinc-400">
                      Standardized file sync connects marriage licenses, land grants, legacy deeds instantly here in offline environment.
                    </div>
                  </div>
                </div>
              )}


            </>
          )}
        </div>
      </div>
    </div>
  );
}
