import { useState, type ComponentType } from 'react';
import { Popover } from '@rain-next/ui';
import type { ToolboxGroup, ToolboxTool } from '../data/toolbox-matrix-data';
import { matrixGroupAgentsPopoverRecipe } from './matrix-recipes';

export type GroupHeaderVariant =
  | 'default'
  | 'summary'
  | 'collapsed-tree'
  | 'panoramic'
  | 'handle';

export interface GroupAgentsHoverBubbleProps {
  group: ToolboxGroup;
  tools: ToolboxTool[];
  FolderIcon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  onToggleGroupColumn: () => void;
  variant?: GroupHeaderVariant;
  fullyOpenClassCount?: number;
  anyOpenClassCount?: number;
  totalClassCount?: number;
  onExpandGroup?: () => void;
  onToggleToolForAllClasses?: (tool: ToolboxTool) => void;
  isToolAllOpen?: (tool: ToolboxTool) => boolean;
  onEnterGroup?: () => void;
  onOpenGroupPicker?: () => void;
}

export function GroupAgentsHoverBubble({
  group,
  tools,
  FolderIcon,
  onToggleGroupColumn,
  variant = 'default',
  fullyOpenClassCount = 0,
  anyOpenClassCount = 0,
  totalClassCount = 0,
  onExpandGroup,
  onToggleToolForAllClasses,
  isToolAllOpen,
  onEnterGroup,
  onOpenGroupPicker,
}: GroupAgentsHoverBubbleProps) {
  const [open, setOpen] = useState(false);

  const previewLimit = onOpenGroupPicker ? 8 : 40;
  const previewTools = tools.slice(0, previewLimit);
  const remainingCount = Math.max(0, tools.length - previewTools.length);

  const allClassesOpen = totalClassCount > 0 && fullyOpenClassCount === totalClassCount;
  const summaryChipText = allClassesOpen
    ? `全班已开 · ${tools.length}项`
    : anyOpenClassCount > 0 && totalClassCount > 0
      ? `部分 ${fullyOpenClassCount}/${totalClassCount} · ${tools.length}项`
      : `全选 · ${tools.length}个`;

  const triggerElement =
    variant === 'collapsed-tree' ? (
      <div className="rain-matrix-collapsed-header-wrap">
        <button
          type="button"
          className="rain-matrix-tool-header-btn is-collapsed-main"
          onClick={onToggleGroupColumn}
          title={`点击为当前页班级批量切换「${group.name}」`}
        >
          <FolderIcon size={22} aria-hidden />
          <span className="rain-matrix-collapsed-title">{group.name}</span>
        </button>
        <button
          type="button"
          className="rain-matrix-expand-tree-btn"
          onClick={() => {
            setOpen(false);
            onExpandGroup?.();
          }}
        >
          <span>+ 展开 {tools.length}项</span>
        </button>
      </div>
    ) : variant === 'handle' ? (
      <button
        type="button"
        className="rain-matrix-handle-header-btn"
        data-coverage={allClassesOpen ? 'all' : anyOpenClassCount > 0 ? 'partial' : 'none'}
        onClick={onToggleGroupColumn}
        aria-label={`${group.name}整组批量切换`}
      >
        <FolderIcon size={15} aria-hidden />
        <span className="rain-matrix-handle-label">{allClassesOpen ? '已全' : '全组'}</span>
        <span className="rain-matrix-handle-count">{tools.length}项</span>
      </button>
    ) : variant === 'panoramic' && (onEnterGroup || onOpenGroupPicker) ? (
      <div className="rain-matrix-collapsed-header-wrap">
        <button
          type="button"
          className="rain-matrix-tool-header-btn is-collapsed-main"
          onClick={onToggleGroupColumn}
          title={`点击为当前全部班级开关「${group.name}」整组`}
        >
          <FolderIcon size={22} aria-hidden />
          <span className="rain-matrix-collapsed-title">{group.name}</span>
        </button>
        <button
          type="button"
          className="rain-matrix-expand-tree-btn"
          onClick={() => {
            setOpen(false);
            if (onEnterGroup) {
              onEnterGroup();
            } else {
              onOpenGroupPicker?.();
            }
          }}
        >
          <span>{onEnterGroup ? `进组 ${tools.length}` : `检索 ${tools.length}项`}</span>
        </button>
      </div>
    ) : (
      <button
        type="button"
        className={
          variant === 'summary'
            ? 'rain-matrix-tool-header-btn is-summary-col'
            : variant === 'panoramic'
              ? 'rain-matrix-tool-header-btn is-panoramic-col'
              : 'rain-matrix-tool-header-btn'
        }
        onClick={onToggleGroupColumn}
      >
        {variant === 'summary' ? (
          <>
            <span className="rain-matrix-summary-kicker">
              <FolderIcon size={14} aria-hidden />
              <span>整组总控</span>
            </span>
            <span className="rain-matrix-summary-group-name">{group.name}</span>
            <span
              className="rain-matrix-summary-action-chip"
              data-all-open={allClassesOpen ? 'true' : undefined}
            >
              {summaryChipText}
            </span>
          </>
        ) : variant === 'panoramic' ? (
          <>
            <FolderIcon size={24} aria-hidden />
            <span className="rain-matrix-collapsed-title">{group.name}</span>
            <span
              className="rain-matrix-tool-sub"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {allClassesOpen ? `全班已开 · ${tools.length}项` : `${tools.length} 个工具`}
            </span>
          </>
        ) : (
          <>
            <FolderIcon size={28} aria-hidden />
            <span className="rain-matrix-tool-title">{group.name}</span>
            <span
              className="rain-matrix-tool-sub"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {allClassesOpen ? `全班已开 · ${tools.length}项` : `${tools.length} 个工具`}
            </span>
          </>
        )}
      </button>
    );

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (details.reason === 'trigger-press') {
          details.cancel();
          return;
        }
        setOpen(nextOpen);
      }}
    >
      <Popover.Trigger
        openOnHover
        delay={80}
        closeDelay={120}
        render={triggerElement}
      />

      <Popover.Content
        width={onToggleToolForAllClasses ? 296 : 268}
        localRecipe={matrixGroupAgentsPopoverRecipe}
        positionerProps={{
          side: 'bottom',
          align: 'center',
          sideOffset: 6,
        }}
      >
        <div className="rain-matrix-group-popover-header">
          <Popover.Title className="rain-matrix-group-popover-title">
            {group.name}
          </Popover.Title>
          <span className="rain-matrix-group-popover-count">
            {tools.length} 个智能体
          </span>
        </div>

        {previewTools.length > 0 ? (
          <ul
            className="rain-matrix-group-popover-list"
            aria-label={`${group.name}包含的智能体列表`}
          >
            {previewTools.map((tool) => {
              const toolAllOpen = isToolAllOpen ? isToolAllOpen(tool) : false;
              return (
                <li key={tool.id} className="rain-matrix-group-popover-item">
                  <img
                    src={tool.coverSrc}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="rain-matrix-group-popover-thumb"
                  />
                  <span className="rain-matrix-group-popover-name" title={tool.name}>
                    {tool.name}
                  </span>
                  <span
                    className="rain-matrix-tool-popover-type-text"
                    data-type={tool.type}
                  >
                    {tool.type}
                  </span>
                  {onToggleToolForAllClasses && (
                    <button
                      type="button"
                      className="rain-matrix-popover-quick-all-btn"
                      data-active={toolAllOpen ? 'true' : 'false'}
                      onClick={() => onToggleToolForAllClasses(tool)}
                    >
                      {toolAllOpen ? '全班已开' : '开给全班'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rain-matrix-group-popover-empty">
            该分组下暂无智能体
          </div>
        )}

        {remainingCount > 0 && (
          <div className="rain-matrix-group-popover-more">
            另有 {remainingCount} 个工具，可打开宽面板搜索配置
          </div>
        )}

        <div className="rain-matrix-group-popover-footer">
          {onOpenGroupPicker ? (
            <button
              type="button"
              className="rain-matrix-popover-wide-action-btn"
              onClick={() => {
                setOpen(false);
                onOpenGroupPicker();
              }}
            >
              打开宽面板批量检索配置 ({tools.length}项)
            </button>
          ) : onEnterGroup ? (
            <button
              type="button"
              className="rain-matrix-popover-wide-action-btn"
              onClick={() => {
                setOpen(false);
                onEnterGroup();
              }}
            >
              进入「{group.name}」组内矩阵视图 →
            </button>
          ) : variant === 'collapsed-tree' ? (
            '点击组名批量切换全部班级，点「+ 展开」可单选工具'
          ) : variant === 'panoramic' ? (
            '点击表头可整组批量切换，右侧按钮可对全班开关单个工具'
          ) : (
            '点击表头可批量切换当前页班级'
          )}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
