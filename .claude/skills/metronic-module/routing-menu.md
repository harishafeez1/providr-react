# Routing & Menu Configuration

This document covers route configuration, protected routes, sidebar menu setup, and permission-based access control for the Providr Provider Portal.

## Route Configuration

### Adding a Basic Route

Routes are typically configured in `src/App.tsx` or a dedicated routing configuration file.

```tsx
import { Route, Routes } from 'react-router-dom';
import { TasksListPage } from '@/pages/tasks/tasks-list';

<Routes>
  <Route path="/tasks" element={<TasksListPage />} />
</Routes>
```

### Nested Routes

```tsx
import { TasksListPage } from '@/pages/tasks/tasks-list';
import { TaskDetailsPage } from '@/pages/tasks/task-details';

<Routes>
  <Route path="/tasks">
    <Route index element={<TasksListPage />} />
    <Route path=":taskId" element={<TaskDetailsPage />} />
  </Route>
</Routes>
```

**URLs:**
- `/tasks` → TasksListPage
- `/tasks/123` → TaskDetailsPage (with taskId = "123")

### Route with Multiple Sub-pages

```tsx
<Routes>
  <Route path="/tasks">
    <Route index element={<TasksListPage />} />
    <Route path="create" element={<CreateTaskPage />} />
    <Route path=":taskId" element={<TaskDetailsPage />} />
    <Route path=":taskId/edit" element={<EditTaskPage />} />
  </Route>
</Routes>
```

**URLs:**
- `/tasks` → List all tasks
- `/tasks/create` → Create new task
- `/tasks/123` → View task details
- `/tasks/123/edit` → Edit task

## Protected Routes

Use authentication wrapper to protect routes.

### Using RequireAuth Component

```tsx
import { RequireAuth } from '@/auth';
import { TasksListPage } from '@/pages/tasks/tasks-list';

<Route
  path="/tasks"
  element={
    <RequireAuth>
      <TasksListPage />
    </RequireAuth>
  }
/>
```

### Protected Route with Role Check

```tsx
import { RequireAuth } from '@/auth';

<Route
  path="/admin/users"
  element={
    <RequireAuth roles={['admin', 'super_admin']}>
      <UsersManagementPage />
    </RequireAuth>
  }
/>
```

### Multiple Protected Routes

```tsx
<Route
  element={
    <RequireAuth>
      <Demo1Layout />
    </RequireAuth>
  }
>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/tasks" element={<TasksListPage />} />
  <Route path="/profile" element={<ProfilePage />} />
</Route>
```

## Navigation

### Programmatic Navigation

```tsx
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ taskId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <Card onClick={handleClick} className="cursor-pointer">
      {/* Card content */}
    </Card>
  );
};
```

### Navigation with State

```tsx
const navigate = useNavigate();

// Pass state to next route
navigate('/tasks/create', {
  state: { fromDashboard: true }
});

// Receive state in destination component
const location = useLocation();
const fromDashboard = location.state?.fromDashboard;
```

### Go Back

```tsx
const navigate = useNavigate();

<Button onClick={() => navigate(-1)}>
  <KeenIcon icon="arrow-left" />
  Back
</Button>
```

### Using Link Component

```tsx
import { Link } from 'react-router-dom';

<Link to="/tasks" className="text-primary hover:underline">
  View All Tasks
</Link>
```

### Using NavLink (Active State)

```tsx
import { NavLink } from 'react-router-dom';

<NavLink
  to="/tasks"
  className={({ isActive }) =>
    isActive ? 'text-primary font-semibold' : 'text-gray-600'
  }
>
  Tasks
</NavLink>
```

## Route Parameters

### Getting Route Parameters

```tsx
import { useParams } from 'react-router-dom';

const TaskDetailsPage = () => {
  const { taskId } = useParams();

  const { data: task } = useTaskData(taskId!);

  return (
    <div>
      <h1>Task: {task?.title}</h1>
    </div>
  );
};
```

### Getting Query Parameters

```tsx
import { useSearchParams } from 'react-router-dom';

const TasksListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';

  const handleFilterChange = (newStatus: string) => {
    setSearchParams({ status: newStatus, search });
  };

  return (
    <div>
      <TaskFilters
        status={status}
        onStatusChange={handleFilterChange}
      />
    </div>
  );
};
```

**URL:** `/tasks?status=active&search=bug`

## Sidebar Menu Configuration

The sidebar menu is typically configured in `src/config/menu.config.tsx`.

### Menu Configuration File Structure

```tsx
// src/config/menu.config.tsx
import { KeenIcon } from '@/components/keenicons';

export interface IMenuItem {
  title: string;
  icon?: string;
  path?: string;
  permission?: string[];
  submenu?: IMenuItem[];
  badge?: string;
  badgeVariant?: 'success' | 'danger' | 'warning' | 'info';
}

export const MENU_SIDEBAR: IMenuItem[] = [
  // Menu items here
];
```

### Simple Menu Item

```tsx
export const MENU_SIDEBAR: IMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'dashboard',
    path: '/dashboard',
    permission: ['admin', 'editor', 'user'],
  },
  {
    title: 'Tasks',
    icon: 'check-square',
    path: '/tasks',
    permission: ['admin', 'editor', 'user'],
  },
];
```

### Menu Item with Badge

