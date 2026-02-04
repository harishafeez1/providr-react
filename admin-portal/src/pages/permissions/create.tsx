import { useCreate } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PermissionCreate() {
  const navigate = useNavigate();
  const { mutate: create, isLoading } = useCreate();
  const [form, setForm] = useState({
    name: '',
    guard_name: 'admin',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      { resource: 'permissions', values: form },
      { onSuccess: () => navigate('/permissions') }
    );
  };

  const set = (field: string, value: any) => setForm({ ...form, [field]: value });

  return (
    <div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create Permission</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Permission Name *</label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g., view users"
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use lowercase with spaces (e.g., "view users", "edit provider companies")
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Guard Name *</label>
              <Select value={form.guard_name} onValueChange={(v) => set('guard_name', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">admin</SelectItem>
                  <SelectItem value="web">web</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Permission'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/permissions')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}