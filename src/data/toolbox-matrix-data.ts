export type ClassSourceKind = 'school' | 'self';
export type ClassEdition = 'pro' | 'standard';
export type ClassOwnerRole = 'own' | 'collaborator';
export type ToolOwnershipType = '个人' | '系统' | '他人共享';
export type PublishMode = 'by-tool' | 'by-group';

export interface ClassSourceOption {
  id: string;
  label: string;
  kind: ClassSourceKind;
  shortCode?: string;
}

export interface CourseClassItem {
  id: string;
  courseId: string;
  courseName: string;
  /** 优先展示简称，无简称时回退至全称 */
  shortName?: string;
  fullName: string;
  sourceId: string;
  edition: ClassEdition;
  semester: string;
  ownerRole: ClassOwnerRole;
  studentCount: number;
}

export interface ToolboxGroup {
  id: string;
  name: string;
  shortName: string;
  description: string;
  iconIndex: number;
  accentColor: string;
}

export interface ToolboxTool {
  id: string;
  name: string;
  groupId: string;
  type: ToolOwnershipType;
  coverSrc: string;
  description: string;
  author: string;
}

export const CLASS_SOURCES: ClassSourceOption[] = [
  { id: 'school-cup', label: '中国石油大学(华东)', kind: 'school', shortCode: 'UPC' },
  { id: 'school-thu', label: '清华大学', kind: 'school', shortCode: 'THU' },
  { id: 'school-pku', label: '北京大学', kind: 'school', shortCode: 'PKU' },
  { id: 'self', label: '自建课', kind: 'self' },
];

export const SEMESTERS: string[] = [
  '2024春季学期',
  '2023秋季学期',
  '2023春季学期',
  '2022秋季学期',
];

export const CLASS_OWNER_OPTIONS = [
  { value: 'all', label: '全部班级' },
  { value: 'own', label: '本人班级' },
  { value: 'collaborator', label: '协同班级' },
] as const;

export const TOOLBOX_GROUPS: ToolboxGroup[] = [
  {
    id: 'grp-oral',
    name: '口语与语言训练',
    shortName: '口语训练',
    description: '包含口语测评、角色扮演、英文跟读等语言交互工具',
    iconIndex: 1,
    accentColor: '#2563EB',
  },
  {
    id: 'grp-tutor',
    name: '学科答疑辅导',
    shortName: '学科答疑',
    description: '面向数理化及工科基础课的智能答疑与解题辅导工具',
    iconIndex: 2,
    accentColor: '#7C3AED',
  },
  {
    id: 'grp-interact',
    name: '课堂互动工具',
    shortName: '课堂互动',
    description: '提升课堂参与度的分组讨论、点名与即时反馈工具',
    iconIndex: 3,
    accentColor: '#0D9488',
  },
  {
    id: 'grp-coding',
    name: '实验与编程助手',
    shortName: '编程实验',
    description: '支持代码评审、实验报告诊断与仿真实验辅助工具',
    iconIndex: 4,
    accentColor: '#0284C7',
  },
  {
    id: 'grp-exam',
    name: '作业与测评批阅',
    shortName: '作业批阅',
    description: '用于主观题智能预批阅、大题分析与错因归因的工具',
    iconIndex: 5,
    accentColor: '#D97706',
  },
  {
    id: 'grp-resource',
    name: '学术文献与写作',
    shortName: '学术文献',
    description: '辅助论文研读、文献综述梳理与学术规范自查',
    iconIndex: 6,
    accentColor: '#16A34A',
  },
];

