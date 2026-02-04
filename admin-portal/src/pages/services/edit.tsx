import { useOne } from '@refinedev/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Upload, Trash2, ImageIcon } from 'lucide-react';
import api from '@/services/api';

export function ServiceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError } = useOne({
    resource: 'services',
    id: id!,
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (data?.data) {
      const s = data.data as any;
      setName(s.name || '');
      setActive(!!s.active);
      setPreviewUrl(s.service_image || null);
    }
  }, [data]);

  const service = data?.data as any;

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError) {
    return (
      <div className="p-4 space-y-4">
        <Button variant="ghost" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Services
        </Button>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Failed to load service #{id}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setRemoveImage(false);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setRemoveImage(true);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name', name);
      formData.append('active', active ? '1' : '0');

      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      if (removeImage) {
        formData.append('remove_image', '1');
      }

      await api.post(`/admin/services/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate(`/services/show/${id}`);
    } catch {
      // Error handling could be improved
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(`/services/show/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        {/* Left: Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit Service — {service?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Active</Label>
                  <p className="text-sm text-muted-foreground">
                    When disabled, this service won't appear in the directory
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
              </div>

              <Separator />

              {/* Image Upload */}
              <div className="space-y-4">
                <Label>Service Image</Label>

                <div className="rounded-lg border overflow-hidden">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt={name}
                        className="w-full h-48 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mb-2" />
                      <p className="text-sm">No image uploaded</p>
                      <p className="text-xs">A placeholder image will be used</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {previewUrl ? 'Change Image' : 'Upload Image'}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{service?.provider_companies_count ?? 0}</span> provider companies offer this service
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/services/show/${id}`)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right: Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <div className="h-32 bg-muted">
                {previewUrl ? (
                  <img src={previewUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm">{name || 'Service Name'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {service?.provider_companies_count ?? 0} providers
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              This is how the service appears in the customer directory.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
