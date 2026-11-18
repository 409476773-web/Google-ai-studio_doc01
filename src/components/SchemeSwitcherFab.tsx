import { useEffect, useRef, useState } from 'react';
import { Button, IconButton, Popover, Tooltip } from '@rain-next/ui';
import { ArrowLeftIcon } from '@rain-next/ui/icons/arrow-left';
import { ArrowRightIcon } from '@rain-next/ui/icons/arrow-right';
import { CheckBoldIcon } from '@rain-next/ui/icons/check-bold';
import { LayoutSplitIcon } from '@rain-next/ui/icons/layout-split';
import {
  MATRIX_DESIGN_SCHEMES,
  MATRIX_SCHEME_GROUPS,
  type MatrixHierarchyScheme,
} from '../data/design-schemes';
import { matrixFloatingFabRecipe } from './matrix-recipes';

export interface SchemeSwitcherFabProps {
  activeScheme: MatrixHierarchyScheme;
  onSelectScheme: (scheme: MatrixHierarchyScheme) => void;
}

export function SchemeSwitcherFab({
  activeScheme,
  onSelectScheme,
}: SchemeSwitcherFabProps) {
  const [open, setOpen] = useState(false);
  const activeCardRef = useRef<HTMLButtonElement>(null);

  const currentIndex = MATRIX_DESIGN_SCHEMES.findIndex((s) => s.id === activeScheme);
  const currentScheme =
    MATRIX_DESIGN_SCHEMES[currentIndex >= 0 ? currentIndex : 0];

  function handleStep(delta: -1 | 1) {
    const nextIndex =
      (Math.max(0, currentIndex) + delta + MATRIX_DESIGN_SCHEMES.length) %
      MATRIX_DESIGN_SCHEMES.length;
    onSelectScheme(MATRIX_DESIGN_SCHEMES[nextIndex].id);
  }

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        activeCardRef.current?.scrollIntoView({ block: 'nearest' });
      });
    }
  }, [open, activeScheme]);

  return (
    <div className="rain-matrix-fab-anchor" data-rain-theme="light">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <div className="rain-matrix-fab-dock">
          <Tooltip
            text={`展开方案列表（当前：${currentScheme.shortName} · ${currentScheme.title}）`}
            placement="top"
            portal
            disabled={open}
          >
            <Popover.Trigger
              render={
                <button
                  type="button"
                  className="rain-matrix-fab-trigger-btn"
                  data-open={open ? 'true' : 'false'}
                  aria-label="切换设计方案"
                >
                  <span className="rain-matrix-fab-icon" aria-hidden="true">
                    <LayoutSplitIcon size={16} />
                  </span>
                  <span className="rain-matrix-fab-label">{currentScheme.shortName}</span>
                  <span className="rain-matrix-fab-sep" aria-hidden="true">
                    ·
                  </span>
                  <span className="rain-matrix-fab-sub">{currentScheme.title}</span>
                  <span className="rain-matrix-fab-index">
                    {currentScheme.code}/{String(MATRIX_DESIGN_SCHEMES.length).padStart(2, '0')}
                  </span>
                </button>
              }
            />
          </Tooltip>

          <span className="rain-matrix-fab-divider" aria-hidden="true" />

          <div className="rain-matrix-fab-steps">
            <IconButton
              size="24/14"
              aria-label="上一个方案"
              icon={<ArrowLeftIcon />}
              localRecipe={matrixFloatingFabRecipe}
              onClick={() => handleStep(-1)}
            />
            <IconButton
              size="24/14"
              aria-label="下一个方案"
              icon={<ArrowRightIcon />}
              localRecipe={matrixFloatingFabRecipe}
              onClick={() => handleStep(1)}
            />
          </div>
        </div>

        <Popover.Content
          width={412}
          positionerProps={{
            side: 'top',
            align: 'start',
            sideOffset: 10,
          }}
          className="rain-matrix-scheme-popover"
        >
          <div className="rain-matrix-scheme-popover-header">
            <div>
              <Popover.Title className="rain-matrix-scheme-popover-title">
                交互层级方案对比（共 {MATRIX_DESIGN_SCHEMES.length} 套）
              </Popover.Title>
              <Popover.Description className="rain-matrix-scheme-popover-desc">
                切换方案自动保留当前的课程班级与工具勾选状态
              </Popover.Description>
            </div>
            <span className="rain-matrix-scheme-counter">
              {currentScheme.code}/{String(MATRIX_DESIGN_SCHEMES.length).padStart(2, '0')}
            </span>
          </div>

          <div
            className="rain-matrix-scheme-list"
            role="radiogroup"
            aria-label="设计方案列表"
          >
            {MATRIX_SCHEME_GROUPS.map((grp) => {
              const items = MATRIX_DESIGN_SCHEMES.filter((s) => s.tier === grp.tier);
              return (
                <div key={grp.tier} className="rain-matrix-scheme-section">
                  <div className="rain-matrix-scheme-section-head">
                    <span className="rain-matrix-scheme-section-title">{grp.label}</span>
                    <span className="rain-matrix-scheme-section-hint">{grp.hint}</span>
                  </div>
                  <div className="rain-matrix-scheme-section-cards">
                    {items.map((scheme) => {
                      const selected = scheme.id === activeScheme;
                      return (
                        <button
                          key={scheme.id}
                          ref={selected ? activeCardRef : undefined}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          data-selected={selected ? 'true' : 'false'}
                          className="rain-matrix-scheme-card"
                          onClick={() => onSelectScheme(scheme.id)}
                        >
                          <span className="rain-matrix-scheme-code">{scheme.code}</span>
                          <span className="rain-matrix-scheme-body">
                            <span className="rain-matrix-scheme-title-row">
                              <span className="rain-matrix-scheme-name">
                                {scheme.shortName} · {scheme.title}
                              </span>
                              <span className="rain-matrix-scheme-tag">
                                · {scheme.patternTag}
                              </span>
                            </span>
                            <span className="rain-matrix-scheme-summary">
                              {scheme.summary}
                            </span>
                          </span>
                          <span className="rain-matrix-scheme-check" aria-hidden="true">
                            {selected ? <CheckBoldIcon size={12} /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rain-matrix-scheme-footer">
            <span className="rain-matrix-scheme-footer-hint">
              当前激活：{currentScheme.shortName}（{currentScheme.patternTag}）
            </span>
            <div className="rain-matrix-scheme-footer-actions">
              <Button
                variant="tertiary"
                size="mini"
                leadingIcon={<ArrowLeftIcon />}
                onClick={() => handleStep(-1)}
              >
                上一个
              </Button>
              <Button
                variant="tertiary"
                size="mini"
                trailingIcon={<ArrowRightIcon />}
                onClick={() => handleStep(1)}
              >
                下一个
              </Button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}