export const TOOLBOX_TOOLS: ToolboxTool[] = [
  {
    id: 'tool-oral-eval',
    name: '口语测评智能体（进阶版）',
    groupId: 'grp-oral',
    type: '系统',
    coverSrc: '/assets/aistudio/__-2_02dc1e67.png',
    description: '实时识别发音准确度与流利度，生成逐句纠音建议',
    author: '雨课堂官方',
  },
  {
    id: 'tool-roleplay',
    name: '角色扮演',
    groupId: 'grp-oral',
    type: '个人',
    coverSrc: '/assets/aistudio/__-7_0e2304af.png',
    description: '支持设定教学情境与历史/行业人物，开展沉浸式对话',
    author: '张明远',
  },
  {
    id: 'tool-shadowing',
    name: '跟读智能体',
    groupId: 'grp-oral',
    type: '他人共享',
    coverSrc: '/assets/aistudio/__-8_4aa50f45.png',
    description: '提供分段慢速示范与语调对比，适用于外语与专业术语朗读',
    author: '李思琪',
  },
  {
    id: 'tool-third-party',
    name: '第三方智能体',
    groupId: 'grp-interact',
    type: '他人共享',
    coverSrc: '/assets/aistudio/___117de311.png',
    description: '接入校内教学知识库扩展插件，支持跨平台问答联动',
    author: '教务信息化中心',
  },
  {
    id: 'tool-ai-spar',
    name: 'AI陪练',
    groupId: 'grp-oral',
    type: '系统',
    coverSrc: '/assets/aistudio/__-6_e0457486.png',
    description: '根据学生水平动态调整对话难度与追问节奏',
    author: '雨课堂官方',
  },
  {
    id: 'tool-circuit-coach',
    name: '电路分析助教',
    groupId: 'grp-tutor',
    type: '个人',
    coverSrc: '/assets/aistudio/__-9_5daddb41.png',
    description: '针对基尔霍夫定律、相量法及暂态分析提供分步引导',
    author: '张明远',
  },
  {
    id: 'tool-physics-sim',
    name: '大学物理概念诊断',
    groupId: 'grp-tutor',
    type: '系统',
    coverSrc: '/assets/aistudio/__-5_54f92283.png',
    description: '识别力学与电磁学常见前概念误区并推送巩固练习',
    author: '雨课堂官方',
  },
  {
    id: 'tool-math-steps',
    name: '高数推导检查器',
    groupId: 'grp-tutor',
    type: '他人共享',
    coverSrc: '/assets/aistudio/__-10_4ded62fb.png',
    description: '核验微积分与线代演算步骤，定位跳步与符号错漏',
    author: '王教授团队',
  },
  {
    id: 'tool-debate-host',
    name: '课堂辩论主持',
    groupId: 'grp-interact',
    type: '个人',
    coverSrc: '/assets/aistudio/__-1_1cd71540.png',
    description: '组织正反方限时陈述并提炼课堂实时观点图谱',
    author: '张明远',
  },
  {
    id: 'tool-group-notes',
    name: '研讨纪要生成器',
    groupId: 'grp-interact',
    type: '系统',
    coverSrc: '/assets/aistudio/__-3_bc79a6cc.png',
    description: '自动汇总分组讨论要点并形成可导出的课堂简报',
    author: '雨课堂官方',
  },
  {
    id: 'tool-code-review',
    name: 'C/Python代码审阅',
    groupId: 'grp-coding',
    type: '系统',
    coverSrc: '/assets/aistudio/__-4_486c6480.png',
    description: '定位边界越界与逻辑隐患，给出不直接泄题的提示',
    author: '雨课堂官方',
  },
  {
    id: 'tool-lab-helper',
    name: '实验误差分析助手',
    groupId: 'grp-coding',
    type: '他人共享',
    coverSrc: '/assets/aistudio/__-5_54f92283.png',
    description: '辅助核对物理与电路实验测量数据的不确定度计算',
    author: '陈工实验中心',
  },
  {
    id: 'tool-essay-rubric',
    name: '大题采分点预审',
    groupId: 'grp-exam',
    type: '个人',
    coverSrc: '/assets/aistudio/__-10_4ded62fb.png',
    description: '按自定义评分细则对主观题作答进行结构化预审',
    author: '张明远',
  },
  {
    id: 'tool-mistake-map',
    name: '共性错因聚类',
    groupId: 'grp-exam',
    type: '系统',
    coverSrc: '/assets/aistudio/__-3_bc79a6cc.png',
    description: '聚合全班高频错误作答，辅助讲评课重点备课',
    author: '雨课堂官方',
  },
  {
    id: 'tool-paper-read',
    name: '学术文献速读助手',
    groupId: 'grp-resource',
    type: '他人共享',
    coverSrc: '/assets/aistudio/__-7_0e2304af.png',
    description: '提炼英文期刊论文研究方法、核心结论与实验对照表',
    author: '图书馆学科服务',
  },
];

