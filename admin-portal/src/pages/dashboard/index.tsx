import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { ResponsiveGridLayout, useContainerWidth, type LayoutItem, type Layout, type ResponsiveLayouts } from 'react-grid-layout';
import { getCompactor } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetHeader, SheetContent } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Settings2, Lock, Unlock, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import api from '@/services/api';
import { TILE_REGISTRY, getDefaultLayouts, type DashboardData, type Layouts } from './tiles';

const STORAGE_KEY = 'providr_dashboard_layouts';
const HIDDEN_KEY = 'providr_dashboard_hidden';

type DateRange = '7d' | '30d' | '90d' | '12m';

function loadSavedLayouts(): Layouts | null {
  try {
    localStorage.removeItem('providr_dashboard_layout');
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      const defaults = getDefaultLayouts();
      return { lg: parsed, md: defaults.md, sm: defaults.sm, xs: defaults.xs };
    }
    return parsed;
  } catch { return null; }
}

function loadHiddenTiles(): string[] {
  try {
    const saved = localStorage.getItem(HIDDEN_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [editing, setEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [layouts, setLayouts] = useState<Layouts>(() => loadSavedLayouts() || getDefaultLayouts());
  const [hiddenTiles, setHiddenTiles] = useState<string[]>(() => loadHiddenTiles());
  const [expandedTile, setExpandedTile] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const { width, containerRef } = useContainerWidth();
  const breakpointRef = useRef<string>('lg');

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setData(res.data));
    api.get('/admin/dashboard/preferences').then((res) => {
      if (res.data.layout && typeof res.data.layout === 'object' && !Array.isArray(res.data.layout)) {
        const l = res.data.layout as Layouts;
        // Validate: lg layout should exist and use full 12-col grid
        const lgValid = l.lg?.length > 0 && l.lg.some((item) => item.w > 1);
        if (lgValid) {
          setLayouts(l);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
        }
      }
      if (res.data.hidden_tiles?.length) {
        setHiddenTiles(res.data.hidden_tiles);
        localStorage.setItem(HIDDEN_KEY, JSON.stringify(res.data.hidden_tiles));
      }
    }).catch(() => {});
  }, []);

  const savePrefs = useCallback((newLayouts: Layouts, hidden: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayouts));
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(hidden));
    api.put('/admin/dashboard/preferences', { layout: newLayouts, hidden_tiles: hidden }).catch(() => {});
  }, []);

  // Only save on explicit user actions (drag/resize), NOT on mount/compaction/breakpoint changes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragResize = useCallback((layout: any) => {
    const bp = breakpointRef.current as keyof Layouts;
    const updated = { ...layouts, [bp]: [...layout] };
    setLayouts(updated);
    savePrefs(updated, hiddenTiles);
  }, [savePrefs, hiddenTiles, layouts]);

  const onBreakpointChange = useCallback((newBreakpoint: string) => {
    breakpointRef.current = newBreakpoint;
  }, []);

  const toggleTile = useCallback((id: string) => {
    setHiddenTiles((prev) => {
      const next = prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id];
      savePrefs(layouts, next);
      return next;
    });
  }, [savePrefs, layouts]);

  const resetLayout = useCallback(() => {
    const def = getDefaultLayouts();
    setLayouts(def);
    setHiddenTiles([]);
    savePrefs(def, []);
  }, [savePrefs]);

  const visibleTiles = useMemo(
    () => TILE_REGISTRY.filter((t) => !hiddenTiles.includes(t.id)),
    [hiddenTiles],
  );

  const visibleLayouts = useMemo(() => {
    const filter = (arr: LayoutItem[] | undefined) => (arr || []).filter((l) => !hiddenTiles.includes(l.i));
    return {
      lg: filter(layouts.lg),
      md: filter(layouts.md),
      sm: filter(layouts.sm),
      xs: filter(layouts.xs),
    };
  }, [layouts, hiddenTiles]);

  // Expanded tile overlay
  if (expandedTile && data) {
    const tile = TILE_REGISTRY.find((t) => t.id === expandedTile);
    if (tile) {
      return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-8">
          <Card className="w-full max-w-5xl h-[80vh] flex flex-col">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-base">{tile.title}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setExpandedTile(null)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              {tile.render(data)}
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  const categories = [
    { key: 'overview', label: 'Overview' },
    { key: 'financial', label: 'Financial' },
    { key: 'incidents', label: 'Incidents' },
    { key: 'compliance', label: 'Compliance & Activity' },
  ];

  if (!data) {
    return (
      <div ref={containerRef as React.RefObject<HTMLDivElement>}>
        <p className="text-muted-foreground mt-8 text-center">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" ref={containerRef as React.RefObject<HTMLDivElement>}>
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', '12m'] as DateRange[]).map((r) => (
            <Button key={r} size="sm" variant={dateRange === r ? 'default' : 'outline'} onClick={() => setDateRange(r)}>
              {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : '12 Months'}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={editing ? 'default' : 'outline'} onClick={() => setEditing(!editing)}>
            {editing ? <Unlock className="h-3.5 w-3.5 mr-1.5" /> : <Lock className="h-3.5 w-3.5 mr-1.5" />}
            {editing ? 'Editing' : 'Edit Dashboard'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings2 className="h-3.5 w-3.5 mr-1.5" />
            Settings
          </Button>
        </div>
      </div>

      {/* Grid */}
      {width > 0 && <ResponsiveGridLayout
        className="layout"
        width={width}
        layouts={visibleLayouts as ResponsiveLayouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={120}
        dragConfig={{ enabled: editing, handle: '.drag-handle' }}
        resizeConfig={{ enabled: editing }}
        onDragStop={handleDragResize}
        onResizeStop={handleDragResize}
        onBreakpointChange={onBreakpointChange}
        compactor={getCompactor('vertical')}
        margin={[12, 12]}
      >
        {visibleTiles.map((tile) => (
          <div key={tile.id}>
            <Card className={`h-full flex flex-col overflow-hidden ${editing ? 'ring-1 ring-dashed ring-muted-foreground/30' : ''}`}>
              <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
                <div className="flex items-center gap-1.5">
                  {editing && (
                    <div className="drag-handle cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-muted-foreground">{tile.title}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpandedTile(tile.id)}>
                  <Maximize2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
              <div className="flex-1 px-3 pb-3 min-h-0">
                {tile.render(data)}
              </div>
            </Card>
          </div>
        ))}
      </ResponsiveGridLayout>}

      {/* Settings Drawer */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetHeader onClose={() => setSettingsOpen(false)}>
          <h3 className="text-base font-semibold">Dashboard Settings</h3>
        </SheetHeader>
        <SheetContent>
          <div className="space-y-6">
            <Button variant="outline" size="sm" className="w-full" onClick={resetLayout}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset to Default Layout
            </Button>

            {categories.map((cat) => {
              const tiles = TILE_REGISTRY.filter((t) => t.category === cat.key);
              return (
                <div key={cat.key}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat.label}</h4>
                  <div className="space-y-2">
                    {tiles.map((tile) => (
                      <div key={tile.id} className="flex items-center justify-between">
                        <span className="text-sm">{tile.title}</span>
                        <Switch checked={!hiddenTiles.includes(tile.id)} onCheckedChange={() => toggleTile(tile.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
