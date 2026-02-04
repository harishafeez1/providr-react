import { useCreate, useList } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function StripeProductCreate() {
  const navigate = useNavigate();
  const { mutate: create, isLoading } = useCreate();

  const { data: configurationsData } = useList({
    resource: 'stripe-configurations',
    pagination: { pageSize: 100 },
  });

  const [form, setForm] = useState({
    stripe_configuration_id: '',
    name: '',
    description: '',
    amount: '',
    currency: 'aud',
    interval: 'month',
    interval_count: 1,
    active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      {
        resource: 'stripe-products',
        values: {
          ...form,
          amount: parseFloat(form.amount),
          stripe_configuration_id: parseInt(form.stripe_configuration_id),
        }
      },
      { onSuccess: () => navigate('/stripe-products') }
    );
  };

  const set = (field: string, value: any) => setForm({ ...form, [field]: value });

  const configurations = configurationsData?.data || [];

  return (
    <div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create Stripe Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Stripe Configuration *</label>
              <Select value={form.stripe_configuration_id} onValueChange={(v) => set('stripe_configuration_id', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select configuration..." />
                </SelectTrigger>
                <SelectContent>
                  {configurations.map((config: any) => (
                    <SelectItem key={config.id} value={String(config.id)}>
                      {config.environment} {config.active ? '(Active)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Product Name *</label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 min-h-[80px]"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Amount (AUD) *</label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => set('amount', e.target.value)}
                  step="0.01"
                  min="0.01"
                  placeholder="10.00"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Currency *</label>
                <Select value={form.currency} onValueChange={(v) => set('currency', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aud">AUD</SelectItem>
                    <SelectItem value="usd">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Billing Interval *</label>
                <Select value={form.interval} onValueChange={(v) => set('interval', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Interval Count *</label>
                <Input
                  type="number"
                  value={form.interval_count}
                  onChange={(e) => set('interval_count', parseInt(e.target.value) || 1)}
                  min={1}
                  className="mt-1"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set('active', e.target.checked)}
              />
              Active (Only one product can be active at a time)
            </label>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Product'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/stripe-products')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}