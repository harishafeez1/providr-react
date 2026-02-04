import { useOne, useUpdate } from '@refinedev/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface ResourceEditProps {
  resource: string;
  title: string;
  basePath: string;
}

export function ResourceEdit({ resource, title, basePath }: ResourceEditProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate: update, isLoading: saving } = useUpdate();
  const { data, isLoading, isError } = useOne({
    resource,
    id: id!,
    errorNotification: false,
    queryOptions: { retry: false },
  });
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (data?.data) {
      const record = data.data as Record<string, any>;
      // Only include scalar fields in the edit form
      const editable: Record<string, any> = {};
      for (const [key, value] of Object.entries(record)) {
        if (key === 'id' || key === 'created_at' || key === 'updated_at') continue;
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) continue;
        editable[key] = value ?? '';
      }
      setForm(editable);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Saving...');
    update(
      { resource, id: id!, values: form },
      {
        onSuccess: () => {
          toast.success('Saved successfully', { id: toastId });
          navigate(`${basePath}/show/${id}`);
        },
        onError: (error) => {
          toast.error(error?.message || 'Failed to save', { id: toastId });
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(`${basePath}/show/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Edit {title.replace(/s$/, '')} — {(data?.data as any)?.name || (data?.data as any)?.title || `#${id}`}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {Object.entries(form).map(([key, value]) => (
              <div key={key}>
                <label className="text-sm font-medium">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </label>
                {typeof value === 'boolean' ? (
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    />
                  </div>
                ) : String(value).length > 100 ? (
                  <textarea
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 min-h-[100px]"
                    value={String(value)}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                ) : (
                  <Input
                    className="mt-1"
                    value={String(value)}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`${basePath}/show/${id}`)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
