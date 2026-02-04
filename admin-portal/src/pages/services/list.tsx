import { useList, useDelete } from '@refinedev/core';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable, type DataTableAction } from '@/components/data-table/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function ServiceList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const { mutate: deleteOne } = useDelete();

  const { data, isLoading, isError } = useList({
    resource: 'services',
    pagination: { current: page, pageSize },
    filters: search ? [{ field: 'search', operator: 'eq', value: search }] : [],
    sorters: [{ field: 'id', order: 'desc' }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Service',
      cell: ({ row }) => (
        <Link to={`/services/show/${row.original.id}`} className="flex items-center gap-3 hover:underline underline-offset-4">
          <Avatar className="h-9 w-9 shrink-0 rounded-md">
            <AvatarImage src={row.original.service_image} alt={row.original.name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold rounded-md">
              {row.original.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{row.original.name}</span>
        </Link>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'default' : 'outline'}>
          {row.original.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'provider_companies_count',
      header: 'Providers',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.provider_companies_count ?? '—'}</span>
      ),
    },
  ];

  const getRowActions = (record: any): DataTableAction[] => [
    { label: 'View', onClick: (r) => navigate(`/services/show/${r.id}`) },
    { label: 'Edit', onClick: (r) => navigate(`/services/edit/${r.id}`) },
    {
      label: 'Delete', variant: 'destructive',
      onClick: (r) => {
        if (confirm('Delete this service?')) {
          const toastId = toast.loading('Deleting...');
          deleteOne(
            { resource: 'services', id: r.id },
            {
              onSuccess: () => toast.success('Deleted successfully', { id: toastId }),
              onError: (error) => toast.error(error?.message || 'Failed to delete', { id: toastId }),
            }
          );
        }
      },
    },
  ];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">Unable to load Services</p>
        <p className="text-sm text-muted-foreground mt-1">The API endpoint is not available.</p>
      </div>
    );
  }

  return (
    <div>
      <DataTable
        data={data?.data || []}
        columns={columns}
        total={data?.total || 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        search={search}
        searchPlaceholder="Search services..."
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onCreateClick={() => navigate('/services/create')}
        getRowActions={getRowActions}
        exportFilename="services"
      />
    </div>
  );
}
