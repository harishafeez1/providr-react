import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Globe, Server, Database, Cloud, Shield, Monitor,
  GitBranch, Users, HardDrive, Cable, ArrowDown,
  Layers, Code2, Box,
  RefreshCw, Clock,
} from 'lucide-react';
import {
  SupabaseIcon, LaravelIcon, ReactIcon, PHPIcon, TypeScriptIcon,
  ViteIcon, TailwindIcon, PostgreSQLIcon, MySQLIcon, AWSIcon,
  GoogleIcon, StripeIcon, MapboxIcon, GitIcon, GitHubIcon,
  ShadcnIcon, RefineIcon,
} from '@/components/icons/brands';

/* ─── Health Check Hook ───────────────────────────────── */

const HEALTH_CHECK_INTERVAL = 30_000; // 30 seconds
const SLOW_THRESHOLD = 2000; // 2s = warning
const TIMEOUT = 8000; // 8s = timeout / inactive

type ServiceStatus = 'active' | 'warning' | 'inactive' | 'checking';

interface HealthResult {
  status: ServiceStatus;
  responseTime: number | null;
  lastChecked: Date | null;
}

type HealthMap = Record<string, HealthResult>;

const DEFAULT_HEALTH: HealthResult = { status: 'checking', responseTime: null, lastChecked: null };

function getHealth(health: HealthMap | undefined, key: string): HealthResult {
  return health?.[key] ?? DEFAULT_HEALTH;
}

const SERVICES = [
  { key: 'admin-portal', label: 'Admin Portal', url: 'http://localhost:5177/admin-portal/' },
  { key: 'provider-portal', label: 'Provider Portal', url: 'http://localhost:5174/' },
  { key: 'customer-portal', label: 'Customer Portal', url: 'http://localhost:5176/' },
  { key: 'laravel-api', label: 'Laravel API', url: 'http://localhost:8002/api/public/settings/branding' },
];

// Supabase is external/managed — can't be health-checked from browser without API key
const EXTERNAL_SERVICES = [
  { key: 'supabase', label: 'Supabase', status: 'configured' as const },
];

