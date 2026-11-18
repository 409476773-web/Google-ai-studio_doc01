import { INITIAL_OPEN_RELATION_PAIRS } from '../data/toolbox-matrix-data';

const STORAGE_KEY = 'rain_classroom_toolbox_open_relations_v1';

export function makeRelationKey(classId: string, toolId: string): string {
  return `${classId}::${toolId}`;
}

export function parseRelationKey(key: string): { classId: string; toolId: string } {
  const sepIndex = key.indexOf('::');
  if (sepIndex === -1) {
    return { classId: key, toolId: '' };
  }
  return {
    classId: key.slice(0, sepIndex),
    toolId: key.slice(sepIndex + 2),
  };
}

export function createInitialRelationSet(): Set<string> {
  return new Set(INITIAL_OPEN_RELATION_PAIRS.map(([classId, toolId]) => makeRelationKey(classId, toolId)));
}

export function loadSavedRelations(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialRelationSet();
      persistSavedRelations(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((item): item is string => typeof item === 'string'));
    }
  } catch {
    // Fallback to initial seed if storage is unavailable
  }
  return createInitialRelationSet();
}

export function persistSavedRelations(relations: Set<string>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...relations]));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export function resetSavedRelationsToDefault(): Set<string> {
  const initial = createInitialRelationSet();
  persistSavedRelations(initial);
  return initial;
}

export function clearSavedRelations(): Set<string> {
  const empty = new Set<string>();
  persistSavedRelations(empty);
  return empty;
}

export interface RelationDiffSummary {
  addedCount: number;
  removedCount: number;
  isDirty: boolean;
}

export function computeRelationDiff(saved: Set<string>, draft: Set<string>): RelationDiffSummary {
  let addedCount = 0;
  let removedCount = 0;

  for (const key of draft) {
    if (!saved.has(key)) {
      addedCount += 1;
    }
  }
  for (const key of saved) {
    if (!draft.has(key)) {
      removedCount += 1;
    }
  }

  return {
    addedCount,
    removedCount,
    isDirty: addedCount > 0 || removedCount > 0,
  };
}

export async function saveToolboxRelations(
  nextRelations: Set<string>,
  options: { simulateFailure?: boolean } = {},
): Promise<Set<string>> {
  await new Promise((resolve) => window.setTimeout(resolve, 420));

  if (options.simulateFailure) {
    throw new Error('网络请求超时，未能保存百宝箱开放关系，已保留当前勾选状态。');
  }

  const snapshot = new Set(nextRelations);
  persistSavedRelations(snapshot);
  return snapshot;
}
