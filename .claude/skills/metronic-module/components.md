# Components & UI Patterns

This document provides examples and patterns for using components in the Providr Provider Portal.

## Layout Components

### Container

Wraps content in fixed or fluid layouts.

```tsx
import { Container } from '@/components/Container';

<Container>
  {/* Your content */}
</Container>
```

### Toolbar Components

The toolbar provides a consistent header area for pages.

```tsx
import { Toolbar, ToolbarHeading, ToolbarActions, ToolbarBreadcrumbs } from '@/layouts/demo1';

<Toolbar>
  <ToolbarHeading
    title="Page Title"
    description="Page description or subtitle"
  />
  <ToolbarActions>
    <Button variant="primary" size="sm">
      Primary Action
    </Button>
  </ToolbarActions>
</Toolbar>
```

**With Breadcrumbs:**
```tsx
<Toolbar>
  <ToolbarBreadcrumbs
    items={[
      { label: 'Home', path: '/' },
      { label: 'Tasks', path: '/tasks' },
      { label: 'Task Details' }
    ]}
  />
  <ToolbarActions>
    {/* Actions */}
  </ToolbarActions>
</Toolbar>
```

## Card Components

Cards are the primary container for content sections.

### Basic Card

```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <h3 className="text-lg font-semibold">Card Title</h3>
  </CardHeader>
  <CardBody>
    {/* Card content */}
  </CardBody>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

### Card with Actions

```tsx
<Card>
  <CardHeader className="flex items-center justify-between">
    <h3 className="text-lg font-semibold">Card Title</h3>
    <Button variant="light" size="sm">
      <KeenIcon icon="pencil" className="ki-outline" />
      Edit
    </Button>
  </CardHeader>
  <CardBody>
    {/* Content */}
  </CardBody>
</Card>
```

### Card Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>
    <CardBody>Card 1</CardBody>
  </Card>
  <Card>
    <CardBody>Card 2</CardBody>
  </Card>
  <Card>
    <CardBody>Card 3</CardBody>
  </Card>
</div>
```

## Button Components

### Button Variants

```tsx
import { Button } from '@/components/ui/button';

// Primary button (default)
<Button variant="default">Default Button</Button>
<Button variant="primary">Primary Button</Button>

// Secondary variants
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="light">Light</Button>

// Status buttons
<Button variant="destructive">Delete</Button>

// Link style
<Button variant="link">Link Button</Button>
```

### Button Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <KeenIcon icon="plus" />
</Button>
```

### Buttons with Icons

```tsx
import { KeenIcon } from '@/components/keenicons';

// Icon on left
<Button variant="primary" size="sm">
  <KeenIcon icon="plus" className="ki-filled" />
  Add New
</Button>

// Icon on right
<Button variant="light" size="sm">
  Download
  <KeenIcon icon="download" className="ki-outline" />
</Button>

// Icon only
<Button variant="light" size="icon">
  <KeenIcon icon="trash" className="ki-outline" />
</Button>
```

### Button Groups

```tsx
<div className="flex gap-2">
  <Button variant="primary">Save</Button>
  <Button variant="light">Cancel</Button>
</div>
```

## Badge Components

Badges display status and labels.

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="success">Active</Badge>
<Badge variant="danger">Inactive</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">In Progress</Badge>
<Badge variant="default">Default</Badge>
```

**In Table Cells:**
```tsx
const columns = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const statusVariant = {
        active: 'success',
        inactive: 'danger',
        pending: 'warning',
      }[row.original.status];

      return (
        <Badge variant={statusVariant}>
          {row.original.status}
        </Badge>
      );
    },
  },
];
```

## Form Components

### Input Fields

```tsx
import { Input } from '@/components/ui/input';

<div>
  <label className="form-label">Name</label>
  <Input
    type="text"
    placeholder="Enter name"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
</div>
```

### Select Dropdown

```tsx
import { Select } from '@/components/ui/select';

<div>
  <label className="form-label">Status</label>
  <Select value={status} onValueChange={setStatus}>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
    <option value="pending">Pending</option>
  </Select>
</div>
```

### Checkbox

```tsx
import { Checkbox } from '@/components/ui/checkbox';

<div className="flex items-center gap-2">
  <Checkbox
    id="terms"
    checked={accepted}
    onCheckedChange={setAccepted}
  />
  <label htmlFor="terms" className="text-sm cursor-pointer">
    I accept the terms and conditions
  </label>
</div>
```

### Switch Toggle

```tsx
import { Switch } from '@/components/ui/switch';

<div className="flex items-center gap-2">
  <Switch
    id="notifications"
    checked={enabled}
    onCheckedChange={setEnabled}
  />
  <label htmlFor="notifications" className="text-sm cursor-pointer">
    Enable notifications
  </label>
</div>
```

### Complete Form with Formik

```tsx
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().matches(/^\d{10}$/, 'Phone must be 10 digits'),
});

<Formik
  initialValues={{ name: '', email: '', phone: '' }}
  validationSchema={validationSchema}
  onSubmit={(values, { setSubmitting }) => {
    // Handle form submission
    console.log(values);
    setSubmitting(false);
  }}
>
  {({ errors, touched, isSubmitting }) => (
    <Form className="space-y-4">
      <div>
        <label className="form-label">Name *</label>
        <Field name="name" as={Input} />
        {errors.name && touched.name && (
          <div className="text-danger text-sm mt-1">{errors.name}</div>
        )}
      </div>

      <div>
        <label className="form-label">Email *</label>
        <Field name="email" type="email" as={Input} />
        {errors.email && touched.email && (
          <div className="text-danger text-sm mt-1">{errors.email}</div>
        )}
      </div>

      <div>
        <label className="form-label">Phone</label>
        <Field name="phone" type="tel" as={Input} />
        {errors.phone && touched.phone && (
          <div className="text-danger text-sm mt-1">{errors.phone}</div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
        <Button type="button" variant="light">
          Cancel
        </Button>
      </div>
    </Form>
  )}
</Formik>
```

