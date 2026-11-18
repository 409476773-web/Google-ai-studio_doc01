import { useState } from 'react';
import { Button, Popover, TableRowCheckbox } from '@rain-next/ui';
import { ArrowDownIcon } from '@rain-next/ui/icons/arrow-down';
import {
  getClassDisplayName,
  type CourseClassItem,
  type ToolboxGroup,
  type ToolboxTool,
} from '../data/toolbox-matrix-data';
import type { MatrixCellState } from './MatrixCheckButton';
import { matrixGroupAgentsPopoverRecipe } from './matrix-recipes';

export interface GroupSpanBatchPopoverProps {
  group: ToolboxGroup;
  toolsInGroup: ToolboxTool[];
  classes: CourseClassItem[];
  getClassGroupState: (classId: string) => {
    state: MatrixCellState;
    openCount: number;
    totalCount: number;
  };
  onToggleClassGroup: (classId: string) => void;
  onSetAllClassesGroup: (shouldOpen: boolean) => void;
  compact?: boolean;
}

export function GroupSpanBatchPopover({
  group,
  toolsInGroup,
  classes,
  getClassGroupState,
  onToggleClassGroup,
  onSetAllClassesGroup,
  compact = false,
}: GroupSpanBatchPopoverProps) {
  const [open, setOpen] = useState(false);

  const allClassesOpen =
    classes.length > 0 &&
    classes.every((cls) => getClassGroupState(cls.id).state === 'open');
  const anyClassOpen = classes.some(
    (cls) => getClassGroupState(cls.id).openCount > 0,
  );
  const triggerState = allClassesOpen ? 'open' : anyClassOpen ? 'partial' : 'closed';
  const triggerLabel = compact
    ? allClassesOpen
      ? '已全开'
      : '整组'
    : allClassesOpen
      ? '全班已开'
      : anyClassOpen
        ? '部分已开'
        : '整组开放';

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        render={
          <button
            type="button"
            className="rain-matrix-span-batch-btn"
            data-open={open ? 'true' : undefined}
            data-state={triggerState}
            aria-label={`整组开放「${group.name}」`}
            onClick={(e) => e.stopPropagation()}
          >
            <span>{triggerLabel}</span>
            <ArrowDownIcon size={11} aria-hidden="true" />
          </button>
        }
      />

      <Popover.Content
        width={304}
        localRecipe={matrixGroupAgentsPopoverRecipe}
        positionerProps={{
          side: 'bottom',
          align: 'end',
          sideOffset: 5,
        }}
      >
        <div className="rain-matrix-inline-tune-header">
          <div className="rain-matrix-inline-tune-titles">
            <Popover.Title className="rain-matrix-group-popover-title">
              整组开放 · {group.name}
            </Popover.Title>
            <span className="rain-matrix-inline-tune-sub">
              勾选班级即可一键开放组内全部 {toolsInGroup.length} 个工具
            </span>
          </div>
        </div>

        {classes.length > 0 ? (
          <ul
            className="rain-matrix-group-popover-list"
            style={{ maxHeight: 224 }}
            aria-label={`选择开放「${group.name}」的班级`}
          >
            {classes.map((cls) => {
              const displayName = getClassDisplayName(cls);
              const { state, openCount, totalCount } = getClassGroupState(cls.id);
              return (
                <li key={cls.id}>
                  <button
                    type="button"
                    className="rain-matrix-inline-tune-row"
                    data-checked={state === 'open' ? 'true' : 'false'}
                    onClick={() => onToggleClassGroup(cls.id)}
                  >
                    <span className="rain-matrix-inline-tune-check" aria-hidden="true">
                      <TableRowCheckbox
                        aria-label={displayName}
                        checked={state === 'open'}
                        indeterminate={state === 'partial'}
                        onCheckedChange={() => {}}
                        tabIndex={-1}
                      />
                    </span>
                    <span
                      className="rain-matrix-group-popover-name"
                      title={displayName}
                    >
                      {displayName}
                    </span>
                    <span
                      className="rain-matrix-span-batch-status"
                      data-state={state}
                    >
                      {openCount}/{totalCount}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rain-matrix-group-popover-empty">
            当前筛选条件下暂无可选班级
          </div>
        )}

        <div className="rain-matrix-inline-tune-footer">
          <Button
            variant="text"
            size="compact"
            disabled={classes.length === 0 || allClassesOpen}
            onClick={() => onSetAllClassesGroup(true)}
          >
            当前班级全选
          </Button>
          <Button
            variant="text"
            size="compact"
            disabled={classes.length === 0 || !anyClassOpen}
            onClick={() => onSetAllClassesGroup(false)}
          >
            清空本组授权
          </Button>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
