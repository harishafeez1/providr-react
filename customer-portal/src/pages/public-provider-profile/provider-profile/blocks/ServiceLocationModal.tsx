import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalTitle } from '@/components/modal';
import ServiceLocationMap from './ServiceLocationMap';
import { KeenIcon } from '@/components/keenicons';

interface ServiceLocation {
  lat: number;
  lng: number;
  radius_km: number;
}

interface ServiceLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses_collection: ServiceLocation[];
  providerName?: string;
}

const ServiceLocationModal: React.FC<ServiceLocationModalProps> = ({
  isOpen,
  onClose,
  addresses_collection,
  providerName = 'Provider'
}) => {
  // Get Mapbox access token from environment variables
  const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <ModalHeader className="flex items-center justify-between p-6 border-b">
          <ModalTitle className="text-xl font-semibold">
            {providerName} Service Locations
          </ModalTitle>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <KeenIcon icon="cross" className="text-gray-500 p-2" />
          </button>
        </ModalHeader>

        <ModalBody className="p-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>
                This map shows all service locations for {providerName}. Each marker represents a
                service location with its coverage area shown as a circle around it.
              </p>
              {addresses_collection.length === 0 && (
                <p className="text-amber-600 mt-2">
                  No service locations are currently available for this provider.
                </p>
              )}
            </div>

            <ServiceLocationMap
              addresses_collection={addresses_collection.map((location) => ({
                lat: location.lat,
                lng: location.lng,
                radius: location.radius_km
              }))}
              accessToken={MAPBOX_ACCESS_TOKEN}
            />
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ServiceLocationModal;