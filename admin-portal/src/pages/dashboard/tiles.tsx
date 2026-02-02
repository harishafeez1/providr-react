import React, { useState, useEffect, useRef } from 'react';
import type { Layout } from 'react-grid-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2, Users, UserCheck, AlertTriangle, Star, Shield, ArrowUpRight, ArrowDownRight,
  Bell, ClipboardCheck, Activity, DollarSign, CreditCard, TrendingUp, UserX, Zap,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';

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

// ─── Types ──────────────────────────────────────────────────────────
interface SummaryCard { total: number; last_7_days?: number; last_30_days?: number }

export interface DashboardData {
  summary: Record<string, SummaryCard>;
  incidents_by_severity: { severity: string; count: number }[];
  incidents_by_type: { type: string; count: number }[];
  incidents_by_status: { status: string; count: number }[];
  incident_trend: { date: string; count: number }[];
  ndis_compliance: Record<string, number>;
  action_items: Record<string, number>;
  recent_activity: { type: string; message: string; detail: string; date: string }[];
}

// ─── Constants ──────────────────────────────────────────────────────
const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
const SEVERITY_COLORS: Record<string, string> = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444', unknown: '#94a3b8' };
const STATUS_COLORS: Record<string, string> = { draft: '#94a3b8', open: '#3b82f6', investigating: '#f59e0b', resolved: '#10b981', closed: '#6b7280', unknown: '#d1d5db' };

// ─── Helpers ────────────────────────────────────────────────────────
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

