import { useCreate } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export function ProviderCompanyCreate() {
  const navigate = useNavigate();
  const { mutate: create, isLoading } = useCreate();
  const [form, setForm] = useState({
    name: '', abn: '', company_email: '', company_phone: '', company_website: '',
    description: '', organisation_type: '', registered_for_ndis: false,
    registered_for_ndis_early_childhood: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      { resource: 'provider-companies', values: form },
      { onSuccess: () => navigate('/provider-companies') }
    );
  };

  const set = (field: string, value: any) => setForm({ ...form, [field]: value });

  return (
    <div>
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Company Name *" value={form.name} onChange={(v) => set('name', v)} required />
            <Field label="ABN" value={form.abn} onChange={(v) => set('abn', v)} />
            <Field label="Email" value={form.company_email} onChange={(v) => set('company_email', v)} type="email" />
            <Field label="Phone" value={form.company_phone} onChange={(v) => set('company_phone', v)} />
            <Field label="Website" value={form.company_website} onChange={(v) => set('company_website', v)} />
            <Field label="Organisation Type" value={form.organisation_type} onChange={(v) => set('organisation_type', v)} />
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 min-h-[100px]"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.registered_for_ndis} onChange={(e) => set('registered_for_ndis', e.target.checked)} />
                NDIS Registered
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.registered_for_ndis_early_childhood} onChange={(e) => set('registered_for_ndis_early_childhood', e.target.checked)} />
                NDIS Early Childhood
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/provider-companies')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="mt-1" />
    </div>
  );
}
