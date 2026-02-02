import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Columns3, Download, MoreVertical, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export interface DataTableAction {
  label: string;
  onClick: (record: any) => void;
  variant?: 'default' | 'destructive';
}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  total: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
  search?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onCreateClick?: () => void;
  createLabel?: string;
  getRowActions?: (record: TData) => DataTableAction[];
  enableSelection?: boolean;
  exportFilename?: string;
}

function exportToCsv<TData>(rows: TData[], columns: ColumnDef<TData, any>[], filename: string) {
  // Get visible data columns (skip select/actions)
  const dataCols = columns.filter((c) => 'accessorKey' in c && c.accessorKey);

  const headers = dataCols.map((c) => {
    const header = c.header;
    if (typeof header === 'string') return header;
    return ('accessorKey' in c ? String(c.accessorKey) : c.id) || '';
  });

  const csvRows = [headers.join(',')];

  for (const row of rows) {
    const values = dataCols.map((c) => {
      const key = 'accessorKey' in c ? String(c.accessorKey) : '';
      const val = (row as any)[key];
      if (val == null) return '';
      const str = String(val);
      // Escape CSV values
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function DataTable<TData extends { id: number | string }>({
  data,
  columns,
  total,
  page,
  pageSize,
  isLoading,
  search,
  searchPlaceholder = 'Search...',
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onCreateClick,
  createLabel = 'Create',
  getRowActions,
  enableSelection = true,
  exportFilename = 'export',
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const totalPages = Math.ceil(total / pageSize);

  const allColumns = React.useMemo(() => {
    const cols: ColumnDef<TData, any>[] = [];

    if (enableSelection) {
      cols.push({
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    cols.push(...columns);

    if (getRowActions) {
      cols.push({
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const actions = getRowActions(row.original);
          if (!actions.length) return null;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {actions.map((action, i) => (
                  <React.Fragment key={action.label}>
                    {action.variant === 'destructive' && i > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      variant={action.variant}
                      onClick={() => action.onClick(row.original)}
                      className={action.variant === 'destructive' ? 'text-red-600 focus:text-red-600' : ''}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      });
    }

    return cols;
  }, [columns, enableSelection, getRowActions]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      rowSelection,
      columnVisibility,
    },
    getRowId: (row) => String(row.id),
    enableRowSelection: enableSelection,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const selectedCount = Object.keys(rowSelection).length;

  const handleExport = () => {
    const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
    const rowsToExport = selectedRows.length > 0 ? selectedRows : data;
    exportToCsv(rowsToExport, columns, exportFilename);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {onSearchChange && (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-9 h-9"
                value={search || ''}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          <span className="text-sm text-muted-foreground whitespace-nowrap">{total} total</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden lg:inline">{selectedCount > 0 ? `Export ${selectedCount}` : 'Export'}</span>
            <span className="lg:hidden">CSV</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 className="h-4 w-4 mr-1" />
                <span className="hidden lg:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table.getAllColumns()
                .filter((col) => typeof col.accessorFn !== 'undefined' && col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {onCreateClick && (
            <Button size="sm" onClick={onCreateClick}>
              <Plus className="h-4 w-4 mr-1" />
              {createLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="h-24 text-center text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {selectedCount} of {data.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            {onPageSizeChange && (
              <div className="hidden items-center gap-2 lg:flex">
                <Label className="text-sm font-medium">Rows per page</Label>
                <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
                  <SelectTrigger size="sm" className="w-20">
                    <SelectValue placeholder={String(pageSize)} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 15, 20, 30, 50].map((size) => (
                      <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {page} of {totalPages}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => onPageChange(1)} disabled={page <= 1}>
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}>
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