export type ToolboxDataScale = 'standard' | 'large';

const EXTRA_COVER_POOL = [
  '/assets/aistudio/__-1_1cd71540.png',
  '/assets/aistudio/__-2_02dc1e67.png',
  '/assets/aistudio/__-3_bc79a6cc.png',
  '/assets/aistudio/__-4_486c6480.png',
  '/assets/aistudio/__-5_54f92283.png',
  '/assets/aistudio/__-6_e0457486.png',
  '/assets/aistudio/__-7_0e2304af.png',
  '/assets/aistudio/__-8_4aa50f45.png',
  '/assets/aistudio/__-9_5daddb41.png',
  '/assets/aistudio/__-10_4ded62fb.png',
];

const EXTRA_AUTHORS = ['雨课堂官方', '张明远', '李思琪', '王教授团队', '教务教学中心', '实验示范中心'];
const EXTRA_TYPES: ToolOwnershipType[] = ['系统', '个人', '他人共享'];

const LARGE_GROUP_SEED_TITLES: Record<string, string[]> = {
  'grp-oral': [
    '英语四六级口语模考',
    '学术会议英文答辩演练',
    '商务英语谈判情景舱',
    '专业术语音标纠错器',
    '多语种同声传译热身',
    '普通话水平测评助手',
    '跨文化交际对话教练',
    '英文摘要朗读韵律评分',
  ],
  'grp-tutor': [
    '线性代数矩阵求逆向导',
    '概率统计分布推导助教',
    '模电运算放大器分析',
    '数电时序逻辑化简器',
    '热力学第二定律辨析',
    '工程力学受力分析仪',
    '信号与系统频域诊断',
    '流体力学边界层问答',
    '化工原理精馏塔计算',
    '有机化学反应机理助教',
    '量子力学波函数可视化',
    '材料力学应力莫尔圆助手',
    '自动控制根轨迹讲评',
    '数字图像处理滤波实训',
    '电磁场与波矢量分析',
    '结构力学超静定求解',
    '物理化学相图解读器',
    '工程制图三视图纠错',
    '微积分分部积分训练',
    '常微分方程稳定性诊断',
    '复变函数留数计算向导',
    '数值分析插值误差演示',
    '运筹学线性规划单纯形',
    '油藏物理渗流力学助教',
    '地质构造演化推理助手',
  ],
  'grp-interact': [
    '随机分组破冰主持人',
    '课堂弹幕观点聚类器',
    '苏格拉底追问接龙',
    '限时抢答与互评裁判',
    'PBL项目里程碑督办',
    '跨小组盲审互评助手',
    '课前五分钟前测快评',
    '课堂困惑热区收集器',
    '角色互换辩论计时台',
    '翻转课堂领学任务卡',
    '情景模拟突发事件官',
    '团队协作贡献度自评',
    '结课海报路演提问官',
  ],
  'grp-coding': [
    'Verilog时序仿真审阅',
    'MATLAB数值脚本调试',
    'SQL查询执行计划优化',
    'Linux Shell排错沙盒',
    '数据结构链表指针追踪',
    '操作系统并发死锁检测',
    '计算机网络抓包剖析',
    'Git分支冲突解决向导',
    '单片机C51寄存器检查',
    'FPGA综合约束诊断仪',
    'Pandas数据清洗教练',
    'PyTorch张量维度检查',
    'Docker容器编排排查',
    '编译原理词法语法分析',
    '嵌入式中断向量调试',
    'Java面向对象重构助手',
    '前端无障碍语义审查器',
    '算法复杂度渐进分析仪',
    '机器人ROS节点通信检查',
    '示波器实验波形诊断',
    '传感器标定误差分析',
    '化学滴定终点判别助手',
    '金相显微组织识别训练',
    '风洞实验雷诺数换算器',
    'PLC梯形图逻辑校验',
    'CAD三维建模尺寸核查',
    '有限元网格质量体检',
    '网络安全渗透防御演练',
    '数据库范式规范化检查',
    'Web接口性能压测诊断',
    '物联网MQTT报文解析',
    '数字孪生仿真参数标定',
  ],
  'grp-exam': [
    '计算题过程步骤赋分器',
    '简答题语义要点比对',
    '实验报告格式规范初审',
    '期中试卷难度信度诊断',
    '知识点薄弱度雷达生成',
    '相似作业雷同段落预警',
    '编程题边界用例补全器',
    '设计题创新性分级评阅',
    '课程目标达成度核算',
    '错题本变式题自动生成',
    '口述题语音转写阅卷',
    '英文作文语法与逻辑批注',
    '毕业设计开题评分助手',
    '案例分析题论证链检查',
    '平时分多元权重核算器',
    '期末考前高频易错清单',
  ],
  'grp-resource': [
    'IEEE文献格式一键校对',
    '英文论文润色学术化助手',
    '研究综述脉络脑图提取',
    '实验数据图表规范自查',
    '专利检索关键词拓展器',
    '学术不端引用合规预检',
    '开题报告技术路线梳理',
    '中英文摘要术语一致性',
    '基金申报书逻辑结构审阅',
    '跨学科前沿文献速递',
    '答辩PPT核心论点精炼',
  ],
};

