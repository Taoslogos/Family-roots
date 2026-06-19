/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PhotoAsset {
  id: string;
  url: string; // Data URL or placeholder
  caption?: string;
  isPrimary?: boolean;
}

export interface DocumentAsset {
  id: string;
  name: string;
  url: string; // Data URL or placeholder description or text content
  category?: string; // 'birth_certificate' | 'marriage_license' | 'will' | 'other'
}

export interface AudioMemoryAsset {
  id: string;
  name: string;
  url: string; // Microphone input data URL or simulated recording
  speaker?: string;
}

export interface VideoAsset {
  id: string;
  name: string;
  url: string; // Simulated video URL
  title?: string;
}

export interface Person {
  id: string;
  firstNameEnglish: string;
  lastNameEnglish: string;
  firstNameAmharic: string;
  lastNameAmharic: string;
  nicknameEnglish?: string;
  nicknameAmharic?: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string; // YYYY-MM-DD format
  birthPlaceEnglish?: string;
  birthPlaceAmharic?: string;
  deathDate?: string; // YYYY-MM-DD format, blank if alive
  isLiving: boolean;
  biographyEnglish?: string;
  biographyAmharic?: string;
  jobEnglish?: string;
  jobAmharic?: string;
  
  // Relationships
  fatherId?: string;
  motherId?: string;
  spouseIds: string[];
  childIds: string[];
  
  // Attachments
  photos?: PhotoAsset[];
  documents?: DocumentAsset[];
  audioMemories?: AudioMemoryAsset[];
  videos?: VideoAsset[];
  
  createdAt?: number;
  updatedAt?: number;
}

export type Language = 'en' | 'am';

export interface SearchFilters {
  query: string;
  gender: string;
  birthYearStart: string;
  birthYearEnd: string;
  isLiving: string;
  branchId: string; // Selected ancestor branch
}

export interface TranslationDict {
  appName: string;
  dashboard: string;
  familyTree: string;
  personDetails: string;
  relationshipFinder: string;
  search: string;
  timeline: string;
  statistics: string;
  importExport: string;
  settings: string;
  languageLabel: string;
  english: string;
  amharic: string;
  activeLanguage: string;
  
  // General Terms
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  add: string;
  addPerson: string;
  editPerson: string;
  fullName: string;
  firstName: string;
  lastName: string;
  nickname: string;
  genderLabel: string;
  male: string;
  female: string;
  other: string;
  birthDate: string;
  deathDate: string;
  birthPlace: string;
  isLivingLabel: string;
  living: string;
  deceased: string;
  biography: string;
  primaryPhoto: string;
  attachments: string;
  photos: string;
  documents: string;
  audioMemories: string;
  videos: string;
  
  // Relationships
  relationships: string;
  father: string;
  mother: string;
  spouses: string;
  children: string;
  noFather: string;
  noMother: string;
  noSpouse: string;
  noChildren: string;
  selectFather: string;
  selectMother: string;
  addSpouse: string;
  addChild: string;
  
  // Finder
  startPerson: string;
  endPerson: string;
  calculateRelationship: string;
  relationshipResult: string;
  generationDistance: string;
  relationshipPath: string;
  noPathFound: string;
  
  // Search
  searchPlaceholder: string;
  birthYearRange: string;
  allBranches: string;
  noResults: string;
  
  // Stats
  totalMembers: string;
  livingMembers: string;
  deceasedMembers: string;
  oldestAncestor: string;
  generationCount: string;
  genderDistribution: string;
  
  // Verification
  // Import/Export
  exportData: string;
  importData: string;
  smartMerge: string;
  conflictReview: string;
  dragDropJsonCsv: string;
  downloadJson: string;
  downloadCsv: string;
  duplicateDetected: string;
  
  // Settings
  theme: string;
  lightMode: string;
  darkMode: string;
  dangerZone: string;
  clearDatabase: string;
}
