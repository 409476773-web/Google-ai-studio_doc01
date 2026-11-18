import {
  forwardRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import {
  resolveTabsSize,
  tabsAppearanceRecipes,
  tabsGeometry,
  tabsSizeClassNames,
  tabsSizeRecipes,
  useDensity,
  type TabsSize,
} from "@rain-next/foundations";
import { getRainLocalRecipePart, type RainLocalRecipe } from "../recipes/local-recipe";
import { rainCn } from "../utils/rain-class-names";

export type { TabsSize };
export type TabsValue = string;
export type TabsAppearance = "line" | "contained" | "soft";
export type TabsPanelMount = "all" | "active" | "lazy";
export type TabsPart =
  | "root"
  | "nav"
  | "list"
  | "tab"
  | "indicator"
  | "panel";
export type TabsLocalRecipe = RainLocalRecipe<TabsPart, "ui-tabs">;
export type TabsChangeDetails = BaseTabs.Root.ChangeEventDetails;

export interface TabsItem {
  value: TabsValue;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  count?: number | string;
  description?: ReactNode;
}

export interface TabsNavProps {
  position?: "top" | "bottom" | "start" | "end";
  align?: "start" | "center";
  indicatorSize?: "content" | "stretch";
  showDivider?: boolean;
  extraStart?: ReactNode;
  extraEnd?: ReactNode;
}

export interface TabsRootProps
  extends Omit<
    BaseTabs.Root.Props,
    "value" | "defaultValue" | "onValueChange" | "className" | "style"
  > {
  value?: TabsValue;
  defaultValue?: TabsValue;
  onValueChange?: (value: TabsValue, details: TabsChangeDetails) => void;
  className?: string;
  style?: CSSProperties;
}

export interface TabsProps extends TabsRootProps, TabsNavProps {
  items: readonly TabsItem[];
  size?: TabsSize;
  appearance?: TabsAppearance;
  mountMode?: TabsPanelMount;
  localRecipe?: TabsLocalRecipe;
  "aria-label"?: string;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    items,
    value,
    defaultValue,
    onValueChange,
    size,
    appearance = "line",
    position = "top",
    align = "start",
    indicatorSize = "content",
    showDivider = false,
    mountMode = "active",
    extraStart,
    extraEnd,
    localRecipe,
    className,
    style,
    "aria-label": ariaLabel,
    ...rootProps
  },
  ref,
) {
  const density = useDensity();
  const resolvedSize = resolveTabsSize(size, density);
  const sizeRecipe = tabsSizeRecipes[resolvedSize];
  const appearanceRecipe = tabsAppearanceRecipes[appearance];

  const fallbackDefault = defaultValue ?? items[0]?.value ?? "";
  const [internalValue, setInternalValue] = useState<TabsValue>(fallbackDefault);
  const controlled = value !== undefined;
  const activeValue = controlled ? value : internalValue;

  const orientation =
    position === "start" || position === "end" ? "vertical" : "horizontal";

  const cssVars = {
    "--tabs-gap": `${appearanceRecipe.gap}px`,
    "--tabs-content-gap": `${appearanceRecipe.contentGap}px`,
    "--tabs-radius": `${appearanceRecipe.radius}px`,
    "--tabs-paint-radius": `${appearanceRecipe.paintRadius}px`,
    "--tabs-inset": `${appearanceRecipe.inset}px`,
    "--tabs-border": `${appearanceRecipe.border}px`,
    "--tabs-padding": `${tabsGeometry.paddingInline}px`,
    "--tabs-nav-width": `${tabsGeometry.verticalNavWidth}px`,
    "--tabs-panel-gap": `${tabsGeometry.panelGap}px`,
    "--tabs-font": `${sizeRecipe.fontSize}px`,
    "--tabs-line": `${sizeRecipe.lineHeight}px`,
    "--tabs-icon": `${sizeRecipe.icon}px`,
    "--tabs-count-font": `${sizeRecipe.countFontSize}px`,
    "--tabs-count-line": `${sizeRecipe.countLineHeight}px`,
    "--tabs-indicator": `${sizeRecipe.indicator}px`,
    "--tabs-max-indicator": `${sizeRecipe.maxContentIndicator}px`,
    "--tabs-height": `${sizeRecipe.height}px`,
    ...style,
  } as CSSProperties;

  return (
    <BaseTabs.Root
      {...rootProps}
      ref={ref}
      value={activeValue}
      orientation={orientation}
      onValueChange={(nextVal, details) => {
        const strVal = String(nextVal);
        if (!controlled) {
          setInternalValue(strVal);
        }
        onValueChange?.(strVal, details);
      }}
      data-rain-id="ui-tabs"
      data-slot="root"
      data-position={position}
      data-appearance={appearance}
      data-size={resolvedSize}
      data-density={density}
      data-local-recipe={localRecipe?.id}
      style={cssVars}
      className={rainCn(
        "rain-tabs",
        className,
        getRainLocalRecipePart(localRecipe, "root"),
      )}
    >
      <div
        className={rainCn("rain-tabs__nav", getRainLocalRecipePart(localRecipe, "nav"))}
        data-position={position}
        data-align={align}
      >
        <div className="rain-tabs__nav-row">
          {extraStart && <div data-part="extra-start">{extraStart}</div>}
          <div className="rain-tabs__viewport">
            <div className="rain-tabs__tray">
              <BaseTabs.List
                aria-label={ariaLabel}
                className={rainCn(
                  "rain-tabs__list",
                  getRainLocalRecipePart(localRecipe, "list"),
                )}
              >
                {items.map((item) => {
                  const selected = item.value === activeValue;
                  return (
                    <BaseTabs.Tab
                      key={item.value}
                      value={item.value}
                      disabled={item.disabled}
                      data-selected={selected ? "true" : "false"}
                      data-disabled={item.disabled ? "true" : undefined}
                      data-position={position}
                      data-indicator-size={indicatorSize}
                      className={rainCn(
                        "rain-tabs__tab",
                        tabsSizeClassNames[resolvedSize],
                        getRainLocalRecipePart(localRecipe, "tab"),
                      )}
                    >
                      <span className="rain-tabs__item-content">
                        {item.icon && (
                          <span className="rain-tabs__icon" aria-hidden="true">
                            {item.icon}
                          </span>
                        )}
                        <span className="rain-tabs__label">{item.label}</span>
                        {item.count !== undefined && (
                          <span className="rain-tabs__count">{item.count}</span>
                        )}
                        {appearance === "line" && selected && (
                          <span
                            aria-hidden="true"
                            className={rainCn(
                              "rain-tabs__indicator bg-[var(--rain-color-brand-primary)]",
                              getRainLocalRecipePart(localRecipe, "indicator"),
                            )}
                          />
                        )}
                      </span>
                    </BaseTabs.Tab>
                  );
                })}
              </BaseTabs.List>
            </div>
          </div>
          {extraEnd && <div data-part="extra-end">{extraEnd}</div>}
          {showDivider && (
            <div
              aria-hidden="true"
              className="rain-tabs__divider bg-[var(--rain-category-border-neutral-3)]"
            />
          )}
        </div>
      </div>

      <div className="rain-tabs__panels">
        {items.map((item) => {
          if (mountMode === "active" && item.value !== activeValue) {
            return null;
          }
          return (
            <BaseTabs.Panel
              key={item.value}
              value={item.value}
              keepMounted={mountMode === "all"}
              className={rainCn(
                "rain-tabs__panel outline-none",
                getRainLocalRecipePart(localRecipe, "panel"),
              )}
            >
              {item.content}
            </BaseTabs.Panel>
          );
        })}
      </div>
    </BaseTabs.Root>
  );
});

Tabs.displayName = "Tabs";
