/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Person } from '../types';

/**
 * BFS to find the shortest relationship path between two people in the undirected family graph.
 * Edges consist of:
 * - father/mother links (directed parent edges, but traversable both ways)
 * - childIds array
 * - spouseIds array
 */
export interface RelationshipStep {
  personId: string;
  relationType: 'parent' | 'child' | 'spouse' | 'sibling' | 'self';
}

export function findRelationshipPath(
  people: Person[],
  startId: string,
  endId: string
): string[] | null {
  if (startId === endId) return [startId];

  const peopleMap = new Map<string, Person>();
  people.forEach((p) => peopleMap.set(p.id, p));

  // Build adjacency list
  const adj = new Map<string, string[]>();
  
  people.forEach((p) => {
    const neighbors: string[] = [];
    if (p.fatherId) neighbors.push(p.fatherId);
    if (p.motherId) neighbors.push(p.motherId);
    p.spouseIds.forEach((sid) => {
      if (sid) neighbors.push(sid);
    });
    // Add children
    p.childIds.forEach((cid) => {
      if (cid) neighbors.push(cid);
    });

    // Cross reference parent-child relationships as double check
    people.forEach((other) => {
      if (other.fatherId === p.id || other.motherId === p.id) {
        if (!neighbors.includes(other.id)) neighbors.push(other.id);
      }
      if (p.fatherId === other.id || p.motherId === other.id) {
        if (!neighbors.includes(other.id)) neighbors.push(other.id);
      }
      if (other.spouseIds.includes(p.id) && !neighbors.includes(other.id)) {
        neighbors.push(other.id);
      }
    });

    const uniqueNeighbors = Array.from(new Set(neighbors)).filter(id => peopleMap.has(id));
    adj.set(p.id, uniqueNeighbors);
  });

  const queue: string[][] = [[startId]];
  const visited = new Set<string>([startId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];

    if (node === endId) {
      return path;
    }

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return null;
}

/**
 * Computes human-friendly relationship description based on the shortest path.
 */
export function describeRelationshipPath(
  people: Person[],
  path: string[] | null,
  lang: 'en' | 'am' = 'en'
): { relationLabel: string; steps: string[] } {
  const defaultRes = {
    relationLabel: lang === 'en' ? 'Unrelated / Distant link' : 'የራቀ ዝምድና',
    steps: [] as string[]
  };

  if (!path || path.length < 2) {
    return defaultRes;
  }

  const peopleMap = new Map<string, Person>();
  people.forEach((p) => peopleMap.set(p.id, p));

  const stepsText: string[] = [];
  
  // Parse relationships step-by-step
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = peopleMap.get(path[i]);
    const p2 = peopleMap.get(path[i + 1]);
    if (!p1 || !p2) continue;

    const p1Name = lang === 'en' 
      ? `${p1.firstNameEnglish} ${p1.lastNameEnglish}` 
      : `${p1.firstNameAmharic} ${p1.lastNameAmharic}`;
    const p2Name = lang === 'en' 
      ? `${p2.firstNameEnglish} ${p2.lastNameEnglish}` 
      : `${p2.firstNameAmharic} ${p2.lastNameAmharic}`;

    let rel = '';
    if (p2.fatherId === p1.id || p2.motherId === p1.id) {
      rel = lang === 'en' ? 'is parent of' : 'የሚከተለው ሰው ወላጅ ነው፦';
    } else if (p1.fatherId === p2.id || p1.motherId === p2.id) {
      rel = lang === 'en' ? 'is child of' : 'የሚከተለው ሰው ልጅ ነው፦';
    } else if (p1.spouseIds.includes(p2.id) || p2.spouseIds.includes(p1.id)) {
      rel = lang === 'en' ? 'is spouse of' : 'የትዳር አጋር ነው፦';
    } else if (p1.fatherId && p1.fatherId === p2.fatherId) {
      rel = lang === 'en' ? 'is sibling of' : 'እህት/ወንድም ነው፦';
    } else {
      rel = lang === 'en' ? 'is connected to' : 'የሚከተለው ጋር ይገናኛል፦';
    }

    stepsText.push(`${p1Name} ${rel} ${p2Name}`);
  }

  // Calculate high-level labels (Father, Mother, Grandfather, Cousin, etc.) based on BFS distance and LCA (Lowest Common Ancestor)
  // Let's implement a standard LCA calculation for cleaner labels if path length is short
  const len = path.length;
  const start = peopleMap.get(path[0])!;
  const end = peopleMap.get(path[len - 1])!;

  let label = lang === 'en' ? 'Relative' : 'ዘመድ';

  if (len === 2) {
    const sId = path[0];
    const eId = path[1];
    
    if (end.fatherId === sId) {
      label = lang === 'en' 
        ? (start.gender === 'female' ? 'Daughter' : 'Son')
        : (start.gender === 'female' ? 'ልጅ (ሴት)' : 'ልጅ (ወንድ)');
    } else if (start.fatherId === eId) {
      label = lang === 'en' ? 'Father' : 'አባት';
    } else if (start.motherId === eId) {
      label = lang === 'en' ? 'Mother' : 'እናት';
    } else if (end.motherId === sId) {
      label = lang === 'en'
        ? (start.gender === 'female' ? 'Daughter' : 'Son')
        : (start.gender === 'female' ? 'ልጅ (ሴት)' : 'ልጅ (ወንድ)');
    } else if (start.spouseIds.includes(eId)) {
      label = lang === 'en' 
        ? (end.gender === 'female' ? 'Wife' : 'Husband')
        : (end.gender === 'female' ? 'ሚስት' : 'ባል');
    }
  } else if (len === 3) {
    // Grandparent or sibling or spouse parent
    const s = start;
    const m = peopleMap.get(path[1])!;
    const e = end;

    // Sibling (shared parent)
    if (s.fatherId && s.fatherId === e.fatherId && s.id !== e.id) {
      label = lang === 'en'
        ? (e.gender === 'female' ? 'Sister' : 'Brother')
        : (e.gender === 'female' ? 'እህት' : 'ወንድም');
    }
    // Grandparent - parent
    else if (s.fatherId === m.id || s.motherId === m.id) {
      if (m.fatherId === e.id || m.motherId === e.id) {
        label = lang === 'en'
          ? (e.gender === 'female' ? 'Grandmother' : 'Grandfather')
          : (e.gender === 'female' ? 'አያት (ሴት)' : 'አያት (ወንድ)');
      }
    }
    // Grandchild
    else if (m.fatherId === s.id || m.motherId === s.id) {
      if (e.fatherId === m.id || e.motherId === m.id) {
        label = lang === 'en'
          ? (e.gender === 'female' ? 'Granddaughter' : 'Grandson')
          : (e.gender === 'female' ? 'የልጅ ልጅ (ሴት)' : 'የልጅ ልጅ (ወንድ)');
      }
    }
    // Spouse's parent (In-law)
    else if (s.spouseIds.includes(m.id)) {
      if (m.fatherId === e.id) {
        label = lang === 'en' ? 'Father-in-law' : 'አማች (የደጅ አባት)';
      } else if (m.motherId === e.id) {
        label = lang === 'en' ? 'Mother-in-law' : 'አማች (የደጅ እናት)';
      }
    }
  } else if (len === 4) {
    // Cousin or Uncle/Aunt/Niece/Nephew
    const s = start;
    const p1 = peopleMap.get(path[1])!;
    const p2 = peopleMap.get(path[2])!;
    const e = end;

    // Uncle/Aunt: start -> parent -> grandparent_child -> end
    if ((s.fatherId === p1.id || s.motherId === p1.id) && (p2.fatherId === e.id || p2.motherId === e.id)) {
      // e is sibling of p1
      if (p1.fatherId && p1.fatherId === e.fatherId && p1.id !== e.id) {
        label = lang === 'en'
          ? (e.gender === 'female' ? 'Aunt' : 'Uncle')
          : (e.gender === 'female' ? 'አክስት' : 'አጎት');
      }
    }
    // Nephew/Niece: start -> sibling -> child -> end
    else if (p1.fatherId && p1.fatherId === s.fatherId && p1.id !== s.id) {
      if (e.fatherId === p1.id || e.motherId === p1.id) {
        label = lang === 'en'
          ? (e.gender === 'female' ? 'Niece' : 'Nephew')
          : (e.gender === 'female' ? 'የእህት/ወንድም ልጅ (ሴት)' : 'የእህት/ወንድም ልጅ (ወንድ)');
      }
    }
  } else if (len === 5) {
    // First Cousin: start -> parent -> grandparent -> uncle/aunt -> cousin
    const s = start;
    const parent = peopleMap.get(path[1])!;
    const gparent = peopleMap.get(path[2])!;
    const uncleAunt = peopleMap.get(path[3])!;
    const e = end;

    if (
      (s.fatherId === parent.id || s.motherId === parent.id) &&
      (parent.fatherId === gparent.id || parent.motherId === gparent.id) &&
      (uncleAunt.fatherId === gparent.id || uncleAunt.motherId === gparent.id) &&
      (e.fatherId === uncleAunt.id || e.motherId === uncleAunt.id)
    ) {
      label = lang === 'en' ? 'First Cousin' : 'የአጎት/አክስት ልጅ (የመጀመሪያ የአክስት ልጅ)';
    }
  }

  return {
    relationLabel: label,
    steps: stepsText
  };
}

