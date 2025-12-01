import { DataGrid } from '@/components/data-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { use[Component]Data } from './[Component]Data';

/**
 * [Component]Table Component
 *
 * Data table component for displaying [data description].
 * Handles loading, error states, and renders table with actions.
 */
const [Component]Table = () => {
  const { data, isLoading, isError, error } = use[Component]Data();

  // Column definitions
  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-gray-400">
          #{row.original.id}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.name}
          </div>
          {row.original.description && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusVariant = {
          active: 'success',
          inactive: 'danger',
          pending: 'warning',
        }[row.original.status] || 'default';

        return (
          <Badge variant={statusVariant}>
            {row.original.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="light"
            size="icon"
            onClick={() => handleView(row.original)}
          >
            <KeenIcon icon="eye" className="ki-outline" />
          </Button>
          <Button
            variant="light"
            size="icon"
            onClick={() => handleEdit(row.original)}
          >
            <KeenIcon icon="pencil" className="ki-outline" />
          </Button>
          <Button
            variant="light"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
          >
            <KeenIcon icon="trash" className="ki-outline" />
          </Button>
        </div>
      ),
    },
  ];

  // Action handlers
  const handleView = (item: any) => {
    // Navigate to details page or open modal
    console.log('View:', item);
  };

  const handleEdit = (item: any) => {
    // Navigate to edit page or open edit modal
    console.log('Edit:', item);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      // Call delete mutation
      console.log('Delete:', id);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-danger mb-4">
          <KeenIcon icon="warning" className="ki-filled text-4xl" />
        </div>
        <p className="text-gray-900 dark:text-gray-100 font-semibold mb-2">
          Failed to load data
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {error?.message || 'An error occurred while fetching data'}
        </p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <KeenIcon icon="folder" className="ki-outline text-gray-400 text-3xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No items found
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Get started by creating your first item
        </p>
        <Button variant="primary">
          <KeenIcon icon="plus" className="ki-filled" />
          Create New
        </Button>
      </div>
    );
  }

  // Render table
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

export { [Component]Table };
