import { useState } from 'react';
import { Popover } from '@rain-next/ui';
import type { ToolboxTool } from '../data/toolbox-matrix-data';
import { matrixToolDetailPopoverRecipe } from './matrix-recipes';

export interface ToolDetailHoverBubbleProps {
  tool: ToolboxTool;
  groupName: string;
  openClassCount?: number;
  totalClassCount?: number;
  onToggleToolColumn: () => void;
}

export function ToolDetailHoverBubble({
  tool,
  groupName,
  openClassCount = 0,
  totalClassCount = 0,
  onToggleToolColumn,
}: ToolDetailHoverBubbleProps) {
  const [open, setOpen] = useState(false);

  const isAllOpen = totalClassCount > 0 && openClassCount === totalClassCount;
  const isPartialOpen = openClassCount > 0 && openClassCount < totalClassCount;
  const subLabel =
    totalClassCount > 0 && openClassCount > 0
      ? isAllOpen
        ? `${tool.type} · 全开`
        : `${tool.type} · ${openClassCount}/${totalClassCount}`
      : tool.type;

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
        closeDelay={110}
        render={
          <button
            type="button"
            className="rain-matrix-tool-header-btn"
            data-coverage={isAllOpen ? 'all' : isPartialOpen ? 'partial' : 'none'}
            onClick={onToggleToolColumn}
          >
            <span className="rain-matrix-tool-cover-frame">
              <img
                src={tool.coverSrc}
                alt={tool.name}
                referrerPolicy="no-referrer"
                className="rain-matrix-tool-cover-img"
              />
            </span>
            <span className="rain-matrix-tool-title">{tool.name}</span>
            <span className="rain-matrix-tool-sub" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {subLabel}
            </span>
          </button>
        }
      />

      <Popover.Content
        width={252}
        localRecipe={matrixToolDetailPopoverRecipe}
        positionerProps={{
          side: 'bottom',
          align: 'center',
          sideOffset: 6,
        }}
      >
        <div className="rain-matrix-tool-popover-top">
          <img
            src={tool.coverSrc}
            alt=""
            referrerPolicy="no-referrer"
            className="rain-matrix-tool-popover-thumb"
          />
          <div className="rain-matrix-tool-popover-heading">
            <Popover.Title className="rain-matrix-tool-popover-title">
              {tool.name}
            </Popover.Title>
            <div className="rain-matrix-tool-popover-meta">
              <span
                className="rain-matrix-tool-popover-type-text"
                data-type={tool.type}
              >
                {tool.type}
              </span>
              {groupName && (
                <>
                  <span aria-hidden="true" className="rain-matrix-meta-dot">
                    ·
                  </span>
                  <span className="rain-matrix-tool-popover-group">
                    {groupName}
                  </span>
                </>
              )}
              {totalClassCount > 0 && (
                <>
                  <span aria-hidden="true" className="rain-matrix-meta-dot">
                    ·
                  </span>
                  <span className="rain-matrix-tool-popover-group" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    已开 {openClassCount}/{totalClassCount} 班
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <Popover.Description className="rain-matrix-tool-popover-desc">
          {tool.description}
        </Popover.Description>

        <div className="rain-matrix-tool-popover-footer">
          <span>提供方：{tool.author}</span>
          <span>{isAllOpen ? '点击取消全班' : '点击全班开放'}</span>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
