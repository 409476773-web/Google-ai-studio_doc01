export type MatrixHierarchyScheme =
  | 'scheme-1'
  | 'scheme-2'
  | 'scheme-3'
  | 'scheme-4'
  | 'scheme-5'
  | 'scheme-6'
  | 'scheme-7'
  | 'scheme-8'
  | 'scheme-9'
  | 'scheme-10'
  | 'scheme-11'
  | 'scheme-12';

export type MatrixSchemeTier = 'scalable' | 'unified' | 'mode-switch';

export interface MatrixDesignSchemeMeta {
  id: MatrixHierarchyScheme;
  code: string;
  tier: MatrixSchemeTier;
  shortName: string;
  title: string;
  patternTag: string;
  summary: string;
}

export const MATRIX_SCHEME_GROUPS: readonly {
  tier: MatrixSchemeTier;
  label: string;
  hint: string;
}[] = [
  {
    tier: 'scalable',
    label: '百级工具高扩展方案（推荐）',
    hint: '专为单组几十上百工具与零挤压顶梁优化',
  },
  {
    tier: 'unified',
    label: '单表统一规则演进',
    hint: '免顶部模式切换，同一套逻辑兼顾整组与单选',
  },
  {
    tier: 'mode-switch',
    label: '双模式切换对照',
    hint: '顶部按工具 / 按分组切换与筛选主从层级对照',
  },
];

export const MATRIX_DESIGN_SCHEMES: readonly MatrixDesignSchemeMeta[] = [
  {
    id: 'scheme-1',
    code: '01',
    tier: 'mode-switch',
    shortName: '方案一',
    title: '单行主从引导',
    patternTag: '双模式切换',
    summary: '分段主控开关内联指向白底从属筛选组；切至按分组时筛选组平滑退场。',
  },
  {
    id: 'scheme-2',
    code: '02',
    tier: 'mode-switch',
    shortName: '方案二',
    title: '双层阶梯控制',
    patternTag: '双模式切换',
    summary: '上层固定发布方式与分页主控，下层按模式切换筛选条件或分组概览。',
  },
  {
    id: 'scheme-3',
    code: '03',
    tier: 'mode-switch',
    shortName: '方案三',
    title: '表外策略前置',
    patternTag: '双模式切换',
    summary: '发布方式上提至表格上方策略栏；矩阵表头内仅保留当前维度筛选。',
  },
  {
    id: 'scheme-4',
    code: '04',
    tier: 'mode-switch',
    shortName: '方案四',
    title: '条件筛选胶囊',
    patternTag: '双模式切换',
    summary: '带图标主控开关直控分组与类型标签面板，支持按工具数量预览。',
  },
  {
    id: 'scheme-5',
    code: '05',
    tier: 'unified',
    shortName: '方案五',
    title: '同表分组引导列',
    patternTag: '单表融合',
    summary: '顶部跨列分组条打包同组；蓝色整组批控列与绿色单工具勾选层级分明，支持续页回跳总控。',
  },
  {
    id: 'scheme-6',
    code: '06',
    tier: 'unified',
    shortName: '方案六',
    title: '可展开树形分组列',
    patternTag: '折叠展开',
    summary: '默认 6 组一屏收起免翻页；点格子开整组，点「+ 展开」就地铺开组内单工具列。',
  },
  {
    id: 'scheme-7',
    code: '07',
    tier: 'unified',
    shortName: '方案七',
    title: '纯工具 + 顶梁批控刷选',
    patternTag: '纯工具刷选',
    summary: '表内 100% 只有工具列与绿勾；支持顶梁「整组开放」选班与行内按住左键横拉刷选。',
  },
  {
    id: 'scheme-8',
    code: '08',
    tier: 'unified',
    shortName: '方案八',
    title: '6列全景 + 原地微调气泡',
    patternTag: '一屏零翻页',
    summary: '全表固定 6 列分组一屏看全；点主体开整组，点右侧「▾」在原地可搜索气泡勾选单工具。',
  },
  {
    id: 'scheme-9',
    code: '09',
    tier: 'unified',
    shortName: '方案九',
    title: '工具卡 + 极窄控制柄',
    patternTag: '附着控制柄',
    summary: '将整组开关压窄为 42px 带进度条的附着边条，把 90% 宽度留给工具封面卡。',
  },
  {
    id: 'scheme-10',
    code: '10',
    tier: 'scalable',
    shortName: '方案十 · A',
    title: '分组导航 + 固定总控列',
    patternTag: '百级扩展 · A',
    summary: '上方 6 组全显导航页签，左 1 列常驻整组总控，右 4 列支持状态筛选、搜索与分页微调。',
  },
  {
    id: 'scheme-11',
    code: '11',
    tier: 'scalable',
    shortName: '方案十一 · B',
    title: '6列全景 + 宽面板检索微调',
    patternTag: '百级扩展 · B',
    summary: '主表恒定 6 大分组零翻页；点微调或检索打开 616px 双栏弹窗，支持切班、排序与批量勾选。',
  },
  {
    id: 'scheme-12',
    code: '12',
    tier: 'scalable',
    shortName: '方案十二 · C',
    title: '左冻结横滚 + 顶梁吸顶定位',
    patternTag: '百级扩展 · C',
    summary: '课程班级左侧冻结，顶部分组锚点实时高亮并支持快速步进横滚，组名吸顶不丢定位。',
  },
];