## Data Table (DataGrid)

```tsx
import { DataGrid } from '@/components/data-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';

const TasksTable = ({ data }) => {
  const columns = [
    {
      accessorKey: 'title',
      header: 'Task',
    },
    {
      accessorKey: 'assignee',
      header: 'Assigned To',
      cell: ({ row }) => row.original.assignee?.name || 'Unassigned',
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
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => new Date(row.original.dueDate).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="light" size="icon">
            <KeenIcon icon="pencil" className="ki-outline" />
          </Button>
          <Button variant="light" size="icon">
            <KeenIcon icon="trash" className="ki-outline" />
          </Button>
        </div>
      ),
    },
  ];

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
```

## Dialog/Modal Components

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

const [isOpen, setIsOpen] = useState(false);

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        Are you sure you want to proceed? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>

    <div className="py-4">
      {/* Dialog content */}
      <p>Additional information or form fields go here.</p>
    </div>

    <DialogFooter>
      <Button variant="light" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Dialog with Form

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add New Task</DialogTitle>
      <DialogDescription>
        Fill in the details to create a new task.
      </DialogDescription>
    </DialogHeader>

    <Formik
      initialValues={{ title: '', description: '' }}
      onSubmit={(values) => {
        handleSubmit(values);
        setIsOpen(false);
      }}
    >
      {() => (
        <Form className="space-y-4 py-4">
          <div>
            <label className="form-label">Title</label>
            <Field name="title" as={Input} />
          </div>

          <div>
            <label className="form-label">Description</label>
            <Field name="description" as={Input} />
          </div>

          <DialogFooter>
            <Button type="button" variant="light" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Task
            </Button>
          </DialogFooter>
        </Form>
      )}
    </Formik>
  </DialogContent>
</Dialog>
```

## Dropdown Menu Components

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
    <DropdownMenuItem onClick={handleView}>
      <KeenIcon icon="eye" className="ki-outline" />
      View Details
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleEdit}>
      <KeenIcon icon="pencil" className="ki-outline" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleDelete} className="text-danger">
      <KeenIcon icon="trash" className="ki-outline" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Tabs Components

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    {/* Overview content */}
  </TabsContent>

  <TabsContent value="details">
    {/* Details content */}
  </TabsContent>

  <TabsContent value="settings">
    {/* Settings content */}
  </TabsContent>
</Tabs>
```

## Tooltip Components

```tsx
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="light" size="icon">
      <KeenIcon icon="information" className="ki-outline" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Additional information about this feature</p>
  </TooltipContent>
</Tooltip>
```

## Popover Components

```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <KeenIcon icon="calendar" className="ki-outline" />
      Select Date
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
    />
  </PopoverContent>
</Popover>
```

## KeenIcons Usage

KeenIcons is the Metronic custom icon set. Always use KeenIcons instead of other icon libraries.

### Icon Styles

```tsx
import { KeenIcon } from '@/components/keenicons';

// Outlined (default, lightweight)
<KeenIcon icon="home" className="ki-outline" />

// Filled (solid fill)
<KeenIcon icon="user" className="ki-filled" />

// Duotone (two-tone)
<KeenIcon icon="chart" className="ki-duotone" />

// Solid (bold)
<KeenIcon icon="search" className="ki-solid" />
```

### Common Icons Reference

**Navigation:**
- `home`, `dashboard`, `menu`, `arrow-left`, `arrow-right`, `arrow-up`, `arrow-down`

**Actions:**
- `plus`, `edit`, `pencil`, `trash`, `search`, `filter`, `download`, `upload`, `save`, `copy`

**Status:**
- `check`, `cross`, `information`, `warning`, `notification`, `alert`

**UI Elements:**
- `dots-vertical`, `dots-horizontal`, `calendar`, `clock`, `user`, `settings`, `gear`

**File & Data:**
- `file`, `folder`, `document`, `image`, `attachment`

**Communication:**
- `email`, `message`, `phone`, `chat`

### Icon Sizing

```tsx
// Small (16px)
<KeenIcon icon="plus" className="ki-outline text-base" />

// Medium (20px) - default
<KeenIcon icon="plus" className="ki-outline" />

// Large (24px)
<KeenIcon icon="plus" className="ki-outline text-2xl" />
```

## Notification Components

### Toast Notifications (Sonner)

```tsx
import { toast } from 'sonner';

// Success
toast.success('Task created successfully!');

// Error
toast.error('Failed to create task');

// Info
toast.info('Processing your request...');

// Warning
toast.warning('This action cannot be undone');

// Custom
toast('Custom message', {
  description: 'Additional details here',
  action: {
    label: 'Undo',
    onClick: () => handleUndo(),
  },
});
```

### Snackbar (Notistack)

```tsx
import { useSnackbar } from 'notistack';

const { enqueueSnackbar } = useSnackbar();

enqueueSnackbar('Task updated', { variant: 'success' });
enqueueSnackbar('An error occurred', { variant: 'error' });
enqueueSnackbar('Warning message', { variant: 'warning' });
enqueueSnackbar('Info message', { variant: 'info' });
```

---

**Remember:** Always use Shadcn UI components when available. Don't create custom components that duplicate existing functionality.