function buildLargeToolboxTools(): ToolboxTool[] {
  const result: ToolboxTool[] = [...TOOLBOX_TOOLS];
  let seq = 1;
  for (const group of TOOLBOX_GROUPS) {
    const seeds = LARGE_GROUP_SEED_TITLES[group.id] ?? [];
    seeds.forEach((title, idx) => {
      const ownership = EXTRA_TYPES[(seq + idx) % EXTRA_TYPES.length];
      result.push({
        id: `tool-ext-${group.id}-${idx + 1}`,
        name: title,
        groupId: group.id,
        type: ownership,
        coverSrc: EXTRA_COVER_POOL[(seq + idx) % EXTRA_COVER_POOL.length],
        description: `面向「${group.name}」场景的专项教学助手，支持班级按需授权与即时启用`,
        author:
          ownership === '系统'
            ? '雨课堂官方'
            : EXTRA_AUTHORS[(seq + idx) % EXTRA_AUTHORS.length],
      });
      seq += 1;
    });
  }
  return result;
}

export const LARGE_TOOLBOX_TOOLS: ToolboxTool[] = buildLargeToolboxTools();

export function getToolboxToolsByScale(scale: ToolboxDataScale): ToolboxTool[] {
  return scale === 'large' ? LARGE_TOOLBOX_TOOLS : TOOLBOX_TOOLS;
}

