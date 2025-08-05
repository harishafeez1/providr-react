import React from 'react';

interface NoServicesFoundProps {
  searchLocation?: string;
  serviceType?: string;
}

const NoServicesFound: React.FC<NoServicesFoundProps> = ({ searchLocation, serviceType }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-[400px] bg-gray-50 rounded-lg p-8 my-8">
      <div className="md:w-1/2 flex justify-center mb-6 md:mb-0">
        <img
          src={`${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`}
          alt="No services found"
          className="max-w-xs md:max-w-sm h-auto"
        />
      </div>
      
      <div className="md:w-1/2 md:pl-8 text-center md:text-left">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            No Services Available
          </h3>
          <div className="text-gray-600 space-y-3">
            <p>
              We were unable to locate any providers matching your search criteria in this area.
            </p>
            {searchLocation && (
              <p className="text-sm">
                <span className="font-medium">Location:</span> {searchLocation}
              </p>
            )}
            {serviceType && serviceType !== 'services' && (
              <p className="text-sm">
                <span className="font-medium">Service Type:</span> {serviceType}
              </p>
            )}
            <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Our network is constantly growing. 
                Please try expanding your search area or check back soon as new providers 
                join our platform regularly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoServicesFound;