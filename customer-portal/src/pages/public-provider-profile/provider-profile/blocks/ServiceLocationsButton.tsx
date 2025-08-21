import React, { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import ServiceLocationModal from './ServiceLocationModal';

interface ServiceLocation {
  lat: number;
  lng: number;
  radius_km: number;
}

interface ServiceLocationsButtonProps {
  addresses_collection: ServiceLocation[];
  providerName?: string;
  buttonText?: string;
  className?: string;
}

const ServiceLocationsButton: React.FC<ServiceLocationsButtonProps> = ({
  addresses_collection,
  providerName,
  buttonText = 'View Service Areas',
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Validate and filter addresses
  const validAddresses = React.useMemo(() => {
    if (!addresses_collection || !Array.isArray(addresses_collection)) {
      return [];
    }
    return addresses_collection.filter(location => 
      location && 
      typeof location === 'object' && 
      !isNaN(Number(location.lat)) && 
      !isNaN(Number(location.lng)) && 
      !isNaN(Number(location.radius_km))
    );
  }, [addresses_collection]);

  if (validAddresses.length === 0) {
    return null; // Don't render if no valid locations
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`
          flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
          text-white rounded-lg transition-colors duration-200 font-medium
          ${className}
        `}
      >
        <MapPin size={18} />
        <span>{buttonText}</span>
        <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
          {String(validAddresses.length || 0)}
        </span>
      </button>

      <ServiceLocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        addresses_collection={validAddresses}
        providerName={providerName}
      />
    </>
  );
};

export default ServiceLocationsButton;