/**
 * Clean helper to compute general generation levels relative to custom root.
 */
export function calculateGenerationLevels(
  people: Person[],
  rootId: string
): Map<string, number> {
  const levels = new Map<string, number>();
  const visited = new Set<string>();
  
  const queue: { id: string; lvl: number }[] = [{ id: rootId, lvl: 0 }];
  levels.set(rootId, 0);
  visited.add(rootId);

  // Focus BFS flow downwards (children) and upwards (parents)
  while (queue.length > 0) {
    const { id, lvl } = queue.shift()!;
    const person = people.find((p) => p.id === id);
    if (!person) continue;

    // Children are level + 1
    person.childIds.forEach((cid) => {
      if (!visited.has(cid)) {
        visited.add(cid);
        levels.set(cid, lvl + 1);
        queue.push({ id: cid, lvl: lvl + 1 });
      }
    });

    // Parents are level - 1 (if we need to find ancestors relative to root, but let's restrict going upwards if we only want descendants)
    if (person.fatherId && !visited.has(person.fatherId)) {
      visited.add(person.fatherId);
      levels.set(person.fatherId, lvl - 1);
      queue.push({ id: person.fatherId, lvl: lvl - 1 });
    }
    if (person.motherId && !visited.has(person.motherId)) {
      visited.add(person.motherId);
      levels.set(person.motherId, lvl - 1);
      queue.push({ id: person.motherId, lvl: lvl - 1 });
    }
    
    // Spouses inherit the same level
    person.spouseIds.forEach((sid) => {
      if (!visited.has(sid)) {
        visited.add(sid);
        levels.set(sid, lvl);
        queue.push({ id: sid, lvl: lvl });
      }
    });
  }

  // Adjust levels so oldest is 0
  if (levels.size > 0) {
    const minLvl = Math.min(...Array.from(levels.values()));
    const adjustedLevels = new Map<string, number>();
    levels.forEach((val, key) => {
      adjustedLevels.set(key, val - minLvl);
    });
    return adjustedLevels;
  }

  return levels;
}

