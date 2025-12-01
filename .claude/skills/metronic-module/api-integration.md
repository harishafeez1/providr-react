# API Integration with React Query

This document covers patterns for API integration using React Query (TanStack Query) in the Providr Provider Portal.

## Overview

The portal uses **React Query** for server state management, which provides:
- Automatic caching and background refetching
- Loading and error states
- Optimistic updates
- Query invalidation and refetching

## Data Layer Pattern

Create a separate `[Component]Data.tsx` file for each component that needs data.

### File Structure

```
blocks/
├── TasksTable.tsx          # UI component
└── TasksTableData.tsx      # Data layer (hooks)
```

## Basic Query Pattern

### Creating a Query Hook

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

### Using the Query Hook

```tsx
// TasksTable.tsx
import { useTasksData } from './TasksTableData';
import { DataGrid } from '@/components/data-grid';

const TasksTable = () => {
  const { data, isLoading, error, isError } = useTasksData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-danger">{error.message}</p>
      </div>
    );
  }

  return <DataGrid columns={columns} data={data} />;
};
```

## Query with Parameters

### Parameterized Query Hook

```tsx
// TasksTableData.tsx
export const useTasksData = (filters?: ITaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const response = await apiService.get('/api/tasks', {
        params: filters,
      });
      return response.data;
    },
    enabled: !!filters, // Only run if filters exist
  });
};

// Interface for filters
interface ITaskFilters {
  status?: string;
  assignedTo?: string;
  search?: string;
}
```

### Using Parameterized Query

```tsx
const TasksTable = () => {
  const [filters, setFilters] = useState<ITaskFilters>({
    status: 'active',
  });

  const { data, isLoading } = useTasksData(filters);

  return (
    <>
      <TaskFilters filters={filters} onChange={setFilters} />
      {isLoading ? <Loading /> : <DataGrid data={data} />}
    </>
  );
};
```

## Query by ID Pattern

### Single Item Query

```tsx
// TaskDetailsData.tsx
export const useTaskData = (taskId: string) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const response = await apiService.get(`/api/tasks/${taskId}`);
      return response.data;
    },
    enabled: !!taskId,
  });
};
```

### Usage

```tsx
const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const { data: task, isLoading } = useTaskData(taskId!);

  if (isLoading) return <Loading />;

  return (
    <div>
      <h1>{task.title}</h1>
      <p>{task.description}</p>
    </div>
  );
};
```

## Mutation Patterns

### Create Mutation

```tsx
// TasksTableData.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: ICreateTaskInput) => {
      const response = await apiService.post('/api/tasks', taskData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
};

interface ICreateTaskInput {
  title: string;
  description: string;
  assignedTo?: string;
}
```

### Using Create Mutation

```tsx
import { useCreateTask } from './TasksTableData';

const AddTaskForm = () => {
  const createTask = useCreateTask();

  const handleSubmit = async (values: ICreateTaskInput) => {
    createTask.mutate(values);
  };

  return (
    <Formik initialValues={{}} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form>
          {/* Form fields */}
          <Button
            type="submit"
            disabled={createTask.isPending || isSubmitting}
          >
            {createTask.isPending ? 'Creating...' : 'Create Task'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};
```

### Update Mutation

