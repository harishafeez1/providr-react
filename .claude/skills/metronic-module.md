# Metronic Provider Portal Module Creator

You are creating a new module for the Providr Provider Portal using the **Metronic Tailwind React theme**. Follow the established patterns and conventions outlined below.

## Theme & Tech Stack

### Core Technologies
- **Theme**: Metronic (Tailwind CSS version)
- **CSS Framework**: Tailwind CSS v3.4.14
- **Component Libraries**: Shadcn UI (built on Radix UI primitives)
- **Icons**: KeenIcons (Metronic custom icon set with styles: ki-filled, ki-outline, ki-duotone, ki-solid)
- **Layout**: Demo1 (sidebar + fixed header)
- **TypeScript**: Fully typed components

### UI Component Library
- **Primary**: Shadcn UI components located in `src/components/ui/`
  - Available components: button, card, input, badge, checkbox, dialog, dropdown-menu, popover, select, switch, table, tabs, tooltip, calendar, breadcrumb, etc.
- **Icons**: KeenIcons from `src/components/keenicons/`
- **Charts**: ApexCharts
- **Forms**: Formik + Yup validation
- **Notifications**: Sonner + Notistack
- **Data Tables**: TanStack React Table (DataGrid component)

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

### Example Module Structure
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
└── index.ts
```

## Naming Conventions

- **Pages**: `[Feature]Page.tsx` (e.g., `TasksListPage.tsx`)
- **Content**: `[Feature]Content.tsx` (e.g., `TasksListContent.tsx`)
- **Blocks**: `[Component].tsx` (e.g., `TasksTable.tsx`)
- **Data layers**: `[Component]Data.tsx` (e.g., `TasksTableData.tsx`)
- **Hooks**: `use[HookName].ts` (e.g., `useTasksData`)
- **Types**: Prefix with `I` or `T` (e.g., `ITask`, `TTaskStatus`)

## Page Template Pattern

### Main Page Component
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

### Content Component
```tsx
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { TasksTable } from './blocks/TasksTable';

const TasksListContent = () => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">All Tasks</h3>
      </CardHeader>
      <CardBody>
        <TasksTable />
      </CardBody>
    </Card>
  );
};

export { TasksListContent };
```

### Barrel Export (index.ts)
```tsx
export { TasksListPage } from './TasksListPage';
export { TasksListContent } from './TasksListContent';
```

## Layout Integration

### Demo1 Layout
All pages use the Demo1Layout wrapper which provides:
- Fixed header with logo and topbar
- Collapsible sidebar navigation
- Toolbar area (breadcrumbs + page actions)
- Main content area
- Footer

### Layout Components
- `Container` - Wrapper for fixed/fluid layouts
- `Toolbar` - Top page toolbar area
- `ToolbarHeading` - Page title and description
- `ToolbarActions` - Action buttons in toolbar
- `ToolbarBreadcrumbs` - Breadcrumb navigation

## Common Component Patterns

### Card Layout
```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <h3 className="text-lg font-semibold">Card Title</h3>
  </CardHeader>
  <CardBody>
    {/* Content */}
  </CardBody>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

### Buttons with Icons
```tsx
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';

<Button variant="primary" size="sm">
  <KeenIcon icon="plus" className="ki-filled" />
  Add New
</Button>

<Button variant="light" size="sm">
  <KeenIcon icon="filter" className="ki-outline" />
  Filter
</Button>
```

### Button Variants
- `default` - Primary button
- `destructive` - Danger/delete actions
- `outline` - Outlined button
- `secondary` - Secondary actions
- `ghost` - Minimal button
- `light` - Metronic light variant
- `link` - Link-styled button

### Button Sizes
- `sm` - Small (height: 32px)
- `default` - Default (height: 40px)
- `lg` - Large (height: 44px)
- `icon` - Icon only (40x40px)

### Badges
```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="success">Active</Badge>
<Badge variant="danger">Inactive</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">In Progress</Badge>
```

### Data Tables
```tsx
import { DataGrid } from '@/components/data-grid';

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'active' ? 'success' : 'danger'}>
        {row.original.status}
      </Badge>
    ),
  },
];

<DataGrid
  columns={columns}
  data={data}
  pagination
  sorting
  filtering
/>
```

