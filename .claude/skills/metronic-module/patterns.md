# Patterns & Structure

This document outlines file structure patterns, directory organization, and naming conventions for creating modules in the Providr Provider Portal.

## File Structure Pattern

When creating a new module, follow this structure:

```
src/pages/[module-name]/
├── [feature]/
│   ├── [Feature]Page.tsx           # Main page component (uses Demo1Layout)
│   ├── [Feature]Content.tsx        # Page content wrapper
│   ├── blocks/                     # Sub-components/sections
│   │   ├── [Component].tsx         # Individual block components
│   │   └── [Component]Data.tsx     # Data/API integration layer
│   └── index.ts                    # Barrel export
└── index.ts                        # Module barrel export
```

## Example: Tasks Module

```
src/pages/tasks/
├── tasks-list/
│   ├── TasksListPage.tsx
│   ├── TasksListContent.tsx
│   ├── blocks/
│   │   ├── TasksTable.tsx
│   │   ├── TasksTableData.tsx
│   │   └── TaskFilters.tsx
│   └── index.ts
├── task-details/
│   ├── TaskDetailsPage.tsx
│   ├── TaskDetailsContent.tsx
│   ├── blocks/
│   │   ├── TaskInfo.tsx
│   │   └── TaskComments.tsx
│   └── index.ts
└── index.ts
```

## Naming Conventions

### Files and Components

| Type | Convention | Example |
|------|-----------|---------|
| **Page Components** | `[Feature]Page.tsx` | `TasksListPage.tsx` |
| **Content Components** | `[Feature]Content.tsx` | `TasksListContent.tsx` |
| **Block Components** | `[Component].tsx` | `TasksTable.tsx` |
| **Data Layers** | `[Component]Data.tsx` | `TasksTableData.tsx` |
| **Custom Hooks** | `use[HookName].ts` | `useTasksData.ts` |
| **Type Definitions** | Prefix with `I` or `T` | `ITask`, `TTaskStatus` |
| **Utility Functions** | `[function-name].ts` | `formatTaskDate.ts` |

### Directory Names

- Use **kebab-case** for directory names
- Be descriptive but concise
- Match the feature name

Examples:
- `tasks-list/`
- `user-profile/`
- `incident-reports/`
- `service-offerings/`

## Component File Structure

### 1. Page Component ([Feature]Page.tsx)

The main page component that uses the Demo1 layout.

**Responsibilities:**
- Wrap content in layout components (Container, Toolbar)
- Define page header with title and actions
- Import and render the content component
- Handle page-level state if needed

**Example:**
```tsx
import { Fragment } from 'react';
import { Container } from '@/components/Container';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/layouts/demo1';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { TasksListContent } from './TasksListContent';

const TasksListPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Tasks"
            description="Manage your tasks and assignments"
          />
          <ToolbarActions>
            <Button variant="primary" size="sm">
              <KeenIcon icon="plus" className="ki-filled" />
              Add Task
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <TasksListContent />
      </Container>
    </Fragment>
  );
};

export { TasksListPage };
```

### 2. Content Component ([Feature]Content.tsx)

The main content wrapper that organizes blocks.

**Responsibilities:**
- Organize block components
- Handle content-level state
- Manage layout of sub-components

**Example:**
```tsx
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { TasksTable } from './blocks/TasksTable';
import { TaskFilters } from './blocks/TaskFilters';

const TasksListContent = () => {
  return (
    <div className="space-y-4">
      <TaskFilters />

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">All Tasks</h3>
        </CardHeader>
        <CardBody>
          <TasksTable />
        </CardBody>
      </Card>
    </div>
  );
};

export { TasksListContent };
```

### 3. Block Components (blocks/[Component].tsx)

Reusable UI sections within a feature.

**Responsibilities:**
- Render specific UI sections
- Handle component-level logic
- Use data from data layer components
- Emit events to parent components

**Example:**
```tsx
import { DataGrid } from '@/components/data-grid';
import { Badge } from '@/components/ui/badge';
import { useTasksData } from './TasksTableData';

const TasksTable = () => {
  const { data, isLoading, error } = useTasksData();

  const columns = [
    {
      accessorKey: 'title',
      header: 'Task',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'completed' ? 'success' : 'warning'}>
          {row.original.status}
        </Badge>
      ),
    },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;

  return (
    <DataGrid
      columns={columns}
      data={data}
      pagination
      sorting
      filtering
    />
  );
};

export { TasksTable };
```