/**
 * Fuzzy text similarity matcher for duplicate detector
 */
function nameSimilarity(s1: string, s2: string): number {
  const clean = (s: string) => s.toLowerCase().trim().replace(/[^a-zA-Z0-9\u1200-\u137F]/g, '');
  const w1 = clean(s1);
  const w2 = clean(s2);
  
  if (!w1 || !w2) return 0;
  if (w1 === w2) return 1.0;

  // Simple intersection coefficient
  const set1 = new Set(w1.split(''));
  const set2 = new Set(w2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

export interface DuplicatePair {
  id1: string;
  id2: string;
  score: number; // 0.0 to 1.0
  reasons: string[];
}

/**
 * Detects likely duplicate people in the family tree array
 */
export function detectDuplicates(people: Person[]): DuplicatePair[] {
  const duplicates: DuplicatePair[] = [];

  for (let i = 0; i < people.length; i++) {
    for (let j = i + 1; j < people.length; j++) {
      const p1 = people[i];
      const p2 = people[j];
      
      const reasons: string[] = [];
      let score = 0;

      // Check name similarity (English)
      const similarityEngFirst = nameSimilarity(p1.firstNameEnglish, p2.firstNameEnglish);
      const similarityEngLast = nameSimilarity(p1.lastNameEnglish, p2.lastNameEnglish);
      
      // Check name similarity (Amharic)
      const similarityAmhFirst = nameSimilarity(p1.firstNameAmharic, p2.firstNameAmharic);
      const similarityAmhLast = nameSimilarity(p1.lastNameAmharic, p2.lastNameAmharic);

      const maxFirstSimilarity = Math.max(similarityEngFirst, similarityAmhFirst);
      const maxLastSimilarity = Math.max(similarityEngLast, similarityAmhLast);

      if (maxFirstSimilarity > 0.8 && maxLastSimilarity > 0.8) {
        score += 0.45;
        reasons.push('Highly similar names');
      } else if (maxFirstSimilarity > 0.8 || maxLastSimilarity > 0.8) {
        score += 0.20;
        reasons.push('Partially matching name');
      }

      // Check birth year similarity
      if (p1.birthDate && p2.birthDate) {
        const y1 = new Date(p1.birthDate).getFullYear();
        const y2 = new Date(p2.birthDate).getFullYear();
        if (Math.abs(y1 - y2) === 0) {
          score += 0.35;
          reasons.push('Exact matching birth year');
        } else if (Math.abs(y1 - y2) <= 2) {
          score += 0.20;
          reasons.push('Very close birth year (±2 years)');
        }
      }

      // Check parents matches
      if (p1.fatherId && p1.fatherId === p2.fatherId) {
        score += 0.15;
        reasons.push('Shared father profile link');
      }
      if (p1.motherId && p1.motherId === p2.motherId) {
        score += 0.15;
        reasons.push('Shared mother profile link');
      }

      // Check same gender
      if (p1.gender !== p2.gender) {
        score = 0; // Absolute mismatch override
      }

      if (score >= 0.5) {
        duplicates.push({
          id1: p1.id,
          id2: p2.id,
          score: Math.min(score, 0.99),
          reasons
        });
      }
    }
  }

  // Sort by highest score first
  return duplicates.sort((a, b) => b.score - a.score);
}

/**
 * Smart merging: Combines incoming catalog list into existing database
 * with rules to never delete, merge relations, append logs, detect duplicates.
 */
export function smartMergePeople(
  existing: Person[],
  incoming: Person[]
): { MergedList: Person[]; AddedCount: number; MergedCount: number } {
  const mergedMap = new Map<string, Person>();
  existing.forEach((p) => mergedMap.set(p.id, { ...p }));

  let AddedCount = 0;
  let MergedCount = 0;

  incoming.forEach((inc) => {
    // Look for exact ID match
    if (mergedMap.has(inc.id)) {
      const dbPerson = mergedMap.get(inc.id)!;
      
      // Merge missing information
      dbPerson.firstNameEnglish = dbPerson.firstNameEnglish || inc.firstNameEnglish;
      dbPerson.lastNameEnglish = dbPerson.lastNameEnglish || inc.lastNameEnglish;
      dbPerson.firstNameAmharic = dbPerson.firstNameAmharic || inc.firstNameAmharic;
      dbPerson.lastNameAmharic = dbPerson.lastNameAmharic || inc.lastNameAmharic;
      dbPerson.nicknameEnglish = dbPerson.nicknameEnglish || inc.nicknameEnglish;
      dbPerson.nicknameAmharic = dbPerson.nicknameAmharic || inc.nicknameAmharic;
      dbPerson.birthDate = dbPerson.birthDate || inc.birthDate;
      dbPerson.birthPlaceEnglish = dbPerson.birthPlaceEnglish || inc.birthPlaceEnglish;
      dbPerson.birthPlaceAmharic = dbPerson.birthPlaceAmharic || inc.birthPlaceAmharic;
      dbPerson.deathDate = dbPerson.deathDate || inc.deathDate;
      dbPerson.biographyEnglish = dbPerson.biographyEnglish || inc.biographyEnglish;
      dbPerson.biographyAmharic = dbPerson.biographyAmharic || inc.biographyAmharic;

      // Append rather than overwrite lists
      dbPerson.fatherId = dbPerson.fatherId || inc.fatherId;
      dbPerson.motherId = dbPerson.motherId || inc.motherId;
      
      dbPerson.spouseIds = Array.from(new Set([...dbPerson.spouseIds, ...inc.spouseIds])).filter(Boolean);
      dbPerson.childIds = Array.from(new Set([...dbPerson.childIds, ...inc.childIds])).filter(Boolean);

      // Photos
      if (inc.photos && inc.photos.length > 0) {
        dbPerson.photos = dbPerson.photos || [];
        const existingUrls = new Set(dbPerson.photos.map((ph) => ph.url));
        inc.photos.forEach((ph) => {
          if (!existingUrls.has(ph.url)) {
            dbPerson.photos!.push(ph);
          }
        });
      }

      dbPerson.updatedAt = Date.now();
      mergedMap.set(inc.id, dbPerson);
      MergedCount++;
    } else {
      // Look for fuzzy duplicates in the database to automatically merge/resolve if IDs differ but person represents same entity
      let fuzzyMatchId: string | null = null;
      for (const [existingId, p] of mergedMap.entries()) {
        const similarityFirst = nameSimilarity(p.firstNameEnglish, inc.firstNameEnglish);
        const similarityLast = nameSimilarity(p.lastNameEnglish, inc.lastNameEnglish);
        
        // Match year
        let yearMatch = false;
        if (p.birthDate && inc.birthDate) {
          const y1 = new Date(p.birthDate).getFullYear();
          const y2 = new Date(inc.birthDate).getFullYear();
          yearMatch = (y1 === y2);
        }

        if (similarityFirst > 0.85 && similarityLast > 0.85 && (yearMatch || !p.birthDate || !inc.birthDate)) {
          fuzzyMatchId = existingId;
          break;
        }
      }

      if (fuzzyMatchId) {
        const dbPerson = mergedMap.get(fuzzyMatchId)!;
        // Merge missing fields
        dbPerson.firstNameAmharic = dbPerson.firstNameAmharic || inc.firstNameAmharic;
        dbPerson.lastNameAmharic = dbPerson.lastNameAmharic || inc.lastNameAmharic;
        dbPerson.birthDate = dbPerson.birthDate || inc.birthDate;
        dbPerson.biographyEnglish = dbPerson.biographyEnglish || inc.biographyEnglish;
        dbPerson.biographyAmharic = dbPerson.biographyAmharic || inc.biographyAmharic;
        dbPerson.fatherId = dbPerson.fatherId || inc.fatherId;
        dbPerson.motherId = dbPerson.motherId || inc.motherId;
        dbPerson.spouseIds = Array.from(new Set([...dbPerson.spouseIds, ...inc.spouseIds])).filter(Boolean);
        dbPerson.childIds = Array.from(new Set([...dbPerson.childIds, ...inc.childIds])).filter(Boolean);
        dbPerson.updatedAt = Date.now();
        mergedMap.set(fuzzyMatchId, dbPerson);
        MergedCount++;
      } else {
        // Add as a clean new entry
        mergedMap.set(inc.id, {
          ...inc,
          createdAt: inc.createdAt || Date.now(),
          updatedAt: Date.now(),
        });
        AddedCount++;
      }
    }
  });

  return {
    MergedList: Array.from(mergedMap.values()),
    AddedCount,
    MergedCount,
  };
}
