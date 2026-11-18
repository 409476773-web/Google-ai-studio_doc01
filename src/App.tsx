import { useState } from 'react';
import { DensityProvider } from '@rain-next/foundations';
import {
  Button,
  Switch,
  Toaster,
  ToggleGroup,
  ToggleGroupItem,
  toast,
} from '@rain-next/ui';
import { ToolboxIcon } from '@rain-next/ui/icons/toolbox';
import { RefreshIcon } from '@rain-next/ui/icons/refresh';
import { SchemeSwitcherFab } from './components/SchemeSwitcherFab';
import { ToolboxMatrixPanel } from './components/ToolboxMatrixPanel';
import type { MatrixHierarchyScheme } from './data/design-schemes';
import {
  getToolboxToolsByScale,
  type ToolboxDataScale,
} from './data/toolbox-matrix-data';
import {
  clearSavedRelations,
  loadSavedRelations,
  resetSavedRelationsToDefault,
} from './services/toolbox-relations-store';

export default function App() {
  const [panelOpen, setPanelOpen] = useState(true);
  const [sessionKey, setSessionKey] = useState(0);
  const [simulateSaveFailure, setSimulateSaveFailure] = useState(false);
  const [savedCount, setSavedCount] = useState(() => loadSavedRelations().size);
  const [activeScheme, setActiveScheme] = useState<MatrixHierarchyScheme>('scheme-10');
  const [dataScale, setDataScale] = useState<ToolboxDataScale>('large');

  const toolsCatalog = getToolboxToolsByScale(dataScale);

  function handleReenterPage() {
    setPanelOpen(true);
    setSessionKey((k) => k + 1);
    setSavedCount(loadSavedRelations().size);
    toast.add({
      type: 'info',
      title: '已重新进入发布百宝箱页面',
      description: '已自动恢复此前持久化的班级 × 工具开放关系',
    });
  }

  function handleResetDefault() {
    const next = resetSavedRelationsToDefault();
    setSavedCount(next.size);
    setPanelOpen(true);
    setSessionKey((k) => k + 1);
    toast.add({
      type: 'success',
      title: '已恢复默认开放关系',
      description: `已重置为 ${next.size} 项默认班级开放权限`,
    });
  }

  function handleClearAllSaved() {
    clearSavedRelations();
    setSavedCount(0);
    setPanelOpen(true);
    setSessionKey((k) => k + 1);
    toast.add({
      type: 'info',
      title: '已清空已保存的开放关系',
      description: '可验证“未选择班级或工具时保存按钮不可用”规则',
    });
  }

  return (
    <DensityProvider density="default">
      <Toaster theme="light">
        <div className="rain-matrix-stage">
          {/* 外部演示验证条（位于 1116px 固定页面容器之外，不影响页面本身宽度与布局） */}
          <div className="rain-matrix-preview-bar">
            <div className="rain-matrix-preview-bar__group">
              <ToolboxIcon
                size={16}
                style={{ color: 'var(--rain-color-brand-primary)' }}
              />
              <span
                style={{
                  fontWeight: 600,
                  color: 'var(--rain-color-text-primary)',
                }}
              >
                百宝箱发布矩阵工作台
              </span>
              <span aria-hidden="true">·</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                固定宽度 1116px
              </span>
              <span aria-hidden="true">·</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                已持久化 {savedCount} 项开放关系
              </span>
            </div>

            <div className="rain-matrix-preview-bar__group" style={{ gap: 14 }}>
              <div className="rain-matrix-preview-bar__group" style={{ gap: 6 }}>
                <span style={{ color: 'var(--rain-category-text-neutral-3)' }}>
                  工具规模
                </span>
                <ToggleGroup
                  aria-label="演示工具数据规模"
                  value={[dataScale]}
                  spacing={0}
                  className="rain-matrix-mode-switch"
                  onValueChange={(vals) => {
                    const next = vals[0];
                    if (next === 'standard' || next === 'large') {
                      setDataScale(next);
                    }
                  }}
                >
                  <ToggleGroupItem value="standard" className="rain-matrix-mode-item">
                    15项常规
                  </ToggleGroupItem>
                  <ToggleGroupItem value="large" className="rain-matrix-mode-item">
                    120项压测
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <Switch
                  size="small"
                  checked={simulateSaveFailure}
                  onCheckedChange={setSimulateSaveFailure}
                  aria-label="模拟保存失败"
                />
                <span
                  style={{
                    color: simulateSaveFailure
                      ? 'var(--rain-color-semantic-error)'
                      : 'var(--rain-category-text-neutral-3)',
                    fontWeight: simulateSaveFailure ? 600 : 400,
                  }}
                >
                  模拟保存失败
                </span>
              </label>

              <div className="rain-matrix-preview-bar__group" style={{ gap: 8 }}>
                <Button
                  variant="tertiary"
                  size="mini"
                  leadingIcon={<RefreshIcon />}
                  onClick={handleReenterPage}
                >
                  重新进入页面
                </Button>
                <Button variant="tertiary" size="mini" onClick={handleClearAllSaved}>
                  清空已保存
                </Button>
                <Button variant="tertiary" size="mini" onClick={handleResetDefault}>
                  恢复默认
                </Button>
              </div>
            </div>
          </div>

          {/* 固定宽度 1116px 的主页面容器 */}
          {panelOpen ? (
            <ToolboxMatrixPanel
              key={sessionKey}
              activeScheme={activeScheme}
              toolsCatalog={toolsCatalog}
              simulateSaveFailure={simulateSaveFailure}
              onClose={() => setPanelOpen(false)}
              onSavedSnapshotChange={setSavedCount}
            />
          ) : (
            <div className="rain-toolbox-matrix-shell rain-matrix-closed-state">
              <div className="rain-matrix-closed-icon">
                <ToolboxIcon size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--rain-color-text-primary)',
                  }}
                >
                  已关闭百宝箱发布配置
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: 'var(--rain-category-text-neutral-3)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  当前已保存 {savedCount} 项开放关系，再次进入将自动保持选中状态。
                </p>
              </div>
              <Button variant="primary" size="medium" onClick={handleReenterPage}>
                重新进入发布百宝箱
              </Button>
            </div>
          )}

          {/* 左下角悬浮方案切换 IconButton（收拢全部方案切换操作） */}
          <SchemeSwitcherFab
            activeScheme={activeScheme}
            onSelectScheme={setActiveScheme}
          />
        </div>
      </Toaster>
    </DensityProvider>
  );
}
