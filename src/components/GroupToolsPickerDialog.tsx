import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  Empty,
  EmptyDescription,
  EmptyTitle,
  IconButton,
  Input,
  Select,
  TableRowCheckbox,
  ToggleGroup,
  ToggleGroupItem,
  type SelectOption,
} from '@rain-next/ui';
import { ArrowLeftIcon } from '@rain-next/ui/icons/arrow-left';
import { ArrowRightIcon } from '@rain-next/ui/icons/arrow-right';
import { SearchIcon } from '@rain-next/ui/icons/search';
import {
  getClassDisplayName,
  type CourseClassItem,
  type ToolOwnershipType,
  type ToolboxGroup,
  type ToolboxTool,
} from '../data/toolbox-matrix-data';
import { matrixHeaderSelectRecipe } from './matrix-recipes';

export type GroupToolsPickerState =
  | {
      scope: 'class-group';
      group: ToolboxGroup;
      classId: string;
      classDisplayName: string;
    }
  | {
      scope: 'all-classes-group';
      group: ToolboxGroup;
    };

export interface GroupToolsPickerDialogProps {
  pickerState: GroupToolsPickerState | null;
  onClose: () => void;
  onSwitchClass?: (classId: string, classDisplayName: string) => void;
  toolsInGroup: ToolboxTool[];
  classes: CourseClassItem[];
  isToolOpenForClass: (classId: string, toolId: string) => boolean;
  onToggleToolForClass: (classId: string, toolId: string) => void;
  onBatchSetToolsForClass: (
    classId: string,
    tools: ToolboxTool[],
    shouldOpen: boolean,
  ) => void;
  onToggleToolForAllClasses: (tool: ToolboxTool) => void;
  onBatchSetToolsForAllClasses: (tools: ToolboxTool[], shouldOpen: boolean) => void;
}

type OpenFilterValue = 'all' | 'open' | 'closed';
type SortModeValue = 'default' | 'open-first' | 'closed-first';

const TYPE_FILTER_OPTIONS: SelectOption[] = [
  { value: 'all', label: '全部类型' },
  { value: '系统', label: '系统' },
  { value: '个人', label: '个人' },
  { value: '他人共享', label: '他人共享' },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: 'default', label: '默认顺序' },
  { value: 'open-first', label: '已开放优先' },
  { value: 'closed-first', label: '未开放优先' },
];

