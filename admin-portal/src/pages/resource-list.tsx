import { useList, useDelete } from '@refinedev/core';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable, type DataTableAction } from '@/components/data-table/data-table';

interface Column {
  key: string;
  label: string;
  render?: (value: any, record: any) => React.ReactNode;
}

interface ResourceListProps {
  resource: string;
  title: string;
  columns: Column[];
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  basePath: string;
}

export function ResourceList({ resource, title, columns, canCreate = true, canEdit = true, canDelete = true, basePath }: ResourceListProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const { mutate: deleteOne } = useDelete();

  const { data, isLoading, isError } = useList({
    resource,
    pagination: { current: page, pageSize },
    filters: search ? [{ field: 'search', operator: 'eq', value: search }] : [],
    sorters: [{ field: 'id', order: 'desc' }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  // Convert simple column definitions to TanStack ColumnDefs
  const tableColumns: ColumnDef<any, any>[] = [
    { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    ...columns.map((col, i) => ({
      accessorKey: col.key,
      header: col.label,
      cell: ({ row }: any) => {
        const content = col.render ? col.render(row.original[col.key], row.original) : (row.original[col.key] ?? '—');
        if (i === 0) {
          return (
            <Link to={`${basePath}/show/${row.original.id}`} className="font-medium text-foreground underline-offset-4 hover:underline">
              {content}
            </Link>
          );
        }
        return content;
      },
    })),
  ];

  const getRowActions = (record: any): DataTableAction[] => {
    const actions: DataTableAction[] = [
      { label: 'View', onClick: (r) => navigate(`${basePath}/show/${r.id}`) },
    ];
    if (canEdit) actions.push({ label: 'Edit', onClick: (r) => navigate(`${basePath}/edit/${r.id}`) });
    if (canDelete) actions.push({
      label: 'Delete', variant: 'destructive',
      onClick: (r) => { if (confirm('Delete this record?')) deleteOne({ resource, id: r.id }); },
    });
    return actions;
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">Unable to load {title}</p>
        <p className="text-sm text-muted-foreground mt-1">The API endpoint for this resource is not available yet.</p>
      </div>
    );
  }

  return (
    <div>
      <DataTable
        data={data?.data || []}
        columns={tableColumns}
        total={data?.total || 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        search={search}
        searchPlaceholder={`Search ${title.toLowerCase()}...`}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onCreateClick={canCreate ? () => navigate(`${basePath}/create`) : undefined}
        getRowActions={getRowActions}
        exportFilename={resource}
      />
    </div>
  );
}
