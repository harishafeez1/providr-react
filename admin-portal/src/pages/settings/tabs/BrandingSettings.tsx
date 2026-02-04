import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ImageIcon, Trash2, Upload, Loader2, Eye } from 'lucide-react';
import api from '@/services/api';

export function BrandingSettings() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/settings/branding');
      if (data.provider_login_background) {
        setCurrentImage(data.provider_login_background);
        setPreview(data.provider_login_background);
      }
    } catch {
      // No branding settings yet — that's fine
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleRemoveImage = async () => {
    if (currentImage) {
      try {
        await api.delete('/admin/settings/branding/provider_login_background');
      } catch {
        // ignore
      }
    }
    setFile(null);
    setPreview(null);
    setCurrentImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('settings_files[provider_login_background]', file);

      await api.post('/admin/settings/branding', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFile(null);
      await fetchSettings();
    } catch (err: any) {
      console.error('Failed to save branding settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left side - Controls */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Provider Portal — Login Background Image</CardTitle>
            <CardDescription>
              This image appears on the left side of the provider portal login panel.
              Recommended: high-res image (1920×1080 or larger).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current image preview */}
            <div className="space-y-3">
              <Label>Current Image</Label>
              {preview ? (
                <div className="relative rounded-lg border overflow-hidden">
                  <img
                    src={preview}
                    alt="Login background preview"
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 rounded-lg border-2 border-dashed text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No background image set</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload */}
            <div className="space-y-2">
              <Label>Upload New Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Save */}
            <div className="flex gap-3 pt-2 border-t">
              <Button type="submit" disabled={isSaving || !file}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              {file && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setPreview(currentImage);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Right side - Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Preview
          </CardTitle>
          <CardDescription>
            Preview of the provider portal login panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden shadow-sm">
            <LoginPreview imageUrl={preview} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login Preview — non-interactive mock of the LoginSheet              */
/* ------------------------------------------------------------------ */

function LoginPreview({ imageUrl }: { imageUrl: string | null }) {
  return (
    <div className="flex h-[420px] bg-white">
      {/* Left column - image */}
      <div className="w-1/2 relative bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <ImageIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-xs">No image</p>
            </div>
          </div>
        )}
      </div>

      {/* Right column - mock form */}
      <div className="w-1/2 flex flex-col justify-center px-4 py-6">
        <div className="space-y-3">
          {/* Logo placeholder */}
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-5 w-5 rounded bg-primary" />
            <span className="text-xs font-semibold">Providr</span>
          </div>

          {/* Heading */}
          <div>
            <p className="text-[11px] font-semibold">Login to your account</p>
            <p className="text-[9px] text-muted-foreground">
              Enter your email below to login
            </p>
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <p className="text-[9px] font-medium">Email</p>
            <div className="h-6 rounded border bg-muted/30 px-2 flex items-center">
              <span className="text-[8px] text-muted-foreground">m@example.com</span>
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-[9px] font-medium">Password</p>
              <p className="text-[7px] text-muted-foreground underline">Forgot password?</p>
            </div>
            <div className="h-6 rounded border bg-muted/30 px-2 flex items-center">
              <span className="text-[8px] text-muted-foreground">••••••••</span>
            </div>
          </div>

          {/* Login button */}
          <div className="h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-[9px] font-medium text-primary-foreground">Login</span>
          </div>

          {/* Separator */}
          <div className="relative py-1">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1 text-[7px] text-muted-foreground uppercase">
              Or continue with
            </span>
          </div>

          {/* Google button */}
          <div className="h-6 rounded border flex items-center justify-center gap-1">
            <div className="h-3 w-3 rounded-full bg-muted" />
            <span className="text-[9px]">Login with Google</span>
          </div>

          {/* Sign up link */}
          <p className="text-[8px] text-center text-muted-foreground">
            Don't have an account? <span className="underline">Sign up</span>
          </p>
        </div>
      </div>
    </div>
  );
}
