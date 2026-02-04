import { useCreate } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AIModelCreate() {
  const navigate = useNavigate();
  const { mutate: create, isLoading } = useCreate();
  const [form, setForm] = useState({
    model_name: '',
    api_key: '',
    is_active: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      { resource: 'ai-models', values: form },
      { onSuccess: () => navigate('/ai-models') }
    );
  };

  const set = (field: string, value: any) => setForm({ ...form, [field]: value });

  return (
    <div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create AI Model</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Model Name *</label>
              <Input
                type="text"
                value={form.model_name}
                onChange={(e) => set('model_name', e.target.value)}
                placeholder="e.g., llama-3.1-70b-versatile"
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The name of the AI model (e.g., llama-3.1-70b-versatile)
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">API Key *</label>
              <Input
                type="password"
                value={form.api_key}
                onChange={(e) => set('api_key', e.target.value)}
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The API key for the AI model
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set('is_active', e.target.checked)}
              />
              Set as Active (Only one model can be active at a time)
            </label>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Model'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/ai-models')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}