export const COURSE_CLASSES: CourseClassItem[] = [
  // 中国石油大学(华东) - 2024春季学期 - 本人班级 (专业版 + 非专业版混合，用于验证“选择学校时仅展示该校专业版班级”)
  {
    id: 'cls-cup-1',
    courseId: 'crs-exam-big',
    courseName: '大题考试综合实训',
    shortName: '2024春-大题考试综合实训(1班)',
    fullName: '2024年春季学期大题考试综合实训与能力评估第1教学班',
    sourceId: 'school-cup',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 64,
  },
  {
    id: 'cls-cup-2',
    courseId: 'crs-exam-big',
    courseName: '大题考试综合实训',
    shortName: '2024春-大题考试综合实训(2班)',
    fullName: '2024年春季学期大题考试综合实训与能力评估第2教学班',
    sourceId: 'school-cup',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 58,
  },
  {
    id: 'cls-cup-3',
    courseId: 'crs-physics-a',
    courseName: '大学物理(电磁与光学)',
    shortName: '2024春-大学物理(海工01班)',
    fullName: '2024年春季学期大学物理A(电磁与光学)海洋工程01合班',
    sourceId: 'school-cup',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 92,
  },
  {
    id: 'cls-cup-4',
    courseId: 'crs-physics-a',
    courseName: '大学物理(电磁与光学)',
    shortName: '2024春-大学物理(石工02班)',
    fullName: '2024年春季学期大学物理A(电磁与光学)石油工程02合班',
    sourceId: 'school-cup',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 88,
  },
  {
    id: 'cls-cup-5',
    courseId: 'crs-physics-a',
    courseName: '大学物理(电磁与光学)',
    // 刻意不配置 shortName，验证“优先拉取简称，全称次之”规则
    fullName: '2024年春季学期大学物理A(实验强化全称教学班)',
    sourceId: 'school-cup',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 45,
  },
  {
    id: 'cls-cup-6',
    courseId: 'crs-circuit',
    courseName: '电路原理',
    shortName: '2024春-电路原理第一学期(自动化1班)',
    fullName: '2024年春季学期电路原理第一学期自动化专业1班',
    sourceId: 'school-cup',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 72,
  },
  {
    id: 'cls-cup-7',
    courseId: 'crs-circuit',
    courseName: '电路原理',
    shortName: '2024春-电路原理第一学期(测控2班)',
    fullName: '2024年春季学期电路原理第一学期测控技术与仪器2班',
    sourceId: 'school-cup',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 68,
  },
  // 普通版班级（选择中国石油大学(华东)时不应展示！）
  {
    id: 'cls-cup-std-hidden',
    courseId: 'crs-physics-a',
    courseName: '大学物理(电磁与光学)',
    shortName: '2024春-普通版旁听班(不应显示)',
    fullName: '2024年春季学期大学物理普通版旁听班级',
    sourceId: 'school-cup',
    edition: 'standard',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 120,
  },
  // 中国石油大学(华东) - 2024春季学期 - 协同班级
  {
    id: 'cls-cup-collab-1',
    courseId: 'crs-circuit',
    courseName: '电路原理',
    shortName: '2024春-电路原理(协同实验班)',
    fullName: '2024年春季学期电路原理跨学院协同教学实验班',
    sourceId: 'school-cup',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'collaborator',
    studentCount: 54,
  },
  {
    id: 'cls-cup-collab-2',
    courseId: 'crs-python',
    courseName: 'Python程序设计基础',
    shortName: '2024春-Python基础(协同3班)',
    fullName: '2024年春季学期Python程序设计基础协同授课3班',
    sourceId: 'school-cup',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'collaborator',
    studentCount: 76,
  },
  // 中国石油大学(华东) - 2023秋季学期
  {
    id: 'cls-cup-23fall-1',
    courseId: 'crs-circuit-23',
    courseName: '电路原理(上)',
    shortName: '2023秋-电路原理(上)01班',
    fullName: '2023年秋季学期电路原理(上)电气工程01班',
    sourceId: 'school-cup',
    edition: 'pro',
    semester: '2023秋季学期',
    ownerRole: 'own',
    studentCount: 84,
  },
  {
    id: 'cls-cup-23fall-2',
    courseId: 'crs-circuit-23',
    courseName: '电路原理(上)',
    shortName: '2023秋-电路原理(上)02班',
    fullName: '2023年秋季学期电路原理(上)电气工程02班',
    sourceId: 'school-cup',
    edition: 'pro',
    semester: '2023秋季学期',
    ownerRole: 'own',
    studentCount: 81,
  },
  // 清华大学 - 专业版
  {
    id: 'cls-thu-1',
    courseId: 'crs-thu-ai',
    courseName: '人工智能导论',
    shortName: '2024春-AI导论(致理书院)',
    fullName: '2024年春季学期人工智能导论致理书院专业版班级',
    sourceId: 'school-thu',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 46,
  },
  {
    id: 'cls-thu-2',
    courseId: 'crs-thu-ai',
    courseName: '人工智能导论',
    shortName: '2024春-AI导论(未央书院)',
    fullName: '2024年春季学期人工智能导论未央书院专业版班级',
    sourceId: 'school-thu',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'collaborator',
    studentCount: 52,
  },
  {
    id: 'cls-thu-std-hidden',
    courseId: 'crs-thu-ai',
    courseName: '人工智能导论',
    shortName: '2024春-公开普通班(不应显示)',
    fullName: '2024年春季学期人工智能导论公开普通班',
    sourceId: 'school-thu',
    edition: 'standard',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 200,
  },
  // 北京大学 - 专业版
  {
    id: 'cls-pku-1',
    courseId: 'crs-pku-lit',
    courseName: '大学英语与跨文化沟通',
    shortName: '2024春-跨文化沟通(A班)',
    fullName: '2024年春季学期大学英语与跨文化沟通A班',
    sourceId: 'school-pku',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 38,
  },
  {
    id: 'cls-pku-2',
    courseId: 'crs-pku-lit',
    courseName: '大学英语与跨文化沟通',
    fullName: '2024年春季学期大学英语与跨文化沟通全称荣誉研修班',
    sourceId: 'school-pku',
    edition: 'pro',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 32,
  },
  // 自建课（不展示学校信息）
  {
    id: 'cls-self-1',
    courseId: 'crs-self-math',
    courseName: '考研高数冲刺专题',
    shortName: '2024春-高数冲刺一班',
    fullName: '2024年春季考研高等数学冲刺专题一班',
    sourceId: 'self',
    edition: 'standard',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 115,
  },
  {
    id: 'cls-self-2',
    courseId: 'crs-self-math',
    courseName: '考研高数冲刺专题',
    shortName: '2024春-高数冲刺二班',
    fullName: '2024年春季考研高等数学冲刺专题二班',
    sourceId: 'self',
    edition: 'standard',
    semester: '2024春季学期',
    ownerRole: 'own',
    studentCount: 98,
  },
  {
    id: 'cls-self-3',
    courseId: 'crs-self-oral',
    courseName: '学术英语听说工作坊',
    fullName: '2024年春季学术英语听说实战工作坊全称班',
    sourceId: 'self',
    edition: 'standard',
    semester: '2024春季学期',
    ownerRole: 'collaborator',
    studentCount: 40,
  },
  {
    id: 'cls-self-4',
    courseId: 'crs-self-oral',
    courseName: '学术英语听说工作坊',
    shortName: '2023秋-英语听说先导班',
    fullName: '2023年秋季学术英语听说先导班',
    sourceId: 'self',
    edition: 'standard',
    semester: '2023秋季学期',
    ownerRole: 'own',
    studentCount: 36,
  },
];