```tsx
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ITask> }) => {
      const response = await apiService.put(`/api/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedTask) => {
      // Update specific task in cache
      queryClient.setQueryData(['tasks', updatedTask.id], updatedTask);
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update task');
    },
  });
};
```

### Delete Mutation

```tsx
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await apiService.delete(`/api/tasks/${taskId}`);
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });
};
```

### Using Delete Mutation

```tsx
const TasksTable = () => {
  const deleteTask = useDeleteTask();

  const handleDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(taskId);
    }
  };

  return (
    <DataGrid
      columns={[
        // ... other columns
        {
          id: 'actions',
          cell: ({ row }) => (
            <Button
              variant="light"
              size="icon"
              onClick={() => handleDelete(row.original.id)}
              disabled={deleteTask.isPending}
            >
              <KeenIcon icon="trash" />
            </Button>
          ),
        },
      ]}
      data={data}
    />
  );
};
```

## Optimistic Updates

For better UX, update UI before server confirms:

```tsx
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiService.patch(`/api/tasks/${id}/status`, { status });
      return response.data;
    },
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(['tasks']);

      // Optimistically update cache
      queryClient.setQueryData(['tasks'], (old: any) =>
        old.map((task: ITask) =>
          task.id === id ? { ...task, status } : task
        )
      );

      // Return snapshot for rollback
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      toast.error('Failed to update status');
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
```

## Pagination Pattern

```tsx
export const usePaginatedTasks = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['tasks', 'paginated', page, pageSize],
    queryFn: async () => {
      const response = await apiService.get('/api/tasks', {
        params: { page, pageSize },
      });
      return response.data;
    },
    keepPreviousData: true, // Keep old data while fetching new
  });
};
```

### Using Pagination

```tsx
const TasksTable = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isFetching } = usePaginatedTasks(page, pageSize);

  return (
    <>
      <DataGrid
        data={data?.items}
        pagination={{
          pageIndex: page - 1,
          pageSize,
          pageCount: data?.totalPages,
          onPageChange: (newPage) => setPage(newPage + 1),
        }}
      />
      {isFetching && <div>Updating...</div>}
    </>
  );
};
```

## Infinite Query Pattern

For infinite scroll or "load more" functionality:

```tsx
export const useInfiniteTasks = () => {
  return useInfiniteQuery({
    queryKey: ['tasks', 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.get('/api/tasks', {
        params: { page: pageParam, pageSize: 20 },
      });
      return response.data;
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
  });
};
```

### Using Infinite Query

```tsx
const TasksList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTasks();

  return (
    <>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.items.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ))}

      {hasNextPage && (
        <Button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </>
  );
};
```

## Dependent Queries

When one query depends on another:

```tsx
const TaskDetailsPage = () => {
  const { taskId } = useParams();

  // First query
  const { data: task } = useTaskData(taskId!);

  // Second query depends on first
  const { data: assignee } = useUserData(task?.assignedTo, {
    enabled: !!task?.assignedTo,
  });

  return (
    <div>
      <h1>{task?.title}</h1>
      {assignee && <p>Assigned to: {assignee.name}</p>}
    </div>
  );
};
```

## Error Handling

### Global Error Handling

```tsx
// In your React Query client setup
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error: any) => {
        console.error('Query error:', error);
        toast.error(error.message || 'An error occurred');
      },
    },
    mutations: {
      onError: (error: any) => {
        console.error('Mutation error:', error);
        toast.error(error.message || 'An error occurred');
      },
    },
  },
});
```

### Component-Level Error Handling

```tsx
const TasksTable = () => {
  const { data, isError, error, refetch } = useTasksData();

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-danger mb-4">
          <KeenIcon icon="warning" className="ki-filled text-4xl" />
        </div>
        <p className="text-gray-900 dark:text-gray-100 mb-2">
          Failed to load tasks
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {error.message}
        </p>
        <Button onClick={() => refetch()} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return <DataGrid data={data} />;
};
```

## Loading States

### Skeleton Loader

```tsx
const TasksTable = () => {
  const { data, isLoading } = useTasksData();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return <DataGrid data={data} />;
};
```

## Complete Data Layer Example

```tsx
// TasksTableData.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

// Types
interface ITask {
  id: string;
  title: string;
  status: string;
  assignedTo?: string;
}

interface ITaskFilters {
  status?: string;
  search?: string;
}

// Query: Get all tasks
export const useTasksData = (filters?: ITaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const response = await apiService.get('/api/tasks', { params: filters });
      return response.data;
    },
  });
};

// Query: Get single task
export const useTaskData = (taskId: string) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const response = await apiService.get(`/api/tasks/${taskId}`);
      return response.data;
    },
    enabled: !!taskId,
  });
};

// Mutation: Create task
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: Partial<ITask>) => {
      const response = await apiService.post('/api/tasks', taskData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully!');
    },
  });
};

// Mutation: Update task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ITask> }) => {
      const response = await apiService.put(`/api/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully!');
    },
  });
};

// Mutation: Delete task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await apiService.delete(`/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully!');
    },
  });
};
```

---

**Remember:** Always handle loading and error states to provide a great user experience.
