import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import changelogData from '@/data/project-tracker/changelog.json';
import bugsData from '@/data/project-tracker/bugs.json';
import featuresData from '@/data/project-tracker/features.json';
import previousDevIssuesData from '@/data/project-tracker/previous-dev-issues.json';
import tasksData from '@/data/project-tracker/tasks.json';

function statusBadge(status: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    completed: 'default',
    fixed: 'default',
    pending: 'outline',
    'in-progress': 'secondary',
    documented: 'secondary',
  };
  return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
}

function severityBadge(severity: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    high: 'destructive',
    medium: 'secondary',
    low: 'outline',
  };
  return <Badge variant={variants[severity] || 'outline'}>{severity}</Badge>;
}

function typeBadge(type: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    added: 'default',
    fixed: 'secondary',
    changed: 'outline',
    removed: 'destructive',
  };
  return <Badge variant={variants[type] || 'outline'}>{type}</Badge>;
}

function OverviewTab() {
  const totalTasks = tasksData.tasks.length;
  const completedTasks = tasksData.tasks.filter((t) => t.status === 'completed').length;
  const totalBugs = bugsData.bugs.length;
  const fixedBugs = bugsData.bugs.filter((b) => b.status === 'fixed').length;
  const totalFeatures = featuresData.features.length;
  const prevIssues = previousDevIssuesData.issues.length;
  const prevFixed = previousDevIssuesData.issues.filter((i) => i.status === 'fixed').length;

  const stats = [
    { label: 'Tasks', value: `${completedTasks}/${totalTasks}`, sub: 'completed' },
    { label: 'Bugs Fixed', value: `${fixedBugs}/${totalBugs}`, sub: 'resolved' },
    { label: 'Features', value: `${totalFeatures}`, sub: 'delivered' },
    { label: 'Previous Dev Issues', value: `${prevFixed}/${prevIssues}`, sub: 'resolved' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-2xl">{s.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {changelogData.entries.slice().reverse().map((entry) => (
              <div key={entry.id} className="flex items-start gap-3">
                {typeBadge(entry.type)}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{entry.title}</p>
                  <p className="text-xs text-muted-foreground">{entry.date} &middot; {entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChangelogTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Changelog</CardTitle>
        <CardDescription>All changes made during development</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Date</TableHead>
              <TableHead className="w-20">Type</TableHead>
              <TableHead className="w-20">Task</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changelogData.entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm">{entry.date}</TableCell>
                <TableCell>{typeBadge(entry.type)}</TableCell>
                <TableCell className="text-sm font-mono">{entry.taskNumber}</TableCell>
                <TableCell className="text-sm font-medium">{entry.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BugsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bugs</CardTitle>
        <CardDescription>Bugs found and fixed during development</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead className="w-20">Severity</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Fix</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bugsData.bugs.map((bug) => (
              <TableRow key={bug.id}>
                <TableCell className="text-sm font-mono">{bug.id}</TableCell>
                <TableCell>{severityBadge(bug.severity)}</TableCell>
                <TableCell>{statusBadge(bug.status)}</TableCell>
                <TableCell className="text-sm">{bug.component}</TableCell>
                <TableCell className="text-sm font-medium">{bug.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{bug.fix}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function FeaturesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Features</CardTitle>
        <CardDescription>New features added during development</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead className="w-24">Date</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {featuresData.features.map((feat) => (
              <TableRow key={feat.id}>
                <TableCell className="text-sm font-mono">{feat.id}</TableCell>
                <TableCell className="text-sm">{feat.dateAdded}</TableCell>
                <TableCell>{statusBadge(feat.status)}</TableCell>
                <TableCell className="text-sm">{feat.component}</TableCell>
                <TableCell className="text-sm font-medium">{feat.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{feat.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PreviousDevIssuesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Previous Developer Issues</CardTitle>
        <CardDescription>
          Issues inherited from the previous development team
          (Original budget: ${previousDevIssuesData.projectInfo.originalBudget.toLocaleString()} {previousDevIssuesData.projectInfo.currency})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead className="w-20">Severity</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-16">Est. Hrs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {previousDevIssuesData.issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="text-sm font-mono">{issue.id}</TableCell>
                <TableCell>{severityBadge(issue.severity)}</TableCell>
                <TableCell>{statusBadge(issue.status)}</TableCell>
                <TableCell className="text-sm">{issue.component}</TableCell>
                <TableCell className="text-sm font-medium">{issue.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{issue.description}</TableCell>
                <TableCell className="text-sm text-center">{issue.estimatedHoursToFix ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TasksTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>All development tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-28">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasksData.tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="text-sm font-mono">{task.id}</TableCell>
                <TableCell>{statusBadge(task.status)}</TableCell>
                <TableCell className="text-sm font-medium">{task.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{task.date ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function ProjectTrackerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project Tracker</h1>
        <p className="text-muted-foreground">Development activity, bugs, features, and task tracking</p>
      </div>
      <Separator />
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
          <TabsTrigger value="bugs">Bugs</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="previous-dev">Previous Dev Issues</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="changelog"><ChangelogTab /></TabsContent>
        <TabsContent value="bugs"><BugsTab /></TabsContent>
        <TabsContent value="features"><FeaturesTab /></TabsContent>
        <TabsContent value="previous-dev"><PreviousDevIssuesTab /></TabsContent>
        <TabsContent value="tasks"><TasksTab /></TabsContent>
      </Tabs>
    </div>
  );
}
