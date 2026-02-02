import { useOne } from '@refinedev/core';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil } from 'lucide-react';

interface ResourceShowProps {
  resource: string;
  title: string;
  basePath: string;
  canEdit?: boolean;
}

export function ResourceShow({ resource, title, basePath, canEdit = true }: ResourceShowProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useOne({
    resource,
    id: id!,
    errorNotification: false,
    queryOptions: { retry: false },
  });
  const record = data?.data as Record<string, any> | undefined;

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError) {
    return (
      <div className="p-4 space-y-4">
        <Button variant="ghost" onClick={() => navigate(basePath)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to {title}
        </Button>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Failed to load {title.toLowerCase()} record #{id}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!record) return <p className="p-4">Not found</p>;

  // Filter out long/complex fields and internal fields
  const fields = Object.entries(record).filter(([key, value]) => {
    if (key === 'id') return false;
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return false;
    return true;
  });

  const relations = Object.entries(record).filter(([key, value]) => {
    return Array.isArray(value) && value.length > 0;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(basePath)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to {title}
        </Button>
        {canEdit && (
          <Button onClick={() => navigate(`${basePath}/edit/${id}`)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{record.name || record.title || `${title} #${id}`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-sm text-muted-foreground">{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
              <span className="text-sm font-medium max-w-[60%] text-right">{value != null ? String(value) : '—'}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {relations.map(([key, items]) => (
        <Card key={key} className="mt-6">
          <CardHeader>
            <CardTitle>{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} ({(items as any[]).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(items as any[]).slice(0, 20).map((item, i) => (
                <div key={item.id || i} className="p-2 rounded bg-muted text-sm">
                  {item.name || item.title || item.email || JSON.stringify(item).slice(0, 120)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