function TrendBadge({ value, suffix = '(7d)' }: { value?: number; suffix?: string }) {
  if (value === undefined || value === null) return null;
  const up = value >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? 'text-green-600' : 'text-red-600'}`}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? '+' : ''}{value} {suffix}
    </span>
  );
}

// ─── Dummy financial data ───────────────────────────────────────────
function generateRevenueTrend() {
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  const base = [4800, 5200, 5900, 6400, 7100, 7800, 8200, 9100, 9800, 10400, 11200, 12259];
  return months.map((m, i) => ({ month: m, revenue: base[i] }));
}

const PLAN_DISTRIBUTION = [
  { name: 'Basic ($99)', value: 25, color: '#6366f1' },
  { name: 'Pro ($299)', value: 12, color: '#f59e0b' },
  { name: 'Enterprise ($599)', value: 4, color: '#10b981' },
];

// ─── Tile registry ──────────────────────────────────────────────────
export interface TileConfig {
  id: string;
  title: string;
  category: 'overview' | 'incidents' | 'compliance' | 'financial';
  defaultW: number;
  defaultH: number;
  minW?: number;
  minH?: number;
  render: (data: DashboardData) => React.ReactNode;
}

const summaryCardDefs = [
  { key: 'provider_companies', label: 'Provider Companies', icon: Building2, color: 'text-blue-600 bg-blue-50' },
  { key: 'users', label: 'Users', icon: Users, color: 'text-purple-600 bg-purple-50' },
  { key: 'participants', label: 'Participants', icon: UserCheck, color: 'text-green-600 bg-green-50' },
  { key: 'incidents', label: 'Incidents', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  { key: 'services', label: 'Active Services', icon: Activity, color: 'text-orange-600 bg-orange-50' },
  { key: 'reviews', label: 'Reviews', icon: Star, color: 'text-yellow-600 bg-yellow-50' },
];

export const TILE_REGISTRY: TileConfig[] = [
  // ── Overview summary cards (1×1 each) ──
  ...summaryCardDefs.map((def) => ({
    id: `summary_${def.key}`,
    title: def.label,
    category: 'overview' as const,
    defaultW: 2,
    defaultH: 1,
    minW: 2,
    minH: 1,
    render: (data: DashboardData) => {
      const s = data.summary[def.key];
      if (!s) return <p className="text-muted-foreground text-sm">No data</p>;
      const Icon = def.icon;
      return (
        <div className="flex items-center justify-between h-full">
          <div>
            <p className="text-2xl font-bold">{s.total.toLocaleString()}</p>
            <TrendBadge value={s.last_7_days} />
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${def.color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      );
    },
  })),

  // ── Financial tiles ──
  {
    id: 'mrr',
    title: 'Monthly Recurring Revenue',
    category: 'financial',
    defaultW: 2, defaultH: 1, minW: 2, minH: 1,
    render: () => (
      <div className="flex items-center justify-between h-full">
        <div>
          <p className="text-2xl font-bold">$12,259</p>
          <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
            <ArrowUpRight className="h-3 w-3" />+12% vs last month
          </span>
        </div>
        <div className="h-10 w-10 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50">
          <DollarSign className="h-5 w-5" />
        </div>
      </div>
    ),
  },
  {
    id: 'active_subscriptions',
    title: 'Active Subscriptions',
    category: 'financial',
    defaultW: 2, defaultH: 1, minW: 2, minH: 1,
    render: (data: DashboardData) => (
      <div className="flex items-center justify-between h-full">
        <div>
          <p className="text-2xl font-bold">{data.summary.provider_companies?.total ?? 41}</p>
          <span className="text-xs text-muted-foreground">25 Basic · 12 Pro · 4 Enterprise</span>
        </div>
        <div className="h-10 w-10 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50">
          <CreditCard className="h-5 w-5" />
        </div>
      </div>
    ),
  },
  {
    id: 'trial_accounts',
    title: 'Trial Accounts',
    category: 'financial',
    defaultW: 2, defaultH: 1, minW: 2, minH: 1,
    render: () => (
      <div className="flex items-center justify-between h-full">
        <div>
          <p className="text-2xl font-bold">8</p>
          <span className="text-xs text-muted-foreground">3 converting soon</span>
        </div>
        <div className="h-10 w-10 rounded-lg flex items-center justify-center text-cyan-600 bg-cyan-50">
          <Zap className="h-5 w-5" />
        </div>
      </div>
    ),
  },
  {
    id: 'churn_rate',
    title: 'Churn Rate',
    category: 'financial',
    defaultW: 2, defaultH: 1, minW: 2, minH: 1,
    render: () => (
      <div className="flex items-center justify-between h-full">
        <div>
          <p className="text-2xl font-bold">2.1%</p>
          <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
            <ArrowDownRight className="h-3 w-3" />↓ from 2.8%
          </span>
        </div>
        <div className="h-10 w-10 rounded-lg flex items-center justify-center text-pink-600 bg-pink-50">
          <UserX className="h-5 w-5" />
        </div>
      </div>
    ),
  },
  {
    id: 'revenue_trend',
    title: 'Revenue Trend (12 months)',
    category: 'financial',
    defaultW: 6, defaultH: 2, minW: 4, minH: 2,
    render: () => {
      const trend = generateRevenueTrend();
      return (
        <RC width="100%" height="100%">
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'MRR']} />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
          </AreaChart>
        </RC>
      );
    },
  },
  {
    id: 'plan_distribution',
    title: 'Subscription Plans',
    category: 'financial',
    defaultW: 3, defaultH: 2, minW: 3, minH: 2,
    render: () => (
      <div className="flex items-center h-full">
        <RC width="55%" height="100%">
          <PieChart>
            <Pie data={PLAN_DISTRIBUTION} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60}>
              {PLAN_DISTRIBUTION.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </RC>
        <div className="space-y-2">
          {PLAN_DISTRIBUTION.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-xs">{p.name}: {p.value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // ── Incident charts ──
  {
    id: 'incident_trend',
    title: 'Incidents Over Last 30 Days',
    category: 'incidents',
    defaultW: 8, defaultH: 2, minW: 4, minH: 2,
    render: (data: DashboardData) => (
      <RC width="100%" height="100%">
        <LineChart data={data.incident_trend}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </RC>
    ),
  },
  {
    id: 'incidents_by_severity',
    title: 'Incidents by Severity',
    category: 'incidents',
    defaultW: 4, defaultH: 2, minW: 3, minH: 2,
    render: (data: DashboardData) => (
      <RC width="100%" height="100%">
        <BarChart data={data.incidents_by_severity} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="severity" tick={{ fontSize: 11 }} width={70} />
          <Tooltip />
          <Bar dataKey="count">
            {data.incidents_by_severity.map((e, i) => <Cell key={i} fill={SEVERITY_COLORS[e.severity.toLowerCase()] || COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </RC>
    ),
  },
  {
    id: 'incidents_by_type',
    title: 'Incidents by Type',
    category: 'incidents',
    defaultW: 6, defaultH: 2, minW: 3, minH: 2,
    render: (data: DashboardData) => (
      <RC width="100%" height="100%">
        <PieChart>
          <Pie data={data.incidents_by_type} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ type, count }) => `${type}: ${count}`} labelLine={false}>
            {data.incidents_by_type.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </RC>
    ),
  },
  {
    id: 'incidents_by_status',
    title: 'Incidents by Status',
    category: 'incidents',
    defaultW: 6, defaultH: 2, minW: 3, minH: 2,
    render: (data: DashboardData) => (
      <RC width="100%" height="100%">
        <BarChart data={data.incidents_by_status}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="status" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count">
            {data.incidents_by_status.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.status.toLowerCase()] || COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </RC>
    ),
  },

  // ── Compliance ──
  {
    id: 'ndis_compliance',
    title: 'NDIS Compliance',
    category: 'compliance',
    defaultW: 4, defaultH: 2, minW: 3, minH: 2,
    render: (data: DashboardData) => (
      <div className="space-y-2.5 overflow-y-auto h-full">
        {[
          { label: 'NDIS Reportable', value: data.ndis_compliance.reportable },
          { label: 'Police Notified', value: data.ndis_compliance.police_notified },
          { label: 'Restrictive Practices', value: data.ndis_compliance.restrictive_practices },
          { label: 'Follow-up Required', value: data.ndis_compliance.follow_up_required },
          { label: 'Open Incidents', value: data.ndis_compliance.open_incidents },
          { label: 'Closed/Resolved', value: data.ndis_compliance.closed_incidents },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'action_items',
    title: 'Action Items',
    category: 'compliance',
    defaultW: 4, defaultH: 2, minW: 3, minH: 2,
    render: (data: DashboardData) => (
      <div className="space-y-3 h-full">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Draft Incidents</span>
          <Badge variant={data.action_items.draft_incidents > 0 ? 'destructive' : 'secondary'}>{data.action_items.draft_incidents}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Needing Follow-up</span>
          <Badge variant={data.action_items.incidents_needing_followup > 0 ? 'default' : 'secondary'}>{data.action_items.incidents_needing_followup}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Reviews</span>
          <Badge variant="secondary">{data.action_items.total_reviews}</Badge>
        </div>
      </div>
    ),
  },
  {
    id: 'recent_activity',
    title: 'Recent Activity',
    category: 'compliance',
    defaultW: 4, defaultH: 2, minW: 3, minH: 2,
    render: (data: DashboardData) => {
      const icons: Record<string, typeof AlertTriangle> = { incident: AlertTriangle, review: Star, company: Building2 };
      const colors: Record<string, string> = { incident: 'text-red-500 bg-red-50', review: 'text-yellow-500 bg-yellow-50', company: 'text-blue-500 bg-blue-50' };
      return (
        <div className="space-y-2.5 overflow-y-auto h-full">
          {data.recent_activity.map((event, i) => {
            const Icon = icons[event.type] || Activity;
            const cls = colors[event.type] || 'text-gray-500 bg-gray-50';
            return (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-tight truncate">{event.message}</p>
                  <p className="text-[11px] text-muted-foreground">{event.detail}{event.detail && ' · '}{formatDate(event.date)}</p>
                </div>
              </div>
            );
          })}
          {data.recent_activity.length === 0 && <p className="text-sm text-muted-foreground text-center">No recent activity</p>}
        </div>
      );
    },
  },
];

// ─── Default layouts per breakpoint ─────────────────────────────────
export type Layouts = { lg: Layout[]; md: Layout[]; sm: Layout[]; xs: Layout[] };

function stackAll(cols: number): Layout[] {
  // Stack all tiles in a single column layout
  const items = TILE_REGISTRY.map((t) => t.id);
  let y = 0;
  return items.map((id) => {
    const tile = TILE_REGISTRY.find((t) => t.id === id)!;
    const h = tile.defaultH;
    const item: Layout = { i: id, x: 0, y, w: cols, h, minH: 1 };
    y += h;
    return item;
  });
}

export function getDefaultLayouts(): Layouts {
  const summaryIds = summaryCardDefs.map((d) => `summary_${d.key}`);
  const finIds = ['mrr', 'active_subscriptions', 'trial_accounts', 'churn_rate'];

  // ── lg: 12 cols ──
  const lg: Layout[] = [];
  let x = 0;
  summaryIds.forEach((id) => { lg.push({ i: id, x, y: 0, w: 2, h: 1 }); x += 2; });
  x = 0;
  finIds.forEach((id) => { lg.push({ i: id, x, y: 1, w: 3, h: 1 }); x += 3; });
  lg.push({ i: 'revenue_trend', x: 0, y: 2, w: 8, h: 2 });
  lg.push({ i: 'plan_distribution', x: 8, y: 2, w: 4, h: 2 });
  lg.push({ i: 'incident_trend', x: 0, y: 4, w: 8, h: 2 });
  lg.push({ i: 'incidents_by_severity', x: 8, y: 4, w: 4, h: 2 });
  lg.push({ i: 'incidents_by_type', x: 0, y: 6, w: 6, h: 2 });
  lg.push({ i: 'incidents_by_status', x: 6, y: 6, w: 6, h: 2 });
  lg.push({ i: 'ndis_compliance', x: 0, y: 8, w: 4, h: 2 });
  lg.push({ i: 'action_items', x: 4, y: 8, w: 4, h: 2 });
  lg.push({ i: 'recent_activity', x: 8, y: 8, w: 4, h: 2 });

  // ── md: 10 cols ──
  const md: Layout[] = [];
  x = 0;
  summaryIds.forEach((id, i) => {
    const col = (i % 5) * 2;
    const row = Math.floor(i / 5);
    md.push({ i: id, x: col, y: row, w: 2, h: 1 });
  });
  x = 0;
  finIds.forEach((id, i) => {
    md.push({ i: id, x: (i % 2) * 5, y: 2 + Math.floor(i / 2), w: 5, h: 1 });
  });
  md.push({ i: 'revenue_trend', x: 0, y: 4, w: 10, h: 2 });
  md.push({ i: 'plan_distribution', x: 0, y: 6, w: 10, h: 2 });
  md.push({ i: 'incident_trend', x: 0, y: 8, w: 10, h: 2 });
  md.push({ i: 'incidents_by_severity', x: 0, y: 10, w: 5, h: 2 });
  md.push({ i: 'incidents_by_type', x: 5, y: 10, w: 5, h: 2 });
  md.push({ i: 'incidents_by_status', x: 0, y: 12, w: 10, h: 2 });
  md.push({ i: 'ndis_compliance', x: 0, y: 14, w: 5, h: 2 });
  md.push({ i: 'action_items', x: 5, y: 14, w: 5, h: 2 });
  md.push({ i: 'recent_activity', x: 0, y: 16, w: 10, h: 2 });

  // ── sm: 6 cols ──
  const sm: Layout[] = [];
  summaryIds.forEach((id, i) => {
    sm.push({ i: id, x: (i % 3) * 2, y: Math.floor(i / 3), w: 2, h: 1 });
  });
  finIds.forEach((id, i) => {
    sm.push({ i: id, x: (i % 2) * 3, y: 2 + Math.floor(i / 2), w: 3, h: 1 });
  });
  let sy = 4;
  ['revenue_trend', 'plan_distribution', 'incident_trend', 'incidents_by_severity',
    'incidents_by_type', 'incidents_by_status', 'ndis_compliance', 'action_items', 'recent_activity'].forEach((id) => {
    sm.push({ i: id, x: 0, y: sy, w: 6, h: 2 });
    sy += 2;
  });

  // ── xs: 4 cols (all full width) ──
  const xs = stackAll(4);

  return { lg, md, sm, xs };
}

// Backward compat: single-breakpoint layout (for saved prefs)
export function getDefaultLayout(): Layout[] {
  return getDefaultLayouts().lg;
}