### Forms with Formik
```tsx
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

<Formik
  initialValues={{ name: '', email: '' }}
  validationSchema={validationSchema}
  onSubmit={(values) => {
    console.log(values);
  }}
>
  {({ errors, touched }) => (
    <Form className="space-y-4">
      <div>
        <label className="form-label">Name</label>
        <Field name="name" as={Input} />
        {errors.name && touched.name && (
          <div className="text-danger text-sm mt-1">{errors.name}</div>
        )}
      </div>

      <div>
        <label className="form-label">Email</label>
        <Field name="email" type="email" as={Input} />
        {errors.email && touched.email && (
          <div className="text-danger text-sm mt-1">{errors.email}</div>
        )}
      </div>

      <Button type="submit" variant="primary">
        Submit
      </Button>
    </Form>
  )}
</Formik>
```

### Dialogs/Modals
```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description text here
      </DialogDescription>
    </DialogHeader>

    <div className="py-4">
      {/* Dialog content */}
    </div>

    <DialogFooter>
      <Button variant="light" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit}>
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Dropdown Menus
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="light" size="sm">
      <KeenIcon icon="dots-vertical" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>
      <KeenIcon icon="pencil" className="ki-outline" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem className="text-danger">
      <KeenIcon icon="trash" className="ki-outline" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Styling Conventions

### Tailwind CSS Classes
Use Tailwind utility classes following these patterns:

**Layout:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<div className="flex items-center justify-between">
<div className="space-y-4">
```

**Typography:**
```tsx
<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
<p className="text-sm text-gray-600 dark:text-gray-400">
```

**Spacing:**
```tsx
<div className="p-4 px-6 py-8">
<div className="mt-4 mb-6 mx-auto">
```

