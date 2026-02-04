import { useList, useDelete } from '@refinedev/core';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable, type DataTableAction } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Company = {
  id: number;
  name: string;
  organisation_type: string | null;
  company_email: string | null;
  registered_for_ndis: boolean;
  users_count: number | null;
  service_offerings_count: number | null;
};

const columns: ColumnDef<Company, any>[] = [
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => (
    <Link to={`/provider-companies/show/${row.original.id}`} className="font-medium text-foreground underline-offset-4 hover:underline">
      {row.original.name}
    </Link>
  )},
  {
    accessorKey: 'organisation_type', header: 'Type',
    cell: ({ row }) => <Badge variant="secondary">{row.original.organisation_type || '—'}</Badge>,
  },
  { accessorKey: 'company_email', header: 'Email', cell: ({ row }) => <span className="text-sm">{row.original.company_email || '—'}</span> },
  {
    accessorKey: 'registered_for_ndis', header: 'NDIS',
    cell: ({ row }) => row.original.registered_for_ndis ? <Badge variant="success">Yes</Badge> : <Badge variant="outline">No</Badge>,
  },
  { accessorKey: 'users_count', header: 'Users', cell: ({ row }) => row.original.users_count ?? '—' },
  { accessorKey: 'service_offerings_count', header: 'Offerings', cell: ({ row }) => row.original.service_offerings_count ?? '—' },
];

export function ProviderCompanyList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const { mutate: deleteOne } = useDelete();

  const { data, isLoading } = useList({
    resource: 'provider-companies',
    pagination: { current: page, pageSize },
    filters: search ? [{ field: 'search', operator: 'eq', value: search }] : [],
    sorters: [{ field: 'id', order: 'desc' }],
  });

  const getRowActions = (record: Company): DataTableAction[] => [
    { label: 'View', onClick: (r) => navigate(`/provider-companies/show/${r.id}`) },
    { label: 'Edit', onClick: (r) => navigate(`/provider-companies/edit/${r.id}`) },
    {
      label: 'Delete', variant: 'destructive',
      onClick: (r) => { if (confirm('Delete this company?')) deleteOne({ resource: 'provider-companies', id: r.id }); },
    },
  ];

  return (
    <div>
      <DataTable
        data={(data?.data || []) as Company[]}
        columns={columns}
        total={data?.total || 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        search={search}
        searchPlaceholder="Search companies..."
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onCreateClick={() => navigate('/provider-companies/create')}
        getRowActions={getRowActions}
        exportFilename="provider-companies"
      />
    </div>
  );
}