async function checkService(url: string): Promise<{ ok: boolean; ms: number }> {
  const start = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const resp = await fetch(url, { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
    const ms = Math.round(performance.now() - start);
    // In no-cors mode resp.type is 'opaque' and status is 0 — that still means the server responded
    return { ok: resp.ok || resp.type === 'opaque' || resp.status > 0, ms };
  } catch {
    const ms = Math.round(performance.now() - start);
    return { ok: false, ms };
  } finally {
    clearTimeout(timer);
  }
}

function useHealthChecks() {
  const [health, setHealth] = useState<HealthMap>(() => {
    const init: HealthMap = {};
    for (const s of SERVICES) init[s.key] = { status: 'checking', responseTime: null, lastChecked: null };
    return init;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runChecks = useCallback(async () => {
    setIsRefreshing(true);
    const results = await Promise.all(
      SERVICES.map(async (s) => {
        const { ok, ms } = await checkService(s.url);
        let status: ServiceStatus = 'inactive';
        if (ok && ms < SLOW_THRESHOLD) status = 'active';
        else if (ok) status = 'warning';
        return { key: s.key, status, responseTime: ms, lastChecked: new Date() } as { key: string } & HealthResult;
      })
    );
    setHealth((prev) => {
      const next = { ...prev };
      for (const r of results) next[r.key] = { status: r.status, responseTime: r.responseTime, lastChecked: r.lastChecked };
      return next;
    });
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    runChecks();
    intervalRef.current = setInterval(runChecks, HEALTH_CHECK_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [runChecks]);

  return { health, isRefreshing, refresh: runChecks };
}

/* ─── Health Status Banner ────────────────────────────── */

function HealthBanner({ health, isRefreshing, onRefresh }: {
  health: HealthMap; isRefreshing: boolean; onRefresh: () => void;
}) {
  const services = SERVICES.map((s) => ({ ...s, ...getHealth(health, s.key) }));
  const allUp = services.every((s) => s.status === 'active');
  const anyDown = services.some((s) => s.status === 'inactive');
  const lastChecked = services[0]?.lastChecked;

  return (
    <Card className={`border-2 ${anyDown ? 'border-red-200 dark:border-red-900' : allUp ? 'border-emerald-200 dark:border-emerald-900' : 'border-amber-200 dark:border-amber-900'}`}>
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusDot status={anyDown ? 'inactive' : allUp ? 'active' : 'warning'} />
            <span className="text-sm font-semibold">
              {anyDown ? 'Some services are down' : allUp ? 'All services operational' : 'Some services are slow'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {lastChecked && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last checked {lastChecked.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Checking...' : 'Refresh'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {services.map((s) => (
            <div key={s.key} className="flex items-center gap-2 bg-muted/40 rounded-md px-3 py-2">
              <StatusDot status={s.status} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {s.status === 'checking' ? 'Checking...' : s.responseTime !== null ? `${s.responseTime}ms` : '—'}
                </p>
              </div>
            </div>
          ))}
          {EXTERNAL_SERVICES.map((s) => (
            <div key={s.key} className="flex items-center gap-2 bg-muted/40 rounded-md px-3 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">External</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Shared helpers ──────────────────────────────────── */

function resolveStatus(status: ServiceStatus | undefined): 'active' | 'warning' | 'inactive' {
  if (status === 'checking') return 'warning';
  return status ?? 'inactive';
}

function StatusDot({ status = 'active' }: { status?: 'active' | 'warning' | 'inactive' | ServiceStatus }) {
  const resolved = resolveStatus(status);
  const colors = { active: 'bg-emerald-500', warning: 'bg-amber-500', inactive: 'bg-red-500' };
  return (
    <span className="relative flex h-2.5 w-2.5">
      {resolved === 'active' && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${colors[resolved]} opacity-75`} />}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${colors[resolved]}`} />
    </span>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? 'font-mono text-xs bg-muted px-2 py-0.5 rounded' : 'font-medium'}>{value}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

/* ─── Architecture Map ────────────────────────────────── */

function ArchitectureMap({ health }: { health: HealthMap }) {
  return (
    <div className="space-y-8">
      {/* Portals row */}
      <div>
        <div className="text-center mb-3">
          <Badge variant="outline" className="text-xs">Client Layer</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PortalCard
            name="Admin Portal"
            brandIcon={<ReactIcon className="h-5 w-5" />}
            color="blue"
            devUrl="localhost:5177"
            prodUrl="admin.providr.au"
            tech="React 18 + Vite"
            description="Internal management dashboard"
            basePath="/admin-portal"
            health={getHealth(health, 'admin-portal')}
          />
          <PortalCard
            name="Provider Portal"
            brandIcon={<ReactIcon className="h-5 w-5" />}
            color="violet"
            devUrl="localhost:5174"
            prodUrl="provider.providr.au"
            tech="React 18 + Vite"
            description="Provider company management"
            basePath="/"
            health={getHealth(health, 'provider-portal')}
          />
          <PortalCard
            name="Customer Portal"
            brandIcon={<ReactIcon className="h-5 w-5" />}
            color="emerald"
            devUrl="localhost:5176"
            prodUrl="app.providr.au"
            tech="React 18 + Vite"
            description="Customer-facing application"
            basePath="/"
            health={getHealth(health, 'customer-portal')}
          />
        </div>
      </div>

      {/* Connection arrows */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ArrowDown className="h-5 w-5" />
          <span className="text-xs font-mono bg-muted px-3 py-1 rounded-full">HTTPS / REST API</span>
          <ArrowDown className="h-5 w-5" />
        </div>
      </div>

      {/* API Layer */}
      <div>
        <div className="text-center mb-3">
          <Badge variant="outline" className="text-xs">API Layer</Badge>
        </div>
        <Card className="border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50/50 to-background dark:from-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/50 p-2">
                <LaravelIcon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">Laravel API Backend</h3>
                  <StatusDot status={getHealth(health, 'laravel-api').status} />
                  {getHealth(health, 'laravel-api').responseTime != null && (
                    <span className="text-xs text-muted-foreground font-mono">{getHealth(health, 'laravel-api').responseTime}ms</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">RESTful API serving all three portals</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-1">PHP 8.3</Badge>
                <p className="text-xs text-muted-foreground font-mono">Laravel 11</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Dev URL</p>
                <p className="text-sm font-mono font-medium">localhost:8002</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Prod URL</p>
                <p className="text-sm font-mono font-medium">admin.providr.au</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Auth</p>
                <p className="text-sm font-medium">Sanctum (Token)</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">API Prefix</p>
                <p className="text-sm font-mono font-medium">/api/admin/*</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection arrows */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ArrowDown className="h-5 w-5" />
          <span className="text-xs font-mono bg-muted px-3 py-1 rounded-full">Eloquent ORM / PDO</span>
          <ArrowDown className="h-5 w-5" />
        </div>
      </div>

      {/* Data Layer */}
      <div>
        <div className="text-center mb-3">
          <Badge variant="outline" className="text-xs">Data Layer</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supabase */}
          <Card className="border-2 border-green-200 dark:border-green-900 bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50 p-1.5">
                  <SupabaseIcon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">Supabase PostgreSQL</h3>
                    <span className="relative flex h-2.5 w-2.5"><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" /></span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-[10px]">PRODUCTION</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Primary production database
                    <span className="font-mono ml-1 text-sky-600">(External)</span>
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <InfoRow label="Project" value="providr (Sydney)" />
                <InfoRow label="Project Ref" value="mgihlxyfbvzqyqodvgsc" mono />
                <InfoRow label="Region" value="Sydney (ap-southeast-2)" />
                <InfoRow label="Direct Host" value="db.mgihlxy...supabase.co" mono />
                <InfoRow label="Pooler Host" value="aws-1-ap-southeast-2.pooler.supabase.com" mono />
                <InfoRow label="Pooler Port" value="5432 (session) / 6543 (transaction)" mono />
                <InfoRow label="Database" value="postgres" mono />
                <InfoRow label="Engine" value="PostgreSQL 15" />
                <InfoRow label="Tables" value="49" />
                <InfoRow label="IPv4" value="Enabled (dedicated add-on)" />
              </div>
            </CardContent>
          </Card>

          {/* Local MySQL */}
          <Card className="border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 p-1.5">
                  <MySQLIcon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">Local MySQL</h3>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-[10px]">DEV</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Local development database</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <InfoRow label="Host" value="127.0.0.1" mono />
                <InfoRow label="Port" value="3306" mono />
                <InfoRow label="Database" value="providr" mono />
                <InfoRow label="Username" value="root" mono />
                <InfoRow label="Engine" value="MySQL 8.4" />
                <InfoRow label="Status" value="Synced from Supabase" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Connection arrows */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Cable className="h-5 w-5" />
          <span className="text-xs font-mono bg-muted px-3 py-1 rounded-full">External Integrations</span>
          <Cable className="h-5 w-5" />
        </div>
      </div>

      {/* External Services */}
      <div>
        <div className="text-center mb-3">
          <Badge variant="outline" className="text-xs">External Services</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <ExternalServiceCard name="AWS S3" description="File storage" region="ap-southeast-2" brandIcon={<AWSIcon className="h-5 w-5" />} />
          <ExternalServiceCard name="Google Places" description="Location search" region="Global" brandIcon={<GoogleIcon className="h-5 w-5" />} />
          <ExternalServiceCard name="Google OAuth" description="SSO login" region="Global" brandIcon={<GoogleIcon className="h-5 w-5" />} />
          <ExternalServiceCard name="Stripe" description="Payments" region="AU" brandIcon={<StripeIcon className="h-5 w-5 rounded" />} />
          <ExternalServiceCard name="Mapbox" description="Maps & geocoding" region="Global" brandIcon={<MapboxIcon className="h-5 w-5 rounded" />} />
        </div>
      </div>
    </div>
  );
}

function PortalCard({ name, brandIcon, color, devUrl, prodUrl, tech, description, basePath, health }: {
  name: string; brandIcon: React.ReactNode; color: string;
  devUrl: string; prodUrl: string; tech: string; description: string; basePath: string;
  health?: HealthResult;
}) {
  const colorMap: Record<string, { border: string; bg: string; iconBg: string }> = {
    blue: { border: 'border-blue-200 dark:border-blue-900', bg: 'from-blue-50/50 dark:from-blue-950/20', iconBg: 'bg-blue-100 dark:bg-blue-900/50' },
    violet: { border: 'border-violet-200 dark:border-violet-900', bg: 'from-violet-50/50 dark:from-violet-950/20', iconBg: 'bg-violet-100 dark:bg-violet-900/50' },
    emerald: { border: 'border-emerald-200 dark:border-emerald-900', bg: 'from-emerald-50/50 dark:from-emerald-950/20', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <Card className={`border-2 ${c.border} bg-gradient-to-br ${c.bg} to-background`}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.iconBg} p-1.5`}>
            {brandIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{name}</h3>
              <StatusDot status={health?.status} />
              {health?.responseTime != null && (
                <span className="text-[10px] text-muted-foreground font-mono">{health.responseTime}ms</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dev</span>
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{devUrl}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prod</span>
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{prodUrl}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stack</span>
            <span className="font-medium">{tech}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base</span>
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{basePath}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExternalServiceCard({ name, description, region, brandIcon }: {
  name: string; description: string; region: string; brandIcon: React.ReactNode;
}) {
  return (
    <Card className="text-center">
      <CardContent className="pt-4 pb-3">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 mb-2 p-1">
          {brandIcon}
        </div>
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Badge variant="outline" className="text-[10px] mt-1.5">{region}</Badge>
      </CardContent>
    </Card>
  );
}

/* ─── Tech Stack ──────────────────────────────────────── */

function TechStackTab() {
  const stacks: { category: string; icon: React.ReactNode; items: { name: string; version: string; description: string; brandIcon?: React.ReactNode }[] }[] = [
    {
      category: 'Backend',
      icon: <LaravelIcon className="h-4 w-4" />,
      items: [
        { name: 'PHP', version: '8.3.28', description: 'Server-side language', brandIcon: <PHPIcon className="h-4 w-4" /> },
        { name: 'Laravel', version: '8.x', description: 'MVC framework', brandIcon: <LaravelIcon className="h-4 w-4" /> },
        { name: 'Sanctum', version: '', description: 'Token-based API authentication' },
        { name: 'Eloquent ORM', version: '', description: 'Database abstraction layer' },
        { name: 'PostgresSearchable', version: '', description: 'Custom ILIKE search trait' },
      ],
    },
    {
      category: 'Frontend',
      icon: <ReactIcon className="h-4 w-4" />,
      items: [
        { name: 'React', version: '18.x', description: 'UI component library', brandIcon: <ReactIcon className="h-4 w-4" /> },
        { name: 'TypeScript', version: '5.x', description: 'Type-safe JavaScript', brandIcon: <TypeScriptIcon className="h-4 w-4 rounded-sm" /> },
        { name: 'Vite', version: '5.x', description: 'Build tool & dev server', brandIcon: <ViteIcon className="h-4 w-4" /> },
        { name: 'Tailwind CSS', version: '3.x', description: 'Utility-first CSS framework', brandIcon: <TailwindIcon className="h-4 w-4" /> },
        { name: 'Shadcn/UI', version: '', description: 'Component library (Radix UI)', brandIcon: <ShadcnIcon className="h-4 w-4 rounded-sm" /> },
        { name: 'Refine', version: '', description: 'Admin panel framework', brandIcon: <RefineIcon className="h-4 w-4 rounded-sm" /> },
      ],
    },
    {
      category: 'Database',
      icon: <SupabaseIcon className="h-4 w-4" />,
      items: [
        { name: 'PostgreSQL', version: '15', description: 'Production (via Supabase)', brandIcon: <PostgreSQLIcon className="h-4 w-4" /> },
        { name: 'MySQL', version: '8.4', description: 'Local development', brandIcon: <MySQLIcon className="h-4 w-4" /> },
        { name: 'Supabase', version: '', description: 'Managed PostgreSQL hosting', brandIcon: <SupabaseIcon className="h-4 w-4" /> },
      ],
    },
    {
      category: 'Infrastructure',
      icon: <AWSIcon className="h-4 w-4" />,
      items: [
        { name: 'AWS S3', version: '', description: 'File/image storage (ap-southeast-2)', brandIcon: <AWSIcon className="h-4 w-4" /> },
        { name: 'AWS EC2', version: '', description: 'Production server hosting', brandIcon: <AWSIcon className="h-4 w-4" /> },
        { name: 'Supabase', version: '', description: 'Database hosting (Sydney)', brandIcon: <SupabaseIcon className="h-4 w-4" /> },
      ],
    },
    {
      category: 'APIs & Services',
      icon: <GoogleIcon className="h-4 w-4" />,
      items: [
        { name: 'Google Places API', version: '', description: 'Location autocomplete & geocoding', brandIcon: <GoogleIcon className="h-4 w-4" /> },
        { name: 'Google OAuth', version: '', description: 'Social sign-in for providers', brandIcon: <GoogleIcon className="h-4 w-4" /> },
        { name: 'Mapbox', version: '', description: 'Map rendering & geolocation', brandIcon: <MapboxIcon className="h-4 w-4 rounded-sm" /> },
        { name: 'Stripe', version: '', description: 'Payment processing', brandIcon: <StripeIcon className="h-4 w-4 rounded-sm" /> },
      ],
    },
    {
      category: 'Dev Tools',
      icon: <GitHubIcon className="h-4 w-4" />,
      items: [
        { name: 'Git', version: '', description: 'Version control', brandIcon: <GitIcon className="h-4 w-4" /> },
        { name: 'GitHub', version: '', description: 'Repository hosting', brandIcon: <GitHubIcon className="h-4 w-4" /> },
        { name: 'Composer', version: '', description: 'PHP dependency manager', brandIcon: <PHPIcon className="h-4 w-4" /> },
        { name: 'npm', version: '', description: 'Node package manager' },
        { name: 'Claude Code', version: '', description: 'AI-assisted development' },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stacks.map((stack) => (
        <Card key={stack.category}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {stack.icon}
              <CardTitle className="text-base">{stack.category}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {stack.items.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center shrink-0">
                    {item.brandIcon || <Code2 className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <div>
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.version && <Badge variant="outline" className="ml-2 text-[10px]">{item.version}</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground text-right max-w-[140px] truncate">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Environments ────────────────────────────────────── */

function EnvironmentsTab() {
  const envRows = [
    { label: 'Database', dev: 'MySQL 8.4 (local)', prod: 'Supabase PostgreSQL 15' },
    { label: 'DB Host', dev: '127.0.0.1:3306', prod: 'Supabase Pooler (Sydney) :5432' },
    { label: 'DB Name', dev: 'providr', prod: 'postgres' },
    { label: 'API Server', dev: 'localhost:8002', prod: 'admin.providr.au' },
    { label: 'Admin Portal', dev: 'localhost:5177', prod: 'admin.providr.au/admin-portal' },
    { label: 'Provider Portal', dev: 'localhost:5174', prod: 'provider.providr.au' },
    { label: 'Customer Portal', dev: 'localhost:5176', prod: 'app.providr.au' },
    { label: 'S3 Bucket', dev: 'providrbucket (ap-southeast-2)', prod: 'providrbucket (ap-southeast-2)' },
    { label: 'PHP Version', dev: '8.3.28', prod: '8.3.x' },
    { label: 'CORS Origins', dev: 'localhost:5177, 5174, 5176', prod: 'admin.providr.au, etc.' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Environment Comparison</CardTitle>
          <CardDescription>Side-by-side comparison of development and production environments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-[200px_1fr_1fr] bg-muted/50 border-b">
              <div className="p-3 font-semibold text-sm">Setting</div>
              <div className="p-3 font-semibold text-sm border-l">
                <div className="flex items-center gap-2">
                  <StatusDot status="active" />
                  Development (Local)
                </div>
              </div>
              <div className="p-3 font-semibold text-sm border-l">
                <div className="flex items-center gap-2">
                  <StatusDot status="active" />
                  Production
                </div>
              </div>
            </div>
            {envRows.map((row, i) => (
              <div key={row.label} className={`grid grid-cols-[200px_1fr_1fr] ${i < envRows.length - 1 ? 'border-b' : ''}`}>
                <div className="p-3 text-sm font-medium bg-muted/30">{row.label}</div>
                <div className="p-3 text-sm font-mono border-l">{row.dev}</div>
                <div className="p-3 text-sm font-mono border-l">{row.prod}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Environment Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 font-mono text-xs bg-muted p-2 rounded">
                <Box className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                providr/.env
              </div>
              <div className="flex items-center gap-2 font-mono text-xs bg-muted p-2 rounded">
                <Box className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                admin-portal/.env.local
              </div>
              <div className="flex items-center gap-2 font-mono text-xs bg-muted p-2 rounded">
                <Box className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                provider-portal/.env.local
              </div>
              <div className="flex items-center gap-2 font-mono text-xs bg-muted p-2 rounded">
                <Box className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                customer-portal/.env.local
              </div>
              <div className="flex items-center gap-2 font-mono text-xs bg-muted p-2 rounded">
                <Box className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                providr/config/database.php
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Port Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { port: '3306', service: 'MySQL', note: 'Local dev DB' },
                { port: '5432', service: 'PostgreSQL', note: 'Supabase (remote)' },
                { port: '8002', service: 'Laravel API', note: 'php artisan serve' },
                { port: '5174', service: 'Provider Portal', note: 'Vite dev server' },
                { port: '5176', service: 'Customer Portal', note: 'Vite dev server' },
                { port: '5177', service: 'Admin Portal', note: 'Vite dev server' },
              ].map((p) => (
                <div key={p.port} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs w-14 justify-center">{p.port}</Badge>
                    <span className="font-medium">{p.service}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{p.note}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─── Database ────────────────────────────────────────── */

function DatabaseTab() {
  const keyModels = [
    { table: 'users', description: 'Provider company users / staff', relationships: 'belongs to provider_companies' },
    { table: 'provider_companies', description: 'Registered provider organisations', relationships: 'has many users, services, reviews' },
    { table: 'services', description: 'Service categories (e.g. NDIS)', relationships: 'has many service_offerings' },
    { table: 'service_offerings', description: 'Provider-specific service instances', relationships: 'belongs to services, provider_companies' },
    { table: 'service_requests', description: 'Customer requests for services', relationships: 'belongs to customers' },
    { table: 'customers', description: 'End-user customer accounts', relationships: 'has many service_requests' },
    { table: 'reviews', description: 'Customer reviews of providers', relationships: 'belongs to provider_companies, customers' },
    { table: 'admins', description: 'Admin portal users', relationships: 'has roles, permissions' },
    { table: 'roles', description: 'User role definitions', relationships: 'has many permissions' },
    { table: 'permissions', description: 'Granular permission definitions', relationships: 'belongs to many roles' },
    { table: 'ai_models', description: 'AI model configurations', relationships: 'used by prompt sections' },
    { table: 'bsp_prompt_sections', description: 'BSP analysis prompt templates', relationships: 'uses ai_models' },
    { table: 'ndis_prompt_definitions', description: 'NDIS prompt templates', relationships: 'uses ai_models' },
    { table: 'incidents', description: 'Reported incidents', relationships: 'belongs to incident_types' },
    { table: 'notification_settings', description: 'User notification preferences', relationships: 'belongs to users' },
    { table: 'stripe_configurations', description: 'Stripe API settings', relationships: 'standalone' },
    { table: 'stripe_products', description: 'Stripe product/plan definitions', relationships: 'standalone' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="text-2xl font-bold">49</div>
            <p className="text-xs text-muted-foreground">Total Tables</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-2xl font-bold">1,272</div>
            <p className="text-xs text-muted-foreground">Total Rows (Prod)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-2xl font-bold">PostgreSQL 15</div>
            <p className="text-xs text-muted-foreground">Production Engine</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-2xl font-bold">MySQL 8.4</div>
            <p className="text-xs text-muted-foreground">Development Engine</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Models & Relationships</CardTitle>
          <CardDescription>Core database tables and their relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-[180px_1fr_1fr] bg-muted/50 border-b">
              <div className="p-3 font-semibold text-sm">Table</div>
              <div className="p-3 font-semibold text-sm border-l">Description</div>
              <div className="p-3 font-semibold text-sm border-l">Relationships</div>
            </div>
            {keyModels.map((model, i) => (
              <div key={model.table} className={`grid grid-cols-[180px_1fr_1fr] ${i < keyModels.length - 1 ? 'border-b' : ''}`}>
                <div className="p-3 font-mono text-sm font-medium bg-muted/30">{model.table}</div>
                <div className="p-3 text-sm border-l">{model.description}</div>
                <div className="p-3 text-sm text-muted-foreground border-l">{model.relationships}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Repos & Team ────────────────────────────────────── */

function ReposTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Laravel Backend</CardTitle>
            </div>
            <CardDescription>harishafeez1/providr.git</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <InfoRow label="Language" value="PHP 8.3" />
              <InfoRow label="Framework" value="Laravel 11" />
              <InfoRow label="Local Branch" value="Drew" />
              <InfoRow label="Main Branch" value="main" />
              <InfoRow label="Local Path" value="c:\DATA\Providr\providr" mono />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">React Frontends</CardTitle>
            </div>
            <CardDescription>harishafeez1/providr-react.git</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <InfoRow label="Language" value="TypeScript" />
              <InfoRow label="Framework" value="React 18 + Vite" />
              <InfoRow label="Local Branch" value="Drew" />
              <InfoRow label="Main Branch" value="main" />
              <InfoRow label="Local Path" value="c:\DATA\Providr\providr-react" mono />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repository Structure</CardTitle>
          <CardDescription>Monorepo layout for the React frontends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-sm space-y-1 bg-muted/30 p-4 rounded-lg">
            <div className="text-muted-foreground">providr-react/</div>
            <div className="pl-4 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-semibold text-blue-600 dark:text-blue-400">admin-portal/</span>
              <span className="text-xs text-muted-foreground">Shadcn + Refine admin dashboard</span>
            </div>
            <div className="pl-4 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-violet-500" />
              <span className="font-semibold text-violet-600 dark:text-violet-400">provider-portal/</span>
              <span className="text-xs text-muted-foreground">Provider company management</span>
            </div>
            <div className="pl-4 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">customer-portal/</span>
              <span className="text-xs text-muted-foreground">Customer-facing app</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Development Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Drew</p>
                  <p className="text-xs text-muted-foreground">Local development</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Working on branch <code className="bg-muted px-1 rounded">Drew</code>. Admin portal UI, customer portal UX, infrastructure, data sync.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">HUE Team</p>
                  <p className="text-xs text-muted-foreground">developertwocx-hue / Bilal</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Working on <code className="bg-muted px-1 rounded">main</code>. API controllers, admin CRUD pages, database migrations, Supabase setup.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── API Endpoints ───────────────────────────────────── */

function ApiEndpointsTab() {
  const endpoints = [
    { group: 'Auth', routes: [{ method: 'POST', path: '/api/admin/login', description: 'Admin login' }] },
    {
      group: 'Provider Management',
      routes: [
        { method: 'CRUD', path: '/api/admin/provider-companies', description: 'Provider companies' },
        { method: 'CRUD', path: '/api/admin/users', description: 'Provider users' },
        { method: 'CRUD', path: '/api/admin/provider-company-imports', description: 'CSV imports (no update)' },
        { method: 'CRUD', path: '/api/admin/claim-requests', description: 'Claim requests (no store)' },
        { method: 'POST', path: '/api/admin/claim-requests/:id/approve', description: 'Approve claim' },
      ],
    },
    {
      group: 'Services',
      routes: [
        { method: 'CRUD', path: '/api/admin/services', description: 'Service categories' },
        { method: 'CRUD', path: '/api/admin/service-offerings', description: 'Provider offerings' },
        { method: 'CRUD', path: '/api/admin/service-requests', description: 'Customer requests' },
      ],
    },
    {
      group: 'Customers',
      routes: [
        { method: 'CRUD', path: '/api/admin/customers', description: 'Customer accounts' },
        { method: 'R/D', path: '/api/admin/reviews', description: 'Reviews (list, show, delete)' },
        { method: 'CRUD', path: '/api/admin/customer-documents', description: 'Documents (no store)' },
      ],
    },
    {
      group: 'System Management',
      routes: [
        { method: 'CRUD', path: '/api/admin/ai-models', description: 'AI model configs' },
        { method: 'R/U', path: '/api/admin/prompt-management', description: 'BSP prompt sections' },
        { method: 'R/U', path: '/api/admin/ndis-prompts', description: 'NDIS prompt defs' },
        { method: 'CRUD', path: '/api/admin/roles', description: 'User roles' },
        { method: 'CRUD', path: '/api/admin/permissions', description: 'Permissions' },
        { method: 'CRUD', path: '/api/admin/incident-types', description: 'Incident types' },
        { method: 'CRUD', path: '/api/admin/admins', description: 'Admin users' },
      ],
    },
    {
      group: 'Stripe',
      routes: [
        { method: 'CRUD', path: '/api/admin/stripe-configurations', description: 'Stripe config' },
        { method: 'CRUD', path: '/api/admin/stripe-products', description: 'Stripe products' },
      ],
    },
    {
      group: 'Public',
      routes: [
        { method: 'GET', path: '/api/public/settings/branding', description: 'Public branding settings' },
      ],
    },
  ];

  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    CRUD: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
    'R/U': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    'R/D': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  };

  return (
    <div className="space-y-4">
      {endpoints.map((group) => (
        <Card key={group.group}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{group.group}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {group.routes.map((route) => (
                <div key={route.path} className="flex items-center gap-3 text-sm">
                  <Badge className={`${methodColors[route.method] || methodColors.GET} text-[10px] font-mono w-12 justify-center shrink-0`}>
                    {route.method}
                  </Badge>
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 font-mono">{route.path}</code>
                  <span className="text-xs text-muted-foreground shrink-0">{route.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */

export function InfrastructurePage() {
  const { health, isRefreshing, refresh } = useHealthChecks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Infrastructure Map</h1>
        <p className="text-muted-foreground">Complete visual overview of the Providr platform architecture</p>
      </div>
      <HealthBanner health={health} isRefreshing={isRefreshing} onRefresh={refresh} />
      <Separator />
      <Tabs defaultValue="architecture">
        <TabsList>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="tech-stack">Tech Stack</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API Endpoints</TabsTrigger>
          <TabsTrigger value="repos">Repos & Team</TabsTrigger>
        </TabsList>
        <TabsContent value="architecture"><ArchitectureMap health={health} /></TabsContent>
        <TabsContent value="tech-stack"><TechStackTab /></TabsContent>
        <TabsContent value="environments"><EnvironmentsTab /></TabsContent>
        <TabsContent value="database"><DatabaseTab /></TabsContent>
        <TabsContent value="api"><ApiEndpointsTab /></TabsContent>
        <TabsContent value="repos"><ReposTab /></TabsContent>
      </Tabs>
    </div>
  );
}
