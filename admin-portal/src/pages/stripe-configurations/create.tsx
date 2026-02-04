import { useCreate } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function StripeConfigurationCreate() {
  const navigate = useNavigate();
  const { mutate: create, isLoading } = useCreate();
  const [form, setForm] = useState({
    environment: 'production',
    publishable_key: '',
    secret_key: '',
    active: true,
    trial_enabled: false,
    trial_period_days: 30,
    trial_require_payment_method: true,
    trial_description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      { resource: 'stripe-configurations', values: form },
      { onSuccess: () => navigate('/stripe-configurations') }
    );
  };

  const set = (field: string, value: any) => setForm({ ...form, [field]: value });

  return (
    <div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create Stripe Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Environment *</label>
              <Select value={form.environment} onValueChange={(v) => set('environment', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Publishable Key *</label>
              <Input
                type="text"
                value={form.publishable_key}
                onChange={(e) => set('publishable_key', e.target.value)}
                placeholder="pk_..."
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Secret Key *</label>
              <Input
                type="password"
                value={form.secret_key}
                onChange={(e) => set('secret_key', e.target.value)}
                placeholder="sk_..."
                required
                className="mt-1"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => set('active', e.target.checked)}
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.trial_enabled}
                  onChange={(e) => set('trial_enabled', e.target.checked)}
                />
                Enable Trial
              </label>
            </div>

            {form.trial_enabled && (
              <>
                <div>
                  <label className="text-sm font-medium">Trial Period (Days)</label>
                  <Input
                    type="number"
                    value={form.trial_period_days}
                    onChange={(e) => set('trial_period_days', parseInt(e.target.value) || 0)}
                    min={1}
                    max={365}
                    className="mt-1"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.trial_require_payment_method}
                    onChange={(e) => set('trial_require_payment_method', e.target.checked)}
                  />
                  Require Payment Method During Trial
                </label>
                <div>
                  <label className="text-sm font-medium">Trial Description</label>
                  <textarea
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 min-h-[80px]"
                    value={form.trial_description}
                    onChange={(e) => set('trial_description', e.target.value)}
                    placeholder="e.g., 30-day free trial, no credit card required"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Configuration'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/stripe-configurations')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}