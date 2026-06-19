/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Person } from '../types';

export const SAMPLE_PEOPLE: Person[] = [
  // Generation 1 (Root Ancestors)
  {
    id: 'anc_1',
    firstNameEnglish: 'Alemayehu',
    lastNameEnglish: 'Gebrewold',
    firstNameAmharic: 'አለማየሁ',
    lastNameAmharic: 'ገብረወልድ',
    nicknameEnglish: 'The Wise Patriarch',
    nicknameAmharic: 'ጠቢቡ አባት',
    gender: 'male',
    birthDate: '1918-09-12',
    birthPlaceEnglish: 'Gondar, Amhara',
    birthPlaceAmharic: 'ጎንደር፥ አማራ',
    deathDate: '2005-03-14',
    isLiving: false,
    biographyEnglish: 'Alemayehu was a beloved merchant, community leader, and keeper of family history in Gondar. He moved to Addis Ababa in 1955, establishing a successful import/export business. He was known for his vast memory and his ability to recite seven generations of ancestors by heart.',
    biographyAmharic: 'አለማየሁ በጎንደር የሚወደድ ነጋዴ፣ የሕዝብ መሪ እና የቤተሰብ ታሪክ ጠባቂ ነበሩ። በ፲፱፻፶፭ ዓ.ም ወደ አዲስ አበባ በመምጣት ስኬታማ የማስመጣትና መላክ ንግድ መስርተዋል። ሰባት የቤተሰብ ትውልዶችን በቃል መቁጠር በሚችልበት ሰፊ ትዝታቸው ይታወቁ ነበር።',
    spouseIds: ['anc_2'],
    childIds: ['child_1', 'child_2', 'child_3'],
    photos: [
      {
        id: 'p_anc1_1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23c2410c"><circle cx="50" cy="50" r="50"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">AG</text></svg>',
        caption: 'Alemayehu in Gondar (1945)',
        isPrimary: true
      }
    ]
  },
  {
    id: 'anc_2',
    firstNameEnglish: 'Tsehai',
    lastNameEnglish: 'Kebede',
    firstNameAmharic: 'ፀሐይ',
    lastNameAmharic: 'ከበደ',
    nicknameEnglish: 'Emama Tsehai',
    nicknameAmharic: 'እማማ ፀሐይ',
    gender: 'female',
    birthDate: '1925-05-04',
    birthPlaceEnglish: 'Axum, Tigray',
    birthPlaceAmharic: 'አክሱም፥ ትግራይ',
    deathDate: '2012-11-20',
    isLiving: false,
    biographyEnglish: 'Tsehai was an exceptional weaver, horticulturist, and the energetic heart of the household. She spoke several regional languages and was renowned for her hospitality, traditional remedies, and incredible recipes for Tej and coffee.',
    biographyAmharic: 'እማማ ፀሐይ ድንቅ ሽማኔ፣ የአትክልት ባለሙያ እና የቤተሰቡ ደማቅ ልብ ነበሩ። በርካታ የሃገር ውስጥ ቋንቋዎችን የሚናገሩ ሲሆን፥ በእንግዳ ተቀባይነታቸው፣ በባህላዊ ህክምናቸው እና በልዩ የጠጅና ቡና አዘገጃጀታቸው ዝነኛ ነበሩ።',
    spouseIds: ['anc_1'],
    childIds: ['child_1', 'child_2', 'child_3'],
    photos: [
      {
        id: 'p_anc2_1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23db2777"><circle cx="50" cy="50" r="50"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">TK</text></svg>',
        caption: 'Matriarch Tsehai (1960)',
        isPrimary: true
      }
    ]
  },

  // Generation 2 (Children of Alemayehu and Tsehai)
  {
    id: 'child_1',
    firstNameEnglish: 'Yohannes',
    lastNameEnglish: 'Alemayehu',
    firstNameAmharic: 'ዮሐንስ',
    lastNameAmharic: 'አለማየሁ',
    gender: 'male',
    birthDate: '1948-02-18',
    birthPlaceEnglish: 'Gondar, Amhara',
    birthPlaceAmharic: 'ጎንደር፥ አማራ',
    isLiving: true,
    biographyEnglish: 'Yohannes trained as a civil engineer at Addis Ababa University and built major roads and infrastructure projects across Ethiopia. He is a passionate lover of traditional instruments, particularly the Kirar.',
    biographyAmharic: 'ዮሐንስ በአዲስ አበባ ዩኒቨርሲቲ በሲቪል መሃንዲስነት ሰልጥነው በሀገሪቱ በርካታ ዋና ዋና መንገዶችንና መሠረተ ልማቶችን ገንብተዋል። ባሕላዊ የሙዚቃ መሣሪያዎችን፥ በተለይም ክራርን በጣም ይወዳሉ።',
    fatherId: 'anc_1',
    motherId: 'anc_2',
    spouseIds: ['spouse_1_1'],
    childIds: ['gc_1_1', 'gc_1_2'],
    photos: [
      {
        id: 'p_c1_1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%231d4ed8"><circle cx="50" cy="50" r="50"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">YA</text></svg>',
        caption: 'Yohannes engineering graduate (1972)',
        isPrimary: true
      }
    ]
  },
  {
    id: 'spouse_1_1',
    firstNameEnglish: 'Marta',
    lastNameEnglish: 'Assefa',
    firstNameAmharic: 'ማርታ',
    lastNameAmharic: 'አሰፋ',
    gender: 'female',
    birthDate: '1954-10-31',
    birthPlaceEnglish: 'Addis Ababa',
    birthPlaceAmharic: 'አዲስ አበባ',
    isLiving: true,
    biographyEnglish: 'Marta worked as a dedicated primary school educator in Addis Ababa for 35 years. She has mentored generations of students and is currently writing children stories in Amharic.',
    biographyAmharic: 'ማርታ በአዲስ አበባ ውስጥ ላለፉት ፴፭ ዓመታት በጥንካሬ የአንደኛ ደረጃ መምህር በመሆን አገልግለዋል። ለበርካታ ትውልድ ተማሪዎች ምሳሌ በመሆን አሁን በልጆች ልቦለድ መጽሐፍ ዝግጅት ላይ ይገኛሉ።',
    spouseIds: ['child_1'],
    childIds: ['gc_1_1', 'gc_1_2'],
    photos: [
      {
        id: 'p_s11_1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23db2777"><circle cx="50" cy="50" r="50"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">MA</text></svg>',
        caption: 'Marta teaching (1985)',
        isPrimary: true
      }
    ]
  },

  {
    id: 'child_2',
    firstNameEnglish: 'Tewodros',
    lastNameEnglish: 'Alemayehu',
    firstNameAmharic: 'ቴዎድሮስ',
    lastNameAmharic: 'አለማየሁ',
    nicknameEnglish: 'Teddy',
    gender: 'male',
    birthDate: '1952-07-07',
    birthPlaceEnglish: 'Gondar, Amhara',
    birthPlaceAmharic: 'ጎንደር፥ አማራ',
    isLiving: true,
    biographyEnglish: 'Tewodros is a talented painter and writer. He relocated to Paris in the late 1970s before returning to Addis Ababa. He established an art gallery showcasing Ethiopian heritage and fine arts.',
    biographyAmharic: 'ቴዎድሮስ ጎበዝ ሰዓሊ እና ጸሐፊ ነው። በ፲፱፻፯፪ ዓ.ም አካባቢ ወደ ፓሪስ ከተጓዘ በኋላ ወደ አዲስ አበባ ተመልሷል። የኢትዮጵያን ቅርስና ስነ ጥበብ የሚያስተዋውቅ የስነ ጥበብ ኤግዚቢሽን አቋቁሟል።',
    fatherId: 'anc_1',
    motherId: 'anc_2',
    spouseIds: [],
    childIds: [],
    photos: [
      {
        id: 'p_c2_1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23047857"><circle cx="50" cy="50" r="50"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">TA</text></svg>',
        caption: 'Tewodros in his studio (1990)',
        isPrimary: true
      }
    ]
  },

  {
    id: 'child_3',
    firstNameEnglish: 'Almaz',
    lastNameEnglish: 'Alemayehu',
    firstNameAmharic: 'አልማዝ',
    lastNameAmharic: 'አለማየሁ',
    gender: 'female',
    birthDate: '1958-03-24',
    birthPlaceEnglish: 'Addis Ababa',
    birthPlaceAmharic: 'አዲስ አበባ',
    isLiving: true,
    biographyEnglish: 'Almaz is a medical pioneer, specialized in pediatric health. She works extensively with international healthcare bodies to improve maternity and infant care programs across rural Ethiopia.',
    biographyAmharic: 'አልማዝ የህጻናት ህክምና ባለሙያ በመሆን የህክምና ፈር ቀዳጅ ናት። በሀገሪቱ ገጠር ያሉ የእናቶችና የህጻናትን የእንክብካቤ ፕሮግራሞች ለማሻሻል ከዓለም አቀፍ የጤና ተቋማት ጋር በስፋት ትሰራለች።',
    fatherId: 'anc_1',
    motherId: 'anc_2',
    spouseIds: ['spouse_3_1'],
    childIds: ['gc_3_1'],
    photos: [
      {
        id: 'p_c3_1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23db2777"><circle cx="50" cy="50" r="50"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">AA</text></svg>',
        caption: 'Almaz doctor portrait',
        isPrimary: true
      }
    ]
  },
  {
    id: 'spouse_3_1',
    firstNameEnglish: 'Solomon',
    lastNameEnglish: 'Tekle',
    firstNameAmharic: 'ሰለሞን',
    lastNameAmharic: 'ተክሌ',
    gender: 'male',
    birthDate: '1955-08-11',
    birthPlaceEnglish: 'Harar, Harari',
    birthPlaceAmharic: 'ሐረር፥ ሐረሪ',
    isLiving: true,
    biographyEnglish: 'Solomon is a distinguished scholar in Ethiopian history and geosemantics. He has authored several textbooks on ancient historical connections within East Africa.',
    biographyAmharic: 'ሰለሞን በኢትዮጵያ ታሪክና ጂኦሴማንቲክስ ዘርፍ ታዋቂ ምሁር ነው። በምስራቅ አፍሪካ ጥንታዊ ታሪካዊ ትስስሮች ላይ በርካታ መጽሐፍትን አዘጋጅቷል።',
    spouseIds: ['child_3'],
    childIds: ['gc_3_1'],
    photos: [
      {
        id: 'p_s31_1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%230f766e"><circle cx="50" cy="50" r="50"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">ST</text></svg>',
        caption: 'Professor Solomon (1998)',
        isPrimary: true
      }
    ]
  },

  // Generation 3 (Grandchildren)
  // Children of Yohannes & Marta
  {
    id: 'gc_1_1',
    firstNameEnglish: 'Elias',
    lastNameEnglish: 'Yohannes',
    firstNameAmharic: 'ኤልያስ',
    lastNameAmharic: 'ዮሐንስ',
    gender: 'male',
    birthDate: '1982-01-15',
    birthPlaceEnglish: 'Addis Ababa',
    birthPlaceAmharic: 'አዲስ አበባ',
    isLiving: true,
    biographyEnglish: 'Elias is a software developer and technical writer. He lives in Addis Ababa and maintains various libraries to support Amharic localization and typing environments.',
    biographyAmharic: 'ኤልያስ የሶፍትዌር አልሚ እና አምደኛ ነው። በአዲስ አበባ የሚኖር ሲሆን የላቲን ባልሆኑ ኪቦርዶች የአማርኛ ቋንቋ አጠቃቀምን ለማቃለል የተለያዩ የኮዲንግ ቤተ-መጻሕፍትን ይንከባከባል።',
    fatherId: 'child_1',
    motherId: 'spouse_1_1',
    spouseIds: ['spouse_gc11'],
    childIds: ['ggc_1'],
    photos: [
      {
        id: 'p_gc11_1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%234338ca"><circle cx="50" cy="50" r="50"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">EY</text></svg>',
        caption: 'Elias (2015)',
        isPrimary: true
      }
    ]
  },
  {
    id: 'spouse_gc11',
    firstNameEnglish: 'Sara',
    lastNameEnglish: 'Dessalegn',
    firstNameAmharic: 'ሳራ',
    lastNameAmharic: 'ደሳለኝ',
    gender: 'female',
    birthDate: '1986-04-12',
    birthPlaceEnglish: 'Hawassa, Sidama',
    birthPlaceAmharic: 'ሐዋሳ፥ ሲዳማ',
    isLiving: true,
    biographyEnglish: 'Sara is an architect and urban consultant designing sustainable public spaces. She promotes eco-friendly community construction methods.',
    biographyAmharic: 'ሳራ ዘላቂ የሕዝብ ቦታዎችን የምትነድፍ መሐንዲስና የከተማ አማካሪ ናት። ተስማሚና ዘላቂ የማህበረሰብ ግንባታ ዘዴዎችን ታበረታታለች።',
    spouseIds: ['gc_1_1'],
    childIds: ['ggc_1']
  },

  {
    id: 'gc_1_2',
    firstNameEnglish: 'Hiwot',
    lastNameEnglish: 'Yohannes',
    firstNameAmharic: 'ሕይወት',
    lastNameAmharic: 'ዮሐንስ',
    gender: 'female',
    birthDate: '1987-09-08',
    birthPlaceEnglish: 'Addis Ababa',
    birthPlaceAmharic: 'አዲስ አበባ',
    isLiving: true,
    biographyEnglish: 'Hiwot is an active environmental designer and eco-activist. She leads reforestation campaigns and holds annual workshops for young entrepreneurs in clean green energy.',
    biographyAmharic: 'ሕይወት የአካባቢ ደህንነት ጥበቃ ባለሙያ ናት። የአረንጓዴ ልማት እና የተከላ ዘመቻዎችን የምትመራ ሲሆን፥ ለወጣት የስራ ፈጣሪዎች በታዳሽ ሃይል ዙሪያ ውይይቶችን ታደርጋለች።',
    fatherId: 'child_1',
    motherId: 'spouse_1_1',
    spouseIds: [],
    childIds: [],
    photos: [
      {
        id: 'p_gc12_1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23db2777"><circle cx="50" cy="50" r="50"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">HY</text></svg>',
        caption: 'Hiwot tree planting keynote',
        isPrimary: true
      }
    ]
  },

  // Children of Almaz & Solomon
  {
    id: 'gc_3_1',
    firstNameEnglish: 'Tariku',
    lastNameEnglish: 'Solomon',
    firstNameAmharic: 'ታሪኩ',
    lastNameAmharic: 'ሰለሞን',
    nicknameEnglish: 'Tariq',
    gender: 'male',
    birthDate: '1991-11-23',
    birthPlaceEnglish: 'Harar, Harari',
    birthPlaceAmharic: 'ሐረር፥ ሐረሪ',
    isLiving: true,
    biographyEnglish: 'Tariku inherited his father passion for historical research. He works as a high school teacher in Harar and curates historic family narratives using digital storytelling techniques.',
    biographyAmharic: 'ታሪኩ ለአባቱ የታሪክ ምርምር ያለውን ስሜት ወርሷል። በሐረር ከተማ የከፍተኛ ደረጃ መምህር ሆኖ የሚሰራ ሲሆን ዲጂታል ዘዴዎችን በመጠቀም የቤተሰብ ታሪክ ማህደር ያዘጋጃል።',
    fatherId: 'spouse_3_1',
    motherId: 'child_3',
    spouseIds: [],
    childIds: [],
    photos: [
      {
        id: 'p_gc31_1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%236d28d9"><circle cx="50" cy="50" r="50"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">TS</text></svg>',
        caption: 'Tariku hiking in Harar (2018)',
        isPrimary: true
      }
    ]
  },

  // Generation 4 (Great-grandchildren)
  // Child of Elias & Sara
  {
    id: 'ggc_1',
    firstNameEnglish: 'Amen',
    lastNameEnglish: 'Elias',
    firstNameAmharic: 'አሜን',
    lastNameAmharic: 'ኤልያስ',
    gender: 'female',
    birthDate: '2016-08-14',
    birthPlaceEnglish: 'Addis Ababa',
    birthPlaceAmharic: 'አዲስ አበባ',
    isLiving: true,
    biographyEnglish: 'Amen is the energetic fourth-generation daughter of the family. She loves sketching, traditional stories, and learning English and Amharic writing formats.',
    biographyAmharic: 'አሜን የአራተኛ ትውልድ ተወካይ የሆናች ህጻን ልጅ ናት። ስዕል መሳል፣ የሀገር ባህል ተረቶችን መስማት እና የአማርኛና የእንግሊዝኛ ፊደላትን መማር ትወዳለች።',
    fatherId: 'gc_1_1',
    motherId: 'spouse_gc11',
    spouseIds: [],
    childIds: [],
    photos: [
      {
        id: 'p_ggc1_1',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23fbbf24"><circle cx="50" cy="50" r="50"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">AE</text></svg>',
        caption: 'Amen drawing (2023)',
        isPrimary: true
      }
    ]
  }
];