**Colors (Contextual):**
- `text-brand` / `bg-brand` - Brand color (#FF6F1E)
- `text-primary` / `bg-primary` - Primary color
- `text-success` / `bg-success` - Success state
- `text-danger` / `bg-danger` - Danger state
- `text-warning` / `bg-warning` - Warning state
- `text-info` / `bg-info` - Info state

**Dark Mode:**
```tsx
<div className="bg-white dark:bg-gray-800">
<p className="text-gray-900 dark:text-gray-100">
```

### Metronic CSS Classes
Use these Metronic-specific classes when needed:

**Buttons:**
- `.btn` - Base button class
- `.btn-sm`, `.btn-lg` - Button sizes
- `.btn-primary`, `.btn-light` - Button variants

**Cards:**
- `.card` - Card wrapper
- `.card-header` - Card header
- `.card-body` - Card body
- `.card-footer` - Card footer

**Alerts:**
- `.alert` - Alert wrapper
- `.alert-success`, `.alert-danger`, `.alert-warning`, `.alert-info`

**Menu:**
- `.menu`, `.menu-item`, `.menu-link`

## KeenIcons Usage

### Icon Styles
```tsx
import { KeenIcon } from '@/components/keenicons';

<KeenIcon icon="home" className="ki-outline" />    // Outlined
<KeenIcon icon="user" className="ki-filled" />     // Filled
<KeenIcon icon="chart" className="ki-duotone" />   // Duotone
<KeenIcon icon="search" className="ki-solid" />    // Solid
```

### Common Icons
- Navigation: `home`, `dashboard`, `menu`, `arrow-left`, `arrow-right`
- Actions: `plus`, `edit`, `trash`, `search`, `filter`, `download`, `upload`
- Status: `check`, `cross`, `information`, `warning`, `notification`
- UI: `dots-vertical`, `dots-horizontal`, `calendar`, `clock`, `user`, `settings`

## API Integration Pattern

### Data Layer Component
```tsx
// TasksTableData.tsx
import { useQuery } from '@tanstack/react-query';
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
```

### Usage in Component
```tsx
// TasksTable.tsx
import { useTasksData } from './TasksTableData';

const TasksTable = () => {
  const { data, isLoading, error } = useTasksData();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;

  return (
    <DataGrid
      columns={columns}
      data={data}
    />
  );
};
```

## Routing Integration

### Add Route
Update `src/App.tsx` or route configuration:

```tsx
import { TasksListPage } from '@/pages/tasks/tasks-list';

<Route path="/tasks" element={<TasksListPage />} />
```

### Protected Routes
```tsx
import { RequireAuth } from '@/auth';

<Route
  path="/tasks"
  element={
    <RequireAuth>
      <TasksListPage />
    </RequireAuth>
  }
/>
```

## Menu Configuration

### Add to Sidebar Menu
Update `src/config/menu.config.tsx`:

```tsx
export const MENU_SIDEBAR: TMenuConfig = [
  // ... existing items
  {
    title: 'Tasks',
    icon: 'check-square',
    path: '/tasks',
    permission: ['admin', 'editor', 'user']
  },
];
```

### Menu with Submenu
```tsx
{
  title: 'Tasks',
  icon: 'check-square',
  permission: ['admin', 'editor'],
  submenu: [
    {
      title: 'All Tasks',
      path: '/tasks',
    },
    {
      title: 'My Tasks',
      path: '/tasks/my-tasks',
    },
    {
      title: 'Completed',
      path: '/tasks/completed',
    },
  ]
}
```

## Responsive Design

### Mobile-First Breakpoints
```tsx
// Mobile (default)
<div className="flex flex-col">

// Tablet and up (md: 768px)
<div className="flex flex-col md:flex-row">

// Desktop and up (lg: 1024px)
<div className="grid grid-cols-1 lg:grid-cols-3">

// Large desktop (xl: 1280px)
<div className="container xl:max-w-7xl">
```

### Mobile Sidebar
The sidebar automatically collapses on mobile and uses a drawer overlay.

## State Management

### Context API (Preferred for local state)
```tsx
import { createContext, useContext, useState } from 'react';

const TasksContext = createContext(null);

export const TasksProvider = ({ children }) => {
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <TasksContext.Provider value={{ selectedTask, setSelectedTask }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => useContext(TasksContext);
```

### Redux (For global app state)
Available but use sparingly. Prefer React Query for server state and Context API for UI state.

## Best Practices

1. **Always use TypeScript** - Define interfaces for all data structures
2. **Follow existing patterns** - Look at similar modules (incidents, service-offerings) for reference
3. **Use Shadcn UI components** - Don't create custom components when Shadcn UI has them
4. **Implement dark mode** - Use Tailwind dark mode classes (`dark:`)
5. **Make it responsive** - Test on mobile, tablet, and desktop
6. **Add loading states** - Use React Query loading states
7. **Handle errors** - Show user-friendly error messages
8. **Use KeenIcons** - Don't use other icon libraries
9. **Follow accessibility** - Use semantic HTML and ARIA attributes
10. **Optimize imports** - Use barrel exports and absolute imports with `@/`

## Permission-Based Access

### Check Permissions
```tsx
import { usePermissions } from '@/hooks/usePermissions';

const TasksPage = () => {
  const { hasPermission } = usePermissions();

  const canEdit = hasPermission(['admin', 'editor']);

  return (
    <>
      {canEdit && (
        <Button variant="primary">
          <KeenIcon icon="plus" />
          Add Task
        </Button>
      )}
    </>
  );
};
```

## Quick Reference: Component Imports

```tsx
// Layout
import { Container } from '@/components/Container';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/layouts/demo1';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Icons
import { KeenIcon } from '@/components/keenicons';

// Data Grid
import { DataGrid } from '@/components/data-grid';

// Forms
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// React Query
import { useQuery, useMutation } from '@tanstack/react-query';

// Notifications
import { toast } from 'sonner';
import { useSnackbar } from 'notistack';
```

## Example: Complete Module Implementation

```tsx
// src/pages/tasks/tasks-list/TasksListPage.tsx
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
            title="Tasks Management"
            description="View and manage all tasks"
          />
          <ToolbarActions>
            <Button variant="light" size="sm">
              <KeenIcon icon="filter" className="ki-outline" />
              Filter
            </Button>
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

---

## Module Creation Checklist

When creating a new module, ensure you:

- [ ] Create proper folder structure in `src/pages/[module-name]/`
- [ ] Follow naming conventions ([Feature]Page.tsx, [Feature]Content.tsx)
- [ ] Use Demo1 layout components (Container, Toolbar)
- [ ] Import and use Shadcn UI components
- [ ] Use KeenIcons for all icons
- [ ] Implement responsive design with Tailwind breakpoints
- [ ] Add dark mode support with `dark:` classes
- [ ] Create data layer with React Query
- [ ] Add proper TypeScript types/interfaces
- [ ] Implement error handling and loading states
- [ ] Add to routing configuration
- [ ] Update sidebar menu configuration
- [ ] Add permission-based access control
- [ ] Create barrel exports (index.ts files)
- [ ] Test on mobile, tablet, and desktop viewports

---

Now create the requested module following all the patterns and conventions above.
