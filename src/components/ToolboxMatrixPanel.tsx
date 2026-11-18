import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertDialog,
  AlertTitle,
  Button,
  Empty,
  EmptyActions,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
  IconButton,
  Input,
  Popover,
  Select,
  TableRowCheckbox,
  Tabs,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  toast,
  type SelectOption,
  type TabsItem,
} from '@rain-next/ui';
import { ArrowLeftIcon } from '@rain-next/ui/icons/arrow-left';
import { ArrowRightIcon } from '@rain-next/ui/icons/arrow-right';
import { CheckBoldIcon } from '@rain-next/ui/icons/check-bold';
import { CloseIcon } from '@rain-next/ui/icons/close';
import { FilterIcon } from '@rain-next/ui/icons/filter';
import { FolderColorGradient1Icon } from '@rain-next/ui/icons/folder-color-gradient-1';
import { FolderColorGradient2Icon } from '@rain-next/ui/icons/folder-color-gradient-2';
import { FolderColorGradient3Icon } from '@rain-next/ui/icons/folder-color-gradient-3';
import { FolderColorGradient4Icon } from '@rain-next/ui/icons/folder-color-gradient-4';
import { FolderColorGradient5Icon } from '@rain-next/ui/icons/folder-color-gradient-5';
import { FolderColorGradient6Icon } from '@rain-next/ui/icons/folder-color-gradient-6';
import { FolderIcon } from '@rain-next/ui/icons/folder';
import { MinusBoldIcon } from '@rain-next/ui/icons/minus-bold';
import { SchoolColorIcon } from '@rain-next/ui/icons/school-color';
import { SearchIcon } from '@rain-next/ui/icons/search';
import { ShareIcon } from '@rain-next/ui/icons/share';
import { ToolboxIcon } from '@rain-next/ui/icons/toolbox';
import { GroupAgentsHoverBubble } from './GroupAgentsHoverBubble';
import { GroupSpanBatchPopover } from './GroupSpanBatchPopover';
import {
  GroupToolsPickerDialog,
  type GroupToolsPickerState,
} from './GroupToolsPickerDialog';
import { InlineGroupToolsCell } from './InlineGroupToolsCell';
import { ToolDetailHoverBubble } from './ToolDetailHoverBubble';
import type { MatrixHierarchyScheme } from '../data/design-schemes';
import {
  CLASS_OWNER_OPTIONS,
  CLASS_SOURCES,
  COURSE_CLASSES,
  SEMESTERS,
  TOOLBOX_GROUPS,
  TOOLBOX_TOOLS,
  getClassDisplayName,
  type CourseClassItem,
  type PublishMode,
  type ToolOwnershipType,
  type ToolboxGroup,
  type ToolboxTool,
} from '../data/toolbox-matrix-data';
import {
  computeRelationDiff,
  loadSavedRelations,
  makeRelationKey,
  saveToolboxRelations,
} from '../services/toolbox-relations-store';
import { MatrixCheckButton, type MatrixCellState } from './MatrixCheckButton';
import { matrixHeaderSelectRecipe, matrixTopTabsRecipe } from './matrix-recipes';

const PAGE_SIZE = 5;

const GROUP_ICONS = [
  FolderColorGradient1Icon,
  FolderColorGradient2Icon,
  FolderColorGradient3Icon,
  FolderColorGradient4Icon,
  FolderColorGradient5Icon,
  FolderColorGradient6Icon,
];

interface GroupedCourseRow {
  courseId: string;
  courseName: string;
  classes: CourseClassItem[];
}

type MatrixColumnSlot =
  | {
      kind: 'group-summary';
      key: string;
      group: ToolboxGroup;
      groupTools: ToolboxTool[];
    }
  | {
      kind: 'group-collapsed';
      key: string;
      group: ToolboxGroup;
      groupTools: ToolboxTool[];
    }
  | {
      kind: 'group-panoramic';
      key: string;
      group: ToolboxGroup;
      groupTools: ToolboxTool[];
    }
  | {
      kind: 'group-handle';
      key: string;
      group: ToolboxGroup;
      groupTools: ToolboxTool[];
    }
  | {
      kind: 'group-only';
      key: string;
      group: ToolboxGroup;
      groupTools: ToolboxTool[];
    }
  | {
      kind: 'tool';
      key: string;
      tool: ToolboxTool;
    };

interface GroupSpanRun {
  key: string;
  group: ToolboxGroup | null;
  groupTools: ToolboxTool[];
  colSpan: number;
  isContinuation: boolean;
  visibleToolCount: number;
  isExpandedInTree: boolean;
}

function getSlotGroupId(slot: MatrixColumnSlot | null | undefined): string | null {
  if (!slot) return null;
  return slot.kind === 'tool' ? slot.tool.groupId : slot.group.id;
}