export function GroupToolsPickerDialog({
  pickerState,
  onClose,
  onSwitchClass,
  toolsInGroup,
  classes,
  isToolOpenForClass,
  onToggleToolForClass,
  onBatchSetToolsForClass,
  onToggleToolForAllClasses,
  onBatchSetToolsForAllClasses,
}: GroupToolsPickerDialogProps) {
  const [search, setSearch] = useState('');
  const [openFilter, setOpenFilter] = useState<OpenFilterValue>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortModeValue>('default');

  useEffect(() => {
    if (pickerState) {
      setSearch('');
      setOpenFilter('all');
      setOwnershipFilter('all');
      setSortMode('default');
    }
  }, [pickerState?.scope, pickerState?.group.id]);

  const currentClassIdx = useMemo(() => {
    if (!pickerState || pickerState.scope !== 'class-group') return -1;
    return classes.findIndex((c) => c.id === pickerState.classId);
  }, [pickerState, classes]);

  const toolOpenCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (!pickerState) return counts;
    for (const tool of toolsInGroup) {
      if (pickerState.scope === 'class-group') {
        counts.set(tool.id, isToolOpenForClass(pickerState.classId, tool.id) ? 1 : 0);
      } else {
        let n = 0;
        for (const cls of classes) {
          if (isToolOpenForClass(cls.id, tool.id)) n += 1;
        }
        counts.set(tool.id, n);
      }
    }
    return counts;
  }, [pickerState, toolsInGroup, classes, isToolOpenForClass]);

  const summaryStats = useMemo(() => {
    if (!pickerState) {
      return { openCount: 0, closedCount: 0 };
    }
    let openCount = 0;
    for (const tool of toolsInGroup) {
      const c = toolOpenCounts.get(tool.id) ?? 0;
      if (pickerState.scope === 'class-group') {
        if (c > 0) openCount += 1;
      } else if (classes.length > 0 && c === classes.length) {
        openCount += 1;
      }
    }
    return {
      openCount,
      closedCount: toolsInGroup.length - openCount,
    };
  }, [pickerState, toolsInGroup, toolOpenCounts, classes.length]);

  const filteredTools = useMemo(() => {
    if (!pickerState) return [];
    const q = search.trim().toLowerCase();
    const list = toolsInGroup.filter((tool) => {
      if (ownershipFilter !== 'all' && tool.type !== (ownershipFilter as ToolOwnershipType)) {
        return false;
      }
      const c = toolOpenCounts.get(tool.id) ?? 0;
      const isConsideredOpen =
        pickerState.scope === 'class-group'
          ? c > 0
          : classes.length > 0 && c === classes.length;
      if (openFilter === 'open' && !isConsideredOpen) return false;
      if (openFilter === 'closed' && isConsideredOpen) return false;

      if (q) {
        const matchName = tool.name.toLowerCase().includes(q);
        const matchAuthor = tool.author.toLowerCase().includes(q);
        const matchDesc = tool.description.toLowerCase().includes(q);
        if (!matchName && !matchAuthor && !matchDesc) return false;
      }
      return true;
    });

    if (sortMode === 'default') return list;
    return [...list].sort((a, b) => {
      const ca = toolOpenCounts.get(a.id) ?? 0;
      const cb = toolOpenCounts.get(b.id) ?? 0;
      return sortMode === 'open-first' ? cb - ca : ca - cb;
    });
  }, [
    pickerState,
    toolsInGroup,
    ownershipFilter,
    openFilter,
    search,
    sortMode,
    toolOpenCounts,
    classes.length,
  ]);

  const filteredOpenCount = useMemo(() => {
    if (!pickerState) return 0;
    let count = 0;
    for (const tool of filteredTools) {
      const c = toolOpenCounts.get(tool.id) ?? 0;
      if (pickerState.scope === 'class-group') {
        if (c > 0) count += 1;
      } else if (classes.length > 0 && c === classes.length) {
        count += 1;
      }
    }
    return count;
  }, [pickerState, filteredTools, toolOpenCounts, classes.length]);

  const allFilteredOpen =
    filteredTools.length > 0 && filteredOpenCount === filteredTools.length;
  const anyFilteredOpen = useMemo(() => {
    if (!pickerState) return false;
    return filteredTools.some((tool) => (toolOpenCounts.get(tool.id) ?? 0) > 0);
  }, [pickerState, filteredTools, toolOpenCounts]);

  const progressRatio =
    toolsInGroup.length > 0
      ? Math.round((summaryStats.openCount / toolsInGroup.length) * 100)
      : 0;

  function handleStepClass(delta: -1 | 1) {
    if (!onSwitchClass || classes.length <= 1 || currentClassIdx < 0) return;
    const nextIdx = (currentClassIdx + delta + classes.length) % classes.length;
    const nextCls = classes[nextIdx];
    onSwitchClass(nextCls.id, getClassDisplayName(nextCls));
  }

  return (
    <Dialog.Root
      open={Boolean(pickerState)}
      disablePointerDismissal={false}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <Dialog.Content width={616} theme="light">
        {pickerState && (
          <>
            <Dialog.Header>
              <div className="rain-matrix-picker-header-row">
                <div className="rain-matrix-picker-title-block">
                  <div className="rain-matrix-picker-kicker">
                    <span
                      className="rain-matrix-group-span-dot"
                      style={{ background: pickerState.group.accentColor }}
                      aria-hidden="true"
                    />
                    <span>
                      {pickerState.scope === 'class-group'
                        ? pickerState.classDisplayName
                        : `批量配置当前全部 ${classes.length} 个班级`}
                    </span>
                    {pickerState.scope === 'class-group' &&
                      onSwitchClass &&
                      classes.length > 1 &&
                      currentClassIdx >= 0 && (
                        <span className="rain-matrix-picker-class-stepper">
                          <IconButton
                            size="24/14"
                            aria-label="上一班级"
                            icon={<ArrowLeftIcon />}
                            onClick={() => handleStepClass(-1)}
                          />
                          <span className="rain-matrix-picker-class-pos">
                            {currentClassIdx + 1}/{classes.length}班
                          </span>
                          <IconButton
                            size="24/14"
                            aria-label="下一班级"
                            icon={<ArrowRightIcon />}
                            onClick={() => handleStepClass(1)}
                          />
                        </span>
                      )}
                  </div>
                  <Dialog.Title>
                    {pickerState.group.name} · 组内工具配置
                  </Dialog.Title>
                  <Dialog.Description>
                    {pickerState.scope === 'class-group'
                      ? `共 ${toolsInGroup.length} 个工具，当前已为该班级开放 ${summaryStats.openCount} 个`
                      : `共 ${toolsInGroup.length} 个工具，可快速检索并一键开放给当前全部 ${classes.length} 个班级`}
                  </Dialog.Description>
                </div>

                <div className="rain-matrix-picker-stat-box">
                  <span className="rain-matrix-picker-stat-num">
                    {summaryStats.openCount}/{toolsInGroup.length}
                  </span>
                  <span className="rain-matrix-picker-stat-label">
                    {pickerState.scope === 'class-group' ? '已开放工具' : '全班已开放'}
                  </span>
                </div>
              </div>

              <div className="rain-matrix-picker-progress-track" aria-hidden="true">
                <div
                  className="rain-matrix-picker-progress-fill"
                  style={{
                    width: `${progressRatio}%`,
                    background: pickerState.group.accentColor,
                  }}
                />
              </div>

              <div className="rain-matrix-picker-toolbar">
                <ToggleGroup
                  aria-label="开放状态筛选"
                  value={[openFilter]}
                  spacing={0}
                  className="rain-matrix-mode-switch"
                  onValueChange={(nextValues) => {
                    const next = nextValues[0];
                    if (next === 'all' || next === 'open' || next === 'closed') {
                      setOpenFilter(next);
                    }
                  }}
                >
                  <ToggleGroupItem value="all" className="rain-matrix-mode-item">
                    全部 ({toolsInGroup.length})
                  </ToggleGroupItem>
                  <ToggleGroupItem value="open" className="rain-matrix-mode-item">
                    已开 ({summaryStats.openCount})
                  </ToggleGroupItem>
                  <ToggleGroupItem value="closed" className="rain-matrix-mode-item">
                    未开 ({summaryStats.closedCount})
                  </ToggleGroupItem>
                </ToggleGroup>

                <div className="rain-matrix-picker-filters-right">
                  <div style={{ width: 92, flexShrink: 0 }}>
                    <Select
                      aria-label="按工具类型筛选"
                      options={TYPE_FILTER_OPTIONS}
                      value={ownershipFilter}
                      onValueChange={(val) => {
                        if (typeof val === 'string') setOwnershipFilter(val);
                      }}
                      appearance="filled"
                      size={28}
                      clearable={false}
                      localRecipe={matrixHeaderSelectRecipe}
                    />
                  </div>
                  <div style={{ width: 98, flexShrink: 0 }}>
                    <Select
                      aria-label="工具排序方式"
                      options={SORT_OPTIONS}
                      value={sortMode}
                      onValueChange={(val) => {
                        if (
                          val === 'default' ||
                          val === 'open-first' ||
                          val === 'closed-first'
                        ) {
                          setSortMode(val);
                        }
                      }}
                      appearance="filled"
                      size={28}
                      clearable={false}
                      localRecipe={matrixHeaderSelectRecipe}
                    />
                  </div>
                  <div style={{ width: 156, flexShrink: 0 }}>
                    <Input
                      aria-label="搜索工具名称或作者"
                      size={28}
                      clearable
                      leadingIcon={<SearchIcon size={14} />}
                      placeholder="搜索名称/作者"
                      value={search}
                      onValueChange={setSearch}
                      className="rain-matrix-search-input"
                    />
                  </div>
                </div>
              </div>
            </Dialog.Header>

            <Dialog.Body>
              {filteredTools.length === 0 ? (
                <div style={{ padding: '32px 12px' }}>
                  <Empty presentation="simple">
                    <EmptyTitle>未找到匹配的组内工具</EmptyTitle>
                    <EmptyDescription>
                      尝试清空搜索关键词或切换开放状态筛选条件。
                    </EmptyDescription>
                  </Empty>
                </div>
              ) : (
                <div className="rain-matrix-picker-grid">
                  {filteredTools.map((tool) => {
                    const openClassCount = toolOpenCounts.get(tool.id) ?? 0;
                    const isChecked =
                      pickerState.scope === 'class-group'
                        ? openClassCount > 0
                        : classes.length > 0 && openClassCount === classes.length;
                    const isIndeterminate =
                      pickerState.scope === 'all-classes-group' &&
                      openClassCount > 0 &&
                      openClassCount < classes.length;

                    return (
                      <button
                        key={tool.id}
                        type="button"
                        className="rain-matrix-picker-card"
                        data-checked={isChecked ? 'true' : 'false'}
                        data-partial={isIndeterminate ? 'true' : 'false'}
                        onClick={() => {
                          if (pickerState.scope === 'class-group') {
                            onToggleToolForClass(pickerState.classId, tool.id);
                          } else {
                            onToggleToolForAllClasses(tool);
                          }
                        }}
                      >
                        <span className="rain-matrix-picker-card-check" aria-hidden="true">
                          <TableRowCheckbox
                            aria-label={tool.name}
                            checked={isChecked}
                            indeterminate={isIndeterminate}
                            onCheckedChange={() => {}}
                            tabIndex={-1}
                          />
                        </span>
                        <img
                          src={tool.coverSrc}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="rain-matrix-picker-card-thumb"
                        />
                        <div className="rain-matrix-picker-card-body">
                          <div className="rain-matrix-picker-card-top">
                            <span
                              className="rain-matrix-picker-card-title"
                              title={tool.name}
                            >
                              {tool.name}
                            </span>
                          </div>
                          <div
                            className="rain-matrix-picker-card-desc"
                            title={tool.description}
                          >
                            {tool.description}
                          </div>
                          <div className="rain-matrix-picker-card-meta">
                            <span>
                              <span
                                className="rain-matrix-tool-popover-type-text"
                                data-type={tool.type}
                              >
                                {tool.type}
                              </span>
                              <span aria-hidden="true" className="rain-matrix-meta-dot">
                                {' · '}
                              </span>
                              <span>{tool.author}</span>
                            </span>
                            {pickerState.scope === 'all-classes-group' && (
                              <span
                                className="rain-matrix-picker-card-progress"
                                data-active={openClassCount > 0 ? 'true' : 'false'}
                              >
                                {openClassCount}/{classes.length} 班
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Dialog.Body>

            <Dialog.Footer divider>
              <div className="rain-matrix-picker-footer-row">
                <span className="rain-matrix-picker-footer-hint">
                  匹配 {filteredTools.length} 项 · 已开放 {filteredOpenCount} 项
                </span>
                <div className="rain-matrix-picker-footer-actions">
                  <Button
                    variant="tertiary"
                    size="small"
                    disabled={filteredTools.length === 0 || allFilteredOpen}
                    onClick={() => {
                      if (pickerState.scope === 'class-group') {
                        onBatchSetToolsForClass(
                          pickerState.classId,
                          filteredTools,
                          true,
                        );
                      } else {
                        onBatchSetToolsForAllClasses(filteredTools, true);
                      }
                    }}
                  >
                    全选当前结果
                  </Button>
                  <Button
                    variant="tertiary"
                    size="small"
                    disabled={filteredTools.length === 0 || !anyFilteredOpen}
                    onClick={() => {
                      if (pickerState.scope === 'class-group') {
                        onBatchSetToolsForClass(
                          pickerState.classId,
                          filteredTools,
                          false,
                        );
                      } else {
                        onBatchSetToolsForAllClasses(filteredTools, false);
                      }
                    }}
                  >
                    清空当前结果
                  </Button>
                  <Button variant="primary" size="small" onClick={onClose}>
                    完成
                  </Button>
                </div>
              </div>
            </Dialog.Footer>
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
