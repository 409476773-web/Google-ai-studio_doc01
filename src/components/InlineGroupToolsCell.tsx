import { useMemo, useState } from 'react';
import { Button, Input, Popover, TableRowCheckbox, Tooltip } from '@rain-next/ui';
import { ArrowDownIcon } from '@rain-next/ui/icons/arrow-down';
import { CheckBoldIcon } from '@rain-next/ui/icons/check-bold';
import { MoreHorizontalIcon } from '@rain-next/ui/icons/more-horizontal';
import { SearchIcon } from '@rain-next/ui/icons/search';
import type { ToolboxGroup, ToolboxTool } from '../data/toolbox-matrix-data';
import type { MatrixCellState } from './MatrixCheckButton';
import { matrixGroupAgentsPopoverRecipe } from './matrix-recipes';

export interface InlineGroupToolsCellProps {
  group: ToolboxGroup;
  tools: ToolboxTool[];
  classDisplayName: string;
  cellState: MatrixCellState;
  openCount: number;
  totalCount: number;
  isToolOpen: (toolId: string) => boolean;
  onToggleWholeGroup: () => void;
  onToggleSingleTool: (toolId: string) => void;
  onSetWholeGroupOpen: (shouldOpen: boolean) => void;
  onOpenWidePicker?: () => void;
  onEnterGroup?: () => void;
}