export const DICTIONARY: Record<string, Record<'en' | 'am', string>> = {
  appName: { en: 'Family Roots', am: 'የቀደምት ሥር' },
  dashboard: { en: 'Dashboard', am: 'ዳሽቦርድ' },
  familyTree: { en: 'Family Tree', am: 'የቤተሰብ ሐረግ' },
  personDetails: { en: 'Person Details', am: 'የግለሰብ ዝርዝር' },
  relationshipFinder: { en: 'Relationship Finder', am: 'ዝምድና ፈልግ' },
  search: { en: 'Search', am: 'ፈልግ' },
  timeline: { en: 'Timeline', am: 'ጊዜ መስመር' },
  statistics: { en: 'Statistics', am: 'ስታቲስቲክስ' },
  importExport: { en: 'Import & Export', am: 'አስገባና አስወጣ' },
  settings: { en: 'Settings', am: 'ቅንብሮች' },
  languageLabel: { en: 'Language', am: 'ቋንቋ' },
  english: { en: 'English', am: 'English' },
  amharic: { en: 'Amharic', am: 'አማርኛ' },
  activeLanguage: { en: 'Active Language', am: 'አሁን ያለው ቋንቋ' },
  
  // General Terms
  save: { en: 'Save', am: 'አስቀምጥ' },
  cancel: { en: 'Cancel', am: 'ሰርዝ' },
  edit: { en: 'Edit', am: 'አስተካክል' },
  delete: { en: 'Delete', am: 'አጥፋ' },
  add: { en: 'Add', am: 'ጨምር' },
  addPerson: { en: 'Add Family Member', am: 'የቤተሰብ አባል ጨምር' },
  editPerson: { en: 'Edit Personal Details', am: 'መረጃ አሻሽል' },
  fullName: { en: 'Full Name', am: 'ሙሉ ስም' },
  firstName: { en: 'First Name', am: 'የመጀመሪያ ስም' },
  lastName: { en: 'Last Name', am: 'የአባት ስም' },
  nickname: { en: 'Nickname / Title', am: 'የቁልምጫ ስም / ማዕረግ' },
  genderLabel: { en: 'Gender', am: 'ጾታ' },
  male: { en: 'Male', am: 'ወንድ' },
  female: { en: 'Female', am: 'ሴት' },
  other: { en: 'Other', am: 'ሌላ' },
  birthDate: { en: 'Birth Date', am: 'የትውልድ ቀን' },
  deathDate: { en: 'Death Date', am: 'የእረፍት ቀን' },
  birthPlace: { en: 'Birth Place', am: 'የትውልድ ቦታ' },
  isLivingLabel: { en: 'Status', am: 'ሁኔታ' },
  living: { en: 'Living', am: 'በሕይወት ያለ' },
  deceased: { en: 'Deceased', am: 'ያለፈ' },
  biography: { en: 'Biography', am: 'የሕይወት ታሪክ' },
  primaryPhoto: { en: 'Primary Photo', am: 'ዋና ፎቶ' },
  attachments: { en: 'Attachments', am: 'አባሪዎች' },
  photos: { en: 'Photos', am: 'ፎቶዎች' },
  documents: { en: 'Documents', am: 'ሰነዶች' },
  audioMemories: { en: 'Audio Memories', am: 'የድምፅ ትዝታዎች' },
  videos: { en: 'Videos', am: 'ቪዲዮዎች' },
  
  // Relationships
  relationships: { en: 'Parents & Partners', am: 'ወላጆችና አጋሮች' },
  father: { en: 'Father', am: 'አባት' },
  mother: { en: 'Mother', am: 'እናት' },
  spouses: { en: 'Spouse / Partner', am: 'ትዳር አጋር / ባል / ሚስት' },
  children: { en: 'Children', am: 'ልጆች' },
  noFather: { en: 'No father link defined', am: 'የአባት መረጃ አልተገናኘም' },
  noMother: { en: 'No mother link defined', am: 'የእናት መረጃ አልተገናኘም' },
  noSpouse: { en: 'No registered spouses or partners', am: 'የተመዘገበ የትዳር አጋር የለም' },
  noChildren: { en: 'No registered children', am: 'የተመዘገቡ ልጆች የሉም' },
  selectFather: { en: 'Select Father', am: 'አባት ምረጥ' },
  selectMother: { en: 'Select Mother', am: 'እናት ምረጥ' },
  addSpouse: { en: 'Link New Spouse', am: 'አጋር አገናኝ' },
  addChild: { en: 'Link New Child', am: 'ልጅ አገናኝ' },
  
  // Finder
  startPerson: { en: 'First Person', am: 'የመጀመሪያው ሰው' },
  endPerson: { en: 'Second Person', am: 'ሁለተኛው ሰው' },
  calculateRelationship: { en: 'Find Connection', am: 'ዝምድና አግኝ' },
  relationshipResult: { en: 'Calculated Relationship', am: 'የተሰላ ዝምድና' },
  generationDistance: { en: 'Generation Span', am: 'የትውልድ ርቀት' },
  relationshipPath: { en: 'Inheritance Path', am: 'የውርስ መንገድ' },
  noPathFound: { en: 'No relational path connects these two people.', am: 'በእነዚህ ሁለት ሰዎች መካከል የተገናኘ ዝምድና አልተገኘም።' },
  
  // Search
  searchPlaceholder: { en: 'Search by English/Amharic name or nickname...', am: 'በእንግሊዝኛ/አማርኛ ስም ወይም ቁልምጫ ይፈልጉ...' },
  birthYearRange: { en: 'Birth Year Range', am: 'የትውልድ ዓመት ክልል' },
  allBranches: { en: 'All Branches', am: 'ሁሉም ቅርንጫፎች' },
  noResults: { en: 'No family members match your search criteria.', am: 'ከፍለጋዎ ጋር የሚዛመድ የቤተሰብ አባል አልተገኘም።' },
  
  // Stats
  totalMembers: { en: 'Total Registered Members', am: 'ጠቅላላ የተመዘገቡ አባላት' },
  livingMembers: { en: 'Living Members', am: 'በሕይወት ያሉ አባላት' },
  deceasedMembers: { en: 'Deceased Members', am: 'ያለፉ አባላት' },
  oldestAncestor: { en: 'Root / Oldest Known Ancestor', am: 'ዋና/ቀደምት አያት' },
  generationCount: { en: 'Generations Count', am: 'ጠቅላላ የትውልድ ብዛት' },
  genderDistribution: { en: 'Gender Balance', am: 'የጾታ ስርጭት' },
  
  // Import/Export
  exportData: { en: 'Export Family Database', am: 'የቤተሰብ መረጃ ወደ ውጭ ሃይል ላክ' },
  importData: { en: 'Import Genealogy File', am: 'የዘር ሀረግ ፋይል አስገባ' },
  smartMerge: { en: 'Smart-Merge Mode', am: 'ብልህ-ማዋሃድ ዘዴ' },
  conflictReview: { en: 'Conflict and Duplicate Review', am: 'የግጭትና ድግግሞሾች መገምገሚያ' },
  dragDropJsonCsv: { en: 'Drag and drop your JSON or CSV folder, or click to upload', am: 'የእርስዎን JSON ወይም CSV ፋይል እዚህ ይጎትቱ ወይም ለመጫን ጠቅ ያድርጉ' },
  downloadJson: { en: 'Download JSON Database', am: 'የJSON ፋይል አውርድ' },
  downloadCsv: { en: 'Download CSV List', am: 'የCSV ዝርዝር አውርድ' },
  duplicateDetected: { en: 'Likely duplicate profile detected in records', am: 'ሊሆን የሚችል የድግግሞሽ መገለጫ በሪከርድ ታይቷል' },
  
  // Settings
  theme: { en: 'Visual Workspace Palette', am: 'የስራ ቦታ ገጽታ' },
  lightMode: { en: 'Warm Light', am: 'ሙቅ ብርሃን' },
  darkMode: { en: 'Slate Shadow (Dark)', am: 'ጥቁር አምድ' },
  dangerZone: { en: 'Database Management', am: 'የመረጃ ቋት አስተዳደር' },
  clearDatabase: { en: 'Reset/Purge Local Tree', am: 'ያለውን ዛፍ በሙሉ ጠርገህ አጥፋ' },
};

export function getTranslation(key: string, lang: 'en' | 'am'): string {
  if (DICTIONARY[key]) {
    return DICTIONARY[key][lang];
  }
  return key;
}
