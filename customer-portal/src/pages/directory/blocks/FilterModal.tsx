import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import GooglePlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from 'react-google-places-autocomplete';

import ReactSelect from 'react-select';
import { useAppSelector } from '@/redux/hooks';
import { useEffect, useState } from 'react';
import { getAllServices } from '@/services/api/all-services';
import { store } from '@/redux/store';
import {
  setAgeGroup,
  setLocation,
  setNdisChildhoodRegistered,
  setNdisRegistered,
  setResetFilters,
  setServiceId
} from '@/redux/slices/directory-slice';
import { postDirectoryFilters } from '@/services/api/directory';
import {
  appendProviders,
  setAllProviders,
  setLoading,
  setPagination,
  setIsFilterModalOpen
} from '@/redux/slices/directory-listing-slice';
import { Button } from '@/components/ui/button';

interface IModalDeleteConfirmationProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
}

const FilterModal = ({ open, onClose }: IModalDeleteConfirmationProps) => {
  const [localServiceId, setLocalServiceId] = useState('');
  const { services } = useAppSelector((state) => state.services);
  const { ndis_register, age_group } = useAppSelector((state) => state.directory);
  const {
    pagination: { loading }
  } = useAppSelector((state) => state.directoryListing);

  const allFilters = useAppSelector((state) => state.directory);

  useEffect(() => {
    getAllServices();
  }, []);

  const handleLocationChange = async (address: any) => {
    store.dispatch(setLocation(address.label));
  };

  const handleFilters = async () => {
    store.dispatch(setIsFilterModalOpen(true));
    store.dispatch(setServiceId(localServiceId));
    store.dispatch(setLoading(true));

    const res = await postDirectoryFilters(allFilters);
    if (res) {
      if (res.directories.current_page === 1) {
        store.dispatch(setAllProviders(res.directories.data));
      } else {
        store.dispatch(appendProviders(res.directories.data));
      }

      store.dispatch(
        setPagination({
          currentPage: res.directories.current_page,
          lastPage: res.directories.last_page
        })
      );

      store.dispatch(setIsFilterModalOpen(false));
      store.dispatch(setLoading(false));
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-xl">
          <DialogHeader className="justify-between border-0 pt-5">
            <DialogTitle>Filters</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col max-h-[450px] xl:max-h-[650px]  items-center scrollable-y-auto">
            <div className="grid gap-2">
              <div className="grid gap-5">
                <h3 className="text-lg font-semibold ">Location</h3>
                <div className="flex items-baseline flex-wrap  gap-2.5 mb-4">
                  <div className="w-full text-sm">
                    <GooglePlacesAutocomplete
                      apiKey={import.meta.env.VITE_APP_GOOGLE_API_KEY}
                      onLoadFailed={(err) => {
                        console.error('Could not load google places autocomplete', err);
                      }}
                      autocompletionRequest={{
                        componentRestrictions: {
                          country: 'aus'
                        }
                      }}
                      selectProps={{
                        isClearable: true,
                        placeholder: 'Search for a place',
                        onChange: handleLocationChange
                      }}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold">Service</h3>
                <div className="flex items-baseline flex-wrap  gap-2.5 mb-4">
                  <ReactSelect
                    options={services}
                    onChange={(item: any) => setLocalServiceId(item.value)}
                    className="w-full text-sm"
                  />
                </div>

                <h3 className="text-lg font-semibold">NDIS Register</h3>
                <div className="flex items-baseline flex-wrap  gap-2.5 mb-4 cursor-pointer">
                  <div className="input flex">
                    <label className="flex checkbox checkbox-sm gap-1">
                      <input
                        type="checkbox"
                        checked={ndis_register.ndis_registered === 1}
                        onChange={(e) => {
                          store.dispatch(setNdisRegistered(e.target.checked ? 1 : 0));
                        }}
                      />
                      <span className="switch-label">NDIS Registered</span>
                    </label>
                  </div>
                  <div className="input flex cursor-pointer">
                    <label className="flex checkbox checkbox-sm gap-1">
                      <input
                        type="checkbox"
                        checked={ndis_register.ndis_childhood_registered === 1}
                        name="ndis_childhood_registerd"
                        readOnly
                        onChange={(e) => {
                          store.dispatch(setNdisChildhoodRegistered(e.target.checked ? 1 : 0));
                        }}
                      />
                      <span className="switch-label">NDIS Early Childhood Registered</span>
                    </label>
                  </div>
                </div>

                <h3 className="text-lg font-semibold">Age Group</h3>
                <div className="flex items-baseline flex-wrap gap-2.5 mb-4 cursor-pointer">
                  {[
                    { name: 'Early Childhood (0-7 years)' },
                    { name: 'Children (8-16 years)' },
                    { name: 'Young people (17-21 years)' },
                    { name: 'Adults (22-59 years)' },
                    { name: 'Mature Age (60+ years)' }
                  ].map((option) => (
                    <div className="input flex" key={option.name}>
                      <label className="flex radio radio-sm gap-1">
                        <input
                          type="radio"
                          name="age_group"
                          value={option.name}
                          checked={age_group === option.name}
                          onChange={(e) => store.dispatch(setAgeGroup(e.target.value))}
                        />
                        <span className="switch-label">{option.name}</span>
                      </label>
                    </div>
                  ))}
                </div>

                {/* <h3 className="text-lg font-semibold">Service type</h3>
                  <div className="flex items-baseline flex-wrap  gap-2.5 mb-4">
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input className="" name="access_methode" type="radio" value="1" readOnly />
                        <span className="switch-label">Group</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input className="" name="access_methode" type="radio" value="2" readOnly />
                        <span className="switch-label">Online Service</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input className="" name="access_methode" type="radio" value="3" readOnly />
                        <span className="switch-label">Telehealth</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input className="" name="access_methode" type="radio" value="4" readOnly />
                        <span className="switch-label">We come to you</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex radio radio-sm gap-1">
                        <input className="" name="access_methode" type="radio" value="5" readOnly />
                        <span className="switch-label">You come to us</span>
                      </label>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">Insurance Type</h3>
                  <div className="flex items-baseline flex-wrap  gap-2.5 mb-4">
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check2" readOnly />
                        <span className="switch-label">Aboriginal and Torres Strait Islander</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check" readOnly />
                        <span className="switch-label">Acquired Brain Injury</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check2" readOnly />
                        <span className="switch-label">Autism</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check" readOnly />
                        <span className="switch-label">CALD</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check2" readOnly />
                        <span className="switch-label">Intellectual Disability</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check" readOnly />
                        <span className="switch-label">LGBTIQ+</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check2" readOnly />
                        <span className="switch-label">Psychosocial Disability</span>
                      </label>
                    </div>
                    <div className="input flex">
                      <label className="flex checkbox checkbox-sm gap-1">
                        <input type="checkbox" value="1" name="check" readOnly />
                        <span className="switch-label">Sensory Impairment</span>
                      </label>
                    </div>

                    {formik.touched.phone && formik.errors.phone && (
                      <span role="alert" className="text-danger text-xs">
                        {formik.errors.phone}
                      </span>
                    )}
                  </div> */}
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="justify-end gap-4">
            <Button
              onClick={() => {
                // store.dispatch(setResetFilters());
                // postDirectoryFilters(allFilters);
              }}
            >
              Clear Filters
            </Button>

            <button className="btn btn-primary" onClick={handleFilters} disabled={loading}>
              {loading ? 'Please wait...' : 'Apply'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { FilterModal };
