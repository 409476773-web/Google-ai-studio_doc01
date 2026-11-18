import {
  defineRainLocalRecipe,
  type IconButtonPart,
  type PopoverPart,
  type SelectPart,
  type TabsPart,
} from '@rain-next/ui';

/**
 * 组合/改造 Rain UI Tabs：贴合弹窗顶部 54px 通栏导航，保留蓝色底线选中指示
 */
export const matrixTopTabsRecipe = defineRainLocalRecipe<TabsPart, 'ui-tabs'>({
  id: 'toolbox-matrix-top-tabs',
  scope: 'feature',
  origin: 'ui-tabs',
  classes: {
    root: 'rain-matrix-top-tabs',
    tab: 'rain-matrix-top-tabs-tab',
  },
  modifiedParts: ['root', 'tab'],
  candidateTokens: [
    '--rain-local-matrix-page-width',
    '--rain-local-matrix-border-color',
  ],
  promotionStatus: 'proposed',
});

/**
 * 组合/改造 Rain UI Select：用于表格合并表头与工具栏内的紧凑型无边框筛选器
 */
export const matrixHeaderSelectRecipe = defineRainLocalRecipe<SelectPart, 'ui-select'>({
  id: 'toolbox-matrix-header-select',
  scope: 'feature',
  origin: 'ui-select',
  classes: {
    root: 'rain-matrix-header-select-root',
    frame: 'rain-matrix-header-select-frame',
    value: 'rain-matrix-header-select-value',
    popup: 'min-w-[148px]',
  },
  modifiedParts: ['root', 'frame', 'value', 'popup'],
  candidateTokens: [],
  promotionStatus: 'proposed',
});

/**
 * 组合/改造 Rain UI IconButton：左下角悬浮方案切换入口按钮
 */
export const matrixFloatingFabRecipe = defineRainLocalRecipe<
  IconButtonPart,
  'ui-icon-button'
>({
  id: 'toolbox-matrix-floating-fab',
  scope: 'feature',
  origin: 'ui-icon-button',
  classes: {
    root: 'rain-matrix-fab-btn',
  },
  modifiedParts: ['root'],
  candidateTokens: [],
  promotionStatus: 'proposed',
});

/**
 * 组合/改造 Rain UI Popover：按分组发布表头的紧凑型智能体列表气泡
 */
export const matrixGroupAgentsPopoverRecipe = defineRainLocalRecipe<
  PopoverPart,
  'ui-popover'
>({
  id: 'toolbox-matrix-group-agents-popover',
  scope: 'feature',
  origin: 'ui-popover',
  classes: {
    content: 'rain-matrix-group-popover',
  },
  modifiedParts: ['content'],
  candidateTokens: [],
  promotionStatus: 'proposed',
});

/**
 * 组合/改造 Rain UI Popover：按工具发布表头的紧凑型工具详情气泡
 */
export const matrixToolDetailPopoverRecipe = defineRainLocalRecipe<
  PopoverPart,
  'ui-popover'
>({
  id: 'toolbox-matrix-tool-detail-popover',
  scope: 'feature',
  origin: 'ui-popover',
  classes: {
    content: 'rain-matrix-tool-popover',
  },
  modifiedParts: ['content'],
  candidateTokens: [],
  promotionStatus: 'proposed',
});
