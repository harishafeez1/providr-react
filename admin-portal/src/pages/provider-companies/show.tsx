import { useOne } from '@refinedev/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Pencil, Building2, Users, Star,
  Globe, Mail, Phone, Shield, MapPin, ExternalLink, Layers,
  Clock,
} from 'lucide-react';
import api from '@/services/api';

export function ProviderCompanyShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useOne({
    resource: 'provider-companies',
    id: id!,
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const company = data?.data as any;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Loading provider company...</p>
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/provider-companies')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Provider Companies
        </Button>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Failed to load provider company #{id}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const users = company.users || [];
  const premises = company.premises || [];
  const serviceOfferings = company.service_offerings || [];
  const reviews = company.reviews || [];
  const reviewStats = company.review_stats || { total_reviews: 0, average_rating: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <CompanyHeader company={company} reviewStats={reviewStats} onRefetch={refetch} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Team Members"
          value={company.users_count ?? users.length}
          subtitle={`${users.filter((u: any) => u.active).length} active`}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Service Offerings"
          value={company.service_offerings_count ?? serviceOfferings.length}
          subtitle={`${serviceOfferings.filter((so: any) => so.active).length} active`}
          icon={<Layers className="h-4 w-4" />}
        />
        <StatCard
          title="Reviews"
          value={company.reviews_count ?? reviews.length}
          subtitle={reviewStats.average_rating ? `${Number(reviewStats.average_rating).toFixed(1)} avg rating` : 'No ratings yet'}
          icon={<Star className="h-4 w-4" />}
        />
        <StatCard
          title="Premises"
          value={premises.length}
          subtitle={premises.length === 1 ? '1 location' : `${premises.length} locations`}
          icon={<MapPin className="h-4 w-4" />}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team & Logins</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="premises">Premises</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab company={company} />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab users={users} />
        </TabsContent>

        <TabsContent value="services">
          <ServicesTab serviceOfferings={serviceOfferings} />
        </TabsContent>

        <TabsContent value="premises">
          <PremisesTab premises={premises} />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsTab reviews={reviews} reviewStats={reviewStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ──────────── Header ──────────── */

function CompanyHeader({ company, reviewStats, onRefetch }: { company: any; reviewStats: any; onRefetch: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="mt-1 shrink-0" onClick={() => navigate('/provider-companies')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-16 w-16 rounded-lg shrink-0">
          <AvatarImage src={company.business_logo} alt={company.name} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold rounded-lg">
            {company.name?.substring(0, 2).toUpperCase() || '??'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{company.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
            {company.abn && <span className="font-mono">ABN {company.abn}</span>}
            {company.abn && <span>·</span>}
            {company.organisation_type && <span>{company.organisation_type}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {company.registered_for_ndis ? (
              <Badge variant="default"><Shield className="h-3 w-3 mr-1" />NDIS Registered</Badge>
            ) : (
              <Badge variant="outline">Not NDIS Registered</Badge>
            )}
            {company.registered_for_ndis_early_childhood && (
              <Badge variant="secondary">Early Childhood</Badge>
            )}
            {company.is_claimed ? (
              <Badge variant="secondary">Claimed</Badge>
            ) : (
              <Badge variant="outline">Unclaimed</Badge>
            )}
            {reviewStats.average_rating > 0 && (
              <Badge variant="outline">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {Number(reviewStats.average_rating).toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <EditDialog company={company} onRefetch={onRefetch} />
    </div>
  );
}

/* ──────────── Edit Dialog ──────────── */

function EditDialog({ company, onRefetch }: { company: any; onRefetch: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', abn: '', company_email: '', company_phone: '', company_website: '',
    description: '', organisation_type: '',
    registered_for_ndis: false, registered_for_ndis_early_childhood: false,
  });

  const openDialog = () => {
    setForm({
      name: company.name || '',
      abn: company.abn || '',
      company_email: company.company_email || '',
      company_phone: company.company_phone || '',
      company_website: company.company_website || '',
      description: company.description || '',
      organisation_type: company.organisation_type || '',
      registered_for_ndis: !!company.registered_for_ndis,
      registered_for_ndis_early_childhood: !!company.registered_for_ndis_early_childhood,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/provider-companies/${company.id}`, form);
      setOpen(false);
      onRefetch();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button onClick={openDialog}>
        <Pencil className="h-4 w-4 mr-2" /> Edit
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit — {company.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Company Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>ABN</Label>
              <Input value={form.abn} onChange={(e) => setForm({ ...form, abn: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Organisation Type</Label>
              <Input value={form.organisation_type} onChange={(e) => setForm({ ...form, organisation_type: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={form.company_email} onChange={(e) => setForm({ ...form, company_email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={form.company_phone} onChange={(e) => setForm({ ...form, company_phone: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Website</Label>
              <Input value={form.company_website} onChange={(e) => setForm({ ...form, company_website: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label>NDIS Registered</Label>
            <Switch checked={form.registered_for_ndis} onCheckedChange={(v) => setForm({ ...form, registered_for_ndis: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>NDIS Early Childhood</Label>
            <Switch checked={form.registered_for_ndis_early_childhood} onCheckedChange={(v) => setForm({ ...form, registered_for_ndis_early_childhood: v })} />
          </div>
          <Separator />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
}

/* ──────────── Stat Card ──────────── */

function StatCard({ title, value, subtitle, icon }: { title: string; value: number; subtitle: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ──────────── Overview Tab ──────────── */

function OverviewTab({ company }: { company: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Company Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <DetailRow icon={<Building2 className="h-4 w-4" />} label="ABN" value={company.abn} />
          <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={company.company_email} />
          <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={company.company_phone} />
          <DetailRow icon={<Globe className="h-4 w-4" />} label="Website" value={company.company_website} isLink />
          <DetailRow icon={<Building2 className="h-4 w-4" />} label="Type" value={company.organisation_type} />
          <DetailRow icon={<Shield className="h-4 w-4" />} label="NDIS Registered" value={company.registered_for_ndis ? 'Yes' : 'No'} />
          <DetailRow icon={<Shield className="h-4 w-4" />} label="NDIS Early Childhood" value={company.registered_for_ndis_early_childhood ? 'Yes' : 'No'} />
          <DetailRow icon={<Clock className="h-4 w-4" />} label="Created" value={company.created_at ? new Date(company.created_at).toLocaleDateString() : null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {company.description || 'No description provided.'}
          </p>

          {(company.facebook_url || company.linkedin_url || company.instagram_url || company.twitter_url) && (
            <>
              <Separator className="my-4" />
              <p className="text-sm font-medium mb-2">Social Links</p>
              <div className="flex flex-wrap gap-2">
                {company.facebook_url && <SocialBadge label="Facebook" url={company.facebook_url} />}
                {company.linkedin_url && <SocialBadge label="LinkedIn" url={company.linkedin_url} />}
                {company.instagram_url && <SocialBadge label="Instagram" url={company.instagram_url} />}
                {company.twitter_url && <SocialBadge label="Twitter" url={company.twitter_url} />}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ icon, label, value, isLink }: { icon: React.ReactNode; label: string; value?: string | null; isLink?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      {isLink && value ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
          {value} <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-sm font-medium">{value || '—'}</span>
      )}
    </div>
  );
}

function SocialBadge({ label, url }: { label: string; url: string }) {
  return (
    <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer">
      <Badge variant="outline" className="cursor-pointer hover:bg-accent">
        {label} <ExternalLink className="h-3 w-3 ml-1" />
      </Badge>
    </a>
  );
}

/* ──────────── Team Tab ──────────── */

function TeamTab({ users }: { users: any[] }) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No team members found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Team Members ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {(u.first_name?.[0] || '') + (u.last_name?.[0] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{u.first_name} {u.last_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  {u.admin ? <Badge>Admin</Badge> : <Badge variant="outline">User</Badge>}
                </TableCell>
                <TableCell>
                  <Badge variant={u.active ? 'default' : 'outline'}>
                    {u.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ──────────── Services Tab ──────────── */

function ServicesTab({ serviceOfferings }: { serviceOfferings: any[] }) {
  if (serviceOfferings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Layers className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No service offerings found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Service Offerings ({serviceOfferings.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceOfferings.map((so: any) => (
              <TableRow key={so.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 rounded-md">
                      <AvatarImage src={so.service?.service_image} className="object-cover" />
                      <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs">
                        {so.service?.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{so.service?.name || `Service #${so.service_id}`}</p>
                      {so.title && <p className="text-xs text-muted-foreground">{so.title}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {so.description || '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={so.active ? 'default' : 'outline'}>
                    {so.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ──────────── Premises Tab ──────────── */

function PremisesTab({ premises }: { premises: any[] }) {
  if (premises.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No premises found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Premises ({premises.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {premises.map((p: any) => (
            <div key={p.id} className="rounded-lg border p-4 space-y-1">
              <p className="font-medium text-sm">{p.name || 'Unnamed Premise'}</p>
              <p className="text-sm text-muted-foreground">
                {[p.address_line_1, p.suburb, p.state, p.post_code].filter(Boolean).join(', ') || 'No address'}
              </p>
              {p.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {p.phone}</p>}
              {p.email && <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {p.email}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ──────────── Reviews Tab ──────────── */

function ReviewsTab({ reviews, reviewStats }: { reviews: any[]; reviewStats: any }) {
  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold">{reviewStats.average_rating ? Number(reviewStats.average_rating).toFixed(1) : '—'}</p>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s <= Math.round(reviewStats.average_rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{reviewStats.total_reviews || 0} reviews</p>
            </div>
            <Separator orientation="vertical" className="h-16" />
            <div className="space-y-1 flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r: any) => Math.round(r.rating) === rating).length;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-right">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No reviews yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((r: any) => (
              <div key={r.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(r.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{r.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                {r.customer && (
                  <p className="text-xs text-muted-foreground">
                    — {r.customer.first_name} {r.customer.last_name}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
