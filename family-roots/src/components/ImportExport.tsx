/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Person, Language } from '../types';
import { smartMergePeople, detectDuplicates } from '../lib/genealogyEngine';
import { getTranslation } from '../lib/sampleData';
import { Upload, Download, CheckCircle, AlertTriangle, HelpCircle, FileJson, FileSpreadsheet, Eye } from 'lucide-react';

interface ImportExportProps {
  people: Person[];
  lang: Language;
  onImportComplete: (updatedList: Person[]) => void;
}

export default function ImportExport({
  people,
  lang,
  onImportComplete,
}: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [dragActive, setDragActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Conflict / Merge review states
  const [stageImportList, setStageImportList] = useState<Person[] | null>(null);
  const [addedCount, setAddedCount] = useState(0);
  const [mergedCount, setMergedCount] = useState(0);

  // Helper: Sanitize quotes for CSV
  const escapeCSV = (val: any) => {
    if (val === undefined || val === null) return '';
    let str = String(val);
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  // 1. Export JSON
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(people, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'family_roots_export_' + new Date().toISOString().split('T')[0] + '.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setSuccessMsg(lang === 'en' ? 'JSON database downloaded successfully' : 'የJSON የቤተሰብ መረጃ በተሳካ ሁኔታ ወርዷል');
      setErrorMsg('');
    } catch (e) {
      setErrorMsg('Export JSON failed.');
    }
  };

  // 2. Export CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        'id', 'firstNameEnglish', 'lastNameEnglish', 'firstNameAmharic', 'lastNameAmharic',
        'nicknameEnglish', 'nicknameAmharic', 'gender', 'birthDate', 'birthPlaceEnglish',
        'birthPlaceAmharic', 'deathDate', 'isLiving', 'biographyEnglish', 'biographyAmharic',
        'fatherId', 'motherId'
      ];

      const csvRows = [headers.join(',')];

      people.forEach((p) => {
        const row = [
          escapeCSV(p.id),
          escapeCSV(p.firstNameEnglish),
          escapeCSV(p.lastNameEnglish),
          escapeCSV(p.firstNameAmharic),
          escapeCSV(p.lastNameAmharic),
          escapeCSV(p.nicknameEnglish),
          escapeCSV(p.nicknameAmharic),
          escapeCSV(p.gender),
          escapeCSV(p.birthDate),
          escapeCSV(p.birthPlaceEnglish),
          escapeCSV(p.birthPlaceAmharic),
          escapeCSV(p.deathDate),
          escapeCSV(p.isLiving ? 'true' : 'false'),
          escapeCSV(p.biographyEnglish),
          escapeCSV(p.biographyAmharic),
          escapeCSV(p.fatherId),
          escapeCSV(p.motherId),
        ];
        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const exportFileDefaultName = 'family_roots_export_' + new Date().toISOString().split('T')[0] + '.csv';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      setSuccessMsg(lang === 'en' ? 'CSV list downloaded successfully' : 'የCSV ዝርዝር በተሳካ ሁኔታ ወርዷል');
      setErrorMsg('');
    } catch (e) {
      setErrorMsg('Export CSV failed.');
    }
  };

  // 3. Import Parser (Client-Side HTML5 File System FileReader)
  const processFileContent = (content: string, isJson: boolean) => {
    try {
      let incomingPeople: Person[] = [];

      if (isJson) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          incomingPeople = parsed as Person[];
        } else {
          throw new Error('Parsed JSON is not an array of profiles');
        }
      } else {
        // Parse CSV
        const lines = content.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) throw new Error('CSV is empty or missing headers');

        // Simple CSV parser that handles basic quotes
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        
        for (let idx = 1; idx < lines.length; idx++) {
          const line = lines[idx];
          // Dynamic quote-friendly split cell
          let cells: string[] = [];
          let currentCell = '';
          let insideQuotes = false;

          for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"' && line[c+1] === '"') {
              currentCell += '"';
              c++;
            } else if (char === '"') {
              insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
              cells.push(currentCell.trim());
              currentCell = '';
            } else {
              currentCell += char;
            }
          }
          cells.push(currentCell.trim());

          const rowData: any = {};
          headers.forEach((header, cellIndex) => {
            rowData[header] = cells[cellIndex] || '';
          });

          if (rowData.firstNameEnglish) {
            incomingPeople.push({
              id: rowData.id || `imp_${Date.now()}_${idx}`,
              firstNameEnglish: rowData.firstNameEnglish,
              lastNameEnglish: rowData.lastNameEnglish || '',
              firstNameAmharic: rowData.firstNameAmharic || '',
              lastNameAmharic: rowData.lastNameAmharic || '',
              nicknameEnglish: rowData.nicknameEnglish || undefined,
              nicknameAmharic: rowData.nicknameAmharic || undefined,
              gender: (rowData.gender?.toLowerCase() === 'female' ? 'female' : (rowData.gender?.toLowerCase() === 'other' ? 'other' : 'male')) as any,
              birthDate: rowData.birthDate || undefined,
              birthPlaceEnglish: rowData.birthPlaceEnglish || undefined,
              birthPlaceAmharic: rowData.birthPlaceAmharic || undefined,
              deathDate: rowData.deathDate || undefined,
              isLiving: rowData.isLiving !== 'false',
              biographyEnglish: rowData.biographyEnglish || undefined,
              biographyAmharic: rowData.biographyAmharic || undefined,
              fatherId: rowData.fatherId || undefined,
              motherId: rowData.motherId || undefined,
              spouseIds: [],
              childIds: [],
            });
          }
        }
      }

      if (incomingPeople.length === 0) {
        throw new Error('No valid family profiles detected in file');
      }

      // Calculate preview of Smart Merge
      const { AddedCount, MergedCount } = smartMergePeople(people, incomingPeople);
      setAddedCount(AddedCount);
      setMergedCount(MergedCount);
      setStageImportList(incomingPeople);
      setSuccessMsg('');
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(lang === 'en' ? `Parsing Failed: ${err.message}` : `መረጃ ማስገባት አልተቻለም፤ ${err.message}`);
      setStageImportList(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const r = new FileReader();
    r.onload = (event) => {
      const text = event.target?.result as string;
      const isJson = file.name.endsWith('.json');
      processFileContent(text, isJson);
    };
    r.readAsText(file);
  };

  // Drag and Drop helpers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const r = new FileReader();
    r.onload = (event) => {
      const text = event.target?.result as string;
      const isJson = file.name.endsWith('.json');
      processFileContent(text, isJson);
    };
    r.readAsText(file);
  };

  // Commit merged results
  const commitImportGroup = () => {
    if (!stageImportList) return;
    
    // Smart merge execution
    const { MergedList } = smartMergePeople(people, stageImportList);
    onImportComplete(MergedList);
    
    setSuccessMsg(lang === 'en' ? `Smart-Merge successful! Infused ${addedCount} new member(s) and synced ${mergedCount} fields.` : `አስገባው በተሳካ ሁኔታ ተጠናቋል። ${addedCount} አዲስ አባላትን በማዋሃድ ${mergedCount} መረጃዎችን አሻሽሏል።`);
    setStageImportList(null);
    setAddedCount(0);
    setMergedCount(0);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      
      {/* Header section */}
      <div className="flex gap-3 border-b border-zinc-100 dark:border-zinc-850 pb-3">
        <Upload className="h-6 w-6 text-orange-550 shrink-0" />
        <div className="flex-1">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {getTranslation('importExport', lang)}
          </h2>
          <p className="text-xs text-zinc-400">
            {lang === 'en' 
              ? 'Synchronize or backup your offline genealogy indexes. Smart-Merge guarantees that zero existing elements are ever overwritten or deleted during sync cycles.' 
              : 'የቤተሰብ መዛግብትዎን ደህንነቱ በተጠበቀ ሁኔታ ያስገቡ ወይም ያስወጡ። ብልህ-መዋሃድ ዘዴ በአስገባ ዑደት ወቅት ምንም ዓይነት መረጃ መጥፋቱን ያስቀራል።'}
          </p>
        </div>
      </div>

      {/* Grid: Columns on file transfers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Panel A: Drag Drop Area */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-400 uppercase">
            {lang === 'en' ? 'A. Synchronize Incoming File' : 'ሀ. የዘር ሀረግ ፋይል ያስገቡ'}
          </h3>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col justify-center items-center gap-3 ${
              dragActive
                ? 'border-orange-500 bg-orange-50/10'
                : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700 bg-zinc-50/20 dark:bg-zinc-950/25'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="h-10 w-10 bg-orange-100/50 dark:bg-orange-955/20 text-orange-650 rounded-full flex items-center justify-center border border-orange-200/50">
              <Upload className="h-5 w-5" />
            </div>

            <p className="text-xs text-zinc-650 dark:text-zinc-300 font-sans leading-relaxed px-4">
              {getTranslation('dragDropJsonCsv', lang)}
            </p>
            <span className="text-[10px] text-zinc-400 font-mono">Supports family_tree.json or standard layout CSV</span>
          </div>
        </div>

        {/* Panel B: Download Database Backups */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold font-mono tracking-widest text-zinc-400 uppercase">
            {lang === 'en' ? 'B. Safe Backup Exports' : 'ለ. ምትኬዎችን ወደ ውጭ ይላኩ'}
          </h3>

          <div className="border border-zinc-150 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-950/25 p-5 rounded-xl space-y-4">
            <p className="text-xs text-zinc-500 leading-relaxed font-sans">
              Download your offline local database instantly. Store these backups locally to load and sync across other devices at any continuous time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={handleExportJSON}
                className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold select-none flex items-center gap-2 justify-center transition border border-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                <FileJson className="w-4 h-4 shrink-0" />
                {getTranslation('downloadJson', lang)}
              </button>

              <button
                onClick={handleExportCSV}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold select-none flex items-center gap-2 justify-center transition shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                {getTranslation('downloadCsv', lang)}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Messages responses feedback */}
      {successMsg && (
        <div className="bg-emerald-50/85 dark:bg-emerald-950/15 border border-emerald-200/40 text-emerald-800 dark:text-emerald-400 text-xs p-3.5 rounded-lg flex items-center gap-2.5 font-sans">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50/85 dark:bg-rose-950/15 border border-rose-250/20 text-rose-800 dark:text-rose-400 text-xs p-3.5 rounded-lg flex items-center gap-2.5 font-sans">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STAGED IMPORT CONFLICT REVIEW POPUP */}
      {stageImportList && (
        <div className="border border-orange-200/60 dark:border-orange-900/20 rounded-xl p-5 bg-orange-50/10 dark:bg-orange-955/5 space-y-4 animate-fadeIn">
          <div className="flex gap-2.5 items-start">
            <AlertTriangle className="h-5.5 w-5.5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-150">
                {getTranslation('conflictReview', lang)} (Smart Sync Report)
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Our parser has cross-referenced the incoming directory file against your active genealogy tree. Read conflict calculations below before merging.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-white dark:bg-zinc-900/60 p-4 rounded-lg border border-zinc-150 dark:border-zinc-800 max-w-md">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-wider block">Added Members</span>
              <span className="text-2xl font-bold text-emerald-600 font-mono">{addedCount}</span>
              <p className="text-[9px] text-zinc-400 font-mono mt-0.5">Identified as new individuals</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-wider block">Merged Profiles</span>
              <span className="text-2xl font-bold text-blue-600 font-mono">{mergedCount}</span>
              <p className="text-[9px] text-zinc-400 font-mono mt-0.5">Existing profiles infused with details</p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-zinc-200/50">
            <button
              onClick={() => {
                setStageImportList(null);
                setAddedCount(0);
                setMergedCount(0);
              }}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-150 rounded text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-750 transition"
            >
              Cancel Sync
            </button>
            <button
              onClick={commitImportGroup}
              className="px-4.5 py-2 bg-orange-660 hover:bg-orange-700 text-white rounded text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
              style={{ backgroundColor: '#ea580c' }}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Integration</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