```tsx
{
  title: 'Notifications',
  icon: 'notification',
  path: '/notifications',
  badge: '5',
  badgeVariant: 'danger',
  permission: ['admin', 'editor', 'user'],
}
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
    {
      title: 'Archived',
      path: '/tasks/archived',
    },
  ],
}
```

### Menu with Multiple Levels

```tsx
{
  title: 'Management',
  icon: 'gear',
  permission: ['admin'],
  submenu: [
    {
      title: 'Users',
      submenu: [
        {
          title: 'All Users',
          path: '/admin/users',
        },
        {
          title: 'Roles',
          path: '/admin/roles',
        },
      ],
    },
    {
      title: 'Settings',
      path: '/admin/settings',
    },
  ],
}
```

### Complete Menu Example

```tsx
export const MENU_SIDEBAR: IMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'dashboard',
    path: '/dashboard',
    permission: ['admin', 'editor', 'user'],
  },
  {
    title: 'Tasks',
    icon: 'check-square',
    permission: ['admin', 'editor', 'user'],
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
        title: 'Create Task',
        path: '/tasks/create',
      },
    ],
  },
  {
    title: 'Incidents',
    icon: 'information',
    path: '/incidents',
    permission: ['admin', 'editor'],
    badge: '3',
    badgeVariant: 'warning',
  },
  {
    title: 'Service Offerings',
    icon: 'package',
    path: '/service-offerings',
    permission: ['admin'],
  },
  {
    title: 'Settings',
    icon: 'gear',
    path: '/settings',
    permission: ['admin', 'editor', 'user'],
  },
];
```

## Permission-Based Access

### Check Permissions in Components

```tsx
import { usePermissions } from '@/hooks/usePermissions';

const TasksPage = () => {
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission(['admin', 'editor']);
  const canDelete = hasPermission(['admin']);

  return (
    <Container>
      <Toolbar>
        <ToolbarHeading title="Tasks" />
        <ToolbarActions>
          {canCreate && (
            <Button variant="primary">
              <KeenIcon icon="plus" />
              Add Task
            </Button>
          )}
        </ToolbarActions>
      </Toolbar>

      <TasksList canDelete={canDelete} />
    </Container>
  );
};
```

### Conditional Rendering by Role

```tsx
const TasksTable = () => {
  const { userRole } = useAuth();

  return (
    <DataGrid
      columns={[
        {
          accessorKey: 'title',
          header: 'Task',
        },
        {
          accessorKey: 'status',
          header: 'Status',
        },
        // Only show actions column for admin and editor
        ...(userRole === 'admin' || userRole === 'editor'
          ? [
              {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => <TaskActions task={row.original} />,
              },
            ]
          : []),
      ]}
      data={data}
    />
  );
};
```

### Permission-Based Menu Filtering

The menu automatically filters items based on user permissions:

```tsx
// Menu items are automatically filtered based on permission field
// Only items matching user's roles will be displayed
const filteredMenu = MENU_SIDEBAR.filter(item => {
  if (!item.permission) return true;
  return item.permission.includes(userRole);
});
```

## Breadcrumb Configuration

### Using Breadcrumbs

```tsx
import { ToolbarBreadcrumbs } from '@/layouts/demo1';

<Toolbar>
  <ToolbarBreadcrumbs
    items={[
      { label: 'Home', path: '/' },
      { label: 'Tasks', path: '/tasks' },
      { label: 'Task Details' }, // Current page (no path)
    ]}
  />
</Toolbar>
```

### Dynamic Breadcrumbs

```tsx
const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const { data: task } = useTaskData(taskId!);

  return (
    <Container>
      <Toolbar>
        <ToolbarBreadcrumbs
          items={[
            { label: 'Home', path: '/' },
            { label: 'Tasks', path: '/tasks' },
            { label: task?.title || 'Loading...' },
          ]}
        />
      </Toolbar>

      {/* Page content */}
    </Container>
  );
};
```

## 404 Not Found Route

Add a catch-all route for 404 pages:

```tsx
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

<Routes>
  {/* All your routes */}
  <Route path="/tasks" element={<TasksListPage />} />

  {/* 404 catch-all route - must be last */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

## Redirect Routes

```tsx
import { Navigate } from 'react-router-dom';

<Routes>
  {/* Redirect root to dashboard */}
  <Route path="/" element={<Navigate to="/dashboard" replace />} />

  {/* Redirect old URL to new URL */}
  <Route path="/old-tasks" element={<Navigate to="/tasks" replace />} />

  {/* Your other routes */}
  <Route path="/dashboard" element={<DashboardPage />} />
</Routes>
```

## Route Guards Example

```tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const RequireAuth = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, save current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // User doesn't have required role
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

## Complete Routing Example

```tsx
// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '@/auth';
import { Demo1Layout } from '@/layouts/demo1';

// Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { TasksListPage } from '@/pages/tasks/tasks-list';
import { TaskDetailsPage } from '@/pages/tasks/task-details';
import { CreateTaskPage } from '@/pages/tasks/create-task';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes with layout */}
      <Route
        element={
          <RequireAuth>
            <Demo1Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Tasks routes */}
        <Route path="/tasks">
          <Route index element={<TasksListPage />} />
          <Route path="create" element={<CreateTaskPage />} />
          <Route path=":taskId" element={<TaskDetailsPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

---

**Remember:** Always protect sensitive routes with authentication and role-based access control.
