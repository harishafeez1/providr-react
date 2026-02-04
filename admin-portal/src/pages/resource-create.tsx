import { useCreate } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'checkbox' | 'textarea';
  required?: boolean;
  placeholder?: string;
}

interface ResourceCreateProps {
  resource: string;
  title: string;
  basePath: string;
  fields: FieldConfig[];
}

export function ResourceCreate({ resource, title, basePath, fields }: ResourceCreateProps) {
  const navigate = useNavigate();
  const { mutate: create, isLoading } = useCreate();

  // Initialize form with empty values based on field types
  const initialForm = fields.reduce((acc, field) => {
    acc[field.key] = field.type === 'checkbox' ? false : field.type === 'number' ? 0 : '';
    return acc;
  }, {} as Record<string, any>);

  const [form, setForm] = useState(initialForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Creating...');
    create(
      { resource, values: form },
      {
        onSuccess: () => {
          toast.success('Created successfully', { id: toastId });
          navigate(basePath);
        },
        onError: (error) => {
          toast.error(error?.message || 'Failed to create', { id: toastId });
        },
      }
    );
  };

  const updateField = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(basePath)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to {title}
        </Button>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create {title.replace(/s$/, '')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                {field.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form[field.key]}
                      onChange={(e) => updateField(field.key, e.target.checked)}
                    />
                    {field.label}
                  </label>
                ) : (
                  <>
                    <label className="text-sm font-medium">
                      {field.label} {field.required && '*'}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 min-h-[100px]"
                        value={form[field.key]}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    ) : (
                      <Input
                        type={field.type || 'text'}
                        value={form[field.key]}
                        onChange={(e) => updateField(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="mt-1"
                      />
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isLoading ? 'Creating...' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(basePath)} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
