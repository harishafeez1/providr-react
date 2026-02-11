import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Activity, RefreshCw, Clock, Server, Database, HardDrive, Archive,
  Building2, Users, AlertTriangle, Layers, ArrowUpRight, ArrowDownRight,
  Star, CheckCircle2, XCircle, Minus,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api from '@/services/api';

/* ─── Types ──────────────────────────────────────────── */

type ServiceStatus = 'active' | 'warning' | 'inactive' | 'checking';

interface HealthResult {
  status: ServiceStatus;
  responseTime: number | null;
  lastChecked: Date | null;
}

interface PulseData {
  system: {
    php_version: string;
    laravel_version: string;
    environment: string;
    debug_mode: boolean;
    timezone: string;
    server_time: string;
  };
  database: {
    connected: boolean;
    driver: string;
    response_time_ms: number;
    pending_migrations: number | null;
  };
  queue: {
    driver: string;
    pending_jobs: number | null;
    failed_jobs: number;
  };
  storage: {
    disk_free_pct: number | null;
    disk_free_bytes: number | null;
    disk_total_bytes: number | null;
  };
  cache: {
    driver: string;
    connected: boolean;
  };
  memory: {
    current_mb: number;
    peak_mb: number;
    limit: string;
  };
}

interface SummaryCard { total: number; last_7_days?: number; last_30_days?: number }

interface DashboardData {
  summary: Record<string, SummaryCard>;
  recent_activity: { type: string; message: string; detail: string; date: string }[];
}

/* ─── Constants ──────────────────────────────────────── */

const PULSE_INTERVAL = 15_000;
const SLOW_THRESHOLD = 2000;
const TIMEOUT = 8000;
const MAX_HISTORY = 20;

const API_BASE = import.meta.env.VITE_APP_API_URL || 'http://localhost:8002/api';
const API_ORIGIN = new URL(API_BASE).origin;

const SERVICES = [
  { key: 'admin-portal', label: 'Admin Portal', url: `${API_ORIGIN}/admin-portal/` },
  { key: 'provider-portal', label: 'Provider Portal', url: import.meta.env.DEV ? 'http://localhost:5174/' : `${API_ORIGIN}/provider-portal/` },
  { key: 'customer-portal', label: 'Customer Portal', url: import.meta.env.DEV ? 'http://localhost:5176/' : `${API_ORIGIN}/customer-portal/` },
  { key: 'laravel-api', label: 'Laravel API', url: `${API_BASE}/public/settings/branding` },
];

const SERVICE_COLORS: Record<string, string> = {
  'admin-portal': '#3b82f6',
  'provider-portal': '#8b5cf6',
  'customer-portal': '#10b981',
  'laravel-api': '#f59e0b',
};

/* ─── Health Check Helpers ───────────────────────────── */

async function checkService(url: string): Promise<{ ok: boolean; ms: number }> {
  const start = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const resp = await fetch(url, { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
    const ms = Math.round(performance.now() - start);
    return { ok: resp.ok || resp.type === 'opaque' || resp.status > 0, ms };
  } catch {
    const ms = Math.round(performance.now() - start);
    return { ok: false, ms };
  } finally {
    clearTimeout(timer);
  }
}

/* ─── Shared Components ──────────────────────────────── */

function StatusDot({ status = 'active' }: { status?: ServiceStatus }) {
  const resolved = status === 'checking' ? 'warning' : status;
  const colors = { active: 'bg-emerald-500', warning: 'bg-amber-500', inactive: 'bg-red-500' };
  return (
    <span className="relative flex h-2.5 w-2.5">
      {resolved === 'active' && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${colors[resolved]} opacity-75`} />}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${colors[resolved]}`} />
    </span>
  );
}

function RC({ children, width: w, height: h }: { children: React.ReactElement; width?: string | number; height?: string | number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const update = () => {
      if (!ref.current) return;
      const { width, height } = ref.current.getBoundingClientRect();
      if (width > 0 && height > 0) setSize((prev) => (prev?.w === width && prev?.h === height ? prev : { w: width, h: height }));
    };
    const observer = new ResizeObserver(update);
    observer.observe(ref.current);
    update();
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: w || '100%', height: h || '100%' }}>
      {size && React.cloneElement(children as React.ReactElement, { width: size.w, height: size.h })}
    </div>
  );
}