function packClusterPages(
  clusters: MatrixColumnSlot[][],
  pageSize: number,
): MatrixColumnSlot[][] {
  const pages: MatrixColumnSlot[][] = [];
  let currentPage: MatrixColumnSlot[] = [];

  for (const cluster of clusters) {
    if (cluster.length === 0) continue;

    if (cluster.length <= pageSize) {
      if (currentPage.length > 0 && currentPage.length + cluster.length > pageSize) {
        pages.push(currentPage);
        currentPage = [];
      }
      currentPage.push(...cluster);
      if (currentPage.length === pageSize) {
        pages.push(currentPage);
        currentPage = [];
      }
    } else {
      if (currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
      }
      for (let i = 0; i < cluster.length; i += pageSize) {
        const chunk = cluster.slice(i, i + pageSize);
        if (chunk.length === pageSize) {
          pages.push(chunk);
        } else {
          currentPage = chunk;
        }
      }
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  return pages;
}

function buildInterleavedPages(
  groups: ToolboxGroup[],
  matchedByGroup: Map<string, ToolboxTool[]>,
  pageSize: number,
  summaryKind: 'group-summary' | 'group-handle' = 'group-summary',
): MatrixColumnSlot[][] {
  const clusters: MatrixColumnSlot[][] = [];
  for (const group of groups) {
    const matchingTools = matchedByGroup.get(group.id);
    if (!matchingTools || matchingTools.length === 0) continue;
    clusters.push([
      {
        kind: summaryKind,
        key: `${summaryKind}-${group.id}`,
        group,
        groupTools: matchingTools,
      },
      ...matchingTools.map<MatrixColumnSlot>((tool) => ({
        kind: 'tool',
        key: tool.id,
        tool,
      })),
    ]);
  }
  return packClusterPages(clusters, pageSize);
}

function buildTreePages(
  groups: ToolboxGroup[],
  matchedByGroup: Map<string, ToolboxTool[]>,
  expandedGroupIds: Set<string>,
  pageSize: number,
): MatrixColumnSlot[][] {
  const clusters: MatrixColumnSlot[][] = [];
  for (const group of groups) {
    const matchingTools = matchedByGroup.get(group.id);
    if (!matchingTools || matchingTools.length === 0) continue;
    if (expandedGroupIds.has(group.id)) {
      clusters.push([
        {
          kind: 'group-summary',
          key: `summary-${group.id}`,
          group,
          groupTools: matchingTools,
        },
        ...matchingTools.map<MatrixColumnSlot>((tool) => ({
          kind: 'tool',
          key: tool.id,
          tool,
        })),
      ]);
    } else {
      clusters.push([
        {
          kind: 'group-collapsed',
          key: `collapsed-${group.id}`,
          group,
          groupTools: matchingTools,
        },
      ]);
    }
  }
  return packClusterPages(clusters, pageSize);
}

function packPureToolPages(
  groups: ToolboxGroup[],
  matchedByGroup: Map<string, ToolboxTool[]>,
  pageSize: number,
): MatrixColumnSlot[][] {
  const pages: MatrixColumnSlot[][] = [];
  let currentPage: MatrixColumnSlot[] = [];

  for (const group of groups) {
    const tools = matchedByGroup.get(group.id);
    if (!tools || tools.length === 0) continue;

    // 避免多工具分组在页尾仅剩 1 列时开启，防止顶梁 colSpan=1 挤爆组名与操作按钮
    if (
      tools.length >= 2 &&
      currentPage.length === pageSize - 1
    ) {
      pages.push(currentPage);
      currentPage = [];
    }

    for (const tool of tools) {
      currentPage.push({ kind: 'tool', key: tool.id, tool });
      if (currentPage.length === pageSize) {
        pages.push(currentPage);
        currentPage = [];
      }
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  return pages;
}

export interface ToolboxMatrixPanelProps {
  activeScheme?: MatrixHierarchyScheme;
  toolsCatalog?: ToolboxTool[];
  simulateSaveFailure: boolean;
  onClose: () => void;
  onSavedSnapshotChange?: (count: number) => void;
}

export function ToolboxMatrixPanel({
  activeScheme = 'scheme-1',
  toolsCatalog = TOOLBOX_TOOLS,
  simulateSaveFailure,
  onClose,
  onSavedSnapshotChange,
}: ToolboxMatrixPanelProps) {
  // 顶部 Tab（默认激活「发布百宝箱」）
  const [activeTab, setActiveTab] = useState<string>('toolbox');

  // 班级区域筛选（位于合并表头内）
  const [sourceId, setSourceId] = useState<string>('school-cup');
  const [semester, setSemester] = useState<string>('2024春季学期');
  const [ownerRole, setOwnerRole] = useState<string>('own');

  // 工具区域筛选与发布方式
  const [publishMode, setPublishMode] = useState<PublishMode>('by-tool');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // 方案六（可展开树形分组列）展开状态 & 方案七（按住横拉刷选）交互状态
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => new Set());
  const dragPaintRef = useRef<{ classId: string; targetOpen: boolean } | null>(null);
  const [isDraggingPaint, setIsDraggingPaint] = useState(false);
  const [dragPaintClassId, setDragPaintClassId] = useState<string | null>(null);

  // 方案 A（scheme-10）分组导航页签 / 状态筛选；方案 B（scheme-11）宽面板弹窗；方案 C（scheme-12）横滚容器 ref
  const [focusedGroupTab, setFocusedGroupTab] = useState<string>('grp-coding');
  const [openStatusFilter, setOpenStatusFilter] = useState<'all' | 'has-open' | 'none-open'>('all');
  const [pickerState, setPickerState] = useState<GroupToolsPickerState | null>(null);
  const hScrollContainerRef = useRef<HTMLDivElement>(null);
  const [hScrollActiveGroupId, setHScrollActiveGroupId] = useState<string | null>(null);

  // 十字准星列悬浮索引 & 同组簇联动高亮状态
  const [hoveredColSlot, setHoveredColSlot] = useState<number | null>(null);
  const [hoveredGroupState, setHoveredGroupState] = useState<{
    groupId: string;
    mode: 'cluster' | 'child' | 'span';
  } | null>(null);

  // 持久化已保存关系 & 当前编辑草稿
  const [savedRelations, setSavedRelations] = useState<Set<string>>(() => loadSavedRelations());
  const [draftRelations, setDraftRelations] = useState<Set<string>>(() => new Set(loadSavedRelations()));

  // 保存与关闭确认状态
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  useEffect(() => {
    const endDragPaint = () => {
      if (dragPaintRef.current) {
        dragPaintRef.current = null;
        setIsDraggingPaint(false);
        setDragPaintClassId(null);
      }
    };
    window.addEventListener('mouseup', endDragPaint);
    window.addEventListener('pointerup', endDragPaint);
    window.addEventListener('blur', endDragPaint);
    return () => {
      window.removeEventListener('mouseup', endDragPaint);
      window.removeEventListener('pointerup', endDragPaint);
      window.removeEventListener('blur', endDragPaint);
    };
  }, []);

  const selectedSource = useMemo(
    () => CLASS_SOURCES.find((item) => item.id === sourceId) ?? CLASS_SOURCES[0],
    [sourceId],
  );
  const isSelfBuiltSource = selectedSource.kind === 'self';

  // 分组 -> 工具索引（跟随当前 toolsCatalog 规模切换）
  const toolsByGroupMap = useMemo(() => {
    const map = new Map<string, ToolboxTool[]>();
    for (const group of TOOLBOX_GROUPS) {
      map.set(group.id, []);
    }
    for (const tool of toolsCatalog) {
      const list = map.get(tool.groupId);
      if (list) {
        list.push(tool);
      }
    }
    return map;
  }, [toolsCatalog]);

  const groupNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of TOOLBOX_GROUPS) {
      map.set(g.id, g.name);
    }
    return map;
  }, []);

  const groupMetaMap = useMemo(() => {
    const map = new Map<string, ToolboxGroup>();
    for (const g of TOOLBOX_GROUPS) {
      map.set(g.id, g);
    }
    return map;
  }, []);

  const groupOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    TOOLBOX_GROUPS.forEach((g, idx) => {
      map.set(g.id, idx);
    });
    return map;
  }, []);

  // 1. 班级筛选规则
  const filteredCourses = useMemo<GroupedCourseRow[]>(() => {
    const matched = COURSE_CLASSES.filter((cls) => {
      if (cls.sourceId !== sourceId) return false;
      if (selectedSource.kind === 'school' && cls.edition !== 'pro') return false;
      if (semester !== 'all' && cls.semester !== semester) return false;
      if (ownerRole !== 'all' && cls.ownerRole !== ownerRole) return false;
      return true;
    });

    const grouped = new Map<string, GroupedCourseRow>();
    for (const cls of matched) {
      const existing = grouped.get(cls.courseId);
      if (existing) {
        existing.classes.push(cls);
      } else {
        grouped.set(cls.courseId, {
          courseId: cls.courseId,
          courseName: cls.courseName,
          classes: [cls],
        });
      }
    }
    return [...grouped.values()];
  }, [sourceId, selectedSource.kind, semester, ownerRole]);

  const flatFilteredClasses = useMemo(
    () => filteredCourses.flatMap((course) => course.classes),
    [filteredCourses],
  );

  const isInterleavedScheme = activeScheme === 'scheme-5';
  const isTreeScheme = activeScheme === 'scheme-6';
  const isPureBrushScheme = activeScheme === 'scheme-7';
  const isPanoramicScheme = activeScheme === 'scheme-8';
  const isHandleScheme = activeScheme === 'scheme-9';
  const isPlanAScheme = activeScheme === 'scheme-10';
  const isPlanBScheme = activeScheme === 'scheme-11';
  const isPlanCScheme = activeScheme === 'scheme-12';
  const isSingleDimensionScheme =
    isInterleavedScheme ||
    isTreeScheme ||
    isPureBrushScheme ||
    isPanoramicScheme ||
    isHandleScheme ||
    isPlanAScheme ||
    isPlanBScheme ||
    isPlanCScheme;

  // 2. 工具 / 分组筛选规则（按分组顺序稳定排列，确保同组工具相邻归属）
  const filteredTools = useMemo<ToolboxTool[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    const matched = toolsCatalog.filter((tool) => {
      if (isPlanAScheme && focusedGroupTab !== 'overview' && tool.groupId !== focusedGroupTab) {
        return false;
      }
      if (!isPlanAScheme && groupFilter !== 'all' && tool.groupId !== groupFilter) {
        return false;
      }
      if (typeFilter !== 'all' && tool.type !== (typeFilter as ToolOwnershipType)) return false;
      if ((isPlanAScheme || isPlanCScheme) && openStatusFilter !== 'all') {
        const hasOpen = flatFilteredClasses.some((cls) =>
          draftRelations.has(makeRelationKey(cls.id, tool.id)),
        );
        if (openStatusFilter === 'has-open' && !hasOpen) return false;
        if (openStatusFilter === 'none-open' && hasOpen) return false;
      }
      if (q) {
        const toolMatch = tool.name.toLowerCase().includes(q);
        const grpName = (groupNameMap.get(tool.groupId) ?? '').toLowerCase();
        const groupMatch =
          (isTreeScheme || isPanoramicScheme || isPlanBScheme || (isPlanAScheme && focusedGroupTab === 'overview')) &&
          grpName.includes(q);
        if (!toolMatch && !groupMatch) return false;
      }
      return true;
    });
    return [...matched].sort(
      (a, b) =>
        (groupOrderMap.get(a.groupId) ?? Number.MAX_SAFE_INTEGER) -
        (groupOrderMap.get(b.groupId) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [
    toolsCatalog,
    isPlanAScheme,
    isPlanCScheme,
    focusedGroupTab,
    groupFilter,
    typeFilter,
    openStatusFilter,
    flatFilteredClasses,
    draftRelations,
    searchQuery,
    groupNameMap,
    groupOrderMap,
    isTreeScheme,
    isPanoramicScheme,
    isPlanBScheme,
  ]);

  const filteredGroups = useMemo<ToolboxGroup[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return TOOLBOX_GROUPS;
    return TOOLBOX_GROUPS.filter((grp) => grp.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const matchedToolsByGroup = useMemo(() => {
    const map = new Map<string, ToolboxTool[]>();
    for (const tool of filteredTools) {
      const list = map.get(tool.groupId);
      if (list) {
        list.push(tool);
      } else {
        map.set(tool.groupId, [tool]);
      }
    }
    return map;
  }, [filteredTools]);

  const matchingGroupsInOrder = useMemo(
    () =>
      TOOLBOX_GROUPS.filter(
        (grp) => (matchedToolsByGroup.get(grp.id)?.length ?? 0) > 0,
      ),
    [matchedToolsByGroup],
  );

  const focusedPlanAGroup = useMemo(
    () => groupMetaMap.get(focusedGroupTab) ?? TOOLBOX_GROUPS[0],
    [groupMetaMap, focusedGroupTab],
  );
  const focusedPlanAAllGroupTools = useMemo(
    () => toolsByGroupMap.get(focusedPlanAGroup.id) ?? [],
    [toolsByGroupMap, focusedPlanAGroup.id],
  );

  // 方案 A 单组状态计数（在开放状态过滤之前统计，保证切换“已开/未开”时计数仍清晰）
  const planAGroupStatusCounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let all = 0;
    let hasOpen = 0;
    let noneOpen = 0;
    for (const tool of focusedPlanAAllGroupTools) {
      if (typeFilter !== 'all' && tool.type !== (typeFilter as ToolOwnershipType)) continue;
      if (q && !tool.name.toLowerCase().includes(q)) continue;
      all += 1;
      const isOpen = flatFilteredClasses.some((cls) =>
        draftRelations.has(makeRelationKey(cls.id, tool.id)),
      );
      if (isOpen) {
        hasOpen += 1;
      } else {
        noneOpen += 1;
      }
    }
    return { all, hasOpen, noneOpen };
  }, [
    focusedPlanAAllGroupTools,
    typeFilter,
    searchQuery,
    flatFilteredClasses,
    draftRelations,
  ]);

  const isTreeCollapsedPanoramic = isTreeScheme && expandedGroupIds.size === 0;
  const isPlanAOverview = isPlanAScheme && focusedGroupTab === 'overview';

  // 方案 C（横滚）一次性展开全部列（每组：1 整组总控 + N 工具）
  const hScrollPlanCResult = useMemo(() => {
    if (!isPlanCScheme) {
      return {
        columns: [] as MatrixColumnSlot[],
        groupOffsets: new Map<string, number>(),
      };
    }
    const columns: MatrixColumnSlot[] = [];
    const groupOffsets = new Map<string, number>();
    for (const group of TOOLBOX_GROUPS) {
      const groupTools = matchedToolsByGroup.get(group.id);
      if (!groupTools || groupTools.length === 0) continue;
      groupOffsets.set(group.id, columns.length);
      columns.push({
        kind: 'group-summary',
        key: `hscroll-summary-${group.id}`,
        group,
        groupTools: toolsByGroupMap.get(group.id) ?? groupTools,
      });
      for (const tool of groupTools) {
        columns.push({
          kind: 'tool',
          key: `hscroll-tool-${tool.id}`,
          tool,
        });
      }
    }
    return { columns, groupOffsets };
  }, [isPlanCScheme, matchedToolsByGroup, toolsByGroupMap]);

  const rightSlotCount = isPlanCScheme
    ? Math.max(5, hScrollPlanCResult.columns.length)
    : isPanoramicScheme || isPlanBScheme || isTreeCollapsedPanoramic || isPlanAOverview
      ? 6
      : PAGE_SIZE;

  const showGroupSpanRow =
    isInterleavedScheme ||
    isPureBrushScheme ||
    isHandleScheme ||
    isPlanCScheme ||
    (isPlanAScheme && focusedGroupTab !== 'overview') ||
    (isTreeScheme && expandedGroupIds.size > 0) ||
    (!isSingleDimensionScheme && publishMode === 'by-tool');

  const schemePages = useMemo<MatrixColumnSlot[][]>(() => {
    if (isPlanCScheme) {
      return hScrollPlanCResult.columns.length > 0 ? [hScrollPlanCResult.columns] : [];
    }
    if (isPlanAScheme) {
      if (focusedGroupTab === 'overview') {
        const cols: MatrixColumnSlot[] = matchingGroupsInOrder.map((group) => ({
          kind: 'group-panoramic',
          key: `plan-a-overview-${group.id}`,
          group,
          groupTools: matchedToolsByGroup.get(group.id) ?? [],
        }));
        return cols.length > 0 ? [cols] : [];
      }
      // 方案 A 单组聚焦态：第 1 列永远固定为「整组总控」，第 2~5 列展示当前页 4 个工具
      const summaryCol: MatrixColumnSlot = {
        kind: 'group-summary',
        key: `plan-a-pinned-${focusedPlanAGroup.id}`,
        group: focusedPlanAGroup,
        groupTools: focusedPlanAAllGroupTools,
      };
      if (filteredTools.length === 0) {
        return [[summaryCol]];
      }
      const pages: MatrixColumnSlot[][] = [];
      const perPage = PAGE_SIZE - 1;
      for (let i = 0; i < filteredTools.length; i += perPage) {
        const chunk = filteredTools.slice(i, i + perPage).map<MatrixColumnSlot>((tool) => ({
          kind: 'tool',
          key: tool.id,
          tool,
        }));
        pages.push([summaryCol, ...chunk]);
      }
      return pages;
    }
    if (isInterleavedScheme) {
      return buildInterleavedPages(
        TOOLBOX_GROUPS,
        matchedToolsByGroup,
        PAGE_SIZE,
        'group-summary',
      );
    }
    if (isHandleScheme) {
      return buildInterleavedPages(
        TOOLBOX_GROUPS,
        matchedToolsByGroup,
        PAGE_SIZE,
        'group-handle',
      );
    }
    if (isTreeScheme) {
      if (expandedGroupIds.size === 0) {
        const cols: MatrixColumnSlot[] = matchingGroupsInOrder.map((group) => ({
          kind: 'group-collapsed',
          key: `collapsed-${group.id}`,
          group,
          groupTools: matchedToolsByGroup.get(group.id) ?? [],
        }));
        return cols.length > 0 ? [cols] : [];
      }
      return buildTreePages(
        TOOLBOX_GROUPS,
        matchedToolsByGroup,
        expandedGroupIds,
        PAGE_SIZE,
      );
    }
    if (isPanoramicScheme || isPlanBScheme) {
      const cols: MatrixColumnSlot[] = matchingGroupsInOrder.map((group) => ({
        kind: 'group-panoramic',
        key: `${activeScheme}-panoramic-${group.id}`,
        group,
        groupTools: matchedToolsByGroup.get(group.id) ?? [],
      }));
      return cols.length > 0 ? [cols] : [];
    }
    if (isPureBrushScheme || publishMode === 'by-tool') {
      return packPureToolPages(TOOLBOX_GROUPS, matchedToolsByGroup, PAGE_SIZE);
    }
    const pages: MatrixColumnSlot[][] = [];
    for (let i = 0; i < filteredGroups.length; i += PAGE_SIZE) {
      pages.push(
        filteredGroups.slice(i, i + PAGE_SIZE).map((group) => ({
          kind: 'group-only',
          key: group.id,
          group,
          groupTools: toolsByGroupMap.get(group.id) ?? [],
        })),
      );
    }
    return pages;
  }, [
    isPlanCScheme,
    hScrollPlanCResult.columns,
    isPlanAScheme,
    focusedGroupTab,
    focusedPlanAGroup,
    focusedPlanAAllGroupTools,
    isInterleavedScheme,
    isHandleScheme,
    isTreeScheme,
    isPanoramicScheme,
    isPlanBScheme,
    activeScheme,
    isPureBrushScheme,
    publishMode,
    matchedToolsByGroup,
    matchingGroupsInOrder,
    expandedGroupIds,
    filteredTools,
    filteredGroups,
    toolsByGroupMap,
  ]);

  const activeColumnCount = schemePages.reduce((sum, cols) => sum + cols.length, 0);
  const totalPages = Math.max(1, schemePages.length);
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
    setHoveredColSlot(null);
    setHoveredGroupState(null);
    dragPaintRef.current = null;
    setIsDraggingPaint(false);
    setDragPaintClassId(null);
    setOpenStatusFilter('all');
    setPickerState(null);
    setHScrollActiveGroupId(null);
  }, [activeScheme]);

  useEffect(() => {
    if (isPlanCScheme && hScrollContainerRef.current) {
      hScrollContainerRef.current.scrollLeft = 0;
      setHScrollActiveGroupId(matchingGroupsInOrder[0]?.id ?? null);
    }
  }, [isPlanCScheme, matchingGroupsInOrder]);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const visibleSlots = useMemo<(MatrixColumnSlot | null)[]>(() => {
    const rawPage = schemePages[safePage - 1] ?? [];
    return Array.from({ length: rightSlotCount }).map((_, idx) => rawPage[idx] ?? null);
  }, [schemePages, safePage, rightSlotCount]);

  // 动态列宽计算：方案 12 恒定 118px 横滚；6列模式均分 590px；方案 9 为 42px 控制柄让渡宽度
  const rightColWidths = useMemo<string[]>(() => {
    if (isPlanCScheme) {
      return Array.from({ length: rightSlotCount }, () => '118px');
    }
    if (rightSlotCount === 6) {
      return Array.from({ length: 6 }, () => 'calc(590px / 6)');
    }
    if (!isHandleScheme) {
      return Array.from({ length: rightSlotCount }, () => 'var(--rain-matrix-tool-col-width)');
    }
    const handleCount = visibleSlots.filter((slot) => slot?.kind === 'group-handle').length;
    const regularCount = rightSlotCount - handleCount;
    const regularWidth =
      handleCount === 0 || regularCount <= 0
        ? 'var(--rain-matrix-tool-col-width)'
        : `calc((590px - ${handleCount * 42}px) / ${regularCount})`;
    return visibleSlots.map((slot) =>
      slot?.kind === 'group-handle' ? '42px' : regularWidth,
    );
  }, [isPlanCScheme, rightSlotCount, isHandleScheme, visibleSlots]);

  // 计算当前页各列所属分组，用于渲染顶部「分组归属条」与「组间分隔线」
  const visibleColumnGroupIds = useMemo<(string | null)[]>(
    () => visibleSlots.map((slot) => getSlotGroupId(slot)),
    [visibleSlots],
  );

  const groupSpanRuns = useMemo<GroupSpanRun[]>(() => {
    if (!showGroupSpanRow || activeColumnCount === 0) return [];
    const runs: GroupSpanRun[] = [];
    const prevPageCols = safePage > 1 ? schemePages[safePage - 2] ?? [] : [];
    const prevPageLastGroupId = getSlotGroupId(prevPageCols[prevPageCols.length - 1]);

    let idx = 0;
    while (idx < rightSlotCount) {
      const gid = visibleColumnGroupIds[idx];
      let end = idx + 1;
      while (end < rightSlotCount && visibleColumnGroupIds[end] === gid) {
        end += 1;
      }
      const span = end - idx;
      if (!gid) {
        runs.push({
          key: `empty-span-${idx}`,
          group: null,
          groupTools: [],
          colSpan: span,
          isContinuation: false,
          visibleToolCount: 0,
          isExpandedInTree: false,
        });
      } else {
        const grp = groupMetaMap.get(gid) ?? null;
        const sliceSlots = visibleSlots.slice(idx, end);
        const visibleToolCount = sliceSlots.filter((s) => s?.kind === 'tool').length;
        const hasSummaryOrHandle = sliceSlots.some(
          (s) => s?.kind === 'group-summary' || s?.kind === 'group-handle',
        );
        const isExpandedInTree = isTreeScheme && expandedGroupIds.has(gid);
        const isContinuation = idx === 0 && prevPageLastGroupId === gid;
        runs.push({
          key: `span-${gid}-${idx}`,
          group: grp,
          groupTools: matchedToolsByGroup.get(gid) ?? [],
          colSpan: span,
          isContinuation,
          visibleToolCount: hasSummaryOrHandle ? visibleToolCount : span,
          isExpandedInTree,
        });
      }
      idx = end;
    }
    return runs;
  }, [
    showGroupSpanRow,
    activeColumnCount,
    safePage,
    schemePages,
    rightSlotCount,
    visibleColumnGroupIds,
    groupMetaMap,
    visibleSlots,
    isTreeScheme,
    expandedGroupIds,
    matchedToolsByGroup,
  ]);

  // 当前过滤条件下的行级目标工具集合
  const targetToolsForRowCheckbox = useMemo<ToolboxTool[]>(() => {
    if (isSingleDimensionScheme || publishMode === 'by-tool') {
      if (isPlanAScheme && focusedGroupTab === 'overview') {
        return toolsCatalog.filter((t) =>
          matchedToolsByGroup.has(t.groupId),
        );
      }
      return filteredTools.length > 0 ? filteredTools : toolsCatalog;
    }
    const groupIds = new Set(filteredGroups.map((g) => g.id));
    return toolsCatalog.filter((tool) => groupIds.has(tool.groupId));
  }, [
    isSingleDimensionScheme,
    publishMode,
    isPlanAScheme,
    focusedGroupTab,
    toolsCatalog,
    matchedToolsByGroup,
    filteredTools,
    filteredGroups,
  ]);

  // 差异对比与保存按钮禁用逻辑
  const diff = useMemo(
    () => computeRelationDiff(savedRelations, draftRelations),
    [savedRelations, draftRelations],
  );

  const saveDisabled =
    isSaving ||
    !diff.isDirty ||
    (draftRelations.size === 0 && savedRelations.size === 0);

  function handlePublishModeChange(nextMode: PublishMode) {
    setPublishMode(nextMode);
    setPage(1);
    setFilterPopoverOpen(false);
    if (nextMode === 'by-group') {
      setGroupFilter('all');
      setTypeFilter('all');
      setSearchQuery('');
    }
  }

  function toggleToolCell(classId: string, toolId: string) {
    const key = makeRelationKey(classId, toolId);
    setDraftRelations((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    if (saveError) setSaveError(null);
  }

  function setToolCellOpen(classId: string, toolId: string, shouldOpen: boolean) {
    const key = makeRelationKey(classId, toolId);
    setDraftRelations((prev) => {
      const currentlyOpen = prev.has(key);
      if (currentlyOpen === shouldOpen) return prev;
      const next = new Set(prev);
      if (shouldOpen) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
    if (saveError) setSaveError(null);
  }

  function setClassGroupOpen(
    classId: string,
    toolsInGroup: ToolboxTool[],
    shouldOpen: boolean,
  ) {
    if (toolsInGroup.length === 0) return;
    setDraftRelations((prev) => {
      const next = new Set(prev);
      for (const tool of toolsInGroup) {
        const key = makeRelationKey(classId, tool.id);
        if (shouldOpen) {
          next.add(key);
        } else {
          next.delete(key);
        }
      }
      return next;
    });
    if (saveError) setSaveError(null);
  }

  function setGroupForAllClasses(
    toolsInGroup: ToolboxTool[],
    shouldOpen: boolean,
  ) {
    if (flatFilteredClasses.length === 0 || toolsInGroup.length === 0) return;
    setDraftRelations((prev) => {
      const next = new Set(prev);
      for (const cls of flatFilteredClasses) {
        for (const tool of toolsInGroup) {
          const key = makeRelationKey(cls.id, tool.id);
          if (shouldOpen) {
            next.add(key);
          } else {
            next.delete(key);
          }
        }
      }
      return next;
    });
    if (saveError) setSaveError(null);
  }

  function handleToggleExpandGroup(groupId: string) {
    setExpandedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      if (next.size === 0) {
        setPage(1);
      } else {
        const nextPages = buildTreePages(
          TOOLBOX_GROUPS,
          matchedToolsByGroup,
          next,
          PAGE_SIZE,
        );
        const targetIdx = nextPages.findIndex((cols) =>
          cols.some((c) => getSlotGroupId(c) === groupId),
        );
        if (targetIdx >= 0) {
          setPage(targetIdx + 1);
        }
      }
      return next;
    });
  }

  function handleExpandAllGroups() {
    const allIds = new Set(matchingGroupsInOrder.map((g) => g.id));
    setExpandedGroupIds(allIds);
    setPage(1);
  }

  function handleCollapseAllGroups() {
    setExpandedGroupIds(new Set());
    setPage(1);
  }

  function toggleGroupCell(
    classId: string,
    groupId: string,
    toolsOverride?: ToolboxTool[],
  ) {
    const toolsInGroup = toolsOverride ?? toolsByGroupMap.get(groupId) ?? [];
    if (toolsInGroup.length === 0) return;

    setDraftRelations((prev) => {
      const next = new Set(prev);
      const allOpen = toolsInGroup.every((tool) => next.has(makeRelationKey(classId, tool.id)));
      if (allOpen) {
        for (const tool of toolsInGroup) {
          next.delete(makeRelationKey(classId, tool.id));
        }
      } else {
        for (const tool of toolsInGroup) {
          next.add(makeRelationKey(classId, tool.id));
        }
      }
      return next;
    });
    if (saveError) setSaveError(null);
  }

  function getClassRowCheckState(classId: string): {
    checked: boolean;
    indeterminate: boolean;
    hasAnyOpen: boolean;
    openCount: number;
    totalCount: number;
  } {
    const totalCount = targetToolsForRowCheckbox.length;
    if (totalCount === 0) {
      return {
        checked: false,
        indeterminate: false,
        hasAnyOpen: false,
        openCount: 0,
        totalCount: 0,
      };
    }
    let openCount = 0;
    for (const tool of targetToolsForRowCheckbox) {
      if (draftRelations.has(makeRelationKey(classId, tool.id))) {
        openCount += 1;
      }
    }
    const hasAnyOpen = openCount > 0;
    return {
      checked: openCount === totalCount,
      indeterminate: openCount > 0 && openCount < totalCount,
      hasAnyOpen,
      openCount,
      totalCount,
    };
  }

  function handleToggleClassRow(classId: string, shouldSelectAll: boolean) {
    if (targetToolsForRowCheckbox.length === 0) return;
    setDraftRelations((prev) => {
      const next = new Set(prev);
      for (const tool of targetToolsForRowCheckbox) {
        const key = makeRelationKey(classId, tool.id);
        if (shouldSelectAll) {
          next.add(key);
        } else {
          next.delete(key);
        }
      }
      return next;
    });
    if (saveError) setSaveError(null);
  }

  function handleToggleToolColumn(tool: ToolboxTool) {
    if (flatFilteredClasses.length === 0) return;
    setDraftRelations((prev) => {
      const next = new Set(prev);
      const allOpen = flatFilteredClasses.every((cls) =>
        next.has(makeRelationKey(cls.id, tool.id)),
      );
      for (const cls of flatFilteredClasses) {
        const key = makeRelationKey(cls.id, tool.id);
        if (allOpen) {
          next.delete(key);
        } else {
          next.add(key);
        }
      }
      return next;
    });
    if (saveError) setSaveError(null);
  }

  function handleToggleGroupColumn(
    group: ToolboxGroup,
    toolsOverride?: ToolboxTool[],
  ) {
    const toolsInGroup = toolsOverride ?? toolsByGroupMap.get(group.id) ?? [];
    if (flatFilteredClasses.length === 0 || toolsInGroup.length === 0) return;
    setDraftRelations((prev) => {
      const next = new Set(prev);
      const allOpen = flatFilteredClasses.every((cls) =>
        toolsInGroup.every((tool) => next.has(makeRelationKey(cls.id, tool.id))),
      );
      for (const cls of flatFilteredClasses) {
        for (const tool of toolsInGroup) {
          const key = makeRelationKey(cls.id, tool.id);
          if (allOpen) {
            next.delete(key);
          } else {
            next.add(key);
          }
        }
      }
      return next;
    });
    if (saveError) setSaveError(null);
  }

  function getGroupCellState(
    classId: string,
    groupId: string,
    toolsOverride?: ToolboxTool[],
  ): { state: MatrixCellState; openCount: number; totalCount: number } {
    const toolsInGroup = toolsOverride ?? toolsByGroupMap.get(groupId) ?? [];
    if (toolsInGroup.length === 0) {
      return { state: 'closed', openCount: 0, totalCount: 0 };
    }
    let openCount = 0;
    for (const tool of toolsInGroup) {
      if (draftRelations.has(makeRelationKey(classId, tool.id))) {
        openCount += 1;
      }
    }
    if (openCount === 0) {
      return { state: 'closed', openCount: 0, totalCount: toolsInGroup.length };
    }
    if (openCount === toolsInGroup.length) {
      return { state: 'open', openCount, totalCount: toolsInGroup.length };
    }
    return { state: 'partial', openCount, totalCount: toolsInGroup.length };
  }

  async function handleSave() {
    if (saveDisabled) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const committed = await saveToolboxRelations(draftRelations, {
        simulateFailure: simulateSaveFailure,
      });
      setSavedRelations(committed);
      setDraftRelations(new Set(committed));
      onSavedSnapshotChange?.(committed.size);
      toast.add({
        type: 'success',
        title: '百宝箱开放关系已保存',
        description: `共关联 ${committed.size} 项班级开放权限（仅建立可见关系，未生成工具副本或新版本）`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '保存失败，请检查网络状态后重试。';
      setSaveError(message);
      toast.add({
        type: 'error',
        title: '保存失败',
        description: '已保留您当前的勾选状态，可直接点击重新保存。',
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleShareToolboxLink() {
    const url = `${window.location.origin}/toolbox/share`;
    navigator.clipboard?.writeText(url).catch(() => {});
    toast.add({
      type: 'success',
      title: '已复制百宝箱分享链接',
      description: '已建立开放关系的班级学生可通过此链接访问百宝箱工具',
    });
  }

  function handleRequestClose() {
    if (diff.isDirty) {
      setConfirmDiscardOpen(true);
    } else {
      onClose();
    }
  }

  const sourceSelectOptions: SelectOption[] = useMemo(
    () =>
      CLASS_SOURCES.map((item) => ({
        value: item.id,
        label: item.label,
        description: item.kind === 'school' ? '仅展示专业版班级' : '独立自建课程',
      })),
    [],
  );

  const semesterSelectOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: '全部学期' },
      ...SEMESTERS.map((sem) => ({ value: sem, label: sem })),
    ],
    [],
  );

  const ownerSelectOptions: SelectOption[] = useMemo(
    () => CLASS_OWNER_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
    [],
  );

  const groupFilterOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: '全部分组' },
      ...TOOLBOX_GROUPS.map((g) => ({ value: g.id, label: g.name })),
    ],
    [],
  );

  const typeFilterOptions: SelectOption[] = [
    { value: 'all', label: '全部类型' },
    { value: '个人', label: '个人' },
    { value: '系统', label: '系统' },
    { value: '他人共享', label: '他人共享' },
  ];

  const activeToolFilterCount =
    (groupFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0);

  const pagerControl = (
    <div className="rain-matrix-pager">
      <IconButton
        size="24/14"
        aria-label="上一页"
        disabled={safePage <= 1}
        icon={<ArrowLeftIcon />}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
      />
      <span className="rain-matrix-pager-text">
        {safePage}/{totalPages}
      </span>
      <IconButton
        size="24/14"
        aria-label="下一页"
        disabled={safePage >= totalPages}
        icon={<ArrowRightIcon />}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );

  const mergedLeftHeaderCell = (
    <th
      colSpan={2}
      className={isPlanCScheme ? 'rain-matrix-sticky-left-th' : undefined}
      rowSpan={
        isPlanCScheme
          ? 2
          : (activeScheme === 'scheme-2' || isPlanAScheme ? 2 : 1) +
            (showGroupSpanRow ? 1 : 0) +
            1
      }
      style={{
        height: isPlanCScheme
          ? 'calc(var(--rain-matrix-header-group-span-height) + var(--rain-matrix-header-column-height))'
          : activeScheme === 'scheme-2' || isPlanAScheme
            ? `calc(78px + ${
                showGroupSpanRow ? 'var(--rain-matrix-header-group-span-height) + ' : ''
              }var(--rain-matrix-header-column-height))`
            : `calc(var(--rain-matrix-header-control-height) + ${
                showGroupSpanRow ? 'var(--rain-matrix-header-group-span-height) + ' : ''
              }var(--rain-matrix-header-column-height))`,
      }}
    >
      <div className="rain-matrix-merged-header">
        {/* 左侧校源选择区：学校时展示校徽与学校名称，自建课时不展示学校信息 */}
        <div className="rain-matrix-source-zone">
          {!isSelfBuiltSource && (
            <span className="rain-matrix-school-crest" aria-hidden="true">
              <SchoolColorIcon size={14} />
            </span>
          )}
          <Select
            aria-label="班级来源"
            options={sourceSelectOptions}
            value={sourceId}
            onValueChange={(val) => {
              if (typeof val === 'string') {
                setSourceId(val);
              }
            }}
            appearance="filled"
            size={28}
            clearable={false}
            localRecipe={matrixHeaderSelectRecipe}
            className="min-w-0 flex-1"
          />
        </div>

        <span className="rain-matrix-header-vsep" aria-hidden="true" />

        {/* 右侧课程班级 + 学期 + 所属人 */}
        <div className="rain-matrix-class-filter-zone">
          <span
            style={{
              fontSize: 13,
              color: 'var(--rain-category-text-neutral-3)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            课程班级
          </span>

          <div style={{ width: 112, flexShrink: 0 }}>
            <Select
              aria-label="学期筛选"
              options={semesterSelectOptions}
              value={semester}
              onValueChange={(val) => {
                if (typeof val === 'string') {
                  setSemester(val);
                }
              }}
              appearance="filled"
              size={28}
              clearable={false}
              localRecipe={matrixHeaderSelectRecipe}
            />
          </div>

          <div style={{ width: 88, flexShrink: 0 }}>
            <Select
              aria-label="班级所属人"
              options={ownerSelectOptions}
              value={ownerRole}
              onValueChange={(val) => {
                if (typeof val === 'string') {
                  setOwnerRole(val);
                }
              }}
              appearance="filled"
              size={28}
              clearable={false}
              localRecipe={matrixHeaderSelectRecipe}
            />
          </div>
        </div>
      </div>
    </th>
  );

  const matrixPanelContent = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 矩阵表格主体区域 */}
      <div className="rain-matrix-body-wrap">
        {/* 方案三：表外策略前置栏（发布方式在表外确定，表内仅留从属筛选） */}
        {activeScheme === 'scheme-3' && (
          <div className="rain-matrix-strategy-bar" role="region" aria-label="工具发布方式选择">
            <div className="rain-matrix-strategy-left">
              <span className="rain-matrix-strategy-heading">工具发布方式</span>
              <div className="rain-matrix-strategy-cards" role="radiogroup" aria-label="发布方式">
                <button
                  type="button"
                  role="radio"
                  aria-checked={publishMode === 'by-tool'}
                  data-active={publishMode === 'by-tool' ? 'true' : 'false'}
                  className="rain-matrix-strategy-card"
                  onClick={() => handlePublishModeChange('by-tool')}
                >
                  <span className="rain-matrix-strategy-card-icon" aria-hidden="true">
                    <ToolboxIcon size={14} />
                  </span>
                  <span className="rain-matrix-strategy-card-text">
                    <span className="rain-matrix-strategy-card-title">按工具发布</span>
                    <span className="rain-matrix-strategy-card-desc">
                      下方可按分组与类型筛选单个工具
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={publishMode === 'by-group'}
                  data-active={publishMode === 'by-group' ? 'true' : 'false'}
                  className="rain-matrix-strategy-card"
                  onClick={() => handlePublishModeChange('by-group')}
                >
                  <span className="rain-matrix-strategy-card-icon" aria-hidden="true">
                    <FolderIcon size={14} />
                  </span>
                  <span className="rain-matrix-strategy-card-text">
                    <span className="rain-matrix-strategy-card-title">按分组发布</span>
                    <span className="rain-matrix-strategy-card-desc">
                      收起分组与类型筛选，勾选分组即开放整组
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <span className="rain-matrix-strategy-meta">
              {publishMode === 'by-tool'
                ? `当前匹配 ${filteredTools.length} 个工具（共 ${TOOLBOX_GROUPS.length} 个分组）`
                : `当前匹配 ${filteredGroups.length} 个应用分组 · 整组授权`}
            </span>
          </div>
        )}

        <div
          className="rain-matrix-table-wrapper"
          onMouseLeave={() => {
            setHoveredColSlot(null);
            setHoveredGroupState(null);
          }}
        >
          {/* 方案十二（方案 C）：表外固定分组快速跳转锚点 + 横向步进 + 状态/类型筛选与搜索条 */}
          {isPlanCScheme && (
            <div className="rain-matrix-hscroll-topbar" role="region" aria-label="分组快速跳转与筛选">
              <div className="rain-matrix-hscroll-jumps">
                <span className="rain-matrix-hscroll-jump-label">定位</span>
                <div className="rain-matrix-hscroll-jump-list">
                  {TOOLBOX_GROUPS.map((g) => {
                    const matchedCount = matchedToolsByGroup.get(g.id)?.length ?? 0;
                    const offsetCols = hScrollPlanCResult.groupOffsets.get(g.id);
                    const disabled = matchedCount === 0 || offsetCols === undefined;
                    const activeJumpId = hScrollActiveGroupId ?? matchingGroupsInOrder[0]?.id ?? null;
                    const isJumpActive = !disabled && activeJumpId === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        disabled={disabled}
                        title={g.name}
                        data-active={isJumpActive ? 'true' : 'false'}
                        className="rain-matrix-jump-pill"
                        style={{ '--group-accent': g.accentColor } as CSSProperties}
                        onClick={() => {
                          if (offsetCols === undefined) return;
                          setHScrollActiveGroupId(g.id);
                          hScrollContainerRef.current?.scrollTo({
                            left: offsetCols * 118,
                            behavior: 'smooth',
                          });
                        }}
                      >
                        <span className="rain-matrix-jump-dot" aria-hidden="true" />
                        <span>{g.shortName}</span>
                        <span className="rain-matrix-jump-count">{matchedCount}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rain-matrix-hscroll-controls">
                <div className="rain-matrix-hscroll-step-group" role="group" aria-label="横向滚动步进">
                  <IconButton
                    size="24/14"
                    aria-label="向左滚动 4 列"
                    icon={<ArrowLeftIcon />}
                    onClick={() => {
                      hScrollContainerRef.current?.scrollBy({ left: -472, behavior: 'smooth' });
                    }}
                  />
                  <IconButton
                    size="24/14"
                    aria-label="向右滚动 4 列"
                    icon={<ArrowRightIcon />}
                    onClick={() => {
                      hScrollContainerRef.current?.scrollBy({ left: 472, behavior: 'smooth' });
                    }}
                  />
                </div>

                <ToggleGroup
                  aria-label="开放状态筛选"
                  value={[openStatusFilter]}
                  spacing={0}
                  className="rain-matrix-mode-switch is-compact"
                  onValueChange={(vals) => {
                    const next = vals[0];
                    if (next === 'all' || next === 'has-open' || next === 'none-open') {
                      setOpenStatusFilter(next);
                    }
                  }}
                >
                  <ToggleGroupItem value="all" className="rain-matrix-mode-item">
                    全部
                  </ToggleGroupItem>
                  <ToggleGroupItem value="has-open" className="rain-matrix-mode-item">
                    已开
                  </ToggleGroupItem>
                  <ToggleGroupItem value="none-open" className="rain-matrix-mode-item">
                    未开
                  </ToggleGroupItem>
                </ToggleGroup>

                <div style={{ width: 88, flexShrink: 0 }}>
                  <Select
                    aria-label="工具类型筛选"
                    options={typeFilterOptions}
                    value={typeFilter}
                    onValueChange={(val) => {
                      if (typeof val === 'string') {
                        setTypeFilter(val);
                      }
                    }}
                    appearance="filled"
                    size={24}
                    clearable={false}
                    localRecipe={matrixHeaderSelectRecipe}
                  />
                </div>

                <div style={{ width: 136, flexShrink: 0 }}>
                  <Input
                    aria-label="搜索工具名称"
                    size={28}
                    clearable
                    leadingIcon={<SearchIcon size={14} />}
                    placeholder="搜索工具"
                    value={searchQuery}
                    onValueChange={(val) => setSearchQuery(val)}
                    className="rain-matrix-search-input"
                  />
                </div>
              </div>
            </div>
          )}

          <div
            ref={hScrollContainerRef}
            className={
              isPlanCScheme ? 'rain-matrix-scroll-body is-hscroll' : 'rain-matrix-scroll-body'
            }
            data-scheme={activeScheme}
            onScroll={
              isPlanCScheme
                ? (e) => {
                    const sl = e.currentTarget.scrollLeft;
                    let activeId: string | null = null;
                    for (const g of TOOLBOX_GROUPS) {
                      const offsetCols = hScrollPlanCResult.groupOffsets.get(g.id);
                      if (offsetCols === undefined) continue;
                      if (offsetCols * 118 <= sl + 36) {
                        activeId = g.id;
                      }
                    }
                    if (activeId && activeId !== hScrollActiveGroupId) {
                      setHScrollActiveGroupId(activeId);
                    }
                  }
                : undefined
            }
          >
            <table
              className="rain-matrix-table"
              data-dragging-paint={isDraggingPaint ? 'true' : undefined}
              style={
                isPlanCScheme ? { width: `${476 + rightSlotCount * 118}px` } : undefined
              }
            >
              <colgroup>
                <col style={{ width: 'var(--rain-matrix-course-col-width)' }} />
                <col style={{ width: 'var(--rain-matrix-class-col-width)' }} />
                {rightColWidths.map((colWidth, idx) => (
                  <col key={idx} style={{ width: colWidth }} />
                ))}
              </colgroup>

              <thead>
                {/* 第一层表头：根据设计方案呈现不同的工具控制区（方案十二控制条已移至表外吸顶） */}
                {isPlanCScheme ? null : activeScheme === 'scheme-2' ? (
                  <>
                    {/* 方案二上层：发布方式主控条 + 分页 */}
                    <tr>
                      {mergedLeftHeaderCell}
                      <th colSpan={rightSlotCount} style={{ height: 38 }}>
                        <div className="rain-matrix-tier-control">
                          <div className="rain-matrix-tier-control__left">
                            <span className="rain-matrix-tier-label">发布方式</span>
                            <ToggleGroup
                              aria-label="工具发布方式"
                              value={[publishMode]}
                              spacing={0}
                              className="rain-matrix-mode-switch is-tier"
                              onValueChange={(nextValues) => {
                                const next = nextValues[0];
                                if (next === 'by-tool' || next === 'by-group') {
                                  handlePublishModeChange(next);
                                }
                              }}
                            >
                              <ToggleGroupItem
                                value="by-tool"
                                className="rain-matrix-mode-item"
                              >
                                按工具发布
                              </ToggleGroupItem>
                              <ToggleGroupItem
                                value="by-group"
                                className="rain-matrix-mode-item"
                              >
                                按分组发布
                              </ToggleGroupItem>
                            </ToggleGroup>
                            {publishMode === 'by-tool' && (
                              <span className="rain-matrix-tier-scope-hint">
                                支持下方按应用分组与工具类型筛选
                              </span>
                            )}
                          </div>
                          {pagerControl}
                        </div>
                      </th>
                    </tr>

                    {/* 方案二下层：受上层发布方式控制的动态子筛选条 */}
                    <tr>
                      <th colSpan={rightSlotCount} style={{ height: 40 }}>
                        <div className="rain-matrix-tier-filter">
                          <div className="rain-matrix-tier-filter__left">
                            {publishMode === 'by-tool' ? (
                              <>
                                <span className="rain-matrix-tier-tree-connector" aria-hidden="true">
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path
                                      d="M2.5 2V7.5H9.5"
                                      stroke="currentColor"
                                      strokeWidth="1.4"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>

                                <div className="rain-matrix-tier-select-group">
                                  <div style={{ width: 122, flexShrink: 0 }}>
                                    <Select
                                      aria-label="应用分组筛选"
                                      options={groupFilterOptions}
                                      value={groupFilter}
                                      onValueChange={(val) => {
                                        if (typeof val === 'string') {
                                          setGroupFilter(val);
                                          setPage(1);
                                        }
                                      }}
                                      appearance="filled"
                                      size={24}
                                      clearable={false}
                                      localRecipe={matrixHeaderSelectRecipe}
                                    />
                                  </div>
                                  <span className="rain-matrix-dependent-divider" aria-hidden="true" />
                                  <div style={{ width: 96, flexShrink: 0 }}>
                                    <Select
                                      aria-label="工具类型筛选"
                                      options={typeFilterOptions}
                                      value={typeFilter}
                                      onValueChange={(val) => {
                                        if (typeof val === 'string') {
                                          setTypeFilter(val);
                                          setPage(1);
                                        }
                                      }}
                                      appearance="filled"
                                      size={24}
                                      clearable={false}
                                      localRecipe={matrixHeaderSelectRecipe}
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <span className="rain-matrix-tier-scope-hint">
                                整组授权模式 · 勾选分组列即开放组内全部工具（共 {filteredGroups.length} 组）
                              </span>
                            )}
                          </div>

                          <div style={{ width: 196, flexShrink: 0, marginLeft: 'auto' }}>
                            <Input
                              aria-label={
                                publishMode === 'by-tool' ? '搜索工具名称' : '搜索分组名称'
                              }
                              size={28}
                              clearable
                              leadingIcon={<SearchIcon size={14} />}
                              placeholder={
                                publishMode === 'by-tool' ? '搜索工具名称' : '搜索分组名称'
                              }
                              value={searchQuery}
                              onValueChange={(val) => {
                                setSearchQuery(val);
                                setPage(1);
                              }}
                              className="rain-matrix-search-input"
                            />
                          </div>
                        </div>
                      </th>
                    </tr>
                  </>
                ) : isPlanAScheme ? (
                  <>
                    {/* 方案十（方案 A）上层：分组导航条（全部总览 + 4字分组简称与工具计数） + 分页 */}
                    <tr>
                      {mergedLeftHeaderCell}
                      <th colSpan={rightSlotCount} style={{ height: 38 }}>
                        <div className="rain-matrix-tier-control is-plan-a">
                          <div
                            className="rain-matrix-group-nav-strip"
                            role="tablist"
                            aria-label="应用分组导航"
                          >
                            <button
                              type="button"
                              role="tab"
                              aria-selected={focusedGroupTab === 'overview'}
                              data-active={focusedGroupTab === 'overview' ? 'true' : 'false'}
                              className="rain-matrix-group-nav-pill"
                              onClick={() => {
                                setFocusedGroupTab('overview');
                                setOpenStatusFilter('all');
                                setPage(1);
                              }}
                            >
                              <span>总览</span>
                            </button>
                            {TOOLBOX_GROUPS.map((g) => {
                              const grpToolsCount = toolsByGroupMap.get(g.id)?.length ?? 0;
                              const isActive = focusedGroupTab === g.id;
                              return (
                                <button
                                  key={g.id}
                                  type="button"
                                  role="tab"
                                  title={g.name}
                                  aria-selected={isActive}
                                  data-active={isActive ? 'true' : 'false'}
                                  className="rain-matrix-group-nav-pill"
                                  style={{ '--group-accent': g.accentColor } as CSSProperties}
                                  onClick={() => {
                                    setFocusedGroupTab(g.id);
                                    setPage(1);
                                  }}
                                >
                                  <span className="rain-matrix-jump-dot" aria-hidden="true" />
                                  <span>{g.shortName}</span>
                                  <span className="rain-matrix-group-nav-count">
                                    {grpToolsCount}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {!isPlanAOverview && pagerControl}
                        </div>
                      </th>
                    </tr>

                    {/* 方案十（方案 A）下层：单组聚焦态提供「开放状态(带数量) / 类型 / 组内搜索」；总览态提示进组 */}
                    <tr>
                      <th colSpan={rightSlotCount} style={{ height: 40 }}>
                        <div className="rain-matrix-tier-filter">
                          <div className="rain-matrix-tier-filter__left" style={{ gap: 6 }}>
                            {!isPlanAOverview && (
                              <ToggleGroup
                                aria-label="组内工具开放状态筛选"
                                value={[openStatusFilter]}
                                spacing={0}
                                className="rain-matrix-mode-switch is-compact"
                                onValueChange={(vals) => {
                                  const next = vals[0];
                                  if (
                                    next === 'all' ||
                                    next === 'has-open' ||
                                    next === 'none-open'
                                  ) {
                                    setOpenStatusFilter(next);
                                    setPage(1);
                                  }
                                }}
                              >
                                <ToggleGroupItem value="all" className="rain-matrix-mode-item">
                                  全部 {planAGroupStatusCounts.all}
                                </ToggleGroupItem>
                                <ToggleGroupItem value="has-open" className="rain-matrix-mode-item">
                                  已开 {planAGroupStatusCounts.hasOpen}
                                </ToggleGroupItem>
                                <ToggleGroupItem value="none-open" className="rain-matrix-mode-item">
                                  未开 {planAGroupStatusCounts.noneOpen}
                                </ToggleGroupItem>
                              </ToggleGroup>
                            )}

                            <div style={{ width: 92, flexShrink: 0 }}>
                              <Select
                                aria-label="工具类型筛选"
                                options={typeFilterOptions}
                                value={typeFilter}
                                onValueChange={(val) => {
                                  if (typeof val === 'string') {
                                    setTypeFilter(val);
                                    setPage(1);
                                  }
                                }}
                                appearance="filled"
                                size={24}
                                clearable={false}
                                localRecipe={matrixHeaderSelectRecipe}
                              />
                            </div>

                            {isPlanAOverview ? (
                              <span className="rain-matrix-panoramic-hint">
                                点击列头「进组」或上方页签，进入单组并固定左侧整组总控列
                              </span>
                            ) : filteredTools.length === 0 ? (
                              <Button
                                variant="text"
                                size="compact"
                                onClick={() => {
                                  setOpenStatusFilter('all');
                                  setTypeFilter('all');
                                  setSearchQuery('');
                                  setPage(1);
                                }}
                              >
                                重置组内筛选
                              </Button>
                            ) : null}
                          </div>

                          <div style={{ width: 176, flexShrink: 0, marginLeft: 'auto' }}>
                            <Input
                              aria-label={
                                isPlanAOverview
                                  ? '搜索分组或工具名称'
                                  : `在${focusedPlanAGroup.name}中搜索工具`
                              }
                              size={28}
                              clearable
                              leadingIcon={<SearchIcon size={14} />}
                              placeholder={
                                isPlanAOverview
                                  ? '搜索分组或工具'
                                  : `在「${focusedPlanAGroup.name}」中搜索`
                              }
                              value={searchQuery}
                              onValueChange={(val) => {
                                setSearchQuery(val);
                                setPage(1);
                              }}
                              className="rain-matrix-search-input"
                            />
                          </div>
                        </div>
                      </th>
                    </tr>
                  </>
                ) : (
                  <tr>
                    {mergedLeftHeaderCell}

                    <th
                      colSpan={rightSlotCount}
                      style={{ height: 'var(--rain-matrix-header-control-height)' }}
                    >
                      {activeScheme === 'scheme-1' && (
                        <div className="rain-matrix-toolbar-row">
                          <div className="rain-matrix-toolbar-filters" style={{ gap: 8 }}>
                            <Tooltip
                              text={
                                publishMode === 'by-tool'
                                  ? '当前：按工具发布（支持按分组与类型筛选单个工具）'
                                  : '当前：按分组发布（已收起分组与类型筛选，勾选分组即开放组内全部工具）'
                              }
                              portal
                            >
                              <div>
                                <ToggleGroup
                                  aria-label="工具发布方式"
                                  value={[publishMode]}
                                  spacing={0}
                                  className="rain-matrix-mode-switch"
                                  onValueChange={(nextValues) => {
                                    const next = nextValues[0];
                                    if (next === 'by-tool' || next === 'by-group') {
                                      handlePublishModeChange(next);
                                    }
                                  }}
                                >
                                  <ToggleGroupItem
                                    value="by-tool"
                                    className="rain-matrix-mode-item"
                                  >
                                    按工具
                                  </ToggleGroupItem>
                                  <ToggleGroupItem
                                    value="by-group"
                                    className="rain-matrix-mode-item"
                                  >
                                    按分组
                                  </ToggleGroupItem>
                                </ToggleGroup>
                              </div>
                            </Tooltip>

                            {publishMode === 'by-tool' ? (
                              <div
                                className="rain-matrix-dependent-filters"
                                role="group"
                                aria-label="按工具发布下的分组与类型筛选"
                              >
                                <div style={{ width: 108, flexShrink: 0 }}>
                                  <Select
                                    aria-label="应用分组筛选"
                                    options={groupFilterOptions}
                                    value={groupFilter}
                                    onValueChange={(val) => {
                                      if (typeof val === 'string') {
                                        setGroupFilter(val);
                                        setPage(1);
                                      }
                                    }}
                                    appearance="filled"
                                    size={24}
                                    clearable={false}
                                    localRecipe={matrixHeaderSelectRecipe}
                                  />
                                </div>

                                <span className="rain-matrix-dependent-divider" aria-hidden="true" />

                                <div style={{ width: 86, flexShrink: 0 }}>
                                  <Select
                                    aria-label="工具类型筛选"
                                    options={typeFilterOptions}
                                    value={typeFilter}
                                    onValueChange={(val) => {
                                      if (typeof val === 'string') {
                                        setTypeFilter(val);
                                        setPage(1);
                                      }
                                    }}
                                    appearance="filled"
                                    size={24}
                                    clearable={false}
                                    localRecipe={matrixHeaderSelectRecipe}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="rain-matrix-panoramic-hint">
                                整组授权 · 勾选分组列开放全组工具
                              </span>
                            )}
                          </div>

                          <div className="rain-matrix-toolbar-right">
                            <div
                              style={{
                                width: publishMode === 'by-tool' ? 136 : 180,
                                flexShrink: 0,
                              }}
                            >
                              <Input
                                aria-label={
                                  publishMode === 'by-tool' ? '搜索工具名称' : '搜索分组名称'
                                }
                                size={28}
                                clearable
                                leadingIcon={<SearchIcon size={14} />}
                                placeholder={
                                  publishMode === 'by-tool' ? '搜索工具' : '搜索分组名称'
                                }
                                value={searchQuery}
                                onValueChange={(val) => {
                                  setSearchQuery(val);
                                  setPage(1);
                                }}
                                className="rain-matrix-search-input"
                              />
                            </div>
                            {pagerControl}
                          </div>
                        </div>
                      )}

                      {activeScheme === 'scheme-3' && (
                        <div className="rain-matrix-toolbar-row">
                          <div className="rain-matrix-toolbar-filters" style={{ gap: 8 }}>
                            {publishMode === 'by-tool' ? (
                              <>
                                <div style={{ width: 132, flexShrink: 0 }}>
                                  <Select
                                    aria-label="应用分组筛选"
                                    options={groupFilterOptions}
                                    value={groupFilter}
                                    onValueChange={(val) => {
                                      if (typeof val === 'string') {
                                        setGroupFilter(val);
                                        setPage(1);
                                      }
                                    }}
                                    appearance="filled"
                                    size={28}
                                    clearable={false}
                                    localRecipe={matrixHeaderSelectRecipe}
                                  />
                                </div>

                                <span className="rain-matrix-dependent-divider" aria-hidden="true" />

                                <div style={{ width: 106, flexShrink: 0 }}>
                                  <Select
                                    aria-label="工具类型筛选"
                                    options={typeFilterOptions}
                                    value={typeFilter}
                                    onValueChange={(val) => {
                                      if (typeof val === 'string') {
                                        setTypeFilter(val);
                                        setPage(1);
                                      }
                                    }}
                                    appearance="filled"
                                    size={28}
                                    clearable={false}
                                    localRecipe={matrixHeaderSelectRecipe}
                                  />
                                </div>
                              </>
                            ) : (
                              <span className="rain-matrix-panoramic-hint">
                                当前共 {filteredGroups.length} 个应用分组 · 勾选列格即可批量授权
                              </span>
                            )}
                          </div>

                          <div className="rain-matrix-toolbar-right">
                            <div style={{ width: 204, flexShrink: 0 }}>
                              <Input
                                aria-label={
                                  publishMode === 'by-tool' ? '搜索工具名称' : '搜索分组名称'
                                }
                                size={28}
                                clearable
                                leadingIcon={<SearchIcon size={14} />}
                                placeholder={
                                  publishMode === 'by-tool' ? '搜索工具名称' : '搜索分组名称'
                                }
                                value={searchQuery}
                                onValueChange={(val) => {
                                  setSearchQuery(val);
                                  setPage(1);
                                }}
                                className="rain-matrix-search-input"
                              />
                            </div>
                            {pagerControl}
                          </div>
                        </div>
                      )}

                      {activeScheme === 'scheme-4' && (
                        <div className="rain-matrix-toolbar-row">
                          <div className="rain-matrix-toolbar-filters" style={{ gap: 8 }}>
                            <ToggleGroup
                              aria-label="工具发布方式"
                              value={[publishMode]}
                              spacing={0}
                              className="rain-matrix-mode-switch"
                              onValueChange={(nextValues) => {
                                const next = nextValues[0];
                                if (next === 'by-tool' || next === 'by-group') {
                                  handlePublishModeChange(next);
                                }
                              }}
                            >
                              <ToggleGroupItem
                                value="by-tool"
                                className="rain-matrix-mode-item with-icon"
                              >
                                <ToolboxIcon size={13} aria-hidden="true" />
                                <span>按工具</span>
                              </ToggleGroupItem>
                              <ToggleGroupItem
                                value="by-group"
                                className="rain-matrix-mode-item with-icon"
                              >
                                <FolderIcon size={13} aria-hidden="true" />
                                <span>按分组</span>
                              </ToggleGroupItem>
                            </ToggleGroup>

                            {publishMode === 'by-tool' ? (
                              <Popover.Root
                                open={filterPopoverOpen}
                                onOpenChange={setFilterPopoverOpen}
                              >
                                <Popover.Trigger
                                  render={
                                    <button
                                      type="button"
                                      data-filtered={activeToolFilterCount > 0 ? 'true' : 'false'}
                                      className="rain-matrix-filter-chip"
                                    >
                                      <FilterIcon size={13} aria-hidden="true" />
                                      <span>
                                        {groupFilter !== 'all' && typeFilter === 'all'
                                          ? groupNameMap.get(groupFilter) ?? '分组筛选'
                                          : typeFilter !== 'all' && groupFilter === 'all'
                                            ? `类型：${typeFilter}`
                                            : activeToolFilterCount > 0
                                              ? '已筛选'
                                              : '分组 / 类型'}
                                      </span>
                                      {activeToolFilterCount > 0 && (
                                        <span className="rain-matrix-filter-badge">
                                          {activeToolFilterCount}
                                        </span>
                                      )}
                                    </button>
                                  }
                                />
                                <Popover.Content
                                  width={308}
                                  positionerProps={{
                                    side: 'bottom',
                                    align: 'start',
                                    sideOffset: 6,
                                  }}
                                >
                                  <div className="rain-matrix-filter-popover">
                                    <div>
                                      <div className="rain-matrix-filter-section-title">
                                        应用分组
                                      </div>
                                      <div className="rain-matrix-filter-tag-grid">
                                        {groupFilterOptions.map((opt) => {
                                          const cnt =
                                            opt.value === 'all'
                                              ? toolsCatalog.length
                                              : toolsByGroupMap.get(String(opt.value))?.length ?? 0;
                                          return (
                                            <button
                                              key={String(opt.value)}
                                              type="button"
                                              data-active={groupFilter === opt.value ? 'true' : 'false'}
                                              className="rain-matrix-filter-tag-btn"
                                              onClick={() => {
                                                setGroupFilter(String(opt.value));
                                                setPage(1);
                                              }}
                                            >
                                              {opt.label} ({cnt})
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    <div>
                                      <div className="rain-matrix-filter-section-title">
                                        工具类型
                                      </div>
                                      <div className="rain-matrix-filter-tag-grid">
                                        {typeFilterOptions.map((opt) => (
                                          <button
                                            key={String(opt.value)}
                                            type="button"
                                            data-active={typeFilter === opt.value ? 'true' : 'false'}
                                            className="rain-matrix-filter-tag-btn"
                                            onClick={() => {
                                              setTypeFilter(String(opt.value));
                                              setPage(1);
                                            }}
                                          >
                                            {opt.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="rain-matrix-filter-popover-footer">
                                      <span>当前匹配 {filteredTools.length} 个工具</span>
                                      <Button
                                        variant="text"
                                        size="compact"
                                        disabled={activeToolFilterCount === 0}
                                        onClick={() => {
                                          setGroupFilter('all');
                                          setTypeFilter('all');
                                          setPage(1);
                                        }}
                                      >
                                        重置筛选
                                      </Button>
                                    </div>
                                  </div>
                                </Popover.Content>
                              </Popover.Root>
                            ) : (
                              <span className="rain-matrix-panoramic-hint">
                                整组模式 · {filteredGroups.length} 个分组
                              </span>
                            )}
                          </div>

                          <div className="rain-matrix-toolbar-right">
                            <div style={{ width: 176, flexShrink: 0 }}>
                              <Input
                                aria-label={
                                  publishMode === 'by-tool' ? '搜索工具名称' : '搜索分组名称'
                                }
                                size={28}
                                clearable
                                leadingIcon={<SearchIcon size={14} />}
                                placeholder={
                                  publishMode === 'by-tool' ? '搜索工具名称' : '搜索分组名称'
                                }
                                value={searchQuery}
                                onValueChange={(val) => {
                                  setSearchQuery(val);
                                  setPage(1);
                                }}
                                className="rain-matrix-search-input"
                              />
                            </div>
                            {pagerControl}
                          </div>
                        </div>
                      )}
                      {activeScheme === 'scheme-5' && (
                        <div className="rain-matrix-toolbar-row">
                          <div className="rain-matrix-toolbar-filters" style={{ gap: 8 }}>
                            <div
                              className="rain-matrix-dependent-filters"
                              role="group"
                              aria-label="应用分组与工具类型筛选"
                            >
                              <div style={{ width: 122, flexShrink: 0 }}>
                                <Select
                                  aria-label="应用分组筛选"
                                  options={groupFilterOptions}
                                  value={groupFilter}
                                  onValueChange={(val) => {
                                    if (typeof val === 'string') {
                                      setGroupFilter(val);
                                      setPage(1);
                                    }
                                  }}
                                  appearance="filled"
                                  size={24}
                                  clearable={false}
                                  localRecipe={matrixHeaderSelectRecipe}
                                />
                              </div>

                              <span className="rain-matrix-dependent-divider" aria-hidden="true" />

                              <div style={{ width: 96, flexShrink: 0 }}>
                                <Select
                                  aria-label="工具类型筛选"
                                  options={typeFilterOptions}
                                  value={typeFilter}
                                  onValueChange={(val) => {
                                    if (typeof val === 'string') {
                                      setTypeFilter(val);
                                      setPage(1);
                                    }
                                  }}
                                  appearance="filled"
                                  size={24}
                                  clearable={false}
                                  localRecipe={matrixHeaderSelectRecipe}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="rain-matrix-toolbar-right">
                            <div style={{ width: 196, flexShrink: 0 }}>
                              <Input
                                aria-label="搜索工具名称"
                                size={28}
                                clearable
                                leadingIcon={<SearchIcon size={14} />}
                                placeholder="搜索工具名称"
                                value={searchQuery}
                                onValueChange={(val) => {
                                  setSearchQuery(val);
                                  setPage(1);
                                }}
                                className="rain-matrix-search-input"
                              />
                            </div>
                            {pagerControl}
                          </div>
                        </div>
                      )}

                      {isTreeScheme && (
                        <div className="rain-matrix-toolbar-row">
                          <div className="rain-matrix-toolbar-filters" style={{ gap: 6 }}>
                            <div
                              className="rain-matrix-dependent-filters"
                              role="group"
                              aria-label="应用分组与工具类型筛选"
                            >
                              <div style={{ width: 108, flexShrink: 0 }}>
                                <Select
                                  aria-label="应用分组筛选"
                                  options={groupFilterOptions}
                                  value={groupFilter}
                                  onValueChange={(val) => {
                                    if (typeof val === 'string') {
                                      setGroupFilter(val);
                                      setPage(1);
                                    }
                                  }}
                                  appearance="filled"
                                  size={24}
                                  clearable={false}
                                  localRecipe={matrixHeaderSelectRecipe}
                                />
                              </div>

                              <span className="rain-matrix-dependent-divider" aria-hidden="true" />

                              <div style={{ width: 84, flexShrink: 0 }}>
                                <Select
                                  aria-label="工具类型筛选"
                                  options={typeFilterOptions}
                                  value={typeFilter}
                                  onValueChange={(val) => {
                                    if (typeof val === 'string') {
                                      setTypeFilter(val);
                                      setPage(1);
                                    }
                                  }}
                                  appearance="filled"
                                  size={24}
                                  clearable={false}
                                  localRecipe={matrixHeaderSelectRecipe}
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              className="rain-matrix-tree-all-btn"
                              onClick={
                                expandedGroupIds.size === matchingGroupsInOrder.length &&
                                matchingGroupsInOrder.length > 0
                                  ? handleCollapseAllGroups
                                  : handleExpandAllGroups
                              }
                            >
                              {expandedGroupIds.size === matchingGroupsInOrder.length &&
                              matchingGroupsInOrder.length > 0
                                ? '全部收起'
                                : expandedGroupIds.size > 0
                                  ? '展开全部'
                                  : '全部展开'}
                            </button>
                            {expandedGroupIds.size > 0 &&
                              expandedGroupIds.size < matchingGroupsInOrder.length && (
                                <button
                                  type="button"
                                  className="rain-matrix-tree-all-btn is-secondary"
                                  onClick={handleCollapseAllGroups}
                                >
                                  全部收起
                                </button>
                              )}
                          </div>

                          <div className="rain-matrix-toolbar-right">
                            <div
                              style={{
                                width: isTreeCollapsedPanoramic ? 176 : 132,
                                flexShrink: 0,
                              }}
                            >
                              <Input
                                aria-label="搜索分组或工具名称"
                                size={28}
                                clearable
                                leadingIcon={<SearchIcon size={14} />}
                                placeholder="搜索分组/工具"
                                value={searchQuery}
                                onValueChange={(val) => {
                                  setSearchQuery(val);
                                  setPage(1);
                                }}
                                className="rain-matrix-search-input"
                              />
                            </div>
                            {!isTreeCollapsedPanoramic && pagerControl}
                          </div>
                        </div>
                      )}

                      {(isPureBrushScheme || isHandleScheme) && (
                        <div className="rain-matrix-toolbar-row">
                          <div className="rain-matrix-toolbar-filters" style={{ gap: 8 }}>
                            <div
                              className="rain-matrix-dependent-filters"
                              role="group"
                              aria-label="应用分组与工具类型筛选"
                            >
                              <div style={{ width: 122, flexShrink: 0 }}>
                                <Select
                                  aria-label="应用分组筛选"
                                  options={groupFilterOptions}
                                  value={groupFilter}
                                  onValueChange={(val) => {
                                    if (typeof val === 'string') {
                                      setGroupFilter(val);
                                      setPage(1);
                                    }
                                  }}
                                  appearance="filled"
                                  size={24}
                                  clearable={false}
                                  localRecipe={matrixHeaderSelectRecipe}
                                />
                              </div>

                              <span className="rain-matrix-dependent-divider" aria-hidden="true" />

                              <div style={{ width: 96, flexShrink: 0 }}>
                                <Select
                                  aria-label="工具类型筛选"
                                  options={typeFilterOptions}
                                  value={typeFilter}
                                  onValueChange={(val) => {
                                    if (typeof val === 'string') {
                                      setTypeFilter(val);
                                      setPage(1);
                                    }
                                  }}
                                  appearance="filled"
                                  size={24}
                                  clearable={false}
                                  localRecipe={matrixHeaderSelectRecipe}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="rain-matrix-toolbar-right">
                            <div style={{ width: 196, flexShrink: 0 }}>
                              <Input
                                aria-label="搜索工具名称"
                                size={28}
                                clearable
                                leadingIcon={<SearchIcon size={14} />}
                                placeholder="搜索工具名称"
                                value={searchQuery}
                                onValueChange={(val) => {
                                  setSearchQuery(val);
                                  setPage(1);
                                }}
                                className="rain-matrix-search-input"
                              />
                            </div>
                            {pagerControl}
                          </div>
                        </div>
                      )}

                      {isPanoramicScheme && (
                        <div className="rain-matrix-toolbar-row">
                          <div className="rain-matrix-toolbar-filters" style={{ gap: 8 }}>
                            <div
                              className="rain-matrix-dependent-filters"
                              role="group"
                              aria-label="工具类型筛选"
                            >
                              <div style={{ width: 100, flexShrink: 0 }}>
                                <Select
                                  aria-label="工具类型筛选"
                                  options={typeFilterOptions}
                                  value={typeFilter}
                                  onValueChange={(val) => {
                                    if (typeof val === 'string') {
                                      setTypeFilter(val);
                                      setPage(1);
                                    }
                                  }}
                                  appearance="filled"
                                  size={24}
                                  clearable={false}
                                  localRecipe={matrixHeaderSelectRecipe}
                                />
                              </div>
                            </div>
                            <span className="rain-matrix-panoramic-hint">
                              6大分组一屏总览 · 点「▾」原地勾选组内单工具
                            </span>
                          </div>

                          <div className="rain-matrix-toolbar-right">
                            <div style={{ width: 186, flexShrink: 0 }}>
                              <Input
                                aria-label="搜索分组或工具名称"
                                size={28}
                                clearable
                                leadingIcon={<SearchIcon size={14} />}
                                placeholder="搜索分组或工具"
                                value={searchQuery}
                                onValueChange={(val) => {
                                  setSearchQuery(val);
                                  setPage(1);
                                }}
                                className="rain-matrix-search-input"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {isPlanBScheme && (
                        <div className="rain-matrix-toolbar-row">
                          <div className="rain-matrix-toolbar-filters" style={{ gap: 8 }}>
                            <div
                              className="rain-matrix-dependent-filters"
                              role="group"
                              aria-label="工具类型筛选"
                            >
                              <div style={{ width: 100, flexShrink: 0 }}>
                                <Select
                                  aria-label="工具类型筛选"
                                  options={typeFilterOptions}
                                  value={typeFilter}
                                  onValueChange={(val) => {
                                    if (typeof val === 'string') {
                                      setTypeFilter(val);
                                      setPage(1);
                                    }
                                  }}
                                  appearance="filled"
                                  size={24}
                                  clearable={false}
                                  localRecipe={matrixHeaderSelectRecipe}
                                />
                              </div>
                            </div>
                            <span className="rain-matrix-panoramic-hint">
                              恒定6列免翻页 · 点「▾」或「配置」打开百级工具检索面板
                            </span>
                          </div>

                          <div className="rain-matrix-toolbar-right">
                            <div style={{ width: 176, flexShrink: 0 }}>
                              <Input
                                aria-label="搜索分组或工具名称"
                                size={28}
                                clearable
                                leadingIcon={<SearchIcon size={14} />}
                                placeholder="搜索分组或工具"
                                value={searchQuery}
                                onValueChange={(val) => {
                                  setSearchQuery(val);
                                  setPage(1);
                                }}
                                className="rain-matrix-search-input"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </th>
                  </tr>
                )}

                {/* 中间分组归属条：在方案五/七/九、方案六展开态及按工具模式下将同组列在顶部可视化打包 */}
                {showGroupSpanRow && (
                  <tr className="rain-matrix-group-span-row">
                    {activeColumnCount === 0 ? (
                      <th
                        colSpan={rightSlotCount}
                        data-empty-slot="true"
                        className="rain-matrix-group-span-empty"
                        aria-hidden="true"
                      />
                    ) : (
                      groupSpanRuns.map((run, runIdx) => {
                        if (!run.group) {
                          return (
                            <th
                              key={run.key}
                              colSpan={run.colSpan}
                              data-empty-slot="true"
                              className="rain-matrix-group-span-empty"
                              aria-hidden="true"
                            />
                          );
                        }
                        const runGroup = run.group;
                        const isSpanHovered = hoveredGroupState?.groupId === runGroup.id;
                        const isNarrowSpan = run.colSpan === 1 && !isPlanCScheme;
                        return (
                          <th
                            key={run.key}
                            colSpan={run.colSpan}
                            data-group-start={runIdx > 0 ? 'true' : undefined}
                            data-group-hovered={isSpanHovered ? 'true' : undefined}
                            data-narrow-span={isNarrowSpan ? 'true' : undefined}
                            className="rain-matrix-group-span-cell"
                            style={{ '--group-accent': runGroup.accentColor } as CSSProperties}
                            onMouseEnter={() => {
                              setHoveredColSlot(null);
                              setHoveredGroupState({ groupId: runGroup.id, mode: 'span' });
                            }}
                          >
                            <div className="rain-matrix-group-span-inner">
                              {isPlanCScheme ? (
                                <div className="rain-matrix-group-span-sticky">
                                  <span className="rain-matrix-group-span-dot" aria-hidden="true" />
                                  <span className="rain-matrix-group-span-name" title={runGroup.name}>
                                    {runGroup.name}
                                  </span>
                                  <span className="rain-matrix-group-span-meta">
                                    1总控 + {run.visibleToolCount}工具
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <span className="rain-matrix-group-span-dot" aria-hidden="true" />
                                  <span className="rain-matrix-group-span-name" title={runGroup.name}>
                                    {runGroup.name}
                                  </span>

                                  {isPlanAScheme && !isPlanAOverview ? (
                                    <div className="rain-matrix-group-span-actions">
                                      <span className="rain-matrix-group-span-meta">
                                        {filteredTools.length === 0
                                          ? `固定总控 + 0 / 共${focusedPlanAAllGroupTools.length}项`
                                          : `第 ${(safePage - 1) * (PAGE_SIZE - 1) + 1}–${Math.min(
                                              filteredTools.length,
                                              safePage * (PAGE_SIZE - 1),
                                            )} / 共 ${filteredTools.length} 项`}
                                      </span>
                                      <button
                                        type="button"
                                        className="rain-matrix-span-back-btn"
                                        onClick={() => {
                                          setFocusedGroupTab('overview');
                                          setOpenStatusFilter('all');
                                          setPage(1);
                                        }}
                                      >
                                        ← 返回总览
                                      </button>
                                    </div>
                                  ) : isPureBrushScheme ? (
                                    <div className="rain-matrix-group-span-actions">
                                      <span className="rain-matrix-group-span-meta">
                                        {run.isContinuation
                                          ? `续 · ${run.visibleToolCount}项`
                                          : `${run.groupTools.length}工具`}
                                      </span>
                                      <GroupSpanBatchPopover
                                        group={runGroup}
                                        toolsInGroup={run.groupTools}
                                        classes={flatFilteredClasses}
                                        compact={isNarrowSpan}
                                        getClassGroupState={(classId) =>
                                          getGroupCellState(classId, runGroup.id, run.groupTools)
                                        }
                                        onToggleClassGroup={(classId) =>
                                          toggleGroupCell(classId, runGroup.id, run.groupTools)
                                        }
                                        onSetAllClassesGroup={(shouldOpen) =>
                                          setGroupForAllClasses(run.groupTools, shouldOpen)
                                        }
                                      />
                                    </div>
                                  ) : isTreeScheme && run.isExpandedInTree ? (
                                    <div className="rain-matrix-group-span-actions">
                                      <span className="rain-matrix-group-span-meta">
                                        {run.isContinuation
                                          ? `续 · ${run.visibleToolCount}项`
                                          : `${run.visibleToolCount}工具`}
                                      </span>
                                      <button
                                        type="button"
                                        className="rain-matrix-span-collapse-btn"
                                        onClick={() => handleToggleExpandGroup(runGroup.id)}
                                      >
                                        − 收起
                                      </button>
                                    </div>
                                  ) : isInterleavedScheme && run.isContinuation ? (
                                    <div className="rain-matrix-group-span-actions">
                                      <span className="rain-matrix-group-span-meta">
                                        续 · {run.visibleToolCount}项
                                      </span>
                                      <button
                                        type="button"
                                        className="rain-matrix-span-jump-btn"
                                        onClick={() => {
                                          const targetIdx = schemePages.findIndex((cols) =>
                                            cols.some(
                                              (c) => c.key === `group-summary-${runGroup.id}`,
                                            ),
                                          );
                                          if (targetIdx >= 0) {
                                            setPage(targetIdx + 1);
                                          }
                                        }}
                                      >
                                        ↩ 回到总控列
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="rain-matrix-group-span-meta">
                                      {run.isContinuation
                                        ? `续 · ${run.visibleToolCount}项`
                                        : isInterleavedScheme || (isTreeScheme && run.isExpandedInTree)
                                          ? `1总控 + ${run.visibleToolCount}工具`
                                          : isHandleScheme
                                            ? `1手柄 + ${run.visibleToolCount}工具`
                                            : isTreeScheme
                                              ? '已折叠'
                                              : `${run.visibleToolCount}个工具`}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </th>
                        );
                      })
                    )}
                  </tr>
                )}

                {/* 最底层列头：统一基于 visibleSlots 渲染工具、折叠组、总控、极窄控制柄等列 */}
                <tr>
                  {visibleSlots.map((slot, slotIdx) => {
                    if (!slot) {
                      return (
                        <th
                          key={`empty-slot-header-${slotIdx}`}
                          data-empty-slot="true"
                          style={{ height: 'var(--rain-matrix-header-column-height)' }}
                          aria-label="空列"
                        />
                      );
                    }
                    const colGroupId = getSlotGroupId(slot);
                    const isGroupStart =
                      slotIdx > 0 && visibleColumnGroupIds[slotIdx - 1] !== colGroupId;

                    if (slot.kind === 'tool') {
                      const groupName = groupNameMap.get(slot.tool.groupId) ?? '';
                      const isClusterHovered =
                        hoveredGroupState?.groupId === slot.tool.groupId &&
                        (hoveredGroupState.mode === 'cluster' ||
                          hoveredGroupState.mode === 'span');
                      let toolOpenClassCount = 0;
                      for (const cls of flatFilteredClasses) {
                        if (draftRelations.has(makeRelationKey(cls.id, slot.tool.id))) {
                          toolOpenClassCount += 1;
                        }
                      }
                      return (
                        <th
                          key={slot.key}
                          data-col-kind="tool"
                          data-group-start={isGroupStart ? 'true' : undefined}
                          data-col-hovered={hoveredColSlot === slotIdx ? 'true' : undefined}
                          data-group-hovered={isClusterHovered ? 'true' : undefined}
                          onMouseEnter={() => {
                            setHoveredColSlot(slotIdx);
                            setHoveredGroupState({
                              groupId: slot.tool.groupId,
                              mode: 'child',
                            });
                          }}
                          style={{ height: 'var(--rain-matrix-header-column-height)' }}
                        >
                          <div className="rain-matrix-col-header-inner">
                            <ToolDetailHoverBubble
                              tool={slot.tool}
                              groupName={groupName}
                              openClassCount={toolOpenClassCount}
                              totalClassCount={flatFilteredClasses.length}
                              onToggleToolColumn={() => handleToggleToolColumn(slot.tool)}
                            />
                          </div>
                        </th>
                      );
                    }

                    const GroupFolderIcon =
                      GROUP_ICONS[(slot.group.iconIndex - 1) % GROUP_ICONS.length];
                    const isClusterHovered =
                      hoveredGroupState?.groupId === slot.group.id &&
                      (hoveredGroupState.mode === 'cluster' ||
                        hoveredGroupState.mode === 'span');
                    const isParentLinked =
                      hoveredGroupState?.groupId === slot.group.id &&
                      hoveredGroupState.mode === 'child' &&
                      (slot.kind === 'group-summary' || slot.kind === 'group-handle');
                    const isPinnedMaster =
                      isPlanAScheme && !isPlanAOverview && slotIdx === 0 && slot.kind === 'group-summary';

                    let fullyOpenClassCount = 0;
                    let anyOpenClassCount = 0;
                    for (const cls of flatFilteredClasses) {
                      const st = getGroupCellState(cls.id, slot.group.id, slot.groupTools);
                      if (st.state === 'open') fullyOpenClassCount += 1;
                      if (st.openCount > 0) anyOpenClassCount += 1;
                    }

                    const variant =
                      slot.kind === 'group-summary'
                        ? 'summary'
                        : slot.kind === 'group-collapsed'
                          ? 'collapsed-tree'
                          : slot.kind === 'group-panoramic'
                            ? 'panoramic'
                            : slot.kind === 'group-handle'
                              ? 'handle'
                              : 'default';

                    return (
                      <th
                        key={slot.key}
                        data-col-kind={slot.kind}
                        data-group-start={isGroupStart ? 'true' : undefined}
                        data-col-hovered={hoveredColSlot === slotIdx ? 'true' : undefined}
                        data-group-hovered={isClusterHovered ? 'true' : undefined}
                        data-parent-linked={isParentLinked ? 'true' : undefined}
                        data-pinned-master={isPinnedMaster ? 'true' : undefined}
                        style={
                          {
                            height: 'var(--rain-matrix-header-column-height)',
                            '--group-accent': slot.group.accentColor,
                          } as CSSProperties
                        }
                        onMouseEnter={() => {
                          setHoveredColSlot(slotIdx);
                          setHoveredGroupState({
                            groupId: slot.group.id,
                            mode: 'cluster',
                          });
                        }}
                      >
                        <div
                          className={
                            slot.kind === 'group-handle'
                              ? 'rain-matrix-col-header-inner is-handle'
                              : 'rain-matrix-col-header-inner'
                          }
                        >
                          <GroupAgentsHoverBubble
                            group={slot.group}
                            tools={slot.groupTools}
                            FolderIcon={GroupFolderIcon}
                            variant={variant}
                            fullyOpenClassCount={fullyOpenClassCount}
                            anyOpenClassCount={anyOpenClassCount}
                            totalClassCount={flatFilteredClasses.length}
                            onToggleGroupColumn={() =>
                              handleToggleGroupColumn(slot.group, slot.groupTools)
                            }
                            onExpandGroup={
                              slot.kind === 'group-collapsed'
                                ? () => handleToggleExpandGroup(slot.group.id)
                                : undefined
                            }
                            onEnterGroup={
                              isPlanAOverview
                                ? () => {
                                    setFocusedGroupTab(slot.group.id);
                                    setPage(1);
                                  }
                                : undefined
                            }
                            onOpenGroupPicker={
                              isPlanBScheme
                                ? () =>
                                    setPickerState({
                                      scope: 'all-classes-group',
                                      group: slot.group,
                                    })
                                : undefined
                            }
                            onToggleToolForAllClasses={
                              slot.kind === 'group-panoramic' && !isPlanAOverview && !isPlanBScheme
                                ? (tool) => handleToggleToolColumn(tool)
                                : undefined
                            }
                            isToolAllOpen={
                              slot.kind === 'group-panoramic' && !isPlanAOverview && !isPlanBScheme
                                ? (tool) =>
                                    flatFilteredClasses.length > 0 &&
                                    flatFilteredClasses.every((cls) =>
                                      draftRelations.has(makeRelationKey(cls.id, tool.id)),
                                    )
                                : undefined
                            }
                          />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2 + rightSlotCount}
                      style={{ padding: '56px 24px', borderInlineEnd: 0 }}
                    >
                      <Empty presentation="simple">
                        <EmptyMedia />
                        <EmptyTitle>当前筛选条件下暂无课程班级</EmptyTitle>
                        <EmptyDescription>
                          {selectedSource.kind === 'school'
                            ? `${selectedSource.label}下暂无符合条件的专业版班级，请调整学期或班级所属人筛选。`
                            : '自建课下暂无符合条件的班级，请尝试调整学期或班级所属人筛选。'}
                        </EmptyDescription>
                        <EmptyActions>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => {
                              setSemester('all');
                              setOwnerRole('all');
                            }}
                          >
                            查看全部学期与班级
                          </Button>
                        </EmptyActions>
                      </Empty>
                    </td>
                  </tr>
                ) : activeColumnCount === 0 ? (
                  <tr>
                    <td
                      colSpan={2 + rightSlotCount}
                      style={{ padding: '56px 24px', borderInlineEnd: 0 }}
                    >
                      <Empty presentation="simple">
                        <EmptyMedia />
                        <EmptyTitle>
                          {isPanoramicScheme || isPlanBScheme || isPlanAOverview
                            ? '未找到匹配的分组或工具'
                            : isSingleDimensionScheme || publishMode === 'by-tool'
                              ? '未找到匹配的工具'
                              : '未找到匹配的分组'}
                        </EmptyTitle>
                        <EmptyDescription>
                          请尝试调整名称关键词或重置应用分组、工具类型筛选条件。
                        </EmptyDescription>
                        <EmptyActions>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => {
                              setGroupFilter('all');
                              setTypeFilter('all');
                              setOpenStatusFilter('all');
                              setSearchQuery('');
                              setPage(1);
                            }}
                          >
                            重置工具筛选
                          </Button>
                        </EmptyActions>
                      </Empty>
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) =>
                    course.classes.map((cls, clsIndex) => {
                      const rowCheck = getClassRowCheckState(cls.id);
                      const displayClassName = getClassDisplayName(cls);
                      const isUsingFallbackFullName = !cls.shortName?.trim();
                      const tooltipDetail = isSelfBuiltSource
                        ? `${isUsingFallbackFullName ? '班级全称' : `简称：${cls.shortName} · 全称`}：${cls.fullName} · ${cls.semester} · ${cls.ownerRole === 'own' ? '本人班级' : '协同班级'}`
                        : `${isUsingFallbackFullName ? '班级全称' : `简称：${cls.shortName} · 全称`}：${cls.fullName} · ${selectedSource.label} · 专业版 · ${cls.semester}`;

                      return (
                        <tr
                          key={cls.id}
                          data-row-has-open={rowCheck.hasAnyOpen ? 'true' : 'false'}
                          data-drag-row={
                            isPureBrushScheme && dragPaintClassId === cls.id ? 'true' : undefined
                          }
                          style={{ height: 'var(--rain-matrix-row-height)' }}
                        >
                          {/* 合并课程名称单元格 */}
                          {clsIndex === 0 && (
                            <td
                              rowSpan={course.classes.length}
                              className={
                                isPlanCScheme
                                  ? 'rain-matrix-course-cell is-sticky-course'
                                  : 'rain-matrix-course-cell'
                              }
                            >
                              <Tooltip text={course.courseName} portal>
                                <div>
                                  <div className="rain-matrix-course-name">
                                    {course.courseName}
                                  </div>
                                  <div className="rain-matrix-course-meta">
                                    {course.classes.length} 个班级
                                  </div>
                                </div>
                              </Tooltip>
                            </td>
                          )}

                          {/* 班级复选框 + 班级名称 + 实时开放比 */}
                          <td
                            className={
                              isPlanCScheme
                                ? 'rain-matrix-class-cell is-sticky-class'
                                : 'rain-matrix-class-cell'
                            }
                          >
                            <div className="rain-matrix-class-row-inner">
                              <TableRowCheckbox
                                aria-label={`切换 ${displayClassName} 的工具开放状态`}
                                checked={rowCheck.checked}
                                indeterminate={rowCheck.indeterminate}
                                onCheckedChange={(nextChecked) =>
                                  handleToggleClassRow(cls.id, nextChecked)
                                }
                              />
                              <Tooltip text={tooltipDetail} portal>
                                <button
                                  type="button"
                                  data-active={rowCheck.hasAnyOpen ? 'true' : 'false'}
                                  onClick={() =>
                                    handleToggleClassRow(cls.id, !rowCheck.checked)
                                  }
                                  className="rain-matrix-class-name-btn"
                                >
                                  {displayClassName}
                                </button>
                              </Tooltip>
                              {rowCheck.totalCount > 0 && (
                                <span
                                  className="rain-matrix-class-progress"
                                  data-active={rowCheck.hasAnyOpen ? 'true' : 'false'}
                                  title={`当前筛选范围内已开放 ${rowCheck.openCount}/${rowCheck.totalCount} 项`}
                                >
                                  {rowCheck.openCount}/{rowCheck.totalCount}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 右侧矩阵交互单元格（统一由 visibleSlots 驱动，支持方案 1-12） */}
                          {visibleSlots.map((slot, slotIdx) => {
                            if (!slot) {
                              return (
                                <td
                                  key={`empty-cell-${cls.id}-${slotIdx}`}
                                  data-empty-slot="true"
                                  style={{ padding: 0, textAlign: 'center', verticalAlign: 'middle' }}
                                  onMouseEnter={() => {
                                    setHoveredColSlot(null);
                                    setHoveredGroupState(null);
                                  }}
                                />
                              );
                            }

                            const colGroupId = getSlotGroupId(slot);
                            const isGroupStart =
                              slotIdx > 0 && visibleColumnGroupIds[slotIdx - 1] !== colGroupId;
                            const isClusterHovered =
                              hoveredGroupState?.groupId === colGroupId &&
                              (hoveredGroupState.mode === 'cluster' ||
                                hoveredGroupState.mode === 'span');

                            if (slot.kind === 'tool') {
                              const isOpen = draftRelations.has(
                                makeRelationKey(cls.id, slot.tool.id),
                              );
                              const tooltipText = isPureBrushScheme
                                ? isOpen
                                  ? `${displayClassName} 已开放「${slot.tool.name}」（单击取消，按住左键横拉刷选整行）`
                                  : `点击将「${slot.tool.name}」开放至 ${displayClassName}（按住左键可横拉刷选整行）`
                                : isOpen
                                  ? `${displayClassName} 已开放「${slot.tool.name}」，点击取消开放`
                                  : `点击将「${slot.tool.name}」开放至 ${displayClassName}`;
                              return (
                                <td
                                  key={`${cls.id}-${slot.key}`}
                                  data-col-kind="tool"
                                  data-group-start={isGroupStart ? 'true' : undefined}
                                  data-col-hovered={hoveredColSlot === slotIdx ? 'true' : undefined}
                                  data-group-hovered={isClusterHovered ? 'true' : undefined}
                                  onMouseEnter={() => {
                                    setHoveredColSlot(slotIdx);
                                    setHoveredGroupState({
                                      groupId: slot.tool.groupId,
                                      mode: 'child',
                                    });
                                  }}
                                  style={{
                                    padding: 0,
                                    height: 'var(--rain-matrix-row-height)',
                                    textAlign: 'center',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  <MatrixCheckButton
                                    state={isOpen ? 'open' : 'closed'}
                                    variant="tool"
                                    ariaLabel={`${displayClassName} - ${slot.tool.name}：${
                                      isOpen ? '已开放，点击解除' : '未开放，点击建立'
                                    }`}
                                    tooltipText={tooltipText}
                                    dragPaintMode={isPureBrushScheme}
                                    onCellMouseDown={
                                      isPureBrushScheme
                                        ? (e) => {
                                            if (e.button !== 0) return;
                                            e.preventDefault();
                                            const targetOpen = !isOpen;
                                            dragPaintRef.current = {
                                              classId: cls.id,
                                              targetOpen,
                                            };
                                            setIsDraggingPaint(true);
                                            setDragPaintClassId(cls.id);
                                            setToolCellOpen(cls.id, slot.tool.id, targetOpen);
                                          }
                                        : undefined
                                    }
                                    onCellMouseEnter={
                                      isPureBrushScheme
                                        ? () => {
                                            if (
                                              dragPaintRef.current &&
                                              dragPaintRef.current.classId === cls.id
                                            ) {
                                              setToolCellOpen(
                                                cls.id,
                                                slot.tool.id,
                                                dragPaintRef.current.targetOpen,
                                              );
                                            }
                                          }
                                        : undefined
                                    }
                                    onToggle={() => toggleToolCell(cls.id, slot.tool.id)}
                                  />
                                </td>
                              );
                            }

                            const cell = getGroupCellState(
                              cls.id,
                              slot.group.id,
                              slot.groupTools,
                            );

                            if (slot.kind === 'group-panoramic') {
                              return (
                                <td
                                  key={`${cls.id}-${slot.key}`}
                                  data-col-kind="group-panoramic"
                                  data-group-start={isGroupStart ? 'true' : undefined}
                                  data-col-hovered={hoveredColSlot === slotIdx ? 'true' : undefined}
                                  onMouseEnter={() => {
                                    setHoveredColSlot(slotIdx);
                                    setHoveredGroupState({
                                      groupId: slot.group.id,
                                      mode: 'cluster',
                                    });
                                  }}
                                  style={{
                                    padding: 0,
                                    height: 'var(--rain-matrix-row-height)',
                                    textAlign: 'center',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  <InlineGroupToolsCell
                                    group={slot.group}
                                    tools={slot.groupTools}
                                    classDisplayName={displayClassName}
                                    cellState={cell.state}
                                    openCount={cell.openCount}
                                    totalCount={cell.totalCount}
                                    isToolOpen={(toolId) =>
                                      draftRelations.has(makeRelationKey(cls.id, toolId))
                                    }
                                    onToggleWholeGroup={() =>
                                      toggleGroupCell(cls.id, slot.group.id, slot.groupTools)
                                    }
                                    onToggleSingleTool={(toolId) =>
                                      toggleToolCell(cls.id, toolId)
                                    }
                                    onSetWholeGroupOpen={(shouldOpen) =>
                                      setClassGroupOpen(cls.id, slot.groupTools, shouldOpen)
                                    }
                                    onOpenWidePicker={
                                      isPlanBScheme
                                        ? () =>
                                            setPickerState({
                                              scope: 'class-group',
                                              group: slot.group,
                                              classId: cls.id,
                                              classDisplayName: displayClassName,
                                            })
                                        : undefined
                                    }
                                    onEnterGroup={
                                      isPlanAOverview
                                        ? () => {
                                            setFocusedGroupTab(slot.group.id);
                                            setPage(1);
                                          }
                                        : undefined
                                    }
                                  />
                                </td>
                              );
                            }

                            if (slot.kind === 'group-handle') {
                              const handleTooltip =
                                cell.state === 'open'
                                  ? `已开放「${slot.group.name}」全部 ${cell.totalCount} 个工具，点击取消全组`
                                  : cell.state === 'partial'
                                    ? `「${slot.group.name}」已开 ${cell.openCount}/${cell.totalCount} 项，点击全选整组`
                                    : `点击一键开放「${slot.group.name}」全部 ${cell.totalCount} 个工具`;
                              const handleRatio =
                                cell.totalCount > 0
                                  ? Math.round((cell.openCount / cell.totalCount) * 100)
                                  : 0;
                              return (
                                <td
                                  key={`${cls.id}-${slot.key}`}
                                  data-col-kind="group-handle"
                                  data-group-start={isGroupStart ? 'true' : undefined}
                                  data-col-hovered={hoveredColSlot === slotIdx ? 'true' : undefined}
                                  data-group-hovered={isClusterHovered ? 'true' : undefined}
                                  onMouseEnter={() => {
                                    setHoveredColSlot(slotIdx);
                                    setHoveredGroupState({
                                      groupId: slot.group.id,
                                      mode: 'cluster',
                                    });
                                  }}
                                  style={{
                                    padding: 0,
                                    height: 'var(--rain-matrix-row-height)',
                                    textAlign: 'center',
                                    verticalAlign: 'middle',
                                  }}
                                >
                                  <Tooltip text={handleTooltip} portal openDelay={220}>
                                    <button
                                      type="button"
                                      className="rain-matrix-handle-check-btn"
                                      aria-label={`${displayClassName} - ${slot.group.name}全组控制柄（${cell.openCount}/${cell.totalCount}）`}
                                      aria-pressed={cell.state === 'open'}
                                      onClick={() =>
                                        toggleGroupCell(cls.id, slot.group.id, slot.groupTools)
                                      }
                                    >
                                      <span
                                        className="rain-matrix-handle-check-box"
                                        data-state={cell.state}
                                        aria-hidden="true"
                                      >
                                        {cell.state === 'open' && <CheckBoldIcon size={11} />}
                                        {cell.state === 'partial' && <MinusBoldIcon size={10} />}
                                      </span>
                                      {cell.openCount > 0 && (
                                        <span className="rain-matrix-handle-mini-track" aria-hidden="true">
                                          <span
                                            className="rain-matrix-handle-mini-fill"
                                            style={{
                                              width: `${handleRatio}%`,
                                              background: slot.group.accentColor,
                                            }}
                                          />
                                        </span>
                                      )}
                                    </button>
                                  </Tooltip>
                                </td>
                              );
                            }

                            const isPinnedMasterCell =
                              isPlanAScheme &&
                              !isPlanAOverview &&
                              slotIdx === 0 &&
                              slot.kind === 'group-summary';

                            const tooltipText =
                              cell.state === 'open'
                                ? `已开放「${slot.group.name}」全部 ${cell.totalCount} 个工具，点击取消全组开放`
                                : cell.state === 'partial'
                                  ? `「${slot.group.name}」组内已有 ${cell.openCount}/${cell.totalCount} 个工具开放，点击全选该分组`
                                  : `点击全选「${slot.group.name}」全部 ${cell.totalCount} 个工具开放至 ${displayClassName}`;
                            return (
                              <td
                                key={`${cls.id}-${slot.key}`}
                                data-col-kind={slot.kind}
                                data-group-start={isGroupStart ? 'true' : undefined}
                                data-col-hovered={hoveredColSlot === slotIdx ? 'true' : undefined}
                                data-group-hovered={isClusterHovered ? 'true' : undefined}
                                data-pinned-master={isPinnedMasterCell ? 'true' : undefined}
                                onMouseEnter={() => {
                                  setHoveredColSlot(slotIdx);
                                  setHoveredGroupState({
                                    groupId: slot.group.id,
                                    mode: 'cluster',
                                  });
                                }}
                                style={{
                                  padding: 0,
                                  height: 'var(--rain-matrix-row-height)',
                                  textAlign: 'center',
                                  verticalAlign: 'middle',
                                }}
                              >
                                <MatrixCheckButton
                                  state={cell.state}
                                  variant="group"
                                  partialInfo={{
                                    openCount: cell.openCount,
                                    totalCount: cell.totalCount,
                                  }}
                                  ariaLabel={`${displayClassName} - ${slot.group.name}整组（${cell.openCount}/${cell.totalCount}）`}
                                  tooltipText={tooltipText}
                                  onToggle={() =>
                                    toggleGroupCell(cls.id, slot.group.id, slot.groupTools)
                                  }
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 保存失败反馈：保留当前选择，允许重新保存 */}
        {saveError && (
          <div className="rain-matrix-alert-wrap">
            <Alert tone="error">
              <AlertTitle>保存开放关系失败</AlertTitle>
              <AlertDescription>{saveError}</AlertDescription>
              <AlertActions>
                <Button
                  variant="text"
                  tone="danger"
                  size="small"
                  loading={isSaving}
                  onClick={handleSave}
                >
                  重新保存
                </Button>
              </AlertActions>
            </Alert>
          </div>
        )}
      </div>

      {/* 底部状态提示与操作栏 */}
      <footer className="rain-matrix-footer">
        <div className="rain-matrix-footer-status">
          {diff.isDirty ? (
            <span
              style={{
                color: 'var(--rain-color-text-primary)',
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              已选{' '}
              <span style={{ color: 'var(--rain-color-brand-primary)', fontWeight: 600 }}>
                {draftRelations.size}
              </span>{' '}
              项（待保存：新增 {diff.addedCount}，解除 {diff.removedCount}）
            </span>
          ) : draftRelations.size === 0 ? (
            <span>
              {isSingleDimensionScheme
                ? '请选择需要开放的班级、工具或分组'
                : publishMode === 'by-tool'
                  ? '请选择需要开放的班级与工具'
                  : '请选择需要开放的班级与分组'}
            </span>
          ) : (
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              已开放 {draftRelations.size} 项 · 无未保存变更
            </span>
          )}
          <span aria-hidden="true" style={{ color: 'var(--rain-category-text-neutral-5)' }}>
            ·
          </span>
          <span
            style={{
              color: 'var(--rain-category-text-neutral-4)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {isPlanAScheme
              ? isPlanAOverview
                ? '分组总览可开整组 · 切单组后左1列固定整组总控，右侧按页微调单工具'
                : '左1列固定「整组总控」 · 右侧支持组内状态筛选与搜索单工具 · 不复制或生成新版本'
              : isPlanBScheme
                ? '恒定6列免翻页 · 点主体开整组 · 点「▾」打开百级工具宽面板检索配置'
                : isPlanCScheme
                  ? '左冻结课程班级 · 顶部锚点直跳分组 · 横向滚动免切页配置全部工具'
                  : isTreeScheme
                    ? '点分组格直接开整组 · 点「+ 展开」可单选组内工具 · 不复制或生成新版本'
                    : isPureBrushScheme
                      ? '顶梁「整组开放」按组选班 · 行内按住左键横拉可快速刷选 · 不复制或生成新版本'
                      : isPanoramicScheme
                        ? '6大分组一屏总览 · 点主体开整组 · 点「▾」微调单工具 · 不复制或生成新版本'
                        : isHandleScheme
                          ? '左侧蓝框全选整组 · 右侧卡片单选工具 · 不复制或生成新版本'
                          : isInterleavedScheme
                            ? '蓝标整组全选 · 绿勾单选工具 · 不复制或生成新版本'
                            : publishMode === 'by-tool'
                              ? '仅发布已选工具，不复制或生成新版本'
                              : '发布选中分组下全部工具，不复制或生成新版本'}
          </span>
        </div>

        <div className="rain-matrix-footer-actions">
          <Button variant="tertiary" size="medium" onClick={handleRequestClose}>
            关闭
          </Button>
          <Tooltip
            text={
              !diff.isDirty
                ? '未更新开放关系，无需保存'
                : draftRelations.size === 0 && savedRelations.size === 0
                  ? isSingleDimensionScheme
                    ? '请至少选择一个班级与工具或分组'
                    : publishMode === 'by-tool'
                      ? '请至少选择一个班级与工具'
                      : '请至少选择一个班级与分组'
                  : isSingleDimensionScheme
                    ? '保存当前班级与工具的开放关系'
                    : publishMode === 'by-tool'
                      ? '保存已选工具的班级开放关系'
                      : '保存所选分组下全部工具的班级开放关系'
            }
            portal
          >
            <span style={{ display: 'inline-flex' }}>
              <Button
                variant="primary"
                size="medium"
                loading={isSaving}
                disabled={saveDisabled}
                onClick={handleSave}
              >
                {saveError ? '重新保存' : '保存百宝箱配置'}
              </Button>
            </span>
          </Tooltip>
        </div>
      </footer>

      {/* 方案十一（方案 B）：百级工具宽面板检索与批量勾选弹窗 */}
      <GroupToolsPickerDialog
        pickerState={pickerState}
        onClose={() => setPickerState(null)}
        onSwitchClass={(classId, classDisplayName) =>
          setPickerState((prev) =>
            prev && prev.scope === 'class-group'
              ? { ...prev, classId, classDisplayName }
              : prev,
          )
        }
        toolsInGroup={
          pickerState ? (toolsByGroupMap.get(pickerState.group.id) ?? []) : []
        }
        classes={flatFilteredClasses}
        isToolOpenForClass={(classId, toolId) =>
          draftRelations.has(makeRelationKey(classId, toolId))
        }
        onToggleToolForClass={toggleToolCell}
        onBatchSetToolsForClass={setClassGroupOpen}
        onToggleToolForAllClasses={handleToggleToolColumn}
        onBatchSetToolsForAllClasses={setGroupForAllClasses}
      />
    </div>
  );

  const tabItems: TabsItem[] = [
    {
      value: 'ai-app',
      label: '发布AI应用',
      content: (
        <div className="rain-matrix-empty-tab">
          <Empty presentation="simple">
            <EmptyMedia />
            <EmptyTitle>发布AI应用</EmptyTitle>
            <EmptyDescription>
              此处用于管理课程内 AI 应用的班级发布，当前编辑焦点为「发布百宝箱」。
            </EmptyDescription>
            <EmptyActions>
              <Button variant="primary" size="small" onClick={() => setActiveTab('toolbox')}>
                返回发布百宝箱
              </Button>
            </EmptyActions>
          </Empty>
        </div>
      ),
    },
    {
      value: 'agent',
      label: '发布智能体',
      content: (
        <div className="rain-matrix-empty-tab">
          <Empty presentation="simple">
            <EmptyMedia />
            <EmptyTitle>发布智能体</EmptyTitle>
            <EmptyDescription>
              智能体单品发布与百宝箱矩阵共享班级权限体系，可切换至「发布百宝箱」统一配置。
            </EmptyDescription>
            <EmptyActions>
              <Button variant="primary" size="small" onClick={() => setActiveTab('toolbox')}>
                返回发布百宝箱
              </Button>
            </EmptyActions>
          </Empty>
        </div>
      ),
    },
    {
      value: 'toolbox',
      label: '发布百宝箱',
      content: matrixPanelContent,
    },
    {
      value: 'graph',
      label: '开放图谱',
      content: (
        <div className="rain-matrix-empty-tab">
          <Empty presentation="simple">
            <EmptyMedia />
            <EmptyTitle>开放图谱</EmptyTitle>
            <EmptyDescription>
              知识图谱班级开放配置独立维护，当前请前往「发布百宝箱」建立或解除工具开放关系。
            </EmptyDescription>
            <EmptyActions>
              <Button variant="primary" size="small" onClick={() => setActiveTab('toolbox')}>
                返回发布百宝箱
              </Button>
            </EmptyActions>
          </Empty>
        </div>
      ),
    },
  ];

  return (
    <section
      className="rain-toolbox-matrix-shell"
      aria-label="百宝箱发布矩阵"
      data-rain-theme="light"
    >
      <Tabs
        aria-label="发布类型切换"
        items={tabItems}
        value={activeTab}
        onValueChange={(next) => {
          if (typeof next === 'string') {
            setActiveTab(next);
          }
        }}
        appearance="line"
        indicatorSize="content"
        showDivider
        localRecipe={matrixTopTabsRecipe}
        extraEnd={
          <div className="rain-matrix-top-actions">
            <Button
              variant="tertiary"
              size="small"
              leadingIcon={<ShareIcon />}
              onClick={() => handleShareToolboxLink()}
            >
              分享百宝箱链接
            </Button>
            <span className="rain-matrix-top-divider" aria-hidden="true" />
            <IconButton
              size="28/16"
              aria-label="关闭窗口"
              icon={<CloseIcon />}
              onClick={handleRequestClose}
            />
          </div>
        }
      />

      {/* 未保存更改关闭确认 */}
      <AlertDialog.Root open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <AlertDialog.Content width={416}>
          <AlertDialog.Header>
            <AlertDialog.Title>放弃未保存的开放关系变更？</AlertDialog.Title>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <AlertDialog.Description>
              当前有 {diff.addedCount + diff.removedCount} 项开放关系尚未保存，关闭后未保存的修改将不会生效。
            </AlertDialog.Description>
          </AlertDialog.Body>
          <AlertDialog.Footer divider>
            <Button
              variant="tertiary"
              size="medium"
              onClick={() => setConfirmDiscardOpen(false)}
            >
              继续编辑
            </Button>
            <Button
              variant="primary"
              tone="danger"
              size="medium"
              onClick={() => {
                setConfirmDiscardOpen(false);
                onClose();
              }}
            >
              放弃并关闭
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </section>
  );
}
