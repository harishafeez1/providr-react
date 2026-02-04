import { useOne, useUpdate } from '@refinedev/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export function ProviderCompanyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate: update, isLoading: saving } = useUpdate();
  const { data, isLoading } = useOne({ resource: 'provider-companies', id: id! });
  const [form, setForm] = useState({
    name: '', abn: '', company_email: '', company_phone: '', company_website: '',
    description: '', organisation_type: '', registered_for_ndis: false,
    registered_for_ndis_early_childhood: false,
  });

  useEffect(() => {
    if (data?.data) {
      const c = data.data as any;
      setForm({
        name: c.name || '', abn: c.abn || '', company_email: c.company_email || '',
        company_phone: c.company_phone || '', company_website: c.company_website || '',
        description: c.description || '', organisation_type: c.organisation_type || '',
        registered_for_ndis: !!c.registered_for_ndis,
        registered_for_ndis_early_childhood: !!c.registered_for_ndis_early_childhood,
      });
    }
  }, [data]);

  if (isLoading) return <p>Loading...</p>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update(
      { resource: 'provider-companies', id: id!, values: form },
      { onSuccess: () => navigate(`/provider-companies/show/${id}`) }
    );
  };

  const set = (field: string, value: any) => setForm({ ...form, [field]: value });

  return (
    <div>
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Company Name *" value={form.name} onChange={(v: string) => set('name', v)} required />
            <Field label="ABN" value={form.abn} onChange={(v: string) => set('abn', v)} />
            <Field label="Email" value={form.company_email} onChange={(v: string) => set('company_email', v)} type="email" />
            <Field label="Phone" value={form.company_phone} onChange={(v: string) => set('company_phone', v)} />
            <Field label="Website" value={form.company_website} onChange={(v: string) => set('company_website', v)} />
            <Field label="Organisation Type" value={form.organisation_type} onChange={(v: string) => set('organisation_type', v)} />
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
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/provider-companies/show/${id}`)}>Cancel</Button>
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
      <Input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} required={required} className="mt-1" />
    </div>
  );
}