function TrendBadge({ value }: { value?: number }) {
  if (value === undefined || value === null) return null;
  const up = value >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? 'text-green-600' : 'text-red-600'}`}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? '+' : ''}{value} (7d)
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function formatBytes(bytes: number): string {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)} TB`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(1)} KB`;
}

/* ─── Overall Status Badge ───────────────────────────── */

function OverallStatusBadge({ health }: { health: Record<string, HealthResult> }) {
  const statuses = SERVICES.map((s) => health[s.key]?.status ?? 'checking');
  const allUp = statuses.every((s) => s === 'active');
  const anyDown = statuses.some((s) => s === 'inactive');

  if (allUp) return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> All Systems Operational</Badge>;
  if (anyDown) return <Badge variant="destructive" className="gap-1.5"><XCircle className="h-3.5 w-3.5" /> System Degraded</Badge>;
  return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Performance Issues</Badge>;
}

/* ─── Service Health Card ────────────────────────────── */

function ServiceHealthCard({ name, status, responseTime, history }: {
  name: string;
  status: ServiceStatus;
  responseTime: number | null;
  history: number[];
}) {
  const borderColor = status === 'active' ? 'border-l-emerald-500' : status === 'warning' ? 'border-l-amber-500' : status === 'inactive' ? 'border-l-red-500' : 'border-l-muted-foreground';
  const lineColor = SERVICE_COLORS[SERVICES.find((s) => s.label === name)?.key ?? ''] ?? '#94a3b8';

  return (
    <Card className={`border-l-4 ${borderColor}`}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StatusDot status={status} />
            <span className="text-sm font-medium">{name}</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {responseTime != null ? `${responseTime}ms` : '--'}
          </span>
        </div>
        {history.length > 1 ? (
          <div className="h-8 mt-1">
            <LineChart width={160} height={32} data={history.map((v, i) => ({ i, ms: v }))}>
              <Line type="monotone" dataKey="ms" stroke={lineColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </div>
        ) : (
          <div className="h-8 mt-1 flex items-center">
            <span className="text-[10px] text-muted-foreground">Collecting data...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── System Metric Cards ────────────────────────────── */

function MemoryCard({ memory }: { memory: PulseData['memory'] }) {
  const limitMb = parseInt(memory.limit) || 128;
  const usagePct = Math.min(Math.round((memory.current_mb / limitMb) * 100), 100);
  const barColor = usagePct > 80 ? 'bg-red-500' : usagePct > 60 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-purple-600 bg-purple-50 dark:bg-purple-900/20">
            <Server className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">PHP Memory</p>
            <p className="text-xs text-muted-foreground">{memory.current_mb}MB / {memory.limit}</p>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${usagePct}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Peak: {memory.peak_mb}MB</p>
      </CardContent>
    </Card>
  );
}

function DatabaseCard({ database }: { database: PulseData['database'] }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50 dark:bg-blue-900/20">
            <Database className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Database</p>
            <p className="text-xs text-muted-foreground">{database.driver}</p>
          </div>
          <div className="ml-auto">
            <StatusDot status={database.connected ? 'active' : 'inactive'} />
          </div>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Response</span>
            <span className="font-mono">{database.response_time_ms}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pending Migrations</span>
            <span className="font-mono">{database.pending_migrations ?? '—'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QueueCard({ queue }: { queue: PulseData['queue'] }) {
  const hasFailed = queue.failed_jobs > 0;
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${hasFailed ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'}`}>
            <Archive className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Queue</p>
            <p className="text-xs text-muted-foreground">{queue.driver}</p>
          </div>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pending Jobs</span>
            <span className="font-mono">{queue.pending_jobs ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Failed Jobs</span>
            <span className={`font-mono ${hasFailed ? 'text-red-600 font-semibold' : ''}`}>{queue.failed_jobs}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CacheCard({ cache }: { cache: PulseData['cache'] }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-teal-600 bg-teal-50 dark:bg-teal-900/20">
            <HardDrive className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Cache</p>
            <p className="text-xs text-muted-foreground">{cache.driver}</p>
          </div>
          <div className="ml-auto">
            <StatusDot status={cache.connected ? 'active' : 'inactive'} />
          </div>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className={cache.connected ? 'text-emerald-600' : 'text-red-600'}>{cache.connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Storage Card ───────────────────────────────────── */

function StorageCard({ storage }: { storage: PulseData['storage'] }) {
  const pct = storage.disk_free_pct;
  const usedPct = pct != null ? Math.round(100 - pct) : 0;
  const barColor = usedPct > 90 ? 'bg-red-500' : usedPct > 75 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20">
            <HardDrive className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Disk</p>
            <p className="text-xs text-muted-foreground">
              {storage.disk_free_bytes ? `${formatBytes(storage.disk_free_bytes)} free` : '—'}
            </p>
          </div>
        </div>
        {pct != null && (
          <>
            <div className="w-full bg-muted rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${usedPct}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{usedPct}% used of {storage.disk_total_bytes ? formatBytes(storage.disk_total_bytes) : '—'}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── App Metric Card ────────────────────────────────── */

function AppMetricCard({ label, icon: Icon, color, data }: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  data?: SummaryCard;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold">{data?.total?.toLocaleString() ?? '—'}</p>
            <TrendBadge value={data?.last_7_days} />
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Response Time Chart ────────────────────────────── */

function ResponseTimeChart({ history }: { history: Record<string, number[]> }) {
  const maxLen = Math.max(...Object.values(history).map((a) => a.length), 0);
  if (maxLen < 2) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Response Times</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
            Collecting data... Response times will appear after a few polling cycles.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = Array.from({ length: maxLen }, (_, i) => {
    const point: Record<string, number> = { index: i };
    for (const [key, values] of Object.entries(history)) {
      if (values[i] != null) point[key] = values[i];
    }
    return point;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Response Times</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <RC width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="index" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="ms" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                labelFormatter={(v) => `Reading #${Number(v) + 1}`}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any, name: any) => [`${v}ms`, SERVICES.find((s) => s.key === name)?.label ?? name]}
              />
              {SERVICES.map((s) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.key}
                  stroke={SERVICE_COLORS[s.key]} strokeWidth={2} dot={false} isAnimationActive={false} />
              ))}
            </LineChart>
          </RC>
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          {SERVICES.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SERVICE_COLORS[s.key] }} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Recent Activity Feed ───────────────────────────── */

function RecentActivityFeed({ activity }: { activity: DashboardData['recent_activity'] }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    incident: AlertTriangle, review: Star, company: Building2,
  };
  const colors: Record<string, string> = {
    incident: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    review: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    company: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
            {activity.map((event, i) => {
              const Icon = icons[event.type] || Activity;
              const cls = colors[event.type] || 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
              return (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-tight truncate">{event.message}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {event.detail}{event.detail && ' \u00b7 '}{formatDate(event.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── System Info Bar ────────────────────────────────── */

function SystemInfoBar({ system }: { system: PulseData['system'] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span>PHP {system.php_version}</span>
      <Minus className="h-3 w-3" />
      <span>Laravel {system.laravel_version}</span>
      <Minus className="h-3 w-3" />
      <span className={system.environment === 'production' ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>{system.environment}</span>
      {system.debug_mode && <Badge variant="destructive" className="text-[10px] h-4 px-1.5">DEBUG</Badge>}
      <Minus className="h-3 w-3" />
      <span>{system.timezone}</span>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */

export function PulsePage() {
  const [pulseData, setPulseData] = useState<PulseData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [health, setHealth] = useState<Record<string, HealthResult>>(() => {
    const init: Record<string, HealthResult> = {};
    for (const s of SERVICES) init[s.key] = { status: 'checking', responseTime: null, lastChecked: null };
    return init;
  });
  const [responseHistory, setResponseHistory] = useState<Record<string, number[]>>({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Run health checks on all services
  const runHealthChecks = useCallback(async () => {
    const results = await Promise.all(
      SERVICES.map(async (s) => {
        const { ok, ms } = await checkService(s.url);
        let status: ServiceStatus = 'inactive';
        if (ok && ms < SLOW_THRESHOLD) status = 'active';
        else if (ok) status = 'warning';
        return { key: s.key, status, responseTime: ms, lastChecked: new Date() };
      })
    );

    setHealth((prev) => {
      const next = { ...prev };
      for (const r of results) next[r.key] = { status: r.status, responseTime: r.responseTime, lastChecked: r.lastChecked };
      return next;
    });

    // Update sparkline history
    setResponseHistory((prev) => {
      const next = { ...prev };
      for (const r of results) {
        if (r.responseTime != null) {
          const arr = [...(next[r.key] || []), r.responseTime];
          next[r.key] = arr.slice(-MAX_HISTORY);
        }
      }
      return next;
    });
  }, []);

  // Fetch pulse + dashboard data from API
  const fetchApiData = useCallback(async () => {
    try {
      const [pulseRes, dashRes] = await Promise.all([
        api.get('/admin/pulse'),
        api.get('/admin/dashboard'),
      ]);
      setPulseData(pulseRes.data);
      setDashboardData(dashRes.data);
    } catch (err) {
      console.error('Pulse API fetch failed:', err);
    }
  }, []);

  // Combined refresh
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([runHealthChecks(), fetchApiData()]);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, [runHealthChecks, fetchApiData]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(refresh, PULSE_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, refresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Pulse</h1>
          <p className="text-muted-foreground">Real-time platform health monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <span className="text-sm text-muted-foreground">Auto-refresh (15s)</span>
          </div>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Separator />

      {/* System Info Bar */}
      {pulseData && <SystemInfoBar system={pulseData.system} />}

      {/* Row 1: Service Health */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Service Health</h2>
          <OverallStatusBadge health={health} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((s) => (
            <ServiceHealthCard
              key={s.key}
              name={s.label}
              status={health[s.key]?.status ?? 'checking'}
              responseTime={health[s.key]?.responseTime ?? null}
              history={responseHistory[s.key] ?? []}
            />
          ))}
        </div>
      </div>

      {/* Row 2: System Metrics */}
      {pulseData && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">System Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MemoryCard memory={pulseData.memory} />
            <DatabaseCard database={pulseData.database} />
            <QueueCard queue={pulseData.queue} />
            <CacheCard cache={pulseData.cache} />
            <StorageCard storage={pulseData.storage} />
          </div>
        </div>
      )}

      {/* Row 3: Application Metrics */}
      {dashboardData && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Application Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AppMetricCard label="Provider Companies" icon={Building2} color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" data={dashboardData.summary?.provider_companies} />
            <AppMetricCard label="Users" icon={Users} color="text-purple-600 bg-purple-50 dark:bg-purple-900/20" data={dashboardData.summary?.users} />
            <AppMetricCard label="Incidents" icon={AlertTriangle} color="text-red-600 bg-red-50 dark:bg-red-900/20" data={dashboardData.summary?.incidents} />
            <AppMetricCard label="Active Services" icon={Layers} color="text-orange-600 bg-orange-50 dark:bg-orange-900/20" data={dashboardData.summary?.services} />
          </div>
        </div>
      )}

      {/* Row 4: Response Time Chart */}
      <ResponseTimeChart history={responseHistory} />

      {/* Row 5: Recent Activity */}
      {dashboardData && <RecentActivityFeed activity={dashboardData.recent_activity ?? []} />}
    </div>
  );
}