export function InlineGroupToolsCell({
  group,
  tools,
  classDisplayName,
  cellState,
  openCount,
  totalCount,
  isToolOpen,
  onToggleWholeGroup,
  onToggleSingleTool,
  onSetWholeGroupOpen,
  onOpenWidePicker,
  onEnterGroup,
}: InlineGroupToolsCellProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverSearch, setPopoverSearch] = useState('');

  const filteredPopoverTools = useMemo(() => {
    const q = popoverSearch.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q),
    );
  }, [tools, popoverSearch]);

  const mainTooltip =
    cellState === 'open'
      ? `已为 ${classDisplayName} 开放「${group.name}」全部 ${totalCount} 个工具，点击取消全组`
      : cellState === 'partial'
        ? `${classDisplayName} 已开 ${openCount}/${totalCount} 个，点击全选整组（点右侧${
            onOpenWidePicker ? '···打开检索面板' : '▾微调单工具'
          }）`
        : `点击为 ${classDisplayName} 全选「${group.name}」全部 ${totalCount} 个工具`;

  return (
    <div className="rain-matrix-panoramic-cell" data-open={popoverOpen ? 'true' : undefined}>
      <Tooltip text={mainTooltip} portal openDelay={280}>
        <button
          type="button"
          className="rain-matrix-panoramic-main-btn"
          data-state={cellState}
          aria-label={`${classDisplayName} - ${group.name}整组切换（当前 ${openCount}/${totalCount}）`}
          onClick={onToggleWholeGroup}
        >
          {cellState === 'open' && (
            <span className="rain-matrix-group-cell-open">
              <CheckBoldIcon size={10} />
              <span>
                {openCount}/{totalCount}
              </span>
            </span>
          )}
          {cellState === 'partial' && (
            <span className="rain-matrix-group-cell-partial">
              <span>
                {openCount}/{totalCount}
              </span>
            </span>
          )}
          {cellState === 'closed' && (
            <span className="rain-matrix-group-cell-closed">全选</span>
          )}
        </button>
      </Tooltip>

      {onOpenWidePicker ? (
        <Tooltip text={`打开宽面板检索「${group.name}」全部 ${totalCount} 个工具`} portal openDelay={220}>
          <button
            type="button"
            className="rain-matrix-panoramic-tune-btn is-wide-trigger"
            aria-label={`检索配置 ${classDisplayName} 在「${group.name}」中的 ${totalCount} 个工具`}
            onClick={onOpenWidePicker}
          >
            <MoreHorizontalIcon size={12} aria-hidden="true" />
          </button>
        </Tooltip>
      ) : (
        <Popover.Root
          open={popoverOpen}
          onOpenChange={(next) => {
            setPopoverOpen(next);
            if (!next) setPopoverSearch('');
          }}
        >
          <Tooltip text="点此微调组内单个工具" portal openDelay={260} disabled={popoverOpen}>
            <Popover.Trigger
              render={
                <button
                  type="button"
                  className="rain-matrix-panoramic-tune-btn"
                  data-active={popoverOpen ? 'true' : 'false'}
                  aria-label={`微调 ${classDisplayName} 在「${group.name}」中的单个工具`}
                >
                  <ArrowDownIcon size={11} aria-hidden="true" />
                </button>
              }
            />
          </Tooltip>

          <Popover.Content
            width={284}
            localRecipe={matrixGroupAgentsPopoverRecipe}
            positionerProps={{
              side: 'bottom',
              align: 'center',
              sideOffset: 4,
            }}
          >
            <div className="rain-matrix-inline-tune-header">
              <div className="rain-matrix-inline-tune-titles">
                <Popover.Title className="rain-matrix-group-popover-title">
                  {group.name}
                </Popover.Title>
                <span className="rain-matrix-inline-tune-sub" title={classDisplayName}>
                  {classDisplayName}
                </span>
              </div>
              <span className="rain-matrix-group-popover-count">
                {openCount}/{totalCount}
              </span>
            </div>

            {tools.length > 8 && (
              <div style={{ marginBottom: 6 }}>
                <Input
                  aria-label="筛选组内工具"
                  size={24}
                  clearable
                  leadingIcon={<SearchIcon size={12} />}
                  placeholder={`筛选 ${tools.length} 个工具...`}
                  value={popoverSearch}
                  onValueChange={setPopoverSearch}
                  className="rain-matrix-search-input"
                />
              </div>
            )}

            {filteredPopoverTools.length > 0 ? (
              <ul
                className="rain-matrix-group-popover-list"
                aria-label={`${classDisplayName} - ${group.name}工具微调`}
              >
                {filteredPopoverTools.map((tool) => {
                  const checked = isToolOpen(tool.id);
                  return (
                    <li key={tool.id}>
                      <button
                        type="button"
                        className="rain-matrix-inline-tune-row"
                        data-checked={checked ? 'true' : 'false'}
                        onClick={() => onToggleSingleTool(tool.id)}
                      >
                        <span className="rain-matrix-inline-tune-check" aria-hidden="true">
                          <TableRowCheckbox
                            aria-label={tool.name}
                            checked={checked}
                            onCheckedChange={() => {}}
                            tabIndex={-1}
                          />
                        </span>
                        <img
                          src={tool.coverSrc}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="rain-matrix-group-popover-thumb"
                        />
                        <span className="rain-matrix-group-popover-name" title={tool.name}>
                          {tool.name}
                        </span>
                        <span className="rain-matrix-tool-popover-type-text" data-type={tool.type}>
                          {tool.type}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rain-matrix-group-popover-empty">
                未找到匹配的组内工具
              </div>
            )}

            <div className="rain-matrix-inline-tune-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Button
                  variant="text"
                  size="compact"
                  disabled={openCount === totalCount}
                  onClick={() => onSetWholeGroupOpen(true)}
                >
                  全选
                </Button>
                <Button
                  variant="text"
                  size="compact"
                  disabled={openCount === 0}
                  onClick={() => onSetWholeGroupOpen(false)}
                >
                  清空
                </Button>
              </div>
              {onEnterGroup && (
                <Button
                  variant="text"
                  size="compact"
                  onClick={() => {
                    setPopoverOpen(false);
                    onEnterGroup();
                  }}
                >
                  进组分页管理 →
                </Button>
              )}
            </div>
          </Popover.Content>
        </Popover.Root>
      )}
    </div>
  );
}
