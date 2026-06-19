/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Person, Language } from '../types';
import { calculateGenerationLevels, findRelationshipPath } from '../lib/genealogyEngine';
import { getTranslation } from '../lib/sampleData';
import { toEthiopic, parseIsoDateLocal } from '../lib/calendarUtils';
import { ZoomIn, ZoomOut, Maximize, UserCheck, ShieldAlert, Heart, GitBranch, ArrowUp, Expand } from 'lucide-react';

interface FamilyTreeProps {
  people: Person[];
  selectedPersonId: string | null;
  onSelectPerson: (id: string) => void;
  lang: Language;
  highlightedPath: string[] | null;
  branchFilterId: string;
  meId: string | null;
  preferredCalendar: 'gregorian' | 'ethiopian';
}

interface RenderNode {
  person: Person;
  x: number;
  y: number;
  level: number;
  isSpouse?: boolean;
}

interface RenderConnection {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isSpouseBond?: boolean;
  highlighted?: boolean;
}

export default function FamilyTree({
  people,
  selectedPersonId,
  onSelectPerson,
  lang,
  highlightedPath,
  branchFilterId,
  meId,
  preferredCalendar,
}: FamilyTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Navigation State
  const [zoom, setZoom] = useState<number>(0.85);
  const [panX, setPanX] = useState<number>(50);
  const [panY, setPanY] = useState<number>(30);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [collapsedBranches, setCollapsedBranches] = useState<Set<string>>(new Set());

  // Full Screen & Multi-Touch/Pinch State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(0.85);

  // Layout states
  const [nodes, setNodes] = useState<RenderNode[]>([]);
  const [connections, setConnections] = useState<RenderConnection[]>([]);
  const [rootAncestor, setRootAncestor] = useState<string>('');

  // Find overall roots
  const oldestKnownAncestors = people.filter(p => !p.fatherId && !p.motherId);
  const primaryRoot = oldestKnownAncestors.length > 0 ? oldestKnownAncestors[0].id : (people[0]?.id || '');
  const rootIdsList = oldestKnownAncestors.map(r => r.id);
  const primaryBranches = people.filter(
    p => (p.fatherId && rootIdsList.includes(p.fatherId)) || (p.motherId && rootIdsList.includes(p.motherId))
  );

  // Local state for interactive side branch filter
  const [localBranchFilter, setLocalBranchFilter] = useState<string>('all');

  useEffect(() => {
    if (branchFilterId) {
      setLocalBranchFilter(branchFilterId);
    }
  }, [branchFilterId]);

  useEffect(() => {
    if (!rootAncestor && primaryRoot) {
      setRootAncestor(primaryRoot);
    }
  }, [primaryRoot, rootAncestor]);

  // Compute Layout when people changes or branch setup evolves
  useEffect(() => {
    if (people.length === 0) return;

    // Recursive helper to check if a person is a descendant of a branch root
    const isDescendantOf = (personId: string, branchRootId: string): boolean => {
      if (personId === branchRootId) return true;
      const person = people.find((p) => p.id === personId);
      if (!person) return false;

      if (person.fatherId === branchRootId || person.motherId === branchRootId) return true;

      let matches = false;
      if (person.fatherId) {
        matches = matches || isDescendantOf(person.fatherId, branchRootId);
      }
      if (person.motherId) {
        matches = matches || isDescendantOf(person.motherId, branchRootId);
      }
      return matches;
    };

    // Recursive helper to check if a person is hidden because an ancestor is collapsed
    const isHiddenByCollapse = (personId: string): boolean => {
      const person = people.find((p) => p.id === personId);
      if (!person) return false;

      if (person.fatherId && (collapsedBranches.has(person.fatherId) || isHiddenByCollapse(person.fatherId))) {
        return true;
      }
      if (person.motherId && (collapsedBranches.has(person.motherId) || isHiddenByCollapse(person.motherId))) {
        return true;
      }
      return false;
    };

    // Get visible children
    const getChildrenOf = (personId: string): string[] => {
      const person = people.find((p) => p.id === personId);
      if (!person) return [];
      const childIds = person.childIds || [];
      return childIds.filter((cid) => !isHiddenByCollapse(cid) && people.some(cp => cp.id === cid));
    };

    // Calculate subtree width required dynamically to prevent overlap
    const subtreeWidths = new Map<string, number>();
    const calculateSubtreeWidth = (personId: string): number => {
      if (subtreeWidths.has(personId)) return subtreeWidths.get(personId)!;

      const person = people.find((p) => p.id === personId);
      if (!person || isHiddenByCollapse(personId)) {
        return 0;
      }

      // Spouses
      const spouses = person.spouseIds.filter((sid) => !isHiddenByCollapse(sid) && people.some((sp) => sp.id === sid));
      const hasSpouse = spouses.length > 0;
      const baseWidth = hasSpouse ? 320 : 160;

      // Children
      const kids = getChildrenOf(personId);
      if (kids.length === 0) {
        subtreeWidths.set(personId, baseWidth);
        return baseWidth;
      }

      let kidsWidth = 0;
      kids.forEach((kidId) => {
        kidsWidth += calculateSubtreeWidth(kidId);
      });
      kidsWidth += (kids.length - 1) * 30;

      const finalWidth = Math.max(baseWidth, kidsWidth);
      subtreeWidths.set(personId, finalWidth);
      return finalWidth;
    };

    const calculatedNodes: RenderNode[] = [];
    const calculatedConnections: RenderConnection[] = [];
    const positionedIds = new Set<string>();

    // Position families recursively centering children perfectly below parents
    const positionFamily = (personId: string, level: number, leftX: number, blockWidth: number) => {
      const person = people.find((p) => p.id === personId);
      if (!person || isHiddenByCollapse(personId)) return;

      if (positionedIds.has(personId)) return;

      const spouses = person.spouseIds.filter((sid) => !isHiddenByCollapse(sid) && people.some((sp) => sp.id === sid));
      const hasSpouse = spouses.length > 0;

      const blockCenter = leftX + blockWidth / 2;
      const yPos = level * 180 + 70;

      if (hasSpouse) {
        const spouseId = spouses[0];
        if (!positionedIds.has(person.id)) {
          calculatedNodes.push({
            person,
            x: blockCenter - 80,
            y: yPos,
            level,
          });
          positionedIds.add(person.id);
        }

        const spouse = people.find((sp) => sp.id === spouseId);
        if (spouse && !positionedIds.has(spouse.id)) {
          calculatedNodes.push({
            person: spouse,
            x: blockCenter + 80,
            y: yPos,
            level,
          });
          positionedIds.add(spouse.id);
        }
      } else {
        if (!positionedIds.has(person.id)) {
          calculatedNodes.push({
            person,
            x: blockCenter,
            y: yPos,
            level,
          });
          positionedIds.add(person.id);
        }
      }

      const kids = getChildrenOf(personId);
      if (kids.length > 0) {
        let kidsTotalWidth = 0;
        kids.forEach((kidId) => {
          kidsTotalWidth += calculateSubtreeWidth(kidId);
        });
        kidsTotalWidth += (kids.length - 1) * 30;

        let kidStartLeft = blockCenter - kidsTotalWidth / 2;
        kids.forEach((kidId) => {
          const kidWidth = calculateSubtreeWidth(kidId);
          positionFamily(kidId, level + 1, kidStartLeft, kidWidth);
          kidStartLeft += kidWidth + 30;
        });
      }
    };

    // Calculate standard root list
    const isAll = localBranchFilter === 'all';
    let rootIds: string[] = [];

    if (isAll) {
      const roots = people.filter((p) => {
        const hasFather = p.fatherId && people.some((f) => f.id === p.fatherId);
        const hasMother = p.motherId && people.some((m) => m.id === p.motherId);
        if (hasFather || hasMother) return false;

        // Check if any spouse of p has parents in the database
        const hasSpouseWithParents = p.spouseIds.some((sid) => {
          const spouse = people.find((sp) => sp.id === sid);
          if (!spouse) return false;
          const spouseHasFather = spouse.fatherId && people.some((f) => f.id === spouse.fatherId);
          const spouseHasMother = spouse.motherId && people.some((m) => m.id === spouse.motherId);
          return spouseHasFather || spouseHasMother;
        });

        if (hasSpouseWithParents) return false;

        return true;
      });

      const uniqueRoots: string[] = [];
      const processedRoots = new Set<string>();

      roots.forEach((r) => {
        if (processedRoots.has(r.id)) return;
        uniqueRoots.push(r.id);
        processedRoots.add(r.id);
        r.spouseIds.forEach((sid) => processedRoots.add(sid));
      });

      rootIds = uniqueRoots;
    } else {
      rootIds = [localBranchFilter];
    }

    // Assign positions starting from top roots
    let totalRootsWidth = 0;
    rootIds.forEach((rId) => {
      totalRootsWidth += calculateSubtreeWidth(rId);
    });
    totalRootsWidth += (rootIds.length - 1) * 100;

    let rootLeft = -totalRootsWidth / 2;
    rootIds.forEach((rId) => {
      const rWidth = calculateSubtreeWidth(rId);
      positionFamily(rId, 0, rootLeft, rWidth);
      rootLeft += rWidth + 100;
    });

    // Translate coordinates mapping connections
    const nodeMap = new Map<string, RenderNode>();
    calculatedNodes.forEach((n) => nodeMap.set(n.person.id, n));

    calculatedNodes.forEach((n) => {
      const p = n.person;

      p.spouseIds.forEach((sid) => {
        const spouseNode = nodeMap.get(sid);
        if (spouseNode && p.id < sid) {
          const inPathValue = highlightedPath && highlightedPath.includes(p.id) && highlightedPath.includes(sid);
          calculatedConnections.push({
            id: `spouse-${p.id}-${sid}`,
            fromX: n.x,
            fromY: n.y,
            toX: spouseNode.x,
            toY: spouseNode.y,
            isSpouseBond: true,
            highlighted: !!inPathValue,
          });
        }
      });

      if (p.fatherId || p.motherId) {
        const fatherNode = p.fatherId ? nodeMap.get(p.fatherId) : null;
        const motherNode = p.motherId ? nodeMap.get(p.motherId) : null;

        let parentAnchorX = 0;
        let parentAnchorY = 0;
        let hasParentNode = false;

        if (fatherNode && motherNode) {
          parentAnchorX = (fatherNode.x + motherNode.x) / 2;
          parentAnchorY = (fatherNode.y + motherNode.y) / 2;
          hasParentNode = true;
        } else if (fatherNode) {
          parentAnchorX = fatherNode.x;
          parentAnchorY = fatherNode.y;
          hasParentNode = true;
        } else if (motherNode) {
          parentAnchorX = motherNode.x;
          parentAnchorY = motherNode.y;
          hasParentNode = true;
        }

        if (hasParentNode) {
          const isFatherInPath = p.fatherId ? highlightedPath?.includes(p.fatherId) : false;
          const isMotherInPath = p.motherId ? highlightedPath?.includes(p.motherId) : false;
          const isSelfInPath = highlightedPath?.includes(p.id);
          const drawGoldHighlight = isSelfInPath && (isFatherInPath || isMotherInPath);

          calculatedConnections.push({
            id: `child-${p.id}`,
            fromX: parentAnchorX,
            fromY: parentAnchorY,
            toX: n.x,
            toY: n.y,
            isSpouseBond: false,
            highlighted: !!drawGoldHighlight,
          });
        }
      }
    });

    setNodes(calculatedNodes);
    setConnections(calculatedConnections);
  }, [people, localBranchFilter, rootAncestor, primaryRoot, collapsedBranches, highlightedPath]);

  // Handle Drag on Tree Container
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.node-button')) return;
    
    if (e.touches.length === 2) {
      // Two fingers pinch to zoom initialization
      setIsDragging(false);
      const dist = Math.sqrt(
        (e.touches[0].clientX - e.touches[1].clientX) ** 2 +
        (e.touches[0].clientY - e.touches[1].clientY) ** 2
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoom;
    } else if (e.touches.length === 1) {
      // One finger drag pan initialization
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - panX, y: touch.clientY - panY });
      touchStartDistRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      if (e.cancelable) {
        e.preventDefault();
      }
      const dist = Math.sqrt(
        (e.touches[0].clientX - e.touches[1].clientX) ** 2 +
        (e.touches[0].clientY - e.touches[1].clientY) ** 2
      );
      const ratio = dist / touchStartDistRef.current;
      const newZoom = Math.max(0.3, Math.min(2.5, touchStartZoomRef.current * ratio));
      setZoom(newZoom);
    } else if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPanX(touch.clientX - dragStart.x);
      setPanY(touch.clientY - dragStart.y);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchStartDistRef.current = null;
    if (e.touches.length === 1) {
      // Transition back to single finger panning
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - panX, y: touch.clientY - panY });
    } else {
      setIsDragging(false);
    }
  };

  // Zoom Helpers
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.4));
  const zoomReset = () => {
    setZoom(0.85);
    setPanX(100);
    setPanY(50);
  };

  // Ancestor Mode checklist selector: Toggling collapsed sub-branches
  const toggleCollapseBranch = (personId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedBranches(prev => {
      const next = new Set(prev);
      if (next.has(personId)) {
        next.delete(personId);
      } else {
        next.add(personId);
      }
      return next;
    });
  };

  // Switch root focus upwards
  const handlePromoteToRoot = (personId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRootAncestor(personId);
  };

  return (
    <div className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-[100] h-screen w-screen bg-zinc-50 dark:bg-zinc-950 rounded-none border-none' : 'h-[600px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl shadow-inner'} overflow-hidden flex flex-col`}>
      
      {/* Floating Close / Back Button when Fullscreen (Only Back Button Left) */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 left-4 z-[200] px-4.5 py-2.5 bg-zinc-900/95 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 border border-zinc-700 dark:border-zinc-300 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xl active:scale-95 cursor-pointer select-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-sans font-bold tracking-wide">{lang === 'en' ? 'Back' : 'ተመለስ'}</span>
        </button>
      )}

      {/* Top Banner Control Panel (Hidden in Fullscreen so ONLY back button remains) */}
      {!isFullscreen && (
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap justify-between items-center bg-white/95 dark:bg-zinc-900/95 shadow-md px-4 py-2 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm gap-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {getTranslation('familyTree', lang)}
            </h2>
            <p className="text-xs text-zinc-500 font-mono">
              {nodes.length} {lang === 'en' ? 'profiles shown' : 'ቁምፊዎች ታይተዋል'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Interactive branch selector dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden sm:inline">
              {lang === 'en' ? 'Branch:' : 'ቅርንጫፍ፡'}
            </span>
            <select
              value={localBranchFilter}
              onChange={(e) => setLocalBranchFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-zinc-700 dark:text-zinc-300 font-semibold outline-none cursor-pointer p-0 pr-1 max-w-[130px] sm:max-w-none"
            >
              <option value="all" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                {lang === 'en' ? 'All (Mind Map)' : 'ሁሉም ቅርንጫፎች (አጠቃላይ ሐረግ)'}
              </option>
              {primaryBranches.map((pb) => (
                <option key={pb.id} value={pb.id} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                  {lang === 'en' ? `${pb.firstNameEnglish}'s Branch` : `የ${pb.firstNameAmharic} ዘር`}
                </option>
              ))}
            </select>
          </div>

          {/* Active branch reset focus */}
          {rootAncestor !== primaryRoot && (
            <button
              onClick={() => {
                setRootAncestor(primaryRoot);
                setLocalBranchFilter('all');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Reset to True Patriarch' : 'ወደ ቀዳሚው አያት ይመለሱ'}
            </button>
          )}

          {/* Quick Zoom Actions */}
          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-md bg-zinc-50 dark:bg-zinc-850 p-0.5">
            <button
              onClick={zoomIn}
              className="p-1 px-2 text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={zoomOut}
              className="p-1 px-2 text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={zoomReset}
              className="p-1 px-2 text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors"
              title="Recenter and Fit View"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>

          {/* Full Screen Toggle Option */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white text-xs font-bold rounded-md shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer select-none"
            title={lang === 'en' ? 'Full Screen Mode' : 'ሙሉ ገጽ እይታ'}
          >
            <Expand className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{lang === 'en' ? 'Full Screen' : 'ሙሉ ገጽ'}</span>
          </button>
        </div>
      </div>
      )}

      {/* SVG Canvas Area */}
      <div
        id="family-tree-canvas"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full h-full select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <svg className="w-full h-full">
          {/* Animated SVG Filters / Glowing Highlights */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <linearGradient id="maleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            <linearGradient id="femaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>

            <linearGradient id="otherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>

            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Group wrapper handling SVG Pan & Zoom */}
          <g transform={`translate(${panX + (containerRef.current?.clientWidth || 0)/2}, ${panY}) scale(${zoom})`}>
            
            {/* 1. Connections rendering */}
            <g>
              {connections.map((c) => {
                // Determine curves/step styling for parent-child vs horizontal spouse bond
                const strokeColor = c.highlighted 
                  ? '#f59e0b' 
                  : (c.isSpouseBond ? '#e2e8f0' : '#cbd5e1');
                
                const darkStrokeColor = c.highlighted
                  ? '#fbbf24'
                  : (c.isSpouseBond ? '#27272a' : '#3f3f46');
                
                const isSpouse = c.isSpouseBond;

                // Simple path calculation: Bezier curves
                let pathD = '';
                if (isSpouse) {
                  // Direct horizontal connection line
                  pathD = `M ${c.fromX} ${c.fromY} L ${c.toX} ${c.toY}`;
                } else {
                  // Elegant vertical step/s-curve connect
                  const midY = (c.fromY + c.toY) / 2;
                  pathD = `M ${c.fromX} ${c.fromY} C ${c.fromX} ${midY}, ${c.toX} ${midY}, ${c.toX} ${c.toY}`;
                }

                return (
                  <g key={c.id}>
                    {/* Glow background for highlighted path */}
                    {c.highlighted && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth={7}
                        strokeLinecap="round"
                        opacity={0.7}
                        className="animate-pulse"
                      />
                    )}

                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={c.highlighted ? 3.5 : (isSpouse ? 3 : 1.5)}
                      strokeDasharray={isSpouse ? '4 4' : (c.highlighted ? '6 4' : 'none')}
                      className={`stroke-zinc-300 dark:stroke-zinc-800 ${c.highlighted ? 'stroke-amber-500 animate-[dash_15s_linear_infinite]' : ''}`}
                      style={{
                        stroke: c.highlighted ? '#f59e0b' : undefined,
                      }}
                    />

                    {/* Spouse heart badge */}
                    {isSpouse && (
                      <g transform={`translate(${(c.fromX + c.toX)/2}, ${(c.fromY + c.toY)/2})`}>
                        <circle cx={0} cy={0} r={10} className="fill-white dark:fill-zinc-900 stroke-zinc-200 dark:stroke-zinc-800" strokeWidth={1} />
                        <path d="M-4,-4 C-6,-6 -10,-4 -8,-1 L0,6 L8,-1 C10,-4 6,-6 4,-4 L0,-1 Z" className={`fill-rose-500 scale-[0.9] translate-x-[-1.5px] translate-y-[-2px]`} />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* 2. Nodes rendering */}
            <g>
              {nodes.map((n) => {
                const isSelected = selectedPersonId === n.person.id;
                const isInPath = highlightedPath?.includes(n.person.id);
                const isDead = !n.person.isLiving;
                const hasChildren = n.person.childIds.length > 0;
                const isBranchCollapsed = collapsedBranches.has(n.person.id);

                const isMe = n.person.id === meId;

                // Styling setup by gender
                let cardBorderClass = 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700';
                let headerBg = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200';
                let genderDot = 'bg-zinc-400';

                if (n.person.gender === 'male') {
                  headerBg = 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300';
                  genderDot = 'bg-blue-500';
                } else if (n.person.gender === 'female') {
                  headerBg = 'bg-pink-50/85 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300';
                  genderDot = 'bg-pink-500';
                } else if (n.person.gender === 'other') {
                  headerBg = 'bg-teal-50/85 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300';
                  genderDot = 'bg-teal-500';
                }

                if (isMe) {
                  headerBg = 'bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold';
                  genderDot = 'bg-white shadow-xs';
                  if (isSelected) {
                    cardBorderClass = 'ring-4 ring-orange-500 ring-offset-2 dark:ring-offset-zinc-950 border-orange-550 shadow-lg shadow-orange-500/25';
                  } else {
                    cardBorderClass = 'ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-zinc-950 border-orange-400 shadow-md shadow-orange-500/15';
                  }
                } else {
                  if (isSelected) {
                    cardBorderClass = 'ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-zinc-950 border-orange-500 dark:border-orange-500';
                  } else if (isInPath) {
                    cardBorderClass = 'ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-zinc-950 border-amber-400 dark:border-amber-400';
                  }
                }

                const displayName = lang === 'en'
                  ? `${n.person.firstNameEnglish} ${n.person.lastNameEnglish.charAt(0)}.`
                  : `${n.person.firstNameAmharic} ${n.person.lastNameAmharic.charAt(0)}`;
                
                const displayFull = lang === 'en'
                  ? `${n.person.firstNameEnglish}`
                  : `${n.person.firstNameAmharic}`;

                // Calculate age or lifespan
                let lifeyear = '';
                if (n.person.birthDate) {
                  const bDate = parseIsoDateLocal(n.person.birthDate) ?? new Date(n.person.birthDate);
                  const bYear = preferredCalendar === 'ethiopian' ? toEthiopic(bDate).year : bDate.getFullYear();
                  
                  let dLabel = '';
                  if (n.person.isLiving) {
                    dLabel = lang === 'en' ? 'Living' : 'በህይወት';
                  } else if (n.person.deathDate) {
                    const dDate = parseIsoDateLocal(n.person.deathDate) ?? new Date(n.person.deathDate);
                    dLabel = String(preferredCalendar === 'ethiopian' ? toEthiopic(dDate).year : dDate.getFullYear());
                  } else {
                    dLabel = lang === 'en' ? 'Deceased' : 'ያለፈ';
                  }
                  
                  lifeyear = `${bYear} - ${dLabel}`;
                }

                return (
                  <g
                    key={n.person.id}
                    transform={`translate(${n.x - 70}, ${n.y - 45})`}
                    className="transition-transform duration-300"
                  >
                    {/* Card container */}
                    <foreignObject width={140} height={105} className="overflow-visible">
                      <div
                        id={`tree-node-${n.person.id}`}
                        onClick={() => onSelectPerson(n.person.id)}
                        className={`relative w-[140px] h-[90px] bg-white dark:bg-zinc-900 border text-center rounded-lg shadow-sm flex flex-col justify-between transition-all duration-250 hover:shadow-md cursor-pointer select-none ${cardBorderClass} ${isDead ? 'opacity-85' : ''}`}
                      >
                        {/* ME Badge */}
                        {isMe && (
                          <div className="absolute -top-2.5 -left-1 bg-gradient-to-r from-orange-600 to-amber-600 border border-orange-400 text-white font-mono text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-md z-30 animate-pulse">
                            {lang === 'en' ? 'ME' : 'እኔ'}
                          </div>
                        )}

                        {/* Elegant Gender Header Belt */}
                        <div className={`text-[11px] font-medium leading-none px-2 py-1.5 rounded-t-lg flex justify-between items-center ${headerBg}`}>
                          <span className="truncate font-sans tracking-tight max-w-[100px]" title={n.person.firstNameEnglish}>
                            {displayFull}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${genderDot}`} />
                        </div>

                        {/* Mid-Body Info */}
                        <div className="flex-1 flex flex-col justify-center px-1 py-1">
                          {/* Amharic Secondary name line */}
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate">
                            {lang === 'en' ? n.person.firstNameAmharic : n.person.firstNameEnglish}
                          </span>
                          
                          {/* Nickname flag */}
                          {(n.person.nicknameEnglish || n.person.nicknameAmharic) && (
                            <span className="text-[9px] font-serif italic text-zinc-500 line-clamp-1">
                              "{lang === 'en' ? (n.person.nicknameEnglish || n.person.nicknameAmharic) : (n.person.nicknameAmharic || n.person.nicknameEnglish)}"
                            </span>
                          )}

                          {/* Lifespan */}
                          <div className="text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 mt-1 flex justify-center items-center gap-1">
                            {lifeyear}
                          </div>
                        </div>

                        {/* Expandable/Branch Controller footer */}
                        <div className="border-t border-zinc-100 dark:border-zinc-800/80 px-1 py-0.5 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/30 rounded-b-lg">
                          
                          {/* Anchor promotes up */}
                          <button
                            onClick={(e) => handlePromoteToRoot(n.person.id, e)}
                            className="p-0.5 text-zinc-400 hover:text-orange-600 dark:text-zinc-600 dark:hover:text-orange-400 rounded transition-colors node-button"
                            title={lang === 'en' ? 'Refocus Tree branch here' : 'ቅርንጫፍ ወደዚህ አዛውር'}
                          >
                            <GitBranch className="h-3 w-3" />
                          </button>

                          {/* Branch toggle */}
                          {hasChildren && (
                            <button
                              onClick={(e) => toggleCollapseBranch(n.person.id, e)}
                              className="p-0.5 px-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-[8px] font-mono rounded font-semibold transition-colors flex items-center gap-0.5 node-button"
                              title={lang === 'en' ? 'Toggle branch' : 'የቤተሰብ ቅርንጫፍ ዝጋ'}
                            >
                              <span>{isBranchCollapsed ? '+' : '-'}</span>
                              <span>{n.person.childIds.length}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </g>

          </g>
        </svg>

        {/* Tree Instructions Footer overlay */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none md:flex flex-col gap-1 hidden">
          <div className="bg-zinc-900/90 text-white text-[11px] px-3 py-1.5 rounded-lg backdrop-blur-sm shadow flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>{lang === 'en' ? 'Tip: Drag canvas to pan, double click/scroll to zoom' : 'ጠቃሚ ምክር: ለማንቀሳቀስ ይጎትቱ፥ ለማጉላት በእጅ ያጭኑ'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