/** 优先拉取简称，全称次之 */
export function getClassDisplayName(cls: CourseClassItem): string {
  const short = cls.shortName?.trim();
  return short && short.length > 0 ? short : cls.fullName;
}

/** 初始已建立的开放关系（对应原型图中部分课程行默认全选开放） */
export const INITIAL_OPEN_RELATION_PAIRS: Array<[string, string]> = [
  // 大题考试综合实训 1班 & 2班 对第1页5个工具全部开放
  ['cls-cup-1', 'tool-oral-eval'],
  ['cls-cup-1', 'tool-roleplay'],
  ['cls-cup-1', 'tool-shadowing'],
  ['cls-cup-1', 'tool-third-party'],
  ['cls-cup-1', 'tool-ai-spar'],
  ['cls-cup-2', 'tool-oral-eval'],
  ['cls-cup-2', 'tool-roleplay'],
  ['cls-cup-2', 'tool-shadowing'],
  ['cls-cup-2', 'tool-third-party'],
  ['cls-cup-2', 'tool-ai-spar'],
  // 电路原理 1班 & 2班 对第1页5个工具全部开放 + 电路助教
  ['cls-cup-6', 'tool-oral-eval'],
  ['cls-cup-6', 'tool-roleplay'],
  ['cls-cup-6', 'tool-shadowing'],
  ['cls-cup-6', 'tool-third-party'],
  ['cls-cup-6', 'tool-ai-spar'],
  ['cls-cup-6', 'tool-circuit-coach'],
  ['cls-cup-7', 'tool-oral-eval'],
  ['cls-cup-7', 'tool-roleplay'],
  ['cls-cup-7', 'tool-shadowing'],
  ['cls-cup-7', 'tool-third-party'],
  ['cls-cup-7', 'tool-ai-spar'],
  ['cls-cup-7', 'tool-circuit-coach'],
  // 大学物理部分开放，用于演示分组模式下的“部分开放”状态
  ['cls-cup-3', 'tool-physics-sim'],
  // 自建课初始开放关系
  ['cls-self-1', 'tool-math-steps'],
  ['cls-self-1', 'tool-mistake-map'],
];
