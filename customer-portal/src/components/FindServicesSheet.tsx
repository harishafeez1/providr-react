import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Search, Loader2, Users, X } from 'lucide-react';
import SafeGooglePlacesAutocomplete, {
  safeGeocodeByPlaceId as geocodeByPlaceId,
  safeGetLatLng as getLatLng,
  safeGeocodeByLatLng as geocodeByLatLng,
} from '@/components/SafeGooglePlacesAutocomplete';
import { useAppSelector } from '@/redux/hooks';
import { store } from '@/redux/store';
import {
  setLocation,
  setCurrentLocation,
  setSearchServiceId,
} from '@/redux/slices/directory-slice';
import {
  setAllProviders,
  setIsSearchedFromHeader,
  setChangeSearchedServiceName,
  setLoading,
  setPagination,
} from '@/redux/slices/directory-listing-slice';
import { getAllServicesToTransform } from '@/services/api/all-services';
import { searchNearByProviders } from '@/services/api/search-providers';
import { getProviderCount } from '@/services/api/directory';

interface FindServicesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FindServicesSheet({ open, onOpenChange }: FindServicesSheetProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { transformedServicesList } = useAppSelector((state) => state.services);
  const isSearchLoading = useAppSelector((state) => state.directoryListing.pagination.loading);

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    label: string;
    suburb?: string;
    state?: string;
    country?: string;
    zip_code?: string;
  } | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<{ label: string; value: string } | null>(null);
  const [providerCount, setProviderCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  // Load services list on mount
  useEffect(() => {
    if (open && transformedServicesList.length === 0) {
      getAllServicesToTransform('page=1&per_page=100');
    }
  }, [open, transformedServicesList.length]);

  // Fetch provider count when service or location changes
  const fetchCount = useCallback(async () => {
    if (!selectedServiceId) {
      setProviderCount(null);
      return;
    }
    setCountLoading(true);
    try {
      const count = locationData
        ? await getProviderCount(Number(selectedServiceId), locationData.latitude, locationData.longitude)
        : await getProviderCount(Number(selectedServiceId));
      setProviderCount(count);
    } catch {
      setProviderCount(0);
    } finally {
      setCountLoading(false);
    }
  }, [selectedServiceId, locationData]);

  useEffect(() => {
    if (open) fetchCount();
  }, [open, fetchCount]);

  const handleLocationChange = async (address: any) => {
    if (!address) {
      setLocationData(null);
      setDefaultAddress(null);
      store.dispatch(setLocation(''));
      store.dispatch(setCurrentLocation(null));
      return;
    }

    const placeResults = await geocodeByPlaceId(address.value.place_id);
    const latLng = await getLatLng(placeResults[0]);

    const components = placeResults[0].address_components;
    const find = (type: string) =>
      components.find((c: any) => c.types.includes(type))?.long_name;

    const reverseResults = await geocodeByLatLng(latLng);
    const reverseComponents = reverseResults[0]?.address_components || [];
    const postalCode = reverseComponents.find((c: any) => c.types.includes('postal_code'))?.long_name;

    const suburb = find('locality') || find('sublocality') || '';

    setLocationData({
      latitude: latLng.lat,
      longitude: latLng.lng,
      label: address.label,
      suburb,
      state: find('administrative_area_level_1'),
      country: find('country'),
      zip_code: postalCode,
    });
    setDefaultAddress({ label: address.label, value: address.label });
    store.dispatch(setLocation(suburb));
    store.dispatch(setCurrentLocation({ latitude: latLng.lat, longitude: latLng.lng }));
  };

  const handleSearch = async () => {
    if (!selectedServiceId && !locationData) return;

    if (!location.pathname.includes('directory')) {
      navigate('/directory');
    }

    const data: any = {};
    if (locationData) {
      data.latitude = locationData.latitude;
      data.longitude = locationData.longitude;
    }
    if (selectedServiceId) {
      data.service_id = selectedServiceId;
    }

    try {
      store.dispatch(setLoading(true));
      const response = await searchNearByProviders(data);
      store.dispatch(setSearchServiceId(selectedServiceId || ''));

      if (response?.data?.length > 0) {
        store.dispatch(setAllProviders(response.data));
        store.dispatch(setIsSearchedFromHeader(true));
        const serviceName = response.data[0]?.service?.name || '';
        store.dispatch(setChangeSearchedServiceName(selectedServiceId ? serviceName : ''));
        if (response.current_page && response.last_page) {
          store.dispatch(setPagination({ currentPage: response.current_page, lastPage: response.last_page }));
        }
      } else {
        store.dispatch(setAllProviders([]));
        store.dispatch(setIsSearchedFromHeader(true));
        const selected = transformedServicesList.find((s) => s.value === selectedServiceId);
        store.dispatch(setChangeSearchedServiceName(selected?.label || ''));
      }
    } catch {
      store.dispatch(setAllProviders([]));
      store.dispatch(setIsSearchedFromHeader(true));
    } finally {
      store.dispatch(setLoading(false));
    }

    onOpenChange(false);
  };

  const handleClear = () => {
    setSelectedServiceId('');
    setLocationData(null);
    setDefaultAddress(null);
    setProviderCount(null);
    store.dispatch(setLocation(''));
    store.dispatch(setCurrentLocation(null));
  };

  const isSearchEnabled = (!!selectedServiceId || !!locationData) && !isSearchLoading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[400px] flex flex-col" close={true}>
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Find Services</SheetTitle>
          <SheetDescription>Search for NDIS service providers near you</SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-6 pt-6">
          {/* Location */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-primary" />
              Location
            </label>
            <div className="[&_.css-13cymwt-control]:border-input [&_.css-13cymwt-control]:rounded-md [&_.css-13cymwt-control]:shadow-sm [&_.css-t3ipsp-control]:border-primary [&_.css-t3ipsp-control]:shadow-none">
              <SafeGooglePlacesAutocomplete
                key={defaultAddress?.label || 'sheet-location'}
                apiKey={import.meta.env.VITE_APP_GOOGLE_API_KEY}
                autocompletionRequest={{
                  componentRestrictions: { country: 'au' },
                  types: ['(regions)'],
                }}
                apiOptions={{ region: 'AU' }}
                selectProps={{
                  defaultValue: defaultAddress,
                  placeholder: 'Search suburb or postcode...',
                  styles: {
                    control: (provided: any, state: any) => ({
                      ...provided,
                      borderColor: state.isFocused ? '#752C84' : '#e5e7eb',
                      boxShadow: state.isFocused ? '0 0 0 1px #752C84' : 'none',
                      borderRadius: '0.375rem',
                      '&:hover': { borderColor: '#752C84' },
                    }),
                    option: (provided: any, state: any) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#752C84' : state.isFocused ? '#faf5ff' : 'transparent',
                      color: state.isSelected ? '#fff' : state.isFocused ? '#752C84' : '#111827',
                      '&:hover': {
                        backgroundColor: state.isSelected ? '#752C84' : '#faf5ff',
                        color: state.isSelected ? '#fff' : '#752C84',
                      },
                    }),
                  },
                  onChange: handleLocationChange,
                  isClearable: true,
                }}
              />
            </div>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <Search className="h-4 w-4 text-primary" />
              Type of Service
            </label>
            <Select
              value={selectedServiceId}
              onValueChange={(val) => setSelectedServiceId(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service..." />
              </SelectTrigger>
              <SelectContent>
                {transformedServicesList.map((service: any) => (
                  <SelectItem key={service.value} value={String(service.value)}>
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedServiceId && (
              <button
                onClick={() => setSelectedServiceId('')}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear service
              </button>
            )}
          </div>

          {/* Provider Count Badge */}
          {selectedServiceId && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {countLoading ? (
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking...
                </Badge>
              ) : providerCount !== null ? (
                <Badge variant={providerCount > 0 ? 'default' : 'destructive'} className="gap-1">
                  {providerCount} provider{providerCount !== 1 ? 's' : ''} available
                </Badge>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={handleClear}>
            Clear
          </Button>
          <Button
            className="flex-1"
            onClick={handleSearch}
            disabled={!isSearchEnabled}
          >
            {isSearchLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
