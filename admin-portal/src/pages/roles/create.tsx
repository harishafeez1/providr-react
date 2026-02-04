import { useCreate, useList } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function RoleCreate() {
  const navigate = useNavigate();
  const { mutate: create, isLoading } = useCreate();

  const { data: permissionsData } = useList({
    resource: 'permissions',
    pagination: { pageSize: 200 },
  });

  const [form, setForm] = useState({
    name: '',
    guard_name: 'admin',
    permissions: [] as number[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      { resource: 'roles', values: form },
      { onSuccess: () => navigate('/roles') }
    );
  };

  const set = (field: string, value: any) => setForm({ ...form, [field]: value });

  const togglePermission = (id: number) => {
    if (form.permissions.includes(id)) {
      set('permissions', form.permissions.filter(p => p !== id));
    } else {
      set('permissions', [...form.permissions, id]);
    }
  };

  const permissions = permissionsData?.data || [];

  return (
    <div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Role Name *</label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g., editor, viewer"
                required
                className="mt-1"
              />
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

            <div>
              <label className="text-sm font-medium">Permissions</label>
              <div className="mt-2 max-h-64 overflow-y-auto border rounded-md p-3 space-y-2">
                {permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No permissions available</p>
                ) : (
                  permissions.map((permission: any) => (
                    <label key={permission.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                      />
                      {permission.name}
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Role'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/roles')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
