import type { MouseEvent } from 'react';
import { Tooltip } from '@rain-next/ui';
import { CheckBoldIcon } from '@rain-next/ui/icons/check-bold';

export type MatrixCellState = 'open' | 'partial' | 'closed';

export interface MatrixCheckButtonProps {
  state: MatrixCellState;
  variant?: 'tool' | 'group';
  partialInfo?: { openCount: number; totalCount: number };
  ariaLabel: string;
  tooltipText: string;
  onToggle: () => void;
  onCellMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void;
  onCellMouseEnter?: () => void;
  dragPaintMode?: boolean;
}

export function MatrixCheckButton({
  state,
  variant = 'tool',
  partialInfo,
  ariaLabel,
  tooltipText,
  onToggle,
  onCellMouseDown,
  onCellMouseEnter,
  dragPaintMode = false,
}: MatrixCheckButtonProps) {
  return (
    <Tooltip text={tooltipText} portal openDelay={260}>
      <button
        type="button"
        className="rain-matrix-cell-btn"
        data-state={state}
        data-variant={variant}
        aria-label={ariaLabel}
        aria-pressed={state === 'open'}
        onMouseDown={onCellMouseDown}
        onMouseEnter={onCellMouseEnter}
        onClick={(e) => {
          if (dragPaintMode && e.detail > 0) {
            return;
          }
          onToggle();
        }}
      >
        {variant === 'group' ? (
          <>
            {state === 'open' && (
              <span className="rain-matrix-group-cell-open" aria-hidden="true">
                <CheckBoldIcon size={11} />
                <span>
                  {partialInfo ? `${partialInfo.openCount}/${partialInfo.totalCount}` : '全选'}
                </span>
              </span>
            )}
            {state === 'partial' && (
              <span className="rain-matrix-group-cell-partial" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <circle
                    cx="8"
                    cy="8"
                    r="6.25"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M5 8H11"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                {partialInfo && (
                  <span>
                    {partialInfo.openCount}/{partialInfo.totalCount}
                  </span>
                )}
              </span>
            )}
            {state === 'closed' && (
              <span className="rain-matrix-group-cell-closed" aria-hidden="true">
                全选
              </span>
            )}
          </>
        ) : (
          <>
            {state === 'open' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  backgroundColor: 'var(--rain-matrix-check-open-bg)',
                }}
                aria-hidden="true"
              >
                <CheckBoldIcon
                  size={15}
                  style={{ color: 'var(--rain-matrix-check-open-color)' }}
                />
              </span>
            )}
            {state === 'partial' && (
              <span className="rain-matrix-group-cell-partial" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <circle
                    cx="8"
                    cy="8"
                    r="6.25"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M5 8H11"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                {partialInfo && (
                  <span>
                    {partialInfo.openCount}/{partialInfo.totalCount}
                  </span>
                )}
              </span>
            )}
            {state === 'closed' && (
              <span className="rain-matrix-circle-ring" aria-hidden="true">
                <CheckBoldIcon
                  size={10}
                  className="rain-matrix-circle-ghost-check"
                />
              </span>
            )}
          </>
        )}
      </button>
    </Tooltip>
  );
}