### 4. Data Layer Components (blocks/[Component]Data.tsx)

Handle data fetching and API integration.

**Responsibilities:**
- Define React Query hooks
- Handle API calls
- Manage data transformations
- Export reusable data hooks

**Example:**
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';

export const useTasksData = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await apiService.get('/api/tasks');
      return response.data;
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData) => {
      const response = await apiService.post('/api/tasks', taskData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
```

## Barrel Exports (index.ts)

Use barrel exports to simplify imports.

### Feature-level Export

**File:** `src/pages/tasks/tasks-list/index.ts`
```tsx
export { TasksListPage } from './TasksListPage';
export { TasksListContent } from './TasksListContent';
```

### Module-level Export

**File:** `src/pages/tasks/index.ts`
```tsx
export * from './tasks-list';
export * from './task-details';
```

### Usage

```tsx
// Instead of:
import { TasksListPage } from '@/pages/tasks/tasks-list/TasksListPage';

// You can write:
import { TasksListPage } from '@/pages/tasks/tasks-list';
// or even:
import { TasksListPage } from '@/pages/tasks';
```

## TypeScript Conventions

### Interface Naming

Prefix interfaces with `I`:

```tsx
interface ITask {
  id: string;
  title: string;
  status: TTaskStatus;
  assignedTo?: IUser;
  createdAt: string;
}

interface IUser {
  id: string;
  name: string;
  email: string;
}
```

### Type Naming

Prefix type aliases with `T`:

```tsx
type TTaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type TTaskPriority = 'low' | 'medium' | 'high' | 'urgent';
```

### Component Props

Use descriptive names with `Props` suffix:

```tsx
interface TasksTableProps {
  filters?: ITaskFilters;
  onTaskSelect?: (task: ITask) => void;
  showActions?: boolean;
}

const TasksTable = ({ filters, onTaskSelect, showActions = true }: TasksTableProps) => {
  // Component implementation
};
```

## Import Organization

Organize imports in this order:

```tsx
// 1. External libraries
import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Layout components
import { Container } from '@/components/Container';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1';

// 3. UI components
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';

// 4. Local components
import { TasksTable } from './blocks/TasksTable';
import { TaskFilters } from './blocks/TaskFilters';

// 5. Utilities and types
import { formatDate } from '@/utils/date';
import type { ITask, TTaskStatus } from '@/types/tasks';
```

## Module Creation Checklist

When creating a new module, ensure you:

### File Structure
- [ ] Create proper folder structure in `src/pages/[module-name]/`
- [ ] Create `[Feature]Page.tsx` for each feature
- [ ] Create `[Feature]Content.tsx` for each feature
- [ ] Create `blocks/` directory for sub-components
- [ ] Create barrel exports (`index.ts` files)

### Naming
- [ ] Follow naming conventions for all files
- [ ] Use PascalCase for component names
- [ ] Use kebab-case for directory names
- [ ] Prefix interfaces with `I` and types with `T`

### Components
- [ ] Use Demo1 layout components (Container, Toolbar)
- [ ] Import and use Shadcn UI components
- [ ] Use KeenIcons for all icons
- [ ] Create data layer components for API calls

### TypeScript
- [ ] Add proper TypeScript types/interfaces
- [ ] Define component props interfaces
- [ ] Type all functions and hooks

### Features
- [ ] Implement responsive design with Tailwind breakpoints
- [ ] Add dark mode support with `dark:` classes
- [ ] Implement error handling and loading states
- [ ] Add permission-based access control if needed

### Integration
- [ ] Add to routing configuration
- [ ] Update sidebar menu configuration
- [ ] Test on mobile, tablet, and desktop viewports

### Documentation
- [ ] Add comments for complex logic
- [ ] Document any custom hooks
- [ ] Update README if adding major features

---

**Pro Tip:** Before creating a new module, review similar existing modules (like `incidents` or `service-offerings`) to see real-world implementations of these patterns